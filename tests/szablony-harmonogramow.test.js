(function testujSzablonyHarmonogramow(globalny) {
  const asystent = globalny.BurAsystent;
  const TEMAT_STANDARDOWY = "szkolenie (rozmowa na żywo, współdzielenie ekranu, ćwiczenia)";
  const TEMAT_PODSUMOWANIA = "Podsumowanie i zakończenie szkolenia";
  const DZIEŃ_ROZPOCZYNAJĄCY = [
    ["09:00", "09:10", "Walidacja"], ["09:10", "10:30", "Zajęcia"], ["10:30", "10:50", "Przerwa"],
    ["10:50", "12:00", "Zajęcia"], ["12:00", "12:20", "Przerwa"], ["12:20", "13:30", "Zajęcia"],
    ["13:30", "13:50", "Przerwa"], ["13:50", "15:00", "Zajęcia"]
  ];
  const DZIEŃ_ŚRODKOWY = [
    ["09:00", "10:30", "Zajęcia"], ["10:30", "10:50", "Przerwa"], ["10:50", "12:00", "Zajęcia"],
    ["12:00", "12:20", "Przerwa"], ["12:20", "13:30", "Zajęcia"], ["13:30", "13:50", "Przerwa"],
    ["13:50", "15:00", "Zajęcia"]
  ];
  const DZIEŃ_KOŃCOWY = [
    ["09:00", "10:30", "Zajęcia"], ["10:30", "10:50", "Przerwa"], ["10:50", "12:00", "Zajęcia"],
    ["12:00", "12:20", "Przerwa"], ["12:20", "13:30", "Zajęcia"], ["13:30", "13:50", "Przerwa"],
    ["13:50", "14:40", "Zajęcia"], ["14:40", "14:50", "Walidacja"], ["14:50", "15:00", "Zajęcia"]
  ];
  const DZIEŃ_JEDNODNIOWY = [
    ["09:00", "09:10", "Walidacja"], ["09:10", "10:30", "Zajęcia"], ["10:30", "10:50", "Przerwa"],
    ["10:50", "12:00", "Zajęcia"], ["12:00", "12:20", "Przerwa"], ["12:20", "13:30", "Zajęcia"],
    ["13:30", "13:50", "Przerwa"], ["13:50", "14:40", "Zajęcia"], ["14:40", "14:50", "Walidacja"],
    ["14:50", "15:00", "Zajęcia"]
  ];

  function generuj(dataStartBur, dataKoniecBur, forma) {
    return asystent.generujHarmonogramDlaTerminu({
      profilId: "iist",
      forma: forma || "online",
      dataStartBur: dataStartBur,
      dataKoniecBur: dataKoniecBur
    });
  }

  function uprość(pozycje) {
    return pozycje.map(function mapuj(pozycja) {
      return [pozycja.czas_rozpoczecia, pozycja.czas_zakonczenia, pozycja.typ_aktywnosci];
    });
  }

  function sprawdźListę(aktualna, oczekiwana, komunikat) {
    sprawdzRownosc(JSON.stringify(aktualna), JSON.stringify(oczekiwana), komunikat);
  }

  test("IIST online 1 dzień generuje znormalizowany wariant", function sprawdź() {
    const wynik = generuj("10-09-2027", "10-09-2027");
    sprawdzWarunek(wynik.ok, wynik.komunikat);
    sprawdzRownosc(wynik.pozycje.length, 10);
    sprawdźListę(uprość(wynik.pozycje), DZIEŃ_JEDNODNIOWY, "Niepoprawne godziny lub typy wariantu jednodniowego.");
  });

  test("Szablony używają wyłącznie dozwolonych ról i kluczy tematów", function sprawdź() {
    const dozwoloneRole = ["ekspert", "walidator", "brak"];
    const dozwoloneTematy = ["standard", "podsumowanie", "brak"];
    [1, 2, 3].forEach(function sprawdźSzablon(liczbaDni) {
      asystent.pobierzSzablonHarmonogramu("iist", "online", liczbaDni).pozycje.forEach(function sprawdźWiersz(wiersz) {
        sprawdzWarunek(Number.isInteger(wiersz.indeksDnia));
        sprawdzWarunek(/^\d{2}:\d{2}$/.test(wiersz.od) && /^\d{2}:\d{2}$/.test(wiersz.do));
        sprawdzWarunek(dozwoloneRole.includes(wiersz.rolaProwadzacego));
        sprawdzWarunek(dozwoloneTematy.includes(wiersz.temat));
      });
    });
  });

  test("IIST online 2 dni składa dzień rozpoczynający i końcowy", function sprawdź() {
    const wynik = generuj("10-09-2027", "11-09-2027");
    sprawdzWarunek(wynik.ok, wynik.komunikat);
    sprawdzRownosc(wynik.pozycje.length, 17);
    sprawdźListę(uprość(wynik.pozycje), DZIEŃ_ROZPOCZYNAJĄCY.concat(DZIEŃ_KOŃCOWY), "Niepoprawne godziny lub typy wariantu dwudniowego.");
  });

  test("IIST online 3 dni składa dzień rozpoczynający środkowy i końcowy", function sprawdź() {
    const wynik = generuj("10-09-2027", "12-09-2027");
    sprawdzWarunek(wynik.ok, wynik.komunikat);
    sprawdzRownosc(wynik.pozycje.length, 24);
    sprawdźListę(uprość(wynik.pozycje), DZIEŃ_ROZPOCZYNAJĄCY.concat(DZIEŃ_ŚRODKOWY, DZIEŃ_KOŃCOWY), "Niepoprawne godziny lub typy wariantu trzydniowego.");
  });

  test("IIST mapuje role i tematy wyłącznie przez profil", function sprawdź() {
    const profil = asystent.pobierzProfilDostawcy("iist");
    const wynik = generuj("10-09-2027", "10-09-2027");
    sprawdzRownosc(profil.harmonogramBur.prowadzącyWedługRoli.ekspert, "ekspert@iist.pl");
    sprawdzRownosc(profil.harmonogramBur.prowadzącyWedługRoli.walidator, "koordynator@iist.pl");
    sprawdzWarunek(wynik.pozycje.filter(function wybierz(pozycja) { return pozycja.typ_aktywnosci === "Zajęcia"; }).every(function sprawdźPozycję(pozycja) { return pozycja.prowadzacy === "ekspert@iist.pl"; }));
    sprawdzWarunek(wynik.pozycje.filter(function wybierz(pozycja) { return pozycja.typ_aktywnosci === "Walidacja"; }).every(function sprawdźPozycję(pozycja) { return pozycja.prowadzacy === "koordynator@iist.pl" && pozycja.przedmiot === ""; }));
  });

  test("IIST przypisuje standardowe tematy i podsumowanie", function sprawdź() {
    const pozycje = generuj("10-09-2027", "12-09-2027").pozycje;
    const zajęcia = pozycje.filter(function wybierz(pozycja) { return pozycja.typ_aktywnosci === "Zajęcia"; });
    sprawdzWarunek(zajęcia.slice(0, -1).every(function sprawdź(pozycja) { return pozycja.przedmiot === TEMAT_STANDARDOWY; }));
    sprawdzRownosc(zajęcia[zajęcia.length - 1].przedmiot, TEMAT_PODSUMOWANIA);
    sprawdzRownosc(pozycje[pozycje.length - 1].przedmiot, TEMAT_PODSUMOWANIA);
  });

  test("IIST pozostawia puste pola przerw", function sprawdź() {
    const przerwy = generuj("10-09-2027", "12-09-2027").pozycje.filter(function wybierz(pozycja) { return pozycja.typ_aktywnosci === "Przerwa"; });
    sprawdzWarunek(przerwy.every(function sprawdź(pozycja) { return pozycja.przedmiot === "" && pozycja.prowadzacy === ""; }));
  });

  test("IIST ma dokładne sumy kontrolne wszystkich wariantów", function sprawdź() {
    const oczekiwane = [
      ["10-09-2027", "10-09-2027", 10, "06:00", "04:40", "00:20", "01:00", "06:40"],
      ["10-09-2027", "11-09-2027", 17, "12:00", "09:40", "00:20", "02:00", "13:20"],
      ["10-09-2027", "12-09-2027", 24, "18:00", "14:40", "00:20", "03:00", "20:00"]
    ];
    oczekiwane.forEach(function sprawdźWariant(wariant) {
      const podsumowanie = generuj(wariant[0], wariant[1]).podsumowanie;
      sprawdźListę(
        [podsumowanie.liczbaPozycji, podsumowanie.zegarowe, podsumowanie.zajęcia, podsumowanie.walidacja, podsumowanie.przerwy, podsumowanie.dydaktyczneBezPrzerw],
        wariant.slice(2),
        "Niepoprawne sumy wariantu " + wariant[2] + "-pozycyjnego."
      );
    });
  });

  test("IIST obsługuje zmianę miesiąca w zakresie lokalnych dat", function sprawdź() {
    const wynik = generuj("31-01-2028", "01-02-2028");
    sprawdzWarunek(wynik.ok, wynik.komunikat);
    sprawdźListę(Array.from(new Set(wynik.pozycje.map(function pobierz(pozycja) { return pozycja.dzien_swiadczenia; }))), ["31-01-2028", "01-02-2028"]);
  });

  test("IIST obsługuje zmianę roku w zakresie lokalnych dat", function sprawdź() {
    const wynik = generuj("31-12-2027", "02-01-2028");
    sprawdzWarunek(wynik.ok, wynik.komunikat);
    sprawdźListę(Array.from(new Set(wynik.pozycje.map(function pobierz(pozycja) { return pozycja.dzien_swiadczenia; }))), ["31-12-2027", "01-01-2028", "02-01-2028"]);
  });

  test("IIST odrzuca błędny zakres dat z kontrolowanym opisem", function sprawdź() {
    const wynik = generuj("12-09-2027", "10-09-2027");
    sprawdzWarunek(!wynik.ok);
    sprawdzRownosc(wynik.pozycje.length, 0);
    sprawdzWarunek(wynik.komunikat.includes("12-09-2027") && wynik.komunikat.includes("10-09-2027") && wynik.komunikat.includes("liczba dni: 0"));
  });

  test("IIST odrzuca nieobsługiwany wariant czterodniowy bez zgadywania", function sprawdź() {
    const wynik = generuj("10-09-2027", "13-09-2027");
    sprawdzWarunek(!wynik.ok);
    sprawdzRownosc(wynik.pozycje.length, 0);
    sprawdzWarunek(wynik.komunikat.includes("10-09-2027") && wynik.komunikat.includes("13-09-2027") && wynik.komunikat.includes("liczba dni: 4"));
  });

  test("IIST nie ma szablonu stacjonarnego", function sprawdź() {
    const wynik = generuj("10-09-2027", "10-09-2027", "stacjonarna");
    sprawdzWarunek(!wynik.ok);
    sprawdzRownosc(asystent.pobierzSzablonHarmonogramu("iist", "stacjonarna", 1), null);
  });

  test("Szablony IIST nie zawierają adresów SEMPER ani kopii e-maili IIST", function sprawdź() {
    const szablony = JSON.stringify(asystent.SZABLONY_HARMONOGRAMOW);
    sprawdzWarunek(!szablony.includes("szkolenia-semper.pl"));
    sprawdzWarunek(!szablony.includes("@iist.pl"));
    ["10-09-2027", "11-09-2027", "12-09-2027"].forEach(function sprawdźWariant(dataKońca) {
      sprawdzWarunek(!JSON.stringify(generuj("10-09-2027", dataKońca).pozycje).includes("szkolenia-semper.pl"));
    });
  });

  test("Silnik odrzuca niedozwolone dane szablonu i niepełną konfigurację profilu", function sprawdź() {
    const szablon = asystent.pobierzSzablonHarmonogramu("iist", "online", 1);
    const profil = asystent.pobierzProfilDostawcy("iist");
    const poprzedniaRola = szablon.pozycje[0].rolaProwadzacego;
    const poprzedniEkspert = profil.harmonogramBur.prowadzącyWedługRoli.ekspert;

    try {
      szablon.pozycje[0].rolaProwadzacego = "trener";
      profil.harmonogramBur.prowadzącyWedługRoli.ekspert = "";
      const wynik = generuj("10-09-2027", "10-09-2027");
      sprawdzWarunek(!wynik.ok);
      sprawdzRownosc(wynik.kod, "NIEPRAWIDŁOWY_HARMONOGRAM");
      sprawdzRownosc(wynik.pozycje.length, 0);
      sprawdzWarunek(wynik.błędy.some(function maBłąd(błąd) { return błąd.includes("niedozwoloną rolę"); }));
      sprawdzWarunek(wynik.błędy.some(function maBłąd(błąd) { return błąd.includes("roli ekspert"); }));
    } finally {
      szablon.pozycje[0].rolaProwadzacego = poprzedniaRola;
      profil.harmonogramBur.prowadzącyWedługRoli.ekspert = poprzedniEkspert;
    }
  });

  test("Walidacja IIST zwraca konkretne błędy struktury", function sprawdź() {
    const kontekst = { profilId: "iist", forma: "online", dataStartBur: "10-09-2027", dataKoniecBur: "10-09-2027" };
    const pozycje = generuj(kontekst.dataStartBur, kontekst.dataKoniecBur).pozycje.map(function skopiuj(pozycja) { return Object.assign({}, pozycja); });
    pozycje[1].czas_rozpoczecia = "09:05";
    pozycje[2].dzien_swiadczenia = "11-09-2027";
    pozycje[3].prowadzacy = "trener@szkolenia-semper.pl";
    pozycje[4].przedmiot = "Niepusty temat";
    pozycje[pozycje.length - 1].przedmiot = TEMAT_STANDARDOWY;
    const błędy = asystent.walidujWygenerowanyHarmonogram(kontekst, pozycje).join(" ");
    sprawdzWarunek(błędy.includes("nakładają się"));
    sprawdzWarunek(błędy.includes("Nieprawidłowa data") || błędy.includes("spoza terminu"));
    sprawdzWarunek(błędy.includes("adres SEMPER"));
    sprawdzWarunek(błędy.includes("niepusty temat"));
    sprawdzWarunek(błędy.includes("Ostatni wiersz"));
    sprawdzWarunek(błędy.includes("suma kontrolna"));
  });

  test("Generator sterowany profilem zachowuje wszystkie warianty SEMPER", function sprawdź() {
    [1, 2, 3].forEach(function sprawdźLiczbęDni(liczbaDni) {
      ["online", "stacjonarna"].forEach(function sprawdźFormę(forma) {
        const wszystkieDaty = ["10-09-2027", "11-09-2027", "12-09-2027"];
        const daty = wszystkieDaty.slice(0, liczbaDni);
        const dane = { daty: daty, tematSzkolenia: "Regresja SEMPER", czyOnline: forma === "online" };
        const dotychczasowe = asystent.zbudujPozycjeHarmonogramu(dane);
        const wynik = asystent.generujHarmonogramDlaTerminu({
          profilId: "semper",
          forma: forma,
          dataStartBur: daty[0],
          dataKoniecBur: daty[daty.length - 1],
          tematSzkolenia: dane.tematSzkolenia
        });
        sprawdzWarunek(wynik.ok, wynik.komunikat);
        sprawdźListę(wynik.pozycje, dotychczasowe, "Regresja SEMPER dla " + forma + " / " + liczbaDni + " dni.");
      });
    });
  });

  test("Manifest i pozostałe loadery ładują szablony przed generatorem", async function sprawdź() {
    const manifest = await fetch("../manifest.json").then(function odczytaj(odpowiedź) { return odpowiedź.json(); });
    manifest.content_scripts.filter(function wybierz(wpis) { return wpis.js.includes("shared/bur-program-harmonogram.js"); }).forEach(function sprawdźWpis(wpis) {
      sprawdzWarunek(wpis.js.indexOf("shared/szablony-harmonogramow.js") < wpis.js.indexOf("shared/bur-program-harmonogram.js"));
    });
    const panelHtml = await fetch("../panel/panel.html").then(function odczytaj(odpowiedź) { return odpowiedź.text(); });
    const panelJs = await fetch("../panel/panel.js").then(function odczytaj(odpowiedź) { return odpowiedź.text(); });
    sprawdzWarunek(panelHtml.indexOf("szablony-harmonogramow.js") < panelHtml.indexOf("bur-program-harmonogram.js"));
    sprawdzWarunek(panelJs.indexOf("szablony-harmonogramow.js") < panelJs.indexOf("bur-program-harmonogram.js"));
  });
})(globalThis);
