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
      "<div class=\"scc5\">Korzyści dla uczestników.</div>",
      "<div class=\"scc8\">Program szkolenia. Moduł pierwszy.</div>"
    ].join("");
    const wynik = semper.parsujHtmlSemper(przykładowyHtml(sekcje), "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html");

    sprawdzWarunek(wynik.szkolenie.sekcje.grupaDocelowa.includes("ąęł"), "Sekcja scc3 powinna zachować polskie znaki.");
    sprawdzWarunek(wynik.szkolenie.sekcje.celSzkolenia.includes("ćśź"), "Sekcja scc4 powinna zachować polskie znaki.");
    sprawdzWarunek(wynik.szkolenie.sekcje.korzysci.includes("Korzyści"), "Sekcja scc5 powinna być odczytana.");
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

  test("parser zwraca ostrzeżenia, jeśli brakuje sekcji", function sprawdź() {
    const wynik = semper.parsujHtmlSemper(przykładowyHtml(""), "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html");

    sprawdzWarunek(wynik.ostrzeżenia.length > 0, "Powinny pojawić się ostrzeżenia o brakach.");
  });
})();
