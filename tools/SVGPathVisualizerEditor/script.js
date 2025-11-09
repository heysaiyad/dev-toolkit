const svg = document.getElementById("svg");
const pathInput = document.getElementById("pathInput");
const updateBtn = document.getElementById("updatePath");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const downloadBtn = document.getElementById("downloadSVG");
const toggleGridBtn = document.getElementById("toggleGridBtn");
const strokeColor = document.getElementById("strokeColor");
const fillColor = document.getElementById("fillColor");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const snapToGrid = document.getElementById("snapToGrid");

let anchors = [];
let pathCommands = [];
let selectedAnchor = null;
let dragOffset = {x: 0, y: 0};
let gridEnabled = false;
let svgZoom = 1;
let undoStack = [], redoStack = [];
let currentDragged = null;
let ghostPoint = null;

// Parse path string for M/L commands, Z closes polygon
function parsePathCommands(d) {
    const commands = [];
    const regex = /([MLZmlz])([^MLZmlz]*)/g;
    let match;
    while ((match = regex.exec(d)) !== null) {
        let c = match[1];
        let params = match[2].trim().split(/[\s,]+/).map(Number).filter(val => !isNaN(val));
        commands.push({ cmd: c, params });
    }
    return commands;
}

// Extract anchors from M + L
function getAnchors(commands) {
    let pts = [];
    let x = 0, y = 0;
    for (let cmd of commands) {
        switch (cmd.cmd.toUpperCase()) {
            case 'M':
            case 'L':
                for (let i = 0; i < cmd.params.length; i += 2) {
                    x = (cmd.cmd == cmd.cmd.toLowerCase()) ? x + cmd.params[i] : cmd.params[i];
                    y = (cmd.cmd == cmd.cmd.toLowerCase()) ? y + cmd.params[i+1] : cmd.params[i+1];
                    pts.push({x, y, type: cmd.cmd.toUpperCase()});
                }
                break;
        }
    }
    return pts;
}

// Draw grid
function drawGrid() {
    if (!gridEnabled) return;
    for (let gx = 0; gx <= 600; gx += 25) {
        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", gx);
        line.setAttribute("y1", 0);
        line.setAttribute("x2", gx);
        line.setAttribute("y2", 400);
        line.setAttribute("class", "grid-line");
        svg.appendChild(line);
    }
    for (let gy = 0; gy <= 400; gy += 25) {
        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", 0);
        line.setAttribute("y1", gy);
        line.setAttribute("x2", 600);
        line.setAttribute("y2", gy);
        line.setAttribute("class", "grid-line");
        svg.appendChild(line);
    }
}

// Convert anchors to path string
function anchorsToPath(pts, close) {
    let d = "";
    pts.forEach((pt, i) => {
        d += (i === 0 ? "M" : "L") + pt.x + "," + pt.y + " ";
    });
    if (close) d += "Z";
    return d.trim();
}

function drawSVG() {
    svg.innerHTML = "";
    drawGrid();

    let closePath = pathCommands.some(cmd => cmd.cmd.toUpperCase() === "Z");
    let d = anchorsToPath(anchors, closePath);
    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", fillColor.value);
    path.setAttribute("stroke", strokeColor.value);
    path.setAttribute("stroke-width", 2);
    path.style.cursor = "crosshair";
    svg.appendChild(path);

    // Draw anchors
    anchors.forEach((pt, idx) => {
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pt.x);
        circle.setAttribute("cy", pt.y);
        circle.setAttribute("r", 6);
        circle.setAttribute("class", "anchor" + (selectedAnchor === idx ? " selected" : ""));
        circle.dataset.idx = idx;
        circle.addEventListener("mousedown", anchorMouseDown);
        circle.addEventListener("dblclick", function(e) {
            if (anchors.length > 2) {
                anchors.splice(idx, 1);
                pathCommands = parsePathCommands(anchorsToPath(anchors, closePath));
                selectedAnchor = null;
                pushUndo();
                updateView();
            }
            e.stopPropagation();
        });
        circle.addEventListener("click", function(e) {
            selectedAnchor = idx;
            drawSVG();
            e.stopPropagation();
        });
        svg.appendChild(circle);
    });

    // Draw ghost point for add
    if (ghostPoint) {
        let ghost = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        ghost.setAttribute("cx", ghostPoint.x);
        ghost.setAttribute("cy", ghostPoint.y);
        ghost.setAttribute("r", 6);
        ghost.setAttribute("class", "ghost-anchor");
        svg.appendChild(ghost);
    }

    path.addEventListener("mousemove", function(e){
        let mouseSVG = getMouseSVGCoords(e);
        let insert = getClosestSegment(mouseSVG, anchors);
        ghostPoint = {x: insert.x, y: insert.y};
        drawSVG();
    });
    path.addEventListener("mouseleave", function(e){
        ghostPoint = null;
        drawSVG();
    });
    path.addEventListener("click", function(e){
        let mouseSVG = getMouseSVGCoords(e);
        let insert = getClosestSegment(mouseSVG, anchors, true);
        anchors.splice(insert.i+1, 0, {x: insert.x, y: insert.y, type:"L"});
        pathCommands = parsePathCommands(anchorsToPath(anchors, closePath));
        selectedAnchor = null;
        pushUndo();
        updateView();
        ghostPoint = null;
    });
}

