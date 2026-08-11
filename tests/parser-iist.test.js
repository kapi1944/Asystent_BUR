(function testyParseraIist() {
  const bur = window.BurAsystent;
  function html() { return "<main><h1>Audyt ISO 9001</h1><h2>Grupa docelowa</h2><p>Kadra zarządzająca</p><h2>Cel szkolenia</h2><p>Celem szkolenia jest poznanie audytu.</p><h2>Korzyści dla uczestników</h2><p>Po zakończeniu szkolenia uczestnicy będą potrafili:</p><ul><li>planować audyt</li></ul><h2>Program szkolenia</h2><ol><li>Norma ISO</li><li>Ćwiczenia</li></ol><table><tr><th>Termin</th><th>Forma</th></tr><tr><td>10.09.2027 - 11.09.2027</td><td>online</td></tr></table></main>"; }
  test("parser IIST odczytuje tytuł i grupę docelową", function sprawdź() { const wynik = bur.parsujHtmlIist(html(), "https://szkoleniaiist.com.pl/audyt"); sprawdzRownosc(wynik.szkolenie.tytułOryginalny, "Audyt ISO 9001"); sprawdzWarunek(wynik.szkolenie.sekcje.grupaDocelowa.includes("Kadra")); });
  test("parser IIST odczytuje osobno cel i korzyści", function sprawdź() { const wynik = bur.parsujHtmlIist(html(), "https://szkoleniaiist.com.pl/audyt"); sprawdzWarunek(wynik.szkolenie.sekcje.celEdukacyjnyOpis.startsWith("Celem szkolenia")); sprawdzWarunek(wynik.szkolenie.sekcje.korzysci.startsWith("Po zakończeniu")); });
  test("parser IIST odczytuje termin online", function sprawdź() { const wynik = bur.parsujHtmlIist(html(), "https://szkoleniaiist.com.pl/audyt"); sprawdzRownosc(wynik.szkolenie.terminy[0].forma, "online"); sprawdzRownosc(wynik.szkolenie.terminy[0].dataStartBur, "10-09-2027"); });
  test("parser IIST odczytuje rzeczywistą tabelę szko", function sprawdź() {
    const źródło = '<main><h1>Test IIST</h1><div class="szko_over"><table class="szko"><tbody><tr><td class="tab_termonl bord33onl">od: 2026-10-01 do: 2026-10-02</td><td class="tab_miaonl bord33onl">Szkolenie online</td><td class="tab_cenaonl bord33onl">1890 zł</td></tr><tr><td class="tab_termonl bord33onl">od: 2026-12-03 do: 2026-12-04</td><td class="tab_miaonl bord33onl">Szkolenie online</td><td class="tab_cenaonl bord33onl">1890 zł</td></tr></tbody></table></div><h3>Informacje organizacyjne:</h3><p>szkolenie trwa 2 dni (łącznie 12h)</p></main>';
    const terminy = bur.parsujHtmlIist(źródło, "https://szkoleniaiist.com.pl/test").szkolenie.terminy;
    sprawdzRownosc(terminy.length, 2);
    sprawdzRownosc(terminy[0].dataStartBur, "01-10-2026");
    sprawdzRownosc(terminy[0].dataKoniecBur, "02-10-2026");
    sprawdzRownosc(terminy[0].miejsce, "Szkolenie online");
    sprawdzRownosc(terminy[0].cena, "1890 zł");
    sprawdzRownosc(terminy[0].czasTrwania, "12 godzin");
  });
  test("parser IIST pomija komentarze między sekcjami", function sprawdź() { const wynik = bur.parsujHtmlIist("<main><h1>Test IIST</h1><h2>Grupa docelowa</h2><!-- komentarz --><p>Kadra</p><h2>Cel szkolenia</h2><p>Cel</p><h2>Korzyści dla uczestników</h2><p>Korzyści</p><h2>Program</h2><p>Program</p></main>", "https://szkoleniaiist.com.pl/test,1.html"); sprawdzWarunek(wynik.szkolenie.sekcje.grupaDocelowa.includes("Kadra")); });
})();
