(function zarejestrujFasadęSelektorówBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function pobierzTekstSelect2(elementLubKontener) {
    return przestrzeń.adapterSelect2.odczytajTekstWidoczny(elementLubKontener);
  }

  function znajdźNatywnePoleWyboruBur(dokument, definicjaPola) {
    const wynik = przestrzeń.adapterSelect2.znajdźNatywnePole(dokument, definicjaPola);
    return wynik.ok ? wynik.natywnePole : null;
  }

  function znajdźWidocznyElementSelect2(natywnePole) {
    return przestrzeń.adapterSelect2.znajdźWidocznyElement(natywnePole);
  }

  function pobierzWartośćQuill(elementLubKontener) {
    if (!elementLubKontener) {
      return "";
    }
    const element = elementLubKontener.matches && elementLubKontener.matches(".ql-editor")
      ? elementLubKontener
      : elementLubKontener.querySelector && elementLubKontener.querySelector(".ql-editor");
    return przestrzeń.normalizujTekstDoWalidacji(element ? element.textContent || "" : "");
  }

  function pobierzKontrolkiPrzełącznika(elementLubKontener) {
    if (!elementLubKontener) {
      return [];
    }
    if (elementLubKontener.matches && elementLubKontener.matches("input[type='checkbox'], input[type='radio']")) {
      return [elementLubKontener];
    }
    const inputy = Array.from(elementLubKontener.querySelectorAll
      ? elementLubKontener.querySelectorAll("input[type='checkbox'], input[type='radio']")
      : []);
    if (inputy.length) {
      return inputy;
    }
    const kontrolkiAria = [];
    if (elementLubKontener.matches && elementLubKontener.matches("[role='switch'], [aria-checked]")) {
      kontrolkiAria.push(elementLubKontener);
    }
    if (elementLubKontener.querySelectorAll) {
      kontrolkiAria.push.apply(kontrolkiAria, Array.from(elementLubKontener.querySelectorAll("[role='switch'], [aria-checked]")));
    }
    return Array.from(new Set(kontrolkiAria));
  }

  function pobierzStanPrzełącznikaZSzczegółami(elementLubKontener) {
    if (!elementLubKontener) {
      return { stan: "", źródło: "" };
    }
    if (elementLubKontener.matches && elementLubKontener.matches("input[type='checkbox'], input[type='radio']")) {
      return { stan: elementLubKontener.checked ? "TAK" : "NIE", źródło: "checkbox" };
    }
    const inputy = Array.from(elementLubKontener.querySelectorAll
      ? elementLubKontener.querySelectorAll("input[type='checkbox'], input[type='radio']")
      : []);
    if (inputy.length === 1) {
      return { stan: inputy[0].checked ? "TAK" : "NIE", źródło: "checkbox" };
    }

    const kontrolki = pobierzKontrolkiPrzełącznika(elementLubKontener);
    if (kontrolki.length === 1) {
      const ariaChecked = kontrolki[0].getAttribute("aria-checked");
      if (ariaChecked === "true" || ariaChecked === "false") {
        return { stan: ariaChecked === "true" ? "TAK" : "NIE", źródło: "aria" };
      }
    }

    const kandydaciWizualni = [];
    if (elementLubKontener.matches && elementLubKontener.tagName !== "BUTTON" && elementLubKontener.matches(".toggle-switch-label, .active, .checked, .selected, .is-active")) {
      kandydaciWizualni.push(elementLubKontener);
    }
    if (elementLubKontener.querySelectorAll) {
      kandydaciWizualni.push.apply(kandydaciWizualni, Array.from(elementLubKontener.querySelectorAll(
        ".toggle-switch-label, [aria-pressed='true'], .active, .checked, .selected, .is-active"
      )).filter(function pomińZwykłyPrzycisk(element) { return element.tagName !== "BUTTON"; }));
    }
    const stany = Array.from(new Set(kandydaciWizualni)).map(function pobierzStan(element) {
      const tekst = przestrzeń.normalizujKluczBur(element.textContent || element.value || element.getAttribute("aria-label") || "");
      return tekst === "tak" ? "TAK" : (tekst === "nie" ? "NIE" : "");
    }).filter(Boolean);
    const unikalneStany = Array.from(new Set(stany));
    return unikalneStany.length === 1
      ? { stan: unikalneStany[0], źródło: "wizualny fallback" }
      : { stan: "", źródło: "" };
  }

  function pobierzStanPrzełącznika(elementLubKontener) {
    return pobierzStanPrzełącznikaZSzczegółami(elementLubKontener).stan;
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
      const opcja = element.selectedOptions && element.selectedOptions[0];
      return przestrzeń.normalizujTekstDoWalidacji(opcja ? opcja.textContent : element.value);
    }
    if ("value" in element) {
      return przestrzeń.normalizujTekstDoWalidacji(element.value);
    }
    return przestrzeń.normalizujTekstDoWalidacji(element.textContent || "");
  }

  przestrzeń.pobierzWartośćPola = pobierzWartośćPola;
  przestrzeń.pobierzTekstSelect2 = pobierzTekstSelect2;
  przestrzeń.znajdźNatywnePoleWyboruBur = znajdźNatywnePoleWyboruBur;
  przestrzeń.znajdźWidocznyElementSelect2 = znajdźWidocznyElementSelect2;
  przestrzeń.pobierzWartośćQuill = pobierzWartośćQuill;
  przestrzeń.pobierzKontrolkiPrzełącznika = pobierzKontrolkiPrzełącznika;
  przestrzeń.pobierzStanPrzełącznikaZSzczegółami = pobierzStanPrzełącznikaZSzczegółami;
  przestrzeń.pobierzStanPrzełącznika = pobierzStanPrzełącznika;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
