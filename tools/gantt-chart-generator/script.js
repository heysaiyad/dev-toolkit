document.addEventListener('DOMContentLoaded', function() {
    // Auto-focus on JSON input
    const jsonInput = document.getElementById('json-input');
    if (jsonInput) {
        jsonInput.focus();
    }

    // Add input event listener for real-time validation
    jsonInput.addEventListener('input', function() {
        hideError();
    });
});

// Sample data for demonstration
const sampleData = {
    "title": "Software Development Project",
    "tasks": [
        {
            "name": "Project Planning",
            "start_date": "2024-01-01",
            "end_date": "2024-01-07"
        },
        {
            "name": "Requirements Analysis",
            "start_date": "2024-01-05",
            "end_date": "2024-01-14"
        },
        {
            "name": "System Design",
            "start_date": "2024-01-10",
            "end_date": "2024-01-21"
        },
        {
            "name": "Frontend Development",
            "start_date": "2024-01-15",
            "end_date": "2024-02-15"
        },
        {
            "name": "Backend Development",
            "start_date": "2024-01-20",
            "end_date": "2024-02-20"
        },
        {
            "name": "Database Setup",
            "start_date": "2024-01-25",
            "end_date": "2024-02-05"
        },
        {
            "name": "Integration Testing",
            "start_date": "2024-02-10",
            "end_date": "2024-02-25"
        },
        {
            "name": "User Testing",
            "start_date": "2024-02-20",
            "end_date": "2024-03-05"
        },
        {
            "name": "Bug Fixes",
            "start_date": "2024-02-28",
            "end_date": "2024-03-10"
        },
        {
            "name": "Deployment",
            "start_date": "2024-03-08",
            "end_date": "2024-03-15"
        }
    ]
};

// Load sample data into the textarea
function loadSampleData() {
    const jsonInput = document.getElementById('json-input');
    jsonInput.value = JSON.stringify(sampleData, null, 2);
    hideError();
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    errorText.textContent = message;
    errorDiv.style.display = 'block';
    
    // Scroll to error message
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Hide error message
function hideError() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.style.display = 'none';
}

// Validate JSON structure
function validateJSON(data) {
    if (typeof data !== 'object' || data === null) {
        throw new Error('JSON must be an object');
    }

    if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('JSON must contain a "tasks" array');
    }

    if (data.tasks.length === 0) {
        throw new Error('Tasks array cannot be empty');
    }

    data.tasks.forEach((task, index) => {
        if (!task.name || typeof task.name !== 'string') {
            throw new Error(`Task ${index + 1}: "name" is required and must be a string`);
        }

        if (!task.start_date || typeof task.start_date !== 'string') {
            throw new Error(`Task ${index + 1}: "start_date" is required and must be a string`);
        }

        if (!task.end_date || typeof task.end_date !== 'string') {
            throw new Error(`Task ${index + 1}: "end_date" is required and must be a string`);
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(task.start_date)) {
            throw new Error(`Task ${index + 1}: "start_date" must be in YYYY-MM-DD format`);
        }

        if (!dateRegex.test(task.end_date)) {
            throw new Error(`Task ${index + 1}: "end_date" must be in YYYY-MM-DD format`);
        }

        // Validate that dates are valid
        const startDate = new Date(task.start_date);
        const endDate = new Date(task.end_date);

        if (isNaN(startDate.getTime())) {
            throw new Error(`Task ${index + 1}: "start_date" is not a valid date`);
        }

        if (isNaN(endDate.getTime())) {
            throw new Error(`Task ${index + 1}: "end_date" is not a valid date`);
        }

        if (startDate > endDate) {
            throw new Error(`Task ${index + 1}: "start_date" cannot be after "end_date"`);
        }
    });

    return true;
}

// Calculate date range for the project
function calculateDateRange(tasks) {
    let minDate = new Date(tasks[0].start_date);
    let maxDate = new Date(tasks[0].end_date);

    tasks.forEach(task => {
        const startDate = new Date(task.start_date);
        const endDate = new Date(task.end_date);

        if (startDate < minDate) minDate = startDate;
        if (endDate > maxDate) maxDate = endDate;
    });

    return { minDate, maxDate };
}

// Generate date labels for the timeline
function generateDateLabels(minDate, maxDate, maxLabels = 10) {
    const dates = [];
    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
    const step = Math.max(1, Math.ceil(totalDays / maxLabels));

    for (let i = 0; i <= totalDays; i += step) {
        const currentDate = new Date(minDate);
        currentDate.setDate(currentDate.getDate() + i);
        dates.push(currentDate);
    }

    // Always include the end date if it's not already included
    const lastDate = dates[dates.length - 1];
    if (lastDate.getTime() !== maxDate.getTime()) {
        dates.push(maxDate);
    }

    return dates;
}

// Format date for display
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

