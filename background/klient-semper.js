(function zarejestrujKlientaSemper(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const limitCzasuFetchSemper = 30000;

  async function fetchSemperZTimeoutem(url, ustawienia) {
    const kontroler = new AbortController();
    const timer = setTimeout(function przerwijFetch() {
      kontroler.abort();
    }, limitCzasuFetchSemper);

    try {
      return await fetch(url, Object.assign({}, ustawienia || {}, {
        signal: kontroler.signal
      }));
    } finally {
      clearTimeout(timer);
    }
  }

  async function pobierzHtmlSzkoleniaSemper(url) {
    const adres = przestrzeń.normalizujŁączeSemper(url);

    if (!przestrzeń.czyŁączeSzczegółówSzkolenia(adres)) {
      throw new Error("To nie wygląda na link szczegółów szkolenia SEMPER.");
    }

    const odpowiedź = await fetchSemperZTimeoutem(adres, {
      method: "GET",
      credentials: "omit"
    });

    if (!odpowiedź.ok) {
      throw new Error("SEMPER zwrócił błąd HTTP " + odpowiedź.status + ".");
    }

    return odpowiedź.text();
  }

  async function wyślijPostDoSempera(url, dane) {
    const odpowiedź = await fetchSemperZTimeoutem(url, {
      method: "POST",
      credentials: "omit",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: new URLSearchParams(dane || {}).toString()
    });

    if (!odpowiedź.ok) {
      throw new Error("SEMPER zwrócił błąd HTTP " + odpowiedź.status + ".");
    }

    return odpowiedź.text();
  }

  function odczytajTytułZHtml(html) {
    const tekst = String(html || "");
    const h1 = tekst.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    const title = tekst.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    const źródło = h1 ? h1[1] : title ? title[1] : "";

    return przestrzeń.oczyśćLinię(
      przestrzeń.odkodujHtmlWyszukiwania(źródło.replace(/<[^>]+>/g, " "))
    );
  }

  async function weryfikujŁączeSzkoleniaSemper(url, fraza, zapasowyTytuł) {
    const adres = przestrzeń.normalizujŁączeSemper(url);

    if (!przestrzeń.czyŁączeSzczegółówSzkolenia(adres)) {
      return null;
    }

    try {
      const html = await pobierzHtmlSzkoleniaSemper(adres);
      const tytuł = odczytajTytułZHtml(html) || zapasowyTytuł || adres;
      const mocneDopasowanie = przestrzeń.czyMocneDopasowanieTytułu(tytuł, fraza);

      if (!mocneDopasowanie) {
        return null;
      }

      return {
        url: adres,
        tytuł: tytuł,
        title: tytuł
      };
    } catch (błąd) {
      if (!zapasowyTytuł || !przestrzeń.czyMocneDopasowanieTytułu(zapasowyTytuł, fraza)) {
        return null;
      }

      return {
        url: adres,
        tytuł: zapasowyTytuł || adres,
        title: zapasowyTytuł || adres,
        błąd: błąd.message
      };
    }
  }

  async function znajdzLinkSzkoleniaSemperPoTytule(fraza) {
    const wyczyszczonaFraza = przestrzeń.tytułPrzedPierwsząInterpunkcją(przestrzeń.oczyśćLinię(fraza));
    const diagnostyka = {
      fraza: wyczyszczonaFraza,
      wykonanoAjaxSzukaj: false,
      długośćOdpowiedziDirect: 0,
      wykonanoAjaxSzukajAuto: false,
      długośćOdpowiedziAutocomplete: 0,
      liczbaKandydatów: 0
    };

    function pokażDiagnostykę() {
      if (typeof console !== "undefined" && console.info) {
        console.info("BUR Asystent SEMPER diagnostyka", diagnostyka);
      }
    }

    if (wyczyszczonaFraza.length < 3) {
      throw new Error("Fraza wyszukiwania jest za krótka.");
    }

    const dane = {
      opc: "szukaj",
      co: wyczyszczonaFraza
    };
    const adresWyszukiwarki = "https://www.szkolenia-semper.pl/__ajax/_ajax_szukaj.php";
    const adresAutocomplete = "https://www.szkolenia-semper.pl/__ajax/_ajax_szukaj_auto.php";
    let odpowiedźWyszukiwarki = "";

    try {
      diagnostyka.wykonanoAjaxSzukaj = true;
      odpowiedźWyszukiwarki = await wyślijPostDoSempera(adresWyszukiwarki, dane);
      diagnostyka.długośćOdpowiedziDirect = odpowiedźWyszukiwarki.length;
    } catch (błąd) {
      odpowiedźWyszukiwarki = "";
      diagnostyka.błądDirect = błąd && błąd.message ? błąd.message : "Błąd pobierania direct.";
    }

    const bezpośredniUrl = przestrzeń.odczytajŁączeZJsonaWyszukiwarki(odpowiedźWyszukiwarki);

    if (bezpośredniUrl && przestrzeń.czyŁączeSzczegółówSzkolenia(bezpośredniUrl)) {
      const wynik = await weryfikujŁączeSzkoleniaSemper(bezpośredniUrl, wyczyszczonaFraza, "");

      if (wynik) {
        wynik.diagnostyka = diagnostyka;
        return wynik;
      }
    }

    let odpowiedźAutocomplete = "";

    try {
      diagnostyka.wykonanoAjaxSzukajAuto = true;
      odpowiedźAutocomplete = await wyślijPostDoSempera(adresAutocomplete, dane);
      diagnostyka.długośćOdpowiedziAutocomplete = odpowiedźAutocomplete.length;
    } catch (błąd) {
      odpowiedźAutocomplete = "";
      diagnostyka.błądAutocomplete = błąd && błąd.message ? błąd.message : "Błąd pobierania autocomplete.";
    }

    if (!odpowiedźWyszukiwarki && !odpowiedźAutocomplete && (diagnostyka.błądDirect || diagnostyka.błądAutocomplete)) {
      throw new Error("Nie udało się wyszukać szkolenia na SEMPER.");
    }

    const kandydaci = przestrzeń.wyciągnijŁączaZWyników(odpowiedźAutocomplete, wyczyszczonaFraza);
    diagnostyka.liczbaKandydatów = kandydaci.length;
    pokażDiagnostykę();

    if (kandydaci.length === 0) {
      return null;
    }

    const mocne = kandydaci.filter(function wybierzMocne(kandydat) {
      return przestrzeń.czyMocneDopasowanieTytułu(kandydat.tytuł, wyczyszczonaFraza);
    });

    if (mocne.length > 1) {
      return {
        choices: mocne.slice(0, 8),
        wybory: mocne.slice(0, 8),
        diagnostyka: diagnostyka
      };
    }

    if (mocne.length === 1) {
      const wynik = await weryfikujŁączeSzkoleniaSemper(mocne[0].url, wyczyszczonaFraza, mocne[0].tytuł);

      if (wynik) {
        wynik.diagnostyka = diagnostyka;
        return wynik;
      }
    }

    if (kandydaci.length === 1) {
      const wynik = await weryfikujŁączeSzkoleniaSemper(kandydaci[0].url, wyczyszczonaFraza, kandydaci[0].tytuł);

      if (wynik) {
        wynik.diagnostyka = diagnostyka;
        return wynik;
      }
    }

    return {
      choices: kandydaci.slice(0, 8),
      wybory: kandydaci.slice(0, 8),
      diagnostyka: diagnostyka
    };
  }

  async function szukajŁączaSemper(fraza) {
    const diagnostykaStartowa = {
      fraza: przestrzeń.tytułPrzedPierwsząInterpunkcją(przestrzeń.oczyśćLinię(fraza)),
      liczbaKandydatów: 0
    };

    try {
      const wynik = await znajdzLinkSzkoleniaSemperPoTytule(fraza);
      const diagnostyka = wynik && wynik.diagnostyka ? wynik.diagnostyka : diagnostykaStartowa;

      if (!wynik) {
        return {
          ok: false,
          fraza: diagnostyka.fraza,
          błąd: "Nie znaleziono pewnego linku SEMPER.",
          diagnostyka: diagnostyka
        };
      }

      if (wynik.choices || wynik.wybory) {
        return {
          ok: true,
          fraza: diagnostyka.fraza,
          wybory: wynik.choices || wynik.wybory,
          diagnostyka: diagnostyka
        };
      }

      return {
        ok: true,
        fraza: diagnostyka.fraza,
        wynik: {
          url: wynik.url,
          tytuł: wynik.tytuł || wynik.title || wynik.url,
          title: wynik.title || wynik.tytuł || wynik.url
        },
        diagnostyka: diagnostyka
      };
    } catch (błąd) {
      return {
        ok: false,
        fraza: diagnostykaStartowa.fraza,
        błąd: błąd && błąd.message ? błąd.message : "Nie udało się wyszukać szkolenia na SEMPER.",
        diagnostyka: diagnostykaStartowa
      };
    }
  }

  async function importujSzkolenieZŁączaSemper(url) {
    const adres = przestrzeń.normalizujŁączeSemper(url);

    if (!przestrzeń.czyŁączeSzczegółówSzkolenia(adres)) {
      return {
        ok: false,
        błąd: "Podany adres nie jest linkiem szczegółów szkolenia SEMPER."
      };
    }

    const html = await pobierzHtmlSzkoleniaSemper(adres);

    return {
      ok: true,
      url: adres,
      html: html
    };
  }

  przestrzeń.pobierzHtmlSzkoleniaSemper = pobierzHtmlSzkoleniaSemper;
  przestrzeń.wyślijPostDoSempera = wyślijPostDoSempera;
  przestrzeń.szukajŁączaSemper = szukajŁączaSemper;
  przestrzeń.weryfikujŁączeSzkoleniaSemper = weryfikujŁączeSzkoleniaSemper;
  przestrzeń.verifyTrainingLink = weryfikujŁączeSzkoleniaSemper;
  przestrzeń.znajdzLinkSzkoleniaSemperPoTytule = znajdzLinkSzkoleniaSemperPoTytule;
  przestrzeń.importujSzkolenieZŁączaSemper = importujSzkolenieZŁączaSemper;

  globalny.BurAsystent = przestrzeń;
})(globalThis);