function getMouseSVGCoords(evt) {
    let rect = svg.getBoundingClientRect();
    let x = (evt.clientX - rect.left) * 600 / rect.width;
    let y = (evt.clientY - rect.top) * 400 / rect.height;
    if (snapToGrid.checked) {
        x = Math.round(x/25)*25;
        y = Math.round(y/25)*25;
    }
    return {x, y};
}

// Returns closest point on segment to mouse, plus segment index
function getClosestSegment(mouse, pts, withIndex=false) {
    // If <2 anchors, default to mouse
    if (pts.length < 2) return {x: mouse.x, y: mouse.y, i: 0};
    let minDist = Infinity, best = {x: mouse.x, y: mouse.y, i: 0};
    for (let i=0; i<pts.length-1; ++i) {
        let p1 = pts[i], p2 = pts[i+1];
        let proj = projectToSegment(mouse, p1, p2);
        let dist = distance(mouse, proj);
        if (dist < minDist) {
            minDist = dist;
            best = {x: proj.x, y: proj.y, i: i};
        }
    }
    return withIndex ? best : {x: best.x, y: best.y};
}

function projectToSegment(p, a, b) {
    let dx = b.x - a.x, dy = b.y - a.y;
    let l2 = dx*dx + dy*dy;
    if (l2 === 0) return {x: a.x, y: a.y};
    let t = ((p.x - a.x)*dx + (p.y - a.y)*dy) / l2;
    t = Math.max(0, Math.min(1, t));
    return {x: a.x + t*dx, y: a.y + t*dy};
}

function distance(a, b){
    let dx = a.x-b.x, dy = a.y-b.y;
    return Math.sqrt(dx*dx+dy*dy);
}

function anchorMouseDown(evt) {
    currentDragged = evt.target;
    let idx = Number(currentDragged.dataset.idx);
    dragOffset.x = evt.clientX - anchors[idx].x;
    dragOffset.y = evt.clientY - anchors[idx].y;
    svg.addEventListener("mousemove", anchorMouseMove);
    svg.addEventListener("mouseup", anchorMouseUp);
    pushUndo();
}

function anchorMouseMove(evt) {
    let idx = Number(currentDragged.dataset.idx);
    let x = evt.clientX - dragOffset.x;
    let y = evt.clientY - dragOffset.y;
    if (snapToGrid.checked) {
        x = Math.round(x/25)*25;
        y = Math.round(y/25)*25;
    }
    anchors[idx].x = Math.max(0, Math.min(600, x));
    anchors[idx].y = Math.max(0, Math.min(400, y));
    pathCommands = parsePathCommands(anchorsToPath(anchors, pathCommands.some(cmd=> cmd.cmd.toUpperCase()==="Z")));
    pathInput.value = anchorsToPath(anchors, pathCommands.some(cmd=> cmd.cmd.toUpperCase()==="Z"));
    drawSVG();
}

function anchorMouseUp() {
    svg.removeEventListener("mousemove", anchorMouseMove);
    svg.removeEventListener("mouseup", anchorMouseUp);
    currentDragged = null;
}

function pushUndo() {
    undoStack.push(pathInput.value);
    if (undoStack.length > 25) undoStack.shift();
}

undoBtn.addEventListener('click', () => {
    if (undoStack.length > 0) {
        redoStack.push(pathInput.value);
        let prev = undoStack.pop();
        pathInput.value = prev;
        pathCommands = parsePathCommands(prev);
        anchors = getAnchors(pathCommands);
        drawSVG();
    }
});
redoBtn.addEventListener('click', () => {
    if (redoStack.length > 0) {
        let next = redoStack.pop();
        pushUndo();
        pathInput.value = next;
        pathCommands = parsePathCommands(next);
        anchors = getAnchors(pathCommands);
        drawSVG();
    }
});

function updateView() {
    let close = pathCommands.some(cmd => cmd.cmd.toUpperCase() === "Z");
    let newD = anchorsToPath(anchors, close);
    pathInput.value = newD;
    drawSVG();
}

updateBtn.addEventListener('click', () => {
    pathCommands = parsePathCommands(pathInput.value.trim());
    anchors = getAnchors(pathCommands);
    drawSVG();
    undoStack = [];
    redoStack = [];
});

strokeColor.addEventListener('input', () => drawSVG());
fillColor.addEventListener('input', () => drawSVG());

downloadBtn.addEventListener('click', () => {
    let closePath = pathCommands.some(cmd => cmd.cmd.toUpperCase() === "Z");
    let svgData =
        `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><path d="` +
        anchorsToPath(anchors, closePath) +
        `" fill="` +
        fillColor.value +
        `" stroke="` +
        strokeColor.value +
        `" stroke-width="2"/></svg>`;
    let blob = new Blob([svgData], { type: "image/svg+xml" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "path.svg";
    a.click();
    URL.revokeObjectURL(url);
});

toggleGridBtn.addEventListener('click', () => {
    gridEnabled = !gridEnabled;
    drawSVG();
});
zoomInBtn.addEventListener('click', () => {
    svgZoom = Math.min(svgZoom * 1.2, 5);
    svg.setAttribute("viewBox", `0 0 ${600 / svgZoom} ${400 / svgZoom}`);
});
zoomOutBtn.addEventListener('click', () => {
    svgZoom = Math.max(svgZoom / 1.2, 0.2);
    svg.setAttribute("viewBox", `0 0 ${600 / svgZoom} ${400 / svgZoom}`);
});
snapToGrid.addEventListener('change', () => drawSVG());

pathCommands = parsePathCommands(pathInput.value.trim());
anchors = getAnchors(pathCommands);
drawSVG();