// Calculate task bar position and width
function calculateBarPosition(task, minDate, maxDate, containerWidth) {
    const totalDuration = maxDate - minDate;
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.end_date);
    
    const startOffset = (taskStart - minDate) / totalDuration;
    const taskDuration = (taskEnd - taskStart) / totalDuration;
    
    return {
        left: `${startOffset * 100}%`,
        width: `${taskDuration * 100}%`
    };
}

// Calculate task duration in days
function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

// Generate the Gantt chart
function generateChart() {
    const jsonInput = document.getElementById('json-input').value.trim();
    
    if (!jsonInput) {
        showError('Please enter JSON data or click "Load Sample Data" to see an example.');
        return;
    }

    let data;
    try {
        data = JSON.parse(jsonInput);
    } catch (e) {
        showError('Invalid JSON format. Please check your JSON syntax.');
        return;
    }

    try {
        validateJSON(data);
    } catch (e) {
        showError(e.message);
        return;
    }

    hideError();

    // Calculate date range
    const { minDate, maxDate } = calculateDateRange(data.tasks);
    const dateLabels = generateDateLabels(minDate, maxDate);

    // Update chart info
    const chartInfo = document.getElementById('chart-info');
    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
    chartInfo.textContent = `${data.tasks.length} tasks • ${totalDays} days • ${formatDate(minDate)} to ${formatDate(maxDate)}`;

    // Update project title
    const chartTitle = document.getElementById('chart-project-title');
    chartTitle.textContent = data.title || 'Project Timeline';

    // Generate chart HTML
    let chartHTML = '<div class="gantt-timeline">';
    
    // Header
    chartHTML += '<div class="gantt-header">';
    chartHTML += '<div class="gantt-task-header">Task</div>';
    chartHTML += '<div class="gantt-dates-header">';
    dateLabels.forEach(date => {
        chartHTML += `<div class="gantt-date-label">${formatDate(date)}</div>`;
    });
    chartHTML += '</div>';
    chartHTML += '</div>';

    // Tasks
    data.tasks.forEach((task, index) => {
        const barPosition = calculateBarPosition(task, minDate, maxDate);
        const duration = calculateDuration(task.start_date, task.end_date);
        
        chartHTML += '<div class="gantt-row">';
        chartHTML += `<div class="gantt-task-name">${task.name}</div>`;
        chartHTML += '<div class="gantt-timeline-area">';
        chartHTML += `<div class="gantt-bar" style="left: ${barPosition.left}; width: ${barPosition.width};" title="${task.name}: ${task.start_date} to ${task.end_date} (${duration} days)">`;
        chartHTML += `<div class="gantt-bar-text">${task.name}</div>`;
        chartHTML += '</div>';
        chartHTML += '</div>';
        chartHTML += '</div>';
    });

    chartHTML += '</div>';

    // Insert chart into DOM
    const chartContainer = document.getElementById('gantt-chart');
    const scrollHint = chartContainer.querySelector('.mobile-scroll-hint');
    chartContainer.innerHTML = chartHTML;
    
    // Re-add scroll hint if on mobile
    if (window.innerWidth <= 768) {
        const newScrollHint = document.createElement('div');
        newScrollHint.className = 'mobile-scroll-hint';
        newScrollHint.id = 'scroll-hint';
        newScrollHint.innerHTML = '<i class="fas fa-arrows-alt-h"></i> Scroll →';
        chartContainer.appendChild(newScrollHint);
        
        // Hide scroll hint after a few seconds
        setTimeout(() => {
            newScrollHint.style.opacity = '0';
            setTimeout(() => {
                if (newScrollHint.parentNode) {
                    newScrollHint.parentNode.removeChild(newScrollHint);
                }
            }, 500);
        }, 4000);
    }

    // Show chart container and export button
    document.getElementById('chart-container').style.display = 'block';
    document.getElementById('export-btn').style.display = 'inline-flex';

    // Scroll to chart
    document.getElementById('chart-container').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });

    // Add hover animations and mobile interactions
    addChartInteractions();
}

// Add interactive features to the chart
function addChartInteractions() {
    const ganttBars = document.querySelectorAll('.gantt-bar');
    const chartContainer = document.getElementById('gantt-chart');
    const isMobile = window.innerWidth <= 768;
    
    ganttBars.forEach(bar => {
        // Desktop hover effects
        if (!isMobile) {
            bar.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px)';
                this.style.zIndex = '10';
            });
            
            bar.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.zIndex = '1';
            });
        }
        
        // Mobile and desktop touch/click events
        bar.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.style.transform = 'translateY(-2px)';
            this.style.zIndex = '10';
            this.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.5)';
        });
        
        bar.addEventListener('touchend', function(e) {
            e.preventDefault();
            setTimeout(() => {
                this.style.transform = 'translateY(0)';
                this.style.zIndex = '1';
                this.style.boxShadow = '0 2px 8px rgba(255, 107, 53, 0.3)';
            }, 150);
        });
        
        // Click event for task details (both mobile and desktop)
        bar.addEventListener('click', function(e) {
            e.stopPropagation();
            showTaskDetails(this);
        });
    });
    
    // Add smooth scrolling behavior for mobile
    if (isMobile && chartContainer) {
        let isScrolling = false;
        
        chartContainer.addEventListener('scroll', function() {
            if (!isScrolling) {
                isScrolling = true;
                // Hide scroll hint when user starts scrolling
                const scrollHint = document.getElementById('scroll-hint');
                if (scrollHint) {
                    scrollHint.style.opacity = '0';
                    setTimeout(() => {
                        if (scrollHint.parentNode) {
                            scrollHint.parentNode.removeChild(scrollHint);
                        }
                    }, 300);
                }
            }
            
            // Debounce scroll end
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 150);
        });
    }
}

