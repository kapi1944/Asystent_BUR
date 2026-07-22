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

  test("zmiana daty formularza BUR automatycznie powiadamia panel", function sprawdź() {
    const kontener = document.createElement("div");
    window.chrome.runtime = window.chrome.runtime || {};
    const poprzednieWysyłanie = window.chrome.runtime.sendMessage;
    let wiadomość = null;
    kontener.innerHTML = "<input id='informacjepodstawowesekcja-datarozpoczeciauslugi' value='21-09-2026'><input id='informacjepodstawowesekcja-datazakonczeniauslugi' value='22-09-2026'>";
    document.body.appendChild(kontener);
    window.chrome.runtime.sendMessage = function zapiszWiadomość(dane) { wiadomość = dane; };
    kontener.querySelector("#informacjepodstawowesekcja-datarozpoczeciauslugi").dispatchEvent(new Event("input", { bubbles: true }));

    return new Promise(function poczekaj(resolve, reject) {
      setTimeout(function sprawdźWiadomość() {
        window.chrome.runtime.sendMessage = poprzednieWysyłanie;
        kontener.remove();
        try {
          sprawdzWarunek(Boolean(wiadomość), "Nie wysłano informacji o zmianie terminu BUR.");
          sprawdzRownosc(wiadomość.typ, "ZMIENIONO_AKTUALNY_TERMIN_BUR");
          sprawdzRownosc(wiadomość.wynik.dataRozpoczęcia, "2026-09-21");
          resolve();
        } catch (błąd) {
          reject(błąd);
        }
      }, 90);
    });
  });
})();
