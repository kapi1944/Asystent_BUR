(function zarejestrujAdapterSelect2(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function wynikBłędu(kodBłędu, komunikat, dane) {
    return Object.assign({}, dane || {}, {
      ok: false,
      status: "błąd",
      natywnePole: dane && dane.natywnePole || null,
      elementWidoczny: dane && dane.elementWidoczny || null,
      wartośćPrzed: dane && dane.wartośćPrzed || "",
      wartośćPo: dane && dane.wartośćPo || "",
      wartośćOczekiwana: dane && dane.wartośćOczekiwana || "",
      kodBłędu: kodBłędu,
      komunikat: komunikat
    });
  }

  function normalizuj(wartość) {
    const funkcja = przestrzeń.normalizujTekstDoWalidacji || function bezNormalizacji(tekst) { return String(tekst || "").trim(); };
    return funkcja(wartość);
  }

  function znajdźWidocznyElement(natywnePole) {
    if (!natywnePole || !natywnePole.ownerDocument || !natywnePole.id) {
      return null;
    }
    return natywnePole.ownerDocument.getElementById("select2-" + natywnePole.id + "-container");
  }

  function zbierzSelectyZElementu(element) {
    if (!element) {
      return [];
    }
    if (element.matches && element.matches("select")) {
      return [element];
    }

    const dokument = element.ownerDocument || globalny.document;
    const dopasowanieId = String(element.id || "").match(/^select2-(.+)-container$/);
    if (dopasowanieId) {
      const polePoId = dokument && dokument.getElementById(dopasowanieId[1]);
      if (polePoId && polePoId.matches("select")) {
        return [polePoId];
      }
    }

    const własne = Array.from(element.querySelectorAll ? element.querySelectorAll("select") : []);
    if (własne.length) {
      return własne;
    }
    const kontener = element.closest && element.closest(".form-group, .question-field, .field, [class*='field-']");
    return Array.from(kontener && kontener.querySelectorAll ? kontener.querySelectorAll("select") : []);
  }

  function znajdźNatywnePole(dokument, definicjaLubElement) {
    if (!dokument || !definicjaLubElement) {
      return wynikBłędu("BRAK_NATYWNEGO_SELECTA", "Nie znaleziono natywnego pola select będącego źródłem danych Select2.");
    }

    if (definicjaLubElement.nodeType === 1) {
      const bezpośrednie = Array.from(new Set(zbierzSelectyZElementu(definicjaLubElement)));
      if (bezpośrednie.length > 1) {
        return wynikBłędu("WIELE_NATYWNYCH_SELECTOW", "Kontekst Select2 wskazuje więcej niż jedno natywne pole select.");
      }
      return bezpośrednie.length === 1
        ? { ok: true, status: "znalezione", natywnePole: bezpośrednie[0], elementWidoczny: znajdźWidocznyElement(bezpośrednie[0]), kodBłędu: "", komunikat: "" }
        : wynikBłędu("BRAK_NATYWNEGO_SELECTA", "Nie znaleziono natywnego pola select będącego źródłem danych Select2.");
    }

    const definicja = definicjaLubElement || {};
    const selektoryNatywne = definicja.selektoryNatywne || [];
    for (let indeks = 0; indeks < selektoryNatywne.length; indeks += 1) {
      const wynikSelektora = przestrzeń.resolverPólBur.rozwiążPoSelektorach(dokument, [selektoryNatywne[indeks]]);
      if (wynikSelektora.kodBłędu === "NIEJEDNOZNACZNY_SELEKTOR") {
        return wynikBłędu("WIELE_NATYWNYCH_SELECTOW", "Selektor natywny wskazuje więcej niż jedno pole select.");
      }
      if (wynikSelektora.element) {
        const selecty = Array.from(new Set(zbierzSelectyZElementu(wynikSelektora.element)));
        if (selecty.length !== 1) {
          return wynikBłędu(selecty.length ? "WIELE_NATYWNYCH_SELECTOW" : "BRAK_NATYWNEGO_SELECTA", selecty.length ? "Selektor natywny wskazuje więcej niż jedno pole select." : "Selektor natywny nie wskazuje pola select.");
        }
        return { ok: true, status: "znalezione", natywnePole: selecty[0], elementWidoczny: znajdźWidocznyElement(selecty[0]), kodBłędu: "", komunikat: "" };
      }
    }

    const znalezione = przestrzeń.resolverPólBur.rozwiąż(dokument, definicja);
    if (!znalezione.element) {
      const niejednoznaczne = /^NIEJEDNOZNACZ/.test(znalezione.kodBłędu || "");
      return wynikBłędu(niejednoznaczne ? "WIELE_NATYWNYCH_SELECTOW" : "BRAK_NATYWNEGO_SELECTA", niejednoznaczne ? "Definicja pola wskazuje więcej niż jeden możliwy select." : "Nie znaleziono natywnego pola select będącego źródłem danych Select2.");
    }
    const selecty = Array.from(new Set(zbierzSelectyZElementu(znalezione.element)));
    if (selecty.length !== 1) {
      return wynikBłędu(selecty.length ? "WIELE_NATYWNYCH_SELECTOW" : "BRAK_NATYWNEGO_SELECTA", selecty.length ? "Definicja pola wskazuje więcej niż jeden możliwy select." : "Nie znaleziono natywnego pola select będącego źródłem danych Select2.");
    }
    return { ok: true, status: "znalezione", natywnePole: selecty[0], elementWidoczny: znajdźWidocznyElement(selecty[0]), kodBłędu: "", komunikat: "" };
  }

  function znajdźDokładneOpcje(natywnePole, oczekiwanyTekst) {
    const oczekiwany = normalizuj(oczekiwanyTekst);
    return Array.from(natywnePole && natywnePole.options || []).filter(function pasuje(opcja) {
      return normalizuj(opcja.textContent || opcja.label || "") === oczekiwany;
    });
  }

  function odczytaj(dokument, definicjaLubElement) {
    const lokalizacja = znajdźNatywnePole(dokument, definicjaLubElement);
    if (!lokalizacja.ok) {
      return lokalizacja;
    }
    const natywnePole = lokalizacja.natywnePole;
    const opcje = Array.from(natywnePole.selectedOptions || []).filter(Boolean);
    if (opcje.length !== 1) {
      return wynikBłędu("NIEJEDNOZNACZNY_ODCZYT_SELECTA", "Natywny select nie ma dokładnie jednej wybranej opcji.", lokalizacja);
    }
    return Object.assign({}, lokalizacja, {
      ok: true,
      status: "odczytane",
      wartość: natywnePole.value,
      tekst: normalizuj(opcje[0].textContent || opcje[0].label || "")
    });
  }

  function wyemitujZmianęSelect2(natywnePole) {
    const pisarz = przestrzeń.pisarzPólBur;
    const czySelect2 = Boolean(
      natywnePole.classList && natywnePole.classList.contains("select2-hidden-accessible")
      || natywnePole.getAttribute && natywnePole.getAttribute("data-select2-id")
    );

    if (czySelect2 && typeof globalny.jQuery === "function") {
      pisarz.wyemitujZdarzenia(natywnePole, ["input"]);
      globalny.jQuery(natywnePole).trigger("change");
      pisarz.wyemitujZdarzenia(natywnePole, ["blur"]);
      return;
    }
    pisarz.wyemitujZdarzenia(natywnePole);
  }

  function ustawDokładnie(dokument, definicjaLubElement, oczekiwanyTekst) {
    const lokalizacja = znajdźNatywnePole(dokument, definicjaLubElement);
    if (!lokalizacja.ok) {
      return Object.assign(lokalizacja, { wartośćOczekiwana: oczekiwanyTekst });
    }
    const natywnePole = lokalizacja.natywnePole;
    const odczytPrzed = odczytaj(dokument, natywnePole);
    const pasująceOpcje = znajdźDokładneOpcje(natywnePole, oczekiwanyTekst);
    const dane = Object.assign({}, lokalizacja, {
      wartośćPrzed: odczytPrzed.ok ? odczytPrzed.tekst : "",
      wartośćPo: "",
      wartośćOczekiwana: oczekiwanyTekst
    });

    if (natywnePole.disabled) {
      return wynikBłędu("POLE_SELECT_NIEDOSTEPNE", "Natywne pole select jest niedostępne.", dane);
    }
    if (!pasująceOpcje.length) {
      return wynikBłędu("BRAK_OCZEKIWANEJ_OPCJI", "Na liście BUR nie ma oczekiwanej opcji: " + oczekiwanyTekst + ".", dane);
    }
    if (pasująceOpcje.length > 1) {
      return wynikBłędu("NIEJEDNOZNACZNA_OPCJA", "Na liście BUR znajduje się więcej niż jedna opcja o oczekiwanym tekście.", dane);
    }

    const opcja = pasująceOpcje[0];
    if (natywnePole.value === opcja.value && odczytPrzed.ok && odczytPrzed.tekst === normalizuj(oczekiwanyTekst)) {
      return Object.assign(dane, { ok: true, status: "już_zgodne", wartośćPo: odczytPrzed.tekst, kodBłędu: "", komunikat: "" });
    }

    przestrzeń.pisarzPólBur.ustawWartośćNatywną(natywnePole, opcja.value);
    wyemitujZmianęSelect2(natywnePole);
    return Object.assign(dane, { ok: true, status: "ustawione", kodBłędu: "", komunikat: "" });
  }

  function zweryfikujDokładnie(dokument, definicjaLubElement, oczekiwanyTekst) {
    const lokalizacja = znajdźNatywnePole(dokument, definicjaLubElement);
    if (!lokalizacja.ok) {
      return Object.assign(lokalizacja, { wartośćOczekiwana: oczekiwanyTekst });
    }
    const natywnePole = lokalizacja.natywnePole;
    const pasująceOpcje = znajdźDokładneOpcje(natywnePole, oczekiwanyTekst);
    if (!pasująceOpcje.length) {
      return wynikBłędu("BRAK_OCZEKIWANEJ_OPCJI", "Na liście BUR nie ma oczekiwanej opcji: " + oczekiwanyTekst + ".", Object.assign({}, lokalizacja, { wartośćOczekiwana: oczekiwanyTekst }));
    }
    if (pasująceOpcje.length > 1) {
      return wynikBłędu("NIEJEDNOZNACZNA_OPCJA", "Na liście BUR znajduje się więcej niż jedna opcja o oczekiwanym tekście.", Object.assign({}, lokalizacja, { wartośćOczekiwana: oczekiwanyTekst }));
    }

    const odczyt = odczytaj(dokument, natywnePole);
    const zgodne = odczyt.ok
      && natywnePole.value === pasująceOpcje[0].value
      && odczyt.tekst === normalizuj(oczekiwanyTekst);
    if (!zgodne) {
      return wynikBłędu("NIEPOTWIERDZONA_WARTOŚĆ_NATYWNA", "Natywne pole select nie potwierdziło oczekiwanej wartości po zmianie.", Object.assign({}, lokalizacja, {
        wartośćOczekiwana: oczekiwanyTekst,
        wartośćPo: odczyt.ok ? odczyt.tekst : ""
      }));
    }
    return Object.assign({}, lokalizacja, {
      ok: true,
      status: "potwierdzone",
      wartośćOczekiwana: oczekiwanyTekst,
      wartośćPo: odczyt.tekst,
      kodBłędu: "",
      komunikat: ""
    });
  }

  function ustawDokładnieIZweryfikuj(dokument, definicjaLubElement, oczekiwanyTekst) {
    const ustawienie = ustawDokładnie(dokument, definicjaLubElement, oczekiwanyTekst);
    if (!ustawienie.ok) {
      return ustawienie;
    }
    if (ustawienie.status === "już_zgodne") {
      return ustawienie;
    }
    const weryfikacja = zweryfikujDokładnie(dokument, definicjaLubElement, oczekiwanyTekst);
    return Object.assign({}, ustawienie, weryfikacja, { wartośćPrzed: ustawienie.wartośćPrzed });
  }

  function odczytajTekstWidoczny(elementLubKontener) {
    if (!elementLubKontener) {
      return "";
    }
    if (elementLubKontener.tagName === "SELECT") {
      const opcja = elementLubKontener.selectedOptions && elementLubKontener.selectedOptions[0];
      return normalizuj(opcja ? opcja.textContent || opcja.label || "" : "");
    }
    const element = elementLubKontener.matches && elementLubKontener.matches("[id^='select2-'][id$='-container'], .select2-selection__rendered, .select2-selection")
      ? elementLubKontener
      : elementLubKontener.querySelector && elementLubKontener.querySelector("[id^='select2-'][id$='-container'], .select2-selection__rendered, .select2-selection");
    if (element) {
      return normalizuj(element.getAttribute("title") || element.textContent || "");
    }
    const widoczny = znajdźWidocznyElement(elementLubKontener);
    return widoczny ? normalizuj(widoczny.getAttribute("title") || widoczny.textContent || "") : "";
  }

  function znajdźOpcjęWidocznąPoTekście(tekst) {
    const dokument = globalny.document;
    const klucz = przestrzeń.normalizujKluczBur ? przestrzeń.normalizujKluczBur(tekst) : normalizuj(tekst).toLowerCase();
    const kandydaci = Array.from(dokument ? dokument.querySelectorAll(".select2-results__option, li, button, [role='option']") : []);
    const pasujące = kandydaci.filter(function pasuje(element) {
      const tekstElementu = przestrzeń.normalizujKluczBur ? przestrzeń.normalizujKluczBur(element.textContent || element.getAttribute("aria-label") || "") : normalizuj(element.textContent || "").toLowerCase();
      return tekstElementu === klucz;
    });
    return pasujące.length === 1 ? pasujące[0] : null;
  }

  const adapter = {
    read: odczytaj,
    setExact: ustawDokładnie,
    verifyExact: zweryfikujDokładnie,
    setExactAndVerify: ustawDokładnieIZweryfikuj,
    znajdźNatywnePole: znajdźNatywnePole,
    znajdźWidocznyElement: znajdźWidocznyElement,
    odczytajTekstWidoczny: odczytajTekstWidoczny,
    znajdźOpcjęWidocznąPoTekście: znajdźOpcjęWidocznąPoTekście
  };

  przestrzeń.adapterSelect2 = adapter;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
