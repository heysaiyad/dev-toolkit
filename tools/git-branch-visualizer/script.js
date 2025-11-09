// Constants for visualization
const NODE_RADIUS = 8;
const HORIZONTAL_SPACING = 80;
const VERTICAL_SPACING = 50;
const BRANCH_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9B59B6', '#3498DB', '#F1C40F', '#2ECC71'
];

// Store branch Y positions
const branchPositions = new Map();
let branchIndex = 0;

// Main visualization function
function visualizeGitHistory(jsonInput) {
    const container = document.getElementById('graph-container');
    container.innerHTML = ''; // Clear previous visualization

    try {
        const data = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
        if (!data.commits || !Array.isArray(data.commits)) {
            throw new Error('Invalid JSON format. Expected an object with "commits" array.');
        }

        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        container.appendChild(svg);

        // Reset branch positions
        branchPositions.clear();
        branchIndex = 0;

        // Calculate positions for each commit
        const positions = calculateCommitPositions(data.commits);

        // Calculate SVG dimensions
        const maxX = Math.max(...positions.map(p => p.x)) + HORIZONTAL_SPACING;
        const maxY = Math.max(...positions.map(p => p.y)) + VERTICAL_SPACING;

        // Set SVG dimensions
        svg.setAttribute('width', maxX);
        svg.setAttribute('height', maxY);

        // Draw connections first (so they appear behind nodes)
        drawConnections(svg, data.commits, positions);

        // Draw commits
        drawCommits(svg, data.commits, positions);

        // Add tooltips container
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        container.appendChild(tooltip);
    } catch (error) {
        showError(error.message);
    }
}

// Calculate positions for commits
function calculateCommitPositions(commits) {
    const positions = new Map();
    let maxLevel = 0;

    // First pass: assign x positions based on commit order
    commits.forEach((commit, index) => {
        positions.set(commit.id, {
            x: (index + 1) * HORIZONTAL_SPACING,
            y: 0 // Will be set in second pass
        });
    });

    // Second pass: assign y positions based on branches
    commits.forEach(commit => {
        if (!branchPositions.has(commit.branch)) {
            branchPositions.set(commit.branch, (branchIndex + 1) * VERTICAL_SPACING);
            branchIndex++;
        }
        
        const pos = positions.get(commit.id);
        pos.y = branchPositions.get(commit.branch);
    });

    return commits.map(commit => positions.get(commit.id));
}

// Draw connections between commits
function drawConnections(svg, commits, positions) {
    commits.forEach((commit, index) => {
        if (commit.parents && commit.parents.length > 0) {
            commit.parents.forEach(parentId => {
                const parentCommit = commits.find(c => c.id === parentId);
                if (parentCommit) {
                    const startPos = positions[index];
                    const parentIndex = commits.findIndex(c => c.id === parentId);
                    const endPos = positions[parentIndex];

                    // Create path element
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.classList.add('commit-line');

                    // Calculate bezier curve control points
                    const controlPoint1X = startPos.x - (startPos.x - endPos.x) / 2;
                    const controlPoint2X = endPos.x + (startPos.x - endPos.x) / 2;

                    // Create bezier curve path
                    const d = `M ${startPos.x} ${startPos.y} 
                             C ${controlPoint1X} ${startPos.y},
                               ${controlPoint2X} ${endPos.y},
                               ${endPos.x} ${endPos.y}`;

                    path.setAttribute('d', d);
                    svg.appendChild(path);
                }
            });
        }
    });
}

// Draw commit nodes and labels
function drawCommits(svg, commits, positions) {
    commits.forEach((commit, index) => {
        const pos = positions[index];
        const color = BRANCH_COLORS[branchPositions.get(commit.branch) % BRANCH_COLORS.length];

        // Create commit circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.classList.add('commit-node');
        circle.setAttribute('cx', pos.x);
        circle.setAttribute('cy', pos.y);
        circle.setAttribute('r', NODE_RADIUS);
        circle.style.fill = color;

        // Add hover event listeners
        circle.addEventListener('mouseenter', () => showTooltip(commit, pos));
        circle.addEventListener('mouseleave', hideTooltip);

        // Create commit label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.classList.add('commit-label');
        label.setAttribute('x', pos.x + NODE_RADIUS + 5);
        label.setAttribute('y', pos.y + 4);
        label.textContent = commit.id.substring(0, 7);

        svg.appendChild(circle);
        svg.appendChild(label);
    });
}

