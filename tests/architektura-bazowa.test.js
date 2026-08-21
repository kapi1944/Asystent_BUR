(function testujArchitekturęBazową() {
  function pobierzPlik(ścieżka) {
    return fetch(ścieżka).then(function sprawdźOdpowiedź(odpowiedź) {
      if (!odpowiedź.ok) {
        throw new Error("Nie udało się odczytać pliku: " + ścieżka);
      }
      return odpowiedź.text();
    });
  }

  function wyodrębnijSkryptyHtml(html) {
    const dokument = new DOMParser().parseFromString(html, "text/html");
    return Array.from(dokument.querySelectorAll("script[src]"), function pobierzŹródło(skrypt) {
      return skrypt.getAttribute("src").replace(/^\.\.\//, "");
    });
  }

  test("manifest jest jedynym źródłem listy content scriptów BUR", function sprawdźŹródłoContentScriptów() {
    return Promise.all([
      pobierzPlik("../manifest.json"),
      pobierzPlik("../panel/panel.js"),
      pobierzPlik("../background/koordynator-serii-bur.js"),
      pobierzPlik("../background/orchestration/tab-job-runner.js")
    ]).then(function sprawdź(wyniki) {
      const manifest = JSON.parse(wyniki[0]);
      const wpisBur = manifest.content_scripts.find(function znajdźBur(wpis) {
        return wpis.js.includes("content/bur-content.js");
      });

      sprawdzWarunek(Boolean(wpisBur), "Manifest nie zawiera wpisu content scriptów BUR.");
      sprawdzWarunek(!wyniki[1].includes("plikiContentBur"), "Panel nadal utrzymuje własną listę content scriptów BUR.");
      sprawdzWarunek(!wyniki[1].includes("scripting.executeScript"), "Panel nadal samodzielnie wstrzykuje content script.");
      sprawdzWarunek(!wyniki[2].includes("PLIKI_CONTENT_BUR"), "Koordynator nadal utrzymuje własną listę content scriptów BUR.");
      sprawdzWarunek(!wyniki[2].includes("scripting.executeScript"), "Koordynator nadal samodzielnie wstrzykuje content script.");
      sprawdzWarunek(wyniki[3].includes("runtime.getManifest()"), "Runner nie pobiera konfiguracji z manifestu.");
      sprawdzWarunek(wyniki[3].includes("scripting.executeScript"), "Runner nie realizuje scentralizowanego wstrzykiwania.");
    });
  });

  test("klasyczne loadery zachowują aktualną kolejność zależności", function sprawdźLoadery() {
    return Promise.all([
      pobierzPlik("../background/service-worker.js"),
      pobierzPlik("../panel/panel.html")
    ]).then(function sprawdźKolejność(wyniki) {
      const plikiServiceWorkera = Array.from(wyniki[0].matchAll(/[\"'](?:\.\.\/)?([^\"']+\.js)[\"']/g), function pobierzŚcieżkę(wynik) {
        return wynik[1].includes("/") ? wynik[1] : "background/" + wynik[1];
      });
      const plikiPanelu = wyodrębnijSkryptyHtml(wyniki[1]);
      const oczekiwanyServiceWorker = [
        "shared/storage/storage-keys.js", "shared/storage/storage-api.js",
        "shared/messaging/message-types.js", "shared/messaging/message-contract.js",
        "shared/providers/provider-rules.js", "shared/providers/profile-detector.js",
        "shared/profile-dostawcow.js", "shared/komunikaty.js", "shared/szablony-harmonogramow.js",
        "shared/seria-ogloszen-bur.js", "shared/wyszukiwarka-semper.js", "background/klient-semper.js",
        "background/klient-iist.js", "orchestration/tab-job-runner.js",
        "background/router-komunikatow.js", "background/koordynator-serii-bur.js"
      ];
      const oczekiwanyPanel = [
        "shared/storage/storage-keys.js", "shared/storage/storage-api.js",
        "shared/messaging/message-types.js", "shared/messaging/message-contract.js",
        "shared/providers/provider-rules.js", "shared/providers/profile-detector.js",
        "shared/profile-dostawcow.js", "shared/komunikaty.js", "shared/model.js",
        "shared/normalizacja-tytulu.js", "shared/daty.js", "shared/terminy-bur.js",
        "shared/kolejka-terminow-bur.js", "shared/stan-operacji-bur.js", "shared/szablony-harmonogramow.js",
        "shared/seria-ogloszen-bur.js", "shared/bur-program-harmonogram.js", "shared/wyszukiwarka-semper.js",
        "shared/parser-semper.js", "shared/parser-iist.js", "background/klient-iist.js",
        "shared/definicje-pol-bur.js", "shared/przygotowanie-wypelnienia-bur.js", "panel.js"
      ];

      sprawdzRownosc(plikiServiceWorkera.join("\n"), oczekiwanyServiceWorker.join("\n"), "Zmieniła się kolejność importScripts service workera.");
      sprawdzRownosc(plikiPanelu.join("\n"), oczekiwanyPanel.join("\n"), "Zmieniła się kolejność skryptów panelu.");
    });
  });

  test("kontrakty komunikatów i kluczy storage pozostają stabilne", function sprawdźKontraktyStanu() {
    const komunikaty = BurAsystent.KOMUNIKATY;
    Object.keys(komunikaty).forEach(function sprawdźWartość(nazwa) {
      sprawdzRownosc(komunikaty[nazwa], nazwa, "Wartość komunikatu nie odpowiada jego nazwie: " + nazwa + ".");
    });
    sprawdzRownosc(BurAsystent.kluczDanychProfilu("semper"), "daneŹródłoweWedługProfilu_semper");
    sprawdzRownosc(BurAsystent.kluczDanychProfilu("iist"), "daneŹródłoweWedługProfilu_iist");

    return Promise.all([
      pobierzPlik("../panel/panel.js"),
      pobierzPlik("../content/bur-content.js"),
      pobierzPlik("../background/koordynator-serii-bur.js"),
      pobierzPlik("../shared/storage/storage-keys.js")
    ]).then(function sprawdźKlucze(wyniki) {
      [
        "ostatnieSzkolenieSemper", "wybranyTerminSemperIndex", "aktywnyProfilDostawcy",
        "aktywnaOperacjaBur",
        "wybranyTerminHarmonogramuBur", "harmonogramBurPrzygotowany"
      ].forEach(function sprawdźKluczPanelu(klucz) {
        sprawdzWarunek(wyniki[0].includes(klucz), "Panel nie używa utrwalonego klucza: " + klucz + ".");
      });
      ["bur_terms_raw", "bur_term_index", "bur_terms_order_mode", "bur_total_counter", "bur_daily_counter_"].forEach(function sprawdźKluczKolejki(klucz) {
        sprawdzWarunek(wyniki[1].includes(klucz), "Content script nie używa utrwalonego klucza kolejki: " + klucz + ".");
      });
      sprawdzWarunek(wyniki[2].includes("KLUCZE_STORAGE.AKTYWNA_SERIA_OGŁOSZEŃ_BUR"), "Koordynator nie używa wspólnego kontraktu kluczy storage.");
      sprawdzWarunek(wyniki[3].includes('AKTYWNA_SERIA_OGŁOSZEŃ_BUR: "aktywnaSeriaOgloszenBur"'), "Zmienił się klucz stanu serii BUR.");
      sprawdzWarunek(wyniki[3].includes('STAN_WALIDACJI_BUR: "stanWalidacjiBur"'), "Zmienił się klucz stanu walidacji BUR.");
      sprawdzWarunek(wyniki[3].includes('STAN_PANELU_BUR: "stanPaneluBur"'), "Zmienił się klucz stanu panelu BUR.");
    });
  });

  test("entry pointy pozostają klasycznymi skryptami bez migracji do ES Modules", function sprawdźTypSkryptów() {
    return Promise.all([
      pobierzPlik("../manifest.json"),
      pobierzPlik("../background/service-worker.js"),
      pobierzPlik("../panel/panel.html")
    ]).then(function sprawdźPliki(wyniki) {
      const manifest = JSON.parse(wyniki[0]);
      sprawdzRownosc(manifest.background.service_worker, "background/service-worker.js");
      sprawdzWarunek(!manifest.background.type, "Service worker nie powinien być jeszcze modułem ES.");
      sprawdzWarunek(wyniki[1].includes("importScripts("), "Service worker powinien zachować klasyczny importScripts.");
      sprawdzWarunek(!/<script[^>]+type=[\"']module[\"']/i.test(wyniki[2]), "Panel nie powinien być jeszcze ładowany jako ES Module.");
    });
  });
})();
