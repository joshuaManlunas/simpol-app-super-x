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
- **Draggable Interface**: Move the query panel anywhere on the page
- **Resizable Panel**: Adjust the size of the query panel to your needs

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

## Usage

### Hover Mode

1. Navigate to any webpage
2. Hold the `Shift` key
3. Move your cursor over elements on the page
4. The element under your cursor will be highlighted with an orange outline
5. An overlay panel will appear showing both full and optimized XPath queries
6. Click the "Copy" button to copy the XPath to your clipboard
7. Release the `Shift` key to exit hover mode

![Hover Mode](screenshots/hover-mode.png)

### Manual Query Mode

1. Click the XPath Query Generator icon in your browser toolbar
2. Click the "Open XPath Query Panel" button
3. A fixed panel will appear on the page
4. Type your XPath query in the input field
5. Matching elements will be highlighted in blue as you type
6. The panel will show the number of matching elements
7. You can drag the panel by its header to reposition it
8. Resize the panel by dragging the bottom-right corner
9. Click the "×" button to close the panel

![Manual Query Mode](screenshots/manual-mode.png)

## XPath Examples

Here are some useful XPath examples to try in the manual query mode:

- `//div` - All div elements
- `//div[@id='content']` - Div with ID "content"
- `//a[@href]` - All links with href attribute
- `//button[contains(text(), 'Submit')]` - Buttons containing the text "Submit"
- `//input[@type='text']` - All text input fields
- `//*[contains(@class, 'menu')]` - Elements with class containing "menu"
- `//div[position() <= 3]` - First three div elements

## Technical Details

The extension consists of:

- **content.js**: Main script that runs on web pages
- **popup.html/js**: User interface for the extension popup
- **styles.css**: Styling for the overlay panels and highlighting
- **manifest.json**: Extension configuration

The extension uses the browser's built-in XPath evaluation capabilities through `document.evaluate()`.

## Troubleshooting

- **Extension not working on some sites**: Some websites use Content Security Policy (CSP) that may block the extension. Try on different websites.
- **XPath query not matching expected elements**: Verify your XPath syntax and check for dynamic IDs or classes that might change.
- **Panel disappears when clicking elsewhere**: This is by design for the hover mode. Use the manual query mode for persistent queries.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors and testers
- Inspired by the need for better XPath tools in web development and testing
