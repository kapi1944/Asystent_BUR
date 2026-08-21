(function zarejestrujWykonawcęZadańKart(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function utwórzBłąd(kod, komunikat) {
    const błąd = new Error(komunikat);
    błąd.kod = kod;
    return błąd;
  }

  function utwórzWykonawcęZadańKart(interfejs) {
    const zależności = interfejs || {};
    const chromeApi = zależności.chromeApi || globalny.chrome;
    const ustawTimeout = zależności.ustawTimeout || globalny.setTimeout.bind(globalny);
    const wyczyśćTimeout = zależności.wyczyśćTimeout || globalny.clearTimeout.bind(globalny);
    const pobierzCzas = zależności.pobierzCzas || Date.now;

    function wykonajZTimeoutem(operacja, timeoutMs, komunikat) {
      const limit = Number(timeoutMs || 0);
      if (limit <= 0) { return Promise.resolve().then(operacja); }
      return new Promise(function wykonaj(resolve, reject) {
        let zakończono = false;
        const timer = ustawTimeout(function przekroczono() {
          if (zakończono) { return; }
          zakończono = true;
          reject(utwórzBłąd("TIMEOUT", komunikat || "Przekroczono czas operacji karty."));
        }, limit);
        Promise.resolve().then(operacja).then(function zakończ(wynik) {
          if (zakończono) { return; }
          zakończono = true; wyczyśćTimeout(timer); resolve(wynik);
        }, function zakończBłędem(błąd) {
          if (zakończono) { return; }
          zakończono = true; wyczyśćTimeout(timer); reject(błąd);
        });
      });
    }

    function opóźnij(czasMs) {
      return new Promise(function poczekaj(resolve) { ustawTimeout(resolve, Math.max(0, Number(czasMs || 0))); });
    }

    async function ponów(operacja, opcje) {
      const ustawienia = opcje || {};
      const liczbaPrób = Math.max(1, Number(ustawienia.liczbaPrób || 1));
      let ostatniBłąd;
      for (let próba = 1; próba <= liczbaPrób; próba += 1) {
        try { return await operacja(próba); }
        catch (błąd) {
          ostatniBłąd = błąd;
          if (próba < liczbaPrób && ustawienia.opóźnienieMs) { await opóźnij(ustawienia.opóźnienieMs); }
        }
      }
      throw ostatniBłąd;
    }

    function utwórzKartę(dane) {
      if (zależności.utwórzKartę) { return Promise.resolve(zależności.utwórzKartę(dane)); }
      return new Promise(function wykonaj(resolve, reject) {
        chromeApi.tabs.create(dane, function poUtworzeniu(karta) {
          const błądRuntime = chromeApi.runtime.lastError;
          if (błądRuntime) { reject(utwórzBłąd("CREATE_TAB", błądRuntime.message)); return; }
          resolve(karta);
        });
      });
    }

    function pobierzKartę(tabId) {
      if (zależności.pobierzKartę) { return Promise.resolve(zależności.pobierzKartę(tabId)); }
      return new Promise(function wykonaj(resolve) {
        chromeApi.tabs.get(tabId, function poOdczycie(karta) { resolve(chromeApi.runtime.lastError ? null : karta); });
      });
    }

    function pobierzAktywnąKartę() {
      if (zależności.pobierzAktywnąKartę) { return Promise.resolve(zależności.pobierzAktywnąKartę()); }
      return Promise.resolve(chromeApi.tabs.query({ active: true, currentWindow: true }))
        .then(function wybierz(karty) { return karty && karty[0] || null; });
    }

    function aktywujKartę(tabId) {
      if (zależności.aktywujKartę) { return Promise.resolve(zależności.aktywujKartę(tabId)); }
      return Promise.resolve(chromeApi.tabs.update(tabId, { active: true }));
    }

    function wyślijWiadomość(tabId, wiadomość, opcje) {
      const timeoutMs = opcje && opcje.timeoutMs === 0 ? 0 : Number(opcje && opcje.timeoutMs || 5000);
      return wykonajZTimeoutem(function wyślij() {
        if (zależności.wyślijDoKarty) { return Promise.resolve(zależności.wyślijDoKarty(tabId, wiadomość)); }
        return new Promise(function wykonaj(resolve, reject) {
          chromeApi.tabs.sendMessage(tabId, wiadomość, function poOdpowiedzi(odpowiedź) {
            const błądRuntime = chromeApi.runtime.lastError;
            if (błądRuntime) { reject(utwórzBłąd("SEND_MESSAGE", błądRuntime.message)); return; }
            resolve(odpowiedź);
          });
        });
      }, timeoutMs, "Karta nie odpowiedziała na wiadomość w wymaganym czasie.");
    }

    async function czekajNaKartę(tabId, opcje) {
      const ustawienia = opcje || {};
      const timeoutMs = Number(ustawienia.timeoutMs || 10000);
      const początek = pobierzCzas();
      while (pobierzCzas() - początek <= timeoutMs) {
        const karta = await pobierzKartę(tabId);
        if (!karta) { throw utwórzBłąd("KARTA_ZAMKNIĘTA", "Karta została zamknięta."); }
        if (karta.status === (ustawienia.status || "complete")) { return karta; }
        await opóźnij(ustawienia.odstępMs || 100);
      }
      throw utwórzBłąd("TIMEOUT", "Karta nie osiągnęła oczekiwanego stanu w wymaganym czasie.");
    }

    function pobierzKonfiguracjęContentScriptu(plikWejściowy) {
      if (!plikWejściowy || typeof plikWejściowy !== "string") {
        throw new Error("Należy wskazać plik wejściowy content scriptu.");
      }
      const manifest = zależności.pobierzManifest ? zależności.pobierzManifest() : chromeApi.runtime.getManifest();
      const wpis = manifest && manifest.content_scripts && manifest.content_scripts.find(function znajdź(konfiguracja) {
        return Array.isArray(konfiguracja.js) && konfiguracja.js.includes(plikWejściowy);
      });
      if (!wpis) { throw new Error("Manifest nie zawiera konfiguracji content scriptu: " + plikWejściowy + "."); }
      return { js: wpis.js.slice(), css: Array.isArray(wpis.css) ? wpis.css.slice() : [] };
    }

    async function wstrzyknijContentScript(tabId, opcje) {
      if (zależności.wstrzyknijContentScript) { return zależności.wstrzyknijContentScript(tabId, opcje); }
      const konfiguracja = pobierzKonfiguracjęContentScriptu(opcje && opcje.plikWejściowy);
      if (konfiguracja.css.length && chromeApi.scripting.insertCSS) {
        await chromeApi.scripting.insertCSS({ target: { tabId: tabId }, files: konfiguracja.css });
      }
      return chromeApi.scripting.executeScript({ target: { tabId: tabId }, files: konfiguracja.js });
    }

    async function ping(tabId, opcje) {
      const ustawienia = opcje || {};
      const typPing = ustawienia.typPing;
      const typPong = ustawienia.typPong;
      if (!typPing || !typPong) { throw new Error("PING wymaga jawnych typów wiadomości PING i PONG."); }
      const odpowiedź = await wyślijWiadomość(tabId, { typ: typPing }, { timeoutMs: ustawienia.timeoutMs });
      if (!odpowiedź || odpowiedź.typ !== typPong) { throw new Error("Content script nie odpowiedział poprawnym komunikatem PONG."); }
      return odpowiedź;
    }

    async function zapewnijContentScript(tabId, opcje) {
      try { return { wstrzyknięto: false, pong: await ping(tabId, opcje) }; }
      catch (pierwszyBłąd) {
        const karta = await pobierzKartę(tabId);
        if (!karta) { throw utwórzBłąd("KARTA_ZAMKNIĘTA", "Nie można przygotować zamkniętej karty."); }
        await wstrzyknijContentScript(tabId, opcje);
        const ustawienia = opcje || {};
        const pong = await ponów(function ponówPing() { return ping(tabId, ustawienia); }, {
          liczbaPrób: ustawienia.liczbaPrób || 3,
          opóźnienieMs: ustawienia.opóźnienieMs === undefined ? 100 : ustawienia.opóźnienieMs
        });
        return { wstrzyknięto: true, pong: pong };
      }
    }

    return Object.freeze({
      utwórzKartę: utwórzKartę, pobierzKartę: pobierzKartę, pobierzAktywnąKartę: pobierzAktywnąKartę,
      aktywujKartę: aktywujKartę, czekajNaKartę: czekajNaKartę, wyślijWiadomość: wyślijWiadomość,
      ping: ping, zapewnijContentScript: zapewnijContentScript, wstrzyknijContentScript: wstrzyknijContentScript,
      ponów: ponów, wykonajZTimeoutem: wykonajZTimeoutem, pobierzKonfiguracjęContentScriptu: pobierzKonfiguracjęContentScriptu
    });
  }

  przestrzeń.utwórzWykonawcęZadańKart = utwórzWykonawcęZadańKart;
  globalny.BurAsystent = przestrzeń;
})(typeof globalThis !== "undefined" ? globalThis : this);
