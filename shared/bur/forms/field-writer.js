(function zarejestrujPisarzaPólBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function wyemitujZdarzenia(element, typy) {
    if (!element || !element.dispatchEvent) {
      return false;
    }

    const okno = element.ownerDocument && element.ownerDocument.defaultView || globalny;
    const KonstruktorZdarzenia = okno.Event || Event;
    (typy || ["input", "change", "blur"]).forEach(function wyemituj(typ) {
      element.dispatchEvent(new KonstruktorZdarzenia(typ, { bubbles: true }));
    });
    return true;
  }

  function ustawWartośćNatywną(element, wartość) {
    if (!element || !["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName)) {
      return false;
    }

    const okno = element.ownerDocument && element.ownerDocument.defaultView || globalny;
    const prototypy = {
      INPUT: okno.HTMLInputElement && okno.HTMLInputElement.prototype,
      TEXTAREA: okno.HTMLTextAreaElement && okno.HTMLTextAreaElement.prototype,
      SELECT: okno.HTMLSelectElement && okno.HTMLSelectElement.prototype
    };
    const opis = prototypy[element.tagName]
      ? Object.getOwnPropertyDescriptor(prototypy[element.tagName], "value")
      : null;

    if (opis && opis.set) {
      opis.set.call(element, wartość);
    } else {
      element.value = wartość;
    }
    return true;
  }

  function ustawWartość(element, wartość) {
    if (!element || !element.matches || !element.matches("input, textarea, select") || element.disabled || element.readOnly) {
      return false;
    }

    const tekst = wartość === undefined || wartość === null ? "" : String(wartość);
    let wartośćTechniczna = tekst;

    if (element.tagName === "SELECT") {
      const normalizuj = przestrzeń.normalizujTekstDoWalidacji || function bezNormalizacji(wpis) { return String(wpis || "").trim(); };
      const oczekiwana = normalizuj(tekst);
      const pasujące = Array.from(element.options || []).filter(function pasuje(opcja) {
        return opcja.value === tekst || normalizuj(opcja.textContent || opcja.label || "") === oczekiwana;
      });
      const unikalne = Array.from(new Set(pasujące));
      if (unikalne.length !== 1) {
        return false;
      }
      wartośćTechniczna = unikalne[0].value;
    }

    ustawWartośćNatywną(element, wartośćTechniczna);
    wyemitujZdarzenia(element);
    return element.value === wartośćTechniczna;
  }

  const pisarz = {
    ustawWartość: ustawWartość,
    ustawWartośćNatywną: ustawWartośćNatywną,
    wyemitujZdarzenia: wyemitujZdarzenia
  };

  przestrzeń.pisarzPólBur = pisarz;
  przestrzeń.ustawWartośćPola = ustawWartość;
  przestrzeń.wywołajZdarzeniaZmiany = wyemitujZdarzenia;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
