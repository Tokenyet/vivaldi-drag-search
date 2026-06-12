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
Drop selected text or URLs near the page edge, then choose this tab, new tab, or hold Cancel.
```

Traditional Chinese:

```text
把選取文字或 URL 拖到頁面邊緣，再選擇此分頁、新分頁或停留取消。
```

Simplified Chinese:

```text
把选中文字或 URL 拖到页面边缘，再选择此标签页、新标签页或停留取消。
```

Japanese:

```text
選択テキストや URL をページ端へドロップし、このタブ、新しいタブ、またはキャンセル保持を選べます。
```

Korean:

```text
선택한 텍스트나 URL을 페이지 가장자리에 드롭한 뒤 현재 탭, 새 탭 또는 취소 유지를 선택합니다.
```

### Detailed Description

English:

```text
Vivaldi Drag Search adds a page-edge drop zone for users who browse with Vivaldi's UI Auto-hide mode or hidden toolbars.

Drag selected text, a link, or a plain URL to the configured edge of the page, then drop it on This tab or New tab. URLs open directly. Other text searches with your browser's default search engine through the Chromium search API. Hold Cancel for 1 second to hide the panel and continue the same drag into the page normally.

This is an independent extension and is not affiliated with Vivaldi Technologies.

Features:

- Search selected text without revealing the address bar.
- Open dragged URLs or links from the page edge.
- Use the browser's default search provider when supported.
- Configure top edge, bottom edge, or both.
- Choose this tab or a new tab for each drop.
- No analytics, tracking, ads, or remote code.

Privacy summary:

This extension does not collect personal data. It only processes content you explicitly drop on the drop zone. Preferences are stored with chrome.storage.sync.
```

Traditional Chinese:

```text
Vivaldi 拖放搜尋為使用 Vivaldi UI Auto-hide 或隱藏工具列的使用者提供頁面邊緣拖放區。

把選取文字、連結或純文字 URL 拖到設定好的頁面邊緣，再放到此分頁或新分頁。URL 會直接開啟；其他文字會透過 Chromium 搜尋 API 使用瀏覽器預設搜尋引擎搜尋。停留在取消 1 秒可隱藏面板，並繼續把同一次拖曳正常放到頁面中。

本擴充功能為獨立作品，並非 Vivaldi Technologies 官方產品或關聯產品。

功能：

- 不必叫出網址列，也能搜尋選取文字。
- 從頁面邊緣開啟拖曳的 URL 或連結。
- 支援瀏覽器預設搜尋引擎。
- 可設定上緣、下緣或上下緣。
- 每次拖放都可選擇目前分頁或新分頁。
- 無分析、追蹤、廣告或遠端程式碼。

隱私摘要：

本擴充功能不蒐集個人資料，只處理你明確拖放到拖放區的內容。偏好設定會儲存在 chrome.storage.sync。
```

Simplified Chinese:

```text
Vivaldi 拖放搜索为使用 Vivaldi UI Auto-hide 或隐藏工具栏的用户提供页面边缘拖放区。

把选中文字、链接或纯文本 URL 拖到设置好的页面边缘，再放到此标签页或新标签页。URL 会直接打开；其他文字会通过 Chromium 搜索 API 使用浏览器默认搜索引擎搜索。停留在取消 1 秒可隐藏面板，并继续把同一次拖拽正常放到页面中。

本扩展程序为独立作品，并非 Vivaldi Technologies 官方产品或关联产品。

功能：

- 不必显示地址栏，也能搜索选中文字。
- 从页面边缘打开拖拽的 URL 或链接。
- 支持浏览器默认搜索引擎。
- 可设置上边缘、下边缘或上下边缘。
- 每次拖放都可选择当前标签页或新标签页。
- 无分析、跟踪、广告或远程代码。

隐私摘要：

本扩展程序不收集个人数据，只处理你明确拖放到拖放区的内容。偏好设置会储存在 chrome.storage.sync。
```

Japanese:

```text
Vivaldi Drag Search は、Vivaldi の UI Auto-hide モードやツールバー非表示で閲覧するユーザー向けに、ページ端のドロップ領域を追加します。

選択テキスト、リンク、またはプレーンテキストの URL を設定したページ端へドラッグし、このタブまたは新しいタブにドロップします。URL は直接開きます。それ以外のテキストは Chromium 検索 API を通じてブラウザの既定検索エンジンで検索します。キャンセル上で 1 秒保持するとパネルが隠れ、そのまま同じドラッグをページへ通常どおりドロップできます。

この拡張機能は独立した作品であり、Vivaldi Technologies とは提携していません。

機能:

- アドレスバーを表示せずに選択テキストを検索。
- ページ端からドラッグした URL やリンクを開く。
- 対応環境ではブラウザの既定検索プロバイダーを使用。
- 上端、下端、または上下両方を設定可能。
- ドロップごとにこのタブまたは新しいタブを選択。
- 分析、追跡、広告、リモートコードなし。

プライバシー概要:

この拡張機能は個人データを収集しません。ユーザーが明示的にドロップ領域へドロップした内容だけを処理します。設定は chrome.storage.sync に保存されます。
```

Korean:

```text
Vivaldi Drag Search는 Vivaldi UI Auto-hide 모드 또는 숨겨진 도구 모음으로 탐색하는 사용자를 위해 페이지 가장자리 드롭 영역을 추가합니다.

선택한 텍스트, 링크 또는 일반 텍스트 URL을 설정한 페이지 가장자리로 드래그한 뒤 현재 탭 또는 새 탭에 드롭합니다. URL은 바로 열리고, 다른 텍스트는 Chromium 검색 API를 통해 브라우저 기본 검색 엔진으로 검색합니다. 취소 위에 1초간 머무르면 패널이 숨겨지고 같은 드래그를 페이지에 정상적으로 이어서 드롭할 수 있습니다.

이 확장 프로그램은 독립적으로 제작되었으며 Vivaldi Technologies와 관련이 없습니다.

기능:

- 주소 표시줄을 표시하지 않고 선택한 텍스트 검색.
- 페이지 가장자리에서 드래그한 URL 또는 링크 열기.
- 지원되는 환경에서 브라우저 기본 검색 공급자 사용.
- 위쪽 가장자리, 아래쪽 가장자리 또는 둘 다 설정.
- 드롭할 때마다 현재 탭 또는 새 탭 선택.
- 분석, 추적, 광고 또는 원격 코드 없음.

개인정보 요약:

이 확장 프로그램은 개인 데이터를 수집하지 않습니다. 사용자가 드롭 영역에 명시적으로 드롭한 내용만 처리합니다. 환경설정은 chrome.storage.sync에 저장됩니다.
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
Stores user preferences such as drop-zone edge, search mode, fallback search URL, and drop-zone size.
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
