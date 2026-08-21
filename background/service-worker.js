importScripts(
  "../shared/storage/storage-keys.js",
  "../shared/storage/storage-api.js",
  "../shared/messaging/message-types.js",
  "../shared/messaging/message-contract.js",
  "../shared/providers/provider-rules.js",
  "../shared/providers/profile-detector.js",
  "../shared/profile-dostawcow.js",
  "../shared/komunikaty.js",
  "../shared/szablony-harmonogramow.js",
  "../shared/seria-ogloszen-bur.js",
  "../shared/wyszukiwarka-semper.js",
  "klient-semper.js",
  "klient-iist.js",
  "orchestration/tab-job-runner.js",
  "router-komunikatow.js",
  "koordynator-serii-bur.js"
);

chrome.runtime.onInstalled.addListener(function ustawPanelBoczny() {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

const routerKomunikatówTła = globalThis.BurAsystent.utwórzRouterKomunikatówTła();
chrome.runtime.onMessage.addListener(routerKomunikatówTła.obsłuż);
