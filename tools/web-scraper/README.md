# Web Scraper Tool

A powerful web scraping tool that extracts links and images from any website using CORS proxy integration.

## Features

### 🔍 **Web Scraping**
- Extract all links from any website
- Extract all images with metadata (alt text, dimensions)
- Support for both internal and external links
- Real-time URL validation

### 🌐 **CORS Proxy Integration**
- Multiple CORS proxy fallbacks for reliability
- Automatic proxy switching on failure
- Handles CORS restrictions seamlessly

### 📊 **Statistics & Analytics**
- Total link count
- Total image count
- Internal vs external link breakdown
- Real-time animated counters

### 🎛️ **Customization Options**
- Toggle link extraction on/off
- Toggle image extraction on/off
- Include/exclude external links
- Include/exclude internal links

### 📤 **Export Functionality**
- Export links as CSV
- Export images as CSV
- Export all data as JSON
- One-click download functionality

### 🎨 **User Experience**
- Beautiful dark theme with Hacktoberfest colors
- Responsive design for all devices
- Loading states and animations
- Error handling with user-friendly messages
- Success notifications
- Copy-to-clipboard functionality

### ⌨️ **Keyboard Shortcuts**
- `Enter` - Start scraping
- `Ctrl + Enter` - Start scraping
- `Ctrl + Shift + C` - Clear all data

## How to Use

1. **Enter URL**: Input any valid website URL (must start with http:// or https://)
2. **Configure Options**: Choose what to extract (links, images, internal/external)
3. **Scrape**: Click the "Scrape" button or press Enter
4. **View Results**: See organized results with statistics
5. **Export**: Download results as CSV or JSON

## Technical Implementation

### CORS Proxy Strategy
The tool uses multiple CORS proxy services as fallbacks:
- `api.allorigins.win` (Primary)
- `cors-anywhere.herokuapp.com` (Fallback)
- `thingproxy.freeboard.io` (Fallback)

### HTML Parsing
- Uses native `DOMParser` for client-side HTML parsing
- Extracts links from `<a href>` attributes
- Extracts images from `<img src>` attributes
- Handles relative URLs by converting to absolute URLs

### Data Processing
- Filters links based on user preferences
- Categorizes links as internal/external
- Extracts image metadata (alt text, dimensions)
- Provides comprehensive statistics

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Security Features

- URL validation to prevent malicious inputs
- CORS proxy integration for safe cross-origin requests
- No server-side processing (client-side only)
- Secure clipboard API usage

## Sample URLs for Testing

- `https://github.com`
- `https://stackoverflow.com`
- `https://developer.mozilla.org`
- `https://www.w3schools.com`

## Error Handling

The tool gracefully handles various error scenarios:
- Invalid URLs
- Network timeouts
- CORS proxy failures
- Malformed HTML
- Empty results

## Performance Optimizations

- Debounced input validation
- Efficient DOM parsing
- Lazy loading of results
- Optimized animations
- Minimal memory footprint

## Contributing

This tool follows the DevToolkit design guidelines and uses the standard template structure. When contributing:

1. Follow the existing code patterns
2. Maintain responsive design
3. Test on multiple browsers
4. Ensure accessibility compliance
5. Update documentation as needed

## License

This tool is part of the DevToolkit project and follows the same MIT license.
