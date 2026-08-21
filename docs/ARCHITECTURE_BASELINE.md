# Asystent BUR — bazowa architektura przed reorganizacją

Stan analizy: 2026-08-21. Dokument opisuje faktyczny stan repozytorium przed wdrożeniem modułu „Refresh”. Nie jest projektem docelowej architektury i nie wprowadza Refresh.

## Zakres i stan roboczy

Analiza objęła manifest, service worker, koordynator serii, content scripty BUR/SEMPER/IIST, panel, współdzielone profile, komunikaty, selektory, wypełniacz, automaty stanów oraz wszystkie testy i fixture.

Przed rozpoczęciem tego etapu repozytorium miało istniejące niezacommitowane zmiany w:

- `content/bur-content.js`,
- `content/bur-highlighter.css`,
- `tests/aktualny-termin-bur.test.js`,
- `tests/automatyczna-walidacja-bur.test.js`,
- nieśledzonym katalogu `.tmp-test-kompetencje/`.

Zmiany te były częścią analizowanego stanu roboczego, ale nie należą do commita tego etapu. W szczególności roboczy `bur-content.js` zawiera dodatkowy obserwator i automatyczną korektę przełączników kompetencji.

W trakcie analizy pojawiły się ponadto równoległe niezacommitowane zmiany w `panel/panel.js` i `tests/panel-terminy.test.js`, dotyczące automatycznego wyszukiwania szkolenia na podstawie kompletnego terminu BUR. Zostały zachowane, uwzględnione przy końcowej regresji i również wyłączone z commita tego etapu.

Kolejna równoległa zmiana ujednoliciła nazwę formy online do „zdalna w czasie rzeczywistym” w `shared/definicje-pol-bur.js`, `shared/walidatory-bur.js`, `shared/wypełniacz-bur.js` oraz odpowiadających testach i dwóch istniejących fixture. Także te pliki pozostają poza commitem bazowym.

## Entry pointy i sposób ładowania

Projekt używa Manifest V3, ale pozostaje zestawem klasycznych skryptów. Nie ma `package.json`, bundlera ani modułów ES.

### Service worker

Entry point: `background/service-worker.js`, wskazany przez `manifest.json`.

Kolejność `importScripts`:

1. `shared/profile-dostawcow.js`,
2. `shared/komunikaty.js`,
3. `shared/szablony-harmonogramow.js`,
4. `shared/seria-ogloszen-bur.js`,
5. `shared/wyszukiwarka-semper.js`,
6. `background/klient-semper.js`,
7. `background/klient-iist.js`,
8. `background/koordynator-serii-bur.js`.

Service worker ustawia zachowanie panelu bocznego, obsługuje wyszukiwanie i import danych SEMPER/IIST oraz udostępnia koordynator serii ogłoszeń.

### Panel boczny

Entry point dokumentu: `panel/panel.html`; końcowy kontroler: `panel/panel.js`.

Panel ładuje kolejno klasyczne skrypty współdzielone: profile, komunikaty, model, normalizację tytułu, daty, terminy, kolejkę terminów, stan operacji, szablony i generator harmonogramu, wyszukiwarkę i parsery, klienta IIST, definicje pól i przygotowanie wypełnienia. `panel.js` jest ładowany jako ostatni.

Panel jest jednocześnie:

- kontrolerem UI wszystkich zakładek,
- klientem service workera,
- klientem aktywnej karty przez `chrome.tabs.sendMessage`,
- właścicielem znacznej części stanu widoku i stanu roboczego,
- awaryjnym iniektorem kompletnego zestawu skryptów BUR.

### Content scripty

Manifest deklaruje trzy zestawy uruchamiane przy `document_idle`:

- SEMPER: profile → komunikaty → model → normalizacja → daty → terminy → stan operacji → szablony → generator → wyszukiwarka → parser SEMPER → `content/semper-content.js`;
- IIST: profile → komunikaty → model → normalizacja → daty → parser IIST → `content/iist-content.js`;
- BUR: profile → komunikaty → cele i model walidacji → normalizacja/daty/terminy → stan operacji → seria i harmonogram → wyszukiwarka → selektory/walidatory/definicje/przygotowanie/wypełniacz → `content/bur-content.js` → `content/workflow-bur-dla-zadania.js`.

