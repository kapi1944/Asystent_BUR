(function zarejestrujParserSemper(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

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
    const kopia = element.cloneNode(true);

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
    });

    if (terminy.length === 0) {
      ostrzeżenia.push("Tabela terminów nie zawiera czytelnych wierszy.");
    }

    return usuńDuplikatyTerminów(terminy);
  }

  function czyNagłówekSekcji(element) {
    return /^H[1-6]$/i.test(element.tagName || "") || element.matches("strong, b");
  }

  function znajdźElementSekcji(dokument, nazwy) {
    const wzorce = nazwy.map(normalizujKlucz);
    const kandydaci = Array.from(dokument.querySelectorAll("h2, h3, h4, h5, h6, strong, b, p, div, span"));

    return kandydaci.find(function sprawdźElement(element) {
      const tekst = normalizujKlucz(oczyśćTekstElementu(element));

      if (!tekst || tekst.length > 160) {
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

  function collectSection(element) {
    const fragmenty = [];
    let aktualny = element ? element.nextElementSibling : null;
    const tekstPoEtykiecie = pobierzTekstPoEtykiecie(element);

    if (tekstPoEtykiecie) {
      fragmenty.push(tekstPoEtykiecie);
    }

    while (aktualny && !czyNagłówekSekcji(aktualny) && fragmenty.length < 14) {
      const tekst = oczyśćTekstSekcji(aktualny);

      if (tekst) {
        fragmenty.push(tekst);
      }

      aktualny = aktualny.nextElementSibling;
    }

    return fragmenty.join("\n\n").trim();
  }

  function pobierzSekcjęPoKlasie(dokument, nazwaKlasy) {
    const element = dokument.querySelector("." + nazwaKlasy);

    return oczyśćTekstSekcji(element);
  }

  function parsujSekcje(dokument, ostrzeżenia) {
    const mapaSekcji = {
      celSzkolenia: {
        nazwy: ["Cel szkolenia"],
        klasa: "scc4"
      },
      grupaDocelowa: {
        nazwy: ["Grupa docelowa", "Adresaci szkolenia", "Dla kogo"],
        klasa: "scc3"
      },
      korzysci: {
        nazwy: ["Korzyści dla uczestników", "Korzyści", "Efekty szkolenia"],
        klasa: "scc5"
      },
      program: {
        nazwy: ["Program szkolenia", "Program"],
        klasa: "scc8"
      },
      inwestycja: {
        nazwy: ["Inwestycja", "Cena szkolenia", "Koszt szkolenia"],
        klasa: ""
      }
    };
    const sekcje = {};

    Object.keys(mapaSekcji).forEach(function parsujJednąSekcję(klucz) {
      const ustawienia = mapaSekcji[klucz];
      const nagłówek = znajdźElementSekcji(dokument, ustawienia.nazwy);
      const tekstZKlasy = ustawienia.klasa ? pobierzSekcjęPoKlasie(dokument, ustawienia.klasa) : "";
      const tekst = tekstZKlasy || collectSection(nagłówek);

      sekcje[klucz] = tekst;

      if (!tekst) {
        ostrzeżenia.push("Nie znaleziono sekcji: " + ustawienia.nazwy[0] + ".");
      }
    });

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
    const szkolenie = przestrzeń.utworzSzkolenieSemper({
      urlZrodla: locationHref || "",
      urlŹródła: locationHref || "",
      tytulOryginalny: tytułOryginalny,
      tytułOryginalny: tytułOryginalny,
      tytulBur: tytułBur,
      tytułBur: tytułBur,
      tytułPoNormalizacjiBur: tytułBur,
      terminy: parsujTerminySemper(dokument, ostrzeżenia),
      sekcje: parsujSekcje(dokument, ostrzeżenia)
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
