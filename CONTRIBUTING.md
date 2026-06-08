# Contributing

Thanks for considering a contribution to Vivaldi Drag Search.

## Development

1. Clone the repository.
2. Open `vivaldi://extensions` or `chrome://extensions`.
3. Enable Developer mode.
4. Click `Load unpacked`.
5. Select the repository folder.

After editing source files, click Reload on the extension card and refresh any existing web pages you want to test.

## Packaging

Run:

```powershell
.\scripts\package.ps1
.\scripts\generate-store-assets.ps1
```

The upload ZIP is written to `dist\`. Store listing image drafts are written to `store-assets\`.

## Pull Requests

- Keep the extension single-purpose: page-edge drag/drop search and URL navigation.
- Do not add analytics, tracking, ads, or remote code.
- Keep permissions narrow and justified.
- Add or update localization strings for every user-visible string.