Skrypty SEMPER i IIST są cienkimi adapterami wiadomości do parserów. `bur-content.js` jest dużym adapterem strony BUR: wykrywa konto, odczytuje i ustawia pola, waliduje, podświetla, obsługuje kolejkę terminów, program i harmonogram oraz raport gotowości karty. `workflow-bur-dla-zadania.js` wykonuje osobne etapy automatu serii dla konkretnego `jobId`/`tabId`.

## Wspólna przestrzeń `globalThis.BurAsystent`

Każdy skrypt współdzielony wykonuje IIFE, pobiera `globalny.BurAsystent || {}`, dopisuje funkcje lub stałe i ponownie przypisuje obiekt do `globalny.BurAsystent`.

To oznacza, że zależności są rozwiązywane przez kolejność ładowania, a nie jawne importy. Najważniejsze grupy eksportów:

- `profile-dostawcow.js`: profile, wykrywanie konta, klucze danych profilu i budowa programu;
- `komunikaty.js`: wspólny katalog typów wiadomości;
- `selektory-bur.js`: wyszukiwanie pól, odczyt Quill/Select2 i przełączników;
- `wypełniacz-bur.js`: mutacje pól, Select2, dat, Quill, przełączników i osób prowadzących;
- `stan-operacji-bur.js`: automat pojedynczej operacji panelu;
- `seria-ogloszen-bur.js`: model serii, zadania, statusy, odciski i rozpoznanie kopiowania;
- `bur-content.js`: funkcje zależne od bieżącego DOM BUR;
- `workflow-bur-dla-zadania.js`: wykonawca etapów zadania serii.

Nadpisanie kolejności skryptów może pozostawić stałe jako `undefined` w czasie inicjalizacji modułu albo wywołać funkcję, której jeszcze nie zarejestrowano.

## Mapa głównych zależności

```text
manifest.json
├── service-worker.js
│   ├── klient-semper.js / klient-iist.js
│   └── koordynator-serii-bur.js
│       ├── seria-ogloszen-bur.js
│       ├── chrome.storage local/session
│       ├── chrome.tabs
│       └── content workflow konkretnej karty
├── panel.html → panel.js
│   ├── profile / parsery / terminy / harmonogram / stan operacji
│   ├── chrome.storage local/session
│   ├── chrome.runtime → service worker
│   └── chrome.tabs → content script aktywnej karty
└── content scripts
    ├── SEMPER → parser-semper.js
    ├── IIST → parser-iist.js
    └── BUR
        ├── selektory / walidatory / definicje / wypełniacz
        ├── bur-content.js
        └── workflow-bur-dla-zadania.js
```

Najsilniejsze sprzężenie występuje między `panel/panel.js`, `content/bur-content.js`, `shared/wypełniacz-bur.js`, `shared/selektory-bur.js` i katalogiem komunikatów. Koordynator serii dodatkowo zależy od dokładnej kolejności plików oraz kontraktu wyników każdego etapu workflow.

## Programatyczne wstrzykiwanie content scriptów

Lista BUR ma trzy lokalne kopie:

1. `manifest.json` — deklaratywne `content_scripts[].js`,
2. `panel/panel.js` — `plikiContentBur`, używane po nieudanym PING aktywnej karty; panel wstrzykuje także `content/bur-highlighter.css`,
3. `background/koordynator-serii-bur.js` — `PLIKI_CONTENT_BUR`, używane podczas przygotowania kart serii.

Wszystkie trzy listy mają obecnie tę samą kolejność 19 plików JavaScript. Nowy test charakterystyczny blokuje ich przypadkowe rozjechanie.

Ryzyko: koordynator serii wstrzykuje tylko JavaScript, bez CSS. Ponowne wykonanie części skryptów może również powtórzyć efekty startowe; `bur-content.js` i workflow mają osobne flagi ochronne listenerów, ale nie jest to wspólna, jednolita inicjalizacja wszystkich modułów.

