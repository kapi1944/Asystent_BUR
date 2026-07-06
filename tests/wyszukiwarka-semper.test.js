(function testyWyszukiwarkiSemper() {
  const semper = window.BurAsystent;

  test("normalizujDoPorównania usuwa polskie znaki tylko do porównania", function sprawdź() {
    const oryginał = "Prawo ochrony środowiska i zamówienia publiczne";

    sprawdzRownosc(semper.normalizujDoPorównania(oryginał), "prawo ochrony srodowiska i zamowienia publiczne");
    sprawdzRownosc(oryginał, "Prawo ochrony środowiska i zamówienia publiczne");
  });

  test("tytułPrzedPierwsząInterpunkcją obcina tytuł do początku", function sprawdź() {
    sprawdzRownosc(
      semper.tytułPrzedPierwsząInterpunkcją("Prawo ochrony środowiska w praktyce – Szkolenie w Zakopanem."),
      "Prawo ochrony środowiska w praktyce"
    );
  });

  test("tytułPrzedPierwsząInterpunkcją chroni skróty ds. i m.in.", function sprawdź() {
    sprawdzRownosc(
      semper.tytułPrzedPierwsząInterpunkcją("Obowiązki ds. środowiska m.in. w JST: warsztat"),
      "Obowiązki ds. środowiska m.in. w JST"
    );
  });

  test("ważneSłowaWyszukiwania usuwa mało znaczące słowa", function sprawdź() {
    const słowa = semper.ważneSłowaWyszukiwania("Szkolenie warsztaty dla zamówienia publiczne");

    sprawdzWarunek(!słowa.includes("szkolenie"), "Nie powinno zawierać słowa szkolenie.");
    sprawdzWarunek(!słowa.includes("warsztaty"), "Nie powinno zawierać słowa warsztaty.");
    sprawdzWarunek(!słowa.includes("dla"), "Nie powinno zawierać słowa dla.");
    sprawdzWarunek(słowa.includes("zamowienia"), "Powinno zawierać słowo zamówienia bez znaków diakrytycznych.");
  });

  test("czyMocneDopasowanieTytułu działa dla polskich znaków", function sprawdź() {
    sprawdzWarunek(
      semper.czyMocneDopasowanieTytułu("Prawo ochrony środowiska w praktyce", "Prawo ochrony srodowiska w praktyce"),
      "Tytuły powinny być dopasowane mimo braku znaków diakrytycznych."
    );
  });

  test("czyMocneDopasowanieTytułu odrzuca przypadkowy tytuł", function sprawdź() {
    sprawdzWarunek(
      !semper.czyMocneDopasowanieTytułu("Kadry i płace od podstaw", "Prawo ochrony środowiska"),
      "Przypadkowy tytuł nie powinien pasować."
    );
  });

  test("czyŁączeSzczegółówSzkolenia rozpoznaje link SEMPER", function sprawdź() {
    sprawdzWarunek(
      semper.czyŁączeSzczegółówSzkolenia("https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html"),
      "Link szczegółów powinien być zaakceptowany."
    );
  });

  test("wyciągnijŁączaZWyników wyciąga kandydatów z HTML", function sprawdź() {
    const html = "<div><a href=\"/component/trainings/details/szkolenie,411.html\">Prawo ochrony środowiska w praktyce</a></div>";
    const wyniki = semper.wyciągnijŁączaZWyników(html, "Prawo ochrony środowiska");

    sprawdzRownosc(wyniki.length, 1);
    sprawdzWarunek(wyniki[0].tytuł.includes("środowiska"), "Tytuł powinien zachować polskie znaki.");
  });

  test("wyciągnijŁączaZWyników obsługuje JSON string z HTML-em", function sprawdź() {
    const html = "<a href=\"/component/trainings/details/szkolenie,412.html\">Kadry i płace</a>";
    const wyniki = semper.wyciągnijŁączaZWyników(JSON.stringify(html), "Kadry płace");

    sprawdzRownosc(wyniki.length, 1);
    sprawdzWarunek(wyniki[0].url.includes("szkolenie,412.html"), "Powinien odczytać link z JSON stringa.");
  });

  test("wyciągnijŁączaZWyników obsługuje data-url base64", function sprawdź() {
    const adres = "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,413.html";
    const html = "<a data-url=\"" + btoa(adres) + "\">Zamówienia publiczne</a>";
    const wyniki = semper.wyciągnijŁączaZWyników(html, "Zamówienia publiczne");

    sprawdzRownosc(wyniki.length, 1);
    sprawdzWarunek(wyniki[0].url.includes("szkolenie,413.html"), "Powinien odkodować data-url base64.");
  });

  test("wyciągnijŁączaZWyników obsługuje data-url względny", function sprawdź() {
    const html = "<a data-url=\"/component/trainings/details/szkolenie,414.html\">RODO w praktyce</a>";
    const wyniki = semper.wyciągnijŁączaZWyników(html, "RODO");

    sprawdzRownosc(wyniki.length, 1);
    sprawdzRownosc(wyniki[0].url, "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,414.html");
  });

  test("wyciągnijŁączaZWyników obsługuje href względny", function sprawdź() {
    const html = "<a href=\"/component/trainings/details/szkolenie,415.html\">Źródła prawa</a>";
    const wyniki = semper.wyciągnijŁączaZWyników(html, "Źródła prawa");

    sprawdzRownosc(wyniki.length, 1);
    sprawdzRownosc(wyniki[0].url, "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,415.html");
  });

  test("odczytajŁączeZJsonaWyszukiwarki obsługuje obiekt z polem url", function sprawdź() {
    const url = semper.odczytajŁączeZJsonaWyszukiwarki({
      url: "/component/trainings/details/szkolenie,416.html"
    });

    sprawdzRownosc(url, "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,416.html");
  });
})();
