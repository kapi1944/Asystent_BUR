(function zarejestrujParserSemper(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const nazwySekcjiSemper = [
    "Grupa docelowa",
    "Adresaci szkolenia",
    "Dla kogo",
    "Cel szkolenia",
    "Korzyści dla uczestników",
    "Korzyści",
    "Efekty szkolenia",
    "Metodologia",
    "Program szkolenia",
    "Program",
    "Informacje organizacyjne",
    "Inwestycja",
    "Cena szkolenia",
    "Koszt szkolenia",
    "Zgłoszenie"
  ];

  function oczyśćTekstElementu(element) {
    return String(element ? element.textContent || "" : "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizujKlucz(tekst) {
    return String(tekst || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function usuńNiebezpieczneElementy(element) {
    const kopia = element && typeof element.cloneNode === "function"
      ? element.cloneNode(true)
      : { textContent: element ? element.textContent || "" : "" };

    if (!kopia || typeof kopia.querySelectorAll !== "function") {
      return kopia;
    }

    kopia.querySelectorAll("script, style, img, svg, iframe, object, form, input, button").forEach(function usuń(elementDoUsunięcia) {
      elementDoUsunięcia.remove();
    });

    kopia.querySelectorAll("*").forEach(function wyczyśćAtrybuty(węzeł) {
      Array.from(węzeł.attributes).forEach(function usuńAtrybut(atrybut) {
        if (/^on/i.test(atrybut.name) || ["style", "class", "id"].includes(atrybut.name)) {
          węzeł.removeAttribute(atrybut.name);
        }
      });
    });

    return kopia;
  }

  function oczyśćTekstSekcji(element) {
    if (!element) {
      return "";
    }

    const kopia = usuńNiebezpieczneElementy(element);
    let tekst = kopia.textContent || "";

    tekst = tekst
      .replace(/program\s+szkolenia\s+stanowi\s+własność[\s\S]*$/i, "")
      .replace(/program\s+szkolenia\s+stanowi\s+wlasnosc[\s\S]*$/i, "")
      .replace(/program\s+szkolenia\s+jest\s+własnością[\s\S]*$/i, "")
      .replace(/program\s+szkolenia\s+jest\s+wlasnoscia[\s\S]*$/i, "")
      .replace(/wszelkie\s+prawa\s+zastrzeżone[\s\S]*$/i, "")
      .replace(/wszelkie\s+prawa\s+zastrzezone[\s\S]*$/i, "")
      .replace(/partnerzy[\s\S]*$/i, "")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+/g, " ")
      .trim();

    return tekst;
  }

  function pobierzNagłówkiTabeli(tabela) {
    const pierwszyWiersz = tabela.querySelector("tr");

    if (!pierwszyWiersz) {
      return [];
    }

    return Array.from(pierwszyWiersz.children).map(oczyśćTekstElementu);
  }

  function znajdźTabelęTerminów(dokument) {
    const tabele = Array.from(dokument.querySelectorAll("table"));

    return tabele
      .map(function oceńTabelę(tabela) {
        const tekst = normalizujKlucz(oczyśćTekstElementu(tabela));
        let wynik = 0;

        ["termin", "data", "miejsce", "lokalizacja", "cena", "koszt", "czas", "online", "zakopane"].forEach(function dodajPunkt(słowo) {
          if (tekst.includes(słowo)) {
            wynik += 1;
          }
        });

        return { tabela: tabela, wynik: wynik };
      })
      .sort(function sortujTabele(pierwsza, druga) {
        return druga.wynik - pierwsza.wynik;
      })[0]?.tabela || null;
  }

  function pobierzWartośćPoNagłówku(komórki, nagłówki, wzorce) {
    for (let indeks = 0; indeks < nagłówki.length; indeks += 1) {
      const nagłówek = normalizujKlucz(nagłówki[indeks]);

      if (wzorce.some(function pasuje(wzorzec) { return nagłówek.includes(wzorzec); })) {
        return oczyśćTekstElementu(komórki[indeks]);
      }
    }

    return "";
  }

  function parsujZakresDat(tekst) {
    return przestrzeń.parsujZakresDatSemper(String(tekst || ""));
  }

  function pobierzZakresDatZWiersza(tekst) {
    const datyIso = String(tekst || "").match(/\d{4}-\d{2}-\d{2}/g) || [];

    if (datyIso.length >= 2) {
      return datyIso[0] + " - " + datyIso[1];
    }

    if (datyIso.length === 1) {
      return datyIso[0];
    }

    const dopasowania = [
      tekst.match(/\d{4}[.-]\d{1,2}[.-]\d{1,2}\s*(?:-|–|do)\s*\d{4}[.-]\d{1,2}[.-]\d{1,2}/i),
      tekst.match(/\d{1,2}[.-]\d{1,2}[.-]\d{4}\s*(?:-|–|do)\s*\d{1,2}[.-]\d{1,2}[.-]\d{4}/i),
      tekst.match(/\d{1,2}[.-]\d{1,2}\s*(?:-|–|do)\s*\d{1,2}[.-]\d{1,2}[.-]\d{4}/i),
      tekst.match(/\d{1,2}\s*(?:-|–)\s*\d{1,2}[.-]\d{1,2}[.-]\d{4}/i),
      tekst.match(/\d{1,2}\s*(?:-|–)\s*\d{1,2}\s+[a-ząćęłńóśźż]+\s+\d{4}/i)
    ];
    const trafienie = dopasowania.find(Boolean);

    return trafienie ? trafienie[0] : "";
  }

  function znajdźTekstKomórki(komórki, czyPasuje) {
    const komórka = komórki.find(function sprawdźKomórkę(element) {
      return czyPasuje(oczyśćTekstElementu(element));
    });

    return komórka ? oczyśćTekstElementu(komórka) : "";
  }

  function rozpoznajCenęZTekstu(tekst) {
    const dopasowanie = String(tekst || "").match(/(?:\d[\d\s.,]*)\s*(?:zł|zl|pln)(?:\s*(?:netto|brutto))?/i);

    return dopasowanie ? oczyśćTekstElementu({ textContent: dopasowanie[0] }) : "";
  }

  function rozpoznajCenęBezZakwaterowania(tekst) {
    const dopasowanie = String(tekst || "")
      .replace(/\s+/g, " ")
      .match(/(\d[\d\s]*(?:[,.]\d{2})?)\s*(?:zł|zl|pln)?\s*netto\s*[-–—]\s*udział\s+w\s+szkoleniu\s+bez\s+zakwaterowania/i);

    return dopasowanie ? dopasowanie[1].replace(/\s+/g, "").replace(",", ".") : "";
  }

  function czyTreśćWyglądaJakTabelaTerminów(treść) {
    const tekst = normalizujKlucz(treść);
    const frazy = [
      "termin",
      "miejsce",
      "czas trwania",
      "koszt",
      "formularz zgloszenia",
      "program szkolenia pobierz pdf",
      "wypelnij online"
    ];
    const liczbaTrafień = frazy.filter(function policz(fraza) {
      return tekst.includes(fraza);
    }).length;

    return liczbaTrafień >= 3;
  }

  function czyTekstFałszywegoTerminu(tekst) {
    return /(pokaż\s+więcej|pokaz\s+wiecej|pokaż\s+mniej|pokaz\s+mniej|▼|▲)/i.test(String(tekst || ""));
  }

  function rozpoznajMiastoZTekstu(tekst) {
    const wartość = String(tekst || "");

    if (/online/i.test(wartość)) {
      return "Szkolenie online";
    }

    const znaneMiasta = ["Zakopane", "Warszawa", "Kraków", "Wrocław", "Poznań", "Gdańsk", "Katowice", "Łódź", "Lublin", "Toruń"];
    const miasto = znaneMiasta.find(function znajdźMiasto(nazwa) {
      return new RegExp(nazwa, "i").test(wartość);
    });

    return miasto || oczyśćTekstElementu({ textContent: wartość });
  }

  function czyTekstTerminuPotwierdzony(tekst) {
    return /(potwierdzony|gwarantowany|ostatnie\s+wolne\s+miejsca)/i.test(String(tekst || ""));
  }

  function rozpoznajFormę(miejsce) {
    if (/online/i.test(String(miejsce || ""))) {
      return przestrzeń.FORMY_SZKOLENIA.ONLINE;
    }

    if (miejsce) {
      return przestrzeń.FORMY_SZKOLENIA.STACJONARNA;
    }

    return przestrzeń.FORMY_SZKOLENIA.NIEZNANA;
  }

  function pobierzMiejsceBezNagłówka(komórki, zakresDatTekst, cena, czasTrwania) {
    const teksty = komórki.map(oczyśćTekstElementu).filter(Boolean);

    return teksty.find(function sprawdźTekst(tekst) {
      return tekst !== zakresDatTekst && tekst !== cena && tekst !== czasTrwania && !rozpoznajCenęZTekstu(tekst);
    }) || "";
  }

  function parsujTerminZWiersza(wiersz, nagłówki, ostrzeżenia) {
    const komórki = Array.from(wiersz.querySelectorAll("td"));
    const tekstWiersza = oczyśćTekstElementu(wiersz);

    if (czyTekstFałszywegoTerminu(tekstWiersza)) {
      return null;
    }

    const zakresDatTekst = pobierzWartośćPoNagłówku(komórki, nagłówki, ["termin", "data"]) || pobierzZakresDatZWiersza(tekstWiersza);
    const czasTrwania = pobierzWartośćPoNagłówku(komórki, nagłówki, ["czas", "trwanie"]) || znajdźTekstKomórki(komórki, function czyCzas(tekst) {
      return /\d+\s*(?:dni|dzien|dzień|godz)/i.test(tekst);
    });
    const cena = pobierzWartośćPoNagłówku(komórki, nagłówki, ["cena", "koszt", "inwestycja"]) || znajdźTekstKomórki(komórki, function czyCena(tekst) {
      return Boolean(rozpoznajCenęZTekstu(tekst));
    });
    const miejsceTekst = pobierzWartośćPoNagłówku(komórki, nagłówki, ["miejsce", "lokalizacja", "forma"]) || pobierzMiejsceBezNagłówka(komórki, zakresDatTekst, cena, czasTrwania);
    const zakresDat = parsujZakresDat(zakresDatTekst);
    const miejsce = rozpoznajMiastoZTekstu(miejsceTekst);
    const datyBur = przestrzeń.obliczDatyBurDlaTerminu({
      dataOd: zakresDat.dataOd,
      dataDo: zakresDat.dataDo,
      miejsce: miejsce,
      czasTrwania: czasTrwania
    });
    const czasTrwaniaBur = datyBur.czyDojazdZakopane && !czasTrwania ? "3 dni" : czasTrwania;

    if (!zakresDat.dataOd || !zakresDat.dataDo) {
      ostrzeżenia.push("Nie rozpoznano dat w wierszu terminu: " + tekstWiersza);
      return null;
    }

    if (!datyBur.dataStartBur || !datyBur.dataKoniecBur || datyBur.dataStartBur === "?" || datyBur.dataKoniecBur === "?") {
      ostrzeżenia.push("Nie utworzono terminu BUR z wiersza: " + tekstWiersza);
      return null;
    }

    return przestrzeń.utworzTerminSzkolenia({
      dataOdTekst: zakresDat.dataOd ? przestrzeń.formatujDateBur(zakresDat.dataOd) : zakresDatTekst,
      dataDoTekst: zakresDat.dataDo ? przestrzeń.formatujDateBur(zakresDat.dataDo) : zakresDatTekst,
      dataStartBur: datyBur.dataStartBur,
      dataKoniecBur: datyBur.dataKoniecBur,
      dataZakonczeniaRekrutacjiBur: datyBur.dataZakonczeniaRekrutacjiBur,
      dataZakończeniaRekrutacjiBur: datyBur.dataZakończeniaRekrutacjiBur,
      miejsce: rozpoznajFormę(miejsce) === przestrzeń.FORMY_SZKOLENIA.ONLINE ? "Szkolenie online" : miejsce,
      forma: rozpoznajFormę(miejsce),
      cena: rozpoznajCenęZTekstu(cena) || cena,
      czasTrwania: czasTrwaniaBur,
      czyDojazdZakopane: datyBur.czyDojazdZakopane,
      statusTerminu: czyTekstTerminuPotwierdzony(tekstWiersza) ? "potwierdzony" : ""
    });
  }

  function usuńDuplikatyTerminów(terminy) {
    const mapa = new Map();

    terminy.forEach(function dodajTermin(termin) {
      const klucz = [
        termin.dataStartBur,
        termin.dataKoniecBur,
        termin.miejsce,
        termin.cena,
        termin.czasTrwania
      ].join("|");

      if (!mapa.has(klucz)) {
        mapa.set(klucz, termin);
      }
    });

    return Array.from(mapa.values());
  }

  function parsujTerminySemper(dokument, ostrzeżenia) {
    const tabela = znajdźTabelęTerminów(dokument);

    if (!tabela) {
      ostrzeżenia.push("Nie znaleziono tabeli terminów.");
      return [];
    }

    const nagłówki = pobierzNagłówkiTabeli(tabela);
    const wiersze = Array.from(tabela.querySelectorAll("tr")).filter(function tylkoDane(wiersz) {
      return wiersz.querySelectorAll("td").length > 0;
    });
    const terminy = wiersze.map(function parsujWiersz(wiersz) {
      return parsujTerminZWiersza(wiersz, nagłówki, ostrzeżenia);
    }).filter(Boolean);

    if (terminy.length === 0) {
      ostrzeżenia.push("Tabela terminów nie zawiera czytelnych wierszy.");
    }

    return usuńDuplikatyTerminów(terminy);
  }

  function czyNagłówekSekcji(element) {
    return /^H[1-6]$/i.test(element.tagName || "") || element.matches("strong, b");
  }

  function czyMarkerSekcji(element) {
    if (!element || !element.matches) {
      return false;
    }

    return element.matches(".text_over, b.text_over") || /(^|\s)scc\d+(\s|$)/i.test(element.className || "");
  }

  function czySamNagłówekSekcji(tekst, nazwy) {
    const klucz = normalizujKlucz(tekst).replace(/[:.\-\s]+$/g, "").trim();

    return nazwy.some(function sprawdźNazwę(nazwa) {
      const nagłówek = normalizujKlucz(nazwa).replace(/[:.\-\s]+$/g, "").trim();

      return klucz === nagłówek;
    });
  }

  function czyTekstNawigacyjny(tekst) {
    return /^(pokaż\s+więcej|pokaz\s+wiecej|pokaż\s+mniej|pokaz\s+mniej|▼|▲)$/i.test(String(tekst || "").trim());
  }

  function czyListaNaglowkowSekcji(tekst) {
    const klucz = normalizujKlucz(tekst).replace(/[:.\-–—]+/g, " ").replace(/\s+/g, " ").trim();
    let reszta = klucz;
    let liczbaNaglowkow = 0;

    nazwySekcjiSemper
      .map(normalizujKlucz)
      .sort(function sortuj(pierwszy, drugi) { return drugi.length - pierwszy.length; })
      .forEach(function usunNaglowek(naglowek) {
        if (reszta.includes(naglowek)) {
          liczbaNaglowkow += 1;
          reszta = reszta.replace(new RegExp("(^|\\s)" + naglowek.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?=\\s|$)", "g"), " ");
        }
      });

    return liczbaNaglowkow >= 2 && !reszta.replace(/\s+/g, "");
  }

  function czyElementJestNagłówkiemSekcji(element) {
    const tekst = oczyśćTekstElementu(element);

    return tekst.length <= 160 && czySamNagłówekSekcji(tekst, nazwySekcjiSemper);
  }

  function porownajPozycjeElementow(pierwszy, drugi) {
    if (pierwszy === drugi) {
      return 0;
    }

    return pierwszy.compareDocumentPosition(drugi) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  }

  function pobierzNaglowkiZakresow(dokument) {
    return Array.from(dokument.querySelectorAll("h2, h3, h4, h5, h6, strong, b, p, div, span"))
      .filter(function filtrujNaglowek(element) {
        return czyElementJestNagłówkiemSekcji(element);
      })
      .sort(porownajPozycjeElementow);
  }

  function znajdzNaglowekPoNazwach(naglowki, nazwy, indeksStartowy) {
    const start = indeksStartowy || 0;

    for (let indeks = start; indeks < naglowki.length; indeks += 1) {
      if (czySamNagłówekSekcji(oczyśćTekstElementu(naglowki[indeks]), nazwy)) {
        return { element: naglowki[indeks], indeks: indeks };
      }
    }

    return null;
  }

  function wyczyscTekstZakresu(tekst) {
    return String(tekst || "")
      .replace(/pokaż\s+więcej/gi, "")
      .replace(/pokaz\s+wiecej/gi, "")
      .replace(/pokaż\s+mniej/gi, "")
      .replace(/pokaz\s+mniej/gi, "")
      .replace(/[▼▲]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function pobierzTekstMiedzyElementami(poczatek, koniec) {
    const zakres = poczatek.ownerDocument.createRange();
    const pojemnik = poczatek.ownerDocument.createElement("div");

    zakres.setStartAfter(poczatek);

    if (koniec) {
      zakres.setEndBefore(koniec);
    } else {
      zakres.setEndAfter(poczatek.parentElement || poczatek);
    }

    pojemnik.appendChild(zakres.cloneContents());

    return wyczyscTekstZakresu(oczyśćTekstSekcji(pojemnik));
  }

  function pobierzSekcjeMiedzyNaglowkami(dokument, ustawienia) {
    const naglowki = pobierzNaglowkiZakresow(dokument);
    const poczatek = znajdzNaglowekPoNazwach(naglowki, ustawienia.nazwy);

    if (!poczatek) {
      return "";
    }

    const koniec = znajdzNaglowekPoNazwach(naglowki, ustawienia.koniec || nazwySekcjiSemper, poczatek.indeks + 1);

    return pobierzTekstMiedzyElementami(poczatek.element, koniec ? koniec.element : null);
  }

  function usuńNagłówekSekcjiZTekstu(tekst, nazwy) {
    let wynik = String(tekst || "").trim();

    nazwy.forEach(function usuńNazwę(nazwa) {
      wynik = wynik.replace(new RegExp("^\\s*" + nazwa.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*[:.\\-–—]?\\s*", "i"), "");
    });

    return wynik.trim();
  }

  function znajdźElementSekcji(dokument, nazwy) {
    const wzorce = nazwy.map(normalizujKlucz);
    const kandydaci = Array.from(dokument.querySelectorAll("h2, h3, h4, h5, h6, strong, b, p, div, span"));

    return kandydaci.find(function sprawdźElement(element) {
      const tekst = normalizujKlucz(oczyśćTekstElementu(element));

      if (!tekst || tekst.length > 160 || czyTreśćWyglądaJakTabelaTerminów(tekst)) {
        return false;
      }

      return wzorce.some(function pasuje(wzorzec) {
        return tekst.includes(wzorzec);
      });
    }) || null;
  }

  function pobierzTekstPoEtykiecie(element) {
    const rodzic = element ? element.closest("p, div, section, article, li") : null;
    const tekstElementu = oczyśćTekstElementu(element);
    const tekstRodzica = oczyśćTekstElementu(rodzic);

    if (!rodzic || !tekstRodzica || tekstRodzica === tekstElementu) {
      return "";
    }

    return tekstRodzica.replace(tekstElementu, "").replace(/^[:.\-\s]+/, "").trim();
  }

  function collectSection(element, nazwy) {
    const fragmenty = [];
    let aktualny = element ? element.nextSibling : null;
    const tekstPoEtykiecie = pobierzTekstPoEtykiecie(element);
    const nazwySekcji = nazwy || [];
    const tekstElementu = oczyśćTekstSekcji(element);
    const tekstBezNagłówka = usuńNagłówekSekcjiZTekstu(tekstElementu, nazwySekcji);

    if (tekstPoEtykiecie) {
      fragmenty.push(tekstPoEtykiecie);
    } else if (tekstBezNagłówka && !czySamNagłówekSekcji(tekstElementu, nazwySekcji)) {
      fragmenty.push(tekstBezNagłówka);
    }

    while (aktualny && fragmenty.length < 14) {
      if (aktualny.nodeType === Node.ELEMENT_NODE && (czyNagłówekSekcji(aktualny) || czyMarkerSekcji(aktualny))) {
        break;
      }

      if (aktualny.nodeType === Node.ELEMENT_NODE && czyElementJestNagłówkiemSekcji(aktualny)) {
        break;
      }

      const tekst = aktualny.nodeType === Node.TEXT_NODE
        ? String(aktualny.textContent || "").replace(/\s+/g, " ").trim()
        : oczyśćTekstSekcji(aktualny);

      if (tekst) {
        fragmenty.push(tekst);
      }

      aktualny = aktualny.nextSibling;
    }

    return fragmenty.join("\n\n").trim();
  }

  function pobierzTreśćSekcjiZElementu(element, nazwy) {
    const tekstElementu = oczyśćTekstSekcji(element);
    const tekstBezNagłówka = usuńNagłówekSekcjiZTekstu(tekstElementu, nazwy || []);

    if (tekstBezNagłówka && !czySamNagłówekSekcji(tekstElementu, nazwy || [])) {
      return tekstBezNagłówka;
    }

    return collectSection(element, nazwy || []);
  }

  function czyTreśćSekcjiPoprawna(tekst, nazwy) {
    return Boolean(tekst)
      && !czySamNagłówekSekcji(tekst, nazwy || [])
      && !czyTreśćWyglądaJakTabelaTerminów(tekst)
      && !czyListaNaglowkowSekcji(tekst)
      && !czyTekstNawigacyjny(tekst);
  }

  function pobierzSekcjęPoKlasie(dokument, nazwaKlasy, nazwy) {
    const element = dokument.querySelector("." + nazwaKlasy + ", b.text_over." + nazwaKlasy);
    const tekst = element ? pobierzTreśćSekcjiZElementu(element, nazwy || []) : "";

    if (czyTreśćSekcjiPoprawna(tekst, nazwy || [])) {
      return tekst;
    }

    return "";
  }

  function pobierzSekcjęZFallbacku(dokument, selektory, nazwy) {
    for (let indeks = 0; indeks < selektory.length; indeks += 1) {
      const element = dokument.querySelector(selektory[indeks]);
      const tekst = element ? pobierzTreśćSekcjiZElementu(element, nazwy || []) : "";

      if (czyTreśćSekcjiPoprawna(tekst, nazwy || [])) {
        return tekst;
      }
    }

    return "";
  }

  function parsujSekcje(dokument, ostrzeżenia) {
    const mapaSekcji = {
      celSzkolenia: {
        nazwy: ["Cel szkolenia"],
        koniec: ["Korzyści dla uczestników", "Korzyści", "Efekty szkolenia"],
        klasa: "scc4",
        fallbacki: ["body > div:nth-child(4) > div.page > div > div > div.top_text.kontakt > div:nth-child(37)"]
      },
      grupaDocelowa: {
        nazwy: ["Grupa docelowa", "Adresaci szkolenia", "Dla kogo"],
        koniec: ["Cel szkolenia"],
        klasa: "scc3",
        fallbacki: ["body > div:nth-child(4) > div.page > div > div > div.top_text.kontakt > div:nth-child(32)"]
      },
      korzysci: {
        nazwy: ["Korzyści dla uczestników", "Korzyści", "Efekty szkolenia"],
        koniec: ["Metodologia", "Program szkolenia", "Program"],
        klasa: "scc5",
        fallbacki: ["body > div:nth-child(4) > div.page > div > div > div.top_text.kontakt > div:nth-child(42)"]
      },
      program: {
        nazwy: ["Program szkolenia", "Program"],
        koniec: ["Informacje organizacyjne", "Inwestycja", "Cena szkolenia", "Koszt szkolenia", "Zgłoszenie"],
        klasa: "scc8",
        fallbacki: [
          "body > div:nth-child(4) > div.page > div > div > div.top_text.kontakt > div:nth-child(53) > div > div > p:nth-child(2)",
          "body > div:nth-child(4) > div.page > div > div > div.top_text.kontakt > div:nth-child(53)"
        ]
      },
      inwestycja: {
        nazwy: ["Inwestycja", "Cena szkolenia", "Koszt szkolenia"],
        koniec: ["Zgłoszenie"],
        klasa: "",
        fallbacki: ["body > div:nth-child(4) > div.page > div > div > div.top_text.kontakt > div:nth-child(67)"]
      }
    };
    const sekcje = {};

    Object.keys(mapaSekcji).forEach(function parsujJednąSekcję(klucz) {
      const ustawienia = mapaSekcji[klucz];
      const nagłówek = znajdźElementSekcji(dokument, ustawienia.nazwy);
      const tekstZZakresu = pobierzSekcjeMiedzyNaglowkami(dokument, ustawienia);
      const tekstZNagłówka = pobierzTreśćSekcjiZElementu(nagłówek, ustawienia.nazwy);
      const tekstZKlasy = ustawienia.klasa ? pobierzSekcjęPoKlasie(dokument, ustawienia.klasa, ustawienia.nazwy) : "";
      const tekstZFallbacku = pobierzSekcjęZFallbacku(dokument, ustawienia.fallbacki || [], ustawienia.nazwy);
      const tekst = [tekstZZakresu, tekstZNagłówka, tekstZKlasy, tekstZFallbacku].find(function wybierzPoprawny(kandydat) {
        return czyTreśćSekcjiPoprawna(kandydat, ustawienia.nazwy);
      }) || "";

      sekcje[klucz] = tekst;

      if (!tekst) {
        ostrzeżenia.push("Nie znaleziono sekcji: " + ustawienia.nazwy[0] + ".");
      }
    });

    sekcje.inwestycjaHtml = sekcje.inwestycja;
    sekcje.cenaBezZakwaterowania = rozpoznajCenęBezZakwaterowania(sekcje.inwestycja);

    if (sekcje.inwestycja && !sekcje.cenaBezZakwaterowania) {
      ostrzeżenia.push("Nie rozpoznano ceny bez zakwaterowania w sekcji Inwestycja.");
    }

    return przestrzeń.utworzSekcjeOpisuSemper(sekcje);
  }

  function parsujStroneSemper(dokument, locationHref) {
    const ostrzeżenia = [];
    const tytułOryginalny = oczyśćTekstElementu(dokument.querySelector("h1"));

    if (!tytułOryginalny) {
      ostrzeżenia.push("Nie znaleziono tytułu h1.");
    }

    const tytułBur = przestrzeń.normalizujTytułBur
      ? przestrzeń.normalizujTytułBur(tytułOryginalny)
      : przestrzeń.normalizujTytulBur(tytułOryginalny);
    const sekcje = parsujSekcje(dokument, ostrzeżenia);
    const szkolenie = przestrzeń.utworzSzkolenieSemper({
      urlZrodla: locationHref || "",
      urlŹródła: locationHref || "",
      tytulOryginalny: tytułOryginalny,
      tytułOryginalny: tytułOryginalny,
      tytulBur: tytułBur,
      tytułBur: tytułBur,
      tytułPoNormalizacjiBur: tytułBur,
      terminy: parsujTerminySemper(dokument, ostrzeżenia),
      sekcje: sekcje,
      cenaBezZakwaterowania: sekcje.cenaBezZakwaterowania,
      inwestycja: sekcje.inwestycja,
      inwestycjaHtml: sekcje.inwestycjaHtml
    });

    return {
      typ: "SEMPER",
      url: locationHref || "",
      szkolenie: szkolenie,
      ostrzeżenia: ostrzeżenia,
      ostrzezenia: ostrzeżenia
    };
  }

  function parsujHtmlSemper(html, url) {
    if (typeof DOMParser === "undefined") {
      throw new Error("DOMParser nie jest dostępny w tym kontekście.");
    }

    const dokument = new DOMParser().parseFromString(String(html || ""), "text/html");

    return parsujStroneSemper(dokument, url || "");
  }

  przestrzeń.parsujZakresDat = parsujZakresDat;
  przestrzeń.rozpoznajMiastoZTekstu = rozpoznajMiastoZTekstu;
  przestrzeń.rozpoznajCenęZTekstu = rozpoznajCenęZTekstu;
  przestrzeń.rozpoznajCenęBezZakwaterowania = rozpoznajCenęBezZakwaterowania;
  przestrzeń.czyTreśćWyglądaJakTabelaTerminów = czyTreśćWyglądaJakTabelaTerminów;
  przestrzeń.czyTekstTerminuPotwierdzony = czyTekstTerminuPotwierdzony;
  przestrzeń.parsujTerminy = parsujTerminySemper;
  przestrzeń.parsujTerminySemper = parsujTerminySemper;
  przestrzeń.usuńDuplikatyTerminów = usuńDuplikatyTerminów;
  przestrzeń.collectSection = collectSection;
  przestrzeń.sanitizeHtml = oczyśćTekstSekcji;
  przestrzeń.parsujStroneSemper = parsujStroneSemper;
  przestrzeń.parsujHtmlSemper = parsujHtmlSemper;

  globalny.BurAsystent = przestrzeń;
})(globalThis);
