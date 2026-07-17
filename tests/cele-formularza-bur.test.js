(function testyCelówFormularzaBur() {
  const bur = window.BurAsystent;

  function utwórzDokument(html) {
    const dokument = document.implementation.createHTMLDocument("Cele BUR");
    dokument.body.innerHTML = html;
    return dokument;
  }

  test("rejestr obejmuje wymagane cele formularza", function sprawdź() {
    ["formaSwiadczenia", "dataRozpoczecia", "dataZakonczenia", "dataZakonczeniaRekrutacji", "minimalnaLiczbaUczestnikow", "maksymalnaLiczbaUczestnikow", "liczbaGodzin", "cenaNetto", "lokalizacjaAdres", "osobyProwadzace", "program", "daneKontaktowe", "harmonogram", "publikacja"].forEach(function sprawdźCel(cel) {
      sprawdzWarunek(Boolean(bur.pobierzCelFormularzaBur(cel)), "Brak celu: " + cel);
    });
  });

  test("cel formy świadczenia znajduje widoczny kontener Select2", function sprawdź() {
    const dokument = utwórzDokument("<section><h2>Formularz wstępny</h2><span id='select2-formularzwstepnysekcja-formaswiadczenia-container'>online</span></section>");
    const wynik = bur.znajdźCelFormularzaBur(dokument, "formaSwiadczenia");
    sprawdzWarunek(wynik.ok, "Cel powinien zostać znaleziony.");
    sprawdzRownosc(wynik.element.id, "select2-formularzwstepnysekcja-formaswiadczenia-container");
  });

  test("pozycja walidacji ma stabilny identyfikator i cel formularza", function sprawdź() {
    const pozycja = bur.utwórzPozycjęWalidacjiBur({
      pole: "Forma świadczenia usługi",
      status: "ostrzeżenie"
    });
    sprawdzRownosc(pozycja.id, "formaSwiadczenia");
    sprawdzRownosc(pozycja.celFormularza, "formaSwiadczenia");
  });

  test("zwinięta sekcja celu jest rozwijana", function sprawdź() {
    const dokument = utwórzDokument("<details><summary>Informacje podstawowe</summary><input id='informacjepodstawowesekcja-datarozpoczeciauslugi'></details>");
    const wynik = bur.znajdźCelFormularzaBur(dokument, "dataRozpoczecia");
    sprawdzWarunek(wynik.ok, "Cel powinien zostać znaleziony.");
    sprawdzWarunek(dokument.querySelector("details").open, "Sekcja details powinna zostać rozwinięta.");
  });

  test("brak celu zwraca błąd bez wyjątku", function sprawdź() {
    const wynik = bur.znajdźCelFormularzaBur(utwórzDokument("<main></main>"), "nieistniejacyCel");
    sprawdzWarunek(!wynik.ok, "Nieistniejący cel nie może zostać znaleziony.");
  });
})();
