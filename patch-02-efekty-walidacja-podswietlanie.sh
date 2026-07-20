#!/usr/bin/env bash
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO"

TARGETS=(
  "shared/walidatory-bur.js"
  "shared/cele-formularza-bur.js"
  "content/bur-content.js"
)

echo "== PATCH 2/4: efekty uczenia, kryteria, metoda walidacji i podświetlanie =="
git status --short
git log -5 --oneline

for plik in "${TARGETS[@]}"; do
  if ! git diff --quiet -- "$plik" || ! git diff --cached --quiet -- "$plik"; then
    echo "BŁĄD: $plik ma niezacommitowane zmiany. Zapisz/commitnij je przed uruchomieniem patcha."
    exit 1
  fi
done


if command -v python >/dev/null 2>&1; then
  PYTHON_CMD=(python)
elif command -v python3 >/dev/null 2>&1; then
  PYTHON_CMD=(python3)
elif command -v py >/dev/null 2>&1; then
  PYTHON_CMD=(py -3)
else
  echo "BŁĄD: Nie znaleziono lokalnego Pythona (python/python3/py)."
  exit 1
fi

"${PYTHON_CMD[@]}" - <<'PY'
from pathlib import Path

def read(path):
    return Path(path).read_text(encoding="utf-8")

def write(path, text):
    Path(path).write_text(text, encoding="utf-8", newline="\n")

def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"BŁĄD PATCHA: nie znaleziono fragmentu: {label}")
    if text.count(old) != 1:
        raise SystemExit(f"BŁĄD PATCHA: fragment '{label}' występuje {text.count(old)} razy zamiast 1.")
    return text.replace(old, new, 1)

path = "shared/walidatory-bur.js"
text = read(path)

table_fn_marker = '''  function znajdźPoleWTabeli(dokument, tytułTabeli, nazwaKolumny) {
    const tabele = Array.from(dokument.querySelectorAll("table"));'''
if table_fn_marker in text and "znajdźPoleWTabeliBur(dokument, tytułTabeli, nazwaKolumny)" not in text:
    text = replace_once(
        text,
        table_fn_marker,
        '''  function znajdźPoleWTabeli(dokument, tytułTabeli, nazwaKolumny) {
    if (typeof przestrzeń.znajdźPoleWTabeliBur === "function") {
      const wspólnePole = przestrzeń.znajdźPoleWTabeliBur(dokument, tytułTabeli, nazwaKolumny);
      if (wspólnePole) {
        return wspólnePole;
      }
    }

    const tabele = Array.from(dokument.querySelectorAll("table"));''',
        "delegowanie walidatora do wspólnego adaptera tabel"
    )

old_method = '''      {
        pole: "Wybierz metodę walidacji",
        kolumna: "Metody walidacji",
        oczekiwanaWartość: "Uzupełniona metoda walidacji",
        tylkoNiepuste: true
      }'''
new_method = '''      {
        pole: "Wybierz metodę walidacji",
        kolumna: "Metody walidacji",
        oczekiwanaWartość: "Wywiad swobodny"
      }'''
text = replace_once(text, old_method, new_method, "dokładna walidacja metody 'Wywiad swobodny'")
write(path, text)

path = "shared/cele-formularza-bur.js"
text = read(path)

old_defs = '''    kompetencje: definicjaCelu("kompetencje", { selektoryAwaryjne: ["#qualificationsZrk .field-glownyceluslugisekcja-czyuslugaprowadzidonabyciakompetencji"], sekcja: "Główny cel usługi", etykieta: "Czy usługa prowadzi do nabycia kompetencji?", typKontrolki: "input" }),
    efektyUczenia: definicjaCelu("efektyUczenia", { sekcja: "Główny cel usługi", etykieta: "Efekty uczenia się", typKontrolki: "tabela" }),
    kryteriaWeryfikacji: definicjaCelu("kryteriaWeryfikacji", { sekcja: "Główny cel usługi", etykieta: "Kryteria weryfikacji", typKontrolki: "tabela" }),
    metodaWalidacji: definicjaCelu("metodaWalidacji", { sekcja: "Główny cel usługi", etykieta: "Wybierz metodę walidacji", typKontrolki: "select2" })'''
