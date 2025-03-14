# Super-X XPath Query Generator

A Chrome extension that helps developers and testers generate and test XPath queries for web elements. The extension provides two modes of operation: a hover mode that shows XPath queries for elements under the cursor, and a manual query mode that highlights elements matching a custom XPath query.

![Super-X XPath Query Generator](screenshots/extension-demo.png)

## Features

- **Hover Mode**: Hold the Shift key and hover over elements to see their XPath queries
- **Manual Query Mode**: Enter custom XPath queries and see matching elements highlighted in real-time
- **Multiple XPath Formats**: View both full and optimized XPath queries
- **Real-time Highlighting**: Elements are highlighted as you type or hover
- **Match Count**: See how many elements match your XPath query
- **Copy to Clipboard**: Easily copy XPath queries with one click
- **Keyboard Shortcuts**: Use Shift+L to copy full XPath and Shift+O to copy optimized XPath
- **Draggable Interface**: Move the query panel anywhere on the page
- **Resizable Panel**: Adjust the size of the query panel to your needs
- **Syntax Error Feedback**: Get immediate feedback if your XPath query has errors
- **Performance Optimized**: Efficiently handles large pages and complex DOM structures
- **Accessibility Support**: Keyboard navigable with proper ARIA attributes
- **Visual Feedback**: Animated highlights and copy confirmations
- **Smart XPath Generation**: Ignores extension-added classes when generating optimized queries
- **Modern UI**: Styled with a clean, responsive CSS interface

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store page for XPath Query Generator
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now appear in your extensions list and toolbar

## Development

### Setup

1. Clone the repository
2. Run the build script to install dependencies
   ```
   ./build.sh
   ```

### CSS Styling

This extension uses standard CSS for styling the UI:

1. **CSS Structure**:

   - The extension uses standard CSS with CSS variables for theming
   - Styles are organized in a modular way in the `styles.css` file
   - All styling is done with semantic class names for maintainability

2. **Custom Styling**:
   - Custom CSS variables are defined in the `:root` selector for easy theming
   - Modern CSS features like flexbox and grid are used for layouts
   - Animations and transitions provide a polished user experience

### Browser Extension Development

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the extension directory
4. After making changes, click the refresh icon on the extension card

## Usage

### Hover Mode

1. Navigate to any webpage
2. Hold the `Shift` key
3. Move your cursor over elements on the page
4. The element under your cursor will be highlighted with an orange outline
5. An overlay panel will appear showing both full and optimized XPath queries
6. Click the "Copy" button to copy the XPath to your clipboard
7. Use `Shift+L` to directly copy the full XPath or `Shift+O` for the optimized XPath
8. Release the `Shift` key to exit hover mode

![Hover Mode](screenshots/hover-mode.png)

### Manual Query Mode

1. Click the XPath Query Generator icon in your browser toolbar
2. Click the "Open XPath Query Panel" button
3. A fixed panel will appear on the page
4. Type your XPath query in the input field
5. Matching elements will be highlighted in blue as you type
6. The panel will show the number of matching elements
7. You can drag the panel by its header to reposition it
8. Resize the panel by dragging the bottom-right corner (expands up to full browser width)
9. Click the "×" button to close the panel

![Manual Query Mode](screenshots/manual-mode.png)

## Performance Optimizations

The extension includes several performance optimizations:

- **Query Debouncing**: Input is debounced to prevent excessive DOM operations
- **Element Limit**: When a query matches too many elements, only the first 100 are highlighted
- **Efficient DOM Traversal**: Optimized algorithms for XPath generation
- **Passive Event Listeners**: Used where appropriate for better scrolling performance
- **CSS Transitions**: Hardware-accelerated animations for smooth visual feedback
- **State Management**: Centralized state management to reduce memory usage
- **Error Handling**: Comprehensive error handling to prevent crashes
- **Smart Class Handling**: Extension-added classes are automatically filtered out from XPath generation

## Accessibility Features

The extension is designed with accessibility in mind:

- **Keyboard Navigation**: All functions can be accessed via keyboard
- **Focus Indicators**: Clear visual focus styles for interactive elements
- **Screen Reader Support**: Proper ARIA labels and roles for UI elements
- **Color Contrast**: High contrast colors for better readability
- **Responsive Design**: The interface adapts to different zoom levels
- **Print Styles**: Elements are hidden when printing the page

## XPath Examples

Here are some useful XPath examples to try in the manual query mode:

- `//div` - All div elements
- `//div[@id='content']` - Div with ID "content"
- `//a[@href]` - All links with href attribute
- `//button[contains(text(), 'Submit')]` - Buttons containing the text "Submit"
- `//input[@type='text']` - All text input fields
- `//*[contains(@class, 'menu')]` - Elements with class containing "menu"
- `//div[position() <= 3]` - First three div elements
- `//div[@data-testid='user-profile']` - Elements with specific test IDs
- `//div[.//span[@class='icon']]` - Divs containing spans with 'icon' class
- `//input[@required and @type='email']` - Required email inputs

## Technical Details

The extension consists of:

- **content.js**: Main script that runs on web pages, now with TypeScript-like type annotations
- **popup.html/js**: Enhanced user interface for the extension popup
- **styles.css**: CSS variables and improved styling for the overlay panels and highlighting
- **manifest.json**: Extension configuration with Manifest V3 compliance

The extension uses:

- **Content Security Policy**: Strict CSP for security
- **Modern JavaScript**: ES6+ features for better code organization
- **Optimized CSS**: Variables and efficient selectors
- **Error Handling**: Graceful error recovery
- **Performance Monitoring**: Limits to prevent slowdowns in large documents
- **State Management**: Central state object to avoid global variables
- **Class Exclusion**: Intelligently excludes extension-added classes from XPath queries

## Browser Compatibility

This extension is designed for Chromium-based browsers:

- Google Chrome (version 88+)
- Microsoft Edge (version 88+)
- Brave Browser (version 1.20+)
- Opera (version 74+)

## Troubleshooting

- **Extension not working on some sites**: Some websites use Content Security Policy (CSP) that may block the extension. Try on different websites.
- **XPath query not matching expected elements**: Verify your XPath syntax and check for dynamic IDs or classes that might change.
- **Panel disappears when clicking elsewhere**: This is by design for the hover mode. Use the manual query mode for persistent queries.
- **Performance issues on large pages**: When dealing with very large web pages, be more specific with your XPath queries to avoid searching the entire DOM.
- **Extension UI not visible**: Make sure you're not in an iframe or a special page like Chrome Web Store or Chrome Settings.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors and testers
- Inspired by the need for better XPath tools in web development and testing
- Special thanks to the open-source community for feedback and suggestions
