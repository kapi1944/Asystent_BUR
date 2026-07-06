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
})(globalThis);
