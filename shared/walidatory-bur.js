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
      status = "ostrzeżenie";
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
      element: pole || elementDoOdczytu
    });
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
    const oczekiwanaWartość = przestrzeń.AKTUALNA_PODSTAWA_WPISU_BUR;
    const nieaktualnaWartość = przestrzeń.NIEAKTUALNA_PODSTAWA_WPISU_BUR;
    const definicja = przestrzeń.pobierzDefinicjęPodstawyWpisuBur();
    const natywnePole = przestrzeń.znajdźNatywnePoleWyboruBur
      ? przestrzeń.znajdźNatywnePoleWyboruBur(dokument, definicja)
      : null;
    const aktualnaWartość = natywnePole ? przestrzeń.pobierzTekstSelect2(natywnePole) : "";
    const istniejeOczekiwanaOpcja = Boolean(natywnePole && Array.from(natywnePole.options || []).some(function sprawdźOpcję(opcja) {
      return przestrzeń.normalizujTekstDoWalidacji(opcja.textContent || opcja.label || "") === oczekiwanaWartość;
    }));
    let status = "poprawne";
    let komunikat = "Wybrano aktualną podstawę uzyskania wpisu do BUR.";

    if (!natywnePole) {
      status = "błąd";
      komunikat = "Nie udało się odczytać natywnego pola select dla podstawy uzyskania wpisu do BUR.";
    } else if (!istniejeOczekiwanaOpcja) {
      status = "błąd";
      komunikat = "Oczekiwana aktualna opcja nie istnieje na liście BUR.";
    } else if (!aktualnaWartość) {
      status = "błąd";
      komunikat = "Pole podstawy uzyskania wpisu do BUR jest puste.";
    } else if (aktualnaWartość === nieaktualnaWartość) {
      status = "błąd";
      komunikat = "Wybrano nieaktualną podstawę uzyskania wpisu do BUR.";
    } else if (aktualnaWartość !== oczekiwanaWartość) {
      status = "błąd";
      komunikat = "Wybrana podstawa uzyskania wpisu do BUR jest inna niż oczekiwana.";
    }

    dodajPozycję(pozycje, {
      sekcja: "Formularz wstępny",
      pole: "Podstawa uzyskania wpisu do BUR",
      status: status,
      komunikat: komunikat,
      oczekiwanaWartość: oczekiwanaWartość,
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
    const oczekiwanaForma = termin.forma === "online" ? "online" : "stacjonarna";

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

    sprawdźWartość(pozycje, {
      dokument: dokument,
      sekcja: "Główny cel usługi",
      pole: "Cel edukacyjny",
      oczekiwanaWartość: "TAK",
      definicja: {
        sekcja: "Główny cel usługi",
        etykieta: "Cel edukacyjny",
        selektory: ["#\\36 a4b781ee27a3 > div.card-body > div:nth-child(1) > div.question-field > div > div.toggle-switch > label > span.toggler"]
      },
      pobierzWartość: przestrzeń.pobierzStanPrzełącznika
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
        oczekiwanaWartość: "TAK"
      },
      {
        pole: "Pytanie 2 w sekcji kompetencji",
        etykieta: "Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają, że walidacja",
        oczekiwanaWartość: "TAK"
      },
      {
        pole: "Pytanie 3 w sekcji kompetencji",
        etykieta: "Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają zastosowanie rozwiązań",
        oczekiwanaWartość: "TAK"
      }
    ].forEach(function walidujPrzełącznik(ustawienie) {
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
        pobierzWartość: przestrzeń.pobierzStanPrzełącznika,
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
        status = "ostrzeżenie";
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

    return przestrzeń.utwórzWynikWalidacjiBur(pozycje);
  }

  przestrzeń.walidujFormularzBur = walidujFormularzBur;

  globalny.BurAsystent = przestrzeń;
})(globalThis);
