(function zarejestrujParserIist(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const nagłówkiSekcji = [
    "grupa docelowa", "dla kogo", "adresaci", "cel szkolenia", "cel edukacyjny", "cele szkolenia", "korzyści dla uczestników", "korzysci dla uczestnikow",
    "program", "program szkolenia", "harmonogram", "terminy", "terminy szkolenia",
    "informacje organizacyjne", "cena", "koszt", "lokalizacja", "miejsce"
  ];

  function normalizuj(tekst) {
    return String(tekst || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
  }

  function czyNagłówekSekcji(element) {
    if (!element || !/^(H[1-6]|STRONG|B|DT|SUMMARY)$/i.test(element.tagName || "")) { return false; }
    const tekst = normalizuj(element.textContent);
    return nagłówkiSekcji.some(function pasuje(nazwa) { return tekst === nazwa || tekst.startsWith(nazwa + ":"); });
  }

  function sanityzujElementIist(element) {
    const kopia = element && element.cloneNode ? element.cloneNode(true) : null;
    if (!kopia || !kopia.querySelectorAll) { return kopia; }
    kopia.querySelectorAll("script, style, form, iframe, img, picture, svg, object, embed, input, button, video, audio, canvas").forEach(function usuń(węzeł) { węzeł.remove(); });
    kopia.querySelectorAll("*").forEach(function oczyść(węzeł) {
      Array.from(węzeł.attributes || []).forEach(function usuńAtrybut(atrybut) {
        const nazwa = nazwaAtrybutu(atrybut.name);
        const bezpiecznyLink = nazwa === "href" && /^(?:https?:|mailto:|tel:|\/|#)/i.test(atrybut.value || "");
        if (!bezpiecznyLink) { węzeł.removeAttribute(atrybut.name); }
      });
    });
    return kopia;
  }

  function nazwaAtrybutu(nazwa) {
    return String(nazwa || "").toLowerCase();
  }

  function sanityzujHtmlIist(element) {
    const kopia = sanityzujElementIist(element);
    return kopia ? kopia.innerHTML || kopia.outerHTML || "" : "";
  }

  function tekstZFormatowaniem(element) {
    const kopia = sanityzujElementIist(element);
    if (!kopia) { return ""; }
    if (typeof kopia.querySelectorAll !== "function") {
      return String(kopia.textContent || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
    }
    kopia.querySelectorAll("br").forEach(function zamień(br) { br.replaceWith("\n"); });
    kopia.querySelectorAll("p, li, h1, h2, h3, h4, h5, h6, dt, dd, tr").forEach(function oddziel(węzeł) {
      węzeł.insertAdjacentText("afterend", "\n");
    });
    return String(kopia.textContent || "").replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  function znajdźNagłówek(dokument, wzorce) {
    return Array.from(dokument.querySelectorAll("h1, h2, h3, h4, h5, h6, strong, b, dt, summary")).find(function znajdź(element) {
      const tekst = normalizuj(element.textContent);
      return wzorce.some(function pasuje(wzorzec) { return tekst === wzorzec || tekst.startsWith(wzorzec + ":"); });
    }) || null;
  }

  function pobierzSekcjęPoNagłówku(dokument, wzorce) {
    const nagłówek = znajdźNagłówek(dokument, wzorce);
    if (!nagłówek) { return ""; }
    if (nagłówek.tagName === "DT" && nagłówek.nextElementSibling && nagłówek.nextElementSibling.tagName === "DD") {
      return tekstZFormatowaniem(nagłówek.nextElementSibling);
    }
    const części = [];
    let węzeł = nagłówek.nextSibling;
    while (węzeł) {
      if (węzeł.nodeType === 1 && czyNagłówekSekcji(węzeł)) { break; }
      const tekst = węzeł.nodeType === 3 ? String(węzeł.textContent || "").trim() : tekstZFormatowaniem(węzeł);
      if (tekst) { części.push(tekst); }
      węzeł = węzeł.nextSibling;
    }
    if (!części.length && nagłówek.parentElement && /^(SECTION|ARTICLE)$/i.test(nagłówek.parentElement.tagName)) {
      const kopia = nagłówek.parentElement.cloneNode(true);
      const kopiaNagłówka = kopia.querySelector(nagłówek.tagName.toLowerCase());
      if (kopiaNagłówka) { kopiaNagłówka.remove(); }
      return tekstZFormatowaniem(kopia);
    }
    return części.join("\n").trim();
  }

  function pobierzTytuł(dokument) {
    const h1 = dokument.querySelector("main h1, article h1, h1");
    if (h1 && normalizuj(h1.textContent)) { return String(h1.textContent).replace(/\s+/g, " ").trim(); }
    const metadane = dokument.querySelector('meta[property="og:title"], meta[name="twitter:title"]');
    if (metadane) { return String(metadane.getAttribute("content") || "").trim(); }
    const dane = pobierzObiektyDanychStrukturalnych(dokument).find(function znajdź(obiekt) { return obiekt && obiekt.name && /Course|Event/i.test(String(obiekt["@type"] || "")); });
    return dane ? String(dane.name).trim() : String(dokument.title || "").replace(/\s*[|–-]\s*IIST.*$/i, "").trim();
  }

  function pobierzObiektyDanychStrukturalnych(dokument) {
    const wynik = [];
    function dodaj(dane) {
      if (Array.isArray(dane)) { dane.forEach(dodaj); return; }
      if (!dane || typeof dane !== "object") { return; }
      wynik.push(dane);
      if (Array.isArray(dane["@graph"])) { dane["@graph"].forEach(dodaj); }
    }
    Array.from(dokument.querySelectorAll('script[type="application/ld+json"]')).forEach(function parsuj(skrypt) {
      try { dodaj(JSON.parse(skrypt.textContent || "null")); } catch (błąd) { /* Niepoprawne JSON-LD nie blokuje parsera HTML. */ }
    });
    return wynik;
  }

  function pobierzWartośćZKomórek(komórki, nagłówki, wzorce) {
    for (let indeks = 0; indeks < nagłówki.length; indeks += 1) {
      if (wzorce.some(function pasuje(wzorzec) { return normalizuj(nagłówki[indeks]).includes(wzorzec); })) {
        return komórki[indeks] ? String(komórki[indeks].textContent || "").replace(/\s+/g, " ").trim() : "";
      }
    }
    return "";
  }

  function wyciągnijZakresDat(tekst) {
    const wartość = String(tekst || "");
    const wzorce = [
      /\d{4}-\d{2}-\d{2}\s*(?:-|–|—|do\s*:?)\s*\d{4}-\d{2}-\d{2}/i,
      /\d{1,2}[.-]\d{1,2}[.-]\d{4}\s*(?:-|–|—|do\s*:?)\s*\d{1,2}[.-]\d{1,2}[.-]\d{4}/i,
      /\d{4}-\d{2}-\d{2}/,
      /\d{1,2}[.-]\d{1,2}[.-]\d{4}/
    ];
    const trafienie = wzorce.map(function dopasuj(wzorzec) { return wartość.match(wzorzec); }).find(Boolean);
    return trafienie ? trafienie[0] : "";
  }

  function wartośćPoEtykiecie(tekst, etykiety) {
    const nazwy = etykiety.join("|");
    const wzorzec = new RegExp("(?:^|\\n|\\b)(?:" + nazwy + ")\\s*[:–-]\\s*([^\\n]+)", "i");
    const wynik = String(tekst || "").match(wzorzec);
    return wynik ? wynik[1].trim() : "";
  }

  function pobierzCzasTrwaniaZeStrony(dokument) {
    const tekst = String(dokument.body ? dokument.body.textContent : "").replace(/\s+/g, " ");
    const czas = tekst.match(/szkolenie\s+trwa\s+(\d+\s*dni?)(?:\s*\(\s*łącznie\s*(\d+(?:[.,]\d+)?)\s*h(?:odzin)?\s*\))?/i);
    if (!czas) { return ""; }
    return czas[2] ? czas[2].replace(",", ".") + " godzin" : czas[1];
  }

  function utwórzTerminIist(dane, ostrzeżenia) {
    const tekst = dane.tekst || "";
    const zakresTekst = dane.zakresTekst || wyciągnijZakresDat(tekst);
    const zakres = przestrzeń.parsujZakresDatSemper(zakresTekst);
    if (!zakres.dataOd || !zakres.dataDo) { return null; }
    const miejsceTekst = dane.miejsce || wartośćPoEtykiecie(tekst, ["miejsce", "lokalizacja", "forma"]);
    const online = /online|zdaln/i.test([miejsceTekst, tekst].join(" "));
    const miejsce = online ? "Szkolenie online" : miejsceTekst;
    const cena = dane.cena || wartośćPoEtykiecie(tekst, ["cena", "koszt"]) || ((tekst.match(/\d[\d\s.,]*\s*(?:zł|pln)(?:\s*(?:netto|brutto))?/i) || [])[0] || "");
    const czasTrwania = dane.czasTrwania || wartośćPoEtykiecie(tekst, ["czas trwania", "liczba godzin", "wymiar"]);
    const datyBur = przestrzeń.obliczDatyBurDlaTerminu({ dataOd: zakres.dataOd, dataDo: zakres.dataDo, miejsce: online ? "online" : miejsce, czasTrwania: czasTrwania });
    if (!miejsce) { ostrzeżenia.push("Nie rozpoznano miejsca jednego z terminów IIST."); }
    return przestrzeń.utworzTerminSzkolenia({
      dataOdTekst: przestrzeń.formatujDateBur(zakres.dataOd), dataDoTekst: przestrzeń.formatujDateBur(zakres.dataDo),
      dataStartBur: datyBur.dataStartBur, dataKoniecBur: datyBur.dataKoniecBur,
      dataZakończeniaRekrutacjiBur: datyBur.dataZakończeniaRekrutacjiBur,
      miejsce: miejsce, forma: online ? przestrzeń.FORMY_SZKOLENIA.ONLINE : (miejsce ? przestrzeń.FORMY_SZKOLENIA.STACJONARNA : przestrzeń.FORMY_SZKOLENIA.NIEZNANA),
      cena: cena, czasTrwania: czasTrwania
    });
  }

  function parsujTerminyIist(dokument, ostrzeżenia) {
    const terminy = [];
    const czasTrwaniaZeStrony = pobierzCzasTrwaniaZeStrony(dokument);
    pobierzObiektyDanychStrukturalnych(dokument).filter(function wybierz(obiekt) {
      return obiekt && obiekt.startDate && /Event|CourseInstance/i.test(String(obiekt["@type"] || ""));
    }).forEach(function parsujDane(obiekt) {
      const lokalizacja = obiekt.location || {};
      const adres = lokalizacja.address || {};
      const miejsce = typeof lokalizacja === "string" ? lokalizacja : [lokalizacja.name, typeof adres === "string" ? adres : [adres.streetAddress, adres.addressLocality].filter(Boolean).join(", ")].filter(Boolean).join(", ");
      const oferta = Array.isArray(obiekt.offers) ? obiekt.offers[0] || {} : obiekt.offers || {};
      const termin = utwórzTerminIist({
        tekst: [obiekt.startDate, obiekt.endDate || obiekt.startDate, miejsce, obiekt.eventAttendanceMode].filter(Boolean).join(" "),
        zakresTekst: String(obiekt.startDate).slice(0, 10) + " - " + String(obiekt.endDate || obiekt.startDate).slice(0, 10),
        miejsce: /Online/i.test(String(obiekt.eventAttendanceMode || "")) ? "Online" : miejsce,
        cena: oferta.price ? String(oferta.price) + " " + (oferta.priceCurrency || "PLN") : "",
        czasTrwania: obiekt.duration || ""
      }, ostrzeżenia);
      if (termin) { terminy.push(termin); }
    });
    Array.from(dokument.querySelectorAll("div.szko_over table.szko tr")).forEach(function parsujWierszIist(wiersz) {
      const komórkaTerminu = wiersz.querySelector('td[class*="tab_term"]');
      if (!komórkaTerminu) { return; }
      const komórkaMiejsca = wiersz.querySelector('td[class*="tab_mia"]');
      const komórkaCeny = wiersz.querySelector('td[class*="tab_cena"]');
      const termin = utwórzTerminIist({
        tekst: wiersz.textContent || "",
        zakresTekst: komórkaTerminu.textContent || "",
        miejsce: komórkaMiejsca ? komórkaMiejsca.textContent || "" : "",
        cena: komórkaCeny ? komórkaCeny.textContent || "" : "",
        czasTrwania: czasTrwaniaZeStrony
      }, ostrzeżenia);
      if (termin) { terminy.push(termin); }
    });
    Array.from(dokument.querySelectorAll("table")).forEach(function parsujTabelę(tabela) {
      const wiersze = Array.from(tabela.querySelectorAll("tr"));
      if (!wiersze.length || !/termin|data/i.test(wiersze[0].textContent || "")) { return; }
      const nagłówki = Array.from(wiersze[0].children).map(function tekst(komórka) { return komórka.textContent || ""; });
      wiersze.slice(1).forEach(function parsujWiersz(wiersz) {
        const komórki = Array.from(wiersz.querySelectorAll("td"));
        const termin = utwórzTerminIist({
          tekst: wiersz.textContent || "",
          zakresTekst: pobierzWartośćZKomórek(komórki, nagłówki, ["termin", "data"]),
          miejsce: pobierzWartośćZKomórek(komórki, nagłówki, ["miejsce", "lokalizacja", "forma"]),
          cena: pobierzWartośćZKomórek(komórki, nagłówki, ["cena", "koszt"]),
          czasTrwania: pobierzWartośćZKomórek(komórki, nagłówki, ["czas", "godzin"])
        }, ostrzeżenia);
        if (termin) { terminy.push(termin); }
      });
    });
    Array.from(dokument.querySelectorAll('[itemtype*="Event"], [data-termin], .termin, .termin-szkolenia, article, li')).forEach(function parsujKartę(element) {
      const tekst = tekstZFormatowaniem(element);
      if (!wyciągnijZakresDat(tekst) || !/(online|zdaln|miejsce|lokalizacja|cena|koszt|czas trwania)/i.test(tekst)) { return; }
      const termin = utwórzTerminIist({ tekst: tekst }, ostrzeżenia);
      if (termin) { terminy.push(termin); }
    });
    const unikalne = [];
    const klucze = new Set();
    terminy.forEach(function dodaj(termin) {
      const klucz = [termin.dataStartBur, termin.dataKoniecBur, normalizuj(termin.miejsce), termin.forma].join("|");
      if (!klucze.has(klucz)) { klucze.add(klucz); unikalne.push(termin); }
    });
    return unikalne;
  }

  function parsujStronęIist(dokument, url) {
    const ostrzeżenia = [];
    const tytułOryginalny = pobierzTytuł(dokument);
    const celSzkolenia = pobierzSekcjęPoNagłówku(dokument, ["cel szkolenia", "cel edukacyjny", "cele szkolenia"]);
    const korzyści = pobierzSekcjęPoNagłówku(dokument, ["korzysci dla uczestnikow", "korzyści dla uczestników"]);
    const grupaDocelowa = pobierzSekcjęPoNagłówku(dokument, ["grupa docelowa", "dla kogo", "adresaci"]);
    const program = pobierzSekcjęPoNagłówku(dokument, ["program", "program szkolenia", "harmonogram"]);
    const terminy = parsujTerminyIist(dokument, ostrzeżenia);
    if (!tytułOryginalny) { ostrzeżenia.push("Nie rozpoznano tytułu szkolenia IIST."); }
    if (!grupaDocelowa) { ostrzeżenia.push("Nie rozpoznano grupy docelowej IIST."); }
    if (!celSzkolenia) { ostrzeżenia.push("Nie rozpoznano sekcji „Cel szkolenia” IIST."); }
    if (!korzyści) { ostrzeżenia.push("Nie rozpoznano sekcji „Korzyści dla uczestników” IIST."); }
    if (!program) { ostrzeżenia.push("Nie rozpoznano programu IIST."); }
    if (!terminy.length) { ostrzeżenia.push("Nie rozpoznano terminów IIST."); }
    const tytułBur = przestrzeń.normalizujTytułBur ? przestrzeń.normalizujTytułBur(tytułOryginalny) : tytułOryginalny;
    const szkolenie = przestrzeń.utworzSzkolenie({
      profilId: "iist", urlŹródła: url || "", tytułOryginalny: tytułOryginalny, tytułBur: tytułBur,
      tytułPoNormalizacjiBur: tytułBur, terminy: terminy, ostrzeżenia: ostrzeżenia,
      sekcje: { grupaDocelowa: grupaDocelowa, celEdukacyjnyOpis: celSzkolenia, celSzkolenia: celSzkolenia, korzysci: korzyści, program: program }
    });
    return { profilId: "iist", url: url || "", szkolenie: szkolenie, ostrzeżenia: ostrzeżenia, ostrzezenia: ostrzeżenia };
  }

  function parsujHtmlIist(html, url) {
    if (typeof DOMParser === "undefined") { throw new Error("DOMParser nie jest dostępny w tym kontekście."); }
    return parsujStronęIist(new DOMParser().parseFromString(String(html || ""), "text/html"), url);
  }

  przestrzeń.sanityzujHtmlIist = sanityzujHtmlIist;
  przestrzeń.parsujTerminyIist = parsujTerminyIist;
  przestrzeń.parsujStronęIist = parsujStronęIist;
  przestrzeń.parsujHtmlIist = parsujHtmlIist;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
