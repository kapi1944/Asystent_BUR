(function zarejestrujWyszukiwarkęSemper(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const małoWażneSłowa = new Set([
    "a",
    "i",
    "oraz",
    "wraz",
    "wedlug",
    "według",
    "praktyczne",
    "praktyczny",
    "kompleksowe",
    "kompleksowy",
    "warsztaty",
    "warsztatowe",
    "szkolenie",
    "szkolenia",
    "kurs",
    "dla",
    "nad",
    "pod",
    "oraz",
    "w",
    "we",
    "z",
    "ze",
    "na",
    "do",
    "od",
    "po"
  ]);

  function oczyśćLinię(wartość) {
    return String(wartość || "")
      .replace(/\s+/g, " ")
      .replace(/^[\s•·*▪►-]+/, "")
      .replace(/\s+([.,;:!?])/g, "$1")
      .trim();
  }

  function normalizujDoPorównania(wartość) {
    return String(wartość || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ł/g, "l")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tytułPrzedPierwsząInterpunkcją(tytuł) {
    const znaczniki = [
      { skrót: "m.in.", znacznik: "m§in§" },
      { skrót: "ds.", znacznik: "ds§" }
    ];
    let tekst = oczyśćLinię(tytuł);

    znaczniki.forEach(function chrońSkrót(wpis) {
      tekst = tekst.replace(new RegExp(wpis.skrót.replace(/\./g, "\\."), "gi"), wpis.znacznik);
    });

    const indeks = tekst.search(/[.,;:!?|…–—-]/);
    let wynik = indeks >= 0 ? tekst.slice(0, indeks) : tekst;

    znaczniki.forEach(function przywróćSkrót(wpis) {
      wynik = wynik.replace(new RegExp(wpis.znacznik, "g"), wpis.skrót);
    });

    return oczyśćLinię(wynik);
  }

  function ważneSłowaWyszukiwania(wartość) {
    const znormalizowany = normalizujDoPorównania(wartość);

    return znormalizowany
      .split(" ")
      .filter(function filtrujSłowo(słowo) {
        return słowo.length >= 3 && !małoWażneSłowa.has(słowo);
      });
  }

  function czyMocneDopasowanieTytułu(tytuł, fraza) {
    const słowaFrazy = ważneSłowaWyszukiwania(fraza);
    const słowaTytułu = new Set(ważneSłowaWyszukiwania(tytułPrzedPierwsząInterpunkcją(tytuł)));

    if (słowaFrazy.length === 0 || !słowaTytułu.has(słowaFrazy[0])) {
      return false;
    }

    const trafione = słowaFrazy.filter(function sprawdźSłowo(słowo) {
      return słowaTytułu.has(słowo);
    }).length;

    if (słowaFrazy.length > 1 && trafione < 2) {
      return false;
    }

    return trafione / słowaFrazy.length >= 0.66;
  }

  function zbudujBezwzględneŁączeSemper(wartość) {
    const tekst = oczyśćLinię(wartość);

    if (!tekst) {
      return "";
    }

    try {
      return new URL(tekst, "https://www.szkolenia-semper.pl/").href;
    } catch (błąd) {
      return "";
    }
  }

  function czyŁączeSzczegółówSzkolenia(url) {
    const łącze = zbudujBezwzględneŁączeSemper(url);

    if (!/^https:\/\/(www\.)?szkolenia-semper\.pl\//i.test(łącze)) {
      return false;
    }

    return /\/component\/trainings\/details\/(?:szkolenie,\d+\.html|[^/?#]+,\d+(?:\.html|,html))(?:[?#].*)?$/i.test(łącze);
  }

  function odkodujHtmlWyszukiwania(wartość) {
    return String(wartość || "")
      .replace(/&#(\d+);/g, function odkodujDziesiętnie(całość, kod) {
        return String.fromCharCode(Number(kod));
      })
      .replace(/&#x([0-9a-f]+);/gi, function odkodujSzesnastkowo(całość, kod) {
        return String.fromCharCode(parseInt(kod, 16));
      })
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }

  function odkodujDataUrl(wartość) {
    const tekst = String(wartość || "").trim();

    try {
      if (/%[0-9a-f]{2}/i.test(tekst)) {
        return decodeURIComponent(tekst);
      }
    } catch (błąd) {
      return tekst;
    }

    if (
      tekst.length >= 12 &&
      tekst.length % 4 === 0 &&
      /^[A-Za-z0-9+/]+={0,2}$/.test(tekst) &&
      typeof atob === "function"
    ) {
      try {
        return decodeURIComponent(escape(atob(tekst)));
      } catch (błąd) {
        try {
          return atob(tekst);
        } catch (błądAtob) {}
      }
    }

    return tekst;
  }

  function rozpakujOdpowiedźWyszukiwania(wartość) {
    if (wartość === null || wartość === undefined) {
      return "";
    }

    if (typeof wartość === "string") {
      const tekst = wartość.trim();

      if (/^["[{]/.test(tekst)) {
        try {
          const dane = JSON.parse(tekst);
          return rozpakujOdpowiedźWyszukiwania(dane);
        } catch (błąd) {}
      }

      return odkodujHtmlWyszukiwania(tekst);
    }

    if (Array.isArray(wartość)) {
      return wartość.map(rozpakujOdpowiedźWyszukiwania).join("\n");
    }

    if (typeof wartość === "object") {
      return Object.keys(wartość).map(function odczytajKlucz(klucz) {
        return rozpakujOdpowiedźWyszukiwania(wartość[klucz]);
      }).join("\n");
    }

    return String(wartość || "");
  }

  function odkodujHtmlAutocomplete(wartość) {
    const tekst = String(wartość || "");

    try {
      const dane = JSON.parse(tekst);

      if (typeof dane === "string") {
        return dane;
      }
    } catch (błąd) {}

    return tekst;
  }

  function odczytajTytułZFragmentu(fragment) {
    const bezZnaczników = odkodujHtmlWyszukiwania(fragment)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ");

    return oczyśćLinię(bezZnaczników);
  }

  function policzPunktację(tytuł, fraza, url) {
    const słowaFrazy = ważneSłowaWyszukiwania(fraza);
    const słowaTytułu = new Set(ważneSłowaWyszukiwania(tytuł + " " + url));

    if (słowaFrazy.length === 0) {
      return 0;
    }

    const trafione = słowaFrazy.filter(function sprawdźSłowo(słowo) {
      return słowaTytułu.has(słowo);
    }).length;

    return trafione;
  }

  function dodajKandydata(mapa, url, tytuł, fraza) {
    const adres = normalizujŁączeSemper(url);
    const czystyTytuł = oczyśćLinię(odkodujHtmlWyszukiwania(tytuł || ""));

    if (!czyŁączeSzczegółówSzkolenia(adres) || !czystyTytuł) {
      return;
    }

    const punktacja = policzPunktację(czystyTytuł, fraza, adres);

    if (punktacja <= 0) {
      return;
    }

    const kandydat = {
      url: adres,
      tytuł: czystyTytuł,
      title: czystyTytuł,
      punktacja: punktacja,
      score: punktacja
    };
    const poprzedni = mapa.get(adres);

    if (!poprzedni || kandydat.punktacja > poprzedni.punktacja || kandydat.tytuł.length > poprzedni.tytuł.length) {
      mapa.set(adres, kandydat);
    }
  }

  function wyciągnijŁączaPrzezDomParser(html, fraza, mapa) {
    if (typeof DOMParser !== "function") {
      return;
    }

    const dokument = new DOMParser().parseFromString(odkodujHtmlAutocomplete(html), "text/html");

    Array.from(dokument.querySelectorAll("a[href], a[data-url]")).forEach(function odczytajLink(link) {
      const dataUrl = link.getAttribute("data-url") || "";
      const href = link.getAttribute("href") || "";
      const url = dataUrl ? odkodujDataUrl(dataUrl) : href;
      const tytuł = link.getAttribute("title") || link.textContent || url;

      dodajKandydata(mapa, url, tytuł, fraza);
    });
  }

  function wyciągnijŁączaZWyników(html, fraza) {
    const tekst = odkodujHtmlWyszukiwania(rozpakujOdpowiedźWyszukiwania(odkodujHtmlAutocomplete(html)));
    const wzorzec = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
    const poAdresach = /(https?:\/\/(?:www\.)?szkolenia-semper\.pl\/[^\s"'<>\\]+)/gi;
    const mapa = new Map();
    let dopasowanie = null;

    wyciągnijŁączaPrzezDomParser(tekst, fraza, mapa);

    while ((dopasowanie = wzorzec.exec(tekst))) {
      const atrybuty = dopasowanie[1] || "";
      const href = (atrybuty.match(/\bhref=["']([^"']+)["']/i) || [])[1] || "";
      const dataUrl = (atrybuty.match(/\bdata-url=["']([^"']+)["']/i) || [])[1] || "";
      const url = dataUrl ? odkodujDataUrl(odkodujHtmlWyszukiwania(dataUrl)) : href;
      const tytuł = (atrybuty.match(/\btitle=["']([^"']+)["']/i) || [])[1] || odczytajTytułZFragmentu(dopasowanie[2]) || url;

      dodajKandydata(mapa, url, tytuł, fraza);
    }

    while ((dopasowanie = poAdresach.exec(tekst))) {
      const url = normalizujŁączeSemper(dopasowanie[1]);

      if (czyŁączeSzczegółówSzkolenia(url) && !mapa.has(url)) {
        dodajKandydata(mapa, url, url, fraza);
      }
    }

    return Array.from(mapa.values()).sort(function sortujWyniki(pierwszy, drugi) {
      if (drugi.punktacja !== pierwszy.punktacja) {
        return drugi.punktacja - pierwszy.punktacja;
      }

      return drugi.tytuł.length - pierwszy.tytuł.length;
    });
  }

  function odczytajŁączeZJsonaWyszukiwarki(wartość) {
    const tekst = String(wartość || "").trim();

    try {
      const dane = typeof wartość === "string" ? JSON.parse(tekst) : wartość;
      const url = dane && typeof dane === "object" && !Array.isArray(dane) ? dane.url : "";

      if (!url) {
        return "";
      }

      return normalizujŁączeSemper(url);
    } catch (błąd) {
      return "";
    }
  }

  function normalizujŁączeSemper(wartość) {
    const url = zbudujBezwzględneŁączeSemper(odkodujHtmlWyszukiwania(wartość));

    if (!url) {
      return "";
    }

    try {
      const adres = new URL(url);

      adres.hash = "";
      adres.protocol = "https:";

      if (adres.hostname === "szkolenia-semper.pl") {
        adres.hostname = "www.szkolenia-semper.pl";
      }

      return adres.href;
    } catch (błąd) {
      return "";
    }
  }

  przestrzeń.oczyśćLinię = oczyśćLinię;
  przestrzeń.cleanLine = oczyśćLinię;
  przestrzeń.normalizujDoPorównania = normalizujDoPorównania;
  przestrzeń.normalizeForScore = normalizujDoPorównania;
  przestrzeń.tytułPrzedPierwsząInterpunkcją = tytułPrzedPierwsząInterpunkcją;
  przestrzeń.titleBeforeFirstPunctuation = tytułPrzedPierwsząInterpunkcją;
  przestrzeń.ważneSłowaWyszukiwania = ważneSłowaWyszukiwania;
  przestrzeń.importantSearchWords = ważneSłowaWyszukiwania;
  przestrzeń.czyMocneDopasowanieTytułu = czyMocneDopasowanieTytułu;
  przestrzeń.isStrongTitleMatch = czyMocneDopasowanieTytułu;
  przestrzeń.zbudujBezwzględneŁączeSemper = zbudujBezwzględneŁączeSemper;
  przestrzeń.czyŁączeSzczegółówSzkolenia = czyŁączeSzczegółówSzkolenia;
  przestrzeń.isTrainingDetailsUrl = czyŁączeSzczegółówSzkolenia;
  przestrzeń.odkodujHtmlWyszukiwania = odkodujHtmlWyszukiwania;
  przestrzeń.decodeSearchHtml = odkodujHtmlAutocomplete;
  przestrzeń.odkodujDataUrl = odkodujDataUrl;
  przestrzeń.decodeDataUrl = odkodujDataUrl;
  przestrzeń.wyciągnijŁączaZWyników = wyciągnijŁączaZWyników;
  przestrzeń.linksFromSearchHtml = wyciągnijŁączaZWyników;
  przestrzeń.odczytajŁączeZJsonaWyszukiwarki = odczytajŁączeZJsonaWyszukiwarki;
  przestrzeń.parseSearchJsonUrl = odczytajŁączeZJsonaWyszukiwarki;
  przestrzeń.normalizujŁączeSemper = normalizujŁączeSemper;

  globalny.BurAsystent = przestrzeń;
})(globalThis);
