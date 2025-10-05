# Code Diff Viewer

A powerful side-by-side code comparison tool that provides GitHub-style diff visualization with advanced features for developers.

## Features

### 🔍 **Advanced Diff Algorithm**
- **Myers' Algorithm**: Industry-standard diff algorithm for accurate comparisons
- **Line-by-Line Analysis**: Detailed comparison of code changes
- **Smart Matching**: Intelligent detection of additions, deletions, and modifications
- **Performance Optimized**: Efficient processing even for large code files

### 🎨 **Visual Diff Display**
- **Side-by-Side View**: GitHub-style comparison layout
- **Color-Coded Changes**: 
  - 🟢 **Green**: Added lines
  - 🔴 **Red**: Deleted lines
  - 🟡 **Yellow**: Modified lines
  - ⚪ **Gray**: Unchanged lines
- **Line Numbers**: Clear line numbering for easy reference
- **Responsive Design**: Works on desktop and mobile devices

### 📁 **File Support**
- **File Upload**: Drag and drop or click to upload files
- **Multiple Formats**: Supports 15+ programming languages
- **Text Input**: Paste code directly into text areas
- **Auto-Detection**: Automatic language detection from file extensions

### ⚙️ **Advanced Features**
- **Real-time Comparison**: Live diff updates as you type
- **Language Selection**: Choose from 16+ programming languages
- **Statistics**: Detailed counts of additions, deletions, and changes
- **Keyboard Shortcuts**: Power user shortcuts for quick access
- **File Swapping**: Easy swapping between original and modified code

## Supported Languages

- **JavaScript** (.js)
- **Python** (.py)
- **Java** (.java)
- **C++** (.cpp)
- **C#** (.cs)
- **PHP** (.php)
- **Ruby** (.rb)
- **Go** (.go)
- **Rust** (.rs)
- **HTML** (.html)
- **CSS** (.css)
- **JSON** (.json)
- **XML** (.xml)
- **YAML** (.yml, .yaml)
- **SQL** (.sql)
- **Bash** (.sh)
- **Plain Text** (.txt)

## How to Use

### Method 1: Text Input
1. **Enter Original Code**: Paste your original code in the left textarea
2. **Enter Modified Code**: Paste your modified code in the right textarea
3. **Select Language**: Choose the appropriate programming language
4. **Compare**: Click "Compare Code" or press Ctrl+Enter
5. **Review Changes**: View the side-by-side diff with highlighted changes

### Method 2: File Upload
1. **Upload Original File**: Click "Choose Original File" and select your file
2. **Upload Modified File**: Click "Choose Modified File" and select your file
3. **Auto-Comparison**: The diff will be generated automatically
4. **Review Results**: See the detailed comparison with statistics

### Method 3: Mixed Input
1. **Upload One File**: Upload either original or modified file
2. **Type the Other**: Manually enter the other code snippet
3. **Compare**: Get instant diff results

## Keyboard Shortcuts

- **Ctrl+Enter**: Compare code
- **Ctrl+K**: Clear all content
- **Ctrl+S**: Swap original and modified code
- **Tab**: Navigate between input areas

## Diff Algorithm Details

### Myers' Algorithm Implementation
The tool uses Myers' algorithm, the same algorithm used by Git and other version control systems:

- **Efficiency**: O(ND) time complexity where N is the sum of file lengths
- **Accuracy**: Finds the minimum number of edits required
- **Line-based**: Compares entire lines rather than characters
- **Context-aware**: Maintains proper line pairing for better visualization

### Diff Types
- **Equal**: Lines that are identical in both versions
- **Added**: Lines present only in the modified version
- **Deleted**: Lines present only in the original version
- **Modified**: Lines that have been changed between versions

## Visual Indicators

### Color Coding
- **Green Background**: Newly added lines
- **Red Background**: Deleted lines
- **Yellow Background**: Modified lines
- **Default Background**: Unchanged lines

### Statistics Bar
- **Additions Count**: Number of lines added
- **Deletions Count**: Number of lines removed
- **Changes Count**: Total number of changes

## Technical Implementation

### Architecture
- **Pure JavaScript**: No external diff libraries required
- **Class-based Design**: Clean, maintainable code structure
- **Event-driven**: Efficient handling of user interactions
- **Modular Functions**: Easy to extend and customize

### Key Components
- **Myers' Diff Algorithm**: Core comparison engine
- **File Reader API**: For handling file uploads
- **DOM Manipulation**: For rendering diff results
- **Event Handling**: For user interactions and shortcuts

### Performance Features
- **Debounced Updates**: Prevents excessive comparisons while typing
- **Efficient Rendering**: Only updates changed elements
- **Memory Management**: Proper cleanup of resources
- **Large File Support**: Handles files up to several MB

## Browser Support

- **Chrome** (recommended)
- **Firefox**
- **Safari**
- **Edge**
- **Mobile browsers**

## Use Cases

### Development Workflow
- **Code Reviews**: Compare pull request changes
- **Version Comparison**: See what changed between commits
- **Refactoring**: Track code modifications during refactoring
- **Bug Investigation**: Identify what changed before a bug appeared

### Learning and Education
- **Code Evolution**: See how code develops over time
- **Best Practices**: Compare different implementations
- **Algorithm Analysis**: Understand different approaches to the same problem
- **Documentation**: Create visual comparisons for tutorials

### Collaboration
- **Team Reviews**: Share diffs with team members
- **Client Presentations**: Show changes to clients
- **Documentation**: Include diffs in technical documentation
- **Training**: Use for code review training sessions

## Privacy and Security

- **Local Processing**: All comparisons happen in your browser
- **No Data Upload**: Files never leave your device
- **No Server Communication**: No external API calls
- **Secure**: Your code remains completely private

## Performance Tips

### For Best Results
- Use files under 10MB for optimal performance
- Choose the correct programming language for syntax highlighting
- Use meaningful variable names and comments for better diff readability
- Break large files into smaller chunks for easier comparison

### Browser Optimization
- Use Chrome for the best performance
- Close other tabs to free up memory
- Enable hardware acceleration if available
- Use a modern browser for full feature support

## Troubleshooting

### Common Issues
1. **Large files loading slowly**: Try breaking into smaller chunks
2. **No differences shown**: Ensure files are actually different
3. **Upload not working**: Check file format and size limits
4. **Performance issues**: Close other browser tabs

### Error Messages
- **"Error reading file"**: Check file format and permissions
- **"No differences found"**: Files are identical
- **"File too large"**: Try with a smaller file

## Future Enhancements

Potential features for future versions:
- **Word-level Diffs**: Character-by-character comparison
- **Syntax Highlighting**: Enhanced code highlighting
- **Export Options**: Save diffs as images or PDFs
- **Git Integration**: Compare with Git repositories
- **Merge Conflict Resolution**: Help resolve merge conflicts
- **History Tracking**: Save comparison history
- **Collaborative Features**: Share diffs with team members

## Contributing

This tool was created as part of the DevToolkit project for Hacktoberfest 2025.

### Development Guidelines
- Follow the existing code style and patterns
- Add comprehensive error handling
- Include user feedback for all operations
- Test with various file types and sizes
- Ensure mobile responsiveness

### Testing Checklist
- [ ] Text input comparison
- [ ] File upload functionality
- [ ] Language selection
- [ ] Keyboard shortcuts
- [ ] Mobile responsiveness
- [ ] Large file handling
- [ ] Error scenarios
- [ ] Performance with complex diffs

## License

This project is part of DevToolkit and follows the same MIT license.

---

**Made with ❤️ for the developer community • Happy Hacktoberfest 2025! 🎃**
