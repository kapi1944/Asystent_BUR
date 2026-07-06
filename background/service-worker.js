importScripts(
  "../shared/komunikaty.js",
  "../shared/wyszukiwarka-semper.js",
  "klient-semper.js"
);

chrome.runtime.onInstalled.addListener(function ustawPanelBoczny() {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onMessage.addListener(function obsłużKomunikatTła(wiadomość, nadawca, odpowiedz) {
  const komunikaty = globalThis.BurAsystent.KOMUNIKATY;

  if (!wiadomość || !wiadomość.typ) {
    return false;
  }

  if (wiadomość.typ === komunikaty.SZUKAJ_ŁĄCZA_SEMPER) {
    globalThis.BurAsystent.szukajŁączaSemper(wiadomość.fraza || "")
      .then(function zwróćWynik(wynik) {
        odpowiedz({
          typ: komunikaty.ODPOWIEDŹ_SZUKAJ_ŁĄCZA_SEMPER,
          wynik: wynik
        });
      })
      .catch(function zwróćBłąd(błąd) {
        odpowiedz({
          typ: komunikaty.ODPOWIEDŹ_SZUKAJ_ŁĄCZA_SEMPER,
          wynik: {
            ok: false,
            błąd: błąd && błąd.message ? błąd.message : "Nie udało się wyszukać szkolenia SEMPER."
          }
        });
      });

    return true;
  }

  if (wiadomość.typ === komunikaty.IMPORTUJ_SEMPER_Z_ŁĄCZA || wiadomość.typ === komunikaty.POBIERZ_HTML_SEMPER) {
    globalThis.BurAsystent.importujSzkolenieZŁączaSemper(wiadomość.url || "")
      .then(function zwróćHtml(wynik) {
        odpowiedz({
          typ: komunikaty.ODPOWIEDŹ_IMPORTUJ_SEMPER_Z_ŁĄCZA,
          wynik: wynik
        });
      })
      .catch(function zwróćBłąd(błąd) {
        odpowiedz({
          typ: komunikaty.BŁĄD_IMPORTU_SEMPER,
          wynik: {
            ok: false,
            błąd: błąd && błąd.message ? błąd.message : "Nie udało się pobrać danych z linku SEMPER."
          }
        });
      });

    return true;
  }

  return false;
});
