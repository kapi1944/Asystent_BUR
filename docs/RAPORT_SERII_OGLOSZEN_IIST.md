# Raport serii ogłoszeń IIST

## Zakres

Seria ogłoszeń BUR uruchamia istniejący workflow pojedynczej karty IIST dla wielu jawnie przypisanych zadań. Kończy pracę na stanie `gotowe_do_kontroli`; nie zapisuje roboczo i nie publikuje usług.

## Architektura

- `shared/seria-ogloszen-bur.js` definiuje model serii, model zadania, trwałe etapy, identyfikatory oraz odcisk danych szkolenia.
- `background/koordynator-serii-bur.js` jest właścicielem stanu, mapowania `tabId → jobId`, kolejki sekwencyjnej i punktów kontrolnych etapów.
- `content/workflow-bur-dla-zadania.js` jest neutralnym adapterem. Przyjmuje jawny kontekst zadania i deleguje pracę do istniejących funkcji pojedynczego workflow.
- `panel/panel.js` wybiera terminy, uruchamia serię, prezentuje postęp i raporty oraz udostępnia CSV po odrzuconym imporcie automatycznym.

Adapter przyjmuje:

```js
{
  batchId,
  jobId,
  tabId,
  profilId,
  szkolenie,
  wybranyTermin,
  odciskSzkolenia,
  oczekiwanyTytul,
  wersjaSzablonu
}
```

Nie odczytuje aktywnej karty, globalnego indeksu terminu ani wspólnego harmonogramu. Koordynator wysyła każdą wiadomość do konkretnego `tabId` i przetwarza maksymalnie jedno zadanie naraz.

## Wykorzystany pojedynczy workflow

Adapter nie powiela reguł IIST. Używa istniejących mechanizmów:

- `przygotujPropozycjeWypełnieniaBur` i `ustawPoleBurZWeryfikacją`,
- `zastąpOsobyProwadzące` i `pobierzWierszeOsóbProwadzących`,
- `zbudujProgramDostawcy`,
- `generujHarmonogramDlaTerminu`,
- `walidujKontekstImportuHarmonogramu`, `wprowadźHarmonogramDoBur` i `zastąpHarmonogram`,
- `sprawdzHarmonogramPoWypelnieniu`,
- `walidujFormularzBur`.

Pusty formularz automatycznie otrzymuje bezpieczne propozycje dla pustych pól. Kopia lub formularz częściowo wypełniony dopuszcza kontrolowane zastąpienie wyłącznie dat, formy, osób i harmonogramu. Konflikt pozostałego niepustego pola kończy zadanie statusem `wymaga_decyzji`.

## Etapy i trwałość

Kolejność etapów:

1. `kontrola_kontekstu`
2. `kontrola_stanu_formularza`
3. `przygotowanie_propozycji`
4. `wypelnianie_pol`
5. `kontrola_pol`
6. `zastepowanie_osob_prowadzacych`
7. `kontrola_osob_prowadzacych`
8. `przygotowanie_programu`
9. `generowanie_harmonogramu`
10. `import_harmonogramu`
11. `weryfikacja_harmonogramu`
12. `walidacja_formularza`
13. `gotowe_do_kontroli`

Każdy etap zapisuje czas rozpoczęcia, czas zakończenia, wynik, błędy, ostrzeżenia i czas lokalnego wykonania. Stan jest zapisywany po każdym przejściu do `chrome.storage.session` oraz do trwałej kopii w `chrome.storage.local`.

Po wznowieniu zakończone etapy nie są powtarzane. Przerwany etap mutujący jest oznaczany `wymaga_decyzji`; koordynator nie wykonuje drugi raz niepotwierdzonej mutacji. Zakończony import również nie jest automatycznie ponawiany.

## Statusy końcowe

