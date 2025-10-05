# Kanban Board Tool

A fully-featured Kanban board for task management with drag-and-drop functionality and local storage persistence.

## Features

### 🎯 **Core Functionality**
- **Three Columns**: To Do, In Progress, and Done
- **Drag & Drop**: Move tasks between columns seamlessly
- **Task Management**: Create, edit, and delete tasks
- **Local Storage**: All data persists in your browser
- **Responsive Design**: Works perfectly on desktop and mobile

### ✨ **Advanced Features**
- **Task Details**: Title and description for each task
- **Timestamps**: Track creation and update times
- **Task Counts**: Real-time count display for each column
- **Empty States**: Beautiful empty state messages
- **Keyboard Support**: ESC to close modals, Enter to submit
- **Notifications**: Success and error feedback
- **Data Export/Import**: Backup and restore your tasks

### 🎨 **User Experience**
- **Smooth Animations**: Beautiful transitions and hover effects
- **Visual Feedback**: Clear drag-and-drop indicators
- **Modal Interface**: Clean task creation and editing
- **Mobile Optimized**: Touch-friendly interface
- **Accessibility**: Proper ARIA labels and keyboard navigation

## How to Use

### Creating Tasks
1. Click the "Add Task" button in any column
2. Fill in the task title (required)
3. Add a description (optional)
4. Choose the column (To Do, In Progress, or Done)
5. Click "Save Task"

### Managing Tasks
- **Edit**: Click the edit icon on any task
- **Delete**: Click the trash icon on any task
- **Move**: Drag and drop tasks between columns

### Data Persistence
- All tasks are automatically saved to your browser's local storage
- Data persists between browser sessions
- No server required - everything works offline

## Technical Implementation

### Architecture
- **Pure JavaScript**: No external frameworks or dependencies
- **Class-based Design**: Clean, maintainable code structure
- **Event-driven**: Efficient drag-and-drop handling
- **Modular Functions**: Easy to extend and customize

### Key Components
- **KanbanBoard Class**: Main application controller
- **Drag & Drop API**: Native HTML5 drag-and-drop
- **LocalStorage API**: Browser storage for persistence
- **Modal System**: Dynamic task creation and editing
- **Notification System**: User feedback and error handling

### Data Structure
```javascript
{
  todo: [
    {
      id: "task_1234567890_abc123",
      title: "Task Title",
      description: "Task Description",
      column: "todo",
      createdAt: "2025-01-01T12:00:00.000Z",
      updatedAt: "2025-01-01T12:00:00.000Z"
    }
  ],
  progress: [],
  done: []
}
```

## Browser Support

- **Chrome** (recommended)
- **Firefox**
- **Safari**
- **Edge**
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## Keyboard Shortcuts

- **Enter**: Submit forms or create tasks
- **Escape**: Close modals or cancel actions
- **Tab**: Navigate between form elements

## Performance Features

- **Efficient Rendering**: Only re-renders changed elements
- **Debounced Updates**: Prevents excessive localStorage writes
- **Memory Management**: Proper cleanup of event listeners
- **Optimized Animations**: Uses requestAnimationFrame for smooth transitions

## Security Features

- **XSS Prevention**: HTML escaping for user input
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Graceful error recovery
- **Data Integrity**: Validates imported data structure

## Future Enhancements

Potential features for future versions:
- Task priorities and due dates
- Color coding and tags
- Task search and filtering
- Team collaboration features
- Data synchronization
- Task templates
- Keyboard shortcuts for power users

## Contributing

This tool was created as part of the DevToolkit project for Hacktoberfest 2025. 

### Development Guidelines
- Follow the existing code style
- Add proper error handling
- Include user feedback for all actions
- Test on multiple browsers
- Ensure mobile responsiveness

### Testing Checklist
- [ ] Create, edit, and delete tasks
- [ ] Drag and drop between all columns
- [ ] Data persistence across browser sessions
- [ ] Mobile touch interactions
- [ ] Keyboard navigation
- [ ] Error handling and validation
- [ ] Performance with large numbers of tasks

## License

This project is part of DevToolkit and follows the same MIT license.

---

**Made with ❤️ for the developer community • Happy Hacktoberfest 2025! 🎃**
