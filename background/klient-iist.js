(function zarejestrujKlientaIist(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const limitCzasuPobieraniaIist = 30000;
  const adresBazowyIist = "https://szkoleniaiist.com.pl/";
  const adresKataloguIist = adresBazowyIist + "szkolenia-otwarte/";
  function normalizujŁączeIist(url) {
    try {
      const adres = new URL(String(url || "").trim());
      adres.hash = "";
      const stronaTechniczna = /^\/(?:szkolenia-otwarte\/?|szkolenia-otwarte\/page\/\d+\/?|sitemap(?:_index)?\.xml)$/i.test(adres.pathname);
      return /^(?:www\.)?szkoleniaiist\.com\.pl$/i.test(adres.hostname) && /^https:$/.test(adres.protocol) && adres.pathname !== "/" && !stronaTechniczna ? adres.href : "";
    } catch (błąd) { return ""; }
  }
  async function importujSzkolenieZLinkuIist(url) {
    const adres = normalizujŁączeIist(url);
    if (!adres) { throw new Error("Wklej poprawny link do szkolenia IIST."); }
    const kontroler = new AbortController();
    const licznikCzasu = setTimeout(function przerwijPobieranie() { kontroler.abort(); }, limitCzasuPobieraniaIist);
    try {
      const odpowiedź = await fetch(adres, { method: "GET", credentials: "omit", signal: kontroler.signal });
      if (!odpowiedź.ok) { throw new Error("IIST zwrócił błąd HTTP " + odpowiedź.status + "."); }
      return { ok: true, url: adres, html: await odpowiedź.text() };
    } catch (błąd) {
      if (błąd && błąd.name === "AbortError") { throw new Error("Przekroczono limit czasu pobierania strony IIST."); }
      throw błąd;
    } finally {
      clearTimeout(licznikCzasu);
    }
  }

  function odczytajTytułIistZHtml(html, url) {
    const tekst = String(html || "");
    const h1 = tekst.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    const title = tekst.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    const źródło = h1 ? h1[1] : title ? title[1] : String(url || "");
    return przestrzeń.oczyśćLinię(przestrzeń.odkodujHtmlWyszukiwania(źródło.replace(/<[^>]+>/g, " ")).replace(/\s*[|–-]\s*IIST.*$/i, ""));
  }

  function tytułZeŚcieżkiIist(url) {
    try {
      const ścieżka = decodeURIComponent(new URL(url).pathname).replace(/^\/+|,\d+\.html$|\.html$/gi, "");
      return przestrzeń.oczyśćLinię(ścieżka.replace(/[-_]+/g, " "));
    } catch (błąd) { return ""; }
  }

  function wyciągnijŁączaIist(html) {
    const tekst = przestrzeń.odkodujHtmlWyszukiwania(String(html || ""));
    const kandydaci = new Map();
    const wzorce = [/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi, /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi];
    wzorce.forEach(function odczytajWzorcem(wzorzec, indeksWzorca) {
      let trafienie = null;
      while ((trafienie = wzorzec.exec(tekst))) {
        let url = "";
        try { url = new URL(trafienie[1], adresBazowyIist).href; } catch (błąd) { continue; }
        url = normalizujŁączeIist(url);
        if (!url || /\/(?:szkolenia-otwarte|sitemap(?:_index)?\.xml)(?:\/|$)/i.test(new URL(url).pathname) || /\/page\/\d+\/?$/i.test(new URL(url).pathname)) { continue; }
        const tytułLinku = indeksWzorca === 1 ? przestrzeń.oczyśćLinię(String(trafienie[2] || "").replace(/<[^>]+>/g, " ")) : "";
        kandydaci.set(url, { url: url, tytuł: tytułLinku || tytułZeŚcieżkiIist(url) });
      }
    });
    return Array.from(kandydaci.values());
  }

  function oceńKandydataIist(kandydat, fraza) {
    const słowaFrazy = przestrzeń.ważneSłowaWyszukiwania(fraza);
    const słowaTytułu = new Set(przestrzeń.ważneSłowaWyszukiwania(kandydat.tytuł + " " + kandydat.url));
    return słowaFrazy.filter(function policz(słowo) { return słowaTytułu.has(słowo); }).length;
  }

  function wyciągnijStronyKataloguIist(html) {
    const wynik = new Set([adresKataloguIist]);
    const wzorzec = /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi;
    let trafienie = null;
    while ((trafienie = wzorzec.exec(String(html || "")))) {
      try {
        const adres = new URL(trafienie[1], adresKataloguIist);
        if (/^(?:www\.)?szkoleniaiist\.com\.pl$/i.test(adres.hostname) && /\/szkolenia-otwarte\/page\/\d+\/?$/i.test(adres.pathname)) { wynik.add(adres.href); }
      } catch (błąd) { /* Niepoprawny link paginacji jest pomijany. */ }
    }
    return Array.from(wynik);
  }

  async function pobierzTekstIist(adres) {
    try {
      const odpowiedź = await fetch(adres, { method: "GET", credentials: "omit" });
      return odpowiedź.ok ? odpowiedź.text() : "";
    } catch (błąd) { return ""; }
  }

  async function zweryfikujKandydatówIist(kandydaci, fraza) {
    const zweryfikowani = [];
    for (const kandydat of kandydaci) {
      try {
        const wynik = await importujSzkolenieZLinkuIist(kandydat.url);
        const tytuł = odczytajTytułIistZHtml(wynik.html, kandydat.url);
        if (przestrzeń.czyMocneDopasowanieTytułu(tytuł, fraza)) { zweryfikowani.push({ url: kandydat.url, tytuł: tytuł, title: tytuł }); }
      } catch (błąd) { /* Niedostępny kandydat nie zatrzymuje pozostałych wyników. */ }
    }
    return zweryfikowani;
  }

  async function szukajŁączaIist(fraza) {
    const czystaFraza = przestrzeń.tytułPrzedPierwsząInterpunkcją(przestrzeń.oczyśćLinię(fraza));
    const diagnostyka = { fraza: czystaFraza, liczbaKandydatów: 0 };
    if (czystaFraza.length < 3) { return { ok: false, błąd: "Fraza wyszukiwania jest za krótka.", diagnostyka: diagnostyka }; }
    try {
      const pierwszaStrona = await pobierzTekstIist(adresKataloguIist);
      const adresyKatalogu = wyciągnijStronyKataloguIist(pierwszaStrona);
      const źródła = [pierwszaStrona];
      for (const adres of adresyKatalogu.slice(1, 20)) { źródła.push(await pobierzTekstIist(adres)); }
      const mapa = new Map();
      źródła.forEach(function dodajŹródło(html) { wyciągnijŁączaIist(html).forEach(function dodaj(kandydat) { mapa.set(kandydat.url, kandydat); }); });
      function oceńMapę() { return Array.from(mapa.values()).map(function oceń(kandydat) {
        return Object.assign({}, kandydat, { punktacja: oceńKandydataIist(kandydat, czystaFraza) });
      }).filter(function wybierz(kandydat) { return kandydat.punktacja > 0; }).sort(function sortuj(a, b) { return b.punktacja - a.punktacja; }).slice(0, 8); }
      let kandydaci = oceńMapę();
      diagnostyka.liczbaKandydatów = kandydaci.length;
      let zweryfikowani = await zweryfikujKandydatówIist(kandydaci, czystaFraza);
      if (!zweryfikowani.length) {
        wyciągnijŁączaIist(await pobierzTekstIist(adresBazowyIist + "sitemap.xml")).forEach(function dodaj(kandydat) { mapa.set(kandydat.url, kandydat); });
        kandydaci = oceńMapę();
        diagnostyka.liczbaKandydatów = kandydaci.length;
        zweryfikowani = await zweryfikujKandydatówIist(kandydaci, czystaFraza);
      }
      if (zweryfikowani.length === 1) { return { ok: true, wynik: zweryfikowani[0], diagnostyka: diagnostyka }; }
      if (zweryfikowani.length > 1) { return { ok: true, wybory: zweryfikowani, diagnostyka: diagnostyka }; }
      return { ok: false, błąd: "Nie znaleziono pewnego linku IIST.", diagnostyka: diagnostyka };
    } catch (błąd) {
      return { ok: false, błąd: błąd && błąd.message ? błąd.message : "Nie udało się wyszukać szkolenia IIST.", diagnostyka: diagnostyka };
    }
  }
  przestrzeń.normalizujŁączeIist = normalizujŁączeIist;
  przestrzeń.normalizujLinkIist = normalizujŁączeIist;
  przestrzeń.czyLinkSzkoleniaIist = function czyLinkSzkoleniaIist(url) { return Boolean(normalizujŁączeIist(url)); };
  przestrzeń.importujSzkolenieZLinkuIist = importujSzkolenieZLinkuIist;
  przestrzeń.wyciągnijŁączaIist = wyciągnijŁączaIist;
  przestrzeń.wyciągnijStronyKataloguIist = wyciągnijStronyKataloguIist;
  przestrzeń.szukajŁączaIist = szukajŁączaIist;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
