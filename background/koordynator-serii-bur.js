(function zarejestrujKoordynatorSeriiBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const KLUCZ_SERII = "aktywnaSeriaOgloszenBur";
  const MAKSYMALNA_LICZBA_PRÓB = 3;
  const PLIKI_CONTENT_BUR = [
    "shared/profile-dostawcow.js", "shared/komunikaty.js", "shared/cele-formularza-bur.js",
    "shared/model-walidacji.js", "shared/normalizacja-tytulu.js", "shared/daty.js",
    "shared/terminy-bur.js", "shared/stan-operacji-bur.js", "shared/szablony-harmonogramow.js",
    "shared/seria-ogloszen-bur.js",
    "shared/bur-program-harmonogram.js", "shared/wyszukiwarka-semper.js", "shared/selektory-bur.js",
    "shared/walidatory-bur.js", "shared/definicje-pol-bur.js", "shared/przygotowanie-wypelnienia-bur.js",
    "shared/wypełniacz-bur.js", "content/bur-content.js"
  ];

  function utwórzKoordynatorSeriiBur(api) {
    const zależności = api || {};
    let aktywnaSeria = null;
    let inicjalizacja = null;

    function teraz() { return new Date().toISOString(); }
    function komunikatBłędu(błąd) { return błąd && błąd.message ? błąd.message : String(błąd || "Nieznany błąd."); }

    function wywołajStorage(obsługiwanyStorage, metoda, argument) {
      if (!obsługiwanyStorage || typeof obsługiwanyStorage[metoda] !== "function") { return Promise.resolve(metoda === "get" ? {} : undefined); }
      return new Promise(function wykonaj(resolve, reject) {
        obsługiwanyStorage[metoda](argument, function poWykonaniu(wynik) {
          const błąd = globalny.chrome && globalny.chrome.runtime && globalny.chrome.runtime.lastError;
          if (błąd) { reject(new Error(błąd.message)); return; }
          resolve(wynik);
        });
      });
    }

    function pobierzStorage(rodzaj, klucz) {
      if (zależności.pobierzStorage) { return Promise.resolve(zależności.pobierzStorage(rodzaj, klucz)); }
      return wywołajStorage(globalny.chrome.storage && globalny.chrome.storage[rodzaj], "get", [klucz]);
    }

    function zapiszStorage(rodzaj, dane) {
      if (zależności.zapiszStorage) { return Promise.resolve(zależności.zapiszStorage(rodzaj, dane)); }
      return wywołajStorage(globalny.chrome.storage && globalny.chrome.storage[rodzaj], "set", dane);
    }

    function utwórzKartę(url) {
      if (zależności.utwórzKartę) { return Promise.resolve(zależności.utwórzKartę({ url: url, active: false })); }
      return new Promise(function wykonaj(resolve, reject) {
        globalny.chrome.tabs.create({ url: url, active: false }, function poUtworzeniu(karta) {
          if (globalny.chrome.runtime.lastError) { reject(new Error(globalny.chrome.runtime.lastError.message)); return; }
          resolve(karta);
        });
      });
    }

    function pobierzKartę(tabId) {
      if (zależności.pobierzKartę) { return Promise.resolve(zależności.pobierzKartę(tabId)); }
      return new Promise(function wykonaj(resolve) {
        globalny.chrome.tabs.get(tabId, function poOdczycie(karta) {
          resolve(globalny.chrome.runtime.lastError ? null : karta);
        });
      });
    }

    function pobierzAktywnąKartę() {
      if (zależności.pobierzAktywnąKartę) { return Promise.resolve(zależności.pobierzAktywnąKartę()); }
      return new Promise(function wykonaj(resolve) {
        globalny.chrome.tabs.query({ active: true, currentWindow: true }, function poOdczycie(karty) { resolve(karty && karty[0] || null); });
      });
    }

    function wyślijDoKarty(tabId, wiadomość) {
      if (zależności.wyślijDoKarty) { return Promise.resolve(zależności.wyślijDoKarty(tabId, wiadomość)); }
      return new Promise(function wykonaj(resolve, reject) {
        globalny.chrome.tabs.sendMessage(tabId, wiadomość, function poOdpowiedzi(odpowiedź) {
          if (globalny.chrome.runtime.lastError) { reject(new Error(globalny.chrome.runtime.lastError.message)); return; }
          resolve(odpowiedź);
        });
      });
    }

    function wstrzyknijSkrypt(tabId) {
      if (zależności.wstrzyknijSkrypt) { return Promise.resolve(zależności.wstrzyknijSkrypt(tabId)); }
      if (!globalny.chrome.scripting || !globalny.chrome.scripting.executeScript) { return Promise.reject(new Error("Brak bezpiecznego mechanizmu wstrzyknięcia content scriptu.")); }
      return globalny.chrome.scripting.executeScript({ target: { tabId: tabId }, files: PLIKI_CONTENT_BUR });
    }

    function zapiszStan() {
      if (!aktywnaSeria) { return Promise.resolve(); }
      aktywnaSeria.zaktualizowano = teraz();
      const dane = {}; dane[KLUCZ_SERII] = aktywnaSeria;
      return Promise.all([
        zapiszStorage("local", dane),
        globalny.chrome && globalny.chrome.storage && globalny.chrome.storage.session !== undefined || zależności.pobierzStorage
          ? zapiszStorage("session", dane).catch(function pomińBrakSesji() {})
          : Promise.resolve()
      ]).then(function zakończ() { return aktywnaSeria; });
    }

    function ustawEtap(zadanie, etap, status, błąd) {
      zadanie.etap = etap;
      zadanie.status = status || etap;
      zadanie.zaktualizowano = teraz();
      if (błąd) { zadanie.bledy = [komunikatBłędu(błąd)]; }
      return zapiszStan();
    }

    async function zapewnijContentScript(tabId) {
      let ostatniBłąd = null;
      for (let próba = 1; próba <= MAKSYMALNA_LICZBA_PRÓB; próba += 1) {
        try {
          const pong = await wyślijDoKarty(tabId, { typ: przestrzeń.KOMUNIKATY.PING_SKRYPTU_STRONY });
          if (pong && pong.ok && pong.typ === przestrzeń.KOMUNIKATY.PONG_SKRYPTU_STRONY) { return pong; }
        } catch (błąd) { ostatniBłąd = błąd; }
        if (próba === 1) {
          try { await wstrzyknijSkrypt(tabId); } catch (błądWstrzyknięcia) { ostatniBłąd = błądWstrzyknięcia; }
        }
      }
      throw ostatniBłąd || new Error("Content script BUR nie odpowiedział na PING.");
    }

    async function sprawdźKartę(tabId) {
      await zapewnijContentScript(tabId);
      const odpowiedź = await wyślijDoKarty(tabId, { typ: przestrzeń.KOMUNIKATY.SPRAWDZ_KARTE_SERII_BUR });
      if (!odpowiedź || !odpowiedź.wynik) { throw new Error("Nie otrzymano raportu gotowości karty BUR."); }
      return odpowiedź.wynik;
    }

    function walidujRaportKarty(raport, sposób) {
      const błędy = [];
      if (!raport.kontoBur || raport.kontoBur.profilId !== "iist") { błędy.push("Karta nie jest otwarta na koncie BUR IIST."); }
      if (sposób === "nowe_formularze") {
        if (raport.typFormularza !== "dodawanie_uslugi") { błędy.push("Karta nie jest formularzem dodawania usługi."); }
        if (!raport.czyPustyFormularz) { błędy.push("Formularz nie jest pusty."); }
      }
      return błędy;
    }

    async function sprawdźGotowość(sposób) {
      const karta = await pobierzAktywnąKartę();
      if (!karta || !/^https:\/\/[^/]*uslugirozwojowe\.parp\.gov\.pl\//i.test(karta.url || "")) { throw new Error("Otwórz kartę BUR do sprawdzenia gotowości."); }
      const raport = await sprawdźKartę(karta.id);
      const tryb = sposób || "nowe_formularze";
      const błędy = walidujRaportKarty(raport, tryb);
      if (tryb === "kopiowanie_z_wzorca") {
        if (!raport.wzorzecKopiowania || !raport.wzorzecKopiowania.numerUslugi || !raport.wzorzecKopiowania.jednoznacznaAkcjaKopiowania) {
          błędy.push("Nie rozpoznano jednego wzorca z jednoznaczną akcją kopiowania.");
        }
        if (!raport.wzorzecKopiowania || !raport.wzorzecKopiowania.kopieBezposrednioZTegoSamegoWzorca) {
          błędy.push("Nie potwierdzono bezpośredniego kopiowania z tego samego wzorca.");
        }
      }
      return { ok: błędy.length === 0, sposóbTworzeniaKart: tryb, kartaBazowa: karta, raport: raport, błędy: błędy };
    }

    async function sprawdźNiezależnośćFormularzy() {
      if (!aktywnaSeria || aktywnaSeria.sposobTworzeniaKart !== "nowe_formularze") { return true; }
      const gotowe = aktywnaSeria.zadania.filter(function wybierz(zadanie) { return zadanie.status === "karta_gotowa"; });
      if (gotowe.length !== aktywnaSeria.zadania.length) { return false; }
      const odciski = gotowe.map(function pobierz(zadanie) { return zadanie.raport && zadanie.raport.odciskInstancjiFormularza || ""; });
      const niezależne = odciski.every(Boolean) && new Set(odciski).size === odciski.length;
      if (!niezależne) {
        aktywnaSeria.status = "wymaga_decyzji";
        aktywnaSeria.zatrzymanaPrzyczyna = "Nie potwierdzono niezależności pustych formularzy. Seria została zatrzymana bez modyfikowania kart.";
        gotowe.forEach(function zatrzymaj(zadanie) {
          zadanie.etap = "wymaga_decyzji"; zadanie.status = "wymaga_decyzji";
          zadanie.bledy = [aktywnaSeria.zatrzymanaPrzyczyna]; zadanie.zaktualizowano = teraz();
        });
        await zapiszStan();
        return false;
      }
      aktywnaSeria.status = "karta_gotowa";
      await zapiszStan();
      return true;
    }

    async function przygotujKartęZadania(zadanie) {
      if (!zadanie || zadanie.status === "anulowane" || !zadanie.tabId) { return aktywnaSeria; }
      zadanie.proby += 1;
      try {
        await ustawEtap(zadanie, "oczekiwanie_na_content_script");
        await zapewnijContentScript(zadanie.tabId);
        await ustawEtap(zadanie, "kontrola_konta");
        const raport = await wyślijDoKarty(zadanie.tabId, { typ: przestrzeń.KOMUNIKATY.SPRAWDZ_KARTE_SERII_BUR });
        const wynik = raport && raport.wynik;
        const błędy = wynik ? walidujRaportKarty(wynik, aktywnaSeria.sposobTworzeniaKart) : ["Brak raportu karty BUR."];
        zadanie.raport = wynik || null;
        zadanie.wynikWalidacji = { ok: błędy.length === 0, błędy: błędy };
        zadanie.typFormularza = wynik && wynik.typFormularza || "nierozpoznany";
        zadanie.urlKarty = wynik && wynik.url || zadanie.urlKarty;
        if (błędy.length) { await ustawEtap(zadanie, "blad", "blad", błędy.join(" ")); return aktywnaSeria; }
        zadanie.bledy = [];
        await ustawEtap(zadanie, "karta_gotowa");
        await sprawdźNiezależnośćFormularzy();
      } catch (błąd) {
        await ustawEtap(zadanie, "blad", "blad", błąd);
      }
      return aktywnaSeria;
    }

    async function otwórzKartęDlaZadania(zadanie) {
      if (zadanie.tabId) {
        const istniejąca = await pobierzKartę(zadanie.tabId);
        if (istniejąca) { return istniejąca; }
      }
      await ustawEtap(zadanie, "otwieranie_karty");
      const karta = await utwórzKartę(aktywnaSeria.urlFormularzaBazowego);
      zadanie.tabId = karta.id;
      zadanie.urlKarty = karta.url || aktywnaSeria.urlFormularzaBazowego;
      await ustawEtap(zadanie, "oczekiwanie_na_zaladowanie");
      if (karta.status === "complete") { await przygotujKartęZadania(zadanie); }
      return karta;
    }

    async function utwórzSerię(dane) {
      if (!dane || dane.profilId !== "iist") { throw new Error("Seria ogłoszeń jest dostępna wyłącznie dla aktywnego profilu IIST."); }
      const preflight = await sprawdźGotowość(dane.sposobTworzeniaKart);
      if (!preflight.ok) { return { ok: false, preflight: preflight, seria: aktywnaSeria }; }
      if (dane.sposobTworzeniaKart === "kopiowanie_z_wzorca") {
        return { ok: false, preflight: preflight, seria: aktywnaSeria, błąd: "Tryb kopiowania został rozpoznany, ale tworzenie kopii jest celowo wyłączone na tym etapie." };
      }
      aktywnaSeria = przestrzeń.utwórzSerięOgłoszeńBur(Object.assign({}, dane, {
        urlFormularzaBazowego: preflight.kartaBazowa.url,
        wzorzecKopiowania: preflight.raport.wzorzecKopiowania || null
      }));
      inicjalizacja = Promise.resolve(aktywnaSeria);
      if (!aktywnaSeria.zadania.length) { throw new Error("Wybierz co najmniej jeden poprawny termin IIST."); }
      aktywnaSeria.status = "otwieranie_karty";
      await zapiszStan();
      await Promise.all(aktywnaSeria.zadania.map(otwórzKartęDlaZadania));
      return { ok: true, preflight: preflight, seria: aktywnaSeria };
    }

    async function anulujSerię() {
      if (!aktywnaSeria) { return null; }
      aktywnaSeria.status = "anulowane";
      aktywnaSeria.zadania.forEach(function anuluj(zadanie) {
        if (zadanie.status !== "karta_zamknieta") { zadanie.status = "anulowane"; zadanie.etap = "anulowane"; zadanie.zaktualizowano = teraz(); }
      });
      return zapiszStan();
    }

    async function ponówZadanie(jobId) {
      const zadanie = aktywnaSeria && aktywnaSeria.zadania.find(function znajdź(pozycja) { return pozycja.jobId === jobId; });
      if (!zadanie) { throw new Error("Nie znaleziono zadania serii."); }
      zadanie.bledy = [];
      const karta = zadanie.tabId && await pobierzKartę(zadanie.tabId);
      if (!karta) { zadanie.tabId = null; return otwórzKartęDlaZadania(zadanie).then(function zakończ() { return aktywnaSeria; }); }
      return przygotujKartęZadania(zadanie);
    }

    async function otwórzZadanie(jobId) {
      const zadanie = aktywnaSeria && aktywnaSeria.zadania.find(function znajdź(pozycja) { return pozycja.jobId === jobId; });
      if (!zadanie || !zadanie.tabId) { throw new Error("Zadanie nie ma otwartej karty."); }
      if (zależności.aktywujKartę) { await zależności.aktywujKartę(zadanie.tabId); }
      else { await globalny.chrome.tabs.update(zadanie.tabId, { active: true }); }
      return aktywnaSeria;
    }

    async function odświeżStanKart() {
      if (!aktywnaSeria) { return null; }
      for (const zadanie of aktywnaSeria.zadania) {
        if (!zadanie.tabId || zadanie.status === "anulowane") { continue; }
        const karta = await pobierzKartę(zadanie.tabId);
        if (!karta) { zadanie.status = "karta_zamknieta"; zadanie.etap = "karta_zamknieta"; continue; }
        zadanie.urlKarty = karta.url || zadanie.urlKarty;
        if (karta.status === "complete") { await przygotujKartęZadania(zadanie); }
      }
      await zapiszStan();
      return aktywnaSeria;
    }

    async function odtwórzStan() {
      const sesja = await pobierzStorage("session", KLUCZ_SERII).catch(function brak() { return {}; });
      const lokalny = sesja && sesja[KLUCZ_SERII] ? sesja : await pobierzStorage("local", KLUCZ_SERII).catch(function brak() { return {}; });
      aktywnaSeria = lokalny && lokalny[KLUCZ_SERII] || null;
      if (!aktywnaSeria) { return null; }
      await odświeżStanKart();
      return aktywnaSeria;
    }

    function inicjalizuj() {
      if (!inicjalizacja) { inicjalizacja = odtwórzStan(); }
      return inicjalizacja;
    }

    async function poZaładowaniuKarty(tabId, zmiana) {
      await inicjalizuj();
      if (!aktywnaSeria || !zmiana || zmiana.status !== "complete") { return; }
      const zadanie = przestrzeń.znajdźZadaniePoKarcie(aktywnaSeria, tabId);
      if (zadanie && ["oczekiwanie_na_zaladowanie", "oczekiwanie_na_content_script", "blad"].includes(zadanie.status)) {
        await przygotujKartęZadania(zadanie);
      }
    }

    async function poZamknięciuKarty(tabId) {
      await inicjalizuj();
      const zadanie = przestrzeń.znajdźZadaniePoKarcie(aktywnaSeria, tabId);
      if (zadanie && zadanie.status !== "anulowane") { await ustawEtap(zadanie, "karta_zamknieta"); }
    }

    return {
      inicjalizuj: inicjalizuj, pobierzStan: function pobierz() { return aktywnaSeria; }, sprawdźGotowość: sprawdźGotowość,
      utwórzSerię: utwórzSerię, anulujSerię: anulujSerię, ponówZadanie: ponówZadanie,
      otwórzZadanie: otwórzZadanie, odświeżStanKart: odświeżStanKart,
      poZaładowaniuKarty: poZaładowaniuKarty, poZamknięciuKarty: poZamknięciuKarty,
      przygotujKartęZadania: przygotujKartęZadania
    };
  }

  przestrzeń.KLUCZ_SERII_BUR = KLUCZ_SERII;
  przestrzeń.utwórzKoordynatorSeriiBur = utwórzKoordynatorSeriiBur;
  globalny.BurAsystent = przestrzeń;

  if (globalny.chrome && globalny.chrome.tabs && globalny.chrome.storage && globalny.chrome.runtime) {
    const koordynator = utwórzKoordynatorSeriiBur();
    przestrzeń.koordynatorSeriiBur = koordynator;
    koordynator.inicjalizuj().catch(function pomińBłądStartu() {});
    globalny.chrome.tabs.onUpdated.addListener(function poAktualizacji(tabId, zmiana) { koordynator.poZaładowaniuKarty(tabId, zmiana); });
    globalny.chrome.tabs.onRemoved.addListener(function poZamknięciu(tabId) { koordynator.poZamknięciuKarty(tabId); });
    globalny.chrome.runtime.onMessage.addListener(function obsłużSerię(wiadomość, nadawca, odpowiedz) {
      const komunikaty = przestrzeń.KOMUNIKATY;
      if (!wiadomość || ![
        komunikaty.SPRAWDZ_GOTOWOSC_SERII_BUR, komunikaty.UTWORZ_SERIE_OGLOSZEN_BUR,
        komunikaty.POBIERZ_STAN_SERII_BUR, komunikaty.ANULUJ_SERIE_BUR,
        komunikaty.PONOW_ZADANIE_SERII_BUR, komunikaty.OTWORZ_KARTE_ZADANIA_BUR
      ].includes(wiadomość.typ)) { return false; }
      let operacja;
      if (wiadomość.typ === komunikaty.SPRAWDZ_GOTOWOSC_SERII_BUR) { operacja = koordynator.sprawdźGotowość(wiadomość.sposobTworzeniaKart); }
      else if (wiadomość.typ === komunikaty.UTWORZ_SERIE_OGLOSZEN_BUR) { operacja = koordynator.utwórzSerię(wiadomość.dane); }
      else if (wiadomość.typ === komunikaty.ANULUJ_SERIE_BUR) { operacja = koordynator.anulujSerię(); }
      else if (wiadomość.typ === komunikaty.PONOW_ZADANIE_SERII_BUR) { operacja = koordynator.ponówZadanie(wiadomość.jobId); }
      else if (wiadomość.typ === komunikaty.OTWORZ_KARTE_ZADANIA_BUR) { operacja = koordynator.otwórzZadanie(wiadomość.jobId); }
      else { operacja = wiadomość.odśwież ? koordynator.odświeżStanKart() : koordynator.inicjalizuj().then(function zwróć() { return koordynator.pobierzStan(); }); }
      Promise.resolve(operacja).then(function sukces(wynik) {
        odpowiedz({ typ: komunikaty.ODPOWIEDZ_SERIA_OGLOSZEN_BUR, ok: true, wynik: wynik });
      }).catch(function błąd(wyjątek) {
        odpowiedz({ typ: komunikaty.ODPOWIEDZ_SERIA_OGLOSZEN_BUR, ok: false, błąd: komunikatBłędu(wyjątek) });
      });
      return true;
    });
  }
})(globalThis);
