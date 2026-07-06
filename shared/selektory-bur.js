(function zarejestrujSelektoryBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function normalizujTekstDoWalidacji(wartość) {
    const element = typeof document !== "undefined" ? document.createElement("div") : null;
    let tekst = String(wartość || "");

    if (/<[a-z][\s\S]*>/i.test(tekst) && element) {
      element.innerHTML = tekst;
      tekst = element.textContent || "";
    }

    return tekst
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizujKluczBur(wartość) {
    return normalizujTekstDoWalidacji(wartość)
      .toLowerCase()
      .replace(/ł/g, "l")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function znajdźPolePoSelektorach(dokument, selektory) {
    const lista = Array.isArray(selektory) ? selektory : [selektory];

    for (let indeks = 0; indeks < lista.length; indeks += 1) {
      const selektor = lista[indeks];

      if (!selektor) {
        continue;
      }

      try {
        const element = dokument.querySelector(selektor);

        if (element) {
          return element;
        }
      } catch (błąd) {}
    }

    return null;
  }

  function pobierzIdBezpiecznie(id) {
    if (!id) {
      return "";
    }

    if (globalny.CSS && globalny.CSS.escape) {
      return "#" + globalny.CSS.escape(id);
    }

    return "#" + String(id).replace(/([ #;?%&,.+*~':"!^$[\]()=>|/@])/g, "\\$1");
  }

  function znajdźKontenerPola(element) {
    if (!element) {
      return null;
    }

    return element.closest(
      ".question-field, .form-group, .field, [class*='field-'], .row, tr, td, .select2-container, .ql-container, .card-body"
    ) || element.parentElement || element;
  }

  function znajdźPoleWKontenerze(kontener) {
    if (!kontener) {
      return null;
    }

    if (kontener.matches("input, textarea, select, .ql-editor, .select2-selection, [id^='select2-'][id$='-container'], [contenteditable='true']")) {
      return kontener;
    }

    return kontener.querySelector("input, textarea, select, .ql-editor, .select2-selection, [id^='select2-'][id$='-container'], [contenteditable='true']");
  }

  function znajdźPolePoEtykiecie(dokument, tekstEtykiety) {
    const szukanyKlucz = normalizujKluczBur(tekstEtykiety);
    const etykiety = Array.from(dokument.querySelectorAll("label, dt, th, span, div, p"));

    for (let indeks = 0; indeks < etykiety.length; indeks += 1) {
      const etykieta = etykiety[indeks];
      const tekst = normalizujKluczBur(etykieta.textContent || "");

      if (!tekst || tekst.length > 260 || !tekst.includes(szukanyKlucz)) {
        continue;
      }

      if (etykieta.htmlFor) {
        const polePoId = dokument.querySelector(pobierzIdBezpiecznie(etykieta.htmlFor));

        if (polePoId) {
          return polePoId;
        }
      }

      const kontener = znajdźKontenerPola(etykieta);
      const pole = znajdźPoleWKontenerze(kontener);

      if (pole && pole !== etykieta) {
        return pole;
      }

      if (kontener) {
        return kontener;
      }
    }

    return null;
  }

  function znajdźSekcjęPoNagłówku(dokument, tekstNagłówka) {
    const szukanyKlucz = normalizujKluczBur(tekstNagłówka);
    const kandydaci = Array.from(dokument.querySelectorAll("h1, h2, h3, h4, h5, h6, .card-header, legend, strong, b, span, div"));

    for (let indeks = 0; indeks < kandydaci.length; indeks += 1) {
      const element = kandydaci[indeks];
      const tekst = normalizujKluczBur(element.textContent || "");

      if (tekst && tekst.length <= 180 && tekst.includes(szukanyKlucz)) {
        return element.closest("section, fieldset, .card, .panel, .row, div") || element;
      }
    }

    return null;
  }

  function znajdźPoleBur(dokument, definicjaPola) {
    const definicja = definicjaPola || {};
    let pole = null;

    if (definicja.sekcja && definicja.etykieta) {
      const sekcja = znajdźSekcjęPoNagłówku(dokument, definicja.sekcja);

      if (sekcja) {
        pole = znajdźPolePoEtykiecie(sekcja, definicja.etykieta);
      }
    }

    if (!pole && definicja.etykieta) {
      pole = znajdźPolePoEtykiecie(dokument, definicja.etykieta);
    }

    if (!pole && definicja.selektory) {
      pole = znajdźPolePoSelektorach(dokument, definicja.selektory);
    }

    return pole;
  }

  function pobierzTekstSelect2(elementLubKontener) {
    if (!elementLubKontener) {
      return "";
    }

    const element = elementLubKontener.matches && elementLubKontener.matches("[id^='select2-'][id$='-container'], .select2-selection__rendered, .select2-selection")
      ? elementLubKontener
      : elementLubKontener.querySelector("[id^='select2-'][id$='-container'], .select2-selection__rendered, .select2-selection");

    return normalizujTekstDoWalidacji(element ? (element.getAttribute("title") || element.textContent || "") : "");
  }

  function pobierzWartośćQuill(elementLubKontener) {
    if (!elementLubKontener) {
      return "";
    }

    const element = elementLubKontener.matches && elementLubKontener.matches(".ql-editor")
      ? elementLubKontener
      : elementLubKontener.querySelector(".ql-editor");

    return normalizujTekstDoWalidacji(element ? element.textContent || "" : "");
  }

  function pobierzStanPrzełącznika(elementLubKontener) {
    if (!elementLubKontener) {
      return "";
    }

    const kontener = znajdźKontenerPola(elementLubKontener) || elementLubKontener;
    const zaznaczonyInput = kontener.querySelector("input[type='radio']:checked, input[type='checkbox']:checked");

    if (zaznaczonyInput) {
      const wartość = normalizujKluczBur(zaznaczonyInput.value || zaznaczonyInput.getAttribute("aria-label") || "");

      if (wartość.includes("tak") || wartość === "true" || wartość === "1") {
        return "TAK";
      }

      if (wartość.includes("nie") || wartość === "false" || wartość === "0") {
        return "NIE";
      }
    }

    const aktywne = Array.from(kontener.querySelectorAll("[aria-pressed='true'], [aria-checked='true'], .active, .checked, .selected, .is-active"));
    const aktywnyTekst = aktywne.map(function pobierzTekst(element) {
      return normalizujKluczBur(element.textContent || element.value || element.getAttribute("aria-label") || "");
    }).join(" ");

    if (/\btak\b/.test(aktywnyTekst)) {
      return "TAK";
    }

    if (/\bnie\b/.test(aktywnyTekst)) {
      return "NIE";
    }

    const tekstKontenera = normalizujKluczBur(kontener.textContent || "");

    if (/^\s*tak\s*$/.test(tekstKontenera)) {
      return "TAK";
    }

    if (/^\s*nie\s*$/.test(tekstKontenera)) {
      return "NIE";
    }

    const checkbox = kontener.querySelector("input[type='checkbox']");

    if (checkbox) {
      return checkbox.checked ? "TAK" : "NIE";
    }

    return "";
  }

  function pobierzWartośćPola(element) {
    if (!element) {
      return "";
    }

    const tekstSelect2 = pobierzTekstSelect2(element);

    if (tekstSelect2) {
      return tekstSelect2;
    }

    const tekstQuill = pobierzWartośćQuill(element);

    if (tekstQuill) {
      return tekstQuill;
    }

    if (element.matches && element.matches("input[type='checkbox'], input[type='radio']")) {
      return element.checked ? "TAK" : "NIE";
    }

    if (element.tagName === "SELECT") {
      return normalizujTekstDoWalidacji(element.selectedOptions && element.selectedOptions[0] ? element.selectedOptions[0].textContent : element.value);
    }

    if ("value" in element) {
      return normalizujTekstDoWalidacji(element.value);
    }

    return normalizujTekstDoWalidacji(element.textContent || "");
  }

  przestrzeń.znajdźPoleBur = znajdźPoleBur;
  przestrzeń.znajdźPolePoSelektorach = znajdźPolePoSelektorach;
  przestrzeń.znajdźPolePoEtykiecie = znajdźPolePoEtykiecie;
  przestrzeń.znajdźSekcjęPoNagłówku = znajdźSekcjęPoNagłówku;
  przestrzeń.znajdźKontenerPola = znajdźKontenerPola;
  przestrzeń.pobierzWartośćPola = pobierzWartośćPola;
  przestrzeń.pobierzTekstSelect2 = pobierzTekstSelect2;
  przestrzeń.pobierzWartośćQuill = pobierzWartośćQuill;
  przestrzeń.pobierzStanPrzełącznika = pobierzStanPrzełącznika;
  przestrzeń.normalizujTekstDoWalidacji = normalizujTekstDoWalidacji;

  globalny.BurAsystent = przestrzeń;
})(globalThis);
