(function zarejestrujWypełniaczBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  let ostatnieOstrzeżenieSelect2 = "";

  function normalizujKluczBur(wartość) {
    const normalizuj = przestrzeń.normalizujTekstDoWalidacji || function bezNormalizacji(tekst) {
      return String(tekst || "").replace(/\s+/g, " ").trim();
    };

    return normalizuj(wartość)
      .toLowerCase()
      .replace(/ł/g, "l")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function dodajUzupełnione(raport, sekcja, pole, wartość) {
    raport.uzupełnione.push({
      sekcja: sekcja,
      pole: pole,
      wartość: wartość === undefined || wartość === null ? "" : String(wartość)
    });
  }

  function dodajPominięte(raport, sekcja, pole, powód) {
    raport.pominięte.push({
      sekcja: sekcja,
      pole: pole,
      powód: powód || "Nie znaleziono pola."
    });
  }

  function dodajOstrzeżenie(raport, sekcja, pole, komunikat) {
    raport.ostrzeżenia.push({
      sekcja: sekcja,
      pole: pole,
      komunikat: komunikat || "Pole wymaga ręcznego sprawdzenia."
    });
  }

  function dodajBłąd(raport, sekcja, pole, komunikat) {
    raport.błędy.push({
      sekcja: sekcja,
      pole: pole,
      komunikat: komunikat || "Nie udało się uzupełnić pola."
    });
  }

  function wywołajZdarzeniaZmiany(element) {
    if (!element || !element.dispatchEvent) {
      return;
    }

    ["input", "change", "blur"].forEach(function wywołaj(typ) {
      element.dispatchEvent(new Event(typ, { bubbles: true }));
    });
  }

  function ustawNatywnąWartość(element, wartość) {
    const prototyp = element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : element instanceof HTMLInputElement
        ? HTMLInputElement.prototype
        : element instanceof HTMLSelectElement
          ? HTMLSelectElement.prototype
          : null;
    const opis = prototyp ? Object.getOwnPropertyDescriptor(prototyp, "value") : null;

    if (opis && opis.set) {
      opis.set.call(element, wartość);
    } else {
      element.value = wartość;
    }
  }

  function ustawWartośćPola(element, wartość) {
    if (!element) {
      return false;
    }

    const tekst = wartość === undefined || wartość === null ? "" : String(wartość);

    if (element.matches && element.matches("input, textarea, select")) {
      if (element.tagName === "SELECT") {
        const klucz = normalizujKluczBur(tekst);
        const opcja = Array.from(element.options || []).find(function znajdźOpcję(opcjaSelect) {
          const tekstOpcji = normalizujKluczBur(opcjaSelect.textContent || opcjaSelect.value || "");

          return tekstOpcji === klucz || tekstOpcji.includes(klucz);
        });

        if (opcja) {
          ustawNatywnąWartość(element, opcja.value);
        } else {
          ustawNatywnąWartość(element, tekst);
        }
      } else {
        ustawNatywnąWartość(element, tekst);
      }
    } else if (element.isContentEditable || (element.matches && element.matches("[contenteditable='true']"))) {
      element.textContent = tekst;
    } else {
      element.textContent = tekst;
    }

    wywołajZdarzeniaZmiany(element);
    return true;
  }

  function tekstNaAkapityHtml(tekst) {
    const części = String(tekst || "")
      .split(/\n{2,}|\r?\n/)
      .map(function oczyść(część) { return część.trim(); })
      .filter(Boolean);

    if (!części.length) {
      return "";
    }

    return części.map(function zbudujAkapit(część) {
      const bezpieczny = część
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      return "<p>" + bezpieczny + "</p>";
    }).join("");
  }

  function ustawPowiązaneUkrytePoleQuill(edytor, wartość) {
    const kontener = edytor.closest(".ql-container, .form-group, .field, [class*='field-'], div");
    const pole = kontener ? kontener.querySelector("textarea, input[type='hidden']") : null;

    if (pole && pole !== edytor) {
      ustawWartośćPola(pole, wartość);
    }
  }

  function ustawWartośćQuill(elementLubKontener, htmlLubTekst) {
    if (!elementLubKontener) {
      return false;
    }

    const edytor = elementLubKontener.matches && elementLubKontener.matches(".ql-editor")
      ? elementLubKontener
      : elementLubKontener.querySelector(".ql-editor");

    if (!edytor) {
      return false;
    }

    const wartość = String(htmlLubTekst || "");

    if (/<[a-z][\s\S]*>/i.test(wartość)) {
      edytor.innerHTML = wartość;
    } else {
      edytor.innerHTML = tekstNaAkapityHtml(wartość);
    }

    ustawPowiązaneUkrytePoleQuill(edytor, edytor.innerHTML);
    wywołajZdarzeniaZmiany(edytor);
    wywołajZdarzeniaZmiany(edytor.closest(".ql-container") || edytor.parentElement);
    return true;
  }

  function znajdźUkrytySelect2(dokument, elementLubKontener) {
    if (!elementLubKontener) {
      return null;
    }

    const id = elementLubKontener.id || "";
    const dopasowanie = id.match(/^select2-(.+)-container$/);

    if (dopasowanie) {
      return dokument.getElementById(dopasowanie[1]);
    }

    const kontener = elementLubKontener.closest(".form-group, .field, [class*='field-'], div") || elementLubKontener.parentElement;

    return kontener ? kontener.querySelector("select, input[type='hidden']") : null;
  }

  function znajdźPrzyciskLubOpcjęSelect2PoTekście(tekst) {
    const klucz = normalizujKluczBur(tekst);
    const kandydaci = Array.from(document.querySelectorAll(".select2-results__option, li, button, [role='option']"));

    return kandydaci.find(function znajdź(element) {
      const tekstElementu = normalizujKluczBur(element.textContent || element.getAttribute("aria-label") || "");

      return tekstElementu === klucz || tekstElementu.includes(klucz);
    }) || null;
  }

  function ustawSelect2PoTekście(dokument, elementLubKontener, tekst) {
    ostatnieOstrzeżenieSelect2 = "";

    if (!elementLubKontener) {
      return false;
    }

    const poleTechniczne = znajdźUkrytySelect2(dokument, elementLubKontener);
    const klucz = normalizujKluczBur(tekst);

    function czyPotwierdzonoWartość(element) {
      const odczyt = przestrzeń.pobierzWartośćPola
        ? przestrzeń.pobierzWartośćPola(element)
        : (element && "value" in element ? element.value : "");
      const kluczOdczytu = normalizujKluczBur(odczyt);

      return Boolean(kluczOdczytu && (kluczOdczytu === klucz || kluczOdczytu.includes(klucz) || klucz.includes(kluczOdczytu)));
    }

    if (poleTechniczne && poleTechniczne.tagName === "SELECT") {
      const opcja = Array.from(poleTechniczne.options || []).find(function znajdźOpcję(opcjaSelect) {
        const tekstOpcji = normalizujKluczBur(opcjaSelect.textContent || opcjaSelect.value || "");

        return tekstOpcji === klucz || tekstOpcji.includes(klucz);
      });

      if (opcja) {
        ustawNatywnąWartość(poleTechniczne, opcja.value);
        wywołajZdarzeniaZmiany(poleTechniczne);
        if (globalny.jQuery) {
          globalny.jQuery(poleTechniczne).trigger("change");
        }

        return czyPotwierdzonoWartość(poleTechniczne);
      }
    }

    if (poleTechniczne && poleTechniczne.matches && poleTechniczne.matches("input[type='hidden']")) {
      ustawNatywnąWartość(poleTechniczne, tekst);
      wywołajZdarzeniaZmiany(poleTechniczne);

      if (czyPotwierdzonoWartość(poleTechniczne)) {
        return true;
      }
    }

    try {
      elementLubKontener.click();
      const opcja = znajdźPrzyciskLubOpcjęSelect2PoTekście(tekst);

      if (opcja) {
        opcja.click();
        return true;
      }
    } catch (błąd) {}

    const widoczny = elementLubKontener.matches && elementLubKontener.matches("[id^='select2-'][id$='-container'], .select2-selection__rendered")
      ? elementLubKontener
      : elementLubKontener.querySelector("[id^='select2-'][id$='-container'], .select2-selection__rendered");

    if (widoczny) {
      widoczny.textContent = tekst;
      widoczny.setAttribute("title", tekst);
      wywołajZdarzeniaZmiany(widoczny);
      ostatnieOstrzeżenieSelect2 = "Select2 wygląda na ustawiony wizualnie, ale nie potwierdzono wartości technicznej.";
    }

    return false;
  }

  function znajdźElementPoTekście(dokument, tekst) {
    const klucz = normalizujKluczBur(tekst);
    const elementy = Array.from(dokument.querySelectorAll("label, span, div, p, button, strong, b"));

    return elementy.find(function sprawdź(element) {
      const tekstElementu = normalizujKluczBur(element.textContent || element.getAttribute("aria-label") || "");

      return tekstElementu && tekstElementu.length <= 520 && tekstElementu.includes(klucz);
    }) || null;
  }

  function ustawPrzełącznikTakNie(elementLubKontener, oczekiwanyStan) {
    if (!elementLubKontener) {
      return false;
    }

    const oczekiwany = normalizujKluczBur(oczekiwanyStan).includes("tak") ? "TAK" : "NIE";
    const pobierzStan = przestrzeń.pobierzStanPrzełącznika || function brakStanu() { return ""; };
    const aktualny = pobierzStan(elementLubKontener);

    if (aktualny === oczekiwany) {
      return true;
    }

    if (aktualny !== "TAK" && aktualny !== "NIE") {
      return false;
    }

    const kontener = (przestrzeń.znajdźKontenerPola && przestrzeń.znajdźKontenerPola(elementLubKontener)) || elementLubKontener;
    const cel = kontener.querySelector(".toggle-switch label, .toggler");

    if (!cel) {
      return false;
    }

    cel.click();
    wywołajZdarzeniaZmiany(cel);
    return pobierzStan(kontener) === oczekiwany;
  }

  function ustawPoleJeśliIstnieje(definicjaPola, wartość) {
    const definicja = definicjaPola || {};
    const dokument = definicja.dokument || document;
    const pole = przestrzeń.znajdźPoleBur
      ? przestrzeń.znajdźPoleBur(dokument, definicja)
      : (definicja.selektory ? dokument.querySelector(definicja.selektory[0]) : null);

    if (!pole) {
      return false;
    }

    if (definicja.typ === "quill") {
      return ustawWartośćQuill(pole, wartość);
    }

    if (definicja.typ === "select2") {
      return ustawSelect2PoTekście(dokument, pole, wartość);
    }

    if (definicja.typ === "przełącznik") {
      return ustawPrzełącznikTakNie(pole, wartość);
    }

    return ustawWartośćPola(pole, wartość);
  }

  function pobierzWartośćTechniczną(element, typ) {
    if (typ === "quill") {
      const edytor = element.matches && element.matches(".ql-editor") ? element : element.querySelector(".ql-editor");
      return edytor ? edytor.innerHTML : "";
    }
    if (typ === "select2") {
      const select = znajdźUkrytySelect2(element.ownerDocument || document, element);
      return select && "value" in select ? String(select.value || "") : "";
    }
    return przestrzeń.pobierzWartośćPola ? przestrzeń.pobierzWartośćPola(element) : String(element.value || element.textContent || "");
  }

  function poczekajNaReakcję(element, warunek, timeoutMs) {
    return new Promise(function oczekuj(resolve) {
      if (warunek()) { resolve(true); return; }
      const obserwator = typeof MutationObserver !== "undefined" ? new MutationObserver(function sprawdź() { if (warunek()) { obserwator.disconnect(); resolve(true); } }) : null;
      if (obserwator) { obserwator.observe(element.closest("form, .form-group, .ql-container") || element, { childList: true, subtree: true, attributes: true, characterData: true }); }
      setTimeout(function zakończ() { if (obserwator) { obserwator.disconnect(); } resolve(warunek()); }, timeoutMs || 600);
    });
  }

  async function ustawPoleBurZWeryfikacją(dokument, ustawienia) {
    const definicja = ustawienia.definicjaPola || ustawienia.definicja || {};
    const typPola = ustawienia.typPola || definicja.typ || "input";
    const znalezione = przestrzeń.znajdźPoleBurZSzczegółami ? przestrzeń.znajdźPoleBurZSzczegółami(dokument, definicja) : { element: przestrzeń.znajdźPoleBur(dokument, definicja), metodaZnalezienia: "selektor", selektor: "" };
    const wynik = { ok: false, status: "błąd", sekcja: ustawienia.sekcja || definicja.sekcja || "", pole: ustawienia.pole || definicja.etykieta || "", typPola: typPola, wartośćPrzed: "", wartośćOczekiwana: String(ustawienia.wartość || ""), wartośćPo: "", metodaZnalezienia: znalezione.metodaZnalezienia, selektor: znalezione.selektor, kodBłędu: "", komunikat: "" };
    const element = znalezione.element;
    if (!element) { wynik.kodBłędu = znalezione.kodBłędu || "BRAK_ELEMENTU"; wynik.komunikat = wynik.kodBłędu === "NIEJEDNOZNACZNY_SELEKTOR" ? "Selektor wskazuje więcej niż jedno pole BUR." : "Nie znaleziono pola BUR."; return wynik; }
    wynik.wartośćPrzed = pobierzWartośćTechniczną(element, typPola);
    if (normalizujKluczBur(wynik.wartośćPrzed) === normalizujKluczBur(wynik.wartośćOczekiwana)) { wynik.ok = true; wynik.status = "już_zgodne"; wynik.wartośćPo = wynik.wartośćPrzed; return wynik; }
    if (wynik.wartośćPrzed && !ustawienia.zezwólNaNadpisanie) { wynik.kodBłędu = "KONFLIKT_WARTOŚCI"; wynik.komunikat = "Pole zawiera inną wartość i wymaga decyzji użytkownika."; return wynik; }
    const ustawiono = ustawPoleJeśliIstnieje(Object.assign({}, definicja, { dokument: dokument }), wynik.wartośćOczekiwana);
    if (element.blur) { element.blur(); }
    const potwierdzono = await poczekajNaReakcję(element, function zgodne() { return normalizujKluczBur(pobierzWartośćTechniczną(element, typPola)) === normalizujKluczBur(wynik.wartośćOczekiwana); });
    wynik.wartośćPo = pobierzWartośćTechniczną(element, typPola);
    if (ustawiono && normalizujKluczBur(wynik.wartośćPo) === normalizujKluczBur(wynik.wartośćOczekiwana)) { wynik.ok = true; wynik.status = "potwierdzone"; return wynik; }
    wynik.kodBłędu = potwierdzono ? (typPola === "select2" ? "BRAK_POTWIERDZENIA_SELECT2" : "ODRZUCONA_WARTOŚĆ") : "TIMEOUT";
    wynik.komunikat = "BUR nie potwierdził oczekiwanej wartości po zapisie.";
    return wynik;
  }

  function ustawRaportowanePole(raport, dokument, ustawienia) {
    const definicja = Object.assign({}, ustawienia.definicja || {}, {
      dokument: dokument,
      typ: ustawienia.typ
    });
    const ok = ustawPoleJeśliIstnieje(definicja, ustawienia.wartość);

    if (ok) {
      dodajUzupełnione(raport, ustawienia.sekcja, ustawienia.pole, ustawienia.wartość);
    } else {
      const powód = ustawienia.powód || "Nie znaleziono pola albo nie dało się ustawić wartości.";

      dodajPominięte(raport, ustawienia.sekcja, ustawienia.pole, powód);
      dodajOstrzeżenie(raport, ustawienia.sekcja, ustawienia.pole, ustawienia.typ === "select2" && ostatnieOstrzeżenieSelect2 ? ostatnieOstrzeżenieSelect2 : powód);
    }

    return ok;
  }

  function pobierzSekcjęSemper(szkolenieSemper, nazwy) {
    const sekcje = szkolenieSemper && szkolenieSemper.sekcje ? szkolenieSemper.sekcje : {};

    for (let indeks = 0; indeks < nazwy.length; indeks += 1) {
      if (sekcje[nazwy[indeks]]) {
        return sekcje[nazwy[indeks]];
      }
    }

    return "";
  }

  function pobierzTytułBur(szkolenieSemper) {
    const tytuł = szkolenieSemper.tytułPoNormalizacjiBur || szkolenieSemper.tytułBur || szkolenieSemper.tytulBur || szkolenieSemper.tytułOryginalny || szkolenieSemper.tytulOryginalny || "";
    const normalizuj = przestrzeń.normalizujTytułBur || przestrzeń.normalizujTytulBur || function bezZmian(wartość) { return wartość; };

    return normalizuj(tytuł);
  }

  function czyTerminOnline(termin) {
    return /online/i.test([termin.forma, termin.miejsce].join(" "));
  }

  function znajdźPoleWTabeli(dokument, tytułTabeli, nazwaKolumny) {
    const tabele = Array.from(dokument.querySelectorAll("table"));
    const kluczTabeli = normalizujKluczBur(tytułTabeli);
    const kluczKolumny = normalizujKluczBur(nazwaKolumny);

    for (let indeksTabeli = 0; indeksTabeli < tabele.length; indeksTabeli += 1) {
      const tabela = tabele[indeksTabeli];

      if (!normalizujKluczBur(tabela.textContent || "").includes(kluczTabeli)) {
        continue;
      }

      const nagłówki = Array.from(tabela.querySelectorAll("tr:first-child th, tr:first-child td"));
      const indeksKolumny = nagłówki.findIndex(function sprawdźNagłówek(nagłówek) {
        return normalizujKluczBur(nagłówek.textContent || "").includes(kluczKolumny);
      });
      const wiersze = Array.from(tabela.querySelectorAll("tr")).slice(1);

      if (indeksKolumny < 0 || !wiersze.length || !wiersze[0].children[indeksKolumny]) {
        continue;
      }

      return wiersze[0].children[indeksKolumny].querySelector("input, textarea, select, .ql-editor, [id^='select2-'][id$='-container'], .select2-selection") || wiersze[0].children[indeksKolumny];
    }

    return null;
  }

  function wypełnijFormularzWstępny(dokument, kontekst, raport) {
    const termin = kontekst.wybranyTermin || {};
    const forma = czyTerminOnline(termin) ? "online" : "stacjonarna";

    [
      {
        sekcja: "Formularz wstępny",
        pole: "Forma świadczenia usługi",
        wartość: forma,
        typ: "select2",
        definicja: {
          sekcja: "Formularz wstępny",
          etykieta: "Forma świadczenia usługi",
          selektory: ["#select2-formularzwstepnysekcja-formaswiadczenia-container"]
        }
      },
      {
        sekcja: "Formularz wstępny",
        pole: "Wariant zajęć",
        wartość: "Zajęcia grupowe",
        typ: "select2",
        definicja: {
          sekcja: "Formularz wstępny",
          etykieta: "Wariant zajęć",
          selektory: ["#select2-formularzwstepnysekcja-wariantzajec-container"]
        }
      },
      {
        sekcja: "Formularz wstępny",
        pole: "Podstawa uzyskania wpisu do BUR",
        wartość: "Znak Jakości TGLS Quality Alliance",
        typ: "select2",
        definicja: {
          sekcja: "Formularz wstępny",
          etykieta: "Podstawa uzyskania wpisu do BUR",
          selektory: ["#select2-formularzwstepnysekcja-podstawauzyskaniawpisuid-container"]
        }
      },
      {
        sekcja: "Formularz wstępny",
        pole: "Usługa zamknięta",
        wartość: "NIE",
        typ: "przełącznik",
        definicja: {
          sekcja: "Formularz wstępny",
          etykieta: "Usługa zamknięta",
          selektory: ["#formularzwstepnysekcja-czyuslugadedykowanaLabel"]
        }
      }
    ].forEach(function ustaw(ustawienia) {
      const ok = ustawRaportowanePole(raport, dokument, ustawienia);

      if (!ok && ustawienia.typ === "przełącznik") {
        dodajOstrzeżenie(raport, ustawienia.sekcja, ustawienia.pole, "Nie ustalono bezpiecznie stanu przełącznika.");
      }
    });
  }

  function wypełnijInformacjePodstawowe(dokument, kontekst, raport) {
    const szkolenieSemper = kontekst.szkolenieSemper || {};
    const termin = kontekst.wybranyTermin || {};
    const minimum = czyTerminOnline(termin) ? "2" : "5";
    const pola = [
      {
        sekcja: "Informacje podstawowe",
        pole: "Tytuł",
        wartość: pobierzTytułBur(szkolenieSemper),
        definicja: {
          sekcja: "Informacje podstawowe",
          etykieta: "Tytuł",
          selektory: ["#informacjepodstawowesekcja-tytuluslugi"]
        }
      },
      {
        sekcja: "Informacje podstawowe",
        pole: "Data rozpoczęcia usługi",
        wartość: termin.dataStartBur || "",
        definicja: {
          sekcja: "Informacje podstawowe",
          etykieta: "Data rozpoczęcia usługi",
          selektory: ["#informacjepodstawowesekcja-datarozpoczeciauslugi"]
        }
      },
      {
        sekcja: "Informacje podstawowe",
        pole: "Data zakończenia usługi",
        wartość: termin.dataKoniecBur || "",
        definicja: {
          sekcja: "Informacje podstawowe",
          etykieta: "Data zakończenia usługi",
          selektory: ["#informacjepodstawowesekcja-datazakonczeniauslugi"]
        }
      },
      {
        sekcja: "Informacje podstawowe",
        pole: "Data zakończenia rekrutacji",
        wartość: termin.dataZakończeniaRekrutacjiBur || termin.dataZakonczeniaRekrutacjiBur || "",
        definicja: {
          sekcja: "Informacje podstawowe",
          etykieta: "Data zakończenia rekrutacji",
          selektory: ["#informacjepodstawowesekcja-datazakonczeniarekrutacji"]
        }
      },
      {
        sekcja: "Informacje podstawowe",
        pole: "Grupa docelowa usługi",
        wartość: pobierzSekcjęSemper(szkolenieSemper, ["grupaDocelowa", "grupaDocelowaHtml", "groupHtml"]),
        typ: "quill",
        definicja: {
          sekcja: "Informacje podstawowe",
          etykieta: "Grupa docelowa usługi",
          selektory: ["#informacjepodstawowesekcja-grupadocelowauslugi-wysiwyg .ql-editor"]
        }
      },
      {
        sekcja: "Informacje podstawowe",
        pole: "Minimalna liczba uczestników",
        wartość: minimum,
        definicja: {
          sekcja: "Informacje podstawowe",
          etykieta: "Minimalna liczba uczestników",
          selektory: ["#informacjepodstawowesekcja-minimalnaliczbauczestnikow"]
        }
      },
      {
        sekcja: "Informacje podstawowe",
        pole: "Maksymalna liczba uczestników",
        wartość: "15",
        definicja: {
          sekcja: "Informacje podstawowe",
          etykieta: "Maksymalna liczba uczestników",
          selektory: ["#informacjepodstawowesekcja-maksymalnaliczbauczestnikow"]
        }
      }
    ];

    pola.forEach(function ustaw(ustawienia) {
      ustawRaportowanePole(raport, dokument, ustawienia);
    });
  }

  function ustawPrzełącznikiGłównegoCelu(dokument, raport) {
    [
      {
        pole: "Cel edukacyjny",
        etykieta: "Cel edukacyjny",
        wartość: "TAK"
      },
      {
        pole: "Czy usługa pozwala na uzyskanie kwalifikacji włączonej do ZSK?",
        etykieta: "Czy usługa pozwala na uzyskanie kwalifikacji włączonej do ZSK",
        wartość: "NIE",
        selektory: ["#qualificationsZrk .field-glownyceluslugisekcja-czyuslugadajekwalifikacjezrk"]
      },
      {
        pole: "Czy usługa pozwala na uzyskanie kwalifikacji niewłączonych do ZSK?",
        etykieta: "Czy usługa pozwala na uzyskanie kwalifikacji niewłączonych do ZSK",
        wartość: "NIE",
        selektory: ["#qualificationsZrk .field-glownyceluslugisekcja-czyuslugadajekwalifikacjeinnenizzrk"]
      },
      {
        pole: "Czy usługa prowadzi do nabycia kompetencji?",
        etykieta: "Czy usługa prowadzi do nabycia kompetencji",
        wartość: "TAK",
        selektory: ["#qualificationsZrk .field-glownyceluslugisekcja-czyuslugaprowadzidonabyciakompetencji"]
      },
      {
        pole: "Pytanie 1 w sekcji kompetencji",
        etykieta: "Czy dokument potwierdzający uzyskanie kompetencji",
        wartość: "TAK"
      },
      {
        pole: "Pytanie 2 w sekcji kompetencji",
        etykieta: "Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają, że walidacja",
        wartość: "TAK"
      },
      {
        pole: "Pytanie 3 w sekcji kompetencji",
        etykieta: "Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają zastosowanie rozwiązań",
        wartość: "TAK"
      }
    ].forEach(function ustaw(ustawienia) {
      const ok = ustawRaportowanePole(raport, dokument, {
        sekcja: "Główny cel usługi",
        pole: ustawienia.pole,
        wartość: ustawienia.wartość,
        typ: "przełącznik",
        definicja: {
          sekcja: "Główny cel usługi",
          etykieta: ustawienia.etykieta,
          selektory: ustawienia.selektory || []
        }
      });

      if (!ok) {
        dodajOstrzeżenie(raport, "Główny cel usługi", ustawienia.pole, "Nie ustalono bezpiecznie stanu przełącznika.");
      }
    });
  }

  function wypełnijPolaTabeliEfektów(dokument, raport) {
    const tytułTabeli = "Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji";
    const pola = [
      {
        pole: "Efekty uczenia się",
        kolumna: "Efekty uczenia się",
        wartość: "-"
      },
      {
        pole: "Kryteria weryfikacji",
        kolumna: "Kryteria weryfikacji",
        wartość: "-"
      },
      {
        pole: "Wybierz metodę walidacji",
        kolumna: "Metody walidacji",
        wartość: "Wywiad swobodny",
        typ: "select2"
      }
    ];

    pola.forEach(function ustaw(ustawienia) {
      const pole = znajdźPoleWTabeli(dokument, tytułTabeli, ustawienia.kolumna);
      let ok = false;

      if (ustawienia.typ === "select2") {
        ok = ustawSelect2PoTekście(dokument, pole, ustawienia.wartość);
      } else {
        ok = ustawWartośćPola(pole, ustawienia.wartość);
      }

      if (ok) {
        dodajUzupełnione(raport, "Główny cel usługi", ustawienia.pole, ustawienia.wartość);
      } else {
        dodajPominięte(raport, "Główny cel usługi", ustawienia.pole, "Nie znaleziono pola w tabeli efektów uczenia się.");
        if (ustawienia.typ === "select2") {
          dodajOstrzeżenie(raport, "Główny cel usługi", ustawienia.pole, "Metodę walidacji może trzeba wybrać ręcznie.");
        }
      }
    });
  }

  function wypełnijGłównyCelUsługi(dokument, kontekst, raport) {
    const szkolenieSemper = kontekst.szkolenieSemper || {};

    ustawPrzełącznikiGłównegoCelu(dokument, raport);
    ustawRaportowanePole(raport, dokument, {
      sekcja: "Główny cel usługi",
      pole: "Cel edukacyjny - opis",
      wartość: pobierzSekcjęSemper(szkolenieSemper, ["celSzkolenia", "celSzkoleniaHtml", "goalHtml"]),
      definicja: {
        sekcja: "Główny cel usługi",
        selektory: ["#glownyceluslugisekcja-celedukacyjnyopis"]
      }
    });
    wypełnijPolaTabeliEfektów(dokument, raport);
  }

  function wypełnijFormularzBur(dokument, kontekst) {
    const raport = {
      ok: true,
      uzupełnione: [],
      pominięte: [],
      ostrzeżenia: [],
      błędy: []
    };

    try {
      wypełnijFormularzWstępny(dokument, kontekst || {}, raport);
      wypełnijInformacjePodstawowe(dokument, kontekst || {}, raport);
      wypełnijGłównyCelUsługi(dokument, kontekst || {}, raport);
    } catch (błąd) {
      dodajBłąd(raport, "Wypełnianie formularza", "Formularz BUR", błąd && błąd.message ? błąd.message : "Nieznany błąd wypełniania.");
    }

    raport.ok = raport.błędy.length === 0;
    return raport;
  }

  przestrzeń.wypełnijFormularzBur = wypełnijFormularzBur;
  przestrzeń.wypełnijFormularzWstępny = wypełnijFormularzWstępny;
  przestrzeń.wypełnijInformacjePodstawowe = wypełnijInformacjePodstawowe;
  przestrzeń.wypełnijGłównyCelUsługi = wypełnijGłównyCelUsługi;
  przestrzeń.ustawWartośćPola = ustawWartośćPola;
  przestrzeń.ustawWartośćQuill = ustawWartośćQuill;
  przestrzeń.ustawSelect2PoTekście = ustawSelect2PoTekście;
  przestrzeń.ustawPrzełącznikTakNie = ustawPrzełącznikTakNie;
  przestrzeń.ustawPoleJeśliIstnieje = ustawPoleJeśliIstnieje;
  przestrzeń.ustawPoleBurZWeryfikacją = ustawPoleBurZWeryfikacją;
  przestrzeń.wywołajZdarzeniaZmiany = wywołajZdarzeniaZmiany;
  przestrzeń.znajdźPrzyciskLubOpcjęSelect2PoTekście = znajdźPrzyciskLubOpcjęSelect2PoTekście;

  globalny.BurAsystent = przestrzeń;
})(globalThis);
