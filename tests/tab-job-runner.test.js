(function testujWykonawcęZadańKart() {
  function konfiguracjaManifestu() {
    return {
      content_scripts: [{
        matches: ["https://uslugirozwojowe.parp.gov.pl/*"],
        js: ["shared/komunikaty.js", "content/bur-content.js"],
        css: ["content/bur-content.css"]
      }]
    };
  }

  function opcjePingBur() {
    return {
      typPing: BurAsystent.TYPY_WIADOMOŚCI.PING_BUR,
      typPong: BurAsystent.TYPY_WIADOMOŚCI.PONG_BUR,
      plikWejściowy: "content/bur-content.js",
      opóźnienieMs: 0
    };
  }

  test("TabJobRunner nie wstrzykuje content scriptu, gdy PING już działa", function sprawdźIstniejącyContentScript() {
    let liczbaWstrzyknięć = 0;
    const wykonawca = BurAsystent.utwórzWykonawcęZadańKart({
      wyślijDoKarty: function odpowiedz() {
        return { typ: BurAsystent.TYPY_WIADOMOŚCI.PONG_BUR };
      },
      pobierzKartę: function pobierz() { return { id: 7 }; },
      wstrzyknijContentScript: function wstrzyknij() { liczbaWstrzyknięć += 1; }
    });

    return wykonawca.zapewnijContentScript(7, opcjePingBur()).then(function sprawdź(wynik) {
      sprawdzRownosc(wynik.wstrzyknięto, false);
      sprawdzRownosc(liczbaWstrzyknięć, 0);
    });
  });

  test("TabJobRunner wstrzykuje brakujący content script tylko raz i ponawia PING", function sprawdźBrakContentScriptu() {
    let liczbaPingów = 0;
    let liczbaWstrzyknięć = 0;
    const wykonawca = BurAsystent.utwórzWykonawcęZadańKart({
      wyślijDoKarty: function odpowiedz() {
        liczbaPingów += 1;
        if (liczbaPingów === 1) { throw new Error("Brak odbiorcy"); }
        return { typ: BurAsystent.TYPY_WIADOMOŚCI.PONG_BUR };
      },
      pobierzKartę: function pobierz() { return { id: 8 }; },
      wstrzyknijContentScript: function wstrzyknij() { liczbaWstrzyknięć += 1; }
    });

    return wykonawca.zapewnijContentScript(8, opcjePingBur()).then(function sprawdź(wynik) {
      sprawdzRownosc(wynik.wstrzyknięto, true);
      sprawdzRownosc(liczbaWstrzyknięć, 1);
      sprawdzRownosc(liczbaPingów, 2);
    });
  });

  test("TabJobRunner pobiera listę content scriptów BUR wyłącznie z manifestu", function sprawdźManifest() {
    const wykonawca = BurAsystent.utwórzWykonawcęZadańKart({
      pobierzManifest: konfiguracjaManifestu
    });
    const konfiguracja = wykonawca.pobierzKonfiguracjęContentScriptu("content/bur-content.js");

    sprawdzRownosc(konfiguracja.js.join("|"), "shared/komunikaty.js|content/bur-content.js");
    sprawdzRownosc(konfiguracja.css.join("|"), "content/bur-content.css");
  });

  test("TabJobRunner zgłasza timeout wiadomości", function sprawdźTimeout() {
    const wykonawca = BurAsystent.utwórzWykonawcęZadańKart({
      wyślijDoKarty: function bezOdpowiedzi() { return new Promise(function oczekuj() {}); }
    });

    return wykonawca.wyślijWiadomość(9, { typ: "test" }, { timeoutMs: 10 })
      .then(function niePowinnoSięUdać() { throw new Error("Oczekiwano timeoutu."); })
      .catch(function sprawdź(błąd) { sprawdzRownosc(błąd.kod, "TIMEOUT"); });
  });

  test("TabJobRunner rozpoznaje kartę zamkniętą przed wstrzyknięciem", function sprawdźZamkniętąKartę() {
    const wykonawca = BurAsystent.utwórzWykonawcęZadańKart({
      wyślijDoKarty: function brakOdbiorcy() { throw new Error("Brak odbiorcy"); },
      pobierzKartę: function brakKarty() { return null; }
    });

    return wykonawca.zapewnijContentScript(10, opcjePingBur())
      .then(function niePowinnoSięUdać() { throw new Error("Oczekiwano błędu zamkniętej karty."); })
      .catch(function sprawdź(błąd) { sprawdzRownosc(błąd.kod, "KARTA_ZAMKNIĘTA"); });
  });

  test("TabJobRunner nie ukrywa chrome.runtime.lastError z sendMessage", function sprawdźBłądWiadomości() {
    const chromeApi = {
      runtime: { lastError: null },
      tabs: {
        sendMessage: function wyślij(tabId, wiadomość, odpowiedz) {
          chromeApi.runtime.lastError = { message: "Kanał został zamknięty" };
          odpowiedz();
          chromeApi.runtime.lastError = null;
        }
      }
    };
    const wykonawca = BurAsystent.utwórzWykonawcęZadańKart({ chromeApi: chromeApi });

    return wykonawca.wyślijWiadomość(11, { typ: "test" })
      .then(function niePowinnoSięUdać() { throw new Error("Oczekiwano błędu sendMessage."); })
      .catch(function sprawdź(błąd) {
        sprawdzRownosc(błąd.kod, "SEND_MESSAGE");
        sprawdzWarunek(błąd.message.includes("Kanał został zamknięty"));
      });
  });

  test("TabJobRunner ponawia operację do skutku", function sprawdźRetry() {
    let liczbaPrób = 0;
    const wykonawca = BurAsystent.utwórzWykonawcęZadańKart({});

    return wykonawca.ponów(function wykonaj() {
      liczbaPrób += 1;
      if (liczbaPrób < 3) { throw new Error("Błąd przejściowy"); }
      return "gotowe";
    }, { liczbaPrób: 3, opóźnienieMs: 0 }).then(function sprawdź(wynik) {
      sprawdzRownosc(wynik, "gotowe");
      sprawdzRownosc(liczbaPrób, 3);
    });
  });

  test("stary PING nadal otrzymuje stary PONG", function sprawdźStaryTyp() {
    const odpowiedź = BurAsystent.utwórzOdpowiedźPing(
      { typ: BurAsystent.KOMUNIKATY.PING_SKRYPTU_STRONY },
      { typStrony: "BUR" }
    );

    sprawdzRownosc(odpowiedź.typ, BurAsystent.KOMUNIKATY.PONG_SKRYPTU_STRONY);
    sprawdzRownosc(odpowiedź.typStrony, "BUR");
  });

  test("kontrakt wiadomości zachowuje jawnie wskazany typ", function sprawdźKontraktTypu() {
    const wiadomość = BurAsystent.utwórzWiadomość("bur.test", { typ: "STARY_TYP", wartość: 1 });

    sprawdzRownosc(wiadomość.typ, "bur.test");
    sprawdzRownosc(wiadomość.wartość, 1);
  });

  test("router background obsługuje nowy komunikat ensure BUR", function sprawdźNowyRouter() {
    const router = BurAsystent.utwórzRouterKomunikatówTła({
      wykonawcaKart: {
        zapewnijContentScript: function zapewnij(tabId) {
          return Promise.resolve({ tabId: tabId, wstrzyknięto: false });
        }
      }
    });

    return new Promise(function wykonaj(resolve, reject) {
      const obsłużono = router.obsłuż({
        typ: BurAsystent.TYPY_WIADOMOŚCI.ZAPEWNIJ_CONTENT_SCRIPT_BUR,
        tabId: 12
      }, {}, function odpowiedz(odpowiedź) {
        try {
          sprawdzRownosc(odpowiedź.ok, true);
          sprawdzRownosc(odpowiedź.wynik.tabId, 12);
          resolve();
        } catch (błąd) { reject(błąd); }
      });
      if (!obsłużono) { reject(new Error("Router nie rozpoznał nowego typu wiadomości.")); }
    });
  });
})();
