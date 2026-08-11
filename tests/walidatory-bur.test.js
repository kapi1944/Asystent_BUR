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
      metoda: "Wywiad swobodny",
      kontaktImięINazwisko: "Angelika Poznańska",
      kontaktEmail: "a.poznanska@szkolenia-semper.pl",
      kontaktTelefon: "(+48) 570 590 060"
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
      "<div class=\"form-group\"><span>Usługa zamknięta</span><label id=\"formularzwstepnysekcja-czyuslugadedykowanaLabel\" for=\"formularzwstepnysekcja-czyuslugadedykowana\"><input type=\"hidden\" value=\"0\"><input type=\"checkbox\" id=\"formularzwstepnysekcja-czyuslugadedykowana\" value=\"1\"" + (wartości.usługaZamknięta === "TAK" ? " checked" : "") + "><span class=\"toggle-switch-label\">" + wartości.usługaZamknięta + "</span><span class=\"toggler\"></span></label></div>",
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
      "<div class=\"form-group\"><div class=\"toggle-switch\"><label for=\"glownyceluslugisekcja-czyceledukacyjny\"><input type=\"hidden\" value=\"0\"><input type=\"checkbox\" id=\"glownyceluslugisekcja-czyceledukacyjny\" name=\"glownyCelUslugiSekcja.czyCelEdukacyjny\" value=\"1\"" + (wartości.celEdukacyjny === "TAK" ? " checked" : "") + "><span class=\"toggle-switch-label\">Cel edukacyjny</span><span class=\"toggler\"></span></label></div></div>",
      "<textarea id=\"glownyceluslugisekcja-celedukacyjnyopis\">" + wartości.celOpis + "</textarea>",
      "<div class=\"field-glownyceluslugisekcja-czyuslugadajekwalifikacjezrk form-group\"><span>Czy usługa pozwala na uzyskanie kwalifikacji włączonej do ZSK?</span><div class=\"toggle-switch\"><input type=\"checkbox\"" + (wartości.zsk === "TAK" ? " checked" : "") + "></div></div>",
      "<div class=\"field-glownyceluslugisekcja-czyuslugadajekwalifikacjeinnenizzrk form-group\"><span>Czy usługa pozwala na uzyskanie kwalifikacji niewłączonych do ZSK?</span><div class=\"toggle-switch\"><input type=\"checkbox\"" + (wartości.kwalifikacjeInne === "TAK" ? " checked" : "") + "></div></div>",
      "<div class=\"field-glownyceluslugisekcja-czyuslugaprowadzidonabyciakompetencji form-group\"><span>Czy usługa prowadzi do nabycia kompetencji?</span><div class=\"toggle-switch\"><input type=\"checkbox\"" + (wartości.kompetencje === "TAK" ? " checked" : "") + "></div></div>",
      "<div id=\"leadsToAcquisitionOfCompetences\" class=\"field-warunki-uznania-kompetencji\">",
      "<div class=\"question-field-section form-group-details-label\"><div class=\"question-field\"><div class=\"form-group\"><div class=\"toggle-switch\"><label><input type=\"hidden\" value=\"0\"><input type=\"checkbox\" id=\"pytanieformularz-czydokumentzawieraopisefektowuczeniasie_v2-czyzaznaczono\" value=\"1\"" + (wartości.pytanie1 === "TAK" ? " checked" : "") + "><span class=\"toggle-switch-label\">Pytanie 1. Czy dokument potwierdzający uzyskanie kompetencji lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem zawierają opis efektów uczenia się?</span><span class=\"toggler\"></span></label></div></div></div></div>",
      "<div class=\"question-field-section form-group-details-label\"><div class=\"question-field\"><div class=\"form-group\"><div class=\"toggle-switch\"><label><input type=\"hidden\" value=\"0\"><input type=\"checkbox\" id=\"pytanieformularz-czydokumentpotwierdzazewalidacjabazujenakryteriachweryfikacji_v2-czyzaznaczono\" value=\"1\"" + (wartości.pytanie2 === "TAK" ? " checked" : "") + "><span class=\"toggle-switch-label\">Pytanie 2. Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają, że walidacja została przeprowadzona w oparciu o zdefiniowane w efektach uczenia się kryteria ich weryfikacji i zgodnie z zaplanowanymi metodami walidacji?</span><span class=\"toggler\"></span></label></div></div></div></div>",
      "<div class=\"question-field-section form-group-details-label\"><div class=\"question-field\"><div class=\"form-group\"><div class=\"toggle-switch\"><label><input type=\"hidden\" value=\"0\"><input type=\"checkbox\" id=\"pytanieformularz-czydokumentpotwierdzaseparacjeprocesowksztalceniaiszkolenia_v2-czyzaznaczono\" value=\"1\"" + (wartości.pytanie3 === "TAK" ? " checked" : "") + "><span class=\"toggle-switch-label\">Pytanie 3. Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają zastosowanie rozwiązań zapewniających rozdzielenie procesów kształcenia i szkolenia od walidacji?</span><span class=\"toggler\"></span></label></div></div></div></div></div>",
      "<h3>Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji</h3><table>",
      "<tr><th>Efekty uczenia się</th><th>Kryteria weryfikacji</th><th>Metody walidacji</th></tr>",
      "<tr><td><input value=\"" + wartości.efekty + "\"></td><td><input value=\"" + wartości.kryteria + "\"></td><td><input value=\"-\"></td><td><span id=\"select2-metoda-container\" title=\"" + wartości.metoda + "\">" + wartości.metoda + "</span></td></tr>",
      "</table>",
      "</section>",
      "<section><h2>Dane kontaktowe</h2>",
      "<input id=\"osobadokontaktusekcja-godnosc\" name=\"OsobaDoKontaktuSekcja[godnosc]\" type=\"text\" value=\"" + wartości.kontaktImięINazwisko + "\">",
      "<input id=\"osobadokontaktusekcja-email\" name=\"OsobaDoKontaktuSekcja[email]\" type=\"text\" value=\"" + wartości.kontaktEmail + "\">",
      "<input id=\"osobadokontaktusekcja-telefon\" name=\"OsobaDoKontaktuSekcja[telefon]\" type=\"text\" value=\"" + wartości.kontaktTelefon + "\">",
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

  function dodajTabelęOsób(dokument, osoby) {
    const tabela = dokument.createElement("table");
    tabela.id = "osoby-prowadzace-grid";
    const ciało = tabela.createTBody();
    osoby.forEach(function dodajOsobę(osoba) {
      const wiersz = ciało.insertRow();
      wiersz.className = "trainers-row";
      [osoba.imięINazwisko, osoba.email, osoba.rola, osoba.opisDoświadczenia].forEach(function dodajPole(wartość, indeksPola) {
        const komórka = wiersz.insertCell();
        const etykieta = dokument.createElement("div");
        const token = dokument.createElement("input");
        etykieta.className = "label-mobile";
        etykieta.textContent = ["Imię i nazwisko", "Adres email", "Rola", "Opis doświadczenia"][indeksPola];
        token.type = "hidden";
        token.value = "TOKEN-" + indeksPola;
        komórka.appendChild(etykieta);
        komórka.appendChild(token);
        komórka.appendChild(dokument.createTextNode(wartość));
      });
      wiersz.insertCell().innerHTML = "<div class=\"label-mobile\">Akcje</div><div class=\"options-content\">Akcje</div>";
    });
    dokument.body.appendChild(tabela);
    return tabela;
  }

  function walidujOsobyProfilu(profilId, osoby) {
    const dokument = utwórzDokumentWalidacji();
    dodajTabelęOsób(dokument, osoby);
    const kontekst = utwórzKontekst("online");
    kontekst.profilId = profilId;
    kontekst.szkolenieSemper.profilId = profilId;
    return bur.walidujFormularzBur(dokument, kontekst);
  }

  function walidujWarunkiUczestnictwa(profilId, forma, tekst) {
    const profil = bur.pobierzProfilDostawcy(profilId);
    const dokument = utwórzDokumentWalidacji({
      kontaktImięINazwisko: profil.daneKontaktowe.imięINazwisko,
      kontaktEmail: profil.daneKontaktowe.email,
      kontaktTelefon: profil.daneKontaktowe.telefon
    });
    const kontener = dokument.createElement("div");
    const edytor = dokument.createElement("div");
    kontener.id = "informacjedodatkowesekcja-warunkiuczestnictwa-wysiwyg";
    edytor.className = "ql-editor";
    edytor.textContent = tekst;
    kontener.appendChild(edytor);
    dokument.body.appendChild(kontener);
    const kontekst = utwórzKontekst(forma);
    kontekst.profilId = profilId;
    kontekst.szkolenieSemper.profilId = profilId;
    return znajdźPozycję(bur.walidujFormularzBur(dokument, kontekst), "Warunki uczestnictwa");
  }

  const WARUNKI_SEMPER = "ZGŁOSZENIE NA USŁUGĘ\nRezerwacji miejsca szkoleniowego można dokonać za pośrednictwem BUR.\nDla jednostek budżetowych finansujących udział w szkoleniu w minimum 70% lub w całości ze środków publicznych stawka podatku VAT = zw.";

  test("warunki SEMPER są wymagane online i stacjonarnie", function sprawdź() {
    ["online", "stacjonarna"].forEach(function sprawdźFormę(forma) {
      sprawdzRownosc(walidujWarunkiUczestnictwa("semper", forma, WARUNKI_SEMPER).status, "poprawne");
    });
  });

  test("brak nagłówka warunków SEMPER daje ostrzeżenie, a brak formuły błąd", function sprawdź() {
    const bezNagłówka = WARUNKI_SEMPER.replace("ZGŁOSZENIE NA USŁUGĘ\n", "");
    const bezFormuły = WARUNKI_SEMPER.replace("Rezerwacji miejsca szkoleniowego można dokonać za pośrednictwem BUR.", "");
    sprawdzRownosc(walidujWarunkiUczestnictwa("semper", "online", bezNagłówka).status, "ostrzeżenie");
    sprawdzRownosc(walidujWarunkiUczestnictwa("semper", "stacjonarna", bezFormuły).status, "błąd");
  });

  test("warunki IIST rozróżniają formę online i stacjonarną", function sprawdź() {
    const warunkiOnline = bur.pobierzProfilDostawcy("iist").warunkiUczestnictwaOnline;
    const warunkiStacjonarne = bur.pobierzProfilDostawcy("iist").warunkiUczestnictwa.stacjonarna;
    sprawdzRownosc(walidujWarunkiUczestnictwa("iist", "online", warunkiOnline).status, "poprawne");
    sprawdzRownosc(walidujWarunkiUczestnictwa("iist", "stacjonarna", warunkiStacjonarne).status, "poprawne");
    sprawdzRownosc(walidujWarunkiUczestnictwa("iist", "online", warunkiStacjonarne).status, "błąd");
  });

  test("brak nagłówka warunków IIST daje ostrzeżenie, a brak formuły błąd", function sprawdź() {
    const warunkiOnline = bur.pobierzProfilDostawcy("iist").warunkiUczestnictwaOnline;
    const bezNagłówka = warunkiOnline.replace("INFORMACJE DOTYCZĄCE ZGŁOSZEŃ\n", "");
    const bezFormuły = warunkiOnline.replace("Walidacja usługi odbędzie się poprzez PRE i POST TESTY przekazane dla uczestników na początku szkolenia oraz ponownie weryfikowane przed jego zakończeniem.", "");
    sprawdzRownosc(walidujWarunkiUczestnictwa("iist", "online", bezNagłówka).status, "ostrzeżenie");
    sprawdzRownosc(walidujWarunkiUczestnictwa("iist", "stacjonarna", bezFormuły).status, "błąd");
  });

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

  test("zdalna w czasie rzeczywistym jest poprawną formą terminu online", function sprawdź() {
    sprawdźStatus("Forma świadczenia usługi", { forma: "zdalna w czasie rzeczywistym" }, "online", "poprawne");
  });

  test("forma świadczenia niezgodna z terminem daje ostrzeżenie", function sprawdź() {
    sprawdźStatus("Forma świadczenia usługi", { forma: "stacjonarna" }, "online", "ostrzeżenie");
  });

  test("wariant zajęć inny niż Zajęcia grupowe daje ostrzeżenie", function sprawdź() {
    sprawdźStatus("Wariant zajęć", { wariant: "Indywidualne" }, "online", "ostrzeżenie");
  });

  test("dowolna niepusta podstawa wpisu jest poprawna", function sprawdź() {
    sprawdźStatus("Podstawa uzyskania wpisu do BUR", { podstawa: "Inna podstawa" }, "online", "poprawne");
    sprawdźStatus("Podstawa uzyskania wpisu do BUR", { podstawa: "Certyfikat systemu zarządzania jakością wg. ISO 9001:2015" }, "online", "poprawne");
  });

  test("checklista akceptuje aktualny znak jakości", function sprawdź() {
    sprawdźStatus("Podstawa uzyskania wpisu do BUR", {}, "online", "poprawne");
  });

  test("checklista akceptuje każdą wybraną pozycję z listy", function sprawdź() {
    sprawdźStatus("Podstawa uzyskania wpisu do BUR", { podstawa: "(nieaktualna) Znak Jakości TGLS Quality Alliance" }, "online", "poprawne");
  });

  test("checklista odrzuca pustą podstawę wpisu", function sprawdź() {
    sprawdźStatus("Podstawa uzyskania wpisu do BUR", { podstawa: "" }, "online", "błąd");
  });

  test("brak konkretnej opcji oczekiwanej nie unieważnia wybranej podstawy", function sprawdź() {
    const wynik = bur.walidujFormularzBur(utwórzDokumentWalidacji({ podstawa: "(nieaktualna) Znak Jakości TGLS Quality Alliance", brakAktualnejOpcji: true }), utwórzKontekst("online"));
    const pozycja = znajdźPozycję(wynik, "Podstawa uzyskania wpisu do BUR");
    sprawdzRownosc(pozycja.status, "poprawne");
  });

  test("checklista ufa pustej wartości natywnego selecta, nie wizualnemu tekstowi Select2", function sprawdź() {
    sprawdźStatus("Podstawa uzyskania wpisu do BUR", {
      podstawa: "",
      podstawaWidoczna: "Znak Jakości TGLS Quality Alliance"
    }, "online", "błąd");
  });

  test("cel edukacyjny TAK jest poprawny", function sprawdź() {
    sprawdźStatus("Cel edukacyjny", { celEdukacyjny: "TAK" }, "online", "poprawne");
  });

  test("cel edukacyjny TAK jest odczytywany poza kontenerem qualificationsZrk", function sprawdź() {
    const dokument = utwórzDokumentWalidacji({ celEdukacyjny: "TAK" });
    const sekcjaKwalifikacji = dokument.querySelector("#qualificationsZrk");
    const wierszCelu = sekcjaKwalifikacji.querySelector("#glownyceluslugisekcja-czyceledukacyjny").closest(".form-group");
    sekcjaKwalifikacji.parentElement.insertBefore(wierszCelu, sekcjaKwalifikacji);
    const pozycja = znajdźPozycję(bur.walidujFormularzBur(dokument, utwórzKontekst("online")), "Cel edukacyjny");

    sprawdzRownosc(pozycja.aktualnaWartość, "TAK");
    sprawdzRownosc(pozycja.status, "poprawne");
  });

  test("walidacja celu edukacyjnego usuwa zdanie przycięte przez limit 500 znaków", function sprawdź() {
    const pierwszeZdanie = "Pierwsze zdanie " + "a".repeat(230) + ".";
    const drugieZdanie = "Drugie zdanie " + "b".repeat(220) + ".";
    const oczekiwanyOpis = pierwszeZdanie + " " + drugieZdanie;
    const pełnyOpis = oczekiwanyOpis + " Trzecie zdanie " + "c".repeat(200) + ".";
    const dokument = utwórzDokumentWalidacji({ celOpis: oczekiwanyOpis });
    const kontekst = utwórzKontekst("online");
    kontekst.szkolenieSemper.sekcje.celSzkolenia = pełnyOpis;
    const pozycjeCelu = bur.walidujFormularzBur(dokument, kontekst).pozycje.filter(function tylkoCel(pozycja) {
      return pozycja.pole === "Cel edukacyjny - opis";
    });

    pozycjeCelu.forEach(function sprawdźPozycję(pozycja) {
      sprawdzRownosc(pozycja.oczekiwanaWartość, oczekiwanyOpis);
      sprawdzRownosc(pozycja.status, "poprawne");
    });
  });

  test("ZSK TAK przy oczekiwanym NIE daje ostrzeżenie", function sprawdź() {
    sprawdźStatus("Czy usługa pozwala na uzyskanie kwalifikacji włączonej do ZSK?", { zsk: "TAK" }, "online", "ostrzeżenie");
  });

  test("kompetencje NIE przy oczekiwanym TAK daje ostrzeżenie", function sprawdź() {
    sprawdźStatus("Czy usługa prowadzi do nabycia kompetencji?", { kompetencje: "NIE" }, "online", "ostrzeżenie");
  });

  test("trzy pytania warunków uznania kompetencji wymagają odpowiedzi TAK", function sprawdź() {
    sprawdźStatus("Pytanie 1 w sekcji kompetencji", { pytanie1: "NIE" }, "online", "błąd");
    sprawdźStatus("Pytanie 2 w sekcji kompetencji", { pytanie2: "NIE" }, "online", "błąd");
    sprawdźStatus("Pytanie 3 w sekcji kompetencji", { pytanie3: "NIE" }, "online", "błąd");
  });

  test("efekty uczenia się i kryteria weryfikacji wymagają myślnika", function sprawdź() {
    sprawdźStatus("Efekty uczenia się", { efekty: "Opis efektu" }, "online", "błąd");
    sprawdźStatus("Kryteria weryfikacji", { kryteria: "Opis kryterium" }, "online", "błąd");
  });

  test("metoda walidacji pusta daje błąd", function sprawdź() {
    sprawdźStatus("Wybierz metodę walidacji", { metoda: "" }, "online", "błąd");
  });

  test("metoda walidacji wymaga wartości Wywiad swobodny", function sprawdź() {
    sprawdźStatus("Wybierz metodę walidacji", { metoda: "Test teoretyczny" }, "online", "błąd");
  });

  test("wymagane pola kompetencji są walidowane dla profili SEMPER i IIST", function sprawdź() {
    ["semper", "iist"].forEach(function sprawdźProfil(profilId) {
      const kontekst = utwórzKontekst("online");
      kontekst.profilId = profilId;
      kontekst.szkolenieSemper.profilId = profilId;
      const wynik = bur.walidujFormularzBur(utwórzDokumentWalidacji(), kontekst);
      ["Pytanie 1 w sekcji kompetencji", "Pytanie 2 w sekcji kompetencji", "Pytanie 3 w sekcji kompetencji", "Efekty uczenia się", "Kryteria weryfikacji", "Wybierz metodę walidacji"].forEach(function sprawdźPole(pole) {
        const pozycja = znajdźPozycję(wynik, pole);
        sprawdzRownosc(pozycja.status, "poprawne", profilId + ": " + pole);
        sprawdzWarunek(Boolean(pozycja.element), "Brak elementu do podświetlenia: " + profilId + ": " + pole);
      });
    });
  });

  test("dane kontaktowe są walidowane według profilu SEMPER i IIST", function sprawdź() {
    [
      { profilId: "semper", wartości: {} },
      { profilId: "iist", wartości: { kontaktImięINazwisko: "Ewa Nizioł", kontaktEmail: "bur@iist.pl", kontaktTelefon: "(+48) 530 409 030" } }
    ].forEach(function sprawdźProfil(ustawienia) {
      const kontekst = utwórzKontekst("online");
      kontekst.profilId = ustawienia.profilId;
      kontekst.szkolenieSemper.profilId = ustawienia.profilId;
      const wynik = bur.walidujFormularzBur(utwórzDokumentWalidacji(ustawienia.wartości), kontekst);
      ["Imię i nazwisko", "E-mail", "Telefon"].forEach(function sprawdźPoleKontaktu(pole) {
        sprawdzRownosc(znajdźPozycję(wynik, pole).status, "poprawne", ustawienia.profilId + ": " + pole);
      });
    });

    const wynikBłędny = bur.walidujFormularzBur(utwórzDokumentWalidacji({ kontaktEmail: "inny@example.com" }), utwórzKontekst("online"));
    sprawdzRownosc(znajdźPozycję(wynikBłędny, "E-mail").status, "błąd");

    const wynikDopuszczalny = bur.walidujFormularzBur(utwórzDokumentWalidacji({ kontaktEmail: "info@szkolenia-semper.pl" }), utwórzKontekst("online"));
    const pozycjaDopuszczalna = znajdźPozycję(wynikDopuszczalny, "E-mail");
    sprawdzRownosc(pozycjaDopuszczalna.status, "ostrzeżenie");
    sprawdzWarunek(pozycjaDopuszczalna.komunikat.includes("dopuszczalny"));
  });

  test("poprawne rekordy osób SEMPER i IIST mają zielony status wiersza i pól", function sprawdź() {
    ["semper", "iist"].forEach(function sprawdźProfil(profilId) {
      const profil = bur.pobierzProfilDostawcy(profilId);
      const osoby = [profil.osobaProwadzącaUsługę, profil.osobaProwadzącaWalidację];
      const wynik = walidujOsobyProfilu(profilId, osoby);
      osoby.forEach(function sprawdźOsobę(osoba) {
        const rekord = znajdźPozycję(wynik, "Rekord: " + osoba.imięINazwisko);
        sprawdzRownosc(rekord.status, "poprawne");
        sprawdzRownosc(rekord.element.tagName, "TR");
        ["Imię i nazwisko", "Adres email", "Osoba prowadząca usługę/walidację", "Opis doświadczenia"].forEach(function sprawdźPoleOsoby(nazwaPola) {
          const pole = znajdźPozycję(wynik, osoba.imięINazwisko + " — " + nazwaPola);
          sprawdzRownosc(pole.status, "poprawne");
          sprawdzRownosc(pole.element.tagName, "TD");
        });
      });
    });
  });

  test("literówki oznaczają komórki błędem, a rekord ostrzeżeniem", function sprawdź() {
    const profil = bur.pobierzProfilDostawcy("semper");
    const błędnyKoordynator = Object.assign({}, profil.osobaProwadzącaWalidację, { imięINazwisko: "Koordnator SEMPER", rola: "Osoba prowadząca usługę" });
    const wynik = walidujOsobyProfilu("semper", [profil.osobaProwadzącaUsługę, błędnyKoordynator]);
    sprawdzRownosc(znajdźPozycję(wynik, "Rekord: " + profil.osobaProwadzącaWalidację.imięINazwisko).status, "ostrzeżenie");
    sprawdzRownosc(znajdźPozycję(wynik, profil.osobaProwadzącaWalidację.imięINazwisko + " — Imię i nazwisko").status, "błąd");
    sprawdzRownosc(znajdźPozycję(wynik, profil.osobaProwadzącaWalidację.imięINazwisko + " — Osoba prowadząca usługę/walidację").status, "błąd");
    sprawdzRownosc(znajdźPozycję(wynik, profil.osobaProwadzącaWalidację.imięINazwisko + " — Adres email").status, "poprawne");
  });

  test("brak wymaganej osoby prowadzącej jest błędem", function sprawdź() {
    const profil = bur.pobierzProfilDostawcy("iist");
    const wynik = walidujOsobyProfilu("iist", [profil.osobaProwadzącaUsługę]);
    sprawdzRownosc(znajdźPozycję(wynik, "Brak rekordu: " + profil.osobaProwadzącaWalidację.imięINazwisko).status, "błąd");
  });
})();