- `gotowe_do_kontroli` — import został porównany, walidacja nie ma błędów, a odcisk formularza i przypisanie karty są potwierdzone.
- `wymaga_decyzji` — wykryto konflikt danych albo nie można bezpiecznie potwierdzić poprzedniej operacji.
- `wymaga_recznego_importu` — BUR odrzucił automatyczne przypisanie pliku lub zdarzenie; CSV pozostaje przypisany do `jobId`.
- `blad` — lokalny błąd zadania; kolejne zadania są nadal przetwarzane.
- `karta_zamknieta` — przypisana karta przestała istnieć.
- `anulowane` — użytkownik zatrzymał serię.

Błędy globalne — zmiana konta IIST, profilu, odcisku szkolenia albo przypisania formularza — zatrzymują całą serię.

## Testy

- Stan przed zmianami: **354/354**, błędy 0, timeouty 0.
- Stan po zmianach serii: **380/380**, błędy 0, timeouty 0.
- Końcowy wynik całego bieżącego worktree: **382/382**, błędy 0, timeouty 0. Dwa dodatkowe testy rozpoznawania pełnych nazw kont pojawiły się równolegle w worktree i nie należą do commita serii.
- Dodano 26 scenariuszy adaptera i wykonania serii. Obejmują dwie i osiem kart, jawne terminy, brak zależności od aktywnej karty i globalnego indeksu, sekwencyjność, pusty formularz, kopię, konflikt, osoby IIST, brak SEMPER, harmonogramy 1/2/3 dni, import i porównanie, ręczny import, osobne walidacje, błędy lokalne i globalne, zamknięcie karty, restart service workera, ponowienie od błędnego etapu, ponowną walidację oraz brak zapisu i publikacji.
- Dotychczasowe testy pojedynczych workflow SEMPER i IIST pozostają częścią pełnej regresji.

## Pomiary lokalne

Pomiary wykonano 5 sierpnia 2026 w przeglądarkowym runnerze fixtures. Nie obejmują oczekiwania na prawdziwy BUR.

| Operacja | Czas |
| --- | ---: |
| Przygotowanie propozycji jednej pustej karty | 3,9 ms |
| Generowanie jednego harmonogramu IIST, średnia z 1000 wykonań | 0,132 ms |
| Przygotowanie CSV do importu | 0,4 ms |
| Import do tabeli fixture | 0,2 ms |
| Porównanie harmonogramu fixture | 1,4 ms |
| Walidacja formularza fixture | 3,8 ms |
| Pełne zadanie z atrapami odpowiedzi karty | 13 ms |
| Seria ośmiu zadań z trwałymi punktami kontrolnymi i atrapami kart | 247,0 ms |

Czas importu na prawdziwym BUR zależy od odpowiedzi aplikacji i nie jest przypisywany generatorowi.

## Ograniczenia i testy na prawdziwym BUR

Automatycznie potwierdzono logikę na fixtures. Przed użyciem produkcyjnym trzeba ręcznie zweryfikować:

1. czy osiem równoległych wejść pod URL „Dodanie usługi” tworzy osiem niezależnych identyfikatorów formularza,
2. czy bezpośredni URL akcji „Kopiuj usługę” może być użyty wielokrotnie z tego samego wzorca i nigdy nie tworzy łańcucha kopii,
3. czy konto i typ formularza są poprawnie rozpoznawane po wszystkich przekierowaniach BUR,
4. czy selektory i zdarzenia pól dat, Select2 oraz Quill są akceptowane przez aktualny frontend BUR,
5. czy usunięcie i ponowne dodanie dokładnie dwóch osób IIST działa na rzeczywistych modalach,
6. czy automatyczne przypisanie CSV do `input[type=file]` oraz syntetyczne zdarzenia są akceptowane,
7. czy po imporcie BUR zwraca wszystkie pozycje i sumy w formacie zgodnym z parserem,
8. czy uśpienie service workera podczas każdego etapu mutującego prowadzi do bezpiecznego `wymaga_decyzji`,
9. czy ręczny import pobranego CSV pozwala potem uruchomić ponowną walidację zadania,
10. czy po zakończeniu wszystkie karty pozostają otwarte, niezapisane i nieopublikowane.

Importer CSV nadal wymaga ręcznej weryfikacji na prawdziwym BUR, zgodnie z raportem gotowości IIST.
