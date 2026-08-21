(function zarejestrujRouterKomunikatówTła(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function utwórzRouterKomunikatówTła(interfejs) {
    const zależności = interfejs || {};
    const wykonawcaKart = zależności.wykonawcaKart || przestrzeń.utwórzWykonawcęZadańKart();
    const router = przestrzeń.utwórzRouterKomunikatów();
    const komunikaty = przestrzeń.KOMUNIKATY;
    const opcjeContentBur = {
      typPing: przestrzeń.TYPY_WIADOMOŚCI.PING_BUR,
      typPong: przestrzeń.TYPY_WIADOMOŚCI.PONG_BUR,
      plikWejściowy: "content/bur-content.js"
    };

    router.zarejestruj(przestrzeń.TYPY_WIADOMOŚCI.ZAPEWNIJ_CONTENT_SCRIPT_BUR, function zapewnij(wiadomość) {
      const tabId = Number(wiadomość && wiadomość.tabId);
      if (!Number.isInteger(tabId) || tabId <= 0) { throw new Error("Wiadomość ensure wymaga poprawnego tabId."); }
      return wykonawcaKart.zapewnijContentScript(tabId, opcjeContentBur).then(function zwróć(wynik) {
        return { ok: true, typ: przestrzeń.TYPY_WIADOMOŚCI.ZAPEWNIJ_CONTENT_SCRIPT_BUR, wynik: wynik };
      });
    });

    router.zarejestruj(komunikaty.SZUKAJ_ŁĄCZA_SEMPER, function szukajSemper(wiadomość) {
      return przestrzeń.szukajŁączaSemper(wiadomość.fraza || "")
        .then(function zwróć(wynik) { return { typ: komunikaty.ODPOWIEDŹ_SZUKAJ_ŁĄCZA_SEMPER, wynik: wynik }; })
        .catch(function zwróćBłąd(błąd) { return { typ: komunikaty.ODPOWIEDŹ_SZUKAJ_ŁĄCZA_SEMPER, wynik: { ok: false, błąd: błąd.message || "Nie udało się wyszukać szkolenia SEMPER." } }; });
    });

    router.zarejestruj(komunikaty.SZUKAJ_ŁĄCZA_IIST, function szukajIist(wiadomość) {
      return przestrzeń.szukajŁączaIist(wiadomość.fraza || "")
        .then(function zwróć(wynik) { return { typ: komunikaty.ODPOWIEDŹ_SZUKAJ_ŁĄCZA_IIST, wynik: wynik }; })
        .catch(function zwróćBłąd(błąd) { return { typ: komunikaty.ODPOWIEDŹ_SZUKAJ_ŁĄCZA_IIST, wynik: { ok: false, błąd: błąd.message || "Nie udało się wyszukać szkolenia IIST." } }; });
    });

    router.zarejestruj([komunikaty.IMPORTUJ_SEMPER_Z_ŁĄCZA, komunikaty.POBIERZ_HTML_SEMPER], function importujSemper(wiadomość) {
      return przestrzeń.importujSzkolenieZŁączaSemper(wiadomość.url || "")
        .then(function zwróć(wynik) { return { typ: komunikaty.ODPOWIEDŹ_IMPORTUJ_SEMPER_Z_ŁĄCZA, wynik: wynik }; })
        .catch(function zwróćBłąd(błąd) { return { typ: komunikaty.BŁĄD_IMPORTU_SEMPER, wynik: { ok: false, błąd: błąd.message || "Nie udało się pobrać danych z linku SEMPER." } }; });
    });

    router.zarejestruj(komunikaty.IMPORTUJ_SZKOLENIE_Z_LINKU, function importujIist(wiadomość) {
      return przestrzeń.importujSzkolenieZLinkuIist(wiadomość.url || "")
        .then(function zwróć(wynik) { return { typ: komunikaty.ODPOWIEDŹ_IMPORTUJ_SZKOLENIE, wynik: wynik }; })
        .catch(function zwróćBłąd(błąd) { return { typ: komunikaty.BŁĄD_IMPORTU_SZKOLENIA, wynik: { ok: false, błąd: błąd.message || "Nie udało się pobrać danych szkolenia IIST." } }; });
    });

    return router;
  }

  przestrzeń.utwórzRouterKomunikatówTła = utwórzRouterKomunikatówTła;
  globalny.BurAsystent = przestrzeń;
})(typeof globalThis !== "undefined" ? globalThis : this);