## Messaging

Wszystkie oficjalne typy są zebrane w `shared/komunikaty.js`; wartość każdego wpisu jest równa jego nazwie. Istnieje też zgodnościowy literał `POBIERZ_DANE_IIST_ZE_STRONY` w `iist-content.js`, poza katalogiem.

Główne trasy:

- panel → service worker przez `chrome.runtime.sendMessage`: wyszukiwanie i import SEMPER/IIST oraz sterowanie serią;
- panel → karta przez `chrome.tabs.sendMessage`: PING, odczyt strony, tytułu, terminu i konta BUR, kolejka terminów, walidacja, nawigacja do pola, przygotowanie/wprowadzenie zmian, program i harmonogram;
- service worker/koordynator → konkretna karta przez `chrome.tabs.sendMessage`: PING, raport gotowości, wykonanie etapu workflow i ponowna walidacja;
- content BUR → rozszerzenie przez `chrome.runtime.sendMessage`: zmiana wykrytego konta i zmiana aktualnego terminu;
- panel ma `chrome.runtime.onMessage` dla zmian terminu/konta;
- service worker, koordynator, każdy content script i workflow rejestrują własne `chrome.runtime.onMessage`.

Asynchroniczne handlery zwracają `true`, aby utrzymać kanał odpowiedzi. Kontrakty nie mają wersjonowania ani walidacji schematem; są rozpoznawane po `wiadomość.typ` i oczekiwanym kształcie `wynik`.

## Storage i współdzielony stan

### `chrome.storage.local`

Panel utrwala między innymi:

- aktywny profil: `aktywnyProfilDostawcy`;
- dane profilu: `daneŹródłoweWedługProfilu_semper`, `daneŹródłoweWedługProfilu_iist`;
- zgodnościowe aliasy źródła: `szkolenieŹródłowe`, `ostatnieSzkolenieSemper`, `ostatnieOstrzezeniaSemper`, `ostatnieŁączeSemper`, `dataImportuSemper`;
- wybór terminu i zgodność: `wybranyTerminSemperIndex`, `źródłoWyboruTerminuSemper`, `aktualnyTerminBur`, `odciskAktualnegoTerminuBur`, `zgodnośćWybranegoTerminuBur`;
- operację formularza: `aktywnaOperacjaBur`, `podglądWypełnieniaBur`;
- harmonogram: `wybranyTerminHarmonogramuBur`, `ostatniePozycjeHarmonogramuBur`, `ostatniWybranyTerminHarmonogramuBur`, `ostatnieOstrzeżeniaHarmonogramuBur`, starszy alias `ostrzezeniaHarmonogramuBur`, flagi `harmonogramBurPrzygotowany`/`harmonogramBurNieaktualny`, daty, kontekst i metrykę przygotowania.

`bur-content.js` czyta `ostatnieSzkolenieSemper` i `wybranyTerminSemperIndex` do walidacji oraz reaguje na ich zmianę przez `chrome.storage.onChanged`.

Koordynator serii zapisuje cały stan pod `aktywnaSeriaOgloszenBur` równolegle do `local` i, jeśli dostępny, `session`. Przy odtwarzaniu preferuje `session`, a potem `local`.

### `chrome.storage.session`

Panel zapisuje:

- `stanWalidacjiBur` — ostatni wynik i pozycję przewijania,
- `stanPaneluBur` — aktywną zakładkę i informację o ręcznym wyborze.

### `window.localStorage` strony BUR

Kolejka terminów jest przechowywana w originie BUR, nie w storage rozszerzenia:

- `bur_terms_raw`,
- `bur_term_index`,
- `bur_terms_order_mode`,
- `bur_total_counter`,
- dynamiczny `bur_daily_counter_<rok>-<miesiąc>-<dzień>`.

To jest szczególnie istotna granica: przeniesienie kolejki do innego kontekstu zmieniłoby miejsce i cykl życia danych.

## Profile SEMPER i IIST

`shared/profile-dostawcow.js` jest centralnym rejestrem danych dostawców, tekstów, osób, wartości BUR i konfiguracji harmonogramu.

