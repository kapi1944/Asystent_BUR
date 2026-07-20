#!/usr/bin/env bash
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO"

TARGETS=(
  "shared/selektory-bur.js"
  "shared/przygotowanie-wypelnienia-bur.js"
  "shared/wypełniacz-bur.js"
)

echo "== PATCH 1/4: wspólny adapter pól BUR =="
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

def require(text, needle, label):
    if needle not in text:
        raise SystemExit(f"BŁĄD PATCHA: nie znaleziono oczekiwanego fragmentu: {label}")

def replace_once(text, old, new, label):
    require(text, old, label)
    if text.count(old) != 1:
        raise SystemExit(f"BŁĄD PATCHA: fragment '{label}' występuje {text.count(old)} razy zamiast 1.")
    return text.replace(old, new, 1)

def replace_function(text, name, next_name, new_body):
    start_marker = f"  function {name}("
    next_marker = f"\n  function {next_name}("
    start = text.find(start_marker)
    if start < 0:
        raise SystemExit(f"BŁĄD PATCHA: brak funkcji {name}.")
    end = text.find(next_marker, start)
    if end < 0:
        raise SystemExit(f"BŁĄD PATCHA: nie znaleziono funkcji następującej po {name}: {next_name}.")
    return text[:start] + new_body.rstrip() + "\n" + text[end:]

path = "shared/selektory-bur.js"
text = read(path)

table_helper = r'''
  function znajdźPoleWTabeliBur(dokument, tytułTabeli, nazwaKolumny) {
    const tabele = Array.from(dokument.querySelectorAll("table"));
    const kluczTabeli = normalizujKluczBur(tytułTabeli);
    const kluczKolumny = normalizujKluczBur(nazwaKolumny);

    for (let indeksTabeli = 0; indeksTabeli < tabele.length; indeksTabeli += 1) {
      const tabela = tabele[indeksTabeli];
      const tekstTabeli = normalizujKluczBur(tabela.textContent || "");

      if (kluczTabeli && !tekstTabeli.includes(kluczTabeli)) {
        continue;
      }

      const kandydaciNagłówków = Array.from(tabela.querySelectorAll("thead th, thead td"));
      const nagłówki = kandydaciNagłówków.length
        ? kandydaciNagłówków
        : Array.from(tabela.querySelectorAll("tr:first-child th, tr:first-child td"));
      const indeksKolumny = nagłówki.findIndex(function sprawdźNagłówek(nagłówek) {
        return normalizujKluczBur(nagłówek.textContent || "").includes(kluczKolumny);
      });

      if (indeksKolumny < 0) {
        continue;
      }

      const wiersze = Array.from(tabela.querySelectorAll("tbody tr, tr")).filter(function zostawWiersz(wiersz) {
        const komórki = Array.from(wiersz.children || []).filter(function tylkoKomórki(element) {
          return element.tagName === "TD";
        });
        return komórki.length > indeksKolumny;
      });

      for (let indeksWiersza = 0; indeksWiersza < wiersze.length; indeksWiersza += 1) {
        const komórki = Array.from(wiersze[indeksWiersza].children || []).filter(function tylkoKomórki(element) {
          return element.tagName === "TD";
        });
        const komórka = komórki[indeksKolumny];

        if (!komórka) {
          continue;
        }

        const kontrolka = komórka.querySelector(
          "input:not([type='hidden']), textarea, select, .ql-editor, "
          + "[id^='select2-'][id$='-container'], .select2-selection__rendered, "
          + ".select2-selection, [contenteditable='true']"
        );

        if (kontrolka) {
          return kontrolka;
        }

        if (komórka.querySelector("input[type='hidden']")) {
          return komórka;
        }

        if (normalizujTekstDoWalidacji(komórka.textContent || "")) {
          return komórka;
        }
      }
    }

    return null;
  }

'''

marker = "  function znajdźPoleBur(dokument, definicjaPola) {"
require(text, marker, "miejsce dodania wspólnego lokalizatora tabeli")
if "function znajdźPoleWTabeliBur(" not in text:
    text = text.replace(marker, table_helper + marker, 1)

needle = '''    const definicja = definicjaPola || {};
    let pole = null;

    if (definicja.selektory) {'''
replacement = '''    const definicja = definicjaPola || {};
    let pole = null;

    if (definicja.tabela && definicja.kolumna) {
      pole = znajdźPoleWTabeliBur(dokument, definicja.tabela, definicja.kolumna);
      if (pole) {
        return { element: pole, metodaZnalezienia: "tabela", selektor: "" };
      }
    }

    if (definicja.selektory) {'''
if 'metodaZnalezienia: "tabela"' not in text:
    text = replace_once(text, needle, replacement, "obsługa tabela+kolumna w znajdźPoleBurZSzczegółami")

