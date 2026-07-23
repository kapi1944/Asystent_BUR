(function testyKolejkiTerminówBur() {
  const bur = window.BurAsystent;
  const suroweTerminy = [
    "2027-07-01-2027-07-02 Wrocław 1200 zł",
    "2027-07-01-2027-07-02 Szkolenie online",
    "od: 2027-07-10",
    "do: 2027-07-11",
    "Warszawa"
  ].join("\n");

  test("kolejka rozpoznaje terminy stacjonarne i online", function sprawdź() {
    const wynik = bur.parsujKolejkęTerminówBur(suroweTerminy);
    sprawdzRownosc(wynik.terminy.length, 3);
    sprawdzRownosc(wynik.terminy.filter(function online(termin) { return termin.online; }).length, 1);
    sprawdzRownosc(wynik.terminy[0].miasto, "Wrocław");
  });

  test("kolejka podaje liczbę terminów oraz kart", function sprawdź() {
    const liczby = bur.policzKolejkęTerminówBur(bur.parsujKolejkęTerminówBur(suroweTerminy));
    sprawdzRownosc(liczby.stacjonarne, 2);
    sprawdzRownosc(liczby.online, 1);
    sprawdzRownosc(liczby.łącznie, 3);
    sprawdzRownosc(liczby.karty, 3);
  });

  test("kolejka zgłasza nierozpoznane wiersze bez usuwania poprawnych", function sprawdź() {
    const wynik = bur.parsujKolejkęTerminówBur("2027-07-01-2027-07-02 Wrocław\nniepoprawny wiersz");
    sprawdzRownosc(wynik.terminy.length, 1);
    sprawdzRownosc(wynik.błędne.join("|"), "niepoprawny wiersz");
  });

  test("opis kolejki upraszcza termin online", function sprawdź() {
    const termin = bur.parsujKolejkęTerminówBur("2027-07-01-2027-07-02 Szkolenie online").terminy[0];
    sprawdzRownosc(bur.opiszTerminKolejkiBur(termin), "2027-07-01 – 2027-07-02 · Online");
  });

  test("kolejka akceptuje miasto spoza starej listy i odcina cenę", function sprawdź() {
    const wynik = bur.parsujKolejkęTerminówBur("2027-08-01-2027-08-02 Rzeszów 2390.00 PLN");
    sprawdzRownosc(wynik.terminy.length, 1, "Nie rozpoznano poprawnego terminu z nowym miastem.");
    sprawdzRownosc(wynik.terminy[0].miasto, "Rzeszów", "Cena nie może wejść do nazwy lokalizacji.");
    sprawdzRownosc(wynik.terminy[0].online, false);
  });

  test("kolejka rozpoznaje dowolne miasto z bloku Miejsce", function sprawdź() {
    const wynik = bur.parsujKolejkęTerminówBur([
      "od: 2027-08-10",
      "do: 2027-08-11",
      "Miejsce: Bydgoszcz",
      "Cena: 2490 PLN"
    ].join("\n"));
    sprawdzRownosc(wynik.terminy.length, 1);
    sprawdzRownosc(wynik.terminy[0].miasto, "Bydgoszcz");
  });
})();
