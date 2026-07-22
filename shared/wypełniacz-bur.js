(function zarejestrujWypełniaczBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  let ostatnieOstrzeżenieSelect2 = "";
  const AKTUALNA_PODSTAWA_WPISU_BUR = przestrzeń.AKTUALNA_PODSTAWA_WPISU_BUR;
  const NIEAKTUALNA_PODSTAWA_WPISU_BUR = przestrzeń.NIEAKTUALNA_PODSTAWA_WPISU_BUR;

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

    const okno = element.ownerDocument && element.ownerDocument.defaultView || globalny;
    const KonstruktorZdarzenia = okno.Event || Event;
    ["input", "change", "blur"].forEach(function wywołaj(typ) {
      element.dispatchEvent(new KonstruktorZdarzenia(typ, { bubbles: true }));
    });
  }

  function ustawNatywnąWartość(element, wartość) {
    const okno = element.ownerDocument && element.ownerDocument.defaultView || globalny;
    const prototyp = element.tagName === "TEXTAREA"
      ? okno.HTMLTextAreaElement && okno.HTMLTextAreaElement.prototype
      : element.tagName === "INPUT"
        ? okno.HTMLInputElement && okno.HTMLInputElement.prototype
        : element.tagName === "SELECT"
          ? okno.HTMLSelectElement && okno.HTMLSelectElement.prototype
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

  function normalizujDatęBur(wartość) {
    const dopasowanie = String(wartość || "").trim().match(/^(?:(\d{4})-(\d{2})-(\d{2})|(\d{1,2})[.-](\d{1,2})[.-](\d{4}))$/);
    if (!dopasowanie) { return ""; }
    const rok = Number(dopasowanie[1] || dopasowanie[6]);
    const miesiąc = Number(dopasowanie[2] || dopasowanie[5]);
    const dzień = Number(dopasowanie[3] || dopasowanie[4]);
    const data = new Date(rok, miesiąc - 1, dzień);
    if (data.getFullYear() !== rok || data.getMonth() !== miesiąc - 1 || data.getDate() !== dzień) { return ""; }
    return String(rok).padStart(4, "0") + "-" + String(miesiąc).padStart(2, "0") + "-" + String(dzień).padStart(2, "0");
  }

  function znajdźTechnicznyInputDaty(element) {
    if (!element) { return null; }
    if (element.matches && element.matches("input, textarea")) { return element; }
    const kandydaci = Array.from(element.querySelectorAll ? element.querySelectorAll("input, textarea") : []);
    return kandydaci.find(function widoczny(input) { return input.type !== "hidden"; }) || kandydaci[0] || null;
  }

  function ustalFormatKontrolkiDaty(element) {
    const input = znajdźTechnicznyInputDaty(element);
    if (!input) { return ""; }
    if (String(input.type || "").toLowerCase() === "date") { return "yyyy-mm-dd"; }
    const wskazówka = [input.inputMode, input.placeholder, input.value].join(" ");
    return /yyyy\s*[-./]\s*mm|\d{4}-\d{2}-\d{2}/i.test(wskazówka) ? "yyyy-mm-dd" : "dd-mm-yyyy";
  }

  function formatujDatęDlaKontrolki(kanonicznaData, format) {
    if (format === "yyyy-mm-dd") { return kanonicznaData; }
    const części = kanonicznaData.split("-");
    return części.length === 3 ? części[2] + "-" + części[1] + "-" + części[0] : "";
  }

  function pobierzWartośćTechnicznąDaty(element) {
    const input = znajdźTechnicznyInputDaty(element);
    return input && "value" in input ? String(input.value || "") : "";
  }

  function ustawDatęTechniczną(element, wartość) {
    const input = znajdźTechnicznyInputDaty(element);
    const oczekiwana = normalizujDatęBur(wartość);
    const format = ustalFormatKontrolkiDaty(element);
    const wynik = { input: input, wartośćOczekiwana: oczekiwana, formatKontrolki: format, formatZapisu: format, kodBłędu: "", komunikat: "" };
    if (!oczekiwana) { wynik.kodBłędu = "NIEPRAWIDLOWA_DATA_ZRODLOWA"; wynik.komunikat = "Oczekiwana data nie ma obsługiwanego formatu."; return wynik; }
    if (!input) { wynik.kodBłędu = "BRAK_ELEMENTU"; wynik.komunikat = "Nie znaleziono technicznego inputa daty BUR."; return wynik; }
    if (input.disabled || input.readOnly) { wynik.kodBłędu = "POLE_DATY_NIEDOSTEPNE"; wynik.komunikat = "Techniczny input daty BUR jest niedostępny."; return wynik; }
    ustawNatywnąWartość(input, formatujDatęDlaKontrolki(oczekiwana, format));
    wywołajZdarzeniaZmiany(input);
    if (input.blur) { input.blur(); }
    return wynik;
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

  function pobierzTekstWybranejOpcji(natywnePole) {
    const opcja = natywnePole && natywnePole.selectedOptions && natywnePole.selectedOptions[0];
    return przestrzeń.normalizujTekstDoWalidacji
      ? przestrzeń.normalizujTekstDoWalidacji(opcja ? opcja.textContent || opcja.label || "" : "")
      : String(opcja ? opcja.textContent || opcja.label || "" : "").trim();
  }

  function ustawSelect2PoDokładnymTekście(dokument, definicjaPola, oczekiwanyTekst) {
    const definicja = definicjaPola || {};
    const natywnePole = przestrzeń.znajdźNatywnePoleWyboruBur
      ? przestrzeń.znajdźNatywnePoleWyboruBur(dokument, definicja)
      : null;
    const wynik = {
      ok: false,
      status: "błąd",
      natywnePole: natywnePole,
      elementWidoczny: null,
      wartośćPrzed: "",
      wartośćPo: "",
      wartośćOczekiwana: oczekiwanyTekst,
      kodBłędu: "",
      komunikat: ""
    };

    if (!natywnePole) {
      wynik.kodBłędu = "BRAK_NATYWNEGO_SELECTA";
      wynik.komunikat = "Nie znaleziono natywnego pola select będącego źródłem danych Select2.";
      return wynik;
    }

    wynik.elementWidoczny = przestrzeń.znajdźWidocznyElementSelect2
      ? przestrzeń.znajdźWidocznyElementSelect2(natywnePole)
      : null;
    wynik.wartośćPrzed = pobierzTekstWybranejOpcji(natywnePole);
    const normalizuj = przestrzeń.normalizujTekstDoWalidacji || function bezNormalizacji(wartość) { return String(wartość || "").trim(); };
    const tekstOczekiwany = normalizuj(oczekiwanyTekst);
    const opcja = Array.from(natywnePole.options || []).find(function znajdźDokładnąOpcję(opcjaPola) {
      return normalizuj(opcjaPola.textContent || opcjaPola.label || "") === tekstOczekiwany;
    });

    if (!opcja) {
      wynik.kodBłędu = "BRAK_OCZEKIWANEJ_OPCJI";
      wynik.komunikat = "Na liście BUR nie ma oczekiwanej aktualnej opcji: " + oczekiwanyTekst + ".";
      return wynik;
    }

    if (wynik.wartośćPrzed === tekstOczekiwany && natywnePole.value === opcja.value) {
      wynik.ok = true;
      wynik.status = "już_zgodne";
      wynik.wartośćPo = wynik.wartośćPrzed;
      return wynik;
    }

    ustawNatywnąWartość(natywnePole, opcja.value);
    wywołajZdarzeniaZmiany(natywnePole);
    if (globalny.jQuery) {
      globalny.jQuery(natywnePole).trigger("change");
    }

    wynik.wartośćPo = pobierzTekstWybranejOpcji(natywnePole);
    if (natywnePole.value !== opcja.value || wynik.wartośćPo !== tekstOczekiwany) {
      wynik.kodBłędu = "NIEPOTWIERDZONA_WARTOŚĆ_NATYWNA";
      wynik.komunikat = "Natywne pole select nie zachowało oczekiwanej wartości po zmianie.";
      return wynik;
    }

    if (wynik.elementWidoczny && przestrzeń.pobierzTekstSelect2(wynik.elementWidoczny) !== tekstOczekiwany) {
      wynik.kodBłędu = "BRAK_SYNCHRONIZACJI_SELECT2";
      wynik.komunikat = "Natywny select został zmieniony, ale Select2 nie potwierdził tej samej wartości.";
      return wynik;
    }

    wynik.ok = true;
    wynik.status = "potwierdzone";
    return wynik;
  }

  function skorygujPodstawęWpisuBur(dokument) {
    const definicja = przestrzeń.pobierzDefinicjęPodstawyWpisuBur();
    const natywnePole = przestrzeń.znajdźNatywnePoleWyboruBur
      ? przestrzeń.znajdźNatywnePoleWyboruBur(dokument, definicja)
      : null;

    if (!natywnePole) {
      return ustawSelect2PoDokładnymTekście(dokument, definicja, AKTUALNA_PODSTAWA_WPISU_BUR);
    }

    const aktualnaWartość = pobierzTekstWybranejOpcji(natywnePole);
    const maAktualnąOpcję = Array.from(natywnePole.options || []).some(function sprawdźOpcję(opcja) {
      return (przestrzeń.normalizujTekstDoWalidacji(opcja.textContent || opcja.label || "")) === AKTUALNA_PODSTAWA_WPISU_BUR;
    });

    if (!maAktualnąOpcję) {
      return ustawSelect2PoDokładnymTekście(dokument, definicja, AKTUALNA_PODSTAWA_WPISU_BUR);
    }

    if (aktualnaWartość === AKTUALNA_PODSTAWA_WPISU_BUR) {
      return {
        ok: true,
        status: "już_zgodne",
        natywnePole: natywnePole,
        elementWidoczny: przestrzeń.znajdźWidocznyElementSelect2(natywnePole),
        wartośćPrzed: aktualnaWartość,
        wartośćPo: aktualnaWartość,
        wartośćOczekiwana: AKTUALNA_PODSTAWA_WPISU_BUR,
        kodBłędu: "",
        komunikat: ""
      };
    }

    if (aktualnaWartość !== NIEAKTUALNA_PODSTAWA_WPISU_BUR) {
      return {
        ok: true,
        status: "nie_dotyczy",
        natywnePole: natywnePole,
        elementWidoczny: przestrzeń.znajdźWidocznyElementSelect2(natywnePole),
        wartośćPrzed: aktualnaWartość,
        wartośćPo: aktualnaWartość,
        wartośćOczekiwana: AKTUALNA_PODSTAWA_WPISU_BUR,
        kodBłędu: "",
        komunikat: ""
      };
    }

    return ustawSelect2PoDokładnymTekście(dokument, definicja, AKTUALNA_PODSTAWA_WPISU_BUR);
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

    if (definicja.typ === "data") {
      return !ustawDatęTechniczną(pole, wartość).kodBłędu;
    }

    return ustawWartośćPola(pole, wartość);
  }

  function pobierzWartośćTechniczną(element, typ) {
    if (typ === "data") { return pobierzWartośćTechnicznąDaty(element); }
    if (typ === "quill") {
      const edytor = element.matches && element.matches(".ql-editor") ? element : element.querySelector(".ql-editor");
      return edytor ? edytor.innerHTML : "";
    }
    if (typ === "select2") {
      return przestrzeń.pobierzWartośćPola
        ? przestrzeń.pobierzWartośćPola(element)
        : "";
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
    const wynik = { ok: false, status: "błąd", sekcja: ustawienia.sekcja || definicja.sekcja || "", pole: ustawienia.pole || definicja.etykieta || "", typPola: typPola, wartośćPrzed: "", wartośćOczekiwana: String(ustawienia.wartość || ""), wartośćPo: "", wartośćTechnicznaPo: "", formatKontrolki: "", formatZapisu: "", metodaZnalezienia: znalezione.metodaZnalezienia, selektor: znalezione.selektor, kodBłędu: "", komunikat: "" };
    const element = znalezione.element;
    if (!element) { wynik.kodBłędu = znalezione.kodBłędu || "BRAK_ELEMENTU"; wynik.komunikat = wynik.kodBłędu === "NIEJEDNOZNACZNY_SELEKTOR" ? "Selektor wskazuje więcej niż jedno pole BUR." : "Nie znaleziono pola BUR."; return wynik; }
    if (typPola === "data") {
      const oczekiwanaData = normalizujDatęBur(wynik.wartośćOczekiwana);
      if (!oczekiwanaData) { wynik.kodBłędu = "NIEPRAWIDLOWA_DATA_ZRODLOWA"; wynik.komunikat = "Oczekiwana data nie ma obsługiwanego formatu."; return wynik; }
      wynik.wartośćOczekiwana = oczekiwanaData;
      wynik.wartośćPrzed = pobierzWartośćTechnicznąDaty(element);
      wynik.formatKontrolki = ustalFormatKontrolkiDaty(element);
      if (normalizujDatęBur(wynik.wartośćPrzed) === oczekiwanaData) { wynik.ok = true; wynik.status = "już_zgodne"; wynik.wartośćPo = wynik.wartośćPrzed; wynik.wartośćTechnicznaPo = wynik.wartośćPrzed; return wynik; }
      if (wynik.wartośćPrzed && !ustawienia.zezwólNaNadpisanie) { wynik.kodBłędu = "KONFLIKT_WARTOŚCI"; wynik.komunikat = "Pole zawiera inną wartość i wymaga decyzji użytkownika."; return wynik; }
      const zapis = ustawDatęTechniczną(element, oczekiwanaData);
      wynik.formatKontrolki = zapis.formatKontrolki;
      wynik.formatZapisu = zapis.formatZapisu;
      if (zapis.kodBłędu) { wynik.kodBłędu = zapis.kodBłędu; wynik.komunikat = zapis.komunikat; return wynik; }
      const potwierdzono = await poczekajNaReakcję(zapis.input, function zgodneDaty() { return normalizujDatęBur(pobierzWartośćTechnicznąDaty(element)) === oczekiwanaData; });
      wynik.wartośćPo = pobierzWartośćTechnicznąDaty(element);
      wynik.wartośćTechnicznaPo = wynik.wartośćPo;
      if (potwierdzono) { wynik.ok = true; wynik.status = "potwierdzone"; return wynik; }
      wynik.kodBłędu = wynik.wartośćPo ? "ODRZUCONA_WARTOŚĆ_DATY" : "TIMEOUT";
      wynik.komunikat = "BUR nie potwierdził oczekiwanej daty po zapisie.";
      return wynik;
    }
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
    if (typeof przestrzeń.znajdźPoleWTabeliBur === "function") {
      return przestrzeń.znajdźPoleWTabeliBur(dokument, tytułTabeli, nazwaKolumny);
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
      const korektaPodstawyWpisu = skorygujPodstawęWpisuBur(dokument);
      if (korektaPodstawyWpisu.status === "potwierdzone") {
        dodajUzupełnione(raport, "Formularz wstępny", "Podstawa uzyskania wpisu do BUR", AKTUALNA_PODSTAWA_WPISU_BUR);
      } else if (!korektaPodstawyWpisu.ok) {
        dodajPominięte(raport, "Formularz wstępny", "Podstawa uzyskania wpisu do BUR", korektaPodstawyWpisu.komunikat);
        dodajOstrzeżenie(raport, "Formularz wstępny", "Podstawa uzyskania wpisu do BUR", korektaPodstawyWpisu.komunikat);
      }

      const definicje = przestrzeń.pobierzDefinicjePólWypełnieniaBur(kontekst || {});
      definicje.forEach(function wypełnij(definicja) {
        if (definicja.id === "podstawa-wpisu" && korektaPodstawyWpisu.status !== "nie_dotyczy") {
          return;
        }
        let pole = null;
        if (definicja.sposóbLokalizacji === "tabela") {
          pole = znajdźPoleWTabeli(dokument, definicja.definicjaPola.tabela, definicja.definicjaPola.kolumna);
        }
        const ustawienia = { sekcja: definicja.sekcja, pole: definicja.pole, wartość: definicja.wartośćProponowana, typ: definicja.typPola === "tekst" || definicja.typPola === "liczba" || definicja.typPola === "pole_tabeli" ? "" : definicja.typPola, definicja: definicja.definicjaPola };
        const ok = pole ? (ustawienia.typ === "select2" ? ustawSelect2PoTekście(dokument, pole, ustawienia.wartość) : ustawWartośćPola(pole, ustawienia.wartość)) : ustawRaportowanePole(raport, dokument, ustawienia);
        if (pole) { if (ok) { dodajUzupełnione(raport, definicja.sekcja, definicja.pole, definicja.wartośćProponowana); } else { dodajPominięte(raport, definicja.sekcja, definicja.pole, "Nie udało się ustawić pola tabeli."); } }
      });
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
  przestrzeń.ustawSelect2PoDokładnymTekście = ustawSelect2PoDokładnymTekście;
  przestrzeń.skorygujPodstawęWpisuBur = skorygujPodstawęWpisuBur;
  przestrzeń.ustawPrzełącznikTakNie = ustawPrzełącznikTakNie;
  przestrzeń.ustawPoleJeśliIstnieje = ustawPoleJeśliIstnieje;
  przestrzeń.ustawPoleBurZWeryfikacją = ustawPoleBurZWeryfikacją;
  przestrzeń.wywołajZdarzeniaZmiany = wywołajZdarzeniaZmiany;
  przestrzeń.znajdźPrzyciskLubOpcjęSelect2PoTekście = znajdźPrzyciskLubOpcjęSelect2PoTekście;
  przestrzeń.normalizujDatęBur = normalizujDatęBur;
  przestrzeń.znajdźTechnicznyInputDaty = znajdźTechnicznyInputDaty;
  przestrzeń.ustawDatęTechniczną = ustawDatęTechniczną;

  globalny.BurAsystent = przestrzeń;
})(globalThis);
