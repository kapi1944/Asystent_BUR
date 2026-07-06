(function uruchomBurContent(globalny) {
  const przestrzen = globalny.BurAsystent || {};
  const komunikaty = przestrzen.KOMUNIKATY;
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

    return Array.from(tabela.querySelectorAll("tbody tr, tr")).filter(function pomińNagłówek(wiersz) {
      return wiersz.querySelectorAll("td").length > 0;
    });
  }

  function znajdźInputPlikuImportu() {
    const przyciskImportu = document.querySelector(selektory.importHarmonogramu);
    const kandydaci = Array.from(document.querySelectorAll("input[type='file']"));

    if (kandydaci.length === 1) {
      return kandydaci[0];
    }

    if (przyciskImportu) {
      const kontener = przyciskImportu.closest("form, section, div") || document;
      const lokalnyInput = kontener.querySelector("input[type='file']");

      if (lokalnyInput) {
        return lokalnyInput;
      }

      const idInputa = przyciskImportu.getAttribute("for") || przyciskImportu.getAttribute("data-target");

      if (idInputa) {
        return document.getElementById(idInputa.replace(/^#/, ""));
      }
    }

    return kandydaci[0] || null;
  }

  async function importujHarmonogramPrzezXml(xml, pozycje) {
    const inputPliku = znajdźInputPlikuImportu();

    if (!document.querySelector(selektory.importHarmonogramu)) {
      return {
        ok: false,
        błąd: "Nie znaleziono przycisku importu harmonogramu."
      };
    }

    if (!inputPliku) {
      return {
        ok: false,
        błąd: "Nie znaleziono technicznego inputa pliku dla importu XML. Nie otwieram natywnego okna wyboru pliku."
      };
    }

    try {
      const plik = new File([xml], "harmonogram-bur.xml", { type: "application/xml" });
      const transfer = new DataTransfer();

      transfer.items.add(plik);
      inputPliku.files = transfer.files;
      wywołajZdarzenia(inputPliku);
      await opóźnij(900);

      const raport = sprawdzHarmonogramPoWypelnieniu(pozycje || []);

      if (!raport.ok) {
        return {
          ok: false,
          błąd: "Import XML nie potwierdził poprawnego uzupełnienia tabeli: " + raport.błędy.join(" ")
        };
      }

      return {
        ok: true,
        komunikat: "Zaimportowano harmonogram XML. Sprawdź dane przed zapisaniem usługi.",
        raport: raport
      };
    } catch (błąd) {
      return {
        ok: false,
        błąd: błąd && błąd.message ? błąd.message : "Nie udało się przekazać pliku XML do importu."
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

  async function wypelnijHarmonogramRecznie(pozycje) {
    const pozycjeHarmonogramu = Array.isArray(pozycje) ? pozycje : [];
    const błędy = [];

    for (let indeks = 0; indeks < pozycjeHarmonogramu.length; indeks += 1) {
      const przyciskDodaj = znajdźPrzyciskPoTekście([/dodaj/i, /nowa\s+pozycja/i]);

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

      const przyciskZapisz = znajdźPrzyciskPoTekście([/zapisz/i, /dodaj/i, /zatwierdź/i]);

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
      komunikat: "Wypełniono harmonogram ręcznie. Sprawdź dane przed zapisaniem usługi.",
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

  async function importujXmlZFallbackiem(xml, pozycje) {
    const wynikImportu = await importujHarmonogramPrzezXml(xml, pozycje);

    if (wynikImportu.ok) {
      return wynikImportu;
    }

    const wynikRęczny = await wypelnijHarmonogramRecznie(pozycje);

    if (wynikRęczny.ok) {
      wynikRęczny.komunikat = "Import XML nie był dostępny, użyto trybu ręcznego. Sprawdź dane przed zapisaniem usługi.";
      return wynikRęczny;
    }

    return {
      ok: false,
      błąd: "Import XML: " + wynikImportu.błąd + " Fallback ręczny: " + wynikRęczny.błąd
    };
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

  chrome.runtime.onMessage.addListener(function obsluzKomunikat(wiadomosc, nadawca, odpowiedz) {
    if (!wiadomosc || !wiadomosc.typ) {
      return false;
    }

    if (wiadomosc.typ === komunikaty.PING_SKRYPTU_STRONY) {
      odpowiedz({
        typ: komunikaty.PONG_SKRYPTU_STRONY,
        typStrony: "BUR",
        url: location.href
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

    if (wiadomosc.typ === komunikaty.IMPORTUJ_HARMONOGRAM_XML_BUR) {
      importujXmlZFallbackiem(wiadomosc.xml, wiadomosc.pozycje || [])
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
              błąd: błąd && błąd.message ? błąd.message : "Nie udało się importować harmonogramu XML."
            }
          });
        });

      return true;
    }

    if (wiadomosc.typ === komunikaty.WYPEŁNIJ_HARMONOGRAM_RĘCZNIE_BUR) {
      wypelnijHarmonogramRecznie(wiadomosc.pozycje || [])
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