// Show tooltip with commit details
function showTooltip(commit, position) {
    const tooltip = document.querySelector('.tooltip');
    tooltip.innerHTML = `
        <strong>Commit:</strong> ${commit.id}<br>
        <strong>Branch:</strong> ${commit.branch}<br>
        <strong>Message:</strong> ${commit.message}
    `;
    tooltip.style.left = `${position.x + 20}px`;
    tooltip.style.top = `${position.y + 20}px`;
    tooltip.style.opacity = '1';
}

// Hide tooltip
function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    tooltip.style.opacity = '0';
}

// Show error message
function showError(message) {
    const container = document.getElementById('graph-container');
    container.innerHTML = `<div class="error" style="color: var(--error); padding: 1rem;">${message}</div>`;
}

// Sample data for different scenarios
const sampleData = {
    simple: {
        commits: [
            { id: "a1b2c3", message: "Initial commit", branch: "main", parents: [] },
            { id: "d4e5f6", message: "Add feature A", branch: "feature-A", parents: ["a1b2c3"] },
            { id: "g7h8i9", message: "Merge feature A", branch: "main", parents: ["a1b2c3", "d4e5f6"] }
        ]
    },
    feature: {
        commits: [
            { id: "init01", message: "Initial commit", branch: "main", parents: [] },
            { id: "main02", message: "Update readme", branch: "main", parents: ["init01"] },
            { id: "feat01", message: "Start feature", branch: "feature", parents: ["main02"] },
            { id: "feat02", message: "Add tests", branch: "feature", parents: ["feat01"] },
            { id: "main03", message: "Fix typo", branch: "main", parents: ["main02"] },
            { id: "merge1", message: "Merge feature branch", branch: "main", parents: ["main03", "feat02"] }
        ]
    },
    complex: {
        commits: [
            { id: "root01", message: "Initial setup", branch: "main", parents: [] },
            { id: "feat01", message: "Start feature X", branch: "feature-x", parents: ["root01"] },
            { id: "feat02", message: "Start feature Y", branch: "feature-y", parents: ["root01"] },
            { id: "feat03", message: "Update feature X", branch: "feature-x", parents: ["feat01"] },
            { id: "feat04", message: "Complete feature Y", branch: "feature-y", parents: ["feat02"] },
            { id: "merge1", message: "Merge feature Y", branch: "main", parents: ["root01", "feat04"] },
            { id: "feat05", message: "Complete feature X", branch: "feature-x", parents: ["feat03"] },
            { id: "merge2", message: "Merge feature X", branch: "main", parents: ["merge1", "feat05"] }
        ]
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const visualizeBtn = document.getElementById('visualizeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const jsonInput = document.getElementById('jsonInput');
    const sampleSelect = document.getElementById('sampleSelect');

    // Add example JSON as placeholder
    jsonInput.placeholder = JSON.stringify(sampleData.simple, null, 2);

    // Handle sample selection
    sampleSelect.addEventListener('change', () => {
        const selected = sampleSelect.value;
        if (selected && sampleData[selected]) {
            jsonInput.value = JSON.stringify(sampleData[selected], null, 2);
            visualizeGitHistory(sampleData[selected]);
        }
    });

    visualizeBtn.addEventListener('click', () => {
        try {
            const input = jsonInput.value.trim();
            if (!input) {
                throw new Error('Please enter Git history JSON data');
            }
            visualizeGitHistory(input);
        } catch (error) {
            showError(error.message);
        }
    });

    clearBtn.addEventListener('click', () => {
        jsonInput.value = '';
        document.getElementById('graph-container').innerHTML = '';
    });
});