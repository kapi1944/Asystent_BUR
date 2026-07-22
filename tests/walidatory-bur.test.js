(function testyWalidatorówBur() {
  const bur = window.BurAsystent;

  function utwórzDokumentWalidacji(zmiany) {
    const wartości = Object.assign({
      forma: "online",
      wariant: "Zajęcia grupowe",
      podstawa: "Znak Jakości TGLS Quality Alliance",
      usługaZamknięta: "NIE",
      tytuł: "Zażółć gęślą jaźń. Szkolenie",
      dataStart: "06-07-2027",
      dataKoniec: "07-07-2027",
      dataRekrutacji: "05-07-2027",
      grupaDocelowa: "Grupa docelowa obejmuje osoby dorosłe zainteresowane tematem.",
      minimum: "2",
      maksimum: "15",
      celEdukacyjny: "TAK",
      celOpis: "Cel szkolenia obejmuje rozwój praktycznych umiejętności.",
      zsk: "NIE",
      kwalifikacjeInne: "NIE",
      kompetencje: "TAK",
      pytanie1: "TAK",
      pytanie2: "TAK",
      pytanie3: "TAK",
      efekty: "-",
      kryteria: "-",
      metoda: "Wywiad swobodny"
    }, zmiany || {});
    const dokument = document.implementation.createHTMLDocument("BUR walidacja");
    const aktualnaPodstawa = "Znak Jakości TGLS Quality Alliance";
    const nieaktualnaPodstawa = "(nieaktualna) Znak Jakości TGLS Quality Alliance";
    const dodatkowaOpcja = wartości.podstawa && wartości.podstawa !== aktualnaPodstawa && wartości.podstawa !== nieaktualnaPodstawa
      ? "<option value=\"inna\" selected>" + wartości.podstawa + "</option>"
      : "";
    const opcjePodstawy = [
      "<option value=\"\"" + (!wartości.podstawa ? " selected" : "") + "></option>",
      "<option value=\"stara\"" + (wartości.podstawa === nieaktualnaPodstawa ? " selected" : "") + ">" + nieaktualnaPodstawa + "</option>",
      wartości.brakAktualnejOpcji ? "" : "<option value=\"aktualna\"" + (wartości.podstawa === aktualnaPodstawa ? " selected" : "") + ">" + aktualnaPodstawa + "</option>",
      dodatkowaOpcja
    ].join("");
    const podstawaWidoczna = wartości.podstawaWidoczna === undefined ? wartości.podstawa : wartości.podstawaWidoczna;

    dokument.body.innerHTML = [
      "<section>",
      "<h2>Formularz wstępny</h2>",
      "<div class=\"form-group\"><label>Forma świadczenia usługi</label><span id=\"select2-formularzwstepnysekcja-formaswiadczenia-container\" title=\"" + wartości.forma + "\">" + wartości.forma + "</span></div>",
      "<div class=\"form-group\"><label>Wariant zajęć</label><span id=\"select2-formularzwstepnysekcja-wariantzajec-container\" title=\"" + wartości.wariant + "\">" + wartości.wariant + "</span></div>",
      "<div class=\"form-group\"><label for=\"formularzwstepnysekcja-podstawauzyskaniawpisuid\">Podstawa uzyskania wpisu do BUR</label><select id=\"formularzwstepnysekcja-podstawauzyskaniawpisuid\">" + opcjePodstawy + "</select><span id=\"select2-formularzwstepnysekcja-podstawauzyskaniawpisuid-container\" title=\"" + podstawaWidoczna + "\">" + podstawaWidoczna + "</span></div>",
      "<div class=\"form-group\"><span>Usługa zamknięta</span><label id=\"formularzwstepnysekcja-czyuslugadedykowanaLabel\"><span class=\"active\">" + wartości.usługaZamknięta + "</span></label></div>",
      "</section>",
      "<section>",
      "<h2>Informacje podstawowe</h2>",
      "<label for=\"informacjepodstawowesekcja-tytuluslugi\">Tytuł</label><input id=\"informacjepodstawowesekcja-tytuluslugi\" value=\"" + wartości.tytuł + "\">",
      "<label for=\"informacjepodstawowesekcja-datarozpoczeciauslugi\">Data rozpoczęcia usługi</label><input id=\"informacjepodstawowesekcja-datarozpoczeciauslugi\" value=\"" + wartości.dataStart + "\">",
      "<label for=\"informacjepodstawowesekcja-datazakonczeniauslugi\">Data zakończenia usługi</label><input id=\"informacjepodstawowesekcja-datazakonczeniauslugi\" value=\"" + wartości.dataKoniec + "\">",
      "<label for=\"informacjepodstawowesekcja-datazakonczeniarekrutacji\">Data zakończenia rekrutacji</label><input id=\"informacjepodstawowesekcja-datazakonczeniarekrutacji\" value=\"" + wartości.dataRekrutacji + "\">",
      "<div id=\"informacjepodstawowesekcja-grupadocelowauslugi-wysiwyg\"><div class=\"ql-editor\">" + wartości.grupaDocelowa + "</div></div>",
      "<label for=\"informacjepodstawowesekcja-minimalnaliczbauczestnikow\">Minimalna liczba uczestników</label><input id=\"informacjepodstawowesekcja-minimalnaliczbauczestnikow\" value=\"" + wartości.minimum + "\">",
      "<label for=\"informacjepodstawowesekcja-maksymalnaliczbauczestnikow\">Maksymalna liczba uczestników</label><input id=\"informacjepodstawowesekcja-maksymalnaliczbauczestnikow\" value=\"" + wartości.maksimum + "\">",
      "</section>",
      "<section id=\"qualificationsZrk\">",
      "<h2>Główny cel usługi</h2>",
      "<div class=\"form-group\"><span>Cel edukacyjny</span><button class=\"active\">" + wartości.celEdukacyjny + "</button></div>",
      "<textarea id=\"glownyceluslugisekcja-celedukacyjnyopis\">" + wartości.celOpis + "</textarea>",
      "<div class=\"field-glownyceluslugisekcja-czyuslugadajekwalifikacjezrk form-group\"><span>Czy usługa pozwala na uzyskanie kwalifikacji włączonej do ZSK?</span><button class=\"active\">" + wartości.zsk + "</button></div>",
      "<div class=\"field-glownyceluslugisekcja-czyuslugadajekwalifikacjeinnenizzrk form-group\"><span>Czy usługa pozwala na uzyskanie kwalifikacji niewłączonych do ZSK?</span><button class=\"active\">" + wartości.kwalifikacjeInne + "</button></div>",
      "<div class=\"field-glownyceluslugisekcja-czyuslugaprowadzidonabyciakompetencji form-group\"><span>Czy usługa prowadzi do nabycia kompetencji?</span><button class=\"active\">" + wartości.kompetencje + "</button></div>",
      "<div class=\"form-group\"><span>Czy dokument potwierdzający uzyskanie kompetencji</span><button class=\"active\">" + wartości.pytanie1 + "</button></div>",
      "<div class=\"form-group\"><span>Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają, że walidacja</span><button class=\"active\">" + wartości.pytanie2 + "</button></div>",
      "<div class=\"form-group\"><span>Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają zastosowanie rozwiązań</span><button class=\"active\">" + wartości.pytanie3 + "</button></div>",
      "<table><caption>Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji</caption>",
      "<tr><th>Efekty uczenia się</th><th>Kryteria weryfikacji</th><th>Metody walidacji</th></tr>",
      "<tr><td><input value=\"" + wartości.efekty + "\"></td><td><input value=\"" + wartości.kryteria + "\"></td><td><span id=\"select2-metoda-container\" title=\"" + wartości.metoda + "\">" + wartości.metoda + "</span></td></tr>",
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
          grupaDocelowa: "Grupa docelowa obejmuje osoby dorosłe zainteresowane tematem.",
          celSzkolenia: "Cel szkolenia obejmuje rozwój praktycznych umiejętności."
        }
      },
      wybranyTermin: {
        forma: forma || "online",
        dataStartBur: "06-07-2027",
        dataKoniecBur: "07-07-2027",
        dataZakończeniaRekrutacjiBur: "05-07-2027"
      }
    };
  }

  function znajdźPozycję(wynik, pole) {
    const pozycja = wynik.pozycje.find(function sprawdź(pozycjaWalidacji) {
      return pozycjaWalidacji.pole === pole;
    });

    sprawdzWarunek(Boolean(pozycja), "Brak pozycji walidacji: " + pole);
    return pozycja;
  }

  function sprawdźStatus(pole, zmiany, forma, oczekiwanyStatus) {
    const wynik = bur.walidujFormularzBur(utwórzDokumentWalidacji(zmiany), utwórzKontekst(forma));

    sprawdzRownosc(znajdźPozycję(wynik, pole).status, oczekiwanyStatus, pole);
  }

  test("pusty tytuł daje błąd", function sprawdź() {
    sprawdźStatus("Tytuł", { tytuł: "" }, "online", "błąd");
  });

  test("tytuł z 3-dniowe daje ostrzeżenie", function sprawdź() {
    sprawdźStatus("Tytuł", { tytuł: "Zażółć gęślą jaźń. 3-dniowe Szkolenie" }, "online", "ostrzeżenie");
  });

  test("tytuł po normalizacji jest poprawny", function sprawdź() {
    sprawdźStatus("Tytuł", {}, "online", "poprawne");
  });

  test("tytuł z polskimi znakami porównuje się poprawnie", function sprawdź() {
    sprawdźStatus("Tytuł", { tytuł: "Zazolc gesla jazn. Szkolenie" }, "online", "poprawne");
  });

  test("poprawna data startu jest poprawna", function sprawdź() {
    sprawdźStatus("Data rozpoczęcia usługi", {}, "online", "poprawne");
  });

  test("inna data startu daje ostrzeżenie", function sprawdź() {
    sprawdźStatus("Data rozpoczęcia usługi", { dataStart: "08-07-2027" }, "online", "ostrzeżenie");
  });

  test("pusta data daje błąd", function sprawdź() {
    sprawdźStatus("Data rozpoczęcia usługi", { dataStart: "" }, "online", "błąd");
  });

  test("online minimalna liczba 2 jest poprawna", function sprawdź() {
    sprawdźStatus("Minimalna liczba uczestników", { minimum: "2" }, "online", "poprawne");
  });

  test("stacjonarne minimalna liczba 5 jest poprawna", function sprawdź() {
    sprawdźStatus("Minimalna liczba uczestników", { minimum: "5", forma: "stacjonarna" }, "stacjonarna", "poprawne");
  });

  test("maksymalna liczba 15 jest poprawna", function sprawdź() {
    sprawdźStatus("Maksymalna liczba uczestników", { maksimum: "15" }, "online", "poprawne");
  });

  test("puste wartości uczestników dają błąd", function sprawdź() {
    sprawdźStatus("Minimalna liczba uczestników", { minimum: "" }, "online", "błąd");
    sprawdźStatus("Maksymalna liczba uczestników", { maksimum: "" }, "online", "błąd");
  });

  test("forma świadczenia zgodna z terminem jest poprawna", function sprawdź() {
    sprawdźStatus("Forma świadczenia usługi", { forma: "online" }, "online", "poprawne");
  });

  test("forma świadczenia niezgodna z terminem daje ostrzeżenie", function sprawdź() {
    sprawdźStatus("Forma świadczenia usługi", { forma: "stacjonarna" }, "online", "ostrzeżenie");
  });

  test("wariant zajęć inny niż Zajęcia grupowe daje ostrzeżenie", function sprawdź() {
    sprawdźStatus("Wariant zajęć", { wariant: "Indywidualne" }, "online", "ostrzeżenie");
  });

  test("podstawa wpisu inna niż wymagana daje błąd", function sprawdź() {
    sprawdźStatus("Podstawa uzyskania wpisu do BUR", { podstawa: "Inna podstawa" }, "online", "błąd");
  });

  test("checklista akceptuje aktualny znak jakości", function sprawdź() {
    sprawdźStatus("Podstawa uzyskania wpisu do BUR", {}, "online", "poprawne");
  });

  test("checklista odrzuca nieaktualny znak jakości", function sprawdź() {
    sprawdźStatus("Podstawa uzyskania wpisu do BUR", { podstawa: "(nieaktualna) Znak Jakości TGLS Quality Alliance" }, "online", "błąd");
  });

  test("checklista odrzuca pustą podstawę wpisu", function sprawdź() {
    sprawdźStatus("Podstawa uzyskania wpisu do BUR", { podstawa: "" }, "online", "błąd");
  });

  test("checklista odrzuca brak aktualnej opcji", function sprawdź() {
    const wynik = bur.walidujFormularzBur(utwórzDokumentWalidacji({ podstawa: "(nieaktualna) Znak Jakości TGLS Quality Alliance", brakAktualnejOpcji: true }), utwórzKontekst("online"));
    const pozycja = znajdźPozycję(wynik, "Podstawa uzyskania wpisu do BUR");
    sprawdzRownosc(pozycja.status, "błąd");
    sprawdzWarunek(pozycja.komunikat.includes("nie istnieje"));
  });

  test("checklista ufa natywnemu selectowi, nie wizualnemu tekstowi Select2", function sprawdź() {
    sprawdźStatus("Podstawa uzyskania wpisu do BUR", {
      podstawa: "(nieaktualna) Znak Jakości TGLS Quality Alliance",
      podstawaWidoczna: "Znak Jakości TGLS Quality Alliance"
    }, "online", "błąd");
  });

  test("cel edukacyjny TAK jest poprawny", function sprawdź() {
    sprawdźStatus("Cel edukacyjny", { celEdukacyjny: "TAK" }, "online", "poprawne");
  });

  test("ZSK TAK przy oczekiwanym NIE daje ostrzeżenie", function sprawdź() {
    sprawdźStatus("Czy usługa pozwala na uzyskanie kwalifikacji włączonej do ZSK?", { zsk: "TAK" }, "online", "ostrzeżenie");
  });

  test("kompetencje NIE przy oczekiwanym TAK daje ostrzeżenie", function sprawdź() {
    sprawdźStatus("Czy usługa prowadzi do nabycia kompetencji?", { kompetencje: "NIE" }, "online", "ostrzeżenie");
  });

  test("efekty uczenia się inne niż myślnik dają ostrzeżenie", function sprawdź() {
    sprawdźStatus("Efekty uczenia się", { efekty: "Opis efektu" }, "online", "ostrzeżenie");
  });

  test("metoda walidacji pusta daje błąd", function sprawdź() {
    sprawdźStatus("Wybierz metodę walidacji", { metoda: "" }, "online", "błąd");
  });
})();
