(function testyWypełniaczaBur() {
  const bur = window.BurAsystent;

  function utwórzDokumentWypełniania() {
    const dokument = document.implementation.createHTMLDocument("BUR wypełnianie");

    dokument.body.innerHTML = [
      "<section>",
      "<h2>Formularz wstępny</h2>",
      "<div class=\"form-group\"><label>Forma świadczenia usługi</label><span id=\"select2-formularzwstepnysekcja-formaswiadczenia-container\" title=\"\"></span></div>",
      "<div class=\"form-group\"><label>Wariant zajęć</label><span id=\"select2-formularzwstepnysekcja-wariantzajec-container\" title=\"\"></span></div>",
      "<div class=\"form-group\"><label>Podstawa uzyskania wpisu do BUR</label><span id=\"select2-formularzwstepnysekcja-podstawauzyskaniawpisuid-container\" title=\"\"></span></div>",
      "<div class=\"form-group\"><span>Usługa zamknięta</span><label id=\"formularzwstepnysekcja-czyuslugadedykowanaLabel\"><button>TAK</button><button>NIE</button></label></div>",
      "</section>",
      "<section>",
      "<h2>Informacje podstawowe</h2>",
      "<label for=\"informacjepodstawowesekcja-tytuluslugi\">Tytuł</label><input id=\"informacjepodstawowesekcja-tytuluslugi\">",
      "<label for=\"informacjepodstawowesekcja-datarozpoczeciauslugi\">Data rozpoczęcia usługi</label><input id=\"informacjepodstawowesekcja-datarozpoczeciauslugi\">",
      "<label for=\"informacjepodstawowesekcja-datazakonczeniauslugi\">Data zakończenia usługi</label><input id=\"informacjepodstawowesekcja-datazakonczeniauslugi\">",
      "<label for=\"informacjepodstawowesekcja-datazakonczeniarekrutacji\">Data zakończenia rekrutacji</label><input id=\"informacjepodstawowesekcja-datazakonczeniarekrutacji\">",
      "<div id=\"informacjepodstawowesekcja-grupadocelowauslugi-wysiwyg\"><div class=\"ql-editor\"></div></div>",
      "<label for=\"informacjepodstawowesekcja-minimalnaliczbauczestnikow\">Minimalna liczba uczestników</label><input id=\"informacjepodstawowesekcja-minimalnaliczbauczestnikow\">",
      "<label for=\"informacjepodstawowesekcja-maksymalnaliczbauczestnikow\">Maksymalna liczba uczestników</label><input id=\"informacjepodstawowesekcja-maksymalnaliczbauczestnikow\">",
      "</section>",
      "<section id=\"qualificationsZrk\">",
      "<h2>Główny cel usługi</h2>",
      "<div class=\"form-group\"><span>Cel edukacyjny</span><button>TAK</button><button>NIE</button></div>",
      "<textarea id=\"glownyceluslugisekcja-celedukacyjnyopis\"></textarea>",
      "<div class=\"field-glownyceluslugisekcja-czyuslugadajekwalifikacjezrk form-group\"><span>Czy usługa pozwala na uzyskanie kwalifikacji włączonej do ZSK?</span><button>TAK</button><button>NIE</button></div>",
      "<div class=\"field-glownyceluslugisekcja-czyuslugadajekwalifikacjeinnenizzrk form-group\"><span>Czy usługa pozwala na uzyskanie kwalifikacji niewłączonych do ZSK?</span><button>TAK</button><button>NIE</button></div>",
      "<div class=\"field-glownyceluslugisekcja-czyuslugaprowadzidonabyciakompetencji form-group\"><span>Czy usługa prowadzi do nabycia kompetencji?</span><button>TAK</button><button>NIE</button></div>",
      "<div class=\"form-group\"><span>Czy dokument potwierdzający uzyskanie kompetencji</span><button>TAK</button><button>NIE</button></div>",
      "<div class=\"form-group\"><span>Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają, że walidacja</span><button>TAK</button><button>NIE</button></div>",
      "<div class=\"form-group\"><span>Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają zastosowanie rozwiązań</span><button>TAK</button><button>NIE</button></div>",
      "<table><caption>Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji</caption>",
      "<tr><th>Efekty uczenia się</th><th>Kryteria weryfikacji</th><th>Metody walidacji</th></tr>",
      "<tr><td><input></td><td><input></td><td><span id=\"select2-metoda-container\"></span></td></tr>",
      "</table>",
      "</section>"
    ].join("");

    return dokument;
  }

  function utwórzKontekst(forma) {
    return {
      szkolenieSemper: {
        tytułPoNormalizacjiBur: "Zażółć gęślą jaźń. Szkolenie",
        sekcje: {
          grupaDocelowa: "Grupa docelowa obejmuje osoby z Łodzi.",
          celSzkolenia: "Cel szkolenia obejmuje ćwiczenia praktyczne."
        }
      },
      wybranyTermin: {
        forma: forma || "online",
        miejsce: forma === "stacjonarna" ? "Łódź" : "Szkolenie online",
        dataStartBur: "06-07-2027",
        dataKoniecBur: "07-07-2027",
        dataZakończeniaRekrutacjiBur: "05-07-2027"
      }
    };
  }

  test("ustawWartośćPola ustawia input i wywołuje input/change", function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Pole");
    const input = dokument.createElement("input");
    const zdarzenia = [];

    input.addEventListener("input", function zapisz() { zdarzenia.push("input"); });
    input.addEventListener("change", function zapisz() { zdarzenia.push("change"); });
    bur.ustawWartośćPola(input, "Zażółć");

    sprawdzRownosc(input.value, "Zażółć");
    sprawdzWarunek(zdarzenia.includes("input"), "Brak zdarzenia input.");
    sprawdzWarunek(zdarzenia.includes("change"), "Brak zdarzenia change.");
  });

  test("ustawWartośćQuill ustawia .ql-editor", function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Quill");

    dokument.body.innerHTML = "<div><div class=\"ql-editor\"></div></div>";
    bur.ustawWartośćQuill(dokument.body, "Akapit z ąęł");

    sprawdzWarunek(dokument.querySelector(".ql-editor").textContent.includes("ąęł"), "Quill powinien zachować polskie znaki.");
  });

  test("wypełnijFormularzBur ustawia tytuł", function sprawdź() {
    const dokument = utwórzDokumentWypełniania();

    bur.wypełnijFormularzBur(dokument, utwórzKontekst());
    sprawdzRownosc(dokument.querySelector("#informacjepodstawowesekcja-tytuluslugi").value, "Zażółć gęślą jaźń. Szkolenie");
  });

  test("wypełnijFormularzBur ustawia daty", function sprawdź() {
    const dokument = utwórzDokumentWypełniania();

    bur.wypełnijFormularzBur(dokument, utwórzKontekst());
    sprawdzRownosc(dokument.querySelector("#informacjepodstawowesekcja-datarozpoczeciauslugi").value, "06-07-2027");
    sprawdzRownosc(dokument.querySelector("#informacjepodstawowesekcja-datazakonczeniauslugi").value, "07-07-2027");
    sprawdzRownosc(dokument.querySelector("#informacjepodstawowesekcja-datazakonczeniarekrutacji").value, "05-07-2027");
  });

  test("wypełnijFormularzBur ustawia minimalną i maksymalną liczbę uczestników", function sprawdź() {
    const dokument = utwórzDokumentWypełniania();

    bur.wypełnijFormularzBur(dokument, utwórzKontekst("stacjonarna"));
    sprawdzRownosc(dokument.querySelector("#informacjepodstawowesekcja-minimalnaliczbauczestnikow").value, "5");
    sprawdzRownosc(dokument.querySelector("#informacjepodstawowesekcja-maksymalnaliczbauczestnikow").value, "15");
  });

  test("wypełnijFormularzBur ustawia grupę docelową", function sprawdź() {
    const dokument = utwórzDokumentWypełniania();

    bur.wypełnijFormularzBur(dokument, utwórzKontekst());
    sprawdzWarunek(dokument.querySelector(".ql-editor").textContent.includes("Łodzi"), "Grupa docelowa powinna być wpisana.");
  });

  test("wypełnijFormularzBur zwraca ostrzeżenie, jeśli pole nie istnieje", function sprawdź() {
    const dokument = utwórzDokumentWypełniania();
    const pole = dokument.querySelector("#informacjepodstawowesekcja-tytuluslugi");
    const etykieta = dokument.querySelector("label[for='informacjepodstawowesekcja-tytuluslugi']");

    pole.remove();
    etykieta.remove();
    const wynik = bur.wypełnijFormularzBur(dokument, utwórzKontekst());
    const ostrzeżenie = wynik.ostrzeżenia.find(function znajdź(pozycja) {
      return pozycja.pole === "Tytuł";
    });

    sprawdzWarunek(Boolean(ostrzeżenie), "Brak ostrzeżenia o pominiętym tytule.");
  });

  test("wypełnijFormularzBur zachowuje polskie znaki", function sprawdź() {
    const dokument = utwórzDokumentWypełniania();

    bur.wypełnijFormularzBur(dokument, utwórzKontekst());
    sprawdzWarunek(dokument.querySelector("#informacjepodstawowesekcja-tytuluslugi").value.includes("Zażółć"), "Tytuł powinien zachować polskie znaki.");
    sprawdzWarunek(dokument.querySelector(".ql-editor").textContent.includes("Łodzi"), "Grupa docelowa powinna zachować polskie znaki.");
    sprawdzWarunek(dokument.querySelector("#glownyceluslugisekcja-celedukacyjnyopis").value.includes("ćwiczenia"), "Cel edukacyjny powinien zachować polskie znaki.");
  });

  test("ustawSelect2PoTekście ustawia Select2 z ukrytym select", function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Select2");

    dokument.body.innerHTML = [
      "<div class=\"form-group\">",
      "<select id=\"forma\"><option value=\"\"></option><option value=\"online\">online</option></select>",
      "<span id=\"select2-forma-container\"></span>",
      "</div>"
    ].join("");

    const ok = bur.ustawSelect2PoTekście(dokument, dokument.querySelector("#select2-forma-container"), "online");

    sprawdzWarunek(ok, "Select2 z ukrytym select powinien zwrócić sukces.");
    sprawdzRownosc(dokument.querySelector("#forma").value, "online");
  });

  test("Select2 bez ukrytego select daje ostrzeżenie, nie pełny sukces", function sprawdź() {
    const dokument = utwórzDokumentWypełniania();
    const wynik = bur.wypełnijFormularzBur(dokument, utwórzKontekst());
    const uzupełnionaForma = wynik.uzupełnione.find(function znajdź(pozycja) {
      return pozycja.pole === "Forma świadczenia usługi";
    });
    const ostrzeżenie = wynik.ostrzeżenia.find(function znajdź(pozycja) {
      return /Select2 wygląda na ustawiony wizualnie/.test(pozycja.komunikat || "");
    });

    sprawdzWarunek(!uzupełnionaForma, "Select2 bez pola technicznego nie powinien być pełnym sukcesem.");
    sprawdzWarunek(Boolean(ostrzeżenie), "Powinno pojawić się ostrzeżenie o braku potwierdzenia technicznego.");
  });

  test("adapter BUR nie zapisuje pola już zgodnego", async function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Adapter");
    dokument.body.innerHTML = "<input id=\"tytul\" value=\"Zażółć\">";
    const wynik = await bur.ustawPoleBurZWeryfikacją(dokument, { pole: "Tytuł", wartość: "Zażółć", definicja: { selektory: ["#tytul"] } });
    sprawdzRownosc(wynik.status, "już_zgodne");
  });

  test("adapter BUR potwierdza odczyt po zapisie inputa", async function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Adapter");
    dokument.body.innerHTML = "<input id=\"tytul\">";
    const wynik = await bur.ustawPoleBurZWeryfikacją(dokument, { pole: "Tytuł", wartość: "Łódź", definicja: { selektory: ["#tytul"] } });
    sprawdzWarunek(wynik.ok && wynik.wartośćPo === "Łódź", "Zapis powinien być potwierdzony.");
  });

  test("adapter BUR nie nadpisuje konfliktu bez decyzji", async function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Adapter");
    dokument.body.innerHTML = "<input id=\"tytul\" value=\"Istniejący\">";
    const wynik = await bur.ustawPoleBurZWeryfikacją(dokument, { pole: "Tytuł", wartość: "Nowy", definicja: { selektory: ["#tytul"] } });
    sprawdzRownosc(wynik.kodBłędu, "KONFLIKT_WARTOŚCI");
  });

  test("adapter BUR zapisuje datę do tekstowego inputa i potwierdza zdarzenia", async function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Data tekstowa");
    dokument.body.innerHTML = "<div id='informacjepodstawowesekcja-datarozpoczeciauslugi'><input placeholder='dd-mm-yyyy'></div>";
    const input = dokument.querySelector("input"); const zdarzenia = []; let rozmyto = false;
    ["input", "change"].forEach(function nasłuchuj(typ) { input.addEventListener(typ, function zapisz() { zdarzenia.push(typ); }); });
    input.blur = function rozmyj() { rozmyto = true; };
    const wynik = await bur.ustawPoleBurZWeryfikacją(dokument, { typPola: "data", wartość: "03-06-2027", definicja: { selektory: ["#informacjepodstawowesekcja-datarozpoczeciauslugi"] } });
    sprawdzWarunek(wynik.ok && input.value === "03-06-2027"); sprawdzWarunek(zdarzenia.includes("input") && zdarzenia.includes("change") && rozmyto);
  });

  test("adapter BUR zapisuje i porównuje input typu date", async function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Data techniczna");
    dokument.body.innerHTML = "<input id='informacjepodstawowesekcja-datazakonczeniauslugi' type='date'>";
    const wynik = await bur.ustawPoleBurZWeryfikacją(dokument, { typPola: "data", wartość: "03.06.2027", definicja: { selektory: ["#informacjepodstawowesekcja-datazakonczeniauslugi"] } });
    sprawdzWarunek(wynik.ok && dokument.querySelector("input").value === "2027-06-03"); sprawdzRownosc(wynik.wartośćTechnicznaPo, "2027-06-03");
  });

  test("adapter BUR obsługuje trzy pola dat oraz wylicza rekrutację", async function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Daty BUR");
    dokument.body.innerHTML = "<input id='informacjepodstawowesekcja-datarozpoczeciauslugi'><input id='informacjepodstawowesekcja-datazakonczeniauslugi' type='date'><input id='informacjepodstawowesekcja-datazakonczeniarekrutacji'>";
    const definicje = bur.pobierzDefinicjePólWypełnieniaBur({ szkolenieSemper: {}, wybranyTermin: { dataStartBur: "03-06-2027", dataKoniecBur: "04-06-2027" } }).filter(function tylkoDaty(pozycja) { return pozycja.typPola === "data"; });
    for (let indeks = 0; indeks < definicje.length; indeks += 1) { const pozycja = definicje[indeks]; const wynik = await bur.ustawPoleBurZWeryfikacją(dokument, { typPola: "data", wartość: pozycja.wartośćProponowana, definicja: pozycja.definicjaPola }); sprawdzWarunek(wynik.ok); }
    sprawdzRownosc(dokument.querySelector("#informacjepodstawowesekcja-datarozpoczeciauslugi").value, "03-06-2027"); sprawdzRownosc(dokument.querySelector("#informacjepodstawowesekcja-datazakonczeniauslugi").value, "2027-06-04"); sprawdzRownosc(dokument.querySelector("#informacjepodstawowesekcja-datazakonczeniarekrutacji").value, "02-06-2027");
  });

  test("adapter BUR odrzuca niedostępne lub nieistniejące pole daty", async function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Błędy dat");
    dokument.body.innerHTML = "<input id='readonly' readonly>";
    const niedostępne = await bur.ustawPoleBurZWeryfikacją(dokument, { typPola: "data", wartość: "03-06-2027", definicja: { selektory: ["#readonly"] } });
    const brak = await bur.ustawPoleBurZWeryfikacją(dokument, { typPola: "data", wartość: "03-06-2027", definicja: { selektory: ["#brak"] } });
    sprawdzRownosc(niedostępne.kodBłędu, "POLE_DATY_NIEDOSTEPNE"); sprawdzRownosc(brak.kodBłędu, "BRAK_ELEMENTU");
  });
})();
