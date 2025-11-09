# 📝 Commit Message Formatter

A tool to help developers create well-formatted commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification with emoji support.

## Features

- ✨ Pre-defined commit types with emojis
- 🔍 Optional scope support
- 📝 Description, body, and footer fields
- 👀 Real-time preview
- 📋 One-click copy to clipboard
- 💾 Remembers last used commit type
- 🎨 Follows DevToolkit design system

## Usage

1. Select a commit type (feat, fix, docs, etc.)
2. (Optional) Add a scope to provide context
3. Write a brief description
4. (Optional) Add detailed body and footer
5. Preview your formatted message
6. Click "Copy to Clipboard" to use in your git commit

## Commit Types

- ✨ **feat**: New feature
- 🐛 **fix**: Bug fix
- 📚 **docs**: Documentation
- 💄 **style**: Styling/formatting
- ♻️ **refactor**: Code restructure
- ⚡ **perf**: Performance
- ✅ **test**: Testing
- 🔧 **chore**: Maintenance
- 📦 **build**: Build system
- 👷 **ci**: CI/CD changes

## Example Output

```
✨ feat(ui): add dark mode support

Implement system-wide dark mode theming with CSS variables and user preference detection.

BREAKING CHANGE: New theme variables required in custom stylesheets
Closes #123
```