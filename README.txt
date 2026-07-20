PATCHE ASYSTENT_BUR — BEZ CODEXA

Skopiuj cztery pliki .sh do głównego katalogu repozytorium:
Asystent_BUR/Asystent_BUR

Uruchamiaj kolejno:

chmod +x patch-01-adapter-pol-bur.sh
./patch-01-adapter-pol-bur.sh

chmod +x patch-02-efekty-walidacja-podswietlanie.sh
./patch-02-efekty-walidacja-podswietlanie.sh

chmod +x patch-03-stan-operacji-bur.sh
./patch-03-stan-operacji-bur.sh

chmod +x patch-04-harmonogram-csv-zamiana.sh
./patch-04-harmonogram-csv-zamiana.sh

Każdy patch:
- działa lokalnie;
- nie używa Codexa ani żadnego API AI;
- nie wykonuje git pull ani git push;
- zatrzymuje się, jeśli modyfikowane przez niego pliki mają niezacommitowane zmiany;
- używa lokalnego Pythona wyłącznie do modyfikacji plików tekstowych;
- wykonuje node --check oraz git diff --check;
- tworzy osobny lokalny commit.

Kolejność: 1 -> 2 -> 3 -> 4.

Patch 1:
Wspólny adapter pól BUR, tabela+kolumna, poprawny odczyt Select2 i spójny podgląd/zapis.

Patch 2:
Efekty uczenia "-", Kryteria weryfikacji "-", Metoda walidacji "Wywiad swobodny",
dokładna walidacja, nawigacja i przekazywanie celu pola do panelu.

Patch 3:
Naprawa cyklu życia operacji BUR, zwalnianie blokady po błędzie,
brak fałszywego statusu "zakończono" przy częściowym niepowodzeniu.

Patch 4:
Strukturalny odczyt harmonogramu, raport różnic, blokada fallbacku po częściowym imporcie
i bezpieczna zamiana istniejącego harmonogramu po dodatkowym potwierdzeniu.
