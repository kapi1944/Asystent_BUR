(function zarejestrujDefinicjePolBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  function sekcja(szkolenie, nazwy) { const dane = szkolenie.sekcje || {}; return nazwy.map(function pobierz(nazwa) { return dane[nazwa]; }).find(Boolean) || ""; }
  function definicja(id, celId, wartość, źródło, opcje) {
    const cel = przestrzeń.pobierzCelFormularzaBur(celId) || {};
    return Object.assign({ id: id, sekcja: cel.sekcja || "", pole: cel.etykieta || id, typPola: cel.typKontrolki === "edytorTekstowy" ? "quill" : cel.typKontrolki || "input", wartośćProponowana: wartość, źródło: źródło || "reguła BUR", wymagalność: "wymagane", blokująca: false, definicjaPola: { sekcja: cel.sekcja, etykieta: cel.etykieta, selektory: (cel.selektory || []).concat(cel.selektoryAwaryjne || []), typ: cel.typKontrolki === "edytorTekstowy" ? "quill" : cel.typKontrolki, tabela: cel.tabela, kolumna: cel.kolumna }, sposóbLokalizacji: cel.tabela ? "tabela" : (cel.selektory && cel.selektory.length ? "selektor" : "etykieta") }, opcje || {});
  }
  function pobierzLiczbęDoPola(wartość) {
    const trafienie = String(wartość || "").replace(/\s+/g, "").match(/\d+(?:[.,]\d+)?/);
    return trafienie ? trafienie[0].replace(",", ".") : "";
  }
  function pobierzDefinicjePólWypełnieniaBur(kontekst) {
    const szkolenie = kontekst && (kontekst.szkolenieŹródłowe || kontekst.szkolenieSemper) || {};
    const termin = kontekst && kontekst.wybranyTermin || {};
    const profilId = kontekst && kontekst.profilId || szkolenie.profilId || "semper";
    const profil = przestrzeń.pobierzProfilDostawcy(profilId) || przestrzeń.pobierzProfilDostawcy("semper");
    const online = /online/i.test([termin.forma, termin.miejsce].join(" "));
    const źródło = profil.nazwa;
    const dataRekrutacji = termin.dataZakończeniaRekrutacjiBur || termin.dataZakonczeniaRekrutacjiBur || (przestrzeń.wyliczDateZakonczeniaRekrutacjiBur ? przestrzeń.wyliczDateZakonczeniaRekrutacjiBur(termin.dataStartBur) : "");
    const wynik = [
      definicja("rodzaj-uslugi", "rodzajUslugi", profil.rodzajUsługiBur || "", "profil " + źródło, { dokładnySelect2: true }),
      definicja("podrodzaj-uslugi", "podrodzajUslugi", profil.podrodzajUsługiBur || "", "profil " + źródło, { dokładnySelect2: true }),
      definicja("forma-swiadczenia", "formaSwiadczenia", online ? "zdalna w czasie rzeczywistym" : "stacjonarna", "reguła BUR"),
      definicja("wariant-zajec", "wariantZajec", profil.wariantZajęćBur, "profil " + źródło),
      definicja("podstawa-wpisu", "podstawaWpisu", profil.podstawaWpisuBur || przestrzeń.AKTUALNA_PODSTAWA_WPISU_BUR, "profil " + źródło, { dokładnySelect2: true }),
      definicja("usluga-zamknieta", "uslugaZamknieta", profil.usługaZamkniętaBur, "profil " + źródło),
      definicja("tytul", "tytul", szkolenie.tytułPoNormalizacjiBur || szkolenie.tytułBur || szkolenie.tytułOryginalny || "", źródło),
      definicja("data-rozpoczecia", "dataRozpoczecia", termin.dataStartBur || "", źródło, { typPola: "data" }),
      definicja("data-zakonczenia", "dataZakonczenia", termin.dataKoniecBur || "", źródło, { typPola: "data" }),
      definicja("data-rekrutacji", "dataZakonczeniaRekrutacji", dataRekrutacji, "reguła BUR", { typPola: "data" }),
      definicja("cena-netto", "cenaNetto", pobierzLiczbęDoPola(termin.cena), źródło),
      definicja("liczba-godzin", "liczbaGodzin", pobierzLiczbęDoPola(termin.liczbaGodzin || termin.czasTrwania), źródło),
      definicja("grupa-docelowa", "grupaDocelowa", sekcja(szkolenie, ["grupaDocelowa", "grupaDocelowaHtml", "groupHtml"]), źródło),
      definicja("lokalizacja-adres", "lokalizacjaAdres", online ? "Online" : termin.miejsce || termin.lokalizacja || "", źródło),
      definicja("cel-edukacyjny", "celEdukacyjny", "TAK", "reguła BUR", { typPola: "przełącznik" }),
      definicja("kwalifikacje-zrk", "kwalifikacjeZrk", "NIE", "reguła BUR"),
      definicja("kwalifikacje-inne", "kwalifikacjeInne", "NIE", "reguła BUR"),
      definicja("kompetencje", "kompetencje", "TAK", "reguła BUR"),
      definicja("kompetencje-dokument", "kompetencjeDokument", "TAK", "reguła BUR", { typPola: "przełącznik" }),
      definicja("kompetencje-walidacja", "kompetencjeWalidacja", "TAK", "reguła BUR", { typPola: "przełącznik" }),
      definicja("kompetencje-rozwiazania", "kompetencjeRozwiazania", "TAK", "reguła BUR", { typPola: "przełącznik" }),
      definicja("opis-celu", "opisCeluEdukacyjnego", przestrzeń.skróćCelEdukacyjnyDoLimituBur(sekcja(szkolenie, ["celEdukacyjnyOpis", "celSzkolenia", "celSzkoleniaHtml", "goalHtml"])), źródło),
      definicja("efekty-uczenia", "efektyUczenia", "-", "reguła BUR", { typPola: "pole_tabeli" }),
      definicja("kryteria-weryfikacji", "kryteriaWeryfikacji", "-", "reguła BUR", { typPola: "pole_tabeli" }),
      definicja("metoda-walidacji", "metodaWalidacji", "Wywiad swobodny", "reguła BUR")
    ];
    if (profil.sposóbProgramuBur === "cel_program_organizacja") { wynik.push(definicja("program", "program", przestrzeń.zbudujProgramDostawcy(profilId, szkolenie), źródło)); }
    if (profil.liczbaUczestnikówBur) {
      wynik.push(definicja("minimum-uczestnikow", "minimalnaLiczbaUczestnikow", online ? profil.liczbaUczestnikówBur.onlineMinimum : profil.liczbaUczestnikówBur.stacjonarneMinimum, "profil " + źródło));
      wynik.push(definicja("maksimum-uczestnikow", "maksymalnaLiczbaUczestnikow", profil.liczbaUczestnikówBur.maksimum, "profil " + źródło));
    } else {
      wynik.push(definicja("minimum-uczestnikow", "minimalnaLiczbaUczestnikow", "", "reguła BUR", { doSprawdzenia: true, wymagalność: "do sprawdzenia" }));
      wynik.push(definicja("maksimum-uczestnikow", "maksymalnaLiczbaUczestnikow", "", "reguła BUR", { doSprawdzenia: true, wymagalność: "do sprawdzenia" }));
    }
    if (profil.daneKontaktowe && profil.daneKontaktowe.email) {
      wynik.push(definicja("kontakt-imie", "kontaktImieNazwisko", profil.daneKontaktowe.imięINazwisko, "profil " + źródło));
      wynik.push(definicja("kontakt-email", "kontaktEmail", profil.daneKontaktowe.email, "profil " + źródło));
      wynik.push(definicja("kontakt-telefon", "kontaktTelefon", profil.daneKontaktowe.telefon, "profil " + źródło));
      wynik.push(definicja("osoby-prowadzace", "osobyProwadzace", [profil.osobaProwadzącaUsługę, profil.osobaProwadzącaWalidację], "profil " + źródło, { typPola: "osoby_prowadzace" }));
    }
    const kluczFormy = online ? "online" : "stacjonarna";
    [["materialy", "informacjaOMaterialach", profil.materiały], ["warunki", "warunkiUczestnictwa", profil.warunkiUczestnictwa], ["dodatkowe", "informacjeDodatkowe", profil.informacjeDodatkowe], ["techniczne", "warunkiTechniczne", profil.warunkiTechniczne], ["kody", "kodyDostepowe", profil.kodyDostępowe]].forEach(function dodajWedługFormy(dane) {
      const wartość = dane[2] && dane[2][kluczFormy];
      if (wartość) { wynik.push(definicja(dane[0] + "-" + kluczFormy, dane[1], wartość, "profil " + źródło)); }
    });
    return wynik;
  }
  przestrzeń.pobierzDefinicjePólWypełnieniaBur = pobierzDefinicjePólWypełnieniaBur;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
