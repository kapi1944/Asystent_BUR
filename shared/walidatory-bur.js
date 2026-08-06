(function zarejestrujWalidatoryBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function bezZnakówDiakrytycznych(wartość) {
    return przestrzeń.normalizujTekstDoWalidacji(wartość)
      .toLowerCase()
      .replace(/ł/g, "l")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function normalizujDoPorównaniaBur(wartość) {
    return przestrzeń.normalizujTekstDoWalidacji(wartość).toLowerCase();
  }

  function czyPuste(wartość) {
    return !przestrzeń.normalizujTekstDoWalidacji(wartość);
  }

  function czyZgodne(aktualnaWartość, oczekiwanaWartość) {
    const aktualna = normalizujDoPorównaniaBur(aktualnaWartość);
    const oczekiwana = normalizujDoPorównaniaBur(oczekiwanaWartość);

    return aktualna === oczekiwana || bezZnakówDiakrytycznych(aktualna) === bezZnakówDiakrytycznych(oczekiwana);
  }

  function pobierzTytułBur(szkolenieSemper) {
    return szkolenieSemper.tytułPoNormalizacjiBur || szkolenieSemper.tytułBur || szkolenieSemper.tytulBur || "";
  }

  function pobierzDatęRekrutacji(termin) {
    return termin.dataZakończeniaRekrutacjiBur || termin.dataZakonczeniaRekrutacjiBur || "";
  }

  function pobierzSekcjęSemper(szkolenieSemper, nazwy) {
    const sekcje = szkolenieSemper.sekcje || {};

    for (let indeks = 0; indeks < nazwy.length; indeks += 1) {
      const wartość = sekcje[nazwy[indeks]];

      if (wartość) {
        return wartość;
      }
    }

    return "";
  }

  function czyTekstPodobny(aktualnaWartość, oczekiwanaWartość) {
    const aktualna = bezZnakówDiakrytycznych(aktualnaWartość);
    const oczekiwana = bezZnakówDiakrytycznych(oczekiwanaWartość);

    if (!oczekiwana) {
      return true;
    }

    if (aktualna.includes(oczekiwana) || oczekiwana.includes(aktualna)) {
      return true;
    }

    const słowaOczekiwane = oczekiwana.split(" ").filter(function zostawSłowo(słowo) {
      return słowo.length > 3;
    });
    const trafione = słowaOczekiwane.filter(function sprawdźSłowo(słowo) {
      return aktualna.includes(słowo);
    });

    return słowaOczekiwane.length > 0 && trafione.length / słowaOczekiwane.length >= 0.6;
  }

  function dodajPozycję(pozycje, dane) {
    const pozycja = przestrzeń.utwórzPozycjęWalidacjiBur(dane);

    if (dane.element) {
      pozycja.element = dane.element;
    }
    if (dane.diagnostyka) {
      pozycja.diagnostyka = dane.diagnostyka;
    }

    pozycje.push(pozycja);
  }

  function sprawdźWartość(pozycje, ustawienia) {
    const dokument = ustawienia.dokument || document;
    const pole = przestrzeń.znajdźPoleBur(dokument, ustawienia.definicja || {});
    const elementDoOdczytu = ustawienia.element || pole;
    const aktualnaWartość = ustawienia.pobierzWartość
      ? ustawienia.pobierzWartość(elementDoOdczytu)
      : przestrzeń.pobierzWartośćPola(elementDoOdczytu);
    let status = "poprawne";
    let komunikat = "Wartość poprawna.";

    if (czyPuste(aktualnaWartość)) {
      status = "błąd";
      komunikat = "Wymagane pole jest puste.";
    } else if (ustawienia.czyOstrzeżenie ? ustawienia.czyOstrzeżenie(aktualnaWartość) : !czyZgodne(aktualnaWartość, ustawienia.oczekiwanaWartość)) {
      status = ustawienia.statusNiezgodności || "ostrzeżenie";
      komunikat = ustawienia.komunikatOstrzeżenia || "Wartość różni się od oczekiwanej instrukcji.";
    }

    dodajPozycję(pozycje, {
      sekcja: ustawienia.sekcja,
      pole: ustawienia.pole,
      status: status,
      komunikat: komunikat,
      oczekiwanaWartość: ustawienia.oczekiwanaWartość,
      aktualnaWartość: aktualnaWartość,
      opisPola: ustawienia.opisPola || ustawienia.pole,
      selektorPomocniczy: ustawienia.selektorPomocniczy || "",
      element: elementDoOdczytu || pole,
      diagnostyka: ustawienia.diagnostyka || null
    });
  }

  function pobierzKontrolkiPrzełącznika(kontener) {
    return typeof przestrzeń.pobierzKontrolkiPrzełącznika === "function"
      ? przestrzeń.pobierzKontrolkiPrzełącznika(kontener)
      : [];
  }

  function utwórzDiagnostykęPrzełącznika(tekst) {
    return {
      znalezionyTekst: tekst || "",
      tagKontenera: "",
      klasyKontenera: "",
      liczbaKontrolek: 0,
      stan: ""
    };
  }

  function znajdźNajmniejszyKontenerPrzełącznika(sekcja, czyPasujeTekst, czyPoprawnyKontener) {
    const diagnostyka = utwórzDiagnostykęPrzełącznika("");
    if (!sekcja) {
      return { element: null, diagnostyka: diagnostyka };
    }

    const kandydaci = Array.from(sekcja.querySelectorAll("label, span, div, p, strong"))
      .filter(function pasuje(element) {
        return czyPasujeTekst(normalizujDoPorównaniaBur(element.textContent || ""));
      })
      .filter(function tylkoNajmniejszyElementTekstowy(element) {
        return !Array.from(element.querySelectorAll("label, span, div, p, strong")).some(function maMniejszyTekst(potomek) {
          return potomek !== element && czyPasujeTekst(normalizujDoPorównaniaBur(potomek.textContent || ""));
        });
      });
    const znalezioneKontenery = [];

    kandydaci.forEach(function znajdźKontener(kandydat) {
      diagnostyka.znalezionyTekst = przestrzeń.normalizujTekstDoWalidacji(kandydat.textContent || "");
      let kontener = kandydat;
      while (kontener && sekcja.contains(kontener)) {
        const kontrolki = pobierzKontrolkiPrzełącznika(kontener);
        if (kontrolki.length) {
          diagnostyka.tagKontenera = kontener.tagName || "";
          diagnostyka.klasyKontenera = kontener.className || "";
          diagnostyka.liczbaKontrolek = kontrolki.length;
        }
        if (kontrolki.length === 1 && czyPoprawnyKontener(kontener)) {
          znalezioneKontenery.push(kontener);
          break;
        }
        if (kontener === sekcja) {
          break;
        }
        kontener = kontener.parentElement;
      }
    });

    const unikalneKontenery = Array.from(new Set(znalezioneKontenery));
    const element = unikalneKontenery.length === 1 ? unikalneKontenery[0] : null;
    if (element) {
      diagnostyka.tagKontenera = element.tagName || "";
      diagnostyka.klasyKontenera = element.className || "";
      diagnostyka.liczbaKontrolek = pobierzKontrolkiPrzełącznika(element).length;
      diagnostyka.stan = przestrzeń.pobierzStanPrzełącznika(element);
    }
    return { element: element, diagnostyka: diagnostyka };
  }

  function znajdźPrzełącznikPytaniaKompetencji(dokument, numerPytania) {
    const sekcjaKompetencji = dokument.querySelector("#leadToAcquisitionOfCompetences");
    const początek = "pytanie " + numerPytania + ".";
    return znajdźNajmniejszyKontenerPrzełącznika(
      sekcjaKompetencji,
      function pasujeTekst(tekst) { return tekst.startsWith(początek); },
      function zawieraTylkoJednoPytanie(kontener) {
        const numery = Array.from(normalizujDoPorównaniaBur(kontener.textContent || "").matchAll(/pytanie\s+([123])\./g))
          .map(function pobierzNumer(wynik) { return Number(wynik[1]); });
        return numery.length > 0 && numery.every(function jestWłaściwe(numer) { return numer === numerPytania; });
      }
    );
  }

  function znajdźPrzełącznikCeluEdukacyjnego(dokument) {
    const sekcjaCelu = dokument.querySelector("#qualificationsZrk");
    return znajdźNajmniejszyKontenerPrzełącznika(
      sekcjaCelu,
      function pasujeTekst(tekst) { return tekst === "cel edukacyjny" || tekst === "cel edukacyjny:"; },
      function wykluczOpis(kontener) {
        return !normalizujDoPorównaniaBur(kontener.textContent || "").includes("cel edukacyjny - opis");
      }
    );
  }

  function znajdźPoleWTabeli(dokument, tytułTabeli, nazwaKolumny) {
    if (typeof przestrzeń.znajdźPoleWTabeliBur === "function") {
      const wspólnePole = przestrzeń.znajdźPoleWTabeliBur(dokument, tytułTabeli, nazwaKolumny);
      if (wspólnePole) {
        return wspólnePole;
      }
    }

    const tabele = Array.from(dokument.querySelectorAll("table"));
    const kluczTabeli = bezZnakówDiakrytycznych(tytułTabeli);
    const kluczKolumny = bezZnakówDiakrytycznych(nazwaKolumny);

    for (let indeksTabeli = 0; indeksTabeli < tabele.length; indeksTabeli += 1) {
      const tabela = tabele[indeksTabeli];

      if (!bezZnakówDiakrytycznych(tabela.textContent || "").includes(kluczTabeli)) {
        continue;
      }

      const nagłówki = Array.from(tabela.querySelectorAll("tr:first-child th, tr:first-child td"));
      const indeksKolumny = nagłówki.findIndex(function sprawdźNagłówek(nagłówek) {
        return bezZnakówDiakrytycznych(nagłówek.textContent || "").includes(kluczKolumny);
      });
      const wiersze = Array.from(tabela.querySelectorAll("tr")).slice(1);

      if (indeksKolumny < 0 || wiersze.length === 0) {
        continue;
      }

      const komórka = wiersze[0].children[indeksKolumny];

      if (!komórka) {
        continue;
      }

      return komórka.querySelector("input, textarea, select, .ql-editor, [id^='select2-'][id$='-container'], .select2-selection") || komórka;
    }

    return null;
  }

  function walidujPodstawęWpisuBur(dokument, pozycje) {
    const definicja = przestrzeń.pobierzDefinicjęPodstawyWpisuBur();
    const natywnePole = przestrzeń.znajdźNatywnePoleWyboruBur
      ? przestrzeń.znajdźNatywnePoleWyboruBur(dokument, definicja)
      : null;
    const aktualnaWartość = natywnePole ? przestrzeń.pobierzTekstSelect2(natywnePole) : "";
    const status = aktualnaWartość ? "poprawne" : "błąd";
    const komunikat = aktualnaWartość
      ? "Wybrano podstawę uzyskania wpisu do BUR."
      : "Pole podstawy uzyskania wpisu do BUR jest puste.";

    dodajPozycję(pozycje, {
      sekcja: "Formularz wstępny",
      pole: "Podstawa uzyskania wpisu do BUR",
      status: status,
      komunikat: komunikat,
      oczekiwanaWartość: "Dowolna wybrana podstawa",
      aktualnaWartość: aktualnaWartość || "Nie odczytano wartości",
      opisPola: "Podstawa uzyskania wpisu do BUR",
      selektorPomocniczy: "#formularzwstepnysekcja-podstawauzyskaniawpisuid",
      element: przestrzeń.znajdźWidocznyElementSelect2 && natywnePole
        ? przestrzeń.znajdźWidocznyElementSelect2(natywnePole) || natywnePole
        : natywnePole
    });
  }

  function walidujFormularzWstępny(dokument, kontekst, pozycje) {
    const termin = kontekst.wybranyTermin || {};
    const czyTerminOnline = termin.forma === "online";
    const oczekiwanaForma = czyTerminOnline ? "zdalna w czasie rzeczywistym" : "stacjonarna";

    sprawdźWartość(pozycje, {
      dokument: dokument,
      sekcja: "Formularz wstępny",
      pole: "Forma świadczenia usługi",
      oczekiwanaWartość: oczekiwanaForma,
      definicja: {
        sekcja: "Formularz wstępny",
        etykieta: "Forma świadczenia usługi",
        selektory: ["#select2-formularzwstepnysekcja-formaswiadczenia-container"]
      },
      czyOstrzeżenie: function sprawdźFormę(aktualnaWartość) {
        const forma = normalizujDoPorównaniaBur(aktualnaWartość);
        return czyTerminOnline
          ? !forma.includes("online") && !(forma.includes("zdalna") && forma.includes("czasie rzeczywistym"))
          : !forma.includes("stacjonarna");
      },
      selektorPomocniczy: "#select2-formularzwstepnysekcja-formaswiadczenia-container"
    });

    sprawdźWartość(pozycje, {
      dokument: dokument,
      sekcja: "Formularz wstępny",
      pole: "Wariant zajęć",
      oczekiwanaWartość: "Zajęcia grupowe",
      definicja: {
        sekcja: "Formularz wstępny",
        etykieta: "Wariant zajęć",
        selektory: ["#select2-formularzwstepnysekcja-wariantzajec-container"]
      },
      selektorPomocniczy: "#select2-formularzwstepnysekcja-wariantzajec-container"
    });

    walidujPodstawęWpisuBur(dokument, pozycje);

    sprawdźWartość(pozycje, {
      dokument: dokument,
      sekcja: "Formularz wstępny",
      pole: "Usługa zamknięta",
      oczekiwanaWartość: "NIE",
      definicja: {
        sekcja: "Formularz wstępny",
        etykieta: "Usługa zamknięta",
        selektory: ["#formularzwstepnysekcja-czyuslugadedykowanaLabel"]
      },
      pobierzWartość: przestrzeń.pobierzStanPrzełącznika,
      selektorPomocniczy: "#formularzwstepnysekcja-czyuslugadedykowanaLabel"
    });
  }

  function walidujInformacjePodstawowe(dokument, kontekst, pozycje) {
    const szkolenieSemper = kontekst.szkolenieSemper || {};
    const termin = kontekst.wybranyTermin || {};
    const oczekiwanyTytuł = pobierzTytułBur(szkolenieSemper);
    const zakazaneFragmenty = [
      "1-dniowe",
      "2-dniowe",
      "3-dniowe",
      "1 dniowe",
      "2 dniowe",
      "3 dniowe",
      "noclegi i wyżywienie w cenie szkolenia",
      "wyżywienie i zakwaterowanie w cenie szkolenia"
    ];

    sprawdźWartość(pozycje, {
      dokument: dokument,
      sekcja: "Informacje podstawowe",
      pole: "Tytuł",
      oczekiwanaWartość: oczekiwanyTytuł,
      definicja: {
        sekcja: "Informacje podstawowe",
        etykieta: "Tytuł",
        selektory: ["#informacjepodstawowesekcja-tytuluslugi"]
      },
      czyOstrzeżenie: function sprawdźTytuł(aktualnaWartość) {
        const klucz = normalizujDoPorównaniaBur(aktualnaWartość);
        const maZakazanyFragment = zakazaneFragmenty.some(function sprawdźFragment(fragment) {
          return klucz.includes(normalizujDoPorównaniaBur(fragment));
        });

        return maZakazanyFragment || (oczekiwanyTytuł ? !czyZgodne(aktualnaWartość, oczekiwanyTytuł) : false);
      },
      komunikatOstrzeżenia: "Tytuł zawiera zakazany fragment albo różni się od tytułu po normalizacji BUR.",
      selektorPomocniczy: "#informacjepodstawowesekcja-tytuluslugi"
    });

    sprawdźWartość(pozycje, {
      dokument: dokument,
      sekcja: "Informacje podstawowe",
      pole: "Data rozpoczęcia usługi",
      oczekiwanaWartość: termin.dataStartBur || "",
      definicja: {
        sekcja: "Informacje podstawowe",
        etykieta: "Data rozpoczęcia usługi",
        selektory: ["#informacjepodstawowesekcja-datarozpoczeciauslugi"]
      },
      selektorPomocniczy: "#informacjepodstawowesekcja-datarozpoczeciauslugi"
    });

    sprawdźWartość(pozycje, {
      dokument: dokument,
      sekcja: "Informacje podstawowe",
      pole: "Data zakończenia usługi",
      oczekiwanaWartość: termin.dataKoniecBur || "",
      definicja: {
        sekcja: "Informacje podstawowe",
        etykieta: "Data zakończenia usługi",
        selektory: ["#informacjepodstawowesekcja-datazakonczeniauslugi"]
      },
      selektorPomocniczy: "#informacjepodstawowesekcja-datazakonczeniauslugi"
    });

    sprawdźWartość(pozycje, {
      dokument: dokument,
      sekcja: "Informacje podstawowe",
      pole: "Data zakończenia rekrutacji",
      oczekiwanaWartość: pobierzDatęRekrutacji(termin),
      definicja: {
        sekcja: "Informacje podstawowe",
        etykieta: "Data zakończenia rekrutacji",
        selektory: ["#informacjepodstawowesekcja-datazakonczeniarekrutacji"]
      },
      selektorPomocniczy: "#informacjepodstawowesekcja-datazakonczeniarekrutacji"
    });

    sprawdźWartość(pozycje, {
      dokument: dokument,
      sekcja: "Informacje podstawowe",
      pole: "Grupa docelowa usługi",
      oczekiwanaWartość: pobierzSekcjęSemper(szkolenieSemper, ["grupaDocelowa", "grupaDocelowaHtml", "groupHtml"]),
      definicja: {
        sekcja: "Informacje podstawowe",
        etykieta: "Grupa docelowa usługi",
        selektory: ["#informacjepodstawowesekcja-grupadocelowauslugi-wysiwyg .ql-editor"]
      },
      pobierzWartość: przestrzeń.pobierzWartośćQuill,
      czyOstrzeżenie: function sprawdźGrupę(aktualnaWartość) {
        return !czyTekstPodobny(aktualnaWartość, pobierzSekcjęSemper(szkolenieSemper, ["grupaDocelowa", "grupaDocelowaHtml", "groupHtml"]));
      },
      komunikatOstrzeżenia: "Treść wyraźnie różni się od sekcji Grupa docelowa z SEMPER.",
      selektorPomocniczy: "#informacjepodstawowesekcja-grupadocelowauslugi-wysiwyg .ql-editor"
    });

    sprawdźWartość(pozycje, {
      dokument: dokument,
      sekcja: "Informacje podstawowe",
      pole: "Minimalna liczba uczestników",
      oczekiwanaWartość: termin.forma === "online" ? "2" : "5",
      definicja: {
        sekcja: "Informacje podstawowe",
        etykieta: "Minimalna liczba uczestników",
        selektory: ["#informacjepodstawowesekcja-minimalnaliczbauczestnikow"]
      },
      selektorPomocniczy: "#informacjepodstawowesekcja-minimalnaliczbauczestnikow"
    });

    sprawdźWartość(pozycje, {
      dokument: dokument,
      sekcja: "Informacje podstawowe",
      pole: "Maksymalna liczba uczestników",
      oczekiwanaWartość: "15",
      definicja: {
        sekcja: "Informacje podstawowe",
        etykieta: "Maksymalna liczba uczestników",
        selektory: ["#informacjepodstawowesekcja-maksymalnaliczbauczestnikow"]
      },
      selektorPomocniczy: "#informacjepodstawowesekcja-maksymalnaliczbauczestnikow"
    });
  }

  function walidujGłównyCelUsługi(dokument, kontekst, pozycje) {
    const szkolenieSemper = kontekst.szkolenieSemper || {};
    const tytułTabeli = "Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji";
    const przełącznikCeluEdukacyjnego = znajdźPrzełącznikCeluEdukacyjnego(dokument);

    sprawdźWartość(pozycje, {
      dokument: dokument,
      sekcja: "Główny cel usługi",
      pole: "Cel edukacyjny",
      oczekiwanaWartość: "TAK",
      definicja: { sekcja: "Główny cel usługi", etykieta: "Cel edukacyjny", selektory: [] },
      element: przełącznikCeluEdukacyjnego.element,
      pobierzWartość: przestrzeń.pobierzStanPrzełącznika,
      diagnostyka: przełącznikCeluEdukacyjnego.diagnostyka
    });

    sprawdźWartość(pozycje, {
      dokument: dokument,
      sekcja: "Główny cel usługi",
      pole: "Cel edukacyjny - opis",
      oczekiwanaWartość: pobierzSekcjęSemper(szkolenieSemper, ["celSzkolenia", "celSzkoleniaHtml", "goalHtml"]),
      definicja: {
        sekcja: "Główny cel usługi",
        selektory: ["#glownyceluslugisekcja-celedukacyjnyopis"]
      },
      czyOstrzeżenie: function sprawdźCel(aktualnaWartość) {
        return !czyTekstPodobny(aktualnaWartość, pobierzSekcjęSemper(szkolenieSemper, ["celSzkolenia", "celSzkoleniaHtml", "goalHtml"]));
      },
      komunikatOstrzeżenia: "Opis celu edukacyjnego różni się od sekcji Cel szkolenia z SEMPER.",
      selektorPomocniczy: "#glownyceluslugisekcja-celedukacyjnyopis"
    });

    [
      {
        pole: "Czy usługa pozwala na uzyskanie kwalifikacji włączonej do ZSK?",
        etykieta: "Czy usługa pozwala na uzyskanie kwalifikacji włączonej do ZSK",
        oczekiwanaWartość: "NIE",
        selektory: ["#qualificationsZrk .field-glownyceluslugisekcja-czyuslugadajekwalifikacjezrk"]
      },
      {
        pole: "Czy usługa pozwala na uzyskanie kwalifikacji niewłączonych do ZSK?",
        etykieta: "Czy usługa pozwala na uzyskanie kwalifikacji niewłączonych do ZSK",
        oczekiwanaWartość: "NIE",
        selektory: ["#qualificationsZrk .field-glownyceluslugisekcja-czyuslugadajekwalifikacjeinnenizzrk"]
      },
      {
        pole: "Czy usługa prowadzi do nabycia kompetencji?",
        etykieta: "Czy usługa prowadzi do nabycia kompetencji",
        oczekiwanaWartość: "TAK",
        selektory: ["#qualificationsZrk .field-glownyceluslugisekcja-czyuslugaprowadzidonabyciakompetencji"]
      },
      {
        pole: "Pytanie 1 w sekcji kompetencji",
        etykieta: "Czy dokument potwierdzający uzyskanie kompetencji",
        numerPytania: 1,
        oczekiwanaWartość: "TAK"
      },
      {
        pole: "Pytanie 2 w sekcji kompetencji",
        etykieta: "Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają, że walidacja",
        numerPytania: 2,
        oczekiwanaWartość: "TAK"
      },
      {
        pole: "Pytanie 3 w sekcji kompetencji",
        etykieta: "Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają zastosowanie rozwiązań",
        numerPytania: 3,
        oczekiwanaWartość: "TAK"
      }
    ].forEach(function walidujPrzełącznik(ustawienie) {
      const znalezionePytanie = ustawienie.numerPytania
        ? znajdźPrzełącznikPytaniaKompetencji(dokument, ustawienie.numerPytania)
        : null;
      sprawdźWartość(pozycje, {
        dokument: dokument,
        sekcja: "Główny cel usługi",
        pole: ustawienie.pole,
        oczekiwanaWartość: ustawienie.oczekiwanaWartość,
        definicja: {
          sekcja: "Główny cel usługi",
          etykieta: ustawienie.etykieta,
          selektory: ustawienie.selektory || []
        },
        element: znalezionePytanie ? znalezionePytanie.element : null,
        pobierzWartość: przestrzeń.pobierzStanPrzełącznika,
        diagnostyka: znalezionePytanie ? znalezionePytanie.diagnostyka : null,
        statusNiezgodności: ustawienie.numerPytania ? "błąd" : "ostrzeżenie",
        selektorPomocniczy: ustawienie.selektory ? ustawienie.selektory[0] : ""
      });
    });

    [
      {
        pole: "Efekty uczenia się",
        kolumna: "Efekty uczenia się",
        oczekiwanaWartość: "-"
      },
      {
        pole: "Kryteria weryfikacji",
        kolumna: "Kryteria weryfikacji",
        oczekiwanaWartość: "-"
      },
      {
        pole: "Wybierz metodę walidacji",
        kolumna: "Metody walidacji",
        oczekiwanaWartość: "Wywiad swobodny"
      }
    ].forEach(function walidujPoleTabeli(ustawienie) {
      const pole = znajdźPoleWTabeli(dokument, tytułTabeli, ustawienie.kolumna);
      const aktualnaWartość = przestrzeń.pobierzWartośćPola(pole);
      let status = "poprawne";
      let komunikat = "Wartość poprawna.";

      if (czyPuste(aktualnaWartość)) {
        status = "błąd";
        komunikat = "Wymagane pole jest puste.";
      } else if (!ustawienie.tylkoNiepuste && !czyZgodne(aktualnaWartość, ustawienie.oczekiwanaWartość)) {
        status = "błąd";
        komunikat = "Wartość różni się od oczekiwanej instrukcji.";
      }

      dodajPozycję(pozycje, {
        sekcja: "Główny cel usługi",
        pole: ustawienie.pole,
        status: status,
        komunikat: komunikat,
        oczekiwanaWartość: ustawienie.oczekiwanaWartość,
        aktualnaWartość: aktualnaWartość,
        opisPola: ustawienie.pole,
        element: pole
      });
    });
  }

  function walidujFormularzBur(dokument, kontekst) {
    const pozycje = [];
    const dane = kontekst || {};

    walidujFormularzWstępny(dokument, dane, pozycje);
    walidujInformacjePodstawowe(dokument, dane, pozycje);
    walidujGłównyCelUsługi(dokument, dane, pozycje);
    walidujProfilDostawcy(dokument, dane, pozycje);

    return przestrzeń.utwórzWynikWalidacjiBur(pozycje);
  }

  function odczytajCel(dokument, celId) {
    const znalezione = przestrzeń.znajdźCelFormularzaBur(dokument, celId);
    return znalezione.ok ? { element: znalezione.element, wartość: przestrzeń.pobierzWartośćPola(znalezione.element) || "" } : { element: null, wartość: "" };
  }

  function dodajSprawdzenieProfilu(pozycje, sekcja, pole, poprawne, oczekiwana, aktualna, element, komunikatBłędu, statusBraku) {
    dodajPozycję(pozycje, { sekcja: sekcja, pole: pole, status: poprawne ? "poprawne" : (statusBraku || "błąd"), komunikat: poprawne ? "Wartość jest zgodna z profilem dostawcy." : komunikatBłędu, oczekiwanaWartość: oczekiwana, aktualnaWartość: aktualna || "Nie odczytano wartości", element: element });
  }

  function normalizujPoleOsoby(wartość, typ) {
    const tekst = normalizujDoPorównaniaBur(wartość);
    if (typ === "email") {
      return tekst.replace(/\s+/g, "");
    }
    return typ === "rola" ? bezZnakówDiakrytycznych(tekst) : tekst;
  }

  function pobierzKomórkiOsoby(wiersz) {
    return Array.from(wiersz && wiersz.children || []).filter(function tylkoKomórki(element) {
      return element.tagName === "TD";
    }).slice(0, 4);
  }

  function pobierzWartośćKomórkiOsoby(komórka) {
    if (!komórka || typeof komórka.cloneNode !== "function") {
      return "";
    }
    const kopia = komórka.cloneNode(true);
    kopia.querySelectorAll(".label-mobile, input[type='hidden'], .options-content, .show-options-btn, script, style").forEach(function usuń(element) {
      element.remove();
    });
    return przestrzeń.normalizujTekstDoWalidacji(kopia.textContent || "");
  }

  function walidujOsobyProwadzące(dokument, profil, pozycje) {
    const tabela = odczytajCel(dokument, "osobyProwadzace");
    const wiersze = przestrzeń.pobierzWierszeOsóbProwadzących && tabela.element
      ? przestrzeń.pobierzWierszeOsóbProwadzących(tabela.element)
      : [];
    const oczekiwaneOsoby = [profil.osobaProwadzącaUsługę, profil.osobaProwadzącaWalidację].filter(function maDane(osoba) {
      return osoba && osoba.imięINazwisko && osoba.email && osoba.rola && osoba.opisDoświadczenia;
    });
    const pola = [
      { klucz: "imięINazwisko", nazwa: "Imię i nazwisko", typ: "tekst" },
      { klucz: "email", nazwa: "Adres email", typ: "email" },
      { klucz: "rola", nazwa: "Osoba prowadząca usługę/walidację", typ: "rola" },
      { klucz: "opisDoświadczenia", nazwa: "Opis doświadczenia", typ: "tekst" }
    ];

    if (!tabela.element || !oczekiwaneOsoby.length) {
      dodajPozycję(pozycje, { sekcja: "Osoby prowadzące", pole: "Rekordy osób prowadzących", status: "błąd", komunikat: "Nie znaleziono tabeli albo konfiguracji osób prowadzących.", oczekiwanaWartość: "Dwa kompletne rekordy profilu " + profil.nazwa, aktualnaWartość: tabela.wartość, element: tabela.element, celFormularza: "osobyProwadzace" });
      return;
    }

    const niedopasowaneOsoby = oczekiwaneOsoby.slice();
    wiersze.forEach(function sprawdźWiersz(wiersz, indeksWiersza) {
      const komórki = pobierzKomórkiOsoby(wiersz);
      const wartości = pola.map(function odczytaj(pole, indeksPola) {
        return pobierzWartośćKomórkiOsoby(komórki[indeksPola]);
      });
      let osoba = null;
      const diagnostykaDopasowania = { metoda: "brak", wynikPozostałychPól: 0 };
      const emailWiersza = normalizujPoleOsoby(wartości[1], "email");
      const dopasowanePoEmailu = niedopasowaneOsoby.filter(function maEmail(kandydat) {
        return emailWiersza && emailWiersza === normalizujPoleOsoby(kandydat.email, "email");
      });
      if (dopasowanePoEmailu.length === 1) {
        osoba = dopasowanePoEmailu[0];
        diagnostykaDopasowania.metoda = "email";
      } else {
        const wynikiKandydatów = niedopasowaneOsoby.map(function oceń(kandydat) {
          const wynik = [0, 2, 3].reduce(function policz(suma, indeksPola) {
            const pole = pola[indeksPola];
            return suma + (normalizujPoleOsoby(wartości[indeksPola], pole.typ) === normalizujPoleOsoby(kandydat[pole.klucz], pole.typ) ? 1 : 0);
          }, 0);
          return { osoba: kandydat, wynik: wynik };
        }).sort(function odNajwyższego(pierwszy, drugi) { return drugi.wynik - pierwszy.wynik; });
        const najlepszy = wynikiKandydatów[0];
        const remis = najlepszy && wynikiKandydatów.filter(function tenSamWynik(wynik) { return wynik.wynik === najlepszy.wynik; }).length > 1;
        diagnostykaDopasowania.wynikPozostałychPól = najlepszy ? najlepszy.wynik : 0;
        if (najlepszy && najlepszy.wynik > 0 && !remis) {
          osoba = najlepszy.osoba;
          diagnostykaDopasowania.metoda = "pozostałe pola";
        } else {
          diagnostykaDopasowania.metoda = remis ? "brak - remis" : "brak - wynik 0";
        }
      }
      if (osoba) { niedopasowaneOsoby.splice(niedopasowaneOsoby.indexOf(osoba), 1); }

      const zgodnośćPól = pola.map(function sprawdźPole(pole, indeksPola) {
        return Boolean(osoba) && normalizujPoleOsoby(wartości[indeksPola], pole.typ) === normalizujPoleOsoby(osoba[pole.klucz], pole.typ);
      });
      const rekordPoprawny = zgodnośćPól.every(Boolean);
      const nazwaRekordu = osoba ? osoba.imięINazwisko : "dodatkowy rekord " + (indeksWiersza + 1);
      dodajPozycję(pozycje, { sekcja: "Osoby prowadzące", pole: "Rekord: " + nazwaRekordu, status: rekordPoprawny ? "poprawne" : "ostrzeżenie", komunikat: rekordPoprawny ? "Cały rekord osoby prowadzącej jest poprawny." : "Rekord zawiera dane wymagające sprawdzenia.", oczekiwanaWartość: osoba ? "Kompletny rekord " + osoba.imięINazwisko : "Brak dodatkowego rekordu", aktualnaWartość: wartości.join(" | "), element: wiersz, celFormularza: "osobyProwadzace", diagnostyka: diagnostykaDopasowania });

      pola.forEach(function dodajWynikPola(pole, indeksPola) {
        dodajPozycję(pozycje, { sekcja: "Osoby prowadzące", pole: nazwaRekordu + " — " + pole.nazwa, status: zgodnośćPól[indeksPola] ? "poprawne" : "błąd", komunikat: zgodnośćPól[indeksPola] ? "Pole rekordu jest poprawne." : "Pole rekordu zawiera niezgodne dane lub literówkę.", oczekiwanaWartość: osoba ? osoba[pole.klucz] : "Brak dodatkowego rekordu", aktualnaWartość: wartości[indeksPola], element: komórki[indeksPola] || null, celFormularza: "osobyProwadzace" });
      });
    });

    niedopasowaneOsoby.forEach(function zgłośBrak(osoba) {
      dodajPozycję(pozycje, { sekcja: "Osoby prowadzące", pole: "Brak rekordu: " + osoba.imięINazwisko, status: "błąd", komunikat: "Brakuje wymaganej osoby prowadzącej.", oczekiwanaWartość: [osoba.imięINazwisko, osoba.email, osoba.rola, osoba.opisDoświadczenia].join(" | "), aktualnaWartość: "Brak rekordu", element: tabela.element, celFormularza: "osobyProwadzace" });
    });
  }

  przestrzeń.znajdźPrzełącznikPytaniaKompetencji = znajdźPrzełącznikPytaniaKompetencji;
  przestrzeń.znajdźPrzełącznikCeluEdukacyjnego = znajdźPrzełącznikCeluEdukacyjnego;
  przestrzeń.pobierzWartośćKomórkiOsoby = pobierzWartośćKomórkiOsoby;

  function walidujProfilDostawcy(dokument, kontekst, pozycje) {
    const profilId = kontekst.profilId || kontekst.szkolenieSemper && kontekst.szkolenieSemper.profilId || "semper";
    const profil = przestrzeń.pobierzProfilDostawcy(profilId);
    if (!profil) { return; }
    walidujOsobyProwadzące(dokument, profil, pozycje);
    if (!profil.daneKontaktowe || !profil.daneKontaktowe.email) { return; }
    const szkolenie = kontekst.szkolenieSemper || {};
    const termin = kontekst.wybranyTermin || {};
    const konto = kontekst.wykryteKontoBur || (typeof przestrzeń.wykryjKontoDostawcyBur === "function" ? przestrzeń.wykryjKontoDostawcyBur(dokument) : null);
    dodajSprawdzenieProfilu(pozycje, "Kontekst operacji", "Konto BUR", przestrzeń.czyProfilZgodnyZKontemBur(profilId, konto), profil.pełnaNazwa, konto && konto.nazwaOrganizacji || "", null, "Konto BUR nie odpowiada profilowi " + profil.nazwa + ".");
    [["kontaktImieNazwisko", "Imię i nazwisko", profil.daneKontaktowe.imięINazwisko], ["kontaktEmail", "E-mail", profil.daneKontaktowe.email], ["kontaktTelefon", "Telefon", profil.daneKontaktowe.telefon]].forEach(function sprawdźKontakt(dane) {
      const pole = odczytajCel(dokument, dane[0]);
      dodajSprawdzenieProfilu(pozycje, "Dane kontaktowe", dane[1], normalizujDoPorównaniaBur(pole.wartość) === normalizujDoPorównaniaBur(dane[2]), dane[2], pole.wartość, pole.element, "Dane kontaktowe nie odpowiadają profilowi " + profil.nazwa + ".");
    });
    const cel = odczytajCel(dokument, "opisCeluEdukacyjnego");
    const opis = szkolenie.sekcje && (szkolenie.sekcje.celEdukacyjnyOpis || szkolenie.sekcje.celSzkolenia) || "";
    dodajSprawdzenieProfilu(pozycje, "Główny cel usługi", "Cel edukacyjny - opis", Boolean(opis) && normalizujDoPorównaniaBur(cel.wartość).includes(normalizujDoPorównaniaBur(opis)), opis, cel.wartość, cel.element, "Brakuje pierwszej części celu edukacyjnego " + profil.nazwa + ".", opis ? "błąd" : "ostrzeżenie");
    const program = odczytajCel(dokument, "program");
    const tekstNad = szkolenie.sekcje && (szkolenie.sekcje.tekstNadProgramem || szkolenie.sekcje.efektyPoSzkoleniu) || "";
    dodajSprawdzenieProfilu(pozycje, "Program i harmonogram usługi", "Druga część celu nad programem", Boolean(tekstNad) && normalizujDoPorównaniaBur(program.wartość).includes(normalizujDoPorównaniaBur(tekstNad)), tekstNad, program.wartość, program.element, "Brakuje drugiej części celu edukacyjnego nad programem.", tekstNad ? "błąd" : "ostrzeżenie");
    dodajSprawdzenieProfilu(pozycje, "Program i harmonogram usługi", "Tekst organizacyjny profilu", normalizujDoPorównaniaBur(program.wartość).includes(normalizujDoPorównaniaBur(profil.tekstPodProgramem)) && !normalizujDoPorównaniaBur(program.wartość).includes(normalizujDoPorównaniaBur(przestrzeń.INFORMACJA_ORGANIZACYJNA_PROGRAMU)), profil.tekstPodProgramem, program.wartość, program.element, "Program nie zawiera właściwego tekstu organizacyjnego albo zawiera tekst SEMPER.");
    const harmonogram = odczytajCel(dokument, "harmonogram");
    const harmonogramPoprawny = [profil.osobaProwadzącaUsługę.email, profil.osobaProwadzącaWalidację.email].every(function maEmail(email) { return normalizujDoPorównaniaBur(harmonogram.wartość).includes(normalizujDoPorównaniaBur(email)); }) && !/szkolenia-semper\.pl/i.test(harmonogram.wartość);
    dodajSprawdzenieProfilu(pozycje, "Program i harmonogram usługi", "Adresy prowadzących w harmonogramie", harmonogramPoprawny, profil.osobaProwadzącaUsługę.email + ", " + profil.osobaProwadzącaWalidację.email, harmonogram.wartość, harmonogram.element, "Harmonogram nie używa wyłącznie adresów profilu " + profil.nazwa + ".");
    const online = /online/i.test([termin.forma, termin.miejsce].join(" "));
    [["informacjaOMaterialach", "Informacja o materiałach", profil.materiałyOnline], ["warunkiUczestnictwa", "Warunki uczestnictwa", profil.warunkiUczestnictwaOnline], ["informacjeDodatkowe", "Informacje dodatkowe", profil.informacjeDodatkoweOnline], ["warunkiTechniczne", "Warunki techniczne", profil.warunkiTechniczneOnline], ["kodyDostepowe", "Kody dostępowe", profil.kodyDostępoweOnline]].forEach(function sprawdźOnline(dane) {
      const pole = odczytajCel(dokument, dane[0]);
      if (!online) { dodajPozycję(pozycje, { sekcja: "Informacje dodatkowe", pole: dane[1], status: "poprawne", komunikat: "Reguła dotyczy tylko online; pole nie jest wymuszane.", oczekiwanaWartość: "Reguła dotyczy tylko online", aktualnaWartość: pole.wartość, element: pole.element }); return; }
      dodajSprawdzenieProfilu(pozycje, "Informacje dodatkowe", dane[1], normalizujDoPorównaniaBur(pole.wartość) === normalizujDoPorównaniaBur(dane[2]), dane[2], pole.wartość, pole.element, "Pole online jest niezgodne z profilem " + profil.nazwa + ".");
    });
  }

  przestrzeń.walidujFormularzBur = walidujFormularzBur;

  globalny.BurAsystent = przestrzeń;
})(globalThis);
