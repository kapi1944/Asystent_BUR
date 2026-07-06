(function testySelektorówBur() {
  const bur = window.BurAsystent;

  function utwórzDokument(html) {
    const dokument = document.implementation.createHTMLDocument("BUR test");

    dokument.body.innerHTML = html;
    return dokument;
  }

  test("znajdźPolePoSelektorach znajduje input po id", function sprawdź() {
    const dokument = utwórzDokument("<input id=\"pole-testowe\" value=\"Zażółć\">");
    const pole = bur.znajdźPolePoSelektorach(dokument, ["#pole-testowe"]);

    sprawdzWarunek(Boolean(pole), "Pole powinno zostać znalezione.");
    sprawdzRownosc(pole.value, "Zażółć");
  });

  test("znajdźPolePoEtykiecie znajduje pole po tekście etykiety", function sprawdź() {
    const dokument = utwórzDokument("<label for=\"tytul\">Tytuł usługi</label><input id=\"tytul\" value=\"Szkolenie\">");
    const pole = bur.znajdźPolePoEtykiecie(dokument, "Tytuł usługi");

    sprawdzWarunek(Boolean(pole), "Pole powinno zostać znalezione po etykiecie.");
    sprawdzRownosc(pole.value, "Szkolenie");
  });

  test("pobierzTekstSelect2 odczytuje widoczny tekst", function sprawdź() {
    const dokument = utwórzDokument("<span id=\"select2-test-container\" title=\"Zajęcia grupowe\">Zajęcia grupowe</span>");
    const tekst = bur.pobierzTekstSelect2(dokument.body);

    sprawdzRownosc(tekst, "Zajęcia grupowe");
  });

  test("pobierzWartośćQuill odczytuje tekst z ql-editor", function sprawdź() {
    const dokument = utwórzDokument("<div class=\"ql-container\"><div class=\"ql-editor\"><p>Cel szkolenia z polskimi znakami</p></div></div>");
    const tekst = bur.pobierzWartośćQuill(dokument.body);

    sprawdzRownosc(tekst, "Cel szkolenia z polskimi znakami");
  });

  test("pobierzStanPrzełącznika rozpoznaje TAK i NIE", function sprawdź() {
    const dokumentTak = utwórzDokument("<div class=\"form-group\"><span>Cel edukacyjny</span><button class=\"active\">TAK</button><button>NIE</button></div>");
    const dokumentNie = utwórzDokument("<div class=\"form-group\"><span>Usługa zamknięta</span><button>TAK</button><button class=\"active\">NIE</button></div>");

    sprawdzRownosc(bur.pobierzStanPrzełącznika(dokumentTak.body.firstElementChild), "TAK");
    sprawdzRownosc(bur.pobierzStanPrzełącznika(dokumentNie.body.firstElementChild), "NIE");
  });

  test("normalizujTekstDoWalidacji zachowuje sens tekstu z polskimi znakami", function sprawdź() {
    sprawdzRownosc(
      bur.normalizujTekstDoWalidacji("<p>Zażółć&nbsp;&nbsp;gęślą jaźń</p>"),
      "Zażółć gęślą jaźń"
    );
  });

  test("znajdźPoleBur najpierw używa jawnego selektora", function sprawdź() {
    const dokument = utwórzDokument([
      "<section><h2>Informacje podstawowe</h2><label for=\"po-etykiecie\">Tytuł</label><input id=\"po-etykiecie\" value=\"etykieta\"></section>",
      "<input id=\"jawny\" value=\"selektor\">"
    ].join(""));
    const pole = bur.znajdźPoleBur(dokument, {
      sekcja: "Informacje podstawowe",
      etykieta: "Tytuł",
      selektory: ["#jawny"]
    });

    sprawdzRownosc(pole.value, "selektor");
  });
})();