new_defs = '''    kompetencje: definicjaCelu("kompetencje", { selektoryAwaryjne: ["#qualificationsZrk .field-glownyceluslugisekcja-czyuslugaprowadzidonabyciakompetencji"], sekcja: "Główny cel usługi", etykieta: "Czy usługa prowadzi do nabycia kompetencji?", typKontrolki: "input" }),
    kompetencjeDokument: definicjaCelu("kompetencjeDokument", { sekcja: "Główny cel usługi", etykieta: "Czy dokument potwierdzający uzyskanie kompetencji", typKontrolki: "input" }),
    kompetencjeWalidacja: definicjaCelu("kompetencjeWalidacja", { sekcja: "Główny cel usługi", etykieta: "Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają, że walidacja", typKontrolki: "input" }),
    kompetencjeRozwiazania: definicjaCelu("kompetencjeRozwiazania", { sekcja: "Główny cel usługi", etykieta: "Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają zastosowanie rozwiązań", typKontrolki: "input" }),
    efektyUczenia: definicjaCelu("efektyUczenia", { sekcja: "Główny cel usługi", etykieta: "Efekty uczenia się", tabela: "Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji", kolumna: "Efekty uczenia się", typKontrolki: "tabela" }),
    kryteriaWeryfikacji: definicjaCelu("kryteriaWeryfikacji", { sekcja: "Główny cel usługi", etykieta: "Kryteria weryfikacji", tabela: "Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji", kolumna: "Kryteria weryfikacji", typKontrolki: "tabela" }),
    metodaWalidacji: definicjaCelu("metodaWalidacji", { sekcja: "Główny cel usługi", etykieta: "Wybierz metodę walidacji", tabela: "Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji", kolumna: "Metody walidacji", typKontrolki: "select2" })'''
text = replace_once(text, old_defs, new_defs, "rejestr celów dla kompetencji i tabeli efektów")

old_map = '''    "Czy usługa prowadzi do nabycia kompetencji?": "kompetencje",
    "Efekty uczenia się": "efektyUczenia",'''
new_map = '''    "Czy usługa prowadzi do nabycia kompetencji?": "kompetencje",
    "Pytanie 1 w sekcji kompetencji": "kompetencjeDokument",
    "Pytanie 2 w sekcji kompetencji": "kompetencjeWalidacja",
    "Pytanie 3 w sekcji kompetencji": "kompetencjeRozwiazania",
    "Efekty uczenia się": "efektyUczenia",'''
text = replace_once(text, old_map, new_map, "mapowanie pytań kompetencji do nawigacji")

old_find = '''    let element = znajdźPierwszyWidoczny(dokument, cel.selektory);
    if (!element) {
      element = znajdźPierwszyWidoczny(dokument, cel.selektoryAwaryjne);
    }'''
new_find = '''    let element = null;
    if (cel.tabela && cel.kolumna && typeof przestrzeń.znajdźPoleWTabeliBur === "function") {
      element = przestrzeń.znajdźPoleWTabeliBur(dokument, cel.tabela, cel.kolumna);
    }
    if (!element) {
      element = znajdźPierwszyWidoczny(dokument, cel.selektory);
    }
    if (!element) {
      element = znajdźPierwszyWidoczny(dokument, cel.selektoryAwaryjne);
    }'''
text = replace_once(text, old_find, new_find, "nawigacja do komórek tabeli przez wspólny adapter")
write(path, text)

path = "content/bur-content.js"
text = read(path)

old = '''          sekcja: pozycja.sekcja,
          pole: pozycja.pole,
          status: pozycja.status,'''
new = '''          sekcja: pozycja.sekcja,
          pole: pozycja.pole,
          celFormularza: pozycja.celFormularza,
          status: pozycja.status,'''
text = replace_once(text, old, new, "przekazanie celFormularza do panelu")
write(path, text)
PY

for plik in "${TARGETS[@]}"; do
  node --check "$plik"
done

git diff --check
git diff -- "${TARGETS[@]}"

git add "${TARGETS[@]}"
git commit -m "fix: domknij efekty uczenia i walidacje BUR"

echo "OK: Patch 2 zastosowany i zapisany w lokalnym commicie."
