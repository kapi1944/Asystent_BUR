(function uruchomIistContent(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const komunikaty = przestrzeń.KOMUNIKATY || {};
  if (!globalny.chrome || !chrome.runtime || !chrome.runtime.onMessage) { return; }
  chrome.runtime.onMessage.addListener(function obsłuż(wiadomość, nadawca, odpowiedz) {
    if (!wiadomość || !wiadomość.typ) { return false; }
    if (przestrzeń.czyWiadomośćTypu(wiadomość, [komunikaty.PING_SKRYPTU_STRONY, przestrzeń.TYPY_WIADOMOŚCI.PING_BUR])) {
      odpowiedz(przestrzeń.utwórzOdpowiedźPing(wiadomość, { typStrony: "IIST", url: location.href }));
      return true;
    }
    if (wiadomość.typ !== komunikaty.POBIERZ_DANE_ZE_STRONY && wiadomość.typ !== "POBIERZ_DANE_IIST_ZE_STRONY") { return false; }
    try {
      const wynik = przestrzeń.parsujStronęIist ? przestrzeń.parsujStronęIist(document, location.href) : przestrzeń.parsujHtmlIist(document.documentElement.outerHTML, location.href);
      odpowiedz({ ok: true, typ: komunikaty.ODPOWIEDŹ_DANE_SZKOLENIA, wynik: wynik });
    } catch (błąd) {
      odpowiedz({ typ: komunikaty.BLAD_PARSERA, blad: błąd && błąd.message ? błąd.message : "Nieznany błąd parsera IIST." });
    }
    return true;
  });
})(globalThis);
