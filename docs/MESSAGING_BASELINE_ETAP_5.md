# Stan komunikacji przed refaktoryzacją — etap 5

Inwentaryzację wykonano przed zmianą kodu wykonawczego etapu 5.

## Routing

- `shared/komunikaty.js` zawiera jeden płaski obiekt wszystkich typów wiadomości.
- `background/service-worker.js` ma własny `chrome.runtime.onMessage` dla wyszukiwania i importu danych dostawców.
- `background/koordynator-serii-bur.js` rejestruje osobny listener dla Serii ogłoszeń.
- `content/bur-content.js`, `content/semper-content.js`, `content/iist-content.js` oraz `content/workflow-bur-dla-zadania.js` mają niezależne listenery i ręczne rozgałęzienia po `wiadomość.typ`.
- `panel/panel.js` używa zarówno `chrome.runtime.sendMessage`, jak i `chrome.tabs.sendMessage`, a także nasłuchuje powiadomień content scriptu.
- Brakuje wspólnego kontraktu walidacji wiadomości i cienkiego routera. Stare typy są publicznym kontraktem testowanym regresyjnie.

## PING i zapewnianie content scriptu

- Panel ma własne `sprawdźPołączenieKarty`, `wstrzyknijContentBur` i `zapewnijSkryptStrony`.
- Koordynator Serii ma osobne `wyślijDoKarty`, `wstrzyknijSkrypt` i `zapewnijContentScript` z retry.
- Content scripty odpowiadają na stary `PING_SKRYPTU_STRONY`; BUR chroni główny listener flagą `__BUR_ASYSTENT_CONTENT_LISTENER_LOADED__`, a workflow osobną flagą.

## Listy plików BUR

Pełna lista content scriptów BUR występuje w trzech miejscach:

1. `manifest.json` — deklaracja statyczna MV3;
2. `panel/panel.js` — `plikiContentBur` dla programatycznej iniekcji;
3. `background/koordynator-serii-bur.js` — `PLIKI_CONTENT_BUR` dla Serii.

Statyczny manifest jest wystarczającym źródłem konfiguracji. Programatyczne ensure pozostaje potrzebne dla kart otwartych przed przeładowaniem/aktualizacją rozszerzenia, ale background może pobierać aktualną listę przez `chrome.runtime.getManifest()` bez utrzymywania kolejnej kopii.

## Granica wydzielenia

Koordynator miesza operacje techniczne kart (`create/get/send/ping/inject/retry`) z logiką biznesową Serii. Stan, etapy, terminy, harmonogram i decyzje Serii muszą pozostać w koordynatorze. Do ogólnego wykonawcy można przenieść wyłącznie operacje kart, timeouty, retry i rozpoznanie zamkniętej karty.
