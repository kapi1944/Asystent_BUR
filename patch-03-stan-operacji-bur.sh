#!/usr/bin/env bash
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO"

TARGETS=("panel/panel.js")

echo "== PATCH 3/4: cykl życia operacji BUR =="
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

path = Path("panel/panel.js")
text = path.read_text(encoding="utf-8")

def replace_once(old, new, label):
    global text
    if old not in text:
        raise SystemExit(f"BŁĄD PATCHA: nie znaleziono fragmentu: {label}")
    if text.count(old) != 1:
        raise SystemExit(f"BŁĄD PATCHA: fragment '{label}' występuje {text.count(old)} razy zamiast 1.")
    text = text.replace(old, new, 1)

helper_marker = '''  function wyczyśćDecyzjęHarmonogramuBur() {'''
helper = r'''  function zakończOperacjęBurBłędem(etap, komunikat) {
    const treść = komunikat || "Nieznany błąd operacji BUR.";

    if (!aktywnaOperacjaBur) {
      podglądWypełnieniaBur = null;
      elementy.przyciskZastosujZmianyBur.disabled = true;
      return Promise.resolve();
    }

    if (aktywnaOperacjaBur.etap !== "błąd" && aktywnaOperacjaBur.etap !== "zakończono") {
      try {
        aktywnaOperacjaBur = przestrzeń.zapiszBłądOperacjiBur(
          aktywnaOperacjaBur,
          etap || aktywnaOperacjaBur.etap,
          treść
        );
      } catch (błądStanu) {
        aktywnaOperacjaBur = Object.assign({}, aktywnaOperacjaBur, {
          etap: "błąd",
          blokuje: false,
          zaktualizowano: new Date().toISOString(),
          błąd: {
            etap: etap || aktywnaOperacjaBur.etap,
            komunikat: treść,
            czas: new Date().toISOString()
          }
        });
      }
    }

    podglądWypełnieniaBur = null;
    elementy.przyciskZastosujZmianyBur.disabled = true;

    return zapiszStorage({
      aktywnaOperacjaBur: aktywnaOperacjaBur,
      podglądWypełnieniaBur: null
    }).then(function odświeżPoBłędzie() {
      odświeżStatusOperacjiBur();
    });
  }

'''
if "function zakończOperacjęBurBłędem(" not in text:
    replace_once(helper_marker, helper + helper_marker, "miejsce dodania helpera błędu operacji")

start = text.find("  function zastosujZatwierdzoneZmianyBur() {")
end = text.find("\n  function odczytajOstatniImport()", start)
if start < 0 or end < 0:
    raise SystemExit("BŁĄD PATCHA: nie znaleziono funkcji zastosujZatwierdzoneZmianyBur.")

new_apply = r'''  function zastosujZatwierdzoneZmianyBur() {
    if (!podglądWypełnieniaBur || !aktywnaOperacjaBur) {
      return;
    }

    const wybrane = (podglądWypełnieniaBur.propozycje || []).filter(function tylkoZaznaczone(propozycja) {
      return propozycja.zaznaczona;
    });

    if (!wybrane.length) {
      ustawStatus(elementy.statusSemper, "Nie zaznaczono żadnych zmian do zastosowania.", "status-ostrzezenie");
      return;
    }

    pobierzAktywnąKartę()
      .then(function zastosuj(karta) {
        if (!karta || karta.id !== podglądWypełnieniaBur.kartaId) {
          throw new Error("Zmieniła się karta BUR — przygotuj podgląd ponownie.");
        }

        aktywnaOperacjaBur = przestrzeń.przejdźOperacjęBur(aktywnaOperacjaBur, "wprowadzanie");

        return zapiszStorage({ aktywnaOperacjaBur: aktywnaOperacjaBur }).then(function wyślij() {
          return wyślijDoKarty(karta, {
            typ: komunikaty.ZASTOSUJ_ZATWIERDZONE_ZMIANY_BUR,
            propozycje: podglądWypełnieniaBur.propozycje
          });
        });
      })
      .then(function raportuj(odpowiedź) {
        const wynik = odpowiedź && odpowiedź.wynik ? odpowiedź.wynik : {};
        const wyniki = Array.isArray(wynik.wyniki) ? wynik.wyniki : [];
        const nieudane = wyniki.filter(function tylkoNieudane(pozycja) {
          return !pozycja.ok;
        });

        pokażWynikWypełnianiaBur({
          uzupełnione: wyniki.filter(function tylkoUdane(pozycja) { return pozycja.ok; }),
          ostrzeżenia: [],
          błędy: nieudane,
          pominięte: []
        });

        if (!wynik.ok || nieudane.length) {
          const pierwszyBłąd = nieudane[0];
          throw new Error(
            pierwszyBłąd && pierwszyBłąd.komunikat
              ? pierwszyBłąd.komunikat
              : "Nie wszystkie zatwierdzone zmiany zostały potwierdzone przez BUR."
          );
        }

        aktywnaOperacjaBur = przestrzeń.przejdźOperacjęBur(aktywnaOperacjaBur, "walidowanie");
        aktywnaOperacjaBur = przestrzeń.przejdźOperacjęBur(aktywnaOperacjaBur, "zakończono");
        podglądWypełnieniaBur = null;

        return zapiszStorage({
          aktywnaOperacjaBur: aktywnaOperacjaBur,
          podglądWypełnieniaBur: null
        });
      })
      .then(function zakończ() {
        odświeżStatusOperacjiBur();
        elementy.przyciskZastosujZmianyBur.disabled = true;
        ustawStatus(elementy.statusSemper, "Zastosowano i potwierdzono wszystkie wybrane zmiany.", "status-odczytano");
      })
      .catch(function pokażBłąd(wyjątek) {
        const komunikat = wyjątek && wyjątek.message
          ? wyjątek.message
          : "Nie udało się zastosować zmian BUR.";

        return zakończOperacjęBurBłędem(
          aktywnaOperacjaBur ? aktywnaOperacjaBur.etap : "wprowadzanie",
          komunikat
        ).then(function pokażStatus() {
          ustawStatus(elementy.statusSemper, komunikat + " Przygotuj podgląd ponownie.", "status-blad");
        });
      });
  }'''

text = text[:start] + new_apply.rstrip() + text[end:]

old_catch = '''      .catch(function pokażBłąd(błąd) {
        ustawStatus(elementy.statusSemper, błąd && błąd.message ? błąd.message : "Nie udało się wypełnić formularza BUR.", "status-blad");
      })'''
new_catch = '''      .catch(function pokażBłąd(błąd) {
        const komunikat = błąd && błąd.message
          ? błąd.message
          : "Nie udało się przygotować podglądu zmian formularza BUR.";

        return zakończOperacjęBurBłędem(
          aktywnaOperacjaBur ? aktywnaOperacjaBur.etap : "przygotowywanie",
          komunikat
        ).then(function pokażStatus() {
          ustawStatus(elementy.statusSemper, komunikat, "status-blad");
        });
      })'''
replace_once(old_catch, new_catch, "obsługa błędu przygotowania podglądu")

path.write_text(text, encoding="utf-8", newline="\n")
PY

node --check panel/panel.js
git diff --check
git diff -- panel/panel.js

git add panel/panel.js
git commit -m "fix: napraw cykl zycia operacji BUR"

echo "OK: Patch 3 zastosowany i zapisany w lokalnym commicie."