new_select2 = r'''  function pobierzTekstSelect2(elementLubKontener) {
    if (!elementLubKontener) {
      return "";
    }

    if (elementLubKontener.tagName === "SELECT") {
      const opcja = elementLubKontener.selectedOptions && elementLubKontener.selectedOptions[0];
      return normalizujTekstDoWalidacji(opcja ? (opcja.textContent || opcja.label || "") : "");
    }

    const element = elementLubKontener.matches && elementLubKontener.matches(
      "[id^='select2-'][id$='-container'], .select2-selection__rendered, .select2-selection"
    )
      ? elementLubKontener
      : elementLubKontener.querySelector && elementLubKontener.querySelector(
        "[id^='select2-'][id$='-container'], .select2-selection__rendered, .select2-selection"
      );

    if (element) {
      return normalizujTekstDoWalidacji(element.getAttribute("title") || element.textContent || "");
    }

    if (elementLubKontener.id) {
      const dokument = elementLubKontener.ownerDocument || document;
      const widoczny = dokument.getElementById("select2-" + elementLubKontener.id + "-container");
      if (widoczny) {
        return normalizujTekstDoWalidacji(widoczny.getAttribute("title") || widoczny.textContent || "");
      }
    }

    return "";
  }'''
text = replace_function(text, "pobierzTekstSelect2", "pobierzWartośćQuill", new_select2)

export_marker = "  przestrzeń.znajdźPoleBur = znajdźPoleBur;"
if "przestrzeń.znajdźPoleWTabeliBur = znajdźPoleWTabeliBur;" not in text:
    text = replace_once(
        text,
        export_marker,
        "  przestrzeń.znajdźPoleWTabeliBur = znajdźPoleWTabeliBur;\n" + export_marker,
        "eksport lokalizatora tabeli"
    )

write(path, text)

path = "shared/przygotowanie-wypelnienia-bur.js"
text = read(path)

new_prepare = r'''  function przygotujPropozycje(dokument, szkolenie, termin) {
    return przestrzeń.pobierzDefinicjePólWypełnieniaBur({
      szkolenieSemper: szkolenie || {},
      wybranyTermin: termin || {}
    }).map(function utwórz(definicja) {
      const znalezione = przestrzeń.znajdźPoleBurZSzczegółami
        ? przestrzeń.znajdźPoleBurZSzczegółami(dokument, definicja.definicjaPola || {})
        : { element: null, metodaZnalezienia: "brak", selektor: "" };
      const element = znalezione.element;
      let aktualna = "";

      if (element) {
        if (definicja.typPola === "przełącznik" && przestrzeń.pobierzStanPrzełącznika) {
          aktualna = przestrzeń.pobierzStanPrzełącznika(element) || "";
        } else {
          aktualna = przestrzeń.pobierzWartośćPola(element) || "";
        }
      }

      const proponowana = definicja.wartośćProponowana;
      const zgodne = definicja.typPola === "data" && przestrzeń.normalizujDatęBur
        ? przestrzeń.normalizujDatęBur(aktualna) === przestrzeń.normalizujDatęBur(proponowana)
        : String(aktualna || "").trim() === String(proponowana || "").trim();
      const status = !element
        ? "brak_pola_bur"
        : !proponowana
          ? "brak_danych_źródłowych"
          : zgodne
            ? "bez_zmiany"
            : aktualna
              ? "konflikt"
              : "uzupełnienie_pustego";

      return Object.assign({}, definicja, {
        wartośćAktualna: aktualna,
        status: status,
        domyślnieZaznaczona: status === "uzupełnienie_pustego",
        komunikat: status === "konflikt"
          ? "Istniejąca wartość wymaga świadomej decyzji."
          : "",
        metodaZnalezienia: znalezione.metodaZnalezienia || "",
        selektorZnaleziony: znalezione.selektor || ""
      });
    });
  }'''

start = text.find("  function przygotujPropozycje(")
end = text.find("\n  przestrzeń.przygotujPropozycjeWypełnieniaBur", start)
if start < 0 or end < 0:
    raise SystemExit("BŁĄD PATCHA: nie znaleziono funkcji przygotujPropozycje.")
text = text[:start] + new_prepare.rstrip() + text[end:]
write(path, text)

path = "shared/wypełniacz-bur.js"
text = read(path)

old_select2_technical = '''    if (typ === "select2") {
      const select = znajdźUkrytySelect2(element.ownerDocument || document, element);
      return select && "value" in select ? String(select.value || "") : "";
    }'''
new_select2_technical = '''    if (typ === "select2") {
      return przestrzeń.pobierzWartośćPola
        ? przestrzeń.pobierzWartośćPola(element)
        : "";
    }'''
text = replace_once(
    text,
    old_select2_technical,
    new_select2_technical,
    "odczyt widocznego tekstu Select2 podczas weryfikacji"
)

new_local_table = r'''  function znajdźPoleWTabeli(dokument, tytułTabeli, nazwaKolumny) {
    if (typeof przestrzeń.znajdźPoleWTabeliBur === "function") {
      return przestrzeń.znajdźPoleWTabeliBur(dokument, tytułTabeli, nazwaKolumny);
    }
    return null;
  }'''
text = replace_function(text, "znajdźPoleWTabeli", "wypełnijFormularzWstępny", new_local_table)

write(path, text)
PY

for plik in "${TARGETS[@]}"; do
  node --check "$plik"
done

git diff --check
git diff -- "${TARGETS[@]}"

git add "${TARGETS[@]}"
git commit -m "fix: ujednolic adapter pól BUR dla podglądu i zapisu"

echo "OK: Patch 1 zastosowany i zapisany w lokalnym commicie."
