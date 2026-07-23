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

  test("XLSX jest archiwum ZIP", function sprawdź() {
    const xlsx = asystent.wygenerujDaneXlsxHarmonogramu([{
      przedmiot: "A & B < C > D \"E\" 'F'",
      prowadzacy: "trener@szkolenia-semper.pl",
      dzien_swiadczenia: "07-07-2027",
      czas_rozpoczecia: "09:00",
      czas_zakonczenia: "14:00",
      typ_aktywnosci: "Zajęcia"
    }]);

    sprawdzRownosc(xlsx[0], 0x50, "XLSX nie ma sygnatury ZIP.");
    sprawdzRownosc(xlsx[1], 0x4b, "XLSX nie ma sygnatury ZIP.");
  });

  test("XLSX tworzy dane jako bajty", function sprawdź() {
    const xlsx = asystent.wygenerujDaneXlsxHarmonogramu([{
      przedmiot: "Zażółć gęślą jaźń",
      prowadzacy: "trener@szkolenia-semper.pl",
      dzien_swiadczenia: "07-07-2027",
      czas_rozpoczecia: "09:00",
      czas_zakonczenia: "14:00",
      typ_aktywnosci: "Zajęcia"
    }]);

    sprawdzWarunek(xlsx instanceof Uint8Array, "Generator XLSX powinien zwracać Uint8Array.");
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

  test("XLSX zawiera wymagane nagłówki BUR", function sprawdź() {
    const pozycje = asystent.zbudujPozycjeHarmonogramu({
      tematSzkolenia: "Prawo ochrony środowiska",
      daty: ["07-07-2027"],
      czyOnline: false
    });
    const xlsx = asystent.wygenerujDaneXlsxHarmonogramu(pozycje);
    const tekst = new TextDecoder().decode(xlsx);

    asystent.NAGŁÓWKI_XLSX_HARMONOGRAMU.forEach(function sprawdźNagłówek(nagłówek) {
      sprawdzWarunek(tekst.includes(nagłówek.replace(/"/g, "&quot;")), "XLSX nie zawiera nagłówka: " + nagłówek);
    });
    sprawdzWarunek(tekst.includes('t="inlineStr"'), "Daty i godziny powinny być zapisane jako tekst.");
    sprawdzWarunek(!tekst.includes("dd1.mm.rrrr"), "XLSX nie może zawierać symbolicznej daty dd1.");
  });

  test("wprowadzenie harmonogramu wymaga przygotowanych pozycji", function sprawdź() {
    const gotowość = asystent.sprawdźGotowośćHarmonogramuBur({
      harmonogramBurPrzygotowany: false,
      ostatniePozycjeHarmonogramuBur: [],
      wybranyTerminSemperIndex: 1,
      ostatniWybranyTerminHarmonogramuBur: 1
    });

    sprawdzRownosc(gotowość.ok, false, "Brak przygotowania powinien blokować wprowadzenie.");
    sprawdzWarunek(gotowość.komunikat.includes("Przygotuj harmonogram"), "Komunikat powinien kierować do przygotowania harmonogramu.");
  });

  test("zmiana globalnego terminu SEMPER nie unieważnia przygotowanego harmonogramu", function sprawdź() {
    const gotowość = asystent.sprawdźGotowośćHarmonogramuBur({
      harmonogramBurPrzygotowany: true,
      harmonogramBurNieaktualny: false,
      ostatniePozycjeHarmonogramuBur: [{ typ_aktywnosci: "Zajęcia" }],
      ostatniWybranyTerminHarmonogramuBur: 0,
      wybranyTerminSemperIndex: 1
    });

    sprawdzRownosc(gotowość.ok, true, "Wybór terminu do walidacji/wypełniania nie może unieważniać harmonogramu.");
  });

  test("jawnie nieaktualny harmonogram jest blokowany po zmianie terminu harmonogramu", function sprawdź() {
    const gotowość = asystent.sprawdźGotowośćHarmonogramuBur({
      harmonogramBurPrzygotowany: true,
      harmonogramBurNieaktualny: true,
      ostatniePozycjeHarmonogramuBur: [{ typ_aktywnosci: "Zajęcia" }]
    });

    sprawdzRownosc(gotowość.ok, false, "Zmiana rzeczywistego terminu harmonogramu powinna unieważnić podgląd.");
    sprawdzRownosc(gotowość.nieaktualny, true);
  });

  test("przygotowane pozycje są źródłem prawdy dla wprowadzenia", function sprawdź() {
    const pozycje = [{ typ_aktywnosci: "Zajęcia" }];
    const gotowość = asystent.sprawdźGotowośćHarmonogramuBur({
      harmonogramBurPrzygotowany: true,
      ostatniePozycjeHarmonogramuBur: pozycje,
      ostatniWybranyTerminHarmonogramuBur: 1,
      wybranyTerminSemperIndex: "1"
    });

    sprawdzRownosc(gotowość.ok, true, "Przygotowany harmonogram powinien być gotowy.");
    sprawdzRownosc(gotowość.pozycje, pozycje, "Wprowadzenie powinno używać zapisanych pozycji.");
  });

  test("istniejące pozycje w tabeli blokują import bez potwierdzenia", function sprawdź() {
    const maPozycje = asystent.czyTabelaHarmonogramuMaPozycje([
      { tekst: "1 Zajęcia 07-07-2027 09:00 14:00" }
    ]);

    sprawdzRownosc(maPozycje, true, "Istniejący wiersz powinien blokować import.");
  });

  test("zerowe podsumowanie BUR nie blokuje importu harmonogramu", function sprawdź() {
    const maPozycje = asystent.czyTabelaHarmonogramuMaPozycje([
      { tekst: "Suma godzin zegarowych usługi: 00:00" },
      { tekst: "w tym suma godzin zajęć: 00:00" },
      { tekst: "w tym suma godzin walidacji: 00:00" },
      { tekst: "w tym suma przerw: 00:00" },
      { tekst: "Suma godzin dydaktycznych bez przerw: 00:00" }
    ]);

    sprawdzRownosc(maPozycje, false, "Zerowe podsumowanie nie powinno być traktowane jak istniejący harmonogram.");
  });

  test("fallback ręczny nie uruchamia się przy istniejącym harmonogramie", function sprawdź() {
    const czyUruchomić = asystent.czyUruchomićFallbackHarmonogramu({
      tabelaIstnieje: true,
      klikniętoWprowadzenie: true,
      xlsxNieudany: true,
      istniejącePozycje: true,
      pozycje: [{ typ_aktywnosci: "Zajęcia" }]
    });

    sprawdzRownosc(czyUruchomić, false, "Fallback nie powinien startować przy istniejących pozycjach.");
  });

  test("CSV harmonogramu jest zgodny z formatem wzorca BUR", function sprawdźCsvBur() {
    const csv = asystent.wygenerujDaneCsvHarmonogramu([{
      przedmiot: 'Temat "specjalny"',
      prowadzacy: "trener@szkolenia-semper.pl",
      dzien_swiadczenia: "23-06-2027",
      czas_rozpoczecia: "10:00",
      czas_zakonczenia: "17:00",
      typ_aktywnosci: "Zajęcia"
    }]);
    const tekst = new TextDecoder("utf-8").decode(csv);
    const linie = tekst.replace(/^\uFEFF/, "").split("\r\n");

    sprawdzWarunek(csv instanceof Uint8Array, "Generator CSV powinien zwracać Uint8Array.");
    sprawdzRownosc(csv[0], 0xef, "CSV nie ma pierwszego bajtu BOM.");
    sprawdzRownosc(csv[1], 0xbb, "CSV nie ma drugiego bajtu BOM.");
    sprawdzRownosc(csv[2], 0xbf, "CSV nie ma trzeciego bajtu BOM.");
    sprawdzRownosc(
      linie[0],
      '"Przedmiot / temat (max 200 znaków)";"Prowadzący (adres email lub ""Podmiot zewnętrzny"")";"Termin (w formacie dd-mm-yyyy)";"Godzina od (w formacie hh:mm)";"Godzina do (w formacie hh:mm)";"Typ aktywności (Zajęcia/Walidacja/Przerwa)"',
      "Nagłówek CSV nie jest zgodny ze wzorcem BUR."
    );
    sprawdzRownosc(
      linie[1],
      "\"Temat \"\"specjalny\"\"\";\"trener@szkolenia-semper.pl\";\"23-06-2027\";\"10:00\";\"17:00\";\"Zajęcia\"",
      "Wiersz CSV jest niepoprawny."
    );
    sprawdzWarunek(tekst.endsWith("\r\n"), "CSV powinien kończyć się CRLF.");
  });

})(globalThis);
