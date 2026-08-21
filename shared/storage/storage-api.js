(function zarejestrujApiStorage(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function utwórzStorageApi(interfejsChrome) {
    function pobierzChrome() {
      return interfejsChrome || globalny.chrome;
    }

    function czyDostępny(rodzaj) {
      const chromeApi = pobierzChrome();
      return Boolean(chromeApi && chromeApi.storage && chromeApi.storage[rodzaj]);
    }

    function wykonaj(rodzaj, metoda, argument) {
      return new Promise(function wykonajOperację(resolve, reject) {
        const chromeApi = pobierzChrome();
        const obszar = chromeApi && chromeApi.storage && chromeApi.storage[rodzaj];
        if (!obszar || typeof obszar[metoda] !== "function") {
          reject(new Error("Storage " + rodzaj + " nie obsługuje operacji " + metoda + "."));
          return;
        }

        try {
          obszar[metoda](argument, function poOperacji(wynik) {
            const błądRuntime = chromeApi.runtime && chromeApi.runtime.lastError;
            if (błądRuntime) {
              reject(new Error(błądRuntime.message || String(błądRuntime)));
              return;
            }
            resolve(metoda === "get" ? (wynik || {}) : undefined);
          });
        } catch (błąd) {
          reject(błąd);
        }
      });
    }

    function pobierz(rodzaj, klucze) { return wykonaj(rodzaj, "get", klucze); }
    function zapisz(rodzaj, dane) { return wykonaj(rodzaj, "set", dane); }
    function usuń(rodzaj, klucze) { return wykonaj(rodzaj, "remove", klucze); }

    return Object.freeze({
      czyDostępny: czyDostępny,
      pobierz: pobierz,
      zapisz: zapisz,
      usuń: usuń,
      pobierzLocal: function pobierzLocal(klucze) { return pobierz("local", klucze); },
      zapiszLocal: function zapiszLocal(dane) { return zapisz("local", dane); },
      usuńLocal: function usuńLocal(klucze) { return usuń("local", klucze); },
      pobierzSession: function pobierzSession(klucze) { return pobierz("session", klucze); },
      zapiszSession: function zapiszSession(dane) { return zapisz("session", dane); },
      usuńSession: function usuńSession(klucze) { return usuń("session", klucze); },
      zapiszAgregatLocal: function zapiszAgregatLocal(klucz, wartość) {
        const dane = {};
        dane[klucz] = wartość;
        return zapisz("local", dane);
      }
    });
  }

  przestrzeń.utwórzStorageApi = utwórzStorageApi;
  przestrzeń.storageApi = utwórzStorageApi();
  globalny.BurAsystent = przestrzeń;
})(typeof globalThis !== "undefined" ? globalThis : this);
