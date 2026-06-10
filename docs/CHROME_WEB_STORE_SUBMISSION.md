# Chrome Web Store Submission Notes

Use this as the working checklist for the Chrome Developer Dashboard.

## Recommendation: Publish the Source First

Open source is not required for Chrome Web Store approval, but it is useful here.

Benefits:

- Reviewers and users can inspect that the extension has no analytics, ads, tracking, or remote code.
- The public repository can be used as the Homepage URL and Support URL.
- The privacy policy can be hosted from the repository or GitHub Pages.
- Issues give users a clear support channel.

Recommended repository visibility: public.

Recommended license: MIT for a small utility extension, unless you want copyleft requirements. The final copyright holder name should be your name or organization.

## Product Details

### Category

Recommended: `Productivity`

Rationale: the extension improves a repeated browser workflow and does not fit shopping, communication, accessibility, or developer tooling as well.

### Language

Default listing language: `English`

Localized listing languages to add after upload:

- `Chinese (Taiwan)` / `zh_TW`
- `Chinese (China)` / `zh_CN`
- `Japanese` / `ja`
- `Korean` / `ko`

The extension package already includes these locales.

### Summary / Short Description

English:

```text
Drop selected text or URLs near the page edge to search or navigate while browser UI is hidden.
```

Traditional Chinese:

```text
瀏覽器 UI 隱藏時，把選取文字或 URL 拖到頁面邊緣即可搜尋或前往。
```

### Detailed Description

English:

```text
Vivaldi Drag Search adds a page-edge drop zone for users who browse with Vivaldi's UI Auto-hide mode or hidden toolbars.

Drag selected text, a link, or a plain URL to the configured edge of the page and drop it. URLs open directly. Other text searches with your browser's default search engine through the Chromium search API. Hold Ctrl, Shift, or Command while dropping to open in a new tab.

This is an independent extension and is not affiliated with Vivaldi Technologies.

Features:

- Search selected text without revealing the address bar.
- Open dragged URLs or links from the page edge.
- Use the browser's default search provider when supported.
- Configure top edge, bottom edge, or both.
- Choose whether searches and URLs open in the current tab or a new tab.
- No analytics, tracking, ads, or remote code.

Privacy summary:

This extension does not collect personal data. It only processes content you explicitly drop on the drop zone. Preferences are stored with chrome.storage.sync.
```

Traditional Chinese:

```text
Vivaldi 拖放搜尋為使用 Vivaldi UI Auto-hide 或隱藏工具列的使用者提供頁面邊緣拖放區。

把選取文字、連結或純文字 URL 拖到設定好的頁面邊緣並放開。URL 會直接開啟；其他文字會透過 Chromium 搜尋 API 使用瀏覽器預設搜尋引擎搜尋。拖放時按住 Ctrl、Shift 或 Command 可開在新分頁。

本擴充功能為獨立作品，並非 Vivaldi Technologies 官方產品或關聯產品。

功能：

- 不必叫出網址列，也能搜尋選取文字。
- 從頁面邊緣開啟拖曳的 URL 或連結。
- 支援瀏覽器預設搜尋引擎。
- 可設定上緣、下緣或上下緣。
- 可選擇搜尋與 URL 要開在目前分頁或新分頁。
- 無分析、追蹤、廣告或遠端程式碼。

隱私摘要：

本擴充功能不蒐集個人資料，只處理你明確拖放到拖放區的內容。偏好設定會儲存在 chrome.storage.sync。
```

### Graphic Assets

Use these generated drafts:

- Store icon: `icons/icon128.png`
- Small promo tile: `store-assets/promo-small-440x280.png`
- Screenshot: `store-assets/screenshot-en-1280x800.png`

Before final public launch, it is better to replace the screenshot with a real screenshot from the loaded extension in Vivaldi or Chrome.

### Additional URLs

Use these in the Chrome Web Store dashboard:

```text
Chrome Web Store URL: https://chromewebstore.google.com/detail/vivaldi-drag-search/fnmajmjfcnfojmmehjplmilbdcogohkc
Homepage URL: https://tokenyet.github.io/vivaldi-drag-search/
Support URL: https://github.com/Tokenyet/vivaldi-drag-search/issues
Privacy Policy URL: https://tokenyet.github.io/vivaldi-drag-search/privacy.html
```

## Privacy Practices

### Single Purpose Description

```text
Provide a page-edge drop zone that lets users search explicitly dropped text or open explicitly dropped URLs while browser toolbars or UI are hidden.
```

### Permission Justifications

`search`

```text
Used only when the user drops non-URL text on the extension drop zone. The extension sends that text to the browser's default search provider through the Chromium search API.
```

`storage`

```text
Stores user preferences such as drop-zone edge, search mode, fallback search URL, drop-zone size, and whether searches or URLs open in a new tab.
```

### Host / Site Access Justification

If the dashboard asks about site access or host permissions for `<all_urls>`, use:

```text
The extension injects a small drop zone into normal web pages so the user can drop selected text, links, or URLs at the page edge. This must work on any site where the user wants the workflow. The extension does not automatically collect page content, browsing history, or form data; it only processes content the user explicitly drops on the drop zone.
```

### Data Usage

Recommended answers:

- Collects personally identifiable information: `No`
- Collects health information: `No`
- Collects financial and payment information: `No`
- Collects authentication information: `No`
- Collects personal communications: `No`
- Collects location: `No`
- Collects web history: `No`
- Collects user activity: `No`
- Collects website content: `No`, because content is not collected automatically. If the dashboard treats explicitly dropped selected text as website content, disclose it narrowly as user-provided content used only to perform the requested search or navigation.

Certification text, if requested:

```text
The extension does not collect or transmit user data to the developer. Dropped text or URLs are processed only to perform the user-requested search or navigation. Searches use the browser default search provider through the Chromium search API, or the user-configured fallback search URL if needed. Preferences are stored with chrome.storage.sync.
```

## Distribution

Recommended first submission: `Unlisted`

Reason: unlisted still goes through review, but lets you test the approved package by URL before making the listing public.

After testing the approved item, switch to `Public`.
