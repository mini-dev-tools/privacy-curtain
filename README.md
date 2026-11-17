# Privacy Curtain

Browser extension that blurs sensitive content (chat lists, messages, profile pictures and inbox rows) so people looking at your screen, or watching your screen share, can't read it. Hover over blurred content to reveal it.

**[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/pocmiegpbbfiaeioclojcmodigngobhe)**

## Supported sites

- WhatsApp Web (`web.whatsapp.com`)
- Gmail (`mail.google.com`)
- Outlook (`outlook.live.com`, `outlook.office.com`, `outlook.office365.com`, `outlook.cloud.microsoft`)
- Teams (`teams.microsoft.com`, `teams.live.com`, `teams.cloud.microsoft`)

## Privacy

Privacy Curtain collects no data and makes no network requests. It only adds CSS that blurs content on the sites above, and your settings stay in your browser's extension storage. See [PRIVACY.md](PRIVACY.md).

The source code is public so anyone can verify this.

## Build

Node runs in Docker only:

    docker compose run --rm app npm ci
    docker compose run --rm app npm run build

The extension is built into `dist/`.

## Install a local build

**Chrome / Edge**
1. Open `chrome://extensions` (or `edge://extensions`) and enable Developer mode.
2. Click "Load unpacked" and select the `dist/` folder.

**Firefox**
1. After building: `cp dist/manifest_v2.json dist/manifest.json`
2. Open `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and pick `dist/manifest.json`.

## Usage

Click the toolbar icon and switch on the blur options for each platform. Settings are saved and applied right away to open tabs.

Tabs that were already open before you installed the extension need a reload once.

## Layout

- `src/` – React popup (`App.jsx`, `popup.css`)
- `public/content.js` – content script that applies the blur
- `public/manifest.json` (MV3, Chrome) / `public/manifest_v2.json` (MV2, Firefox)
- `test/fixtures/` – sample pages for checking the blur selectors

## Feedback

Bug reports and suggestions are welcome in [Issues](https://github.com/mini-dev-tools/privacy-curtain/issues).

## License

Copyright (c) 2026 Mini Dev Tools. Licensed under the [PolyForm Strict License 1.0.0](LICENSE).

This is **source-available**, not open source. You may read, audit and run the code for personal or other noncommercial purposes. You may **not** modify it, redistribute it, publish derivative works, or use it commercially without written permission from Mini Dev Tools.

For permission requests, contact support@minidevtools.com.
