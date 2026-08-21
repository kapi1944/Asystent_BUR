# Stan storage przed refaktoryzacją — etap 4

Inwentaryzację wykonano 21 sierpnia 2026 r. przed zmianą kodu wykonawczego.

## Bezpośrednie użycia `chrome.storage`

- `panel/panel.js`
  - lokalne callbackowe helpery `zapiszStorage`, `odczytajStorage` i `usuńStorage` dla `chrome.storage.local`;
  - bezpośrednie `session.set`/`session.get` dla `stanWalidacjiBur` i `stanPaneluBur`;
  - helpery sprawdzają `chrome.runtime.lastError`, ale zapisy stanu sesji nie robią tego jednolicie.
- `background/koordynator-serii-bur.js`
  - lokalny callbackowy wrapper `wywołajStorage` oraz helpery `pobierzStorage` i `zapiszStorage`;
  - agregat `aktywnaSeriaOgloszenBur` jest zapisywany jednym `set()` do `local` i dodatkowo do `session`;
  - odtworzenie preferuje `session`, a dopiero później `local`; ważny stan jest też buforowany w zmiennej `aktywnaSeria` service workera.
- `content/bur-content.js`
  - bezpośredni odczyt `local.get` kluczy `ostatnieSzkolenieSemper` i `wybranyTerminSemperIndex`;
  - bezpośrednia subskrypcja `chrome.storage.onChanged` używana do ponownej walidacji po zmianie kontekstu.
- Nie znaleziono użyć `chrome.storage.sync`.

## Istniejące klucze

`chrome.storage.local`:

- `aktywnyProfilDostawcy`;
- `daneŹródłoweWedługProfilu_semper`, `daneŹródłoweWedługProfilu_iist`;
- `szkolenieŹródłowe`, `ostatnieSzkolenieSemper`, `ostatnieOstrzezeniaSemper`, `ostatnieŁączeSemper`, `dataImportuSemper`;
- `wybranyTerminSemperIndex`, `źródłoWyboruTerminuSemper`, `aktualnyTerminBur`, `odciskAktualnegoTerminuBur`, `zgodnośćWybranegoTerminuBur`;
- `aktywnaOperacjaBur`, `podglądWypełnieniaBur`;
- `wybranyTerminHarmonogramuBur`, `ostatniePozycjeHarmonogramuBur`, `ostatniWybranyTerminHarmonogramuBur`, `ostatnieOstrzeżeniaHarmonogramuBur`, `ostrzezeniaHarmonogramuBur`, `harmonogramBurPrzygotowany`, `harmonogramBurNieaktualny`, `harmonogramBurPrzygotowanyAt`, `datyPrzygotowanegoHarmonogramuBur`, `kontekstPrzygotowanegoHarmonogramuBur`, `metrykaPrzygotowanegoHarmonogramuBur`, `odciskTerminuBurPrzygotowanegoHarmonogramu`;
- `aktywnaSeriaOgloszenBur`.

`chrome.storage.session`:

- `stanWalidacjiBur`;
- `stanPaneluBur`;
- dodatkowa, nietrwała kopia `aktywnaSeriaOgloszenBur`.

Nie są to klucze `chrome.storage`: `bur_terms_raw`, `bur_term_index`, `bur_terms_order_mode`, `bur_total_counter` i dynamiczny `bur_daily_counter_<data>` należą do `window.localStorage` strony BUR. Etap 4 ich nie przenosi i nie implementuje przyszłej kolejki Refresh.

## Ryzyka stanu zastanego

- callbackowe adaptery są powielone i różnie obsługują błędy;
- zapisy sesyjne panelu mogą przemilczeć `chrome.runtime.lastError`;
- preferowanie kopii `session` przez koordynator może odtworzyć inną wersję niż trwałe źródło `local`;
- pamięciowe `aktywnaSeria`, `inicjalizacja` i `przetwarzanieWToku` nie przeżywają restartu MV3. Dane Serii są już zapisywane jako jeden agregat JSON, więc bezpieczne odtworzenie może opierać się na istniejącym kluczu w `local` bez zmiany modelu ani migracji danych.
