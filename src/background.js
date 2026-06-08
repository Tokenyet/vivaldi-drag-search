const DEFAULT_SETTINGS = {
  searchMode: "browser",
  searchTemplate: "https://www.google.com/search?q=%s",
  dropEdge: "top",
  openSearchInNewTab: false,
  openUrlInNewTab: false,
  revealEdgePx: 120,
  targetHeightPx: 96
};

const SAFE_NAVIGATION_PROTOCOLS = new Set(["http:", "https:"]);

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  await chrome.storage.sync.set({ ...DEFAULT_SETTINGS, ...existing });
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then((response) => sendResponse(response))
    .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
  return true;
});

async function handleMessage(message, sender) {
  if (!message || message.type !== "vivaldi-drag-search:open") {
    return { ok: false, error: "Unknown message." };
  }

  const rawText = normalizeDroppedText(message.text);
  if (!rawText) {
    return { ok: false, error: "No text was dropped." };
  }

  const settings = await getSettings();
  const url = parseNavigableUrl(rawText, Boolean(message.preferUrl));
  const tabId = sender.tab?.id;

  if (url) {
    await openUrl(url.href, Boolean(message.forceNewTab || settings.openUrlInNewTab), tabId);
    return { ok: true, action: "navigate", url: url.href };
  }

  await searchText(rawText, Boolean(message.forceNewTab || settings.openSearchInNewTab), tabId, settings);
  return { ok: true, action: "search", text: rawText };
}

async function getSettings() {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...settings };
}

function normalizeDroppedText(value) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .trim();
}

function parseNavigableUrl(value, preferUrl) {
  const text = value
    .trim()
    .replace(/^<(.+)>$/, "$1")
    .replace(/^["'](.+)["']$/, "$1")
    .trim();

  if (!text || /\s/.test(text)) {
    return null;
  }

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : inferHttpUrl(text, preferUrl);
  if (!withScheme) {
    return null;
  }

  try {
    const url = new URL(withScheme);
    if (!SAFE_NAVIGATION_PROTOCOLS.has(url.protocol)) {
      return null;
    }
    if (!url.hostname) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function inferHttpUrl(text, preferUrl) {
  const domainPattern = /^(?:localhost(?::\d+)?|(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,})(?:[/:?#][^\s]*)?$/i;
  if (!preferUrl && !domainPattern.test(text)) {
    return null;
  }
  if (domainPattern.test(text)) {
    return `https://${text}`;
  }
  return null;
}

async function searchText(text, forceNewTab, tabId, settings) {
  if (settings.searchMode === "browser" && chrome.search?.query) {
    try {
      if (forceNewTab) {
        await chrome.search.query({ text, disposition: "NEW_TAB" });
      } else if (Number.isInteger(tabId)) {
        await chrome.search.query({ text, tabId });
      } else {
        await chrome.search.query({ text, disposition: "CURRENT_TAB" });
      }
      return;
    } catch {
      // Fall back to the configured template on browsers that expose but do not support chrome.search.
    }
  }

  await openUrl(buildSearchUrl(settings.searchTemplate, text), forceNewTab, tabId);
}

function buildSearchUrl(template, text) {
  const safeTemplate = String(template || DEFAULT_SETTINGS.searchTemplate).trim();
  const encoded = encodeURIComponent(text);

  if (safeTemplate.includes("%s")) {
    return safeTemplate.replaceAll("%s", encoded);
  }

  const separator = safeTemplate.includes("?") ? "&" : "?";
  return `${safeTemplate}${separator}q=${encoded}`;
}

async function openUrl(url, forceNewTab, tabId) {
  if (forceNewTab || !Number.isInteger(tabId)) {
    await chrome.tabs.create({ url, active: true });
    return;
  }

  await chrome.tabs.update(tabId, { url });
}
