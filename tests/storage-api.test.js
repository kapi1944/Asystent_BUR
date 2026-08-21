(function testujStorageApi() {
  function utwórzChromeMock() {
    const dane = { local: {}, session: {} };
    const liczbaZapisów = { local: 0, session: 0 };
    const chromeMock = { runtime: { lastError: null }, storage: {} };

    function utwórzObszar(rodzaj) {
      return {
        get: function pobierz(klucze, odpowiedz) {
          const wynik = {};
          const lista = Array.isArray(klucze) ? klucze : [klucze];
          lista.forEach(function dodaj(klucz) {
            if (Object.prototype.hasOwnProperty.call(dane[rodzaj], klucz)) { wynik[klucz] = dane[rodzaj][klucz]; }
          });
          odpowiedz(wynik);
        },
        set: function zapisz(noweDane, odpowiedz) {
          liczbaZapisów[rodzaj] += 1;
          Object.assign(dane[rodzaj], noweDane);
          odpowiedz();
        },
        remove: function usuń(klucze, odpowiedz) {
          (Array.isArray(klucze) ? klucze : [klucze]).forEach(function usuńKlucz(klucz) { delete dane[rodzaj][klucz]; });
          odpowiedz();
        }
      };
    }

    chromeMock.storage.local = utwórzObszar("local");
    chromeMock.storage.session = utwórzObszar("session");
    return { chromeMock: chromeMock, dane: dane, liczbaZapisów: liczbaZapisów };
  }

  test("storage-api wykonuje get set i remove w local", async function sprawdźLocal() {
    const środowisko = utwórzChromeMock();
    const api = BurAsystent.utwórzStorageApi(środowisko.chromeMock);
    await api.zapiszLocal({ istniejącyKlucz: { wartość: 1 } });
    sprawdzRownosc((await api.pobierzLocal(["istniejącyKlucz"])).istniejącyKlucz.wartość, 1);
    await api.usuńLocal("istniejącyKlucz");
    sprawdzWarunek(!Object.prototype.hasOwnProperty.call(await api.pobierzLocal(["istniejącyKlucz"]), "istniejącyKlucz"));
  });

  test("storage-api obsługuje session niezależnie od local", async function sprawdźSession() {
    const środowisko = utwórzChromeMock();
    const api = BurAsystent.utwórzStorageApi(środowisko.chromeMock);
    await api.zapiszSession({ stanPaneluBur: { aktywnaZakładka: "seria" } });
    sprawdzRownosc((await api.pobierzSession(["stanPaneluBur"])).stanPaneluBur.aktywnaZakładka, "seria");
    sprawdzWarunek(!Object.prototype.hasOwnProperty.call(await api.pobierzLocal(["stanPaneluBur"]), "stanPaneluBur"));
  });

  test("storage-api zwraca pusty obiekt przy braku wartości", async function sprawdźBrakWartości() {
    const środowisko = utwórzChromeMock();
    const wynik = await BurAsystent.utwórzStorageApi(środowisko.chromeMock).pobierzLocal(["brakującyKlucz"]);
    sprawdzRownosc(Object.keys(wynik).length, 0);
  });

  test("storage-api nie ukrywa chrome.runtime.lastError", async function sprawdźBłądRuntime() {
    const środowisko = utwórzChromeMock();
    środowisko.chromeMock.storage.local.get = function pobierzZBłędem(klucze, odpowiedz) {
      środowisko.chromeMock.runtime.lastError = { message: "Kontrolowany błąd storage" };
      odpowiedz({});
      środowisko.chromeMock.runtime.lastError = null;
    };
    let komunikat = "";
    try { await BurAsystent.utwórzStorageApi(środowisko.chromeMock).pobierzLocal(["klucz"]); }
    catch (błąd) { komunikat = błąd.message; }
    sprawdzRownosc(komunikat, "Kontrolowany błąd storage");
  });

  test("storage-api zgłasza brak wymaganego obszaru", async function sprawdźBrakObszaru() {
    const środowisko = utwórzChromeMock();
    delete środowisko.chromeMock.storage.session;
    const api = BurAsystent.utwórzStorageApi(środowisko.chromeMock);
    sprawdzWarunek(!api.czyDostępny("session"));
    let zgłoszono = false;
    try { await api.pobierzSession(["stanPaneluBur"]); } catch (błąd) { zgłoszono = /session/.test(błąd.message); }
    sprawdzWarunek(zgłoszono);
  });

  test("storage-api zapisuje agregat JSON jednym set bez zmiany klucza", async function sprawdźAgregat() {
    const środowisko = utwórzChromeMock();
    const api = BurAsystent.utwórzStorageApi(środowisko.chromeMock);
    const klucz = BurAsystent.KLUCZE_STORAGE.AKTYWNA_SERIA_OGŁOSZEŃ_BUR;
    await api.zapiszAgregatLocal(klucz, { batchId: "batch-test", zadania: [{ jobId: "job-test" }] });
    sprawdzRownosc(środowisko.liczbaZapisów.local, 1);
    sprawdzRownosc(środowisko.dane.local.aktywnaSeriaOgloszenBur.batchId, "batch-test");
    sprawdzRownosc(klucz, "aktywnaSeriaOgloszenBur");
  });
})();
