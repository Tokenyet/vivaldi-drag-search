# Vivaldi Drag Search

A small Manifest V3 extension for Vivaldi's UI Auto-hide mode. Drag selected text, a link, or a plain URL to the page edge, then drop it to search or navigate without revealing the address bar.

The extension is localized for English, Traditional Chinese, Simplified Chinese, Japanese, and Korean.

Official site: https://tokenyet.github.io/vivaldi-drag-search/

Chrome Web Store: https://chromewebstore.google.com/detail/vivaldi-drag-search/fnmajmjfcnfojmmehjplmilbdcogohkc

## Install locally in Vivaldi

1. Open `vivaldi://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select this folder: `D:\Project\vivaldi_extension`.

## Use

- Drag selected text to the configured page edge and drop it to search.
- Drag a URL or link to the configured page edge and drop it to navigate.
- Hold `Ctrl`, `Shift`, or `Command` while dropping to open in a new tab.
- Click the extension action and open options to choose the top edge, bottom edge, or both.

The extension first tries the Chromium `chrome.search` API, so searches should use your browser's default search provider. If that API is unavailable in Vivaldi, it falls back to the configured search URL template.

## Limitations

- Browser internal pages such as `vivaldi://`, `chrome://`, and the Chrome Web Store do not allow normal content scripts.
- The extension only navigates to `http` and `https` URLs. Other schemes are treated as search text.
- File pages need Vivaldi's `Allow access to file URLs` extension setting before content scripts can run there.

## Package for Chrome Web Store

Run:

```powershell
.\scripts\package.ps1
.\scripts\generate-store-assets.ps1
```

The upload ZIP is created in `dist\`. Store listing image drafts are created in `store-assets\`.

Chrome Web Store submission still requires a Chrome Web Store developer account, screenshots or promotional images uploaded through the dashboard, privacy declarations, and Google review.

Useful submission drafts are in [docs/CHROME_WEB_STORE_SUBMISSION.md](docs/CHROME_WEB_STORE_SUBMISSION.md).

## Privacy

See [docs/PRIVACY.md](docs/PRIVACY.md).

## License

MIT. See [LICENSE](LICENSE).
