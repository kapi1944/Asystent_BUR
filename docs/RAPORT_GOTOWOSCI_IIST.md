# Raport gotowości workflow IIST online

Data weryfikacji: 5 sierpnia 2026 r.

## Zakres

Zweryfikowano workflow rozszerzenia Chrome MV3:

`strona IIST → pobranie danych → wybór terminu → przygotowanie i zatwierdzenie zmian BUR → osoby prowadzące → program → harmonogram → CSV/import → porównanie → checklista`

Testy wykorzystują trzy stabilne strony źródłowe IIST oraz pięć stanów formularza BUR: pusty, częściowo wypełniony, z istniejącym harmonogramem, z osobami SEMPER i z osobami IIST.

## Stan funkcji

| Funkcja | Stan | Sposób potwierdzenia |
|---|---|---|
| Rozpoznanie profilu IIST | działa | automatyczny test parsera i profilu |
| Rozpoznanie konta BUR IIST | działa | fixture nagłówka rzeczywistej nazwy organizacji |
| Pobranie i parsowanie szkolenia | działa | fixtures IIST 1/2/3 dni |
| Rozpoznanie terminu online | działa | dokładne daty początku i końca |
| Data rekrutacji dzień przed startem | działa | `09-09-2027` dla startu `10-09-2027` |
| Przygotowanie propozycji BUR | działa | test na pustym formularzu |
| Zatwierdzenie i zapis pól | działa | tytuł, cel, program Quill i dane kontaktowe |
| Zastąpienie osób prowadzących | działa | dokładnie Ekspert IIST i Koordynator IIST |
| Program IIST | działa | cel, program i tekst organizacyjny profilu |
| Harmonogram 1 dzień online | działa | 10 pozycji, szablon `iist-online-1-dzien` |
| Harmonogram 2 dni online | działa | 17 pozycji, szablon `iist-online-2-dni` |
| Harmonogram 3 dni online | działa | 24 pozycje, szablon `iist-online-3-dni` |
| CSV UTF-8 BOM | działa | nagłówki, liczba wierszy i adresy IIST |
| Import na fixture BUR | działa | odtworzenie tabeli i porównanie wszystkich pól |
| Import na rzeczywistej stronie BUR | do testu ręcznego | zależy od reakcji BUR na syntetyczne zdarzenie pola pliku |
| Kontrola po imporcie | działa | liczba pozycji, kolejność, pola i sumy |
| Końcowa kontrola kontekstu IIST | działa | konto, profil, tytuł, termin, osoby, struktura i sumy |
| Izolacja SEMPER/IIST | działa | osobne definicje, adresy i generatory |
| Blokada podwójnego importu | działa | lokalna blokada operacji i wyłączone przyciski |
| Odtworzenie stanu po otwarciu/odświeżeniu | działa | serializacja stanu przygotowanego harmonogramu |
| Wygasła operacja | działa | blokada jest zwalniana z kontrolowanym błędem |
| Brak dostępu do źródła | działa | kontrolowany błąd HTTP, bez utraty poprzednich danych |

## Wyniki automatyczne

- Pełny zestaw: `335/335`, błędy: `0`, timeouty: `0`.
- Regresja SEMPER: `99/99`, błędy: `0`, timeouty: `0`.
- Grupa IIST: `75/75`, błędy: `0`, timeouty: `0`.
- Testy E2E obejmują warianty 1-, 2- i 3-dniowe oraz wszystkie wskazane konflikty kontekstu.
- Kontrola składni i manifestu jest wykonywana przed commitem.

Regresja SEMPER obejmuje parser, wyszukiwanie, terminy, kolejkę, wypełnianie, program, harmonogram, walidację, sticky panel i CSV. Dodatkowa kontrola izolacji potwierdza brak adresów i danych IIST w wyniku SEMPER oraz brak danych SEMPER w wyniku IIST.

## Sumy harmonogramów

