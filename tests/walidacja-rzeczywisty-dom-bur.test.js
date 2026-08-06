(function testyWalidacjiRzeczywistegoDomBur() {
  const bur = window.BurAsystent;

  async function wczytajFixture(nazwa) {
    const odpowiedź = await fetch("fixtures/" + nazwa);
    sprawdzWarunek(odpowiedź.ok, "Nie udało się wczytać fixture: " + nazwa);
    const dokument = document.implementation.createHTMLDocument("Fixture BUR");
    dokument.body.innerHTML = await odpowiedź.text();
    return dokument;
  }

  function znajdźPozycję(wynik, pole) {
    const pozycja = wynik.pozycje.find(function pasuje(element) { return element.pole === pole; });
    sprawdzWarunek(Boolean(pozycja), "Brak pozycji walidacji: " + pole);
    return pozycja;
  }

  function utwórzKontekstSemper() {
    return {
      profilId: "semper",
      szkolenieSemper: { profilId: "semper", sekcje: {} },
      wybranyTermin: { forma: "stacjonarna" },
      wykryteKontoBur: { nazwaOrganizacji: "Centrum Organizacji Szkoleń i Konferencji SEMPER" }
    };
  }

  test("podświetlanie prawdziwych wierszy pytań i celu edukacyjnego używa odrębnych przełączników TAK", async function sprawdź() {
    const dokument = await wczytajFixture("bur-przelaczniki-walidacji.html");
    sprawdzWarunek(Boolean(dokument.querySelector("#leadsToAcquisitionOfCompetences")), "Nie znaleziono prawdziwej sekcji kompetencji.");
    const wynikiPytań = [1, 2, 3].map(function znajdź(numer) {
      return bur.znajdźPrzełącznikPytaniaKompetencji(dokument, numer);
    });
    const wynikCelu = bur.znajdźPrzełącznikCeluEdukacyjnego(dokument);
    const kontenery = wynikiPytań.map(function pobierz(wynik) { return wynik.element; }).concat(wynikCelu.element);
    const wynikWalidacji = bur.walidujFormularzBur(dokument, utwórzKontekstSemper());

    kontenery.forEach(function sprawdźKontener(kontener) {
      sprawdzWarunek(Boolean(kontener), "Brak kontenera przełącznika.");
      sprawdzRownosc(bur.pobierzStanPrzełącznika(kontener), "TAK");
    });
    sprawdzRownosc(new Set(kontenery).size, 4, "Każdy przełącznik powinien mieć własny kontener.");

    wynikiPytań.forEach(function sprawdźPytanie(wynik, indeks) {
      const numer = indeks + 1;
      const tekst = wynik.element.textContent;
      const pozycja = znajdźPozycję(wynikWalidacji, "Pytanie " + numer + " w sekcji kompetencji");
      sprawdzWarunek(wynik.checkbox.checked, "Checkbox pytania powinien być zaznaczony.");
      sprawdzRownosc(pozycja.aktualnaWartość, "TAK");
      sprawdzRownosc(pozycja.status, "poprawne");
      sprawdzWarunek(pozycja.element === wynik.element, "Walidacja powinna przechowywać wiersz do podświetlenia.");
      sprawdzWarunek(pozycja.element.classList.contains("question-field-section"));
      sprawdzWarunek(tekst.includes("Pytanie " + numer + "."), "Kontener nie zawiera właściwego pytania.");
      [1, 2, 3].filter(function inne(inny) { return inny !== numer; }).forEach(function sprawdźBrak(inny) {
        sprawdzWarunek(!tekst.includes("Pytanie " + inny + "."), "Kontener obejmuje sąsiednie pytanie.");
      });
      sprawdzRownosc(wynik.diagnostyka.liczbaKontrolek, 1);
      sprawdzRownosc(wynik.diagnostyka.stan, "TAK");
      sprawdzRownosc(wynik.diagnostyka.źródłoOdczytu, "checkbox");
      sprawdzRownosc(wynik.diagnostyka.checkboxId, wynik.checkbox.id);
    });

    const pozycjaCelu = znajdźPozycję(wynikWalidacji, "Cel edukacyjny");
    const pozycjaUsługiZamkniętej = znajdźPozycję(wynikWalidacji, "Usługa zamknięta");
    sprawdzRownosc(pozycjaCelu.aktualnaWartość, "TAK");
    sprawdzRownosc(pozycjaCelu.status, "poprawne");
    sprawdzRownosc(pozycjaUsługiZamkniętej.aktualnaWartość, "NIE");
    sprawdzRownosc(pozycjaUsługiZamkniętej.status, "poprawne");

    bur.zastosujWynikWalidacjiNaStronie(dokument, wynikWalidacji);
    wynikiPytań.forEach(function sprawdźPodświetlenie(wynik) {
      sprawdzWarunek(wynik.element.classList.contains("bur-asystent-pole-poprawne"), "Wiersz pytania nie został podświetlony.");
    });
  });

  test("odznaczenie checkboxa zmienia wyłącznie właściwe pytanie", async function sprawdź() {
    const dokument = await wczytajFixture("bur-przelaczniki-walidacji.html");
    dokument.querySelector("#pytanieformularz-czydokumentpotwierdzazewalidacjabazujenakryteriachweryfikacji_v2-czyzaznaczono").checked = false;
    const wynik = bur.walidujFormularzBur(dokument, utwórzKontekstSemper());
    sprawdzRownosc(znajdźPozycję(wynik, "Pytanie 1 w sekcji kompetencji").aktualnaWartość, "TAK");
    sprawdzRownosc(znajdźPozycję(wynik, "Pytanie 1 w sekcji kompetencji").status, "poprawne");
    sprawdzRownosc(znajdźPozycję(wynik, "Pytanie 2 w sekcji kompetencji").aktualnaWartość, "NIE");
    sprawdzRownosc(znajdźPozycję(wynik, "Pytanie 2 w sekcji kompetencji").status, "błąd");
    sprawdzRownosc(znajdźPozycję(wynik, "Pytanie 3 w sekcji kompetencji").aktualnaWartość, "TAK");
    sprawdzRownosc(znajdźPozycję(wynik, "Pytanie 3 w sekcji kompetencji").status, "poprawne");
  });

  test("brak checkboxa pytania nie używa sąsiedniego przełącznika", async function sprawdź() {
    const dokument = await wczytajFixture("bur-przelaczniki-walidacji.html");
    dokument.querySelector("#pytanieformularz-czydokumentzawieraopisefektowuczeniasie_v2-czyzaznaczono").remove();
    const wynikPytania1 = bur.znajdźPrzełącznikPytaniaKompetencji(dokument, 1);
    const wynikPytania2 = bur.znajdźPrzełącznikPytaniaKompetencji(dokument, 2);
    sprawdzRownosc(wynikPytania1.checkbox, null);
    sprawdzRownosc(wynikPytania1.element, null);
    sprawdzWarunek(Boolean(wynikPytania2.checkbox));
    sprawdzRownosc(bur.pobierzStanPrzełącznika(wynikPytania2.checkbox), "TAK");
  });

  test("Usługa zamknięta odczytuje lokalny wizualny stan NIE jako ostatni fallback", async function sprawdź() {
    const dokument = await wczytajFixture("bur-przelaczniki-walidacji.html");
    dokument.querySelector("#formularzwstepnysekcja-czyuslugadedykowana").remove();
    const znalezione = bur.znajdźPrzełącznikUsługiZamkniętej(dokument);
    sprawdzRownosc(bur.pobierzStanPrzełącznika(znalezione.elementDoOdczytu), "NIE");
    sprawdzRownosc(znalezione.diagnostyka.źródłoOdczytu, "wizualny fallback");
    sprawdzWarunek(znalezione.element.classList.contains("form-group"));
  });

  test("prawdziwa tabela osób zwraca czyste wartości i właściwe elementy DOM", async function sprawdź() {
    const dokument = await wczytajFixture("bur-osoby-prowadzace-walidacja.html");
    const znalezione = bur.znajdźCelFormularzaBur(dokument, "osobyProwadzace");
    sprawdzWarunek(znalezione.ok);
    sprawdzRownosc(znalezione.element.id, "osoby-prowadzace-grid");

    const wiersze = Array.from(dokument.querySelectorAll("tr.trainers-row"));
    const komórki = wiersze.map(function pobierz(wiersz) { return Array.from(wiersz.querySelectorAll("td")).slice(0, 4); });
    sprawdzRownosc(bur.pobierzWartośćKomórkiOsoby(komórki[0][0]), "Expert Semper");
    sprawdzRownosc(bur.pobierzWartośćKomórkiOsoby(komórki[1][2]), "Osoba prowadząca uslugę");
    sprawdzWarunek(!bur.pobierzWartośćKomórkiOsoby(komórki[0][0]).includes("TOKEN"), "Token nie może trafić do odczytu imienia.");
    sprawdzWarunek(!bur.pobierzWartośćKomórkiOsoby(komórki[0][0]).includes("Imię i nazwisko"), "Etykieta mobilna nie może trafić do wartości.");

    const wynik = bur.walidujFormularzBur(dokument, utwórzKontekstSemper());
    const oczekiwaneStatusy = [
      ["Koordynator SEMPER — Imię i nazwisko", "błąd", komórki[0][0]],
      ["Koordynator SEMPER — Adres email", "poprawne", komórki[0][1]],
      ["Koordynator SEMPER — Osoba prowadząca usługę/walidację", "poprawne", komórki[0][2]],
      ["Koordynator SEMPER — Opis doświadczenia", "błąd", komórki[0][3]],
      ["Trener SEMPER — Imię i nazwisko", "poprawne", komórki[1][0]],
      ["Trener SEMPER — Adres email", "poprawne", komórki[1][1]],
      ["Trener SEMPER — Osoba prowadząca usługę/walidację", "poprawne", komórki[1][2]],
      ["Trener SEMPER — Opis doświadczenia", "błąd", komórki[1][3]]
    ];

    oczekiwaneStatusy.forEach(function sprawdźPole(dane) {
      const pozycja = znajdźPozycję(wynik, dane[0]);
      sprawdzRownosc(pozycja.status, dane[1], dane[0]);
      sprawdzWarunek(pozycja.element === dane[2], "Pozycja musi wskazywać oryginalne td: " + dane[0]);
      sprawdzWarunek(pozycja.aktualnaWartość !== "-" && Boolean(pozycja.aktualnaWartość), "Istniejąca komórka nie może mieć wartości '-'.");
    });

    const rekordKoordynatora = znajdźPozycję(wynik, "Rekord: Koordynator SEMPER");
    const rekordTrenera = znajdźPozycję(wynik, "Rekord: Trener SEMPER");
    sprawdzWarunek(rekordKoordynatora.element === wiersze[0] && rekordTrenera.element === wiersze[1], "Rekordy muszą wskazywać oryginalne tr.");
    sprawdzRownosc(rekordKoordynatora.diagnostyka.metoda, "email");
    sprawdzRownosc(rekordTrenera.diagnostyka.metoda, "email");
  });

  test("natywne usuwanie obsługuje a.delete-trainer i tytuł usuwania osoby", async function sprawdź() {
    const dokument = await wczytajFixture("bur-osoby-prowadzace-walidacja.html");
    const linki = Array.from(dokument.querySelectorAll("a.delete-trainer"));
    linki[0].removeAttribute("title");
    linki[1].classList.remove("delete-trainer");
    linki.forEach(function obsłuż(link) {
      link.addEventListener("click", function usuń() { link.closest("tr").remove(); });
    });
    const wynik = await bur.zastąpOsobyProwadzące(dokument, []);
    sprawdzWarunek(wynik.ok, wynik.komunikat);
    sprawdzRownosc(wynik.usunięto, 2);
    sprawdzRownosc(dokument.querySelectorAll("tr.trainers-row").length, 0);
  });
})();
