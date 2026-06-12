(() => {
  if (window.top !== window.self) {
    return;
  }

  const DEFAULT_SETTINGS = {
    searchMode: "browser",
    searchTemplate: "https://www.google.com/search?q=%s",
    dropEdge: "top",
    revealEdgePx: 120,
    targetHeightPx: 96
  };

  const ROOT_ID = "vivaldi-drag-search-root";
  const ACTIVE_CLASS = "is-active";
  const BOTTOM_CLASS = "is-bottom";
  const MESSAGE_CLASS = "has-message";
  const ACTION_HOVER_CLASS = "is-hovered";
  const MESSAGE_TIMEOUT_MS = 1400;
  const HIDE_DELAY_MS = 180;
  const CANCEL_DWELL_MS = 1000;

  let settings = { ...DEFAULT_SETTINGS };
  let host = null;
  let shadow = null;
  let panel = null;
  let title = null;
  let subtitle = null;
  let actionTargets = [];
  let hideTimer = 0;
  let messageTimer = 0;
  let cancelDwellTimer = 0;
  let cancelProgressFrame = 0;
  let cancelDwellStartedAt = 0;
  let activeEdge = null;
  let suppressOverlayForDrag = false;

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

    window.addEventListener("dragstart", endDragSession, true);
    window.addEventListener("dragenter", onDragMove, true);
    window.addEventListener("dragover", onDragMove, true);
    window.addEventListener("drop", onDrop, true);
    window.addEventListener("dragleave", onDragLeave, true);
    window.addEventListener("dragend", onDragEnd, true);
    window.addEventListener("blur", onDragEnd, true);
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
          align-items: stretch;
          background: color-mix(in srgb, Canvas 90%, #1f6f78 10%);
          border: 1px solid color-mix(in srgb, CanvasText 16%, transparent);
          border-radius: 0 0 8px 8px;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
          box-sizing: border-box;
          color: CanvasText;
          display: grid;
          gap: 6px;
          grid-template-columns: minmax(0, 1fr);
          left: 12px;
          min-height: max(var(--target-height, 96px), 154px);
          opacity: 0;
          padding: 10px 14px;
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
          pointer-events: none;
          transform: translateY(0);
        }

        .panel.has-message {
          align-items: center;
        }

        .panel.has-message .actions {
          display: none;
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
          gap: 2px;
          justify-items: center;
          min-width: 0;
          pointer-events: none;
          text-align: center;
        }

        .title {
          display: none;
          font-size: 17px;
          font-weight: 650;
          line-height: 1.25;
          overflow-wrap: anywhere;
        }

        .panel.has-message .title {
          display: block;
        }

        .subtitle {
          color: color-mix(in srgb, CanvasText 72%, transparent);
          font-size: 11px;
          line-height: 1.25;
          overflow-wrap: anywhere;
        }

        .panel.has-message .subtitle {
          font-size: 13px;
          line-height: 1.35;
        }

        .actions {
          display: grid;
          gap: 10px;
          grid-column: 1 / -1;
          grid-template-areas:
            "cancel cancel"
            "new current";
          grid-template-columns: repeat(2, minmax(0, 1fr));
          pointer-events: none;
        }

        .drop-action {
          align-content: center;
          background: color-mix(in srgb, Canvas 82%, CanvasText 8%);
          border: 1px solid color-mix(in srgb, CanvasText 18%, transparent);
          border-radius: 6px;
          box-sizing: border-box;
          color: CanvasText;
          display: grid;
          font: inherit;
          gap: 2px;
          justify-items: center;
          min-height: 74px;
          min-width: 0;
          overflow: hidden;
          padding: 12px 14px;
          pointer-events: none;
          position: relative;
          text-align: center;
        }

        .drop-action > * {
          position: relative;
          z-index: 1;
        }

        .drop-action.is-cancel {
          background: color-mix(in srgb, Canvas 88%, CanvasText 5%);
          gap: 8px;
          grid-area: cancel;
          grid-auto-flow: column;
          justify-content: center;
          min-height: 34px;
          padding: 6px 12px;
          --cancel-progress: 0;
        }

        .drop-action[data-open-mode="new"] {
          grid-area: new;
        }

        .drop-action[data-open-mode="current"] {
          grid-area: current;
        }

        .drop-action.is-cancel::before {
          background: conic-gradient(from -90deg, #d95550 calc(var(--cancel-progress, 0) * 1%), transparent 0);
          border-radius: inherit;
          content: "";
          inset: -1px;
          opacity: 0;
          padding: 3px;
          pointer-events: none;
          position: absolute;
          transition: opacity 80ms ease;
          z-index: 0;
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .drop-action.is-hovered {
          background: color-mix(in srgb, #1f6f78 18%, Canvas);
          border-color: #1f6f78;
          box-shadow: inset 0 0 0 1px #1f6f78;
        }

        .drop-action.is-cancel.is-hovered {
          background: color-mix(in srgb, #d95550 13%, Canvas);
          border-color: #d95550;
          box-shadow: inset 0 0 0 1px #d95550;
        }

        .drop-action.is-cancel.is-hovered::before {
          opacity: 1;
        }

        .action-label {
          font-size: 18px;
          font-weight: 700;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .drop-action.is-cancel .action-label {
          font-size: 14px;
        }

        .action-hint {
          color: color-mix(in srgb, CanvasText 68%, transparent);
          font-size: 11px;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .drop-action.is-cancel .action-hint {
          font-size: 10px;
        }

        @media (max-width: 700px) {
          .panel {
            gap: 10px;
            left: 8px;
            padding: 12px;
            right: 8px;
          }

          .actions {
            gap: 8px;
          }

          .drop-action {
            min-height: 74px;
            padding: 9px 8px;
          }

          .drop-action.is-cancel {
            min-height: 32px;
            padding: 5px 8px;
          }

          .action-label {
            font-size: 14px;
          }

          .action-hint {
            font-size: 10px;
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
        <div class="actions" aria-hidden="true">
          <div class="drop-action is-cancel" data-open-mode="cancel">
            <div class="action-label"></div>
            <div class="action-hint"></div>
          </div>
          <div class="drop-action" data-open-mode="new">
            <div class="action-label"></div>
            <div class="action-hint"></div>
          </div>
          <div class="drop-action" data-open-mode="current">
            <div class="action-label"></div>
            <div class="action-hint"></div>
          </div>
        </div>
        <div class="copy">
          <div class="title"></div>
          <div class="subtitle"></div>
        </div>
      </div>
    `;

    panel = shadow.querySelector(".panel");
    title = shadow.querySelector(".title");
    subtitle = shadow.querySelector(".subtitle");
    actionTargets = Array.from(shadow.querySelectorAll(".drop-action"));

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

  function detachHost() {
    if (host?.isConnected) {
      host.remove();
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

    if (suppressOverlayForDrag) {
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
    const openMode = updateHoveredAction(event);
    if (isExtensionOpenMode(openMode)) {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "copy";
    }
  }

  function onDrop(event) {
    if (suppressOverlayForDrag) {
      cleanupAfterNativeDrop();
      return;
    }

    if (!activeEdge) {
      return;
    }

    const openMode = getDropOpenMode(event);
    if (!isExtensionOpenMode(openMode)) {
      cleanupAfterNativeDrop();
      return;
    }

    endDragSession();
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
        forceNewTab,
        openMode
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

  function onDragEnd() {
    endDragSession();
    hideOverlay();
  }

  function endDragSession() {
    suppressOverlayForDrag = false;
    stopCancelDwell();
  }

  function cleanupAfterNativeDrop() {
    window.setTimeout(() => {
      endDragSession();
      hideOverlay();
    }, 0);
  }

  function showOverlay() {
    clearTimeout(hideTimer);
    appendHost();
    panel.classList.add(ACTIVE_CLASS);
  }

  function hideOverlay() {
    clearTimeout(hideTimer);
    clearTimeout(messageTimer);
    stopCancelDwell();
    activeEdge = null;
    clearHoveredAction();
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
    panel.classList.remove(MESSAGE_CLASS);
    title.textContent = getMessage("overlayTitle", "Choose where to open");
    subtitle.textContent = getMessage(
      "overlaySubtitle",
      "Hold Cancel to hide this panel, then drop anywhere normally."
    );
    setActionText("new", getMessage("openNewTabAction", "New tab"), getMessage("openNewTabHint", "Keep page"));
    setActionText("current", getMessage("openCurrentTabAction", "This tab"), getMessage("openCurrentTabHint", "Replace page"));
    setActionText("cancel", getMessage("cancelAction", "Cancel"), getMessage("cancelHint", "Hold 1s"));
  }

  function showMessage(nextTitle, nextSubtitle) {
    ensureOverlay();
    panel.classList.add(MESSAGE_CLASS);
    title.textContent = nextTitle;
    subtitle.textContent = nextSubtitle;
    showOverlay();
    clearTimeout(messageTimer);
    messageTimer = window.setTimeout(hideOverlay, MESSAGE_TIMEOUT_MS);
  }

  function setActionText(openMode, label, hint) {
    const action = actionTargets.find((target) => target.dataset.openMode === openMode);
    if (!action) {
      return;
    }

    action.querySelector(".action-label").textContent = label;
    action.querySelector(".action-hint").textContent = hint;
  }

  function getDropOpenMode(event) {
    const action = getDropAction(event);
    if (!action) {
      return "";
    }
    return action.dataset.openMode || "";
  }

  function getDropAction(event) {
    if (!panel?.classList.contains(ACTIVE_CLASS)) {
      return null;
    }

    for (const action of actionTargets) {
      const rect = action.getBoundingClientRect();
      if (event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom) {
        return action;
      }
    }

    return null;
  }

  function isExtensionOpenMode(openMode) {
    return openMode === "current" || openMode === "new";
  }

  function updateHoveredAction(event) {
    const openMode = getDropOpenMode(event);
    for (const action of actionTargets) {
      action.classList.toggle(ACTION_HOVER_CLASS, Boolean(openMode) && action.dataset.openMode === openMode);
    }

    if (openMode === "cancel") {
      startCancelDwell();
    } else {
      stopCancelDwell();
    }

    return openMode;
  }

  function clearHoveredAction() {
    for (const action of actionTargets) {
      action.classList.remove(ACTION_HOVER_CLASS);
    }
    stopCancelDwell();
  }

  function startCancelDwell() {
    if (cancelDwellTimer) {
      return;
    }

    cancelDwellStartedAt = performance.now();
    setCancelProgress(0);
    cancelProgressFrame = window.requestAnimationFrame(updateCancelProgress);
    cancelDwellTimer = window.setTimeout(() => {
      cancelDwellTimer = 0;
      suppressOverlayForDrag = true;
      hideOverlay();
      detachHost();
    }, CANCEL_DWELL_MS);
  }

  function stopCancelDwell() {
    if (cancelDwellTimer) {
      clearTimeout(cancelDwellTimer);
      cancelDwellTimer = 0;
    }

    if (cancelProgressFrame) {
      window.cancelAnimationFrame(cancelProgressFrame);
      cancelProgressFrame = 0;
    }

    cancelDwellStartedAt = 0;
    setCancelProgress(0);
  }

  function updateCancelProgress(now) {
    if (!cancelDwellStartedAt) {
      return;
    }

    const progress = Math.min(100, ((now - cancelDwellStartedAt) / CANCEL_DWELL_MS) * 100);
    setCancelProgress(progress);

    if (progress < 100 && cancelDwellTimer) {
      cancelProgressFrame = window.requestAnimationFrame(updateCancelProgress);
    }
  }

  function setCancelProgress(progress) {
    const cancelAction = actionTargets.find((target) => target.dataset.openMode === "cancel");
    if (cancelAction) {
      cancelAction.style.setProperty("--cancel-progress", String(Math.round(progress)));
    }
  }

  function getPointerEdge(event) {
    if (activeEdge && isPointInsidePanel(event.clientX, event.clientY)) {
      return activeEdge;
    }

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

  function isPointInsidePanel(clientX, clientY) {
    if (!panel || !panel.classList.contains(ACTIVE_CLASS)) {
      return false;
    }

    const rect = panel.getBoundingClientRect();
    return clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;
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
