(function testyDat() {
  const daty = window.BurAsystent;

  test("wylicza daty BUR dla Zakopanego z dniem dojazdowym", function sprawdz() {
    const zakres = daty.parsujZakresDatSemper("2027-07-06 do 2027-07-09");
    const wynik = daty.obliczDatyBurDlaTerminu({
      dataOd: zakres.dataOd,
      dataDo: zakres.dataDo,
      miejsce: "Zakopane",
      czasTrwania: "3 dni"
    });

    sprawdzRownosc(wynik.dataStartBur, "07-07-2027");
    sprawdzRownosc(wynik.dataKoniecBur, "09-07-2027");
    sprawdzRownosc(wynik.dataZakonczeniaRekrutacjiBur, "06-07-2027");
    sprawdzWarunek(wynik.czyDojazdZakopane, "Powinien zostac wykryty dzien dojazdowy.");
  });

  test("wylicza daty BUR dla online bez przesuniecia", function sprawdz() {
    const zakres = daty.parsujZakresDatSemper("06.07.2027 - 09.07.2027");
    const wynik = daty.obliczDatyBurDlaTerminu({
      dataOd: zakres.dataOd,
      dataDo: zakres.dataDo,
      miejsce: "online",
      czasTrwania: "3 dni"
    });

    sprawdzRownosc(wynik.dataStartBur, "06-07-2027");
    sprawdzRownosc(wynik.dataKoniecBur, "09-07-2027");
    sprawdzRownosc(wynik.dataZakonczeniaRekrutacjiBur, "05-07-2027");
    sprawdzWarunek(!wynik.czyDojazdZakopane, "Online nie powinien miec dnia dojazdowego.");
  });

  test("data rekrutacji jest dzien przed startem BUR", function sprawdz() {
    const zakres = daty.parsujZakresDatSemper("12.09.2027 - 12.09.2027");
    const wynik = daty.obliczDatyBurDlaTerminu({
      dataOd: zakres.dataOd,
      dataDo: zakres.dataDo,
      miejsce: "Warszawa",
      czasTrwania: "1 dzien"
    });

    sprawdzRownosc(wynik.dataStartBur, "12-09-2027");
    sprawdzRownosc(wynik.dataZakonczeniaRekrutacjiBur, "11-09-2027");
  });
})();
