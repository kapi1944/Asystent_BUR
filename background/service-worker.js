importScripts(
  "../shared/storage/storage-keys.js",
  "../shared/storage/storage-api.js",
  "../shared/providers/provider-rules.js",
  "../shared/providers/profile-detector.js",
  "../shared/profile-dostawcow.js",
  "../shared/komunikaty.js",
  "../shared/szablony-harmonogramow.js",
  "../shared/seria-ogloszen-bur.js",
  "../shared/wyszukiwarka-semper.js",
  "klient-semper.js",
  "klient-iist.js",
  "koordynator-serii-bur.js"
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

  if (wiadomość.typ === komunikaty.SZUKAJ_ŁĄCZA_IIST) {
    globalThis.BurAsystent.szukajŁączaIist(wiadomość.fraza || "")
      .then(function zwróćWynikIist(wynik) {
        odpowiedz({ typ: komunikaty.ODPOWIEDŹ_SZUKAJ_ŁĄCZA_IIST, wynik: wynik });
      })
      .catch(function zwróćBłądIist(błąd) {
        odpowiedz({
          typ: komunikaty.ODPOWIEDŹ_SZUKAJ_ŁĄCZA_IIST,
          wynik: { ok: false, błąd: błąd && błąd.message ? błąd.message : "Nie udało się wyszukać szkolenia IIST." }
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

  if (wiadomość.typ === komunikaty.IMPORTUJ_SZKOLENIE_Z_LINKU) {
    globalThis.BurAsystent.importujSzkolenieZLinkuIist(wiadomość.url || "")
      .then(function zwróćHtmlIist(wynik) {
        odpowiedz({ typ: komunikaty.ODPOWIEDŹ_IMPORTUJ_SZKOLENIE, wynik: wynik });
      })
      .catch(function zwróćBłądIist(błąd) {
        odpowiedz({
          typ: komunikaty.BŁĄD_IMPORTU_SZKOLENIA,
          wynik: { ok: false, błąd: błąd && błąd.message ? błąd.message : "Nie udało się pobrać danych szkolenia IIST." }
        });
      });
    return true;
  }

  return false;
});
