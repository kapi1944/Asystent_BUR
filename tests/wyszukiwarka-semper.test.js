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
})();
