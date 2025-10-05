// Kanban Board JavaScript
class KanbanBoard {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentEditingTask = null;
        this.init();
    }

    init() {
        this.renderTasks();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.updateTaskCounts();
    }

    // Load tasks from localStorage
    loadTasks() {
        const saved = localStorage.getItem('kanban-tasks');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error loading tasks from localStorage:', e);
                return {};
            }
        }
        return {
            todo: [],
            progress: [],
            done: []
        };
    }

    // Save tasks to localStorage
    saveTasks() {
        try {
            localStorage.setItem('kanban-tasks', JSON.stringify(this.tasks));
        } catch (e) {
            console.error('Error saving tasks to localStorage:', e);
            this.showNotification('Error saving tasks', 'error');
        }
    }

    // Generate unique ID for tasks
    generateTaskId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Create a new task
    createTask(title, description, column) {
        const task = {
            id: this.generateTaskId(),
            title: title.trim(),
            description: description.trim(),
            column: column,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.tasks[column].push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCounts();
        this.showNotification('Task created successfully!', 'success');
    }

    // Update an existing task
    updateTask(taskId, title, description, column) {
        // Remove from current column
        for (const col in this.tasks) {
            const index = this.tasks[col].findIndex(task => task.id === taskId);
            if (index !== -1) {
                this.tasks[col].splice(index, 1);
                break;
            }
        }

        // Add to new column with updated data
        const task = {
            id: taskId,
            title: title.trim(),
            description: description.trim(),
            column: column,
            createdAt: this.currentEditingTask.createdAt,
            updatedAt: new Date().toISOString()
        };

        this.tasks[column].push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCounts();
        this.showNotification('Task updated successfully!', 'success');
    }

    // Delete a task
    deleteTask(taskId) {
        for (const col in this.tasks) {
            const index = this.tasks[col].findIndex(task => task.id === taskId);
            if (index !== -1) {
                this.tasks[col].splice(index, 1);
                this.saveTasks();
                this.renderTasks();
                this.updateTaskCounts();
                this.showNotification('Task deleted successfully!', 'success');
                return;
            }
        }
    }

    // Move task between columns
    moveTask(taskId, newColumn) {
        let task = null;
        let oldColumn = null;

        // Find and remove task from current column
        for (const col in this.tasks) {
            const index = this.tasks[col].findIndex(t => t.id === taskId);
            if (index !== -1) {
                task = this.tasks[col][index];
                oldColumn = col;
                this.tasks[col].splice(index, 1);
                break;
            }
        }

        if (task && oldColumn !== newColumn) {
            task.column = newColumn;
            task.updatedAt = new Date().toISOString();
            this.tasks[newColumn].push(task);
            this.saveTasks();
            this.updateTaskCounts();
        }
    }

    // Render all tasks
    renderTasks() {
        const columns = ['todo', 'progress', 'done'];
        
        columns.forEach(column => {
            const container = document.getElementById(`${column}-tasks`);
            const tasks = this.tasks[column] || [];
            
            if (tasks.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No tasks yet</p>
                    </div>
                `;
            } else {
                container.innerHTML = tasks.map(task => this.renderTask(task)).join('');
            }
        });
    }

    // Render individual task
    renderTask(task) {
        const createdDate = new Date(task.createdAt).toLocaleDateString();
        const updatedDate = new Date(task.updatedAt).toLocaleDateString();
        const isUpdated = task.createdAt !== task.updatedAt;

        return `
            <div class="task" draggable="true" data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                </div>
                ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    <span>Created: ${createdDate}${isUpdated ? ` • Updated: ${updatedDate}` : ''}</span>
                    <div class="task-actions">
                        <button class="task-action-btn" onclick="kanbanBoard.editTask('${task.id}')" title="Edit Task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-action-btn" onclick="kanbanBoard.deleteTask('${task.id}')" title="Delete Task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Update task counts
    updateTaskCounts() {
        document.getElementById('todo-count').textContent = this.tasks.todo.length;
        document.getElementById('progress-count').textContent = this.tasks.progress.length;
        document.getElementById('done-count').textContent = this.tasks.done.length;
    }

    // Setup drag and drop
    setupDragAndDrop() {
        const tasks = document.querySelectorAll('.task');
        const columns = document.querySelectorAll('.kanban-column');

        // Make tasks draggable
        tasks.forEach(task => {
            task.addEventListener('dragstart', this.handleDragStart.bind(this));
            task.addEventListener('dragend', this.handleDragEnd.bind(this));
        });

        // Setup column drop zones
        columns.forEach(column => {
            column.addEventListener('dragover', this.handleDragOver.bind(this));
            column.addEventListener('drop', this.handleDrop.bind(this));
            column.addEventListener('dragenter', this.handleDragEnter.bind(this));
            column.addEventListener('dragleave', this.handleDragLeave.bind(this));
        });
    }

    // Drag and drop event handlers
    handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        // Remove drag-over class from all columns
        document.querySelectorAll('.kanban-column').forEach(col => {
            col.classList.remove('drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        e.preventDefault();
        if (e.target.classList.contains('kanban-column') || e.target.closest('.kanban-column')) {
            const column = e.target.classList.contains('kanban-column') ? e.target : e.target.closest('.kanban-column');
            column.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        if (e.target.classList.contains('kanban-column') || e.target.closest('.kanban-column')) {
            const column = e.target.classList.contains('kanban-column') ? e.target : e.target.closest('.kanban-column');
            column.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const column = e.target.classList.contains('kanban-column') ? e.target : e.target.closest('.kanban-column');
        column.classList.remove('drag-over');

        const taskId = e.dataTransfer.getData('text/plain');
        const newColumn = column.dataset.column;

        this.moveTask(taskId, newColumn);
        this.renderTasks();
    }

    // Setup event listeners
    setupEventListeners() {
        // Task form submission
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskSubmit();
        });

        // Close modal on overlay click
        document.getElementById('task-modal').addEventListener('click', (e) => {
            if (e.target.id === 'task-modal') {
                this.closeTaskModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTaskModal();
            }
        });
    }

    // Handle task form submission
    handleTaskSubmit() {
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const column = document.getElementById('task-column').value;

        if (!title.trim()) {
            this.showNotification('Please enter a task title', 'error');
            return;
        }

        if (this.currentEditingTask) {
            this.updateTask(this.currentEditingTask.id, title, description, column);
        } else {
            this.createTask(title, description, column);
        }

        this.closeTaskModal();
    }

    // Open task modal
    openTaskModal(defaultColumn = 'todo') {
        this.currentEditingTask = null;
        document.getElementById('modal-title').textContent = 'Add New Task';
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
        document.getElementById('task-column').value = defaultColumn;
        document.getElementById('task-modal').classList.add('show');
        document.getElementById('task-title').focus();
    }

    // Edit task
    editTask(taskId) {
        let task = null;
        for (const col in this.tasks) {
            task = this.tasks[col].find(t => t.id === taskId);
            if (task) break;
        }

        if (task) {
            this.currentEditingTask = task;
            document.getElementById('modal-title').textContent = 'Edit Task';
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description;
            document.getElementById('task-column').value = task.column;
            document.getElementById('task-modal').classList.add('show');
            document.getElementById('task-title').focus();
        }
    }

    // Close task modal
    closeTaskModal() {
        document.getElementById('task-modal').classList.remove('show');
        this.currentEditingTask = null;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add notification styles if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 2rem;
                    right: 2rem;
                    background: var(--bg-secondary);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-md);
                    padding: 1rem 1.5rem;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    z-index: 10001;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                    backdrop-filter: blur(20px);
                }
                .notification.show {
                    transform: translateX(0);
                }
                .notification-success {
                    border-color: var(--success-color);
                    color: var(--success-color);
                }
                .notification-error {
                    border-color: var(--error-color);
                    color: var(--error-color);
                }
                .notification-info {
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Clear all tasks
    clearAllTasks() {
        if (confirm('Are you sure you want to clear all tasks? This action cannot be undone.')) {
            this.tasks = {
                todo: [],
                progress: [],
                done: []
            };
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCounts();
            this.showNotification('All tasks cleared!', 'success');
        }
    }

    // Export tasks
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kanban-tasks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showNotification('Tasks exported successfully!', 'success');
    }

    // Import tasks
    importTasks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTasks = JSON.parse(e.target.result);
                if (this.validateTaskStructure(importedTasks)) {
                    this.tasks = importedTasks;
                    this.saveTasks();
                    this.renderTasks();
                    this.updateTaskCounts();
                    this.showNotification('Tasks imported successfully!', 'success');
                } else {
                    this.showNotification('Invalid task file format', 'error');
                }
            } catch (error) {
                this.showNotification('Error importing tasks', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Validate imported task structure
    validateTaskStructure(tasks) {
        return tasks && 
               typeof tasks === 'object' &&
               Array.isArray(tasks.todo) &&
               Array.isArray(tasks.progress) &&
               Array.isArray(tasks.done);
    }
}

// Global functions for HTML onclick handlers
let kanbanBoard;

function openTaskModal(column = 'todo') {
    kanbanBoard.openTaskModal(column);
}

function closeTaskModal() {
    kanbanBoard.closeTaskModal();
}

function handleFileImport(input) {
    const file = input.files[0];
    if (file) {
        kanbanBoard.importTasks(file);
        input.value = ''; // Reset the input
    }
}

    // Initialize the Kanban board when the page loads
document.addEventListener('DOMContentLoaded', function() {
    kanbanBoard = new KanbanBoard();
    
    // Re-setup drag and drop after rendering
    kanbanBoard.renderTasks();
    kanbanBoard.setupDragAndDrop();
    
    // Add some demo tasks if the board is empty
    if (kanbanBoard.tasks.todo.length === 0 && 
        kanbanBoard.tasks.progress.length === 0 && 
        kanbanBoard.tasks.done.length === 0) {
        kanbanBoard.createTask('Welcome to Kanban Board!', 'This is your first task. Try dragging it to different columns!', 'todo');
        kanbanBoard.createTask('Create Your Tasks', 'Click the "Add Task" button to create new tasks.', 'todo');
        kanbanBoard.createTask('Drag and Drop', 'Drag tasks between columns to organize your workflow.', 'todo');
    }
});
