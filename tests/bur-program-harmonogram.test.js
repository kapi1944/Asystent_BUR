(function testujProgramIHarmonogram(globalny) {
  const asystent = globalny.BurAsystent;

  test("generuje pozycje harmonogramu online dla 3 dni", function sprawdź() {
    const pozycje = asystent.zbudujPozycjeHarmonogramu({
      tematSzkolenia: "Zarządzanie zmianą",
      daty: ["07-07-2027", "08-07-2027", "09-07-2027"],
      czyOnline: true
    });

    sprawdzRownosc(pozycje.length, 7, "Niepoprawna liczba pozycji.");
    sprawdzRownosc(pozycje[0].czas_rozpoczecia, "09:00", "Niepoprawny start pierwszego dnia.");
    sprawdzRownosc(pozycje[4].czas_zakonczenia, "13:00", "Niepoprawny koniec zajęć ostatniego dnia.");
    sprawdzRownosc(pozycje[6].typ_aktywnosci, "Walidacja", "Ostatnia pozycja powinna być walidacją.");
    sprawdzRownosc(pozycje[6].czas_rozpoczecia, "14:00", "Niepoprawna godzina walidacji.");
  });

  test("generuje pozycje harmonogramu stacjonarnego dla 3 dni", function sprawdź() {
    const pozycje = asystent.zbudujPozycjeHarmonogramu({
      tematSzkolenia: "Kadry i płace",
      daty: ["07-07-2027", "08-07-2027", "09-07-2027"],
      czyOnline: false
    });

    sprawdzRownosc(pozycje.length, 7, "Niepoprawna liczba pozycji.");
    sprawdzRownosc(pozycje[0].czas_rozpoczecia, "10:00", "Pierwszy dzień powinien zaczynać się o 10:00.");
    sprawdzRownosc(pozycje[2].czas_rozpoczecia, "09:00", "Drugi dzień powinien zaczynać się o 09:00.");
    sprawdzRownosc(pozycje[4].czas_zakonczenia, "15:00", "Ostatnie zajęcia powinny kończyć się o 15:00.");
    sprawdzRownosc(pozycje[6].czas_zakonczenia, "17:00", "Walidacja powinna kończyć się o 17:00.");
  });

  test("generuje harmonogram jednodniowy online", function sprawdź() {
    const pozycje = asystent.zbudujPozycjeHarmonogramu({
      tematSzkolenia: "Excel",
      daty: ["07-07-2027"],
      czyOnline: true
    });

    sprawdzRownosc(pozycje.length, 3, "Jednodniowe szkolenie online powinno mieć 3 pozycje.");
    sprawdzRownosc(pozycje[0].czas_zakonczenia, "13:00", "Zajęcia online powinny kończyć się o 13:00.");
    sprawdzRownosc(pozycje[2].czas_rozpoczecia, "14:00", "Walidacja online powinna zaczynać się o 14:00.");
  });

  test("generuje harmonogram jednodniowy stacjonarny", function sprawdź() {
    const pozycje = asystent.zbudujPozycjeHarmonogramu({
      tematSzkolenia: "Prawo pracy",
      daty: ["07-07-2027"],
      czyOnline: false
    });

    sprawdzRownosc(pozycje.length, 3, "Jednodniowe szkolenie stacjonarne powinno mieć 3 pozycje.");
    sprawdzRownosc(pozycje[0].czas_rozpoczecia, "10:00", "Zajęcia powinny zaczynać się o 10:00.");
    sprawdzRownosc(pozycje[0].czas_zakonczenia, "16:00", "Zajęcia powinny kończyć się o 16:00.");
    sprawdzRownosc(pozycje[2].czas_zakonczenia, "18:00", "Walidacja powinna kończyć się o 18:00.");
  });

  test("generuje harmonogram dwudniowy online", function sprawdź() {
    const pozycje = asystent.zbudujPozycjeHarmonogramu({
      tematSzkolenia: "Excel",
      daty: ["07-07-2027", "08-07-2027"],
      czyOnline: true
    });

    sprawdzRownosc(pozycje.length, 5, "Dwudniowe szkolenie online powinno mieć 5 pozycji.");
    sprawdzRownosc(pozycje[0].czas_rozpoczecia, "09:00", "Pierwszy dzień online powinien zaczynać się o 09:00.");
    sprawdzRownosc(pozycje[0].czas_zakonczenia, "14:00", "Pierwszy dzień online powinien kończyć zajęcia o 14:00.");
    sprawdzRownosc(pozycje[2].czas_zakonczenia, "13:00", "Ostatni dzień online powinien kończyć zajęcia o 13:00.");
    sprawdzRownosc(pozycje[4].typ_aktywnosci, "Walidacja", "Ostatnia pozycja powinna być walidacją.");
    sprawdzRownosc(pozycje[4].prowadzacy, "koordynator@szkolenia-semper.pl", "Walidacja powinna mieć koordynatora.");
  });

  test("generuje harmonogram dwudniowy stacjonarny", function sprawdź() {
    const pozycje = asystent.zbudujPozycjeHarmonogramu({
      tematSzkolenia: "Prawo pracy",
      daty: ["07-07-2027", "08-07-2027"],
      czyOnline: false
    });

    sprawdzRownosc(pozycje.length, 5, "Dwudniowe szkolenie stacjonarne powinno mieć 5 pozycji.");
    sprawdzRownosc(pozycje[0].czas_rozpoczecia, "10:00", "Pierwszy dzień stacjonarny powinien zaczynać się o 10:00.");
    sprawdzRownosc(pozycje[0].czas_zakonczenia, "17:00", "Pierwszy dzień stacjonarny powinien kończyć zajęcia o 17:00.");
    sprawdzRownosc(pozycje[2].czas_zakonczenia, "15:00", "Ostatni dzień stacjonarny powinien kończyć zajęcia o 15:00.");
    sprawdzRownosc(pozycje[4].typ_aktywnosci, "Walidacja", "Ostatnia pozycja powinna być walidacją.");
    sprawdzRownosc(pozycje[4].prowadzacy, "koordynator@szkolenia-semper.pl", "Walidacja powinna mieć koordynatora.");
  });

  test("XML escapuje znaki specjalne", function sprawdź() {
    const xml = asystent.wygenerujXmlHarmonogramu([{
      przedmiot: "A & B < C > D \"E\" 'F'",
      prowadzacy: "trener@szkolenia-semper.pl",
      dzien_swiadczenia: "07-07-2027",
      czas_rozpoczecia: "09:00",
      czas_zakonczenia: "14:00",
      typ_aktywnosci: "Zajęcia"
    }]);

    sprawdzWarunek(xml.includes("A &amp; B &lt; C &gt; D &quot;E&quot; &apos;F&apos;"), "XML nie escapuje znaków specjalnych.");
  });

  test("XML zawiera polskie znaki", function sprawdź() {
    const xml = asystent.wygenerujXmlHarmonogramu([{
      przedmiot: "Zażółć gęślą jaźń",
      prowadzacy: "trener@szkolenia-semper.pl",
      dzien_swiadczenia: "07-07-2027",
      czas_rozpoczecia: "09:00",
      czas_zakonczenia: "14:00",
      typ_aktywnosci: "Zajęcia"
    }]);

    sprawdzWarunek(xml.includes("Zażółć gęślą jaźń"), "XML nie zachował polskich znaków.");
  });

  test("przerwy mają pusty przedmiot i pustego prowadzącego", function sprawdź() {
    const pozycje = asystent.zbudujPozycjeHarmonogramu({
      tematSzkolenia: "Finanse",
      daty: ["07-07-2027", "08-07-2027"],
      czyOnline: true
    });
    const przerwy = pozycje.filter(function wybierz(pozycja) {
      return pozycja.typ_aktywnosci === "Przerwa";
    });

    sprawdzWarunek(przerwy.every(function sprawdźPrzerwę(pozycja) {
      return pozycja.przedmiot === "" && pozycja.prowadzacy === "";
    }), "Przerwa nie powinna mieć tematu ani prowadzącego.");
  });

  test("walidacja pojawia się tylko ostatniego dnia", function sprawdź() {
    const pozycje = asystent.zbudujPozycjeHarmonogramu({
      tematSzkolenia: "Sprzedaż",
      daty: ["07-07-2027", "08-07-2027", "09-07-2027"],
      czyOnline: true
    });
    const walidacje = pozycje.filter(function wybierz(pozycja) {
      return pozycja.typ_aktywnosci === "Walidacja";
    });

    sprawdzRownosc(walidacje.length, 1, "Powinna istnieć jedna walidacja.");
    sprawdzRownosc(walidacje[0].dzien_swiadczenia, "09-07-2027", "Walidacja powinna być ostatniego dnia.");
  });

  test("email walidatora jest konfigurowalny", function sprawdź() {
    const pozycje = asystent.zbudujPozycjeHarmonogramu({
      tematSzkolenia: "Negocjacje",
      daty: ["07-07-2027"],
      czyOnline: true,
      emailWalidatora: "walidator@example.pl"
    });
    const walidacja = pozycje.find(function wybierz(pozycja) {
      return pozycja.typ_aktywnosci === "Walidacja";
    });

    sprawdzRownosc(walidacja.prowadzacy, "walidator@example.pl", "Email walidatora nie został użyty.");
  });

  test("harmonogram używa wybranego terminu zamiast pierwszego z listy", function sprawdź() {
    const szkolenie = {
      terminy: [
        {
          dataStartBur: "01-07-2027",
          dataKoniecBur: "02-07-2027"
        },
        {
          dataStartBur: "10-08-2027",
          dataKoniecBur: "12-08-2027"
        }
      ]
    };
    const wybór = asystent.wybierzTerminHarmonogramu(szkolenie, 1);
    const daty = asystent.pobierzDatyHarmonogramuZTerminu(wybór.termin);
    const pozycje = asystent.zbudujPozycjeHarmonogramu({
      tematSzkolenia: "Kadry",
      daty: daty,
      czyOnline: true
    });

    sprawdzWarunek(wybór.ok, "Nie wybrano poprawnego terminu.");
    sprawdzRownosc(wybór.indeks, 1, "Wybrany indeks terminu jest niepoprawny.");
    sprawdzRownosc(pozycje[0].dzien_swiadczenia, "10-08-2027", "Harmonogram użył pierwszego terminu zamiast wybranego.");
  });

  test("wieloterminowe szkolenie bez wyboru terminu zatrzymuje harmonogram", function sprawdź() {
    const wybór = asystent.wybierzTerminHarmonogramu({
      terminy: [{ dataStartBur: "01-07-2027" }, { dataStartBur: "10-08-2027" }]
    }, null);

    sprawdzRownosc(wybór.ok, false, "Brak wyboru terminu powinien zatrzymać generowanie.");
    sprawdzRownosc(wybór.komunikat, "Wybierz termin SEMPER do wygenerowania harmonogramu.");
  });

  test("nieprawidłowy indeks terminu zatrzymuje harmonogram", function sprawdź() {
    const wybór = asystent.wybierzTerminHarmonogramu({
      terminy: [{ dataStartBur: "01-07-2027" }, { dataStartBur: "10-08-2027" }]
    }, 8);

    sprawdzRownosc(wybór.ok, false, "Indeks spoza zakresu powinien zatrzymać generowanie.");
    sprawdzRownosc(wybór.komunikat, "Wybrany termin SEMPER jest nieprawidłowy.");
  });

  test("daty harmonogramu obsługują formaty dd-mm-yyyy dd.mm.yyyy i yyyy-mm-dd", function sprawdź() {
    sprawdzRownosc(asystent.pobierzDatyHarmonogramuZTerminu({
      dataStartBur: "01-07-2027",
      dataKoniecBur: "02-07-2027"
    })[1], "02-07-2027");
    sprawdzRownosc(asystent.pobierzDatyHarmonogramuZTerminu({
      dataStartBur: "01.07.2027",
      dataKoniecBur: "02.07.2027"
    })[1], "02-07-2027");
    sprawdzRownosc(asystent.pobierzDatyHarmonogramuZTerminu({
      dataStartBur: "2027-07-01",
      dataKoniecBur: "2027-07-02"
    })[1], "02-07-2027");
  });

  test("daty harmonogramu preferują daty BUR przed tekstem SEMPER", function sprawdź() {
    const daty = asystent.pobierzDatyHarmonogramuZTerminu({
      dataStartBur: "10-08-2027",
      dataKoniecBur: "11-08-2027",
      dataOdTekst: "01-07-2027",
      dataDoTekst: "02-07-2027"
    });

    sprawdzRownosc(daty[0], "10-08-2027", "Daty BUR powinny mieć pierwszeństwo.");
  });

  test("walidacja ma pusty przedmiot i prowadzącego koordynatora", function sprawdź() {
    const pozycje = asystent.zbudujPozycjeHarmonogramu({
      tematSzkolenia: "Finanse",
      daty: ["07-07-2027"],
      czyOnline: true
    });
    const walidacja = pozycje.find(function wybierz(pozycja) {
      return pozycja.typ_aktywnosci === "Walidacja";
    });

    sprawdzRownosc(walidacja.przedmiot, "", "Walidacja powinna mieć pusty temat.");
    sprawdzRownosc(walidacja.prowadzacy, "koordynator@szkolenia-semper.pl", "Walidacja powinna mieć koordynatora.");
  });

  test("temat harmonogramu usuwa dodatki marketingowe", function sprawdź() {
    const temat = asystent.przygotujTematHarmonogramu("Prawo ochrony środowiska w praktyce – 3-dniowe szkolenie w Zakopanem (noclegi i wyżywienie w cenie szkolenia).");

    sprawdzRownosc(temat, "Prawo ochrony środowiska w praktyce", "Temat nie został poprawnie skrócony.");
  });

  test("temat harmonogramu jest skracany do limitu 200 znaków", function sprawdź() {
    const długiTytuł = "Zaawansowane szkolenie z prawa pracy dla działów HR ".repeat(8);
    const temat = asystent.przygotujTematHarmonogramu(długiTytuł);

    sprawdzRownosc(temat.length, 200, "Temat powinien mieć maksymalnie 200 znaków.");
    sprawdzWarunek(temat.endsWith("..."), "Skrócony temat powinien kończyć się wielokropkiem.");
  });

  test("temat harmonogramu zachowuje polskie znaki", function sprawdź() {
    const temat = asystent.przygotujTematHarmonogramu("Zażółć gęślą jaźń - 2-dniowe szkolenie w Gdańsku");

    sprawdzWarunek(temat.includes("Zażółć gęślą jaźń"), "Temat nie zachował polskich znaków.");
  });

  test("XML zawiera te same wartości co pozycje harmonogramu", function sprawdź() {
    const pozycje = asystent.zbudujPozycjeHarmonogramu({
      tematSzkolenia: "Prawo ochrony środowiska",
      daty: ["07-07-2027"],
      czyOnline: false
    });
    const xml = asystent.wygenerujXmlHarmonogramu(pozycje);

    pozycje.forEach(function sprawdźPozycję(pozycja) {
      ["dzien_swiadczenia", "czas_rozpoczecia", "czas_zakonczenia", "typ_aktywnosci"].forEach(function sprawdźPole(pole) {
        sprawdzWarunek(xml.includes("<" + pole + ">" + pozycja[pole] + "</" + pole + ">"), "XML nie zawiera wartości pola " + pole + ".");
      });

      if (pozycja.przedmiot) {
        sprawdzWarunek(xml.includes("<przedmiot>" + pozycja.przedmiot + "</przedmiot>"), "XML nie zawiera tematu pozycji.");
      } else {
        sprawdzWarunek(xml.includes("<przedmiot/>"), "XML nie zawiera pustego tematu pozycji.");
      }

      if (pozycja.prowadzacy) {
        sprawdzWarunek(xml.includes("<prowadzacy>" + pozycja.prowadzacy + "</prowadzacy>"), "XML nie zawiera prowadzącego pozycji.");
      } else {
        sprawdzWarunek(xml.includes("<prowadzacy/>"), "XML nie zawiera pustego prowadzącego pozycji.");
      }
    });
  });

  test("wprowadzenie harmonogramu wymaga przygotowanych pozycji i XML", function sprawdź() {
    const gotowość = asystent.sprawdźGotowośćHarmonogramuBur({
      harmonogramBurPrzygotowany: false,
      ostatniePozycjeHarmonogramuBur: [],
      ostatniXmlHarmonogramuBur: "",
      wybranyTerminSemperIndex: 1,
      ostatniWybranyTerminHarmonogramuBur: 1
    });

    sprawdzRownosc(gotowość.ok, false, "Brak przygotowania powinien blokować wprowadzenie.");
    sprawdzWarunek(gotowość.komunikat.includes("Przygotuj harmonogram"), "Komunikat powinien kierować do przygotowania harmonogramu.");
  });

  test("zmiana terminu po przygotowaniu blokuje użycie starego XML", function sprawdź() {
    const gotowość = asystent.sprawdźGotowośćHarmonogramuBur({
      harmonogramBurPrzygotowany: true,
      ostatniePozycjeHarmonogramuBur: [{ typ_aktywnosci: "Zajęcia" }],
      ostatniXmlHarmonogramuBur: "<response></response>",
      ostatniWybranyTerminHarmonogramuBur: 0,
      wybranyTerminSemperIndex: 1
    });

    sprawdzRownosc(gotowość.ok, false, "Stary XML nie powinien być gotowy po zmianie terminu.");
    sprawdzRownosc(gotowość.nieaktualny, true, "Blokada powinna oznaczać nieaktualny harmonogram.");
  });

  test("przygotowane pozycje i XML są źródłem prawdy dla wprowadzenia", function sprawdź() {
    const pozycje = [{ typ_aktywnosci: "Zajęcia" }];
    const gotowość = asystent.sprawdźGotowośćHarmonogramuBur({
      harmonogramBurPrzygotowany: true,
      ostatniePozycjeHarmonogramuBur: pozycje,
      ostatniXmlHarmonogramuBur: "<response></response>",
      ostatniWybranyTerminHarmonogramuBur: 1,
      wybranyTerminSemperIndex: "1"
    });

    sprawdzRownosc(gotowość.ok, true, "Przygotowany harmonogram powinien być gotowy.");
    sprawdzRownosc(gotowość.pozycje, pozycje, "Wprowadzenie powinno używać zapisanych pozycji.");
    sprawdzRownosc(gotowość.xml, "<response></response>", "Wprowadzenie powinno używać zapisanego XML.");
  });

  test("istniejące pozycje w tabeli blokują import bez potwierdzenia", function sprawdź() {
    const maPozycje = asystent.czyTabelaHarmonogramuMaPozycje([
      { tekst: "1 Zajęcia 07-07-2027 09:00 14:00" }
    ]);

    sprawdzRownosc(maPozycje, true, "Istniejący wiersz powinien blokować import.");
  });

  test("fallback ręczny nie uruchamia się przy istniejącym harmonogramie", function sprawdź() {
    const czyUruchomić = asystent.czyUruchomićFallbackHarmonogramu({
      tabelaIstnieje: true,
      klikniętoWprowadzenie: true,
      xmlNieudany: true,
      istniejącePozycje: true,
      pozycje: [{ typ_aktywnosci: "Zajęcia" }]
    });

    sprawdzRownosc(czyUruchomić, false, "Fallback nie powinien startować przy istniejących pozycjach.");
  });
})(globalThis);
