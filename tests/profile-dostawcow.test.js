(function testyProfiliDostawcow(globalny) {
  const przestrzeń = globalny.BurAsystent;

  test("Profil IIST rozpoznaje pełną nazwę konta", function () {
    sprawdzRownosc(przestrzeń.wykryjProfilPoNazwieKontaBur("MIĘDZYNARODOWY INSTYTUT SZKOLEŃ SPECJALISTYCZNYCH IIST PARAG KESARIA").id, "iist");
  });
  test("Detektor rozpoznaje pełną nazwę profilu SEMPER", function sprawdźPełnąNazwęSemper() {
    sprawdzRownosc(przestrzeń.profileDetector.detect("CENTRUM ORGANIZACJI SZKOLEŃ I KONFERENCJI SEMPER MAGDALENA WOLNIEWICZ-KESARIA").id, "semper");
  });
  test("Detektor rozpoznaje pełną nazwę profilu IIST", function sprawdźPełnąNazwęIist() {
    sprawdzRownosc(przestrzeń.profileDetector.detect("MIĘDZYNARODOWY INSTYTUT SZKOLEŃ SPECJALISTYCZNYCH IIST PARAG KESARIA").id, "iist");
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
  test("Detektor nie rozpoznaje podobnej, ale niepełnej nazwy profilu", function sprawdźBrakFałszywegoDopasowania() {
    sprawdzRownosc(przestrzeń.profileDetector.detect("MIĘDZYNARODOWY INSTYTUT SZKOLEŃ SPECJALISTYCZNYCH PARAG KESARIA"), null);
  });
  test("Reguły SEMPER nie trafiają do IIST", function sprawdźIzolacjęSemper() {
    sprawdzWarunek(!JSON.stringify(przestrzeń.providerRules.get("iist")).includes("TGLS Quality Alliance"));
  });
  test("Reguły IIST nie trafiają do SEMPER", function sprawdźIzolacjęIist() {
    sprawdzWarunek(!JSON.stringify(przestrzeń.providerRules.get("semper")).includes("ISO 9001:2015"));
  });
  test("Reguły udostępniają podstawę wpisu BUR dla SEMPER", function sprawdźPodstawęWpisuSemper() {
    sprawdzRownosc(przestrzeń.providerRules.getExpectedBurValue("semper", "qualityBasis"), "Znak Jakości TGLS Quality Alliance");
    sprawdzRownosc(przestrzeń.providerRules.get("semper").podstawaWpisuBur, "Znak Jakości TGLS Quality Alliance");
  });
  test("Stare API profili deleguje do nowych modułów", function sprawdźFasadęZgodności() {
    sprawdzWarunek(przestrzeń.pobierzProfilDostawcy === przestrzeń.providerRules.get);
    sprawdzWarunek(przestrzeń.wykryjProfilPoNazwieKontaBur === przestrzeń.profileDetector.detect);
    sprawdzWarunek(przestrzeń.PROFILE_DOSTAWCOW === przestrzeń.providerRules.getAll());
    sprawdzRownosc(przestrzeń.AKTUALNA_PODSTAWA_WPISU_BUR, przestrzeń.providerRules.getExpectedBurValue("semper", "qualityBasis"));
  });
  test("Nowe moduły nie znają DOM, a selektory nie zawierają wartości TGLS", function sprawdźGraniceModułów() {
    return Promise.all([
      fetch("../shared/providers/provider-rules.js").then(function odczytaj(odpowiedź) { return odpowiedź.text(); }),
      fetch("../shared/providers/profile-detector.js").then(function odczytaj(odpowiedź) { return odpowiedź.text(); }),
      fetch("../shared/selektory-bur.js").then(function odczytaj(odpowiedź) { return odpowiedź.text(); })
    ]).then(function sprawdźPliki(kody) {
      sprawdzWarunek(!kody[0].includes("querySelector") && !kody[1].includes("querySelector"));
      sprawdzWarunek(!/\bdocument\b/.test(kody[0]) && !/\bdocument\b/.test(kody[1]));
      sprawdzWarunek(!kody[1].includes("formularz"));
      sprawdzWarunek(!kody[2].includes("TGLS Quality Alliance"));
    });
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
