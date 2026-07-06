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

      return {
        url: adres,
        tytuł: tytuł,
        punktacja: mocneDopasowanie ? 100 : 0,
        mocneDopasowanie: mocneDopasowanie
      };
    } catch (błąd) {
      return {
        url: adres,
        tytuł: zapasowyTytuł || adres,
        punktacja: 0,
        mocneDopasowanie: false,
        błąd: błąd.message
      };
    }
  }

  async function szukajŁączaSemper(fraza) {
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
      return {
        ok: false,
        błąd: "Fraza wyszukiwania jest za krótka.",
        diagnostyka: diagnostyka
      };
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

    if (bezpośredniUrl) {
      const wynik = await weryfikujŁączeSzkoleniaSemper(bezpośredniUrl, wyczyszczonaFraza, "");

      if (wynik && wynik.mocneDopasowanie) {
        return {
          ok: true,
          fraza: wyczyszczonaFraza,
          wynik: {
            url: wynik.url,
            tytuł: wynik.tytuł
          },
          diagnostyka: diagnostyka
        };
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

    const kandydaci = przestrzeń
      .wyciągnijŁączaZWyników(odpowiedźWyszukiwarki + "\n" + odpowiedźAutocomplete, wyczyszczonaFraza)
      .slice(0, 8);
    diagnostyka.liczbaKandydatów = kandydaci.length;
    pokażDiagnostykę();

    if (kandydaci.length === 0) {
      return {
        ok: false,
        fraza: wyczyszczonaFraza,
        błąd: "Nie znaleziono pewnego linku",
        diagnostyka: diagnostyka
      };
    }

    const zweryfikowane = [];

    for (let indeks = 0; indeks < kandydaci.length; indeks += 1) {
      const kandydat = kandydaci[indeks];
      const wynik = await weryfikujŁączeSzkoleniaSemper(kandydat.url, wyczyszczonaFraza, kandydat.tytuł);

      if (wynik) {
        zweryfikowane.push({
          url: wynik.url,
          tytuł: wynik.tytuł,
          punktacja: wynik.mocneDopasowanie ? Math.max(kandydat.punktacja, 90) : kandydat.punktacja
        });
      }
    }

    zweryfikowane.sort(function sortujWyniki(pierwszy, drugi) {
      return drugi.punktacja - pierwszy.punktacja;
    });

    const mocne = zweryfikowane.filter(function wybierzMocne(wynik) {
      return wynik.punktacja >= 66 && przestrzeń.czyMocneDopasowanieTytułu(wynik.tytuł, wyczyszczonaFraza);
    });

    if (mocne.length === 1) {
      return {
        ok: true,
        fraza: wyczyszczonaFraza,
        wynik: {
          url: mocne[0].url,
          tytuł: mocne[0].tytuł
        },
        diagnostyka: diagnostyka
      };
    }

    return {
      ok: true,
      fraza: wyczyszczonaFraza,
      wybory: (mocne.length ? mocne : zweryfikowane).slice(0, 8),
      diagnostyka: diagnostyka
    };
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
  przestrzeń.importujSzkolenieZŁączaSemper = importujSzkolenieZŁączaSemper;

  globalny.BurAsystent = przestrzeń;
})(globalThis);
