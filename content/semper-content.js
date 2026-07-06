(function uruchomSemperContent(globalny) {
  const przestrzen = globalny.BurAsystent || {};
  const komunikaty = przestrzen.KOMUNIKATY;

  chrome.runtime.onMessage.addListener(function obsluzKomunikat(wiadomosc, nadawca, odpowiedz) {
    if (!wiadomosc || !wiadomosc.typ) {
      return false;
    }

    if (wiadomosc.typ === komunikaty.PING_SKRYPTU_STRONY) {
      odpowiedz({
        typ: komunikaty.PONG_SKRYPTU_STRONY,
        typStrony: "SEMPER",
        url: location.href
      });

      return true;
    }

    if (wiadomosc.typ !== komunikaty.POBIERZ_DANE_ZE_STRONY) {
      return false;
    }

    try {
      const wynik = przestrzen.parsujStroneSemper(document, location.href);

      odpowiedz({
        typ: komunikaty.ODPOWIEDZ_DANE_SEMPER,
        wynik: wynik
      });
    } catch (blad) {
      odpowiedz({
        typ: komunikaty.BLAD_PARSERA,
        blad: blad && blad.message ? blad.message : "Nieznany blad parsera SEMPER."
      });
    }

    return true;
  });
})(globalThis);
