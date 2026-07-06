(function testyPolskichZnaków() {
  const semper = window.BurAsystent;

  test("porównywanie ignoruje różnice środowiska vs srodowiska", function sprawdź() {
    sprawdzRownosc(
      semper.normalizujDoPorównania("środowiska zamówienia wdrożenie"),
      "srodowiska zamowienia wdrozenie"
    );
  });

  test("parser nie psuje tekstów zawierających polskie znaki", function sprawdź() {
    const html = [
      "<h1>Zażółć gęślą jaźń – szkolenie.</h1>",
      "<table><tr><th>Termin</th><th>Miejsce</th><th>Cena</th></tr><tr><td>01.01.2027 - 01.01.2027</td><td>Łódź</td><td>1000 zł</td></tr></table>",
      "<div class=\"scc4\">ą, ć, ę, ł, ń, ó, ś, ź, ż</div>"
    ].join("");
    const wynik = semper.parsujHtmlSemper(html, "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,999.html");

    sprawdzWarunek(wynik.szkolenie.tytułOryginalny.includes("Zażółć"), "Tytuł powinien zachować polskie znaki.");
    sprawdzWarunek(wynik.szkolenie.sekcje.celSzkolenia.includes("ą, ć, ę"), "Sekcja powinna zachować polskie znaki.");
    sprawdzRownosc(wynik.szkolenie.terminy[0].miejsce, "Łódź");
  });
})();