// Show task details in a mobile-friendly way
function showTaskDetails(taskBar) {
    const title = taskBar.getAttribute('title');
    if (!title) return;
    
    // Remove existing tooltip
    const existingTooltip = document.querySelector('.task-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'task-tooltip';
    tooltip.innerHTML = title;
    tooltip.style.cssText = `
        position: absolute;
        background: var(--bg-secondary);
        color: var(--text-primary);
        padding: 0.75rem;
        border-radius: var(--radius-md);
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 0.85rem;
        z-index: 1000;
        box-shadow: var(--shadow-lg);
        max-width: 250px;
        word-wrap: break-word;
        pointer-events: none;
        top: -60px;
        left: 50%;
        transform: translateX(-50%);
        animation: fadeIn 0.2s ease;
    `;
    
    taskBar.style.position = 'relative';
    taskBar.appendChild(tooltip);
    
    // Remove tooltip after 3 seconds
    setTimeout(() => {
        if (tooltip.parentNode) {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 200);
        }
    }, 3000);
}

// Export chart as HTML
function exportChart() {
    const chartContainer = document.getElementById('chart-container');
    if (!chartContainer || chartContainer.style.display === 'none') {
        showError('Please generate a chart first before exporting.');
        return;
    }

    const projectTitle = document.getElementById('chart-project-title').textContent;
    const chartInfo = document.getElementById('chart-info').textContent;
    const chartHTML = document.getElementById('gantt-chart').innerHTML;

    // Create a complete HTML document
    const exportHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectTitle} - Gantt Chart</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }
        .chart-container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            max-width: 1200px;
            margin: 0 auto;
        }
        .chart-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #ff6b35;
            padding-bottom: 20px;
        }
        .chart-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .chart-info {
            color: #666;
            font-size: 14px;
        }
        .gantt-timeline {
            display: flex;
            flex-direction: column;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            overflow: hidden;
        }
        .gantt-header {
            display: flex;
            background: #ff6b35;
            color: white;
            font-weight: bold;
            padding: 15px 0;
        }
        .gantt-task-header {
            min-width: 200px;
            padding: 0 15px;
            border-right: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
        }
        .gantt-dates-header {
            flex: 1;
            display: flex;
            justify-content: space-between;
            padding: 0 15px;
            align-items: center;
        }
        .gantt-date-label {
            font-size: 12px;
            white-space: nowrap;
        }
        .gantt-row {
            display: flex;
            border-bottom: 1px solid #e0e0e0;
            min-height: 50px;
            align-items: center;
        }
        .gantt-row:nth-child(even) {
            background: #f9f9f9;
        }
        .gantt-row:hover {
            background: #fff5f1;
        }
        .gantt-task-name {
            min-width: 200px;
            padding: 0 15px;
            font-weight: 500;
            border-right: 1px solid #e0e0e0;
            display: flex;
            align-items: center;
            min-height: 50px;
        }
        .gantt-timeline-area {
            flex: 1;
            position: relative;
            padding: 0 15px;
            display: flex;
            align-items: center;
            min-height: 50px;
        }
        .gantt-bar {
            height: 20px;
            background: linear-gradient(135deg, #ff6b35, #ff8c42);
            border-radius: 4px;
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: 500;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        .gantt-bar-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0 6px;
        }
        .export-info {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 12px;
        }
        @media print {
            body { background: white; }
            .chart-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="chart-container">
        <div class="chart-header">
            <div class="chart-title">${projectTitle}</div>
            <div class="chart-info">${chartInfo}</div>
        </div>
        <div class="gantt-chart">${chartHTML}</div>
        <div class="export-info">
            Generated by DevToolkit Gantt Chart Generator • ${new Date().toLocaleDateString()}
        </div>
    </div>
</body>
</html>`;

    // Create and download the file
    const blob = new Blob([exportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_gantt_chart.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to generate chart
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        generateChart();
    }
    
    // Ctrl/Cmd + S to export chart
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const chartContainer = document.getElementById('chart-container');
        if (chartContainer && chartContainer.style.display !== 'none') {
            exportChart();
        }
    }
});