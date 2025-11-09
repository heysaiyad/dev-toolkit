# Git Branch Visualizer

A simple web-based tool to visualize Git branch history using JSON input. This tool creates an interactive visualization of Git commits, branches, and merges using SVG graphics.

## Features

- Visualize Git commit history from JSON input
- Interactive commit nodes with tooltips
- Branch-based color coding
- Support for merge commits (multiple parents)
- Smooth animations and transitions
- Responsive design

## Usage

1. Input your Git history in JSON format:
```json
{
  "commits": [
    {
      "id": "a1b2c3",
      "message": "Initial commit",
      "branch": "main",
      "parents": []
    },
    {
      "id": "d4e5f6",
      "message": "Add feature A",
      "branch": "feature-A",
      "parents": ["a1b2c3"]
    },
    {
      "id": "g7h8i9",
      "message": "Merge feature A",
      "branch": "main",
      "parents": ["a1b2c3", "d4e5f6"]
    }
  ]
}
```

2. Click the "Visualize" button to generate the graph
3. Hover over commit nodes to see detailed information
4. Use the "Clear" button to reset the visualization

## JSON Format

The input JSON should follow this structure:

- `commits`: Array of commit objects
  - `id`: Commit hash (string)
  - `message`: Commit message (string)
  - `branch`: Branch name (string)
  - `parents`: Array of parent commit IDs (strings)

## Technical Details

- Built with vanilla JavaScript and SVG
- No external dependencies
- Uses CSS variables for theming
- Responsive and accessible design