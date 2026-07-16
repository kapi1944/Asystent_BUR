(function testyStanuOperacjiBur() {
  const bur = window.BurAsystent;
  test("stan operacji BUR pozwala na poprawne przejścia", function sprawdź() {
    let operacja = bur.utwórzOperacjęBur({ identyfikatorKartyBur: 1, odciskSzkolenia: "a", indeksTerminu: 0 });
    operacja = bur.przejdźOperacjęBur(operacja, "przygotowywanie");
    operacja = bur.przejdźOperacjęBur(operacja, "oczekuje_na_zatwierdzenie");
    sprawdzRownosc(operacja.etap, "oczekuje_na_zatwierdzenie");
  });
  test("stan operacji BUR odrzuca niedozwolone przejście", function sprawdź() {
    let błąd = null; try { bur.przejdźOperacjęBur(bur.utwórzOperacjęBur(), "zakończono"); } catch (wyjątek) { błąd = wyjątek; }
    sprawdzWarunek(Boolean(błąd), "Niedozwolone przejście powinno zostać odrzucone.");
  });
  test("stan operacji BUR blokuje tę samą kartę i termin", function sprawdź() {
    const operacja = bur.przejdźOperacjęBur(bur.utwórzOperacjęBur({ identyfikatorKartyBur: 1, odciskSzkolenia: "a", indeksTerminu: 0 }), "przygotowywanie");
    sprawdzWarunek(Boolean(bur.znajdźKonfliktOperacjiBur([operacja], { identyfikatorKartyBur: 1, odciskSzkolenia: "a", indeksTerminu: 0 })), "Konflikt powinien istnieć.");
    sprawdzWarunek(!bur.znajdźKonfliktOperacjiBur([operacja], { identyfikatorKartyBur: 1, odciskSzkolenia: "a", indeksTerminu: 1 }), "Inny termin nie powinien być blokowany.");
  });
  test("stan operacji BUR zapisuje błąd i pozwala ponowić etap", function sprawdź() {
    let operacja = bur.przejdźOperacjęBur(bur.utwórzOperacjęBur(), "przygotowywanie");
    operacja = bur.zapiszBłądOperacjiBur(operacja, "przygotowywanie", "Błąd testowy");
    sprawdzRownosc(operacja.błąd.komunikat, "Błąd testowy");
    sprawdzRownosc(bur.przejdźOperacjęBur(operacja, "przygotowywanie").etap, "przygotowywanie");
  });
  test("stan operacji BUR wykrywa wygasłą blokadę", function sprawdź() {
    const operacja = bur.przejdźOperacjęBur(bur.utwórzOperacjęBur(), "przygotowywanie"); operacja.zaktualizowano = "2000-01-01T00:00:00.000Z";
    sprawdzWarunek(bur.czyOperacjaBurWygasła(operacja), "Blokada powinna wygasnąć.");
  });
})();
