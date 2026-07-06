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
      .replace(/\s+([.,;:!?])/g, "$1")
      .trim();
  }

  function normalizujDoPorównania(wartość) {
    return String(wartość || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tytułPrzedPierwsząInterpunkcją(tytuł) {
    const znaczniki = {
      "ds.": "ds§",
      "m.in.": "m§in§"
    };
    let tekst = oczyśćLinię(tytuł);

    Object.keys(znaczniki).forEach(function chrońSkrót(skrót) {
      tekst = tekst.replace(new RegExp(skrót.replace(".", "\\."), "gi"), znaczniki[skrót]);
    });

    const indeks = tekst.search(/[.,;:!?|…–—-]/);
    let wynik = indeks >= 0 ? tekst.slice(0, indeks) : tekst;

    Object.keys(znaczniki).forEach(function przywróćSkrót(skrót) {
      wynik = wynik.replace(new RegExp(znaczniki[skrót], "g"), skrót);
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
    const słowaTytułu = new Set(ważneSłowaWyszukiwania(tytuł));

    if (słowaFrazy.length === 0 || !słowaTytułu.has(słowaFrazy[0])) {
      return false;
    }

    const trafione = słowaFrazy.filter(function sprawdźSłowo(słowo) {
      return słowaTytułu.has(słowo);
    }).length;

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

    return /\/component\/trainings\/details\/|\/szkolenie,?\d+\.html|details\/szkolenie/i.test(łącze);
  }

  function odkodujHtmlWyszukiwania(wartość) {
    return String(wartość || "")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }

  function odkodujDataUrl(wartość) {
    const tekst = String(wartość || "");

    try {
      return decodeURIComponent(tekst);
    } catch (błąd) {
      return tekst;
    }
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

    return Math.round((trafione / słowaFrazy.length) * 100);
  }

  function wyciągnijŁączaZWyników(html, fraza) {
    const tekst = odkodujDataUrl(odkodujHtmlWyszukiwania(html));
    const wzorzec = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    const poAdresach = /(https?:\/\/(?:www\.)?szkolenia-semper\.pl\/[^\s"'<>\\]+)/gi;
    const mapa = new Map();
    let dopasowanie = null;

    while ((dopasowanie = wzorzec.exec(tekst))) {
      const url = normalizujŁączeSemper(dopasowanie[1]);

      if (czyŁączeSzczegółówSzkolenia(url)) {
        const tytuł = odczytajTytułZFragmentu(dopasowanie[2]) || url;
        mapa.set(url, {
          url: url,
          tytuł: tytuł,
          punktacja: policzPunktację(tytuł, fraza, url)
        });
      }
    }

    while ((dopasowanie = poAdresach.exec(tekst))) {
      const url = normalizujŁączeSemper(dopasowanie[1]);

      if (czyŁączeSzczegółówSzkolenia(url) && !mapa.has(url)) {
        mapa.set(url, {
          url: url,
          tytuł: url,
          punktacja: policzPunktację(url, fraza, url)
        });
      }
    }

    return Array.from(mapa.values()).sort(function sortujWyniki(pierwszy, drugi) {
      return drugi.punktacja - pierwszy.punktacja;
    });
  }

  function odczytajŁączeZJsonaWyszukiwarki(wartość) {
    const tekst = String(wartość || "").trim();
    let dane = null;

    try {
      dane = JSON.parse(tekst);
    } catch (błąd) {
      return "";
    }

    function szukajŁącza(węzeł) {
      if (!węzeł) {
        return "";
      }

      if (typeof węzeł === "string") {
        return czyŁączeSzczegółówSzkolenia(węzeł) ? normalizujŁączeSemper(węzeł) : "";
      }

      if (Array.isArray(węzeł)) {
        for (let indeks = 0; indeks < węzeł.length; indeks += 1) {
          const wynik = szukajŁącza(węzeł[indeks]);

          if (wynik) {
            return wynik;
          }
        }
      }

      if (typeof węzeł === "object") {
        const klucze = ["url", "link", "href", "adres"];

        for (let indeks = 0; indeks < klucze.length; indeks += 1) {
          const wynik = szukajŁącza(węzeł[klucze[indeks]]);

          if (wynik) {
            return wynik;
          }
        }

        return szukajŁącza(Object.values(węzeł));
      }

      return "";
    }

    return szukajŁącza(dane);
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
  przestrzeń.normalizujDoPorównania = normalizujDoPorównania;
  przestrzeń.tytułPrzedPierwsząInterpunkcją = tytułPrzedPierwsząInterpunkcją;
  przestrzeń.ważneSłowaWyszukiwania = ważneSłowaWyszukiwania;
  przestrzeń.czyMocneDopasowanieTytułu = czyMocneDopasowanieTytułu;
  przestrzeń.zbudujBezwzględneŁączeSemper = zbudujBezwzględneŁączeSemper;
  przestrzeń.czyŁączeSzczegółówSzkolenia = czyŁączeSzczegółówSzkolenia;
  przestrzeń.odkodujHtmlWyszukiwania = odkodujHtmlWyszukiwania;
  przestrzeń.odkodujDataUrl = odkodujDataUrl;
  przestrzeń.wyciągnijŁączaZWyników = wyciągnijŁączaZWyników;
  przestrzeń.odczytajŁączeZJsonaWyszukiwarki = odczytajŁączeZJsonaWyszukiwarki;
  przestrzeń.normalizujŁączeSemper = normalizujŁączeSemper;

  globalny.BurAsystent = przestrzeń;
})(globalThis);
