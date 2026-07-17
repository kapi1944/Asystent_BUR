(function uruchomBurContent(globalny) {
  const przestrzen = globalny.BurAsystent || {};
  const komunikaty = przestrzen.KOMUNIKATY;
  const WERSJA_SKRYPTU_BUR = "hotfix-import-harmonogramu-2026-07-17-v2";
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

  function pobierzWierszeTabeliHarmonogramu() {
    const tabela = document.querySelector(selektory.tabelaHarmonogramu);

    if (!tabela) {
      return [];
    }

    return Array.from(tabela.querySelectorAll("tbody tr, tr")).filter(function zostawPozycjęHarmonogramu(wiersz) {
      const komórki = Array.from(wiersz.children || []).filter(function tylkoTd(element) {
        return element.tagName === "TD";
      });
      const numerPozycji = komórki.length
        ? String(komórki[0].textContent || "").replace(/\s+/g, " ").trim()
        : "";

      /*
       * Tabela BUR zawiera także pięć wierszy podsumowania godzin.
       * Pozycja harmonogramu ma numer w pierwszej kolumnie i komplet kolumn,
       * dlatego nie wolno traktować podsumowań jako istniejących pozycji.
       */
      return komórki.length >= 7 && /^\d+$/.test(numerPozycji);
    });
  }

  function odczytajWierszeHarmonogramu() {
    return pobierzWierszeTabeliHarmonogramu().map(function odczytaj(wiersz, indeks) {
      return {
        numer: indeks + 1,
        tekst: String(wiersz.textContent || "").replace(/\s+/g, " ").trim()
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

  async function importujHarmonogramPrzezXlsx(pozycje) {
    const inputPliku = await znajdźInputPlikuImportu();

    if (!inputPliku) {
      return {
        ok: false,
        błąd: "Nie znaleziono jednoznacznego inputa pliku w sekcji importu harmonogramu BUR."
      };
    }

    if (inputPliku.disabled) {
      return {
        ok: false,
        błąd: "Pole importu harmonogramu BUR jest zablokowane."
      };
    }

    try {
      const liczbaPrzed = pobierzLiczbęPozycjiWTabeli();
      const daneXlsx = przestrzen.wygenerujDaneXlsxHarmonogramu(pozycje || []);
      const bajtyXlsx = daneXlsx instanceof Uint8Array ? daneXlsx : new Uint8Array(daneXlsx);

      if (bajtyXlsx.length < 4 || bajtyXlsx[0] !== 0x50 || bajtyXlsx[1] !== 0x4b) {
        throw new Error("Wygenerowane dane nie mają poprawnej sygnatury pliku XLSX/ZIP.");
      }

      const plik = new File([bajtyXlsx], "harmonogram-bur.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const transfer = new DataTransfer();

      if (!plik.size) {
        throw new Error("Wygenerowany plik harmonogram-bur.xlsx jest pusty.");
      }

      transfer.items.add(plik);
      inputPliku.files = transfer.files;

      if (!inputPliku.files
        || inputPliku.files.length !== 1
        || inputPliku.files[0].name !== "harmonogram-bur.xlsx"
        || inputPliku.files[0].size < 1) {
        throw new Error("Pole BUR nie przyjęło przygotowanego pliku XLSX.");
      }

      inputPliku.dispatchEvent(new Event("input", {
        bubbles: true,
        composed: true
      }));
      inputPliku.dispatchEvent(new Event("change", {
        bubbles: true,
        composed: true
      }));

      await opóźnij(350);

      if (pobierzLiczbęPozycjiWTabeli() === liczbaPrzed) {
        const przyciskWykonaniaImportu = znajdźPrzyciskWykonaniaImportu(inputPliku);

        if (przyciskWykonaniaImportu) {
          przyciskWykonaniaImportu.click();
        }
      }

      const wynikOczekiwania = await poczekajNaWynikImportu(pozycje || [], liczbaPrzed);
      const raport = wynikOczekiwania.raport || sprawdzHarmonogramPoWypelnieniu(pozycje || []);

      if (!wynikOczekiwania.ok) {
        return {
          ok: false,
          metoda: "XLSX",
          błąd: "Plik został przypisany do pola BUR, ale import nie dodał poprawnych wierszy w ciągu 12 sekund. " + (raport.błędy || []).join(" "),
          liczbaOczekiwanychPozycji: Array.isArray(pozycje) ? pozycje.length : 0,
          liczbaPozycjiWTabeli: pobierzLiczbęPozycjiWTabeli(),
          rozmiarPliku: plik.size
        };
      }

      return {
        ok: true,
        metoda: "XLSX",
        komunikat: "Zaimportowano harmonogram XLSX. Sprawdź dane przed zapisaniem usługi.",
        liczbaOczekiwanychPozycji: Array.isArray(pozycje) ? pozycje.length : 0,
        liczbaPozycjiWTabeli: pobierzLiczbęPozycjiWTabeli(),
        rozmiarPliku: plik.size,
        raport: raport
      };
    } catch (błąd) {
      return {
        ok: false,
        metoda: "XLSX",
        błąd: błąd && błąd.message ? błąd.message : "Nie udało się przekazać pliku XLSX do importu."
      };
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
    const wiersze = pobierzWierszeTabeliHarmonogramu();
    const tekstTabeli = wiersze.map(function pobierzTekst(wiersz) {
      return wiersz.textContent || "";
    }).join("\n");
    const błędy = [];
    const ostrzeżenia = [];
    const ostatniDzień = oczekiwane.length ? oczekiwane[oczekiwane.length - 1].dzien_swiadczenia : "";

    if (wiersze.length < oczekiwane.length) {
      błędy.push("Tabela zawiera " + wiersze.length + " pozycji, oczekiwano co najmniej " + oczekiwane.length + ".");
    }

    oczekiwane.forEach(function sprawdźPozycję(pozycja) {
      [pozycja.dzien_swiadczenia, pozycja.czas_rozpoczecia, pozycja.czas_zakonczenia, pozycja.typ_aktywnosci].forEach(function sprawdźWartość(wartość) {
        if (wartość && !tekstTabeli.includes(wartość)) {
          ostrzeżenia.push("Nie potwierdzono w tabeli wartości: " + wartość + ".");
        }
      });

      if (pozycja.typ_aktywnosci === "Przerwa" && (pozycja.przedmiot || pozycja.prowadzacy)) {
        błędy.push("Przerwa nie powinna mieć tematu ani prowadzącego.");
      }

      if (pozycja.typ_aktywnosci === "Zajęcia" && (!pozycja.przedmiot || !pozycja.prowadzacy)) {
        błędy.push("Zajęcia powinny mieć temat i trenera.");
      }

      if (pozycja.typ_aktywnosci === "Walidacja" && pozycja.dzien_swiadczenia !== ostatniDzień) {
        błędy.push("Walidacja występuje poza ostatnim dniem.");
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
      ostrzeżenia: ostrzeżenia
    };
  }

  async function importujXlsxZFallbackiem(pozycje) {
    const tabela = document.querySelector(selektory.tabelaHarmonogramu);
    const obecneWiersze = odczytajWierszeHarmonogramu();
    const istniejącePozycje = przestrzen.czyTabelaHarmonogramuMaPozycje(obecneWiersze);

    if (!tabela) {
      return {
        ok: false,
        błąd: "Nie znaleziono tabeli harmonogramu BUR.",
        liczbaOczekiwanychPozycji: Array.isArray(pozycje) ? pozycje.length : 0
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

    const wynikImportu = await importujHarmonogramPrzezXlsx(pozycje);

    if (wynikImportu.ok) {
      return wynikImportu;
    }

    /*
     * Przycisk „Wprowadź harmonogram do BUR” wykonuje wyłącznie import XLSX.
     * Awaryjne wypełnianie ręczne ma osobny, świadomy przycisk w panelu.
     * Dzięki temu błąd importu nie może otworzyć modalu „Dodaj osobę prowadzącą”.
     */
    return {
      ok: false,
      metoda: "XLSX",
      błąd: wynikImportu.błąd
        || "BUR nie potwierdził importu harmonogramu XLSX.",
      fallbackDostępny: true,
      liczbaOczekiwanychPozycji: Array.isArray(pozycje) ? pozycje.length : 0,
      liczbaPozycjiWTabeli: pobierzLiczbęPozycjiWTabeli(),
      rozmiarPliku: wynikImportu.rozmiarPliku || 0
    };
  }

  async function wprowadźHarmonogramDoBur(pozycje) {
    const pozycjeHarmonogramu = Array.isArray(pozycje) ? pozycje : [];

    if (!pozycjeHarmonogramu.length) {
      return {
        ok: false,
        błąd: "Brak przygotowanego harmonogramu XLSX."
      };
    }

    return importujXlsxZFallbackiem(pozycjeHarmonogramu);
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

  const poprzedniaRejestracjaListenera = Number(globalny.__BUR_ASYSTENT_CONTENT_LISTENER_LOADED__ || 0);

  if (Date.now() - poprzedniaRejestracjaListenera < 1000) {
    return;
  }

  globalny.__BUR_ASYSTENT_CONTENT_LISTENER_LOADED__ = Date.now();

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
      odpowiedz({ typ: komunikaty.PRZYGOTUJ_WYPEŁNIENIE_BUR, wynik: { propozycje: przestrzen.przygotujPropozycjeWypełnieniaBur(document, wiadomosc.szkolenieSemper || {}, wiadomosc.wybranyTermin || {}) } });
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

    if (wiadomosc.typ === komunikaty.WPROWADŹ_HARMONOGRAM_DO_BUR || wiadomosc.typ === komunikaty.IMPORTUJ_HARMONOGRAM_XLSX_BUR) {
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
              błąd: błąd && błąd.message ? błąd.message : "Nie udało się importować harmonogramu XLSX."
            }
          });
        });

      return true;
    }

    if (wiadomosc.typ === komunikaty.WYPEŁNIJ_HARMONOGRAM_RĘCZNIE_BUR) {
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