Wykrywanie profilu działa dwutorowo:

- panel rozpoznaje typ strony po domenie URL;
- content BUR przeszukuje widoczne nagłówki i górną część DOM, a potem tekst strony, i przekazuje znalezioną nazwę do `wykryjProfilPoNazwieKontaBur`.

IIST wymaga pełnej znormalizowanej nazwy konta. SEMPER jest rozpoznawany po wystąpieniu `SEMPER`. Konflikt aktywnego profilu z wykrytym kontem blokuje mutacje, import i serię.

## Selektory BUR, Select2 i jQuery

Źródłem prawdy są istniejące selektory w kodzie oraz fixture. Resolver pól działa warstwowo:

1. tabela i kolumna, jeśli zdefiniowane,
2. jawne selektory podstawowe i alternatywne,
3. etykieta ograniczona do rozpoznanej sekcji,
4. globalna etykieta tylko przy jednoznacznym wyniku.

`shared/selektory-bur.js` obsługuje zwykłe kontrolki, Quill, Select2, tabele i przełączniki. `shared/cele-formularza-bur.js` oraz `shared/definicje-pol-bur.js` zawierają katalog pól formularza. `bur-content.js` ma dodatkowe lokalne selektory programu, tabeli/importu harmonogramu, terminu i konta.

Select2 jest sprzężeniem między widocznym kontenerem i ukrytym natywnym `select`. Wypełniacz:

- próbuje znaleźć natywne pole po identyfikatorze kontenera,
- wybiera opcję po tekście, w krytycznych miejscach dokładnie,
- emituje natywne `input`/`change`,
- jeśli istnieje `globalny.jQuery`, dodatkowo wykonuje `jQuery(...).trigger("change")`,
- odczytuje ponownie wartość natywną i widoczną; brak potwierdzenia kończy się kontrolowanym błędem/ostrzeżeniem.

jQuery nie jest dostarczane przez rozszerzenie. Kod korzysta z instancji strony BUR tylko wtedy, gdy jest dostępna.

## `MutationObserver` i reakcje na DOM

Obecne użycia:

- `bur-content.js`: stały obserwator zmian nazwy konta na całym `document.body`;
- `bur-content.js`: tymczasowy obserwator tabeli harmonogramu podczas importu;
- roboczy `bur-content.js`: stały obserwator przełączników kompetencji na całym `document.body`;
- `shared/wypełniacz-bur.js`: krótkotrwałe obserwatory potwierdzenia reakcji pola oraz przebudowy AJAX formularza.

Automatyczna walidacja formularza BUR jest dodatkowo uruchamiana przez delegowane listenery `input`, `change` i `click`, z debounce i blokadą równoległego wykonania. Obserwatory szerokiego `body` oraz delegowane listenery są ryzykowne przy ponownym wstrzyknięciu i przy przyszłym dodaniu kolejnego modułu reagującego na te same mutacje.

## Kolejki i automaty stanów

### Pojedyncza operacja BUR

`shared/stan-operacji-bur.js` definiuje etapy:

`bezczynny → przygotowywanie → oczekuje_na_zatwierdzenie → wprowadzanie → walidowanie → zakończono`, z kontrolowanymi przejściami do `błąd` i możliwością ponowienia. Blokada jest identyfikowana przez kartę, odcisk szkolenia i indeks terminu; wygasa po 15 minutach.

### Kolejka terminów

Kolejka w `localStorage` BUR utrzymuje surowe dane, indeks, tryb kolejności oraz liczniki dzienny i łączny. Panel jest klientem przez wiadomości do aktywnego content scriptu.

### Seria ogłoszeń

`shared/seria-ogloszen-bur.js` definiuje statusy zadania i 14 etapów workflow. `background/koordynator-serii-bur.js`:

- tworzy i przypisuje osobne karty do `jobId`,
- wykonuje maksymalnie jedno zadanie mutujące naraz,
- zapisuje wynik każdego etapu przed przejściem dalej,
- nie ponawia „w ciemno” przerwanego etapu mutującego,
- odtwarza stan po restarcie service workera,
- zatrzymuje serię przy globalnym konflikcie,
- pozostawia karty otwarte i nie publikuje formularza.

