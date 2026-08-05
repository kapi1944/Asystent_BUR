(function testyProfiliDostawcow(globalny) {
  const przestrzeń = globalny.BurAsystent;

  test("Profil IIST rozpoznaje pełną nazwę konta", function () {
    sprawdzRownosc(przestrzeń.wykryjProfilPoNazwieKontaBur("MIĘDZYNARODOWY INSTYTUT SZKOLEŃ SPECJALISTYCZNYCH IIST PARAG KESARIA").id, "iist");
  });
  test("Profil IIST rozpoznaje podziały wierszy i dodatkowe spacje", function () {
    sprawdzRownosc(przestrzeń.wykryjProfilPoNazwieKontaBur("  MIĘDZYNARODOWY\n INSTYTUT  SZKOLEŃ SPECJALISTYCZNYCH\nIIST PARAG KESARIA ").id, "iist");
  });
  test("Profil IIST rozpoznaje różną wielkość liter", function () {
    sprawdzRownosc(przestrzeń.wykryjProfilPoNazwieKontaBur("Międzynarodowy Instytut Szkoleń Specjalistycznych Iist Parag Kesaria").id, "iist");
  });
  test("Profil SEMPER rozpoznaje oznaczenie konta", function () {
    sprawdzRownosc(przestrzeń.wykryjProfilPoNazwieKontaBur("Konto dostawcy: SEMPER").id, "semper");
  });
  test("Profil SEMPER rozpoznaje pełny nagłówek Dostawcy usług", function () {
    sprawdzRownosc(przestrzeń.wykryjProfilPoNazwieKontaBur("Profil Dostawcy usług – Centrum Organizacji Szkoleń i Konferencji SEMPER Magdalena Wolniewicz-Kesaria").id, "semper");
  });
  test("Profil IIST rozpoznaje pełny nagłówek Dostawcy usług", function () {
    sprawdzRownosc(przestrzeń.wykryjProfilPoNazwieKontaBur("Profil Dostawcy usług – Międzynarodowy Instytut Szkoleń Specjalistycznych IIST Parag Kesaria").id, "iist");
  });
  test("Nierozpoznane konto zwraca null", function () {
    sprawdzRownosc(przestrzeń.wykryjProfilPoNazwieKontaBur("Inna organizacja"), null);
  });
  test("Konflikt profilu z kontem jest wykrywany", function () {
    sprawdzWarunek(!przestrzeń.czyProfilZgodnyZKontemBur("semper", { profilId: "iist" }));
  });
  test("Klucze danych SEMPER i IIST są rozdzielone", function () {
    sprawdzWarunek(przestrzeń.kluczDanychProfilu("semper") !== przestrzeń.kluczDanychProfilu("iist"));
  });
  test("Przywrócenie profilu korzysta z zapisanego identyfikatora", function () {
    const zapis = { aktywnyProfilDostawcy: "iist" };
    sprawdzRownosc(przestrzeń.pobierzProfilDostawcy(zapis.aktywnyProfilDostawcy).nazwa, "IIST");
  });
  test("Zmiana profilu unieważnia stan operacji", function () {
    const stan = przestrzeń.unieważnijStanOperacjiProfilu({ podglądWypełnieniaBur: { id: 1 }, aktywnaOperacjaBur: { etap: "oczekuje_na_zatwierdzenie" }, harmonogramBurPrzygotowany: true });
    sprawdzWarunek(!stan.podglądWypełnieniaBur && !stan.aktywnaOperacjaBur && !stan.harmonogramBurPrzygotowany);
  });
  test("Panel zawiera przełącznik profilu", function () {
    return fetch("../panel/panel.html").then(function sprawdźSzablon(odpowiedź) { return odpowiedź.text(); }).then(function sprawdźPrzełącznik(html) {
      sprawdzWarunek(html.includes('data-profil-dostawcy="semper"') && html.includes('data-profil-dostawcy="iist"'));
    });
  });
  test("Walidacja BUR korzysta z istniejącego detektora konta", function () {
    return fetch("../content/bur-content.js").then(function odczytaj(odpowiedź) { return odpowiedź.text(); }).then(function sprawdźKod(kod) {
      sprawdzWarunek(!kod.includes("wykryjKontoDostawcyBur(document)"));
    });
  });
})(globalThis);
