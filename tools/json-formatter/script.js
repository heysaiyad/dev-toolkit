const input = document.getElementById('json-input');
const prettyEl = document.getElementById('pretty');
const rawEl = document.getElementById('raw');
const treeEl = document.getElementById('tree');
const statusEl = document.getElementById('status');
const formatBtn = document.getElementById('formatBtn');
const minifyBtn = document.getElementById('minifyBtn');
const copyFormattedBtn = document.getElementById('copyFormattedBtn');
const copyInputBtn = document.getElementById('copyInputBtn');
const clearBtn = document.getElementById('clearBtn');
const sampleBtn = document.getElementById('sampleBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Tabs
const tabs = document.querySelectorAll('.tab');
const panes = {
    pretty: document.getElementById('pane-pretty'),
    tree: document.getElementById('pane-tree'),
    raw: document.getElementById('pane-raw')
};

tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    Object.values(panes).forEach(p => p.classList.remove('active'));
    const name = tab.dataset.tab;
    if (name === 'pretty') panes.pretty.classList.add('active');
    if (name === 'tree') panes.tree.classList.add('active');
    if (name === 'raw') panes.raw.classList.add('active');
}));

// Debounce for real-time validation
let t;
input.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(processInput, 200);
});

// Keyboard shortcut: Ctrl/Cmd + Enter to format
input.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        doFormat();
    }
});

formatBtn.addEventListener('click', doFormat);
minifyBtn.addEventListener('click', doMinify);
copyFormattedBtn.addEventListener('click', () => copyText(prettyEl.textContent, 'Formatted JSON copied'));
copyInputBtn.addEventListener('click', () => copyText(input.value, 'Input copied'));
clearBtn.addEventListener('click', () => {
    input.value = '';
    processInput();
    input.focus();
});
sampleBtn.addEventListener('click', () => {
    input.value = JSON.stringify(getSample(), null, 2);
    processInput();
    input.focus();
});
downloadBtn.addEventListener('click', () => download('data.json', prettyEl.textContent || input.value || ''));

function doFormat() {
    try {
        const obj = JSON.parse(input.value);
        input.value = JSON.stringify(obj, null, 2);
        processInput();
    } catch (e) {
        // keep as-is, status already shows error
        shake(statusEl);
    }
}

function doMinify() {
    try {
        const obj = JSON.parse(input.value);
        input.value = JSON.stringify(obj);
        processInput();
    } catch (e) {
        shake(statusEl);
    }
}

function processInput() {
    const text = input.value.trim();
    if (!text) {
        setStatus('Waiting for input…', 'neutral');
        prettyEl.textContent = '';
        rawEl.textContent = '';
        treeEl.innerHTML = '';
        return;
    }
    try {
        const obj = JSON.parse(text);
        const formatted = JSON.stringify(obj, null, 2);
        prettyEl.textContent = formatted;
        rawEl.textContent = text;
        renderTree(obj, treeEl);
        setStatus('Valid JSON', 'ok');
    } catch (e) {
        // Try to find line/column from error message when available
        const msg = e.message || 'Invalid JSON';
        setStatus('Invalid JSON: ' + msg, 'err');
        prettyEl.innerHTML = '';
        rawEl.textContent = text;
        treeEl.innerHTML = '';
    }
}

function setStatus(message, kind) {
    statusEl.textContent = '';
    const dot = document.createElement('span');
    dot.className = 'dot';
    statusEl.appendChild(dot);
    const text = document.createTextNode(' ' + message);
    statusEl.appendChild(text);
    statusEl.classList.remove('ok', 'err');
    if (kind === 'ok') statusEl.classList.add('ok');
    if (kind === 'err') statusEl.classList.add('err');
}

function copyText(text, successMsg) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        setStatus(successMsg, 'ok');
        setTimeout(processInput, 1000);
    }).catch(() => {
        setStatus('Copy failed', 'err');
        setTimeout(processInput, 1000);
    });
}

function download(filename, data) {
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function shake(el) {
    el.style.transform = 'translateX(0)';
    el.animate([{transform: 'translateX(0)'}, {transform: 'translateX(-4px)'}, {transform: 'translateX(4px)'}, {transform: 'translateX(0)'}], {duration: 200});
}

// Tree rendering
function renderTree(data, container) {
    container.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'tree';
    const ul = document.createElement('ul');
    ul.appendChild(renderNode(data, Array.isArray(data) ? 'array' : typeof data));
    root.appendChild(ul);
    container.appendChild(root);
}

function renderNode(value, type, key) {
    const li = document.createElement('li');
    const node = document.createElement('div');
    node.className = 'node';

    const isObj = type === 'object' && value !== null && !Array.isArray(value);
    const isArr = Array.isArray(value);
    const isContainer = isObj || isArr;

// Twisty
    const twisty = document.createElement('span');
    twisty.className = 'twisty';
    twisty.textContent = isContainer ? '▾' : '';

    if (key !== undefined) {
        const keyEl = document.createElement('span');
        keyEl.className = 'key';
        keyEl.textContent = typeof key === 'string' ? '"' + key + '"' : '[' + key + ']';
        node.appendChild(keyEl);
        node.appendChild(document.createTextNode(':'));
    }

    if (isContainer) {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = isArr ? `Array(${value.length})` : 'Object';
        node.appendChild(document.createTextNode(' '));
        node.appendChild(badge);
    } else {
        const valEl = document.createElement('span');
        const vType = value === null ? 'null' : typeof value;
        valEl.className = 'value ' + vType;
        valEl.textContent = formatPrimitive(value);
        node.appendChild(document.createTextNode(' '));
        node.appendChild(valEl);
    }

    if (isContainer) {
        const childUl = document.createElement('ul');
        const entries = isArr ? value.map((v, i) => [i, v]) : Object.entries(value);
        for (const [k, v] of entries) {
            const childType = Array.isArray(v) ? 'array' : typeof v;
            childUl.appendChild(renderNode(v, childType, k));
        }
        let collapsed = false;
        twisty.style.marginRight = '.25rem';
        node.prepend(twisty);

        const toggle = () => {
            collapsed = !collapsed;
            twisty.textContent = collapsed ? '▸' : '▾';
            childUl.style.display = collapsed ? 'none' : 'block';
        };
        twisty.addEventListener('click', toggle);

        li.appendChild(node);
        li.appendChild(childUl);
    } else {
        // place an empty twisty aligner
        const aligner = document.createElement('span');
        aligner.className = 'twisty';
        node.prepend(aligner);
        li.appendChild(node);
    }

    return li;
}

function formatPrimitive(v) {
    if (v === null) return 'null';
    switch (typeof v) {
        case 'string':
            return '"' + v + '"';
        case 'number':
            return String(v);
        case 'boolean':
            return v ? 'true' : 'false';
        default:
            return String(v);
    }
}

function getSample() {
    return {
        id: 123,
        user: {
            name: "Ada Lovelace",
            active: true,
            roles: ["admin", "editor"],
            meta: {lastLogin: "2025-10-05T10:54:00Z", score: 98.6}
        },
        items: [
            {sku: "A-100", qty: 2, price: 9.99},
            {sku: "B-200", qty: 1, price: 19.5, tags: ["sale", "new"]}
        ],
        notes: null
    };
}

// Initialize with sample for better UX on first load
if (!input.value.trim()) {
    input.value = JSON.stringify(getSample(), null, 2);
}
processInput();
input.focus();
