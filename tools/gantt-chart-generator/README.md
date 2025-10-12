# Gantt Chart Generator

A powerful tool to create beautiful, interactive Gantt charts from JSON data. Perfect for project management, timeline visualization, and tracking task dependencies.

## Features

- 🎨 **Beautiful Design**: Clean, responsive design with Hacktoberfest theme
- 📊 **Interactive Charts**: Hover effects and smooth animations
- 📱 **Mobile Responsive**: Works perfectly on all devices
- 📤 **Export Functionality**: Export charts as standalone HTML files
- ⚡ **Real-time Validation**: Instant feedback on JSON input
- ⌨️ **Keyboard Shortcuts**: Quick actions with Ctrl+Enter and Ctrl+S
- 🔍 **Smart Date Parsing**: Automatic timeline calculation and date range detection

## JSON Schema

The tool accepts a JSON structure with the following format:

```json
{
  "title": "Project Name",
  "tasks": [
    {
      "name": "Task Name",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD"
    }
  ]
}
```

### Required Fields

- `tasks` (array): Array of task objects
- `tasks[].name` (string): Task name/description
- `tasks[].start_date` (string): Start date in YYYY-MM-DD format
- `tasks[].end_date` (string): End date in YYYY-MM-DD format

### Optional Fields

- `title` (string): Project title (defaults to "Project Timeline")

## Example Usage

### Sample JSON Data

```json
{
  "title": "Website Development Project",
  "tasks": [
    {
      "name": "Planning & Research",
      "start_date": "2024-01-01",
      "end_date": "2024-01-07"
    },
    {
      "name": "UI/UX Design",
      "start_date": "2024-01-05",
      "end_date": "2024-01-20"
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
      "name": "Testing & QA",
      "start_date": "2024-02-10",
      "end_date": "2024-02-25"
    },
    {
      "name": "Deployment",
      "start_date": "2024-02-20",
      "end_date": "2024-02-28"
    }
  ]
}
```

## How to Use

1. **Input JSON Data**: Paste your JSON data into the text area or click "Load Sample Data"
2. **Generate Chart**: Click the "Generate Chart" button or press Ctrl+Enter
3. **View Results**: The interactive Gantt chart will appear below
4. **Export Chart**: Click "Export Chart" to download as a standalone HTML file

## Keyboard Shortcuts

- `Ctrl+Enter` (or `Cmd+Enter` on Mac): Generate chart
- `Ctrl+S` (or `Cmd+S` on Mac): Export chart (when chart is visible)

## Error Handling

The tool provides comprehensive error validation:

- **JSON Syntax**: Validates proper JSON format
- **Required Fields**: Ensures all required fields are present
- **Date Format**: Validates YYYY-MM-DD date format
- **Date Logic**: Ensures start date is not after end date
- **Data Types**: Validates correct data types for all fields

## Chart Features

- **Timeline Calculation**: Automatically calculates project timeline from task dates
- **Task Bars**: Visual representation of task duration and timing
- **Hover Effects**: Interactive hover states with task details
- **Responsive Design**: Scales beautifully on mobile and desktop
- **Date Labels**: Smart date labeling based on project duration
- **Task Information**: Tooltips showing task details and duration

## Export Options

The export feature creates a standalone HTML file containing:

- Complete Gantt chart visualization
- Project information and statistics
- Print-friendly styles
- Self-contained CSS (no external dependencies)
- Professional appearance suitable for presentations

## Technical Details

- **Pure JavaScript**: No external dependencies
- **CSS Grid/Flexbox**: Modern layout techniques
- **SVG-free**: Uses CSS for all visual elements
- **Performance**: Optimized for large project datasets
- **Accessibility**: Keyboard navigation and screen reader friendly

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Tips for Best Results

1. **Date Format**: Always use YYYY-MM-DD format for dates
2. **Task Names**: Keep task names concise for better visual appearance
3. **Project Size**: Tool handles projects with 50+ tasks efficiently
4. **Overlapping Tasks**: The tool beautifully displays overlapping and parallel tasks
5. **Export**: Exported charts are perfect for sharing with stakeholders

## Troubleshooting

**Chart not generating?**
- Check JSON syntax using the built-in validator
- Ensure all required fields are present
- Verify date formats are correct

**Export not working?**
- Generate a chart first
- Check browser allows file downloads
- Try using keyboard shortcut Ctrl+S

**Mobile display issues?**
- The tool is fully responsive
- Horizontal scrolling is enabled for large timelines
- Task names are truncated automatically on small screens