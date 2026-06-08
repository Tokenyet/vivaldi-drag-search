const DEFAULT_SETTINGS = {
  searchMode: "browser",
  searchTemplate: "https://www.google.com/search?q=%s",
  dropEdge: "top",
  openSearchInNewTab: false,
  openUrlInNewTab: false,
  revealEdgePx: 120,
  targetHeightPx: 96
};

const form = document.querySelector("#settings-form");
const status = document.querySelector("#status");
const resetButton = document.querySelector("#reset");

localizeDocument();
loadSettings();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveSettings(readForm());
});

resetButton.addEventListener("click", async () => {
  fillForm(DEFAULT_SETTINGS);
  await saveSettings(DEFAULT_SETTINGS);
});

async function loadSettings() {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  fillForm({ ...DEFAULT_SETTINGS, ...settings });
}

function fillForm(settings) {
  form.searchMode.value = settings.searchMode;
  form.searchTemplate.value = settings.searchTemplate;
  form.dropEdge.value = settings.dropEdge;
  form.openSearchInNewTab.checked = Boolean(settings.openSearchInNewTab);
  form.openUrlInNewTab.checked = Boolean(settings.openUrlInNewTab);
  form.revealEdgePx.value = settings.revealEdgePx;
  form.targetHeightPx.value = settings.targetHeightPx;
}

function readForm() {
  return {
    searchMode: form.searchMode.value,
    searchTemplate: normalizeSearchTemplate(form.searchTemplate.value),
    dropEdge: form.dropEdge.value,
    openSearchInNewTab: form.openSearchInNewTab.checked,
    openUrlInNewTab: form.openUrlInNewTab.checked,
    revealEdgePx: clampNumber(form.revealEdgePx.value, 24, 320),
    targetHeightPx: clampNumber(form.targetHeightPx.value, 64, 180)
  };
}

async function saveSettings(settings) {
  await chrome.storage.sync.set(settings);
  showStatus(getMessage("statusSaved", "Saved"));
}

function normalizeSearchTemplate(value) {
  const trimmed = String(value || "").trim();
  return trimmed || DEFAULT_SETTINGS.searchTemplate;
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return min;
  }
  return Math.min(max, Math.max(min, Math.round(number)));
}

function showStatus(message) {
  status.textContent = message;
  window.clearTimeout(showStatus.timer);
  showStatus.timer = window.setTimeout(() => {
    status.textContent = "";
  }, 1800);
}

function localizeDocument() {
  document.documentElement.lang = (getMessage("@@ui_locale", "en") || "en").replace("_", "-");
  document.documentElement.dir = getMessage("@@bidi_dir", "ltr") || "ltr";

  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = getMessage(element.dataset.i18n, element.textContent);
  }

  for (const element of document.querySelectorAll("[data-i18n-html]")) {
    element.innerHTML = getMessage(element.dataset.i18nHtml, element.innerHTML);
  }
}

function getMessage(key, fallback) {
  try {
    return chrome.i18n.getMessage(key) || fallback;
  } catch {
    return fallback;
  }
}