`content/workflow-bur-dla-zadania.js` mapuje nazwy etapów na istniejące adaptery selektorów, wypełniacza, osób, programu, harmonogramu i walidacji. Integralność jest sprawdzana przez `batchId`, `jobId`, `tabId`, odciski szkolenia, instancji formularza i wyniku walidacji.

## Testy i fixture

Runner to `tests/test-runner.html` uruchamiany przez `node test-server.js` pod `http://127.0.0.1:8765/tests/test-runner.html`. Bez parametru `grupa` ładuje wszystkie pliki `*.test.js` jawnie wpisane w HTML i wykonuje testy sekwencyjnie z limitem 5 sekund na test. Nie istnieje osobne polecenie npm.

Pełna regresja wymaga:

1. uruchomienia lokalnego serwera,
2. otwarcia runnera bez filtra grupy,
3. sprawdzenia podsumowania i braku wpisów `BLAD`,
4. `node --check` dla wszystkich plików JavaScript,
5. `git diff --check`.

Istniejące fixture obejmują strony źródłowe IIST oraz kilka stanów formularza BUR: pusty, częściowo wypełniony, formularz wstępny, przełączniki, osoby prowadzące i istniejący harmonogram.

Nie ma potwierdzonego fixture dla:

- strony BUR „Moje usługi”,
- przycisku lub akcji „Edycja usługi”,
- widoku po publikacji usługi.

Nie należy tworzyć selektorów ani HTML dla tych widoków bez rzeczywistego fixture lub potwierdzonego kodu strony.

## Ryzykowne miejsca późniejszego refaktoru

1. Trzy kopie listy content scriptów BUR i zależność od ich kolejności.
2. Globalny, mutowalny rejestr `globalThis.BurAsystent` bez jawnych zależności.
3. Duży `panel/panel.js`, łączący UI, storage, messaging, logikę profili, terminów, walidacji, harmonogramu i serii.
4. Duży `content/bur-content.js`, łączący detekcję DOM, mutacje, obserwatory, kolejkę i wiele protokołów wiadomości.
5. Klucze storage pełniące jednocześnie rolę bieżącego kontraktu i zgodności z wcześniejszym nazewnictwem SEMPER.
6. Kolejka w `window.localStorage` originu BUR, podczas gdy pozostały stan jest w `chrome.storage`.
7. Select2 wymagający synchronizacji widocznej i natywnej kontrolki oraz opcjonalnego jQuery strony.
8. Heurystyczne wykrywanie konta i pól po tekście; niejednoznaczność musi nadal kończyć się bezpiecznym brakiem wyniku.
9. Stałe obserwatory całego `document.body` oraz ponowne programatyczne wstrzykiwanie.
10. Asynchroniczne wiadomości bez wersjonowania i walidacji schematu.
11. Trwałość serii w dwóch obszarach storage i ryzyko przerwania service workera między mutacją DOM a zapisem etapu.
12. Brak fixture dla listy usług, edycji i stanu po publikacji — nie ma podstawy do bezpiecznej charakterystyki tych ekranów.

## Bezpieczne granice przyszłej reorganizacji

Przed zmianą produkcyjnego kodu należy traktować jako kontrakty:

- kolejność i komplet loaderów,
- nazwy komunikatów i kształt odpowiedzi,
- wszystkie obecne klucze storage oraz obszar ich zapisu,
- profile i blokady konfliktu konta,
- selektory potwierdzone przez kod/fixture,
- zachowanie „przygotuj → zatwierdź → wprowadź → waliduj”,
- sekwencyjność i odtwarzalność serii,
- potwierdzenie technicznej wartości Select2 po mutacji,
- brak automatycznego zapisu roboczego i publikacji.

Nowy moduł powinien być później dołączany za jawnie wyznaczoną granicą, bez równoczesnej migracji całego projektu do ES Modules i bez zmiany powyższych kontraktów.
