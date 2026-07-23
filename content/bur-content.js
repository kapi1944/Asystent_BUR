(function uruchomBurContent(globalny) {
  const przestrzen = globalny.BurAsystent || {};
  const komunikaty = przestrzen.KOMUNIKATY;
  const WERSJA_SKRYPTU_BUR = "hotfix-diagnostyka-import-csv-2026-07-17-v2";
  const selektory = {
    edytorProgramu: "#programiharmonogramuslugisekcja-programuslugi-wysiwyg > div.ql-editor",
    tabelaHarmonogramu: "#harmonogram-grid > div > table",
    importHarmonogramu: "#import"
  };

  function czyWidoczny(element) {
    if (!element) {
      return false;
    }

    const styl = getComputedStyle(element);
    return styl.display !== "none" && styl.visibility !== "hidden" && element.offsetParent !== null;
  }

  function pobierzWartośćElementu(element) {
    if (!element) {
      return "";
    }

    if ("value" in element && element.value) {
      return element.value;
    }

    return element.textContent || "";
  }

  function wywołajZdarzenia(element) {
    if (!element) {
      return;
    }

    ["input", "change", "blur"].forEach(function wywołaj(typ) {
      element.dispatchEvent(new Event(typ, { bubbles: true }));
    });
  }

  function opóźnij(ms) {
    return new Promise(function poczekaj(resolve) {
      setTimeout(resolve, ms);
    });
  }

  function pobierzStanProgramuHarmonogramu() {
    return {
      znalezionoEdytorProgramu: Boolean(document.querySelector(selektory.edytorProgramu)),
      znalezionoTabelęHarmonogramu: Boolean(document.querySelector(selektory.tabelaHarmonogramu)),
      znalezionoPrzyciskImportu: Boolean(document.querySelector(selektory.importHarmonogramu))
    };
  }

  function uzupełnijProgramUsługi(program) {
    const edytor = document.querySelector(selektory.edytorProgramu);

    if (!edytor) {
      return {
        ok: false,
        błąd: "Nie znaleziono edytora programu usługi w BUR."
      };
    }

    const tekstProgramu = przestrzen.przygotujTekstProgramu(program || "");
    const htmlProgramu = przestrzen.konwertujTekstProgramuNaHtml(tekstProgramu);

    edytor.innerHTML = htmlProgramu;
    wywołajZdarzenia(edytor);
    wywołajZdarzenia(edytor.closest("[contenteditable='true']") || edytor.parentElement);

    return {
      ok: true,
      komunikat: "Uzupełniono program usługi i dopisano informację organizacyjną."
    };
  }

  function normalizujTekstTabeli(tekst) {
    return String(tekst || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim().toLocaleLowerCase("pl-PL");
  }

  function pobierzKomórkiWiersza(wiersz) {
    return Array.from(wiersz.children || []).filter(function tylkoKomórki(element) {
      return element.tagName === "TD" || element.tagName === "TH";
    });
  }

  function znajdźIndeksyKolumnHarmonogramu(tabela) {
    const nagłówek = Array.from(tabela.querySelectorAll("thead tr, tr")).find(function znajdź(wiersz) {
      const tekst = normalizujTekstTabeli(wiersz.textContent);
      return /typ\s+aktywno|rodzaj\s+zaj|przedmiot|temat/.test(tekst)
        && /prowad|trener/.test(tekst)
        && /data|dzień|dzien/.test(tekst);
    });
    const indeksy = { numer: 0, typAktywności: 1, data: 2, od: 3, do: 4, przedmiot: 5, prowadzący: 6 };

    if (!nagłówek) {
      return indeksy;
    }

    pobierzKomórkiWiersza(nagłówek).forEach(function przypisz(komórka, indeks) {
      const tekst = normalizujTekstTabeli(komórka.textContent);
      if (/^lp\.?$|liczba|numer/.test(tekst)) { indeksy.numer = indeks; }
      else if (/typ\s+aktywno|rodzaj\s+zaj/.test(tekst)) { indeksy.typAktywności = indeks; }
      else if (/data|dzień|dzien|termin/.test(tekst)) { indeksy.data = indeks; }
      else if (/^od$|rozpoczę/.test(tekst)) { indeksy.od = indeks; }
      else if (/^do$|zakończe/.test(tekst)) { indeksy.do = indeks; }
      else if (/przedmiot|temat/.test(tekst)) { indeksy.przedmiot = indeks; }
      else if (/prowad|trener/.test(tekst)) { indeksy.prowadzący = indeks; }
    });
    return indeksy;
  }

  function pobierzWierszeTabeliHarmonogramu() {
    const tabela = document.querySelector(selektory.tabelaHarmonogramu);

    if (!tabela) {
      return [];
    }

    return Array.from(tabela.querySelectorAll("tbody tr, tr")).filter(function zostawPozycjęHarmonogramu(wiersz) {
      const komórki = pobierzKomórkiWiersza(wiersz);
      const numerPozycji = komórki.length
        ? String(komórki[0].textContent || "").replace(/\s+/g, " ").trim()
        : "";

      /*
       * Tabela BUR zawiera także pięć wierszy podsumowania godzin.
       * Pozycja harmonogramu ma numer w pierwszej kolumnie i komplet kolumn,
       * dlatego nie wolno traktować podsumowań jako istniejących pozycji.
       */
      return komórki.length >= 7 && /^\d+$/.test(numerPozycji) && wiersz.closest("thead") === null;
    });
  }

  function odczytajWierszeHarmonogramu() {
    const tabela = document.querySelector(selektory.tabelaHarmonogramu);
    const indeksy = tabela ? znajdźIndeksyKolumnHarmonogramu(tabela) : {};
    return pobierzWierszeTabeliHarmonogramu().map(function odczytaj(wiersz, indeks) {
      const komórki = pobierzKomórkiWiersza(wiersz);
      function wartość(nazwa) {
        const komórka = komórki[indeksy[nazwa]];
        return String(komórka ? komórka.textContent || "" : "").replace(/\s+/g, " ").trim();
      }
      return {
        numer: wartość("numer") || String(indeks + 1),
        typAktywności: wartość("typAktywności"),
        data: wartość("data"),
        od: wartość("od"),
        do: wartość("do"),
        przedmiot: wartość("przedmiot"),
        prowadzący: wartość("prowadzący"),
        tekst: String(wiersz.textContent || "").replace(/\s+/g, " ").trim(),
        element: wiersz
      };
    }).filter(function zostaw(wiersz) {
      return Boolean(wiersz.tekst);
    });
  }

  function pobierzLiczbęPozycjiWTabeli() {
    return odczytajWierszeHarmonogramu().length;
  }

  function znajdźPowiązanyInputPlikuImportu(przyciskImportu) {
    if (!przyciskImportu) {
      return null;
    }

    const idInputa = przyciskImportu.getAttribute("for")
      || przyciskImportu.getAttribute("data-target")
      || przyciskImportu.getAttribute("aria-controls");

    if (idInputa) {
      const powiązanyInput = document.getElementById(idInputa.replace(/^#/, ""));

      if (powiązanyInput && powiązanyInput.matches("input[type='file']")) {
        return powiązanyInput;
      }
    }

    let kontener = przyciskImportu.parentElement;

    for (let poziom = 0; kontener && poziom < 8; poziom += 1, kontener = kontener.parentElement) {
      const kandydaci = Array.from(kontener.querySelectorAll("input[type='file']"));
      const dokładni = kandydaci.filter(function pasujeDoHarmonogramu(input) {
        const opis = [
          input.id,
          input.name,
          input.getAttribute("accept"),
          input.getAttribute("aria-label"),
          input.getAttribute("data-purpose")
        ].join(" ");

        return /harmonogram|xlsx|spreadsheetml|excel|import/i.test(opis);
      });

      if (dokładni.length === 1) {
        return dokładni[0];
      }

      if (kandydaci.length === 1
        && /import\s+harmonogramu/i.test(String(kontener.textContent || "").replace(/\s+/g, " "))) {
        return kandydaci[0];
      }
    }

    return null;
  }

  async function znajdźInputPlikuImportu() {
    const przyciskImportu = document.querySelector(selektory.importHarmonogramu);

    if (!przyciskImportu || przyciskImportu.id !== "import") {
      return null;
    }

    let inputPliku = znajdźPowiązanyInputPlikuImportu(przyciskImportu);

    if (inputPliku) {
      return inputPliku;
    }

    /*
     * BUR może tworzyć techniczny input dopiero po użyciu przycisku
     * „Wybierz plik”. Uruchamiamy wyłącznie #import — nigdy globalny
     * przycisk zaczynający się od słowa „Dodaj”.
     */
    przyciskImportu.click();

    for (let próba = 0; próba < 10; próba += 1) {
      await opóźnij(75);
      inputPliku = znajdźPowiązanyInputPlikuImportu(przyciskImportu);

      if (inputPliku) {
        return inputPliku;
      }
    }

    return null;
  }

  function znajdźPrzyciskWykonaniaImportu(inputPliku) {
    const kontener = inputPliku
      ? inputPliku.closest("form, section, fieldset, .form-group, .row, div")
      : null;

    if (!kontener) {
      return null;
    }

    return Array.from(kontener.querySelectorAll("button, input[type='button'], input[type='submit']"))
      .find(function znajdź(element) {
        const tekst = String(pobierzWartośćElementu(element) || element.getAttribute("aria-label") || "")
          .replace(/\s+/g, " ")
          .trim();

        return czyWidoczny(element)
          && !element.disabled
          && /^(importuj|wczytaj|zaimportuj)\b/i.test(tekst);
      }) || null;
  }

  async function poczekajNaWynikImportu(pozycje, liczbaPrzed) {
    let ostatniRaport = sprawdzHarmonogramPoWypelnieniu(pozycje || []);

    for (let próba = 0; próba < 24; próba += 1) {
      await opóźnij(500);
      ostatniRaport = sprawdzHarmonogramPoWypelnieniu(pozycje || []);

      if (pobierzLiczbęPozycjiWTabeli() > liczbaPrzed && ostatniRaport.ok) {
        return {
          ok: true,
          raport: ostatniRaport
        };
      }
    }

    return {
      ok: false,
      raport: ostatniRaport
    };
  }

  function pobierzMigawkęZasobówSieciowych() {
    if (typeof performance === "undefined" || typeof performance.getEntriesByType !== "function") {
      return [];
    }

    return performance.getEntriesByType("resource").map(function mapujZasób(wpis) {
      return {
        nazwa: wpis.name,
        typ: wpis.initiatorType || "",
        start: Math.round(wpis.startTime || 0),
        czas: Math.round(wpis.duration || 0)
      };
    });
  }

  function utwórzDiagnostykęImportuCsv(pozycje) {
    return {
      wersja: WERSJA_SKRYPTU_BUR,
      rozpoczęto: new Date().toISOString(),
      czasStartMs: Date.now(),
      oczekiwanePozycje: Array.isArray(pozycje) ? pozycje.length : 0,
      etapy: [],
      input: null,
      plik: null,
      eventy: [],
      tabela: {
        przed: pobierzLiczbęPozycjiWTabeli(),
        po: null,
        liczbaMutacji: 0
      },
      sieć: {
        przed: pobierzMigawkęZasobówSieciowych(),
        noweZasoby: []
      },
      wniosek: ""
    };
  }

  function dodajEtapDiagnostyki(diagnostyka, etap, szczegóły) {
    const wpis = {
      etap: etap,
      poMs: Date.now() - diagnostyka.czasStartMs
    };

    if (szczegóły !== undefined) {
      wpis.szczegóły = szczegóły;
    }

    diagnostyka.etapy.push(wpis);
    console.info("[BUR-DIAG]", etap, szczegóły === undefined ? "" : szczegóły);
  }

  async function importujHarmonogramPrzezCsv(pozycje) {
    const diagnostyka = utwórzDiagnostykęImportuCsv(pozycje);
    const tabela = document.querySelector(selektory.tabelaHarmonogramu);
    let obserwatorTabeli = null;

    function zakończ(wynik) {
      if (obserwatorTabeli) {
        obserwatorTabeli.disconnect();
      }

      diagnostyka.tabela.po = pobierzLiczbęPozycjiWTabeli();
      diagnostyka.zakończono = new Date().toISOString();
      diagnostyka.czasCałkowityMs = Date.now() - diagnostyka.czasStartMs;

      const zasobyPo = pobierzMigawkęZasobówSieciowych();
      const kluczePrzed = new Set(diagnostyka.sieć.przed.map(function zbudujKlucz(wpis) {
        return wpis.nazwa + "|" + wpis.start;
      }));

      diagnostyka.sieć.noweZasoby = zasobyPo.filter(function tylkoNowe(wpis) {
        return !kluczePrzed.has(wpis.nazwa + "|" + wpis.start);
      }).slice(-30);

      if (wynik.ok) {
        diagnostyka.wniosek = "BUR dodał oczekiwane wiersze harmonogramu.";
      } else if (diagnostyka.tabela.liczbaMutacji === 0 && diagnostyka.sieć.noweZasoby.length === 0) {
        diagnostyka.wniosek = "Po syntetycznych zdarzeniach input/change nie wykryto zmiany tabeli ani nowego zasobu sieciowego. Najbardziej prawdopodobne: BUR ignoruje zdarzenia z isTrusted=false.";
      } else if (diagnostyka.sieć.noweZasoby.length > 0 && diagnostyka.tabela.po === diagnostyka.tabela.przed) {
        diagnostyka.wniosek = "Po imporcie wykryto aktywność sieciową, ale tabela pozostała bez zmian. Sprawdź kartę Network oraz odpowiedź serwera BUR.";
      } else if (diagnostyka.tabela.liczbaMutacji > 0 && diagnostyka.tabela.po === diagnostyka.tabela.przed) {
        diagnostyka.wniosek = "Tabela zmieniła DOM, ale liczba pozycji nadal wynosi 0. Możliwy komunikat walidacyjny BUR albo nieaktualny selektor wierszy.";
      } else {
        diagnostyka.wniosek = "Import nie został potwierdzony. Sprawdź etapy, eventy i nowe zasoby sieciowe.";
      }

      wynik.diagnostyka = diagnostyka;
      console.info("[BUR-DIAG] PODSUMOWANIE", diagnostyka);
      return wynik;
    }

    dodajEtapDiagnostyki(diagnostyka, "START_IMPORTU_CSV");

    if (tabela && typeof MutationObserver !== "undefined") {
      obserwatorTabeli = new MutationObserver(function zliczMutacje(mutacje) {
        diagnostyka.tabela.liczbaMutacji += mutacje.length;
      });
      obserwatorTabeli.observe(tabela, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
      });
      dodajEtapDiagnostyki(diagnostyka, "OBSERWATOR_TABELI_URUCHOMIONY");
    } else {
      dodajEtapDiagnostyki(diagnostyka, "BRAK_TABELI_LUB_MUTATION_OBSERVER");
    }

    const inputPliku = await znajdźInputPlikuImportu();

    if (!inputPliku) {
      dodajEtapDiagnostyki(diagnostyka, "INPUT_PLIKU_NIEZNALEZIONY");
      return zakończ({
        ok: false,
        metoda: "CSV",
        błąd: "Nie znaleziono jednoznacznego inputa pliku powiązanego z przyciskiem #import."
      });
    }

    diagnostyka.input = {
      id: inputPliku.id || "",
      name: inputPliku.name || "",
      accept: inputPliku.accept || "",
      disabled: Boolean(inputPliku.disabled),
      className: String(inputPliku.className || ""),
      istniejącePliki: inputPliku.files ? inputPliku.files.length : 0
    };
    dodajEtapDiagnostyki(diagnostyka, "INPUT_PLIKU_ZNALEZIONY", diagnostyka.input);

    if (inputPliku.disabled) {
      dodajEtapDiagnostyki(diagnostyka, "INPUT_PLIKU_ZABLOKOWANY");
      return zakończ({
        ok: false,
        metoda: "CSV",
        błąd: "Pole importu harmonogramu BUR jest zablokowane."
      });
    }

    if (typeof przestrzen.wygenerujDaneCsvHarmonogramu !== "function") {
      dodajEtapDiagnostyki(diagnostyka, "BRAK_GENERATORA_CSV");
      return zakończ({
        ok: false,
        metoda: "CSV",
        błąd: "Generator CSV harmonogramu nie został załadowany."
      });
    }

    try {
      const liczbaPrzed = pobierzLiczbęPozycjiWTabeli();
      const daneCsv = przestrzen.wygenerujDaneCsvHarmonogramu(pozycje || []);
      const bajtyCsv = daneCsv instanceof Uint8Array ? daneCsv : new Uint8Array(daneCsv);

      dodajEtapDiagnostyki(diagnostyka, "CSV_WYGENEROWANY", {
        liczbaBajtów: bajtyCsv.length,
        bom: Array.from(bajtyCsv.slice(0, 3))
      });

      if (bajtyCsv.length < 4
        || bajtyCsv[0] !== 0xef
        || bajtyCsv[1] !== 0xbb
        || bajtyCsv[2] !== 0xbf) {
        throw new Error("Wygenerowany CSV nie ma wymaganego kodowania UTF-8 BOM.");
      }

      const tekstKontrolny = new TextDecoder("utf-8").decode(bajtyCsv);
      const oczekiwanyNagłówek = przestrzen.NAGŁÓWKI_CSV_HARMONOGRAMU
        .map(function cytuj(wartość) {
          return '"' + String(wartość).replace(/"/g, '""') + '"';
        })
        .join(";");

      if (!tekstKontrolny.startsWith(oczekiwanyNagłówek + "\r\n")) {
        throw new Error("Nagłówek CSV jest niezgodny ze wzorcem BUR.");
      }

      const plik = new File([bajtyCsv], "harmonogram-bur.csv", {
        type: "text/csv;charset=utf-8"
      });
      const transfer = new DataTransfer();

      diagnostyka.plik = {
        nazwa: plik.name,
        typ: plik.type,
        rozmiar: plik.size,
        nagłówek: tekstKontrolny.replace(/^\uFEFF/, "").split("\r\n")[0]
      };
      dodajEtapDiagnostyki(diagnostyka, "PLIK_CSV_UTWORZONY", diagnostyka.plik);

      if (!plik.size) {
        throw new Error("Wygenerowany plik harmonogram-bur.csv jest pusty.");
      }

      transfer.items.add(plik);
      inputPliku.files = transfer.files;

      if (!inputPliku.files
        || inputPliku.files.length !== 1
        || inputPliku.files[0].name !== "harmonogram-bur.csv"
        || inputPliku.files[0].size < 1) {
        throw new Error("Pole BUR nie przyjęło przygotowanego pliku CSV.");
      }

      dodajEtapDiagnostyki(diagnostyka, "PLIK_PRZYPISANY_DO_INPUT_FILES", {
        liczbaPlików: inputPliku.files.length,
        nazwa: inputPliku.files[0].name,
        rozmiar: inputPliku.files[0].size
      });

      function zapiszEvent(event) {
        diagnostyka.eventy.push({
          typ: event.type,
          isTrusted: event.isTrusted,
          bubbles: event.bubbles,
          composed: event.composed,
          liczbaPlików: event.target && event.target.files ? event.target.files.length : null,
          poMs: Date.now() - diagnostyka.czasStartMs
        });
      }

      inputPliku.addEventListener("input", zapiszEvent, {
        capture: true,
        once: true
      });
      inputPliku.addEventListener("change", zapiszEvent, {
        capture: true,
        once: true
      });

      const eventInput = new Event("input", {
        bubbles: true,
        composed: true
      });
      const eventChange = new Event("change", {
        bubbles: true,
        composed: true
      });
      const wynikInput = inputPliku.dispatchEvent(eventInput);

      dodajEtapDiagnostyki(diagnostyka, "EVENT_INPUT_WYSŁANY", {
        dispatchEvent: wynikInput,
        isTrusted: eventInput.isTrusted
      });

      const wynikChange = inputPliku.dispatchEvent(eventChange);

      dodajEtapDiagnostyki(diagnostyka, "EVENT_CHANGE_WYSŁANY", {
        dispatchEvent: wynikChange,
        isTrusted: eventChange.isTrusted
      });

      await opóźnij(350);

      if (pobierzLiczbęPozycjiWTabeli() === liczbaPrzed) {
        const przyciskWykonaniaImportu = znajdźPrzyciskWykonaniaImportu(inputPliku);

        if (przyciskWykonaniaImportu) {
          dodajEtapDiagnostyki(diagnostyka, "PRZYCISK_WYKONANIA_IMPORTU_ZNALEZIONY", {
            id: przyciskWykonaniaImportu.id || "",
            tekst: String(pobierzWartośćElementu(przyciskWykonaniaImportu) || "").replace(/\s+/g, " ").trim()
          });
          przyciskWykonaniaImportu.click();
          dodajEtapDiagnostyki(diagnostyka, "PRZYCISK_WYKONANIA_IMPORTU_KLIKNIĘTY");
        } else {
          dodajEtapDiagnostyki(diagnostyka, "BRAK_OSOBNEGO_PRZYCISKU_WYKONANIA_IMPORTU");
        }
      }

      dodajEtapDiagnostyki(diagnostyka, "OCZEKIWANIE_NA_WYNIK_IMPORTU");
      const wynikOczekiwania = await poczekajNaWynikImportu(pozycje || [], liczbaPrzed);
      const raport = wynikOczekiwania.raport || sprawdzHarmonogramPoWypelnieniu(pozycje || []);

      dodajEtapDiagnostyki(diagnostyka, "KONIEC_OCZEKIWANIA", {
        powodzenie: wynikOczekiwania.ok,
        pozycjeWTabeli: pobierzLiczbęPozycjiWTabeli(),
        błędyWalidacji: raport.błędy || []
      });

      if (!wynikOczekiwania.ok) {
        return zakończ({
          ok: false,
          metoda: "CSV",
          błąd: "Plik CSV został przypisany do pola BUR, ale import nie dodał poprawnych wierszy w ciągu 12 sekund. "
            + (raport.błędy || []).join(" "),
          liczbaOczekiwanychPozycji: Array.isArray(pozycje) ? pozycje.length : 0,
          liczbaPozycjiWTabeli: pobierzLiczbęPozycjiWTabeli(),
          nazwaPliku: plik.name,
          typPliku: plik.type,
          rozmiarPliku: plik.size
        });
      }

      return zakończ({
        ok: true,
        metoda: "CSV",
        komunikat: "Zaimportowano harmonogram CSV. Sprawdź dane przed zapisaniem usługi.",
        liczbaOczekiwanychPozycji: Array.isArray(pozycje) ? pozycje.length : 0,
        liczbaPozycjiWTabeli: pobierzLiczbęPozycjiWTabeli(),
        nazwaPliku: plik.name,
        typPliku: plik.type,
        rozmiarPliku: plik.size,
        raport: raport,
        ostrzeżenia: raport.ostrzeżenia || [],
        różnice: raport.różnice || []
      });
    } catch (błąd) {
      dodajEtapDiagnostyki(diagnostyka, "WYJĄTEK_IMPORTU_CSV", {
        komunikat: błąd && błąd.message ? błąd.message : String(błąd)
      });

      return zakończ({
        ok: false,
        metoda: "CSV",
        błąd: błąd && błąd.message
          ? błąd.message
          : "Nie udało się przekazać pliku CSV do importu."
      });
    }
  }

  function znajdźPrzyciskPoTekście(wzorce) {
    const elementy = Array.from(document.querySelectorAll("button, a, input[type='button'], input[type='submit']"));

    return elementy.find(function sprawdź(element) {
      const tekst = pobierzWartośćElementu(element) || element.getAttribute("value") || element.getAttribute("aria-label") || "";

      return czyWidoczny(element) && wzorce.some(function pasuje(wzorzec) {
        return wzorzec.test(tekst);
      });
    }) || null;
  }

  function znajdźPolePoEtykiecie(wzorce) {
    const etykiety = Array.from(document.querySelectorAll("label, span, div, p"));
    const etykieta = etykiety.find(function sprawdź(element) {
      const tekst = element.textContent || "";

      return czyWidoczny(element) && wzorce.some(function pasuje(wzorzec) {
        return wzorzec.test(tekst);
      });
    });

    if (!etykieta) {
      return null;
    }

    const idPola = etykieta.getAttribute("for");

    if (idPola) {
      const polePoId = document.getElementById(idPola);

      if (polePoId) {
        return polePoId;
      }
    }

    const kontener = etykieta.closest("tr, .form-group, .row, div") || etykieta.parentElement;

    return kontener ? kontener.querySelector("input, textarea, select, [contenteditable='true']") : null;
  }

  function ustawWartośćPola(pole, wartość) {
    if (!pole) {
      return false;
    }

    if (pole.tagName === "SELECT") {
      const opcje = Array.from(pole.options || []);
      const opcja = opcje.find(function znajdźOpcję(element) {
        return new RegExp("^" + String(wartość || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i").test(element.textContent || element.value || "");
      }) || opcje.find(function znajdźPoFragmencie(element) {
        return String(element.textContent || element.value || "").toLowerCase().includes(String(wartość || "").toLowerCase());
      });

      if (opcja) {
        pole.value = opcja.value;
      }
    } else if ("value" in pole) {
      pole.value = wartość || "";
    } else {
      pole.textContent = wartość || "";
    }

    wywołajZdarzenia(pole);
    return true;
  }

  function wypełnijPolaPozycji(pozycja) {
    const pola = [
      { wzorce: [/typ\s+aktywności/i, /rodzaj\s+zajęć/i], wartość: pozycja.typ_aktywnosci },
      { wzorce: [/przedmiot/i, /temat/i], wartość: pozycja.przedmiot },
      { wzorce: [/prowadząc/i, /trener/i], wartość: pozycja.prowadzacy },
      { wzorce: [/dzień\s+świadczenia/i, /data/i, /termin/i], wartość: pozycja.dzien_swiadczenia },
      { wzorce: [/czas\s+rozpoczęcia/i, /godzina\s+od/i, /\bod\b/i], wartość: pozycja.czas_rozpoczecia },
      { wzorce: [/czas\s+zakończenia/i, /godzina\s+do/i, /\bdo\b/i], wartość: pozycja.czas_zakonczenia }
    ];
    const brakujące = [];

    pola.forEach(function wypełnij(definicja) {
      const pole = znajdźPolePoEtykiecie(definicja.wzorce);

      if (!ustawWartośćPola(pole, definicja.wartość)) {
        brakujące.push(definicja.wzorce[0].source);
      }
    });

    return brakujące;
  }

  function znajdźPrzyciskDodajPozycjęHarmonogramu() {
    const tabela = document.querySelector(selektory.tabelaHarmonogramu);
    const przyciskImportu = document.querySelector(selektory.importHarmonogramu);
    const korzenie = [];
    let kontener = tabela ? tabela.closest("#harmonogram-grid") : null;

    if (kontener) {
      korzenie.push(kontener);
    }

    kontener = przyciskImportu ? przyciskImportu.parentElement : null;

    for (let poziom = 0; kontener && poziom < 8; poziom += 1, kontener = kontener.parentElement) {
      if (!korzenie.includes(kontener)) {
        korzenie.push(kontener);
      }

      if (tabela && kontener.contains(tabela)) {
        break;
      }
    }

    for (let indeks = 0; indeks < korzenie.length; indeks += 1) {
      const kandydaci = Array.from(korzenie[indeks].querySelectorAll(
        "button, a, input[type='button'], input[type='submit']"
      ));
      const znaleziony = kandydaci.find(function sprawdźPrzycisk(element) {
        const tekst = String(
          pobierzWartośćElementu(element)
          || element.getAttribute("value")
          || element.getAttribute("aria-label")
          || ""
        ).replace(/\s+/g, " ").trim();
        const identyfikator = [
          element.id,
          element.getAttribute("name"),
          element.getAttribute("data-action")
        ].join(" ");

        return czyWidoczny(element)
          && !element.disabled
          && (
            /^dodaj\s+pozycj(?:ę|e)$/i.test(tekst)
            || (/harmonogram/i.test(identyfikator) && /dodaj/i.test(identyfikator))
          );
      });

      if (znaleziony) {
        return znaleziony;
      }
    }

    return null;
  }

  async function wypelnijHarmonogramRecznie(pozycje) {
    const pozycjeHarmonogramu = Array.isArray(pozycje) ? pozycje : [];
    const błędy = [];

    for (let indeks = 0; indeks < pozycjeHarmonogramu.length; indeks += 1) {
      const przyciskDodaj = znajdźPrzyciskDodajPozycjęHarmonogramu();

      if (!przyciskDodaj) {
        return {
          ok: false,
          błąd: "Nie znaleziono przycisku dodawania pozycji harmonogramu w aktualnym UI BUR."
        };
      }

      przyciskDodaj.click();
      await opóźnij(300);

      const brakujące = wypełnijPolaPozycji(pozycjeHarmonogramu[indeks]);

      if (brakujące.length) {
        błędy.push("Pozycja " + (indeks + 1) + ": nie znaleziono pól " + brakujące.join(", ") + ".");
      }

      const przyciskZapisz = znajdźPrzyciskPoTekście([/^zapisz$/i, /^zatwierdź$/i]);

      if (przyciskZapisz) {
        przyciskZapisz.click();
        await opóźnij(450);
      }
    }

    const raport = sprawdzHarmonogramPoWypelnieniu(pozycjeHarmonogramu);

    if (błędy.length || !raport.ok) {
      return {
        ok: false,
        błąd: błędy.concat(raport.błędy).join(" ")
      };
    }

    return {
      ok: true,
      metoda: "fallback ręczny",
      komunikat: "Wypełniono harmonogram ręcznie. Sprawdź dane przed zapisaniem usługi.",
      liczbaOczekiwanychPozycji: pozycjeHarmonogramu.length,
      liczbaPozycjiWTabeli: pobierzLiczbęPozycjiWTabeli(),
      raport: raport
    };
  }

  function sprawdzHarmonogramPoWypelnieniu(oczekiwanePozycje) {
    const oczekiwane = Array.isArray(oczekiwanePozycje) ? oczekiwanePozycje : [];
    const wiersze = odczytajWierszeHarmonogramu();
    const błędy = [];
    const ostrzeżenia = [];
    const ostatniDzień = oczekiwane.length ? oczekiwane[oczekiwane.length - 1].dzien_swiadczenia : "";

    if (wiersze.length < oczekiwane.length) {
      błędy.push("Tabela zawiera " + wiersze.length + " pozycji, oczekiwano co najmniej " + oczekiwane.length + ".");
    }

    oczekiwane.forEach(function sprawdźPozycję(pozycja, indeks) {
      const aktualna = wiersze[indeks] || {};
      const pola = [
        ["Typ aktywności", "typAktywności", pozycja.typ_aktywnosci],
        ["Data", "data", pozycja.dzien_swiadczenia],
        ["Od", "od", pozycja.czas_rozpoczecia],
        ["Do", "do", pozycja.czas_zakonczenia],
        ["Przedmiot/temat", "przedmiot", pozycja.przedmiot],
        ["Prowadzący", "prowadzący", pozycja.prowadzacy]
      ];
      pola.forEach(function porównajPole(pole) {
        if (normalizujTekstTabeli(pole[2]) !== normalizujTekstTabeli(aktualna[pole[1]])) {
          ostrzeżenia.push({ pozycja: indeks + 1, pole: pole[0], oczekiwane: pole[2] || "", aktualne: aktualna[pole[1]] || "" });
        }
      });

    });

    return {
      ok: błędy.length === 0,
      błędy: błędy,
      ostrzeżenia: ostrzeżenia,
      różnice: ostrzeżenia
    };
  }

  async function importujCsvBezFallbacku(pozycje) {
    const tabela = document.querySelector(selektory.tabelaHarmonogramu);
    const obecneWiersze = odczytajWierszeHarmonogramu();
    const istniejącePozycje = przestrzen.czyTabelaHarmonogramuMaPozycje(obecneWiersze);

    if (!tabela) {
      return {
        ok: false,
        metoda: "CSV",
        błąd: "Nie znaleziono tabeli harmonogramu BUR.",
        liczbaOczekiwanychPozycji: Array.isArray(pozycje) ? pozycje.length : 0
      };
    }

    if (istniejącePozycje) {
      return {
        ok: false,
        metoda: "CSV",
        istniejącePozycje: true,
        obecneWiersze: obecneWiersze,
        oczekiwanePozycje: pozycje || [],
        liczbaOczekiwanychPozycji: Array.isArray(pozycje) ? pozycje.length : 0,
        liczbaPozycjiWTabeli: obecneWiersze.length,
        komunikat: "W BUR istnieje już harmonogram. Sprawdź różnice i potwierdź usunięcie obecnych pozycji przed ponownym wprowadzeniem."
      };
    }

    const wynikImportu = await importujHarmonogramPrzezCsv(pozycje);

    if (wynikImportu.ok) {
      return wynikImportu;
    }

    return {
      ok: false,
      metoda: "CSV",
      błąd: wynikImportu.błąd || "BUR nie potwierdził importu harmonogramu CSV.",
      częściowyImport: pobierzLiczbęPozycjiWTabeli() > 0,
      fallbackDostępny: pobierzLiczbęPozycjiWTabeli() === 0,
      liczbaOczekiwanychPozycji: Array.isArray(pozycje) ? pozycje.length : 0,
      liczbaPozycjiWTabeli: pobierzLiczbęPozycjiWTabeli(),
      nazwaPliku: wynikImportu.nazwaPliku || "harmonogram-bur.csv",
      typPliku: wynikImportu.typPliku || "text/csv;charset=utf-8",
      rozmiarPliku: wynikImportu.rozmiarPliku || 0,
      diagnostyka: wynikImportu.diagnostyka || null
    };
  }

  function znajdźJednoznacznyPrzyciskUsuwania(wiersz) {
    const przyciski = Array.from(wiersz.querySelectorAll("button, input[type='button'], input[type='submit'], a"))
      .filter(function widoczny(element) { return czyWidoczny(element) && !element.disabled; })
      .filter(function usuń(element) {
        const tekst = [pobierzWartośćElementu(element), element.getAttribute("aria-label"), element.getAttribute("title")]
          .join(" ").replace(/\s+/g, " ").trim();
        return /\busuń\b|\bdelete\b|\bremove\b/i.test(tekst);
      });
    return przyciski.length === 1 ? przyciski[0] : null;
  }

  async function usuńIstniejącyHarmonogram() {
    if (!document.querySelector(selektory.tabelaHarmonogramu)) {
      return { ok: false, usunięto: 0, pozostało: 0, błąd: "Nie znaleziono tabeli harmonogramu BUR." };
    }
    let usunięto = 0;
    while (true) {
      const wiersze = odczytajWierszeHarmonogramu();
      if (!wiersze.length) {
        return { ok: true, usunięto: usunięto, pozostało: 0, komunikat: "Usunięto wszystkie rzeczywiste pozycje harmonogramu." };
      }
      const wiersz = wiersze[wiersze.length - 1];
      const przycisk = znajdźJednoznacznyPrzyciskUsuwania(wiersz.element);
      if (!przycisk) {
        return { ok: false, usunięto: usunięto, pozostało: wiersze.length, błąd: "Nie znaleziono jednoznacznego przycisku usuwania w pozycji " + wiersz.numer + ". Nowy CSV nie został zaimportowany." };
      }
      const liczbaPrzed = wiersze.length;
      przycisk.click();
      let zmniejszono = false;
      for (let próba = 0; próba < 20; próba += 1) {
        await opóźnij(100);
        if (pobierzLiczbęPozycjiWTabeli() < liczbaPrzed) { zmniejszono = true; break; }
      }
      if (!zmniejszono) {
        return { ok: false, usunięto: usunięto, pozostało: pobierzLiczbęPozycjiWTabeli(), błąd: "BUR nie usunął pozycji " + wiersz.numer + ". Nowy CSV nie został zaimportowany." };
      }
      usunięto += 1;
    }
  }

  async function zastąpHarmonogram(pozycje) {
    const wynikUsuwania = await usuńIstniejącyHarmonogram();
    if (!wynikUsuwania.ok || pobierzLiczbęPozycjiWTabeli() !== 0) {
      return Object.assign({}, wynikUsuwania, { ok: false, nowyCsvZaimportowany: false, komunikat: wynikUsuwania.błąd || "Tabela harmonogramu nie jest pusta." });
    }
    const wynikImportu = await importujCsvBezFallbacku(pozycje);
    return Object.assign({}, wynikImportu, { usunięto: wynikUsuwania.usunięto, nowyCsvZaimportowany: Boolean(wynikImportu.ok) });
  }

  async function wprowadźHarmonogramDoBur(pozycje) {
    const pozycjeHarmonogramu = Array.isArray(pozycje) ? pozycje : [];

    if (!pozycjeHarmonogramu.length) {
      return {
        ok: false,
        błąd: "Brak przygotowanego harmonogramu CSV."
      };
    }

    return importujCsvBezFallbacku(pozycjeHarmonogramu);
  }

  async function wypełnijPrzygotowanyHarmonogramRęcznie(pozycje) {
    const tabela = document.querySelector(selektory.tabelaHarmonogramu);
    const obecneWiersze = odczytajWierszeHarmonogramu();
    const istniejącePozycje = przestrzen.czyTabelaHarmonogramuMaPozycje(obecneWiersze);

    if (!tabela) {
      return {
        ok: false,
        błąd: "Nie znaleziono tabeli harmonogramu BUR."
      };
    }

    if (istniejącePozycje) {
      return {
        ok: false,
        istniejącePozycje: true,
        obecneWiersze: obecneWiersze,
        oczekiwanePozycje: pozycje || [],
        liczbaOczekiwanychPozycji: Array.isArray(pozycje) ? pozycje.length : 0,
        liczbaPozycjiWTabeli: obecneWiersze.length,
        komunikat: "W BUR istnieje już harmonogram. Sprawdź różnice i potwierdź usunięcie obecnych pozycji przed ponownym wprowadzeniem."
      };
    }

    return wypelnijHarmonogramRecznie(pozycje || []);
  }

  function znajdźPoEtykiecieTytułu() {
    const elementy = Array.from(document.querySelectorAll("label, span, div, p, dt, th"));
    const etykieta = elementy.find(function sprawdźEtykietę(element) {
      return czyWidoczny(element) && /tytuł\s+usługi/i.test(element.textContent || "");
    });

    if (!etykieta) {
      return "";
    }

    const kontener = etykieta.closest("tr, .form-group, .row, div") || etykieta.parentElement;
    const pole = kontener ? kontener.querySelector("textarea, input, [contenteditable='true']") : null;

    return pobierzWartośćElementu(pole);
  }

  function pobierzTytułZBur() {
    const kandydaci = [
      document.querySelector("#informacjepodstawowesekcja-tytuluslugi"),
      document.querySelector("textarea[name*='tytul' i], input[name*='tytul' i]"),
      document.querySelector("textarea[name*='tytuł' i], input[name*='tytuł' i]"),
      document.querySelector("textarea[id*='tytul' i], input[id*='tytul' i]"),
      document.querySelector("textarea[id*='tytuł' i], input[id*='tytuł' i]"),
      document.querySelector("h1, h2, h3, .active")
    ];

    let tytułOryginalny = "";

    for (let indeks = 0; indeks < kandydaci.length; indeks += 1) {
      const kandydat = kandydaci[indeks];
      const wartość = przestrzen.oczyśćLinię ? przestrzen.oczyśćLinię(pobierzWartośćElementu(kandydat)) : String(pobierzWartośćElementu(kandydat) || "").trim();

      if (wartość && czyWidoczny(kandydat)) {
        tytułOryginalny = wartość;
        break;
      }
    }

    if (!tytułOryginalny) {
      tytułOryginalny = przestrzen.oczyśćLinię ? przestrzen.oczyśćLinię(znajdźPoEtykiecieTytułu()) : znajdźPoEtykiecieTytułu();
    }

    if (!tytułOryginalny) {
      return {
        ok: false,
        błąd: "Nie znaleziono tytułu w BUR"
      };
    }

    const normalizujTytułBur = przestrzen.normalizujTytułBur || przestrzen.normalizujTytulBur || function bezZmian(wartość) { return wartość; };
    const tytułPoNormalizacji = normalizujTytułBur(tytułOryginalny);
    const frazaWyszukiwania = przestrzen.tytułPrzedPierwsząInterpunkcją
      ? przestrzen.tytułPrzedPierwsząInterpunkcją(tytułPoNormalizacji)
      : tytułPoNormalizacji;

    return {
      ok: true,
      tytułOryginalny: tytułOryginalny,
      frazaWyszukiwania: frazaWyszukiwania
    };
  }

  function pobierzWartośćTerminuBur(dokumentBur, selektory) {
    const element = przestrzen.znajdźPolePoSelektorach(dokumentBur, selektory);
    if (!element) {
      return "";
    }
    const kontrolka = element.matches("input, select, textarea, [id^='select2-'][id$='-container']")
      ? element
      : element.querySelector("input, select, textarea, [id^='select2-'][id$='-container']");
    return przestrzen.pobierzWartośćPola(kontrolka || element);
  }

  function pobierzTytułAktualnejUsługiBur(dokumentBur) {
    const selektoryTytułu = [
      "#informacjepodstawowesekcja-tytuluslugi",
      "input[name*='tytuluslugi' i]",
      "textarea[name*='tytuluslugi' i]"
    ];
    const poleTytułu = selektoryTytułu.map(function znajdź(selektor) {
      return dokumentBur.querySelector(selektor);
    }).find(Boolean);

    if (poleTytułu) {
      return String(przestrzen.pobierzWartośćPola(poleTytułu) || "").replace(/\s+/g, " ").trim();
    }

    const wynikPola = przestrzen.znajdźCelFormularzaBur(dokumentBur, "tytul");
    const wartość = wynikPola.ok ? przestrzen.pobierzWartośćPola(wynikPola.element) : "";
    return String(wartość || "").replace(/\s+/g, " ").trim();
  }

  function odczytajAktualnyTerminBur(dokumentBur) {
    const bieżącyDokument = dokumentBur || document;
    const tytuł = pobierzTytułAktualnejUsługiBur(bieżącyDokument);
    const dataRozpoczęcia = pobierzWartośćTerminuBur(bieżącyDokument, [
      "#informacjepodstawowesekcja-datarozpoczeciauslugi"
    ]);
    const dataZakończenia = pobierzWartośćTerminuBur(bieżącyDokument, [
      "#informacjepodstawowesekcja-datazakonczeniauslugi"
    ]);
    const trybTekst = pobierzWartośćTerminuBur(bieżącyDokument, [
      "#select2-formularzwstepnysekcja-formaswiadczenia-container",
      "#formularzwstepnysekcja-formaswiadczenia"
    ]);
    const lokalizacja = pobierzWartośćTerminuBur(bieżącyDokument, [
      "#select2-lokalizacjauslugisekcja-miasto-container",
      "#lokalizacjauslugisekcja-miasto",
      "#lokalizacjauslugisekcja-adres"
    ]);

    return {
      tytuł: tytuł,
      dataRozpoczęcia: przestrzen.normalizujDatęTerminu(dataRozpoczęcia),
      dataZakończenia: przestrzen.normalizujDatęTerminu(dataZakończenia),
      tryb: /online/i.test(trybTekst) ? "online" : (/stacjon/i.test(trybTekst) ? "stacjonarna" : ""),
      lokalizacja: lokalizacja,
      url: bieżącyDokument === document ? location.href : ""
    };
  }

  let zegarPowiadomieniaOTerminieBur = null;

  function czyZmienionoPoleTerminuBur(element) {
    if (!element || !element.matches) {
      return false;
    }

    const czyPoleTerminu = element.matches([
      "#informacjepodstawowesekcja-tytuluslugi",
      "input[name*='tytuluslugi' i]",
      "textarea[name*='tytuluslugi' i]",
      "#informacjepodstawowesekcja-datarozpoczeciauslugi",
      "#informacjepodstawowesekcja-datarozpoczeciauslugi input",
      "#informacjepodstawowesekcja-datazakonczeniauslugi",
      "#informacjepodstawowesekcja-datazakonczeniauslugi input",
      "#formularzwstepnysekcja-formaswiadczenia",
      "#select2-formularzwstepnysekcja-formaswiadczenia-container",
      "#lokalizacjauslugisekcja-miasto",
      "#select2-lokalizacjauslugisekcja-miasto-container",
      "#lokalizacjauslugisekcja-adres"
    ].join(","));
    if (czyPoleTerminu) {
      return true;
    }

    return false;
  }

  function zaplanujPowiadomienieOTerminieBur(zdarzenie) {
    if (!czyZmienionoPoleTerminuBur(zdarzenie && zdarzenie.target)) {
      return;
    }

    if (zegarPowiadomieniaOTerminieBur) {
      globalny.clearTimeout(zegarPowiadomieniaOTerminieBur);
    }

    zegarPowiadomieniaOTerminieBur = globalny.setTimeout(function powiadomPanel() {
      zegarPowiadomieniaOTerminieBur = null;
      if (chrome.runtime && typeof chrome.runtime.sendMessage === "function") {
        chrome.runtime.sendMessage({
          typ: komunikaty.ZMIENIONO_AKTUALNY_TERMIN_BUR,
          wynik: odczytajAktualnyTerminBur()
        }, function zakończPowiadomienie() {
          void chrome.runtime.lastError;
        });
      }
    }, 40);
  }

  function sprawdźTerminHarmonogramuPrzedWprowadzeniem(wiadomosc) {
    const kontekstTerminu = wiadomosc && (wiadomosc.kontekstTerminu || wiadomosc.terminHarmonogramu);
    if (!kontekstTerminu) {
      return { ok: false, błąd: "Brak danych terminu, dla którego przygotowano harmonogram." };
    }

    const terminBur = odczytajAktualnyTerminBur();
    const zgodność = typeof przestrzen.sprawdźZgodnośćTerminuHarmonogramuZBur === "function"
      ? przestrzen.sprawdźZgodnośćTerminuHarmonogramuZBur(kontekstTerminu, terminBur)
      : przestrzen.sprawdźZgodnośćPrzygotowanegoHarmonogramu(kontekstTerminu, terminBur);

    if (zgodność.ok) {
      return { ok: true };
    }

    const zakresHarmonogramu = przestrzen.formatujZakresDatPrezentacyjny(
      zgodność.datyHarmonogramu && zgodność.datyHarmonogramu.dataRozpoczęcia,
      zgodność.datyHarmonogramu && zgodność.datyHarmonogramu.dataZakończenia
    ) || "brak danych";
    const zakresBur = przestrzen.formatujZakresDatPrezentacyjny(
      zgodność.datyBur && zgodność.datyBur.dataRozpoczęcia,
      zgodność.datyBur && zgodność.datyBur.dataZakończenia
    ) || "brak danych";
    const przygotowanySzczegóły = [
      zakresHarmonogramu,
      kontekstTerminu.tryb === "online" ? "Online" : kontekstTerminu.lokalizacja,
      kontekstTerminu.tryb && kontekstTerminu.tryb !== "online" ? "stacjonarna" : ""
    ].filter(Boolean).join(" · ");
    const edytowanySzczegóły = [
      zakresBur,
      terminBur && terminBur.lokalizacja,
      terminBur && terminBur.tryb
    ].filter(Boolean).join(" · ");

    return {
      ok: false,
      niezgodnyTermin: true,
      zgodność: zgodność,
      błąd: "NIE WPROWADZONO HARMONOGRAMU\n\nPrzygotowany:\n"
        + przygotowanySzczegóły
        + "\n\nEdytowany BUR:\n"
        + edytowanySzczegóły
        + "\n\nOtwórz właściwy termin BUR albo wybierz inny harmonogram."
    };
  }

  function odczytajStorageWalidacjiBur() {
    return new Promise(function utwórzPromise(resolve, reject) {
      chrome.storage.local.get(["ostatnieSzkolenieSemper", "wybranyTerminSemperIndex"], function poOdczycie(dane) {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve(dane || {});
      });
    });
  }

  function wybierzTerminSemper(szkolenieSemper, wybranyTerminSemperIndex) {
    const terminy = Array.isArray(szkolenieSemper.terminy) ? szkolenieSemper.terminy : [];
    const czyWybranoIndeks = wybranyTerminSemperIndex !== null && wybranyTerminSemperIndex !== undefined && wybranyTerminSemperIndex !== "";
    const indeks = czyWybranoIndeks ? Number(wybranyTerminSemperIndex) : NaN;

    if (terminy.length === 1) {
      return {
        ok: true,
        termin: terminy[0],
        indeks: 0
      };
    }

    if (terminy.length > 1 && (!czyWybranoIndeks || !Number.isInteger(indeks) || indeks < 0 || indeks >= terminy.length)) {
      return {
        ok: false,
        typ: komunikaty.BRAK_WYBRANEGO_TERMINU_SEMPER,
        komunikat: "Wybierz termin SEMPER do walidacji BUR."
      };
    }

    return {
      ok: true,
      termin: terminy[indeks] || {},
      indeks: Number.isInteger(indeks) ? indeks : 0
    };
  }

  function wyczyśćWynikDlaPanelu(wynik) {
    return {
      statusOgólny: wynik.statusOgólny,
      pozycje: (wynik.pozycje || []).map(function usuńElement(pozycja) {
        return {
          sekcja: pozycja.sekcja,
          pole: pozycja.pole,
          celFormularza: pozycja.celFormularza,
          status: pozycja.status,
          komunikat: pozycja.komunikat,
          oczekiwanaWartość: pozycja.oczekiwanaWartość,
          aktualnaWartość: pozycja.aktualnaWartość,
          opisPola: pozycja.opisPola,
          selektorPomocniczy: pozycja.selektorPomocniczy
        };
      })
    };
  }

  function znajdźElementDoPodświetlenia(element) {
    if (!element) {
      return null;
    }

    if (element.matches && element.matches(".ql-editor")) {
      return element.closest(".ql-container") || element;
    }

    if (element.matches && element.matches("[id^='select2-'][id$='-container'], .select2-selection, .select2-selection__rendered")) {
      return element.closest(".select2-container") || element;
    }

    if (element.matches && element.matches("input, textarea, select")) {
      return przestrzen.znajdźKontenerPola ? przestrzen.znajdźKontenerPola(element) : element;
    }

    return przestrzen.znajdźKontenerPola ? przestrzen.znajdźKontenerPola(element) : element;
  }

  function wyczyśćPodświetleniaBur(dokument) {
    dokument.querySelectorAll(".bur-asystent-pole-poprawne, .bur-asystent-pole-ostrzeżenie, .bur-asystent-pole-błąd").forEach(function usuńKlasy(element) {
      element.classList.remove("bur-asystent-pole-poprawne", "bur-asystent-pole-ostrzeżenie", "bur-asystent-pole-błąd");
    });
  }

  function podświetlPole(element, status) {
    const cel = znajdźElementDoPodświetlenia(element);

    if (!cel) {
      return;
    }

    cel.classList.remove("bur-asystent-pole-poprawne", "bur-asystent-pole-ostrzeżenie", "bur-asystent-pole-błąd");

    if (status === "poprawne") {
      cel.classList.add("bur-asystent-pole-poprawne");
    } else if (status === "ostrzeżenie") {
      cel.classList.add("bur-asystent-pole-ostrzeżenie");
    } else if (status === "błąd") {
      cel.classList.add("bur-asystent-pole-błąd");
    }
  }

  function zastosujWynikWalidacjiNaStronie(dokument, wynik) {
    wyczyśćPodświetleniaBur(dokument);

    (wynik.pozycje || []).forEach(function podświetlPozycję(pozycja) {
      podświetlPole(pozycja.element, pozycja.status);
    });
  }

  function znajdźElementDoNawigacji(element, typKontrolki) {
    if (!element) {
      return null;
    }
    if (typKontrolki === "select2") {
      return element.closest(".select2-container") || element.querySelector && element.querySelector(".select2-container") || element;
    }
    if (typKontrolki === "edytorTekstowy") {
      return element.closest(".ql-container") || element;
    }
    return element;
  }

  function podświetlCelNawigacji(element) {
    element.classList.remove("bur-asystent-cel-nawigacji");
    void element.offsetWidth;
    element.classList.add("bur-asystent-cel-nawigacji");
    setTimeout(function usuńPodświetlenie() {
      element.classList.remove("bur-asystent-cel-nawigacji");
    }, 5000);
  }

  function przejdźDoPolaBur(cel) {
    const znalezione = przestrzen.znajdźCelFormularzaBur(document, cel);
    if (!znalezione.ok) {
      return znalezione;
    }
    const element = znajdźElementDoNawigacji(znalezione.element, znalezione.cel.typKontrolki);
    element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    if (typeof element.focus === "function" && !element.matches("table, div")) {
      element.focus({ preventScroll: true });
    }
    podświetlCelNawigacji(element);
    return { ok: true, cel: cel };
  }

  function obsłużWalidacjęFormularzaBur(odpowiedz) {
    odczytajStorageWalidacjiBur()
      .then(function uruchomWalidację(dane) {
        const szkolenieSemper = dane.ostatnieSzkolenieSemper;

        if (!szkolenieSemper) {
          odpowiedz({
            typ: komunikaty.BRAK_DANYCH_SEMPER,
            komunikat: "Najpierw pobierz dane szkolenia ze strony SEMPER albo użyj funkcji »Uzupełnij z linku«."
          });
          return;
        }

        const wybórTerminu = wybierzTerminSemper(szkolenieSemper, dane.wybranyTerminSemperIndex);

        if (!wybórTerminu.ok) {
          odpowiedz({
            typ: wybórTerminu.typ,
            komunikat: wybórTerminu.komunikat
          });
          return;
        }

        if (typeof przestrzen.skorygujPodstawęWpisuBur === "function") {
          przestrzen.skorygujPodstawęWpisuBur(document);
        }

        const wynik = przestrzen.walidujFormularzBur(document, {
          szkolenieSemper: szkolenieSemper,
          wybranyTermin: wybórTerminu.termin
        });

        zastosujWynikWalidacjiNaStronie(document, wynik);

        odpowiedz({
          typ: komunikaty.ODPOWIEDŹ_WALIDACJA_BUR,
          wynik: wyczyśćWynikDlaPanelu(wynik),
          wybranyTerminSemperIndex: wybórTerminu.indeks
        });
      })
      .catch(function zwróćBłąd(błąd) {
        odpowiedz({
          typ: komunikaty.ODPOWIEDŹ_WALIDACJA_BUR,
          wynik: {
            statusOgólny: "błędy",
            pozycje: [{
              sekcja: "Walidacja BUR",
              pole: "Storage",
              status: "błąd",
              komunikat: błąd && błąd.message ? błąd.message : "Nie udało się uruchomić walidacji.",
              oczekiwanaWartość: "",
              aktualnaWartość: "",
              opisPola: "Storage",
              selektorPomocniczy: ""
            }]
          }
        });
      });
  }

  function obsłużWypełnianieFormularzaBur(wiadomosc, odpowiedz) {
    try {
      const wynik = przestrzen.wypełnijFormularzBur(document, {
        szkolenieSemper: wiadomosc.szkolenieSemper || {},
        wybranyTermin: wiadomosc.wybranyTermin || {}
      });

      odpowiedz({
        typ: komunikaty.ODPOWIEDŹ_WYPEŁNIJ_FORMULARZ_BUR,
        wynik: wynik
      });
    } catch (błąd) {
      odpowiedz({
        typ: komunikaty.BŁĄD_WYPEŁNIANIA_FORMULARZA_BUR,
        wynik: {
          ok: false,
          uzupełnione: [],
          pominięte: [],
          ostrzeżenia: [],
          błędy: [{
            sekcja: "Wypełnianie formularza",
            pole: "Formularz BUR",
            komunikat: błąd && błąd.message ? błąd.message : "Nie udało się wypełnić formularza BUR."
          }]
        }
      });
    }
  }

  if (globalny.__BUR_ASYSTENT_CONTENT_LISTENER_LOADED__) {
    return;
  }

  globalny.__BUR_ASYSTENT_CONTENT_LISTENER_LOADED__ = true;

  przestrzen.pobierzWierszeHarmonogramu = odczytajWierszeHarmonogramu;
  przestrzen.sprawdzHarmonogramPoWypelnieniu = sprawdzHarmonogramPoWypelnieniu;
  przestrzen.usuńIstniejącyHarmonogram = usuńIstniejącyHarmonogram;
  przestrzen.odczytajAktualnyTerminBur = odczytajAktualnyTerminBur;

  document.addEventListener("input", zaplanujPowiadomienieOTerminieBur, true);
  document.addEventListener("change", zaplanujPowiadomienieOTerminieBur, true);

  function kluczDziennegoLicznikaKolejkiBur() {
    const data = new Date();
    return "bur_daily_counter_" + data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate();
  }

  function pobierzStanKolejkiBur() {
    return {
      suroweTerminy: localStorage.getItem("bur_terms_raw") || "",
      indeks: Number(localStorage.getItem("bur_term_index") || 0),
      trybKolejności: localStorage.getItem("bur_terms_order_mode") || "standard",
      dzisiajDodane: Number(localStorage.getItem(kluczDziennegoLicznikaKolejkiBur()) || 0),
      łącznieDodane: Number(localStorage.getItem("bur_total_counter") || 0)
    };
  }

  function zapiszKolejkęBur(suroweTerminy, trybKolejności) {
    localStorage.setItem("bur_terms_raw", String(suroweTerminy || "").trim());
    localStorage.setItem("bur_term_index", "0");
    localStorage.setItem("bur_terms_order_mode", trybKolejności || "standard");
    return pobierzStanKolejkiBur();
  }

  function skorygujDziennyLicznikBur(wartość) {
    const nowaWartość = Number(wartość);
    if (!Number.isFinite(nowaWartość) || nowaWartość < 0) {
      throw new Error("Dzienny licznik musi być liczbą nieujemną.");
    }
    const stan = pobierzStanKolejkiBur();
    localStorage.setItem(kluczDziennegoLicznikaKolejkiBur(), String(nowaWartość));
    localStorage.setItem("bur_total_counter", String(Math.max(0, stan.łącznieDodane + nowaWartość - stan.dzisiajDodane)));
    return pobierzStanKolejkiBur();
  }

  chrome.runtime.onMessage.addListener(function obsluzKomunikat(wiadomosc, nadawca, odpowiedz) {
    if (!wiadomosc || !wiadomosc.typ) {
      return false;
    }

    if (wiadomosc.typ === komunikaty.PING_SKRYPTU_STRONY) {
      odpowiedz({
        ok: true,
        typ: komunikaty.PONG_SKRYPTU_STRONY,
        typStrony: "BUR",
        url: location.href,
        gotowyDom: document.readyState !== "loading",
        wersjaSkryptu: WERSJA_SKRYPTU_BUR
      });

      return true;
    }

    if (wiadomosc.typ === komunikaty.POBIERZ_TYTUŁ_Z_BUR) {
      odpowiedz({
        typ: komunikaty.ODPOWIEDŹ_TYTUŁ_Z_BUR,
        wynik: pobierzTytułZBur()
      });

      return true;
    }

    if (wiadomosc.typ === komunikaty.POBIERZ_AKTUALNY_TERMIN_BUR) {
      odpowiedz({
        typ: komunikaty.ODPOWIEDŹ_AKTUALNY_TERMIN_BUR,
        wynik: odczytajAktualnyTerminBur()
      });
      return true;
    }

    if (wiadomosc.typ === komunikaty.POBIERZ_STAN_KOLEJKI_BUR) {
      odpowiedz({ typ: komunikaty.ODPOWIEDŹ_STAN_KOLEJKI_BUR, wynik: pobierzStanKolejkiBur() });
      return true;
    }

    if (wiadomosc.typ === komunikaty.ZAPISZ_KOLEJKĘ_BUR) {
      odpowiedz({ typ: komunikaty.ODPOWIEDŹ_STAN_KOLEJKI_BUR, wynik: zapiszKolejkęBur(wiadomosc.suroweTerminy, "standard") });
      return true;
    }

    if (wiadomosc.typ === komunikaty.USTAW_TRYB_NOWEGO_SZKOLENIA_BUR) {
      odpowiedz({ typ: komunikaty.ODPOWIEDŹ_STAN_KOLEJKI_BUR, wynik: zapiszKolejkęBur(wiadomosc.suroweTerminy, wiadomosc.czyMaStacjonarne ? "new_training_stationary" : "standard") });
      return true;
    }

    if (wiadomosc.typ === komunikaty.RESETUJ_KOLEJKĘ_BUR) {
      localStorage.setItem("bur_term_index", "0");
      odpowiedz({ typ: komunikaty.ODPOWIEDŹ_STAN_KOLEJKI_BUR, wynik: pobierzStanKolejkiBur() });
      return true;
    }

    if (wiadomosc.typ === komunikaty.SKORYGUJ_DZIENNY_LICZNIK_BUR) {
      try {
        odpowiedz({ typ: komunikaty.ODPOWIEDŹ_STAN_KOLEJKI_BUR, wynik: skorygujDziennyLicznikBur(wiadomosc.wartość) });
      } catch (błąd) {
        odpowiedz({ typ: komunikaty.ODPOWIEDŹ_STAN_KOLEJKI_BUR, wynik: { błąd: błąd.message } });
      }
      return true;
    }

    if (wiadomosc.typ === komunikaty.RESETUJ_LICZNIKI_BUR) {
      localStorage.setItem("bur_total_counter", "0");
      localStorage.setItem(kluczDziennegoLicznikaKolejkiBur(), "0");
      odpowiedz({ typ: komunikaty.ODPOWIEDŹ_STAN_KOLEJKI_BUR, wynik: pobierzStanKolejkiBur() });
      return true;
    }

    if (wiadomosc.typ === komunikaty.WALIDUJ_FORMULARZ_BUR) {
      obsłużWalidacjęFormularzaBur(odpowiedz);

      return true;
    }

    if (wiadomosc.typ === komunikaty.PRZEJDŹ_DO_POLA_BUR) {
      odpowiedz({
        typ: komunikaty.ODPOWIEDŹ_PRZEJDŹ_DO_POLA_BUR,
        wynik: przejdźDoPolaBur(wiadomosc.cel)
      });
      return true;
    }

    if (wiadomosc.typ === komunikaty.WYPEŁNIJ_FORMULARZ_BUR) {
      obsłużWypełnianieFormularzaBur(wiadomosc, odpowiedz);

      return true;
    }

    if (wiadomosc.typ === komunikaty.PRZYGOTUJ_WYPEŁNIENIE_BUR) {
      const korektaPodstawyWpisu = typeof przestrzen.skorygujPodstawęWpisuBur === "function"
        ? przestrzen.skorygujPodstawęWpisuBur(document)
        : null;
      odpowiedz({
        typ: komunikaty.PRZYGOTUJ_WYPEŁNIENIE_BUR,
        wynik: {
          propozycje: przestrzen.przygotujPropozycjeWypełnieniaBur(document, wiadomosc.szkolenieSemper || {}, wiadomosc.wybranyTermin || {}),
          korektaPodstawyWpisu: korektaPodstawyWpisu ? {
            ok: korektaPodstawyWpisu.ok,
            status: korektaPodstawyWpisu.status,
            wartośćPrzed: korektaPodstawyWpisu.wartośćPrzed,
            wartośćPo: korektaPodstawyWpisu.wartośćPo,
            wartośćOczekiwana: korektaPodstawyWpisu.wartośćOczekiwana,
            kodBłędu: korektaPodstawyWpisu.kodBłędu,
            komunikat: korektaPodstawyWpisu.komunikat
          } : null
        }
      });
      return true;
    }

    if (wiadomosc.typ === komunikaty.ZASTOSUJ_ZATWIERDZONE_ZMIANY_BUR) {
      Promise.all((wiadomosc.propozycje || []).filter(function wybrane(propozycja) { return propozycja.zaznaczona; }).map(function ustaw(propozycja) {
        const znalezione = przestrzen.znajdźPoleBurZSzczegółami(document, propozycja.definicjaPola);
        const aktualna = znalezione.element ? przestrzen.pobierzWartośćPola(znalezione.element) : "";
        if (aktualna !== propozycja.wartośćAktualna) {
          return Promise.resolve({ ok: false, status: "konflikt_po_przygotowaniu", sekcja: propozycja.sekcja, pole: propozycja.pole, wartośćPrzed: aktualna, wartośćOczekiwana: propozycja.wartośćProponowana, wartośćPo: aktualna, kodBłędu: "KONFLIKT_PO_PRZYGOTOWANIU", komunikat: "Wartość BUR zmieniła się po przygotowaniu podglądu." });
        }
        return przestrzen.ustawPoleBurZWeryfikacją(document, { sekcja: propozycja.sekcja, pole: propozycja.pole, typPola: propozycja.typPola, wartość: propozycja.wartośćProponowana, definicjaPola: propozycja.definicjaPola, zezwólNaNadpisanie: propozycja.status === "konflikt" });
      })).then(function odpowiedzWynikiem(wyniki) { odpowiedz({ typ: komunikaty.ZASTOSUJ_ZATWIERDZONE_ZMIANY_BUR, wynik: { wyniki: wyniki, ok: wyniki.every(function poprawne(wynik) { return wynik.ok; }) } }); });
      return true;
    }

    if (wiadomosc.typ === komunikaty.WYCZYŚĆ_PODŚWIETLENIA_BUR) {
      wyczyśćPodświetleniaBur(document);
      odpowiedz({
        typ: komunikaty.ODPOWIEDŹ_WYCZYSZCZONO_PODŚWIETLENIA_BUR,
        wynik: {
          ok: true,
          komunikat: "Wyczyszczono podświetlenia BUR."
        }
      });

      return true;
    }

    if (wiadomosc.typ === komunikaty.SPRAWDŹ_PROGRAM_I_HARMONOGRAM_BUR) {
      odpowiedz({
        typ: komunikaty.ODPOWIEDŹ_PROGRAM_I_HARMONOGRAM_BUR,
        wynik: pobierzStanProgramuHarmonogramu()
      });

      return true;
    }

    if (wiadomosc.typ === komunikaty.UZUPEŁNIJ_PROGRAM_BUR) {
      odpowiedz({
        typ: komunikaty.ODPOWIEDŹ_PROGRAM_I_HARMONOGRAM_BUR,
        wynik: uzupełnijProgramUsługi(wiadomosc.program)
      });

      return true;
    }

    if (wiadomosc.typ === komunikaty.GENERUJ_HARMONOGRAM_BUR) {
      odpowiedz({
        typ: komunikaty.ODPOWIEDŹ_PROGRAM_I_HARMONOGRAM_BUR,
        wynik: {
          ok: true,
          komunikat: "Wygenerowano " + (wiadomosc.pozycje || []).length + " pozycji harmonogramu."
        }
      });

      return true;
    }

    if (wiadomosc.typ === komunikaty.ZASTĄP_HARMONOGRAM_BUR) {
      const kontrolaTerminu = sprawdźTerminHarmonogramuPrzedWprowadzeniem(wiadomosc);
      if (!kontrolaTerminu.ok) {
        odpowiedz({ typ: komunikaty.ODPOWIEDŹ_PROGRAM_I_HARMONOGRAM_BUR, wynik: kontrolaTerminu });
        return true;
      }
      zastąpHarmonogram(wiadomosc.pozycje || [])
        .then(function zwróćWynik(wynik) {
          odpowiedz({ typ: komunikaty.ODPOWIEDŹ_PROGRAM_I_HARMONOGRAM_BUR, wynik: wynik });
        })
        .catch(function zwróćBłąd(błąd) {
          odpowiedz({ typ: komunikaty.ODPOWIEDŹ_PROGRAM_I_HARMONOGRAM_BUR, wynik: { ok: false, nowyCsvZaimportowany: false, błąd: błąd && błąd.message ? błąd.message : "Nie udało się zastąpić harmonogramu." } });
        });
      return true;
    }

    if (wiadomosc.typ === komunikaty.WPROWADŹ_HARMONOGRAM_DO_BUR || wiadomosc.typ === komunikaty.IMPORTUJ_HARMONOGRAM_XLSX_BUR) {
      const kontrolaTerminu = sprawdźTerminHarmonogramuPrzedWprowadzeniem(wiadomosc);
      if (!kontrolaTerminu.ok) {
        odpowiedz({ typ: komunikaty.ODPOWIEDŹ_PROGRAM_I_HARMONOGRAM_BUR, wynik: kontrolaTerminu });
        return true;
      }
      wprowadźHarmonogramDoBur(wiadomosc.pozycje || [])
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
              błąd: błąd && błąd.message ? błąd.message : "Nie udało się importować harmonogramu CSV."
            }
          });
        });

      return true;
    }

    if (wiadomosc.typ === komunikaty.WYPEŁNIJ_HARMONOGRAM_RĘCZNIE_BUR) {
      const kontrolaTerminu = sprawdźTerminHarmonogramuPrzedWprowadzeniem(wiadomosc);
      if (!kontrolaTerminu.ok) {
        odpowiedz({ typ: komunikaty.ODPOWIEDŹ_PROGRAM_I_HARMONOGRAM_BUR, wynik: kontrolaTerminu });
        return true;
      }
      wypełnijPrzygotowanyHarmonogramRęcznie(wiadomosc.pozycje || [])
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
              błąd: błąd && błąd.message ? błąd.message : "Nie udało się wypełnić harmonogramu ręcznie."
            }
          });
        });

      return true;
    }

    if (wiadomosc.typ !== komunikaty.POBIERZ_DANE_ZE_STRONY) {
      return false;
    }

    odpowiedz({
      typ: komunikaty.ODPOWIEDZ_STATUS_STRONY,
      wynik: {
        typ: "BUR",
        url: location.href
      }
    });

    return true;
  });
})(globalThis);