| Wariant | Pozycje | Zegarowe | Zajęcia | Walidacja | Przerwy | Dydaktyczne bez przerw |
|---|---:|---:|---:|---:|---:|---:|
| IIST online 1 dzień | 10 | 06:00 | 04:40 | 00:20 | 01:00 | 06:40 |
| IIST online 2 dni | 17 | 12:00 | 09:40 | 00:20 | 02:00 | 13:20 |
| IIST online 3 dni | 24 | 18:00 | 14:40 | 00:20 | 03:00 | 20:00 |

## Czasy wykonania

Pomiar wykonano w przeglądarkowym runnerze na wariancie trzydniowym. Są to czasy kodu lokalnego na fixture, a nie deklaracja czasu odpowiedzi zewnętrznego serwisu BUR.

| Etap | Wynik pomiaru |
|---|---:|
| Generowanie 1000 harmonogramów | 84,2 ms |
| Jedno generowanie pozycji | 0,084 ms |
| Render podglądu 24 pozycji | 0,2 ms |
| Przygotowanie CSV | 0,2 ms |
| Odtworzenie importu na fixture BUR | 0,2 ms |
| Weryfikacja po imporcie | 1,8 ms |

Generator jest synchroniczny i nie wykonuje zapytań sieciowych, odczytów storage, timeoutów ani skanowania DOM. Wcześniejsze kilkunastosekundowe oczekiwanie pochodziło z importera: przy braku potwierdzonej zmiany tabeli wykonywał do 24 prób co 500 ms. Nie usunięto tej kontroli bezpieczeństwa. Import kończy się teraz od razu, jeżeli tabela zawiera już poprawny wynik; pełne oczekiwanie pozostaje wyłącznie dla rzeczywistego braku potwierdzenia importu.

## Przypadki błędów

Automatycznie potwierdzono blokowanie:

- profilu IIST na koncie SEMPER i profilu SEMPER na koncie IIST,
- zmiany konta, terminu, tytułu i dat formularza,
- braku Eksperta IIST lub Koordynatora IIST,
- pozostałości osób i adresów SEMPER,
- częściowego importu, błędnej liczby pozycji i błędnych sum,
- powtórnego uruchomienia importu podczas aktywnej operacji,
- nieaktualnego harmonogramu i wygasłej operacji,
- braku dostępu do strony źródłowej.

## Testy ręczne przed publikacją

1. Załadować rozszerzenie bezpośrednio z repozytorium w aktualnym Chrome.
2. Otworzyć rzeczywistą stronę każdego szkolenia IIST 1/2/3 dni i porównać treść z fixture.
3. Sprawdzić wykrycie pełnej nazwy konta IIST w rzeczywistym nagłówku BUR.
4. Przejść pełne przygotowanie i zatwierdzenie zmian na kopii roboczej usługi BUR.
5. Potwierdzić utworzenie dokładnie dwóch osób IIST po usunięciu wcześniejszych osób.
6. Zaimportować CSV każdego wariantu i porównać wszystkie wiersze oraz pięć sum w tabeli BUR.
7. Powtórzyć import przy istniejącym harmonogramie i zweryfikować ekran różnic oraz potwierdzenie usunięcia.
8. Kliknąć import dwukrotnie i potwierdzić, że wysyłane jest tylko jedno polecenie.
9. Odświeżyć BUR oraz zamknąć i ponownie otworzyć panel przed importem.
10. Uruchomić końcową checklistę i sprawdzić brak błędów oraz ostrzeżeń wymagających decyzji.
11. Wykonać analogiczny smoke test SEMPER online i stacjonarnie.

## Znane ograniczenia

- Automatyczny import zależy od tego, czy aktualna wersja BUR akceptuje przypisanie pliku i syntetyczne zdarzenia `input/change`. Gdy BUR je ignoruje, rozszerzenie udostępnia diagnostyczny CSV do ręcznego wskazania.
- Nie ma automatycznego testu przeciwko produkcyjnemu serwisowi BUR; fixtures chronią strukturę i logikę rozszerzenia, ale nie zastępują testu ręcznego po zmianie zewnętrznego DOM.
- Nieobsługiwany wariant jest odrzucany bez zgadywania szablonu.

## Warianty nieobsługiwane

- IIST stacjonarne,
- IIST online 4-dniowe i dłuższe,
- inne układy godzin niż potwierdzone szablony online 1/2/3 dni.
