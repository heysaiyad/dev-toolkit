# Webpage to Markdown Converter - Test Cases

## Desktop Browser Testing

### Chrome
- [ ] Page loads correctly
- [ ] URL validation works
- [ ] Webpage fetch works
- [ ] Markdown conversion is accurate
- [ ] Copy functionality works
- [ ] Keyboard shortcuts work
- [ ] Error messages display correctly

### Firefox
- [ ] Page loads correctly
- [ ] URL validation works
- [ ] Webpage fetch works
- [ ] Markdown conversion is accurate
- [ ] Copy functionality works
- [ ] Keyboard shortcuts work
- [ ] Error messages display correctly

### Safari
- [ ] Page loads correctly
- [ ] URL validation works
- [ ] Webpage fetch works
- [ ] Markdown conversion is accurate
- [ ] Copy functionality works
- [ ] Keyboard shortcuts work
- [ ] Error messages display correctly

## Mobile Testing

### Portrait Mode
- [ ] Page renders correctly
- [ ] Input field is usable
- [ ] Convert button is easily clickable
- [ ] Output is readable
- [ ] Copy button works
- [ ] No horizontal scrolling
- [ ] Error messages are visible

### Landscape Mode
- [ ] Page adapts to width
- [ ] All elements remain accessible
- [ ] Content fits without scrolling
- [ ] UI remains functional

## Functionality Testing

### URL Validation
- [ ] Empty URL shows error
- [ ] Invalid URL format shows error
- [ ] Non-HTTP/HTTPS URLs show error
- [ ] Valid URLs are accepted

### Content Fetching
- [ ] Successfully fetches public webpages
- [ ] Shows error for non-existent pages
- [ ] Shows error for blocked domains
- [ ] Shows error for invalid responses

### Content Extraction
- [ ] Extracts main article content
- [ ] Falls back to alternative selectors
- [ ] Handles missing content gracefully
- [ ] Removes unwanted elements (ads, nav, etc.)

### Markdown Conversion
- [ ] Headings are preserved
- [ ] Lists are formatted correctly
- [ ] Links are maintained
- [ ] Images are converted properly
- [ ] Tables are well-formatted
- [ ] Code blocks preserve language
- [ ] Blockquotes are formatted
- [ ] Empty lines are handled properly

### UI/UX Testing
- [ ] Loading state shows during conversion
- [ ] Success feedback is clear
- [ ] Error messages are descriptive
- [ ] Copy button shows feedback
- [ ] Output is easily selectable
- [ ] Layout remains stable during operation

## Sample Test URLs

### Basic Content
```
https://example.com
```
Expected: Simple page with basic elements

### Complex Content
```
https://developer.mozilla.org/en-US/docs/Web/Markdown
```
Expected: Technical documentation with code blocks

### Article Content
```
https://medium.com/any-article
```
Expected: Blog post with rich formatting

### Table Content
```
https://www.w3schools.com/html/html_tables.asp
```
Expected: Page with HTML tables

## Error Test Cases

1. Invalid URL:
```
not-a-url
```
Expected: "Please enter a valid URL" error

2. Non-existent Page:
```
https://example.com/404
```
Expected: Fetch error message

3. Blocked Domain:
```
https://accounts.google.com
```
Expected: Access denied/fetch error message

4. Empty Content:
```
https://example.com/blank
```
Expected: No content error message

## Performance Testing

- [ ] Large pages (>100KB) convert without freezing
- [ ] Multiple conversions work reliably
- [ ] Memory usage remains stable
- [ ] No console errors appear

## Accessibility Testing

- [ ] ARIA labels are present
- [ ] Keyboard navigation works
- [ ] Color contrast is sufficient
- [ ] Error messages are screen-reader friendly

## Manual Test Script

1. Open the tool in Chrome
2. Enter "not-a-url" and verify error
3. Enter "https://example.com" and verify conversion
4. Copy the output and verify
5. Test Ctrl+Enter shortcut
6. Test error handling with invalid URLs
7. Verify mobile responsiveness
8. Check all interactive elements work
9. Verify error messages are clear
10. Test with various content types

## Notes

- Document any browser-specific issues
- Note any inconsistencies in Markdown output
- Track performance with large pages
- Document proxy service limitations