(function uruchomBurContent(globalny) {
  const przestrzen = globalny.BurAsystent || {};
  const komunikaty = przestrzen.KOMUNIKATY;

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
