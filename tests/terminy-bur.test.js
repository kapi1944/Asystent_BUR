(function testyTerminówBur() {
  const bur = window.BurAsystent;
  const terminy = [
    { dataStartBur: "21-06-2027", dataKoniecBur: "22-06-2027", miejsce: "Gdańsk", forma: "stacjonarna" },
    { dataStartBur: "21-06-2027", dataKoniecBur: "22-06-2027", miejsce: "Warszawa", forma: "stacjonarna" },
    { dataStartBur: "21-06-2027", dataKoniecBur: "22-06-2027", miejsce: "Szkolenie online", forma: "online" },
    { dataStartBur: "15-10-2027", dataKoniecBur: "16-10-2027", miejsce: "Wrocław", forma: "stacjonarna" },
    { dataStartBur: "15-10-2027", dataKoniecBur: "16-10-2027", miejsce: "Szkolenie online", forma: "online" }
  ];

  test("formatuje zakres dat w tym samym miesiącu", function sprawdź() {
    sprawdzRownosc(bur.formatujZakresDatPrezentacyjny("2027-06-21", "2027-06-22"), "21–22.06.2027");
  });

  test("formatuje zakres dat między miesiącami", function sprawdź() {
    sprawdzRownosc(bur.formatujZakresDatPrezentacyjny("2027-06-30", "2027-07-01"), "30.06–01.07.2027");
  });

  test("formatuje zakres dat między latami", function sprawdź() {
    sprawdzRownosc(bur.formatujZakresDatPrezentacyjny("2027-12-31", "2028-01-02"), "31.12.2027–02.01.2028");
  });

  test("grupuje kilka lokalizacji pod jednym zakresem dat", function sprawdź() {
    const grupy = bur.grupujTerminySemper(terminy, "wszystkie");
    sprawdzRownosc(grupy.length, 2);
    sprawdzRownosc(grupy[0].etykieta, "21–22.06.2027");
    sprawdzRownosc(grupy[0].pozycje.length, 3);
  });

  test("grupuje razem terminy online i stacjonarne", function sprawdź() {
    const pierwsza = bur.grupujTerminySemper(terminy, "wszystkie")[0];
    sprawdzWarunek(pierwsza.pozycje.some(function online(pozycja) { return bur.czyTerminOnlineBur(pozycja.termin); }));
    sprawdzWarunek(pierwsza.pozycje.some(function stacjonarny(pozycja) { return !bur.czyTerminOnlineBur(pozycja.termin); }));
  });

  test("upraszcza opis terminu online", function sprawdź() {
    sprawdzRownosc(bur.opiszTerminSemper(terminy[2], 2), "Termin 3 · Online");
  });

  test("filtr Wszystkie zachowuje wszystkie terminy", function sprawdź() {
    sprawdzRownosc(bur.filtrujTerminySemper(terminy, "wszystkie").length, 5);
  });

  test("filtr Stacjonarne pokazuje tylko terminy stacjonarne", function sprawdź() {
    const wynik = bur.filtrujTerminySemper(terminy, "stacjonarne");
    sprawdzRownosc(wynik.length, 3);
    sprawdzWarunek(wynik.every(function stacjonarny(pozycja) { return !bur.czyTerminOnlineBur(pozycja.termin); }));
  });

  test("filtr Online pokazuje tylko terminy online", function sprawdź() {
    const wynik = bur.filtrujTerminySemper(terminy, "online");
    sprawdzRownosc(wynik.length, 2);
    sprawdzWarunek(wynik.every(function online(pozycja) { return bur.czyTerminOnlineBur(pozycja.termin); }));
  });

  test("filtrowanie nie pozostawia pustych grup", function sprawdź() {
    const grupy = bur.grupujTerminySemper(terminy.slice(0, 4), "online");
    sprawdzRownosc(grupy.length, 1);
    sprawdzRownosc(grupy[0].pozycje.length, 1);
  });

  test("filtr nie modyfikuje danych źródłowych", function sprawdź() {
    const kopia = JSON.stringify(terminy);
    bur.grupujTerminySemper(terminy, "online");
    sprawdzRownosc(JSON.stringify(terminy), kopia);
  });

  test("filtr nie zmienia wybranego terminu", function sprawdź() {
    const wybranyIndeks = 1;
    bur.filtrujTerminySemper(terminy, "online");
    sprawdzRownosc(wybranyIndeks, 1);
  });

  test("automatycznie dopasowuje termin po identycznych datach", function sprawdź() {
    const wynik = bur.dopasujTerminSemperDoBur([terminy[3]], { dataRozpoczęcia: "2027-10-15", dataZakończenia: "2027-10-16" });
    sprawdzRownosc(wynik.status, "dopasowany");
    sprawdzRownosc(wynik.indeks, 0);
  });

  test("rozstrzyga kilka terminów za pomocą trybu", function sprawdź() {
    const wynik = bur.dopasujTerminSemperDoBur(terminy.slice(0, 3), { dataRozpoczęcia: "21-06-2027", dataZakończenia: "22-06-2027", tryb: "online" });
    sprawdzRownosc(wynik.indeks, 2);
    sprawdzRownosc(wynik.kryterium, "tryb");
  });

  test("rozstrzyga kilka terminów za pomocą lokalizacji", function sprawdź() {
    const wynik = bur.dopasujTerminSemperDoBur(terminy.slice(0, 2), { dataRozpoczęcia: "21.06.2027", dataZakończenia: "22.06.2027", tryb: "stacjonarna", lokalizacja: "Warszawa" });
    sprawdzRownosc(wynik.indeks, 1);
    sprawdzRownosc(wynik.kryterium, "lokalizacja");
  });

  test("nie wybiera arbitralnie jednego z kilku zgodnych terminów", function sprawdź() {
    const wynik = bur.dopasujTerminSemperDoBur(terminy.slice(0, 2), { dataRozpoczęcia: "21-06-2027", dataZakończenia: "22-06-2027" });
    sprawdzRownosc(wynik.status, "niejednoznaczny");
    sprawdzRownosc(wynik.indeks, null);
  });

  test("zgłasza brak dopasowania", function sprawdź() {
    const wynik = bur.dopasujTerminSemperDoBur(terminy, { dataRozpoczęcia: "01-01-2028", dataZakończenia: "02-01-2028" });
    sprawdzRownosc(wynik.status, "brak");
  });

  test("po zmianie terminu BUR wskazuje nowy termin zamiast poprzedniego", function sprawdź() {
    const lista = [terminy[0], terminy[3]];
    const nowy = bur.dopasujTerminSemperDoBur(lista, { dataRozpoczęcia: "15-10-2027", dataZakończenia: "16-10-2027" });
    sprawdzRownosc(nowy.indeks, 1);
    sprawdzWarunek(!bur.czyDatyTerminówZgodne(lista[0], { dataRozpoczęcia: "15-10-2027", dataZakończenia: "16-10-2027" }));
  });

  test("stary termin nie jest uznawany po cichu za zgodny", function sprawdź() {
    sprawdzRownosc(bur.czyDatyTerminówZgodne(terminy[0], { dataRozpoczęcia: "15-10-2027", dataZakończenia: "16-10-2027" }), false);
  });

  test("niejednoznaczne dopasowanie blokuje automatyczny wybór do przygotowania", function sprawdź() {
    const wynik = bur.dopasujTerminSemperDoBur(terminy.slice(0, 2), { dataRozpoczęcia: "21-06-2027", dataZakończenia: "22-06-2027" });
    sprawdzWarunek(wynik.status === "niejednoznaczny" && wynik.indeks === null);
  });

  test("zmiana terminu unieważnia zgodność przygotowanego harmonogramu", function sprawdź() {
    const wynik = bur.sprawdźZgodnośćPrzygotowanegoHarmonogramu(
      { dataRozpoczęcia: "17-05-2027", dataZakończenia: "18-05-2027" },
      { dataRozpoczęcia: "21-06-2027", dataZakończenia: "22-06-2027" }
    );
    sprawdzRownosc(wynik.ok, false);
  });

  test("blokuje wprowadzenie harmonogramu przygotowanego dla innych dat", function sprawdź() {
    const wynik = bur.sprawdźZgodnośćPrzygotowanegoHarmonogramu(
      { dataRozpoczęcia: "2027-05-17", dataZakończenia: "2027-05-18" },
      { dataRozpoczęcia: "2027-06-21", dataZakończenia: "2027-06-22" }
    );
    sprawdzWarunek(!wynik.ok);
    sprawdzRownosc(bur.formatujZakresDatPrezentacyjny(wynik.datyBur.dataRozpoczęcia, wynik.datyBur.dataZakończenia), "21–22.06.2027");
  });

  test("automatyczne dopasowanie przeszukuje pełną listę niezależnie od filtra", function sprawdź() {
    const widoczne = bur.filtrujTerminySemper(terminy.slice(0, 3), "stacjonarne");
    const dopasowanie = bur.dopasujTerminSemperDoBur(terminy.slice(0, 3), { dataRozpoczęcia: "21-06-2027", dataZakończenia: "22-06-2027", tryb: "online" });
    sprawdzWarunek(!widoczne.some(function online(pozycja) { return pozycja.indeks === 2; }));
    sprawdzRownosc(dopasowanie.indeks, 2);
  });
})();
