# Privacy Tools Browser Extension

A browser extension that enhances privacy and security while browsing WhatsApp Web.

## Features

- **Auto-blur sensitive content**: Automatically blurs chat messages and media to protect privacy when others might see your screen
- **Quick toggle controls**: Easily enable/disable privacy features with a single click
- **Lightweight and fast**: Minimal impact on browser performance

## Installation

1. Clone this repository
2. Open your browser's extension management page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Firefox: `about:addons`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the project directory

## Usage

1. Click the extension icon in your browser toolbar
2. Toggle the "Enable Privacy Mode" switch to activate/deactivate features
3. Visit WhatsApp Web - content will be automatically blurred when privacy mode is enabled

## Files

- `manifest.json` - Extension configuration
- `popup.js` - Extension popup logic
- `content.js` - Content script for WhatsApp Web integration
- `background.js` - Background service worker
- `index.html` - Extension popup UI
- `styles.css` - Styling for the popup

## Development

To modify the extension:
1. Make your changes to the source files
2. Reload the extension in your browser's extension management page
3. Test the changes on WhatsApp Web

## License

This project is open source and available under the MIT License.