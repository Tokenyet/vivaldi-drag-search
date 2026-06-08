(() => {
  if (window.top !== window.self) {
    return;
  }

  const DEFAULT_SETTINGS = {
    searchMode: "browser",
    searchTemplate: "https://www.google.com/search?q=%s",
    dropEdge: "top",
    openSearchInNewTab: false,
    openUrlInNewTab: false,
    revealEdgePx: 120,
    targetHeightPx: 96
  };

  const ROOT_ID = "vivaldi-drag-search-root";
  const ACTIVE_CLASS = "is-active";
  const BOTTOM_CLASS = "is-bottom";
  const MESSAGE_TIMEOUT_MS = 1400;
  const HIDE_DELAY_MS = 180;

  let settings = { ...DEFAULT_SETTINGS };
  let host = null;
  let shadow = null;
  let panel = null;
  let title = null;
  let subtitle = null;
  let hideTimer = 0;
  let messageTimer = 0;
  let activeEdge = null;

  init();

  async function init() {
    settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "sync") {
        return;
      }

      for (const [key, change] of Object.entries(changes)) {
        settings[key] = change.newValue;
      }
      applySettings();
    });

    window.addEventListener("dragenter", onDragMove, true);
    window.addEventListener("dragover", onDragMove, true);
    window.addEventListener("drop", onDrop, true);
    window.addEventListener("dragleave", onDragLeave, true);
    window.addEventListener("dragend", hideOverlay, true);
    window.addEventListener("blur", hideOverlay, true);
  }

  function ensureOverlay() {
    if (host) {
      return;
    }

    host = document.createElement("div");
    host.id = ROOT_ID;
    host.setAttribute("aria-hidden", "true");
    shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          color-scheme: light dark;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          pointer-events: none;
          position: fixed;
          inset: 0;
          z-index: 2147483647;
        }

        .panel {
          align-items: center;
          background: color-mix(in srgb, Canvas 90%, #1f6f78 10%);
          border: 1px solid color-mix(in srgb, CanvasText 16%, transparent);
          border-radius: 0 0 8px 8px;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
          box-sizing: border-box;
          color: CanvasText;
          display: flex;
          gap: 14px;
          height: var(--target-height, 96px);
          justify-content: center;
          left: 12px;
          opacity: 0;
          padding: 14px 18px;
          pointer-events: none;
          position: fixed;
          right: 12px;
          top: 0;
          transform: translateY(-16px);
          transition: opacity 120ms ease, transform 120ms ease;
        }

        .panel.is-bottom {
          border-radius: 8px 8px 0 0;
          bottom: 0;
          top: auto;
          transform: translateY(16px);
        }

        .panel.is-active {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }

        .icon {
          align-items: center;
          background: #1f6f78;
          border-radius: 8px;
          color: white;
          display: flex;
          flex: 0 0 auto;
          font-size: 24px;
          font-weight: 700;
          height: 48px;
          justify-content: center;
          line-height: 1;
          width: 48px;
        }

        .copy {
          display: grid;
          gap: 4px;
          min-width: 0;
        }

        .title {
          font-size: 17px;
          font-weight: 650;
          line-height: 1.25;
          overflow-wrap: anywhere;
        }

        .subtitle {
          color: color-mix(in srgb, CanvasText 72%, transparent);
          font-size: 13px;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        @media (max-width: 520px) {
          .panel {
            gap: 10px;
            left: 8px;
            padding: 12px;
            right: 8px;
          }

          .icon {
            height: 40px;
            width: 40px;
          }

          .title {
            font-size: 15px;
          }

          .subtitle {
            font-size: 12px;
          }
        }
      </style>
      <div class="panel" part="panel">
        <div class="icon" aria-hidden="true">V</div>
        <div class="copy">
          <div class="title"></div>
          <div class="subtitle"></div>
        </div>
      </div>
    `;

    panel = shadow.querySelector(".panel");
    title = shadow.querySelector(".title");
    subtitle = shadow.querySelector(".subtitle");

    panel.addEventListener("dragover", (event) => {
      if (!hasUsefulDragData(event.dataTransfer)) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    });

    panel.addEventListener("drop", onDrop, true);

    appendHost();
    applySettings();
    showDefaultText();
  }

  function appendHost() {
    const parent = document.documentElement || document.head || document.body;
    if (parent && !host.isConnected) {
      parent.appendChild(host);
    }
  }

  function applySettings() {
    if (!panel) {
      return;
    }

    panel.style.setProperty("--target-height", `${clampNumber(settings.targetHeightPx, 64, 180)}px`);
    panel.classList.toggle(BOTTOM_CLASS, activeEdge === "bottom");
  }

  function onDragMove(event) {
    if (!hasUsefulDragData(event.dataTransfer)) {
      return;
    }

    const edge = getPointerEdge(event);
    if (!edge) {
      scheduleHide();
      return;
    }

    ensureOverlay();
    activeEdge = edge;
    applySettings();
    showDefaultText();
    showOverlay();
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function onDrop(event) {
    if (!activeEdge || !isInsideDropTarget(event)) {
      hideOverlay();
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const payload = extractDropPayload(event.dataTransfer);
    if (!payload.text) {
      showMessage(
        getMessage("unableReadTitle", "Unable to read dropped content"),
        getMessage("unableReadSubtitle", "Drag selected text, a link, or a plain URL.")
      );
      return;
    }

    const forceNewTab = event.ctrlKey || event.metaKey || event.shiftKey;
    chrome.runtime.sendMessage(
      {
        type: "vivaldi-drag-search:open",
        text: payload.text,
        preferUrl: payload.preferUrl,
        forceNewTab
      },
      (response) => {
        if (chrome.runtime.lastError) {
          showMessage(getMessage("extensionErrorTitle", "Extension error"), chrome.runtime.lastError.message);
          return;
        }

        if (!response?.ok) {
          showMessage(
            getMessage("unableOpenTitle", "Unable to open"),
            response?.error || getMessage("unknownError", "Unknown error")
          );
          return;
        }

        hideOverlay();
      }
    );
  }

  function onDragLeave(event) {
    if (!activeEdge) {
      return;
    }

    if (event.clientX <= 0 || event.clientY <= 0 || event.clientX >= window.innerWidth || event.clientY >= window.innerHeight) {
      scheduleHide();
    }
  }

  function showOverlay() {
    clearTimeout(hideTimer);
    appendHost();
    panel.classList.add(ACTIVE_CLASS);
  }

  function hideOverlay() {
    clearTimeout(hideTimer);
    clearTimeout(messageTimer);
    activeEdge = null;
    if (panel) {
      panel.classList.remove(ACTIVE_CLASS);
    }
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      if (!activeEdge) {
        return;
      }
      hideOverlay();
    }, HIDE_DELAY_MS);
  }

  function showDefaultText() {
    if (!title || !subtitle) {
      return;
    }
    title.textContent = getMessage("overlayTitle", "Drop to search or open URL");
    subtitle.textContent = getMessage(
      "overlaySubtitle",
      "URLs open directly. Other text searches with your browser's default search engine. Hold Ctrl, Shift, or Command to open a new tab."
    );
  }

  function showMessage(nextTitle, nextSubtitle) {
    ensureOverlay();
    title.textContent = nextTitle;
    subtitle.textContent = nextSubtitle;
    showOverlay();
    clearTimeout(messageTimer);
    messageTimer = window.setTimeout(hideOverlay, MESSAGE_TIMEOUT_MS);
  }

  function getPointerEdge(event) {
    const revealEdgePx = clampNumber(settings.revealEdgePx, 24, 320);
    const dropEdge = settings.dropEdge || "top";

    if ((dropEdge === "top" || dropEdge === "both") && event.clientY <= revealEdgePx) {
      return "top";
    }

    if ((dropEdge === "bottom" || dropEdge === "both") && window.innerHeight - event.clientY <= revealEdgePx) {
      return "bottom";
    }

    return null;
  }

  function isInsideDropTarget(event) {
    const targetHeightPx = clampNumber(settings.targetHeightPx, 64, 180);
    if (activeEdge === "top") {
      return event.clientY <= targetHeightPx + 16;
    }
    if (activeEdge === "bottom") {
      return window.innerHeight - event.clientY <= targetHeightPx + 16;
    }
    return false;
  }

  function hasUsefulDragData(dataTransfer) {
    if (!dataTransfer) {
      return false;
    }

    const types = Array.from(dataTransfer.types || []);
    if (types.length === 0) {
      return false;
    }

    return types.some((type) => {
      const normalized = String(type).toLowerCase();
      return normalized === "text/plain" ||
        normalized === "text/uri-list" ||
        normalized === "text/html" ||
        normalized === "url" ||
        normalized === "text/x-moz-url";
    });
  }

  function extractDropPayload(dataTransfer) {
    const uriList = dataTransfer.getData("text/uri-list");
    const uri = firstUriFromList(uriList);
    if (uri) {
      return { text: uri, preferUrl: true };
    }

    const plainText = dataTransfer.getData("text/plain") || dataTransfer.getData("text") || "";
    if (plainText.trim()) {
      return { text: plainText.trim(), preferUrl: false };
    }

    const html = dataTransfer.getData("text/html");
    const href = firstHrefFromHtml(html);
    if (href) {
      return { text: href, preferUrl: true };
    }

    return { text: "", preferUrl: false };
  }

  function firstUriFromList(uriList) {
    return String(uriList || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith("#")) || "";
  }

  function firstHrefFromHtml(html) {
    if (!html) {
      return "";
    }

    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return doc.querySelector("a[href]")?.href || "";
    } catch {
      return "";
    }
  }

  function clampNumber(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return min;
    }
    return Math.min(max, Math.max(min, Math.round(number)));
  }

  function getMessage(key, fallback) {
    try {
      return chrome.i18n.getMessage(key) || fallback;
    } catch {
      return fallback;
    }
  }
})();
