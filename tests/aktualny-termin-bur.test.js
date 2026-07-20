(function testyOdczytuAktualnegoTerminuBur() {
  test("odczytuje daty, tryb i lokalizację z formularza BUR", function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Termin BUR");
    dokument.body.innerHTML = [
      "<input id='informacjepodstawowesekcja-datarozpoczeciauslugi' value='21-06-2027'>",
      "<input id='informacjepodstawowesekcja-datazakonczeniauslugi' type='date' value='2027-06-22'>",
      "<span id='select2-formularzwstepnysekcja-formaswiadczenia-container' title='stacjonarna'>stacjonarna</span>",
      "<input id='lokalizacjauslugisekcja-miasto' value='Warszawa'>"
    ].join("");
    const wynik = window.BurAsystent.odczytajAktualnyTerminBur(dokument);

    sprawdzRownosc(wynik.dataRozpoczęcia, "2027-06-21");
    sprawdzRownosc(wynik.dataZakończenia, "2027-06-22");
    sprawdzRownosc(wynik.tryb, "stacjonarna");
    sprawdzRownosc(wynik.lokalizacja, "Warszawa");
  });

  test("odczyt aktualnego terminu BUR działa bez lokalizacji", function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Termin BUR bez lokalizacji");
    dokument.body.innerHTML = "<input id='informacjepodstawowesekcja-datarozpoczeciauslugi' value='21.06.2027'><input id='informacjepodstawowesekcja-datazakonczeniauslugi' value='22.06.2027'>";
    const wynik = window.BurAsystent.odczytajAktualnyTerminBur(dokument);

    sprawdzRownosc(wynik.dataRozpoczęcia, "2027-06-21");
    sprawdzRownosc(wynik.dataZakończenia, "2027-06-22");
    sprawdzRownosc(wynik.lokalizacja, "");
  });
})();
