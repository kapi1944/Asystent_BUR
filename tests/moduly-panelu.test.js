(function testujModułyPanelu() {
  function pobierzPlik(ścieżka) {
    return fetch(ścieżka).then(function sprawdźOdpowiedź(odpowiedź) {
      if (!odpowiedź.ok) {
        throw new Error("Nie udało się odczytać pliku: " + ścieżka);
      }
      return odpowiedź.text();
    });
  }

  test("aplikacja panelu ma wydzielony klasyczny entry point", function sprawdźEntryPoint() {
    return Promise.all([
      pobierzPlik("../panel/app.js"),
      pobierzPlik("../panel/panel.js"),
      pobierzPlik("../panel/panel.html")
    ]).then(function sprawdźPliki(wyniki) {
      const dokument = new DOMParser().parseFromString(wyniki[2], "text/html");
      const skrypty = Array.from(dokument.querySelectorAll("script[src]"), function pobierzŹródło(skrypt) {
        return skrypt.getAttribute("src");
      });

      sprawdzWarunek(wyniki[0].includes("panel.aplikacja.inicjalizuj()"), "app.js nie uruchamia aplikacji panelu.");
      sprawdzWarunek(wyniki[1].includes("przestrzeń.panel.aplikacja"), "panel.js nie udostępnia inicjalizacji przez granicę modułową.");
      sprawdzWarunek(skrypty.indexOf("panel.js") < skrypty.indexOf("app.js"), "Entry point musi być ładowany po zgodnej logice panelu.");
    });
  });

  test("routing i mały stan panelu są wydzielone", function sprawdźRouterIStan() {
    return Promise.all([
      pobierzPlik("../panel/router.js"),
      pobierzPlik("../panel/shared/panel-state.js"),
      pobierzPlik("../panel/panel.js")
    ]).then(function sprawdźPliki(wyniki) {
      sprawdzWarunek(wyniki[0].includes("utwórzRouterPanelu"), "Brakuje fabryki routera panelu.");
      sprawdzWarunek(wyniki[0].includes("data-przelacz-zakladke"), "Router nie obsługuje kontrolek głównych zakładek.");
      sprawdzWarunek(wyniki[1].includes("utwórzStanPanelu"), "Brakuje fabryki wspólnego stanu panelu.");
      sprawdzWarunek(wyniki[2].includes("routerPanelu.ustawAktywnąZakładkę"), "Zgodna logika panelu nie deleguje routingu.");
      sprawdzWarunek(!/let aktywnaZakładkaPanelu\s*=/.test(wyniki[2]), "Aktywna zakładka pozostała globalnym stanem panel.js.");
    });
  });

  test("Diagnostyka jest modułem, a Refresh pozostaje wyłączonym mount pointem", function sprawdźFunkcje() {
    return Promise.all([
      pobierzPlik("../panel/features/diagnostyka.js"),
      pobierzPlik("../panel/shared/feature-flags.js"),
      pobierzPlik("../panel/panel.html"),
      pobierzPlik("../panel/panel.js")
    ]).then(function sprawdźPliki(wyniki) {
      const dokument = new DOMParser().parseFromString(wyniki[2], "text/html");
      const mountRefresh = dokument.getElementById("mount-refresh");

      sprawdzWarunek(wyniki[0].includes("utwórzDiagnostykę"), "Diagnostyka nie ma własnej granicy modułowej.");
      sprawdzWarunek(wyniki[3].includes("funkcjaDiagnostyki.zamontuj()"), "Panel nie inicjalizuje modułu Diagnostyki.");
      sprawdzWarunek(/enabled:\s*false/.test(wyniki[1]), "Refresh musi pozostać wyłączony.");
      sprawdzWarunek(/autoCorrection:\s*false/.test(wyniki[1]), "Automatyczna korekta Refresh musi pozostać wyłączona.");
      sprawdzWarunek(/autoPublish:\s*false/.test(wyniki[1]), "Automatyczna publikacja Refresh musi pozostać wyłączona.");
      sprawdzWarunek(Boolean(mountRefresh) && mountRefresh.hidden, "Brakuje ukrytego mount pointu Refresh.");
      sprawdzWarunek(!/\brefresh\b/i.test(wyniki[3]), "panel.js nie powinien zawierać stanu ani logiki Refresh.");
    });
  });
})();
