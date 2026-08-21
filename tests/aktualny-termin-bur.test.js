(function testyOdczytuAktualnegoTerminuBur() {
  test("odczytuje daty, tryb i lokalizację z formularza BUR", function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Termin BUR");
    dokument.body.innerHTML = [
      "<label for='informacjepodstawowesekcja-tytuluslugi'>Tytuł</label>",
      "<input id='informacjepodstawowesekcja-tytuluslugi' value='Prawo ochrony środowiska w praktyce'>",
      "<input id='informacjepodstawowesekcja-datarozpoczeciauslugi' value='21-06-2027'>",
      "<input id='informacjepodstawowesekcja-datazakonczeniauslugi' type='date' value='2027-06-22'>",
      "<span id='select2-formularzwstepnysekcja-formaswiadczenia-container' title='stacjonarna'>stacjonarna</span>",
      "<input id='lokalizacjauslugisekcja-miasto' value='Warszawa'>"
    ].join("");
    const wynik = window.BurAsystent.odczytajAktualnyTerminBur(dokument);

    sprawdzRownosc(wynik.tytuł, "Prawo ochrony środowiska w praktyce");
    sprawdzRownosc(wynik.dataRozpoczęcia, "2027-06-21");
    sprawdzRownosc(wynik.dataZakończenia, "2027-06-22");
    sprawdzRownosc(wynik.tryb, "stacjonarna");
    sprawdzRownosc(wynik.lokalizacja, "Warszawa");
  });

  test("odczytuje tytuł BUR przez powiązaną etykietę, gdy brak znanego id i name", function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Tytuł BUR");
    dokument.body.innerHTML = "<div class='form-group'><label for='pole-aktualnego-tytulu'>Tytuł</label><input id='pole-aktualnego-tytulu' value='Tytuł z formularza BUR'></div>";

    const wynik = window.BurAsystent.odczytajAktualnyTerminBur(dokument);

    sprawdzRownosc(wynik.tytuł, "Tytuł z formularza BUR");
  });

  test("odczyt aktualnego terminu BUR działa bez lokalizacji", function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Termin BUR bez lokalizacji");
    dokument.body.innerHTML = "<input id='informacjepodstawowesekcja-datarozpoczeciauslugi' value='21.06.2027'><input id='informacjepodstawowesekcja-datazakonczeniauslugi' value='22.06.2027'>";
    const wynik = window.BurAsystent.odczytajAktualnyTerminBur(dokument);

    sprawdzRownosc(wynik.dataRozpoczęcia, "2027-06-21");
    sprawdzRownosc(wynik.dataZakończenia, "2027-06-22");
    sprawdzRownosc(wynik.lokalizacja, "");
  });

  test("odczytuje miejscowość po etykiecie w sekcji Lokalizacja usługi", function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Lokalizacja terminu BUR");
    dokument.body.innerHTML = [
      "<span id='select2-formularzwstepnysekcja-formaswiadczenia-container'>stacjonarna</span>",
      "<fieldset><legend>Lokalizacja usługi</legend>",
      "<div class='form-group'><label for='pole-miejscowosci'>Miejscowość *</label>",
      "<input id='pole-miejscowosci' value='Gdańsk'></div></fieldset>"
    ].join("");

    const wynik = window.BurAsystent.odczytajAktualnyTerminBur(dokument);

    sprawdzRownosc(wynik.tryb, "stacjonarna");
    sprawdzRownosc(wynik.lokalizacja, "Gdańsk");
  });

  test("ignoruje ukrytą lokalizację dla terminu online", function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Termin online BUR");
    dokument.body.innerHTML = [
      "<span id='select2-formularzwstepnysekcja-formaswiadczenia-container'>online</span>",
      "<input id='lokalizacjauslugisekcja-miasto' value='Warszawa'>"
    ].join("");

    const wynik = window.BurAsystent.odczytajAktualnyTerminBur(dokument);

    sprawdzRownosc(wynik.tryb, "online");
    sprawdzRownosc(wynik.lokalizacja, "");
  });

  test("zmiana miejscowości znalezionej po etykiecie automatycznie powiadamia panel", function sprawdź() {
    const kontener = document.createElement("fieldset");
    window.chrome.runtime = window.chrome.runtime || {};
    const poprzednieWysyłanie = window.chrome.runtime.sendMessage;
    let wiadomość = null;
    kontener.innerHTML = [
      "<legend>Lokalizacja usługi</legend>",
      "<label for='nietypowe-pole-miejscowosci'>Miejscowość *</label>",
      "<input id='nietypowe-pole-miejscowosci' value='Kraków'>"
    ].join("");
    document.body.appendChild(kontener);
    window.chrome.runtime.sendMessage = function zapiszWiadomość(dane) { wiadomość = dane; };
    kontener.querySelector("input").dispatchEvent(new Event("input", { bubbles: true }));

    return new Promise(function poczekaj(resolve, reject) {
      setTimeout(function sprawdźWiadomość() {
        window.chrome.runtime.sendMessage = poprzednieWysyłanie;
        kontener.remove();
        try {
          sprawdzWarunek(Boolean(wiadomość), "Nie wysłano informacji o zmianie miejscowości BUR.");
          sprawdzRownosc(wiadomość.wynik.lokalizacja, "Kraków");
          resolve();
        } catch (błąd) {
          reject(błąd);
        }
      }, 90);
    });
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

  test("zmiana tytułu formularza BUR automatycznie powiadamia panel", function sprawdź() {
    const kontener = document.createElement("div");
    window.chrome.runtime = window.chrome.runtime || {};
    const poprzednieWysyłanie = window.chrome.runtime.sendMessage;
    let wiadomość = null;
    kontener.innerHTML = "<input id='informacjepodstawowesekcja-tytuluslugi' value='Nowy tytuł BUR'>";
    document.body.appendChild(kontener);
    window.chrome.runtime.sendMessage = function zapiszWiadomość(dane) { wiadomość = dane; };
    kontener.firstElementChild.dispatchEvent(new Event("input", { bubbles: true }));

    return new Promise(function poczekaj(resolve, reject) {
      setTimeout(function sprawdźWiadomość() {
        window.chrome.runtime.sendMessage = poprzednieWysyłanie;
        kontener.remove();
        try {
          sprawdzWarunek(Boolean(wiadomość), "Nie wysłano informacji o zmianie tytułu BUR.");
          sprawdzRownosc(wiadomość.wynik.tytuł, "Nowy tytuł BUR");
          resolve();
        } catch (błąd) {
          reject(błąd);
        }
      }, 90);
    });
  });

  test("zwykły input nie uruchamia kosztownego resolvera tytułu", function sprawdź() {
    const poprzedniResolver = window.BurAsystent.znajdźCelFormularzaBur;
    const pole = document.createElement("input");
    let uruchomionoResolver = false;

    window.BurAsystent.znajdźCelFormularzaBur = function oznaczResolver() {
      uruchomionoResolver = true;
      return { ok: false };
    };
    document.body.appendChild(pole);
    pole.dispatchEvent(new Event("input", { bubbles: true }));
    pole.remove();
    window.BurAsystent.znajdźCelFormularzaBur = poprzedniResolver;

    sprawdzWarunek(!uruchomionoResolver, "Zwykły input nie może uruchamiać resolvera pola tytułu.");
  });

  test("ponowne wykonanie content scriptu nie dodaje listenerów terminu", function sprawdź() {
    return fetch("../content/bur-content.js").then(function odczytaj(odpowiedź) {
      return odpowiedź.text();
    }).then(function wykonajPonownie(kod) {
      const poprzednieDodawanie = document.addEventListener;
      let liczbaNowychListenerów = 0;

      document.addEventListener = function policzListenery(typ) {
        if (typ === "input" || typ === "change") {
          liczbaNowychListenerów += 1;
        }
        return poprzednieDodawanie.apply(this, arguments);
      };
      window.eval(kod);
      document.addEventListener = poprzednieDodawanie;

      sprawdzRownosc(liczbaNowychListenerów, 0, "Reiniekcja nie może rejestrować drugiego kompletu listenerów.");
    });
  });
})();
