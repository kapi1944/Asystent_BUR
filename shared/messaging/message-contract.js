(function zarejestrujKontraktWiadomości(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function pobierzTypWiadomości(wiadomość) {
    return wiadomość && typeof wiadomość.typ === "string" ? wiadomość.typ : "";
  }

  function czyWiadomośćTypu(wiadomość, typy) {
    const lista = Array.isArray(typy) ? typy : [typy];
    return lista.includes(pobierzTypWiadomości(wiadomość));
  }

  function utwórzWiadomość(typ, dane) {
    if (!typ || typeof typ !== "string") { throw new Error("Typ wiadomości jest wymagany."); }
    return Object.assign({}, dane || {}, { typ: typ });
  }

  function utwórzOdpowiedźPing(wiadomość, dane) {
    const typ = pobierzTypWiadomości(wiadomość) === przestrzeń.TYPY_WIADOMOŚCI.PING_BUR
      ? przestrzeń.TYPY_WIADOMOŚCI.PONG_BUR
      : przestrzeń.KOMUNIKATY.PONG_SKRYPTU_STRONY;
    return Object.assign({}, dane || {}, { ok: true, typ: typ });
  }

  function utwórzRouterKomunikatów() {
    const obsługi = new Map();

    function zarejestruj(typy, obsługa) {
      if (typeof obsługa !== "function") { throw new Error("Obsługa wiadomości musi być funkcją."); }
      (Array.isArray(typy) ? typy : [typy]).forEach(function dodaj(typ) {
        if (!typ || obsługi.has(typ)) { throw new Error("Typ wiadomości jest pusty albo już zarejestrowany: " + typ); }
        obsługi.set(typ, obsługa);
      });
      return router;
    }

    function obsłuż(wiadomość, nadawca, odpowiedz) {
      const typ = pobierzTypWiadomości(wiadomość);
      const obsługa = obsługi.get(typ);
      if (!obsługa) { return false; }
      Promise.resolve().then(function wykonaj() { return obsługa(wiadomość, nadawca); })
        .then(function zwróć(wynik) { odpowiedz(wynik); })
        .catch(function zwróćBłąd(błąd) {
          odpowiedz({ ok: false, typ: typ, błąd: błąd && błąd.message ? błąd.message : String(błąd || "Nieznany błąd.") });
        });
      return true;
    }

    const router = Object.freeze({ zarejestruj: zarejestruj, obsłuż: obsłuż });
    return router;
  }

  przestrzeń.pobierzTypWiadomości = pobierzTypWiadomości;
  przestrzeń.czyWiadomośćTypu = czyWiadomośćTypu;
  przestrzeń.utwórzWiadomość = utwórzWiadomość;
  przestrzeń.utwórzOdpowiedźPing = utwórzOdpowiedźPing;
  przestrzeń.utwórzRouterKomunikatów = utwórzRouterKomunikatów;
  globalny.BurAsystent = przestrzeń;
})(typeof globalThis !== "undefined" ? globalThis : this);
