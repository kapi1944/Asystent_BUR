(function testyParseraHtmlSemper() {
  const semper = window.BurAsystent;

  function przykładowyHtml(dodatkoweSekcje) {
    return [
      "<!doctype html><html><head><meta charset=\"UTF-8\"><title>Test</title></head><body>",
      "<h1>Prawo ochrony środowiska w praktyce – 3-dniowe szkolenie w Zakopanem (noclegi i wyżywienie w cenie szkolenia).</h1>",
      "<table>",
      "<tr><th>Termin</th><th>Miejsce</th><th>Czas trwania</th><th>Koszt</th><th>Status</th></tr>",
      "<tr><td>2027-07-06 do 2027-07-09</td><td>Zakopane</td><td>3 dni</td><td>2500 zł netto</td><td>OSTATNIE WOLNE MIEJSCA</td></tr>",
      "<tr><td>10.08.2027 - 11.08.2027</td><td>online</td><td>2 dni</td><td>1900 zł netto</td><td>potwierdzony</td></tr>",
      "</table>",
      dodatkoweSekcje || "",
      "</body></html>"
    ].join("");
  }

  function htmlSemper411Analogiczny() {
    const wierszeTerminów = [];

    for (let numer = 1; numer <= 16; numer += 1) {
      const dzieńStart = String(numer).padStart(2, "0");
      const dzieńKoniec = String(numer + 1).padStart(2, "0");
      const miejsce = numer === 1 ? "Zakopane" : (numer % 2 === 0 ? "online" : "Warszawa");
      const czasTrwania = numer === 1 ? "3 dni" : "2 dni";

      wierszeTerminów.push(
        "<tr><td>2027-08-" + dzieńStart + " do 2027-08-" + dzieńKoniec + "</td><td>" + miejsce + "</td><td>" + czasTrwania + "</td><td>3490 zł netto</td><td>Program szkolenia Pobierz PDF</td><td>Wypełnij online</td></tr>"
      );
    }

    wierszeTerminów.push("<tr><td colspan=\"6\">▼ Pokaż więcej ▲ Pokaż mniej</td></tr>");

    return [
      "<!doctype html><html><head><meta charset=\"UTF-8\"><title>SEMPER 411</title></head><body>",
      "<h1>Prawo ochrony środowiska w praktyce – 3-dniowe szkolenie w Zakopanem (noclegi i wyżywienie w cenie szkolenia).</h1>",
      "<table>",
      "<tr><th>Termin</th><th>Miejsce</th><th>Czas trwania</th><th>Koszt</th><th>Program szkolenia Pobierz PDF</th><th>Formularz zgłoszenia</th></tr>",
      wierszeTerminów.join(""),
      "</table>",
      "<div class=\"spis-tresci\">Grupa docelowa Cel szkolenia Korzyści dla uczestników</div>",
      "<div class=\"spis-tresci\">Metodologia Program szkolenia</div>",
      "<div class=\"spis-tresci\">Informacje organizacyjne Inwestycja Zgłoszenie</div>",
      "<div class=\"top_text kontakt\">",
      "<div>Grupa docelowa</div>",
      "<div>-pracownicy wydziałów ochrony środowiska i gospodarki komunalnej w jednostkach sektora publicznego;<br>-pracownicy zakładów produkcyjnych, przedsiębiorstw usługowych;<br>-pracownicy laboratoriów badawczych i kontrolnych;</div>",
      "<div>Cel szkolenia</div>",
      "<div>Celem szkolenie jest przekazanie Uczestnikom wiedzy i kwalifikacji w zakresie prawa ochrony środowiska oraz ustaw powiązanych.<br>Udział w szkoleniu pozwoli Uczestnikom na zdobycie cennych praktycznych umiejętności.</div>",
      "<div>Korzyści dla uczestników</div>",
      "<div>Uczestnicy warsztatów szkoleniowych zostaną wyposażeni w kompleksową wiedzę oraz praktyczne umiejętności w zakresie wymagań i obowiązków wynikających z prawa ochrony środowiska i ustaw powiązanych.</div>",
      "<div>Metodologia</div>",
      "<div>Szkolenie prowadzone jest metodą warsztatową z analizą przypadków i dyskusją moderowaną.</div>",
      "<div>Program szkolenia</div>",
      "<div><div><p>I. Systematyzacja norm dotyczących ochrony środowiska w ustawie Prawo Ochrony Środowiska, ustawach powiązanych oraz ustawodawstwie międzynarodowym i unijnym</p><p>- zakres regulacji poszczególnych ustaw i systematyzacja ich rozporządzeń<br>- wzajemne odniesienia w ustawach<br>Definicje kluczowych pojęć w ramach Prawa Ochrony Środowiska<br>II. Rozstrzygnięcia administracyjne i normy postępowania obowiązujące w postępowaniach administracyjnych związanych z ochroną środowiska.</p><p>Program szkolenia jest własnością intelektualną SEMPER i przetwarzanie go dla celów komercyjnych bez wiedzy i zgody autora jest zabronione.</p><p>🤝 Szkolenie realizowane w ramach programu partnerskiego</p></div></div>",
      "<div>Informacje organizacyjne</div>",
      "<div>Organizator zapewnia materiały szkoleniowe, przerwy kawowe oraz certyfikat ukończenia szkolenia.</div>",
      "<div>Inwestycja</div>",
      "<div><div><span>2890.00</span> zł netto - udział w szkoleniu bez zakwaterowania<br><span>3490.00</span> zł netto - udział w szkoleniu z zakwaterowaniem</div></div>",
      "<div>Zgłoszenie</div>",
      "<div>Formularz zgłoszenia dostępny jest online.</div>",
      "</div>",
      "</body></html>"
    ].join("");
  }

  function parsujSemper411Analogiczny() {
    return semper.parsujHtmlSemper(htmlSemper411Analogiczny(), "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html");
  }

  test("parsujHtmlSemper odczytuje h1 z polskimi znakami", function sprawdź() {
    const wynik = semper.parsujHtmlSemper(przykładowyHtml("<h2>Cel szkolenia</h2><p>Ćwiczenie źródeł prawa.</p>"), "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html");

    sprawdzWarunek(wynik.szkolenie.tytułOryginalny.includes("środowiska"), "Tytuł powinien zawierać polskie znaki.");
  });

  test("parsujHtmlSemper odczytuje tytułPoNormalizacjiBur", function sprawdź() {
    const wynik = semper.parsujHtmlSemper(przykładowyHtml("<h2>Cel szkolenia</h2><p>Cel.</p>"), "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html");

    sprawdzRownosc(
      wynik.szkolenie.tytułPoNormalizacjiBur,
      "Prawo ochrony środowiska w praktyce – Szkolenie w Zakopanem."
    );
  });

  test("parsujHtmlSemper odczytuje termin online", function sprawdź() {
    const wynik = semper.parsujHtmlSemper(przykładowyHtml(""), "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html");
    const terminOnline = wynik.szkolenie.terminy.find(function znajdź(termin) {
      return termin.forma === "online";
    });

    sprawdzWarunek(Boolean(terminOnline), "Powinien istnieć termin online.");
    sprawdzRownosc(terminOnline.dataStartBur, "10-08-2027");
  });

  test("parsujHtmlSemper odczytuje termin Zakopane z dniem dojazdowym", function sprawdź() {
    const wynik = semper.parsujHtmlSemper(przykładowyHtml(""), "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html");
    const terminZakopane = wynik.szkolenie.terminy.find(function znajdź(termin) {
      return termin.miejsce === "Zakopane";
    });

    sprawdzWarunek(terminZakopane.czyDojazdZakopane, "Powinien wykryć dzień dojazdowy.");
    sprawdzRownosc(terminZakopane.dataStartBur, "07-07-2027");
    sprawdzRownosc(terminZakopane.dataZakończeniaRekrutacjiBur, "06-07-2027");
    sprawdzRownosc(terminZakopane.cena, "2500 zł netto");
  });

  test("parsujHtmlSemper odczytuje sekcje po klasach scc", function sprawdź() {
    const sekcje = [
      "<div class=\"scc3\">Grupa docelowa z ąęł.</div>",
      "<div class=\"scc4\">Cel szkolenia z ćśź.</div>",
      "<div class=\"scc5\">Korzyści dla uczestników</div>",
      "<div>Uczestnicy poznają praktyczne narzędzia i przykłady zastosowania przepisów.</div>",
      "<div class=\"scc8\">Program szkolenia. Moduł pierwszy.</div>"
    ].join("");
    const wynik = semper.parsujHtmlSemper(przykładowyHtml(sekcje), "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html");

    sprawdzWarunek(wynik.szkolenie.sekcje.grupaDocelowa.includes("ąęł"), "Sekcja scc3 powinna zachować polskie znaki.");
    sprawdzWarunek(wynik.szkolenie.sekcje.celSzkolenia.includes("ćśź"), "Sekcja scc4 powinna zachować polskie znaki.");
    sprawdzWarunek(wynik.szkolenie.sekcje.korzysci.includes("Uczestnicy poznają praktyczne narzędzia"), "Sekcja scc5 powinna być odczytana.");
    sprawdzWarunek(wynik.szkolenie.sekcje.program.includes("Moduł pierwszy"), "Sekcja scc8 powinna być odczytana.");
  });

  test("parser sekcji zbiera treść po markerze scc4 z następnego div", function sprawdź() {
    const sekcje = [
      "<div class=\"scc4\">Cel szkolenia</div>",
      "<div>Uczestnik ćwiczy analizę przepisów.</div>"
    ].join("");
    const wynik = semper.parsujHtmlSemper(przykładowyHtml(sekcje), "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html");

    sprawdzWarunek(wynik.szkolenie.sekcje.celSzkolenia.includes("Uczestnik ćwiczy"), "Powinien pobrać treść po markerze scc4.");
    sprawdzWarunek(!/^Cel szkolenia$/.test(wynik.szkolenie.sekcje.celSzkolenia), "Sam marker nie może być treścią sekcji.");
  });

  test("parser sekcji zbiera tekst rodzeństwa po markerze scc3", function sprawdź() {
    const sekcje = [
      "<b class=\"text_over scc3\">Grupa docelowa</b>",
      " Osoby odpowiedzialne za zamówienia publiczne.",
      "<div class=\"scc4\">Cel szkolenia</div><div>Cel testowy.</div>"
    ].join("");
    const wynik = semper.parsujHtmlSemper(przykładowyHtml(sekcje), "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html");

    sprawdzWarunek(wynik.szkolenie.sekcje.grupaDocelowa.includes("Osoby odpowiedzialne"), "Powinien pobrać tekst z rodzeństwa tekstowego.");
  });

  test("parser programu usuwa komunikat o własności intelektualnej SEMPER", function sprawdź() {
    const sekcje = [
      "<div class=\"scc8\">Program szkolenia</div>",
      "<div>Moduł 1. Ćwiczenia praktyczne. Program szkolenia stanowi własność intelektualną SEMPER i nie może być kopiowany.</div>"
    ].join("");
    const wynik = semper.parsujHtmlSemper(przykładowyHtml(sekcje), "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html");

    sprawdzWarunek(wynik.szkolenie.sekcje.program.includes("Moduł 1"), "Program powinien zachować właściwą treść.");
    sprawdzWarunek(!/własność intelektualną/i.test(wynik.szkolenie.sekcje.program), "Komunikat o własności powinien zostać usunięty.");
  });

  test("parser SEMPER 411 nie przypisuje tabeli terminów do celu szkolenia", function sprawdź() {
    const wynik = parsujSemper411Analogiczny();

    sprawdzWarunek(!semper.czyTreśćWyglądaJakTabelaTerminów(wynik.szkolenie.sekcje.celSzkolenia), "Cel szkolenia nie może być tabelą terminów.");
  });

  test("parser SEMPER 411 nie przypisuje tabeli terminów do grupy docelowej", function sprawdź() {
    const wynik = parsujSemper411Analogiczny();

    sprawdzWarunek(!semper.czyTreśćWyglądaJakTabelaTerminów(wynik.szkolenie.sekcje.grupaDocelowa), "Grupa docelowa nie może być tabelą terminów.");
  });

  test("parser SEMPER 411 nie przypisuje tabeli terminów do korzyści", function sprawdź() {
    const wynik = parsujSemper411Analogiczny();

    sprawdzWarunek(!semper.czyTreśćWyglądaJakTabelaTerminów(wynik.szkolenie.sekcje.korzysci), "Korzyści nie mogą być tabelą terminów.");
  });

  test("parser SEMPER 411 nie przypisuje tabeli terminów do programu", function sprawdź() {
    const wynik = parsujSemper411Analogiczny();

    sprawdzWarunek(!semper.czyTreśćWyglądaJakTabelaTerminów(wynik.szkolenie.sekcje.program), "Program nie może być tabelą terminów.");
  });

  test("parser SEMPER 411 odczytuje cel szkolenia z właściwej sekcji", function sprawdź() {
    const wynik = parsujSemper411Analogiczny();

    sprawdzWarunek(wynik.szkolenie.sekcje.celSzkolenia.startsWith("Celem szkolenie jest przekazanie"), "Cel powinien pochodzić z właściwej sekcji.");
    sprawdzWarunek(!wynik.szkolenie.sekcje.celSzkolenia.includes("Korzyści dla uczestników"), "Cel nie może zawierać kolejnego nagłówka.");
  });

  test("parser SEMPER 411 odczytuje grupę docelową z właściwej sekcji", function sprawdź() {
    const wynik = parsujSemper411Analogiczny();

    sprawdzWarunek(wynik.szkolenie.sekcje.grupaDocelowa.startsWith("-pracownicy wydziałów ochrony środowiska"), "Grupa powinna pochodzić z właściwej sekcji.");
    sprawdzWarunek(!wynik.szkolenie.sekcje.grupaDocelowa.includes("Cel szkolenia"), "Grupa docelowa nie może zawierać nagłówka celu.");
    sprawdzWarunek(!wynik.szkolenie.sekcje.grupaDocelowa.includes("Korzyści dla uczestników"), "Grupa docelowa nie może zawierać nagłówka korzyści.");
  });

  test("parser SEMPER 411 odczytuje korzyści z właściwej sekcji", function sprawdź() {
    const wynik = parsujSemper411Analogiczny();

    sprawdzWarunek(wynik.szkolenie.sekcje.korzysci.startsWith("Uczestnicy warsztatów szkoleniowych"), "Korzyści powinny pochodzić z właściwej sekcji.");
    sprawdzWarunek(!wynik.szkolenie.sekcje.korzysci.includes("Metodologia"), "Korzyści nie mogą zawierać nagłówka metodologii.");
  });

  test("parser SEMPER 411 odczytuje program z właściwej sekcji", function sprawdź() {
    const wynik = parsujSemper411Analogiczny();

    sprawdzWarunek(wynik.szkolenie.sekcje.program.startsWith("I. Systematyzacja norm dotyczących ochrony środowiska"), "Program powinien pochodzić z właściwej sekcji.");
    sprawdzWarunek(wynik.szkolenie.sekcje.program.includes("wzajemne odniesienia w ustawach"), "Program powinien zawierać dalszą treść.");
    sprawdzWarunek(wynik.szkolenie.sekcje.program !== "Metodologia Program szkolenia", "Program nie może być listą nagłówków.");
    sprawdzWarunek(!wynik.szkolenie.sekcje.program.includes("Szkolenie prowadzone jest metodą"), "Program nie może zawierać metodologii.");
    sprawdzWarunek(!wynik.szkolenie.sekcje.program.includes("Program szkolenia jest własnością intelektualną"), "Program nie może zawierać noty prawnej.");
    sprawdzWarunek(!wynik.szkolenie.sekcje.program.includes("Szkolenie realizowane w ramach programu partnerskiego"), "Program nie może zawierać komunikatu partnerskiego.");
  });

  test("parser SEMPER 411 odczytuje inwestycję z właściwej sekcji", function sprawdź() {
    const wynik = parsujSemper411Analogiczny();

    sprawdzWarunek(wynik.szkolenie.sekcje.inwestycja.includes("udział w szkoleniu bez zakwaterowania"), "Inwestycja powinna zawierać ceny.");
    sprawdzWarunek(wynik.szkolenie.sekcje.inwestycja !== "Informacje organizacyjne Inwestycja Zgłoszenie", "Inwestycja nie może być listą nagłówków.");
    sprawdzWarunek(!wynik.szkolenie.sekcje.inwestycja.includes("Organizator zapewnia"), "Inwestycja nie może zawierać informacji organizacyjnych.");
    sprawdzWarunek(!wynik.szkolenie.sekcje.inwestycja.includes("Formularz zgłoszenia"), "Inwestycja nie może zawierać zgłoszenia.");
  });

  test("parser SEMPER 411 ignoruje Pokaż więcej jako termin", function sprawdź() {
    const wynik = parsujSemper411Analogiczny();
    const opisTerminów = wynik.szkolenie.terminy.map(function opisz(termin) {
      return [termin.dataOdTekst, termin.dataDoTekst, termin.miejsce].join(" ");
    }).join(" ");

    sprawdzWarunek(!/Pokaż więcej|Pokaż mniej|▼|▲/i.test(opisTerminów), "Fałszywy wiersz nie może trafić do terminów.");
  });

  test("parser SEMPER 411 zwraca 16 terminów zamiast 17", function sprawdź() {
    const wynik = parsujSemper411Analogiczny();

    sprawdzRownosc(wynik.szkolenie.terminy.length, 16);
  });

  test("parser SEMPER 411 odczytuje cenę bez zakwaterowania", function sprawdź() {
    const wynik = parsujSemper411Analogiczny();

    sprawdzRownosc(wynik.szkolenie.cenaBezZakwaterowania, "2890.00");
    sprawdzRownosc(wynik.szkolenie.sekcje.cenaBezZakwaterowania, "2890.00");
  });

  test("parser zwraca ostrzeżenia, jeśli brakuje sekcji", function sprawdź() {
    const wynik = semper.parsujHtmlSemper(przykładowyHtml(""), "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html");

    sprawdzWarunek(wynik.ostrzeżenia.length > 0, "Powinny pojawić się ostrzeżenia o brakach.");
  });
})();
