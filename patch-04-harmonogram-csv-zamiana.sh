#!/usr/bin/env bash
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO"

TARGETS=(
  "shared/komunikaty.js"
  "content/bur-content.js"
  "panel/panel.js"
)

echo "== PATCH 4/4: bezpieczna zamiana harmonogramu CSV =="
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

def replace_function(text, name, next_name, new_body):
    start = text.find(f"  function {name}(")
    if start < 0:
        start = text.find(f"  async function {name}(")

    koniec_zwykly = text.find(f"\\n  function {next_name}(", start)
    koniec_async = text.find(f"\\n  async function {next_name}(", start)

    kandydaci = [x for x in (koniec_zwykly, koniec_async) if x >= 0]
    end = min(kandydaci) if kandydaci else -1

    if start < 0 or end < 0:
        raise SystemExit(f"BŁĄD PATCHA: nie udało się podmienić funkcji {name}.")
    return text[:start] + new_body.rstrip() + "\\n" + text[end:]'''

# shared/komunikaty.js
path = "shared/komunikaty.js"
text = read(path)
old = '''    WPROWADŹ_HARMONOGRAM_DO_BUR: "WPROWADŹ_HARMONOGRAM_DO_BUR",
    IMPORTUJ_HARMONOGRAM_XLSX_BUR: "IMPORTUJ_HARMONOGRAM_XLSX_BUR",'''
new = '''    WPROWADŹ_HARMONOGRAM_DO_BUR: "WPROWADŹ_HARMONOGRAM_DO_BUR",
    ZASTĄP_HARMONOGRAM_BUR: "ZASTĄP_HARMONOGRAM_BUR",
    IMPORTUJ_HARMONOGRAM_XLSX_BUR: "IMPORTUJ_HARMONOGRAM_XLSX_BUR",'''
if 'ZASTĄP_HARMONOGRAM_BUR:' not in text:
    text = replace_once(text, old, new, "nowy komunikat zamiany harmonogramu")
write(path, text)

# content/bur-content.js
path = "content/bur-content.js"
text = read(path)

new_read = r'''  function odczytajWierszeHarmonogramu() {
    const tabela = document.querySelector(selektory.tabelaHarmonogramu);

    if (!tabela) {
      return [];
    }

    function normalizujNagłówek(wartość) {
      return String(wartość || "")
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
        .replace(/ł/g, "l")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    const nagłówki = Array.from(tabela.querySelectorAll("thead th, thead td"));
    const listaNagłówków = nagłówki.length
      ? nagłówki
      : Array.from(tabela.querySelectorAll("tr:first-child th, tr:first-child td"));
    const mapa = {};

    listaNagłówków.forEach(function mapujNagłówek(element, indeks) {
      const klucz = normalizujNagłówek(element.textContent || "");
      if (/^lp\.?$/.test(klucz)) { mapa.lp = indeks; }
      else if (klucz.includes("typ aktywnosci")) { mapa.typ = indeks; }
      else if (klucz === "data" || klucz.includes("termin")) { mapa.data = indeks; }
      else if (klucz === "od" || klucz.includes("godzina od")) { mapa.od = indeks; }
      else if (klucz === "do" || klucz.includes("godzina do")) { mapa.do = indeks; }
      else if (klucz.includes("przedmiot") || klucz.includes("temat")) { mapa.temat = indeks; }
      else if (klucz.includes("prowadzac")) { mapa.prowadzacy = indeks; }
    });

    function wartość(komórki, indeks, zapasowy) {
      const wybrany = Number.isInteger(indeks) ? indeks : zapasowy;
      const komórka = komórki[wybrany];
      return komórka ? String(komórka.textContent || "").replace(/\s+/g, " ").trim() : "";
    }

    return pobierzWierszeTabeliHarmonogramu().map(function odczytaj(wiersz, indeks) {
      const komórki = Array.from(wiersz.children || []).filter(function tylkoTd(element) {
        return element.tagName === "TD";
      });

      return {
        numer: Number(wartość(komórki, mapa.lp, 0)) || indeks + 1,
        typAktywności: wartość(komórki, mapa.typ, 1),
        data: wartość(komórki, mapa.data, 2),
        od: wartość(komórki, mapa.od, 3),
        do: wartość(komórki, mapa.do, 4),
        przedmiot: wartość(komórki, mapa.temat, 5),
        prowadzący: wartość(komórki, mapa.prowadzacy, 6),
        tekst: String(wiersz.textContent || "").replace(/\s+/g, " ").trim()
      };
    }).filter(function zostaw(wiersz) {
      return Boolean(wiersz.tekst);
    });
  }'''
text = replace_function(text, "odczytajWierszeHarmonogramu", "pobierzLiczbęPozycjiWTabeli", new_read)

new_verify = r'''  function sprawdzHarmonogramPoWypelnieniu(oczekiwanePozycje) {
    const oczekiwane = Array.isArray(oczekiwanePozycje) ? oczekiwanePozycje : [];
    const wiersze = odczytajWierszeHarmonogramu();
    const błędy = [];
    const ostrzeżenia = [];
    const różnice = [];
    const ostatniDzień = oczekiwane.length ? oczekiwane[oczekiwane.length - 1].dzien_swiadczenia : "";

    function normalizuj(wartość) {
      return String(wartość || "")
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    }

    function porównaj(indeks, pole, oczekiwana, aktualna) {
      if (normalizuj(oczekiwana) === normalizuj(aktualna)) {
        return;
      }

      różnice.push({
        pozycja: indeks + 1,
        pole: pole,
        oczekiwane: oczekiwana || "",
        aktualne: aktualna || ""
      });
      ostrzeżenia.push(
        "Pozycja " + (indeks + 1) + ", " + pole
        + ": oczekiwano „" + (oczekiwana || "") + "”, odczytano „" + (aktualna || "") + "”."
      );
    }

    if (wiersze.length < oczekiwane.length) {
      błędy.push("Tabela zawiera " + wiersze.length + " pozycji, oczekiwano co najmniej " + oczekiwane.length + ".");
    } else if (wiersze.length > oczekiwane.length) {
      ostrzeżenia.push("Tabela zawiera " + wiersze.length + " pozycji, przygotowany harmonogram ma " + oczekiwane.length + ".");
    }

    oczekiwane.forEach(function sprawdźPozycję(pozycja, indeks) {
      const aktualna = wiersze[indeks];

      if (aktualna) {
        porównaj(indeks, "Typ aktywności", pozycja.typ_aktywnosci, aktualna.typAktywności);
        porównaj(indeks, "Data", pozycja.dzien_swiadczenia, aktualna.data);
        porównaj(indeks, "Od", pozycja.czas_rozpoczecia, aktualna.od);
        porównaj(indeks, "Do", pozycja.czas_zakonczenia, aktualna.do);
        porównaj(indeks, "Przedmiot/temat", pozycja.przedmiot, aktualna.przedmiot);
        porównaj(indeks, "Prowadzący", pozycja.prowadzacy, aktualna.prowadzący);
      }

      if (pozycja.typ_aktywnosci === "Przerwa" && (pozycja.przedmiot || pozycja.prowadzacy)) {
        błędy.push("Przerwa nie powinna mieć tematu ani prowadzącego.");
      }

      if (pozycja.typ_aktywnosci === "Zajęcia" && (!pozycja.przedmiot || !pozycja.prowadzacy)) {
        błędy.push("Zajęcia powinny mieć temat i trenera.");
      }

      if (pozycja.typ_aktywnosci === "Walidacja") {
        if (pozycja.dzien_swiadczenia !== ostatniDzień) {
          błędy.push("Walidacja występuje poza ostatnim dniem.");
        }
        if (pozycja.przedmiot) {
          błędy.push("Walidacja powinna mieć pusty przedmiot/temat.");
        }
      }
    });

    ["Zajęcia", "Przerwa", "Walidacja"].forEach(function sprawdźTyp(typ) {
      if (!oczekiwane.some(function czyJest(pozycja) { return pozycja.typ_aktywnosci === typ; })) {
        błędy.push("Brak pozycji typu " + typ + " w oczekiwanym harmonogramie.");
      }
    });

    return {
      ok: błędy.length === 0,
      błędy: błędy,
      ostrzeżenia: ostrzeżenia,
      różnice: różnice,
      wierszeOdczytane: wiersze
    };
  }'''
text = replace_function(text, "sprawdzHarmonogramPoWypelnieniu", "importujCsvBezFallbacku", new_verify)

old_failure = '''    return {
      ok: false,
      metoda: "CSV",
      błąd: wynikImportu.błąd || "BUR nie potwierdził importu harmonogramu CSV.",
      fallbackDostępny: true,
      liczbaOczekiwanychPozycji: Array.isArray(pozycje) ? pozycje.length : 0,
      liczbaPozycjiWTabeli: pobierzLiczbęPozycjiWTabeli(),
      nazwaPliku: wynikImportu.nazwaPliku || "harmonogram-bur.csv",
      typPliku: wynikImportu.typPliku || "text/csv;charset=utf-8",
      rozmiarPliku: wynikImportu.rozmiarPliku || 0,
      diagnostyka: wynikImportu.diagnostyka || null
    };'''
new_failure = '''    const liczbaPoNieudanymImporcie = pobierzLiczbęPozycjiWTabeli();

    return {
      ok: false,
      metoda: "CSV",
      błąd: wynikImportu.błąd || "BUR nie potwierdził importu harmonogramu CSV.",
      fallbackDostępny: liczbaPoNieudanymImporcie === 0,
      częściowyImport: liczbaPoNieudanymImporcie > 0,
      liczbaOczekiwanychPozycji: Array.isArray(pozycje) ? pozycje.length : 0,
      liczbaPozycjiWTabeli: liczbaPoNieudanymImporcie,
      nazwaPliku: wynikImportu.nazwaPliku || "harmonogram-bur.csv",
      typPliku: wynikImportu.typPliku || "text/csv;charset=utf-8",
      rozmiarPliku: wynikImportu.rozmiarPliku || 0,
      diagnostyka: wynikImportu.diagnostyka || null
    };'''
text = replace_once(text, old_failure, new_failure, "blokada fallbacku po częściowym imporcie")

insert_marker = "  async function wprowadźHarmonogramDoBur(pozycje) {"
delete_helpers = r'''  function znajdźPrzyciskUsunięciaWierszaHarmonogramu(wiersz) {
    if (!wiersz) {
      return null;
    }

    return Array.from(wiersz.querySelectorAll("button, a, [role='button']")).find(function znajdź(element) {
      const opis = [
        element.textContent,
        element.getAttribute("title"),
        element.getAttribute("aria-label"),
        element.id,
        element.className
      ].join(" ").replace(/\s+/g, " ").trim();

      return /usuń|usun|delete|trash/i.test(opis)
        || Boolean(element.querySelector(".glyphicon-trash, .fa-trash, .fa-trash-alt, [class*='trash']"));
    }) || null;
  }

  async function usuńIstniejącyHarmonogramBur() {
    const maksymalnaLiczbaUsunięć = 100;
    let usunięto = 0;

    for (let próba = 0; próba < maksymalnaLiczbaUsunięć; próba += 1) {
      const wiersze = pobierzWierszeTabeliHarmonogramu();

      if (!wiersze.length) {
        return {
          ok: true,
          usunięto: usunięto,
          liczbaPozycjiWTabeli: 0
        };
      }

      const wiersz = wiersze[wiersze.length - 1];
      const przyciskUsuń = znajdźPrzyciskUsunięciaWierszaHarmonogramu(wiersz);

      if (!przyciskUsuń) {
        return {
          ok: false,
          usunięto: usunięto,
          liczbaPozycjiWTabeli: wiersze.length,
          błąd: "Nie znaleziono bezpiecznego przycisku usuwania w jednym z wierszy harmonogramu. Przerwano przed importem nowego CSV."
        };
      }

      const liczbaPrzed = wiersze.length;
      przyciskUsuń.click();

      let zmniejszono = false;
      for (let oczekiwanie = 0; oczekiwanie < 20; oczekiwanie += 1) {
        await opóźnij(150);
        if (pobierzWierszeTabeliHarmonogramu().length < liczbaPrzed) {
          zmniejszono = true;
          break;
        }
      }

      if (!zmniejszono) {
        return {
          ok: false,
          usunięto: usunięto,
          liczbaPozycjiWTabeli: pobierzLiczbęPozycjiWTabeli(),
          błąd: "BUR nie potwierdził usunięcia wiersza harmonogramu. Przerwano przed importem nowego CSV."
        };
      }

      usunięto += 1;
    }

    return {
      ok: false,
      usunięto: usunięto,
      liczbaPozycjiWTabeli: pobierzLiczbęPozycjiWTabeli(),
      błąd: "Przekroczono bezpieczny limit usuwania pozycji harmonogramu."
    };
  }

  async function zastąpHarmonogramDoBur(pozycje) {
    const pozycjeHarmonogramu = Array.isArray(pozycje) ? pozycje : [];

    if (!pozycjeHarmonogramu.length) {
      return {
        ok: false,
        błąd: "Brak przygotowanego harmonogramu CSV."
      };
    }

    const wynikUsuwania = await usuńIstniejącyHarmonogramBur();

    if (!wynikUsuwania.ok) {
      return Object.assign({
        ok: false,
        metoda: "CSV",
        etap: "usuwanie istniejącego harmonogramu"
      }, wynikUsuwania);
    }

    if (pobierzLiczbęPozycjiWTabeli() !== 0) {
      return {
        ok: false,
        metoda: "CSV",
        błąd: "Tabela nadal zawiera rzeczywiste pozycje po próbie usunięcia. Nowy CSV nie został zaimportowany.",
        usunięto: wynikUsuwania.usunięto,
        liczbaPozycjiWTabeli: pobierzLiczbęPozycjiWTabeli()
      };
    }

    const wynikImportu = await importujHarmonogramPrzezCsv(pozycjeHarmonogramu);
    wynikImportu.usuniętoPoprzednichPozycji = wynikUsuwania.usunięto;
    return wynikImportu;
  }

'''
if "async function zastąpHarmonogramDoBur(" not in text:
    text = replace_once(text, insert_marker, delete_helpers + insert_marker, "funkcje bezpiecznej zamiany harmonogramu")

handler_marker = '''    if (wiadomosc.typ === komunikaty.WPROWADŹ_HARMONOGRAM_DO_BUR || wiadomosc.typ === komunikaty.IMPORTUJ_HARMONOGRAM_XLSX_BUR) {'''
new_handler = r'''    if (wiadomosc.typ === komunikaty.ZASTĄP_HARMONOGRAM_BUR) {
      zastąpHarmonogramDoBur(wiadomosc.pozycje || [])
        .then(function zwróćWynik(wynik) {
          odpowiedz({
            typ: komunikaty.ODPOWIEDŹ_PROGRAM_I_HARMONOGRAM_BUR,
            wynik: wynik
          });
        })
        .catch(function zwróćBłąd(błąd) {
          odpowiedz({
            typ: komunikaty.ODPOWIEDŹ_PROGRAM_I_HARMONOGRAM_BUR,
            wynik: {
              ok: false,
              błąd: błąd && błąd.message ? błąd.message : "Nie udało się zastąpić harmonogramu BUR."
            }
          });
        });

      return true;
    }

'''
if "wiadomosc.typ === komunikaty.ZASTĄP_HARMONOGRAM_BUR" not in text:
    text = replace_once(text, handler_marker, new_handler + handler_marker, "handler zamiany harmonogramu")

write(path, text)

# panel/panel.js
path = "panel/panel.js"
text = read(path)

start = text.find("  function pokażKonfliktHarmonogramuBur(wynik) {")
end = text.find("\n  function przygotujHarmonogramWPanelu()", start)
if start < 0 or end < 0:
    raise SystemExit("BŁĄD PATCHA: nie znaleziono funkcji pokażKonfliktHarmonogramuBur.")

new_conflict = r'''  function pokażKonfliktHarmonogramuBur(wynik) {
    const obecneWiersze = Array.isArray(wynik.obecneWiersze) ? wynik.obecneWiersze : [];
    const przygotowanePozycje = Array.isArray(wynik.oczekiwanePozycje) ? wynik.oczekiwanePozycje : [];
    const nagłówek = document.createElement("h3");
    const opis = document.createElement("p");
    const lista = document.createElement("ol");
    const podsumowanie = document.createElement("p");
    const przyciskAnuluj = document.createElement("button");
    const przyciskUsuń = document.createElement("button");
    const siatka = document.createElement("div");

    wyczyśćDecyzjęHarmonogramuBur();

    nagłówek.textContent = "W BUR istnieje już harmonogram";
    opis.textContent = "Obecne pozycje nie zostaną nadpisane bez potwierdzenia. Po potwierdzeniu Asystent usunie wyłącznie rzeczywiste wiersze harmonogramu, sprawdzi pustą tabelę i dopiero wtedy uruchomi import przygotowanego CSV.";
    podsumowanie.textContent = "Obecne pozycje: " + obecneWiersze.length + ". Przygotowane pozycje: " + przygotowanePozycje.length + ".";

    obecneWiersze.forEach(function dodajWiersz(wiersz) {
      const pozycja = document.createElement("li");
      pozycja.textContent = wiersz.tekst || "";
      lista.appendChild(pozycja);
    });

    if (!obecneWiersze.length) {
      const pozycja = document.createElement("li");
      pozycja.textContent = "Nie udało się odczytać treści obecnych wierszy.";
      lista.appendChild(pozycja);
    }

    przyciskAnuluj.type = "button";
    przyciskAnuluj.textContent = "Anuluj";
    przyciskAnuluj.addEventListener("click", function anuluj() {
      wyczyśćDecyzjęHarmonogramuBur();
      ustawStatusProgramuHarmonogramu("Anulowano wprowadzanie harmonogramu.", "status-neutralny");
    });

    przyciskUsuń.type = "button";
    przyciskUsuń.textContent = "Usuń obecny harmonogram i wprowadź przygotowany";
    przyciskUsuń.addEventListener("click", function usuńIImportuj() {
      if (!window.confirm("Czy potwierdzasz usunięcie obecnego harmonogramu przed wprowadzeniem przygotowanego?")) {
        return;
      }

      if (!przygotowanePozycje.length) {
        ustawStatusProgramuHarmonogramu("Brak przygotowanych pozycji harmonogramu. Przygotuj harmonogram ponownie.", "status-blad");
        return;
      }

      przyciskUsuń.disabled = true;
      przyciskAnuluj.disabled = true;
      ustawStatusProgramuHarmonogramu("Usuwam istniejący harmonogram. Nowy CSV zostanie zaimportowany dopiero po potwierdzeniu pustej tabeli...", "status-neutralny");

      bezpiecznieWyślijDoAktywnejKarty({
        typ: komunikaty.ZASTĄP_HARMONOGRAM_BUR,
        pozycje: przygotowanePozycje
      })
        .then(function pokażWynikZamiany(odpowiedź) {
          const rezultat = odpowiedź && odpowiedź.wynik ? odpowiedź.wynik : {};
          const komunikat = zbudujKomunikatRaportuHarmonogramu(rezultat);

          pokażDiagnostykęImportuHarmonogramu(rezultat.diagnostyka || {
            wynik: rezultat
          });

          if (!rezultat.ok) {
            throw new Error(komunikat);
          }

          wyczyśćDecyzjęHarmonogramuBur();
          ustawStatusProgramuHarmonogramu(komunikat, "status-odczytano");
          odświeżStanProgramuHarmonogramu();
        })
        .catch(function pokażBłąd(błąd) {
          ustawStatusProgramuHarmonogramu(
            błąd && błąd.message ? błąd.message : "Nie udało się bezpiecznie zastąpić harmonogramu.",
            "status-blad"
          );
          przyciskUsuń.disabled = false;
          przyciskAnuluj.disabled = false;
        });
    });

    siatka.className = "siatka-przycisków";
    siatka.appendChild(przyciskAnuluj);
    siatka.appendChild(przyciskUsuń);

    elementy.decyzjaHarmonogramuBur.appendChild(nagłówek);
    elementy.decyzjaHarmonogramuBur.appendChild(opis);
    elementy.decyzjaHarmonogramuBur.appendChild(podsumowanie);
    elementy.decyzjaHarmonogramuBur.appendChild(lista);
    elementy.decyzjaHarmonogramuBur.appendChild(siatka);
    elementy.decyzjaHarmonogramuBur.classList.remove("ukryty");
  }'''
text = text[:start] + new_conflict.rstrip() + text[end:]

report_marker = '''    if (raport.błąd) {
      części.push("Błąd: " + raport.błąd);
    }

    części.push("Sprawdź formularz BUR przed ręcznym zapisaniem.");'''
report_new = '''    if (raport.błąd) {
      części.push("Błąd: " + raport.błąd);
    }

    if (raport.raport && Array.isArray(raport.raport.różnice) && raport.raport.różnice.length) {
      części.push("Wykryte różnice do ręcznego sprawdzenia: " + raport.raport.różnice.length + ".");
    }

    if (raport.częściowyImport) {
      części.push("Wykryto częściowy import. Awaryjne wypełnianie ręczne zostało zablokowane, aby nie dublować pozycji.");
    } else if (!raport.ok && raport.fallbackDostępny) {
      części.push("Tabela pozostała pusta. Możesz ponowić import CSV, pobrać CSV do ręcznego wskazania albo użyć jawnej akcji awaryjnego wypełniania.");
    }

    części.push("Sprawdź formularz BUR przed ręcznym zapisaniem.");'''
text = replace_once(text, report_marker, report_new, "czytelny raport różnic i fallbacku")

write(path, text)
PY

for plik in "${TARGETS[@]}"; do
  node --check "$plik"
done

git diff --check
git diff -- "${TARGETS[@]}"

git add "${TARGETS[@]}"
git commit -m "fix: domknij bezpieczna zamiane harmonogramu CSV"

echo "OK: Patch 4 zastosowany i zapisany w lokalnym commicie."
