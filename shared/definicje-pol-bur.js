(function zarejestrujDefinicjePolBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  function sekcja(szkolenie, nazwy) { const dane = szkolenie.sekcje || {}; return nazwy.map(function pobierz(nazwa) { return dane[nazwa]; }).find(Boolean) || ""; }
  function definicja(id, sekcjaPola, pole, typPola, wartośćProponowana, źródło, definicjaPola, wymagalność) {
    return { id: id, sekcja: sekcjaPola, pole: pole, typPola: typPola, wartośćProponowana: wartośćProponowana, źródło: źródło, wymagalność: wymagalność || "wymagane", blokująca: false, definicjaPola: definicjaPola, sposóbLokalizacji: definicjaPola.tabela ? "tabela" : (definicjaPola.selektory && definicjaPola.selektory.length ? "selektor" : "etykieta") };
  }
  function pobierzDefinicjePólWypełnieniaBur(kontekst) {
    const szkolenie = kontekst && kontekst.szkolenieSemper || {}; const termin = kontekst && kontekst.wybranyTermin || {};
    const online = /online/i.test([termin.forma, termin.miejsce].join(" "));
    const podstawowe = "Informacje podstawowe"; const cel = "Główny cel usługi";
    const pole = function utwórz(id, sekcjaPola, nazwa, typ, wartość, selektor, źródło) { return definicja(id, sekcjaPola, nazwa, typ, wartość, źródło || "reguła BUR", { sekcja: sekcjaPola, etykieta: nazwa, selektory: selektor ? [selektor] : [], typ: typ }); };
    return [
      pole("forma-swiadczenia", "Formularz wstępny", "Forma świadczenia usługi", "select2", online ? "online" : "stacjonarna", "#select2-formularzwstepnysekcja-formaswiadczenia-container"),
      pole("wariant-zajec", "Formularz wstępny", "Wariant zajęć", "select2", "Zajęcia grupowe", "#select2-formularzwstepnysekcja-wariantzajec-container"),
      pole("podstawa-wpisu", "Formularz wstępny", "Podstawa uzyskania wpisu do BUR", "select2", "Znak Jakości TGLS Quality Alliance", "#select2-formularzwstepnysekcja-podstawauzyskaniawpisuid-container"),
      pole("usluga-zamknieta", "Formularz wstępny", "Usługa zamknięta", "przełącznik", "NIE", "#formularzwstepnysekcja-czyuslugadedykowanaLabel"),
      pole("tytul", podstawowe, "Tytuł", "tekst", szkolenie.tytułPoNormalizacjiBur || szkolenie.tytulBur || szkolenie.tytułOryginalny || "", "#informacjepodstawowesekcja-tytuluslugi", "SEMPER"),
      pole("data-rozpoczecia", podstawowe, "Data rozpoczęcia usługi", "data", termin.dataStartBur || "", "#informacjepodstawowesekcja-datarozpoczeciauslugi", "SEMPER"),
      pole("data-zakonczenia", podstawowe, "Data zakończenia usługi", "data", termin.dataKoniecBur || "", "#informacjepodstawowesekcja-datazakonczeniauslugi", "SEMPER"),
      pole("data-rekrutacji", podstawowe, "Data zakończenia rekrutacji", "data", termin.dataZakończeniaRekrutacjiBur || termin.dataZakonczeniaRekrutacjiBur || "", "#informacjepodstawowesekcja-datazakonczeniarekrutacji", "SEMPER"),
      pole("grupa-docelowa", podstawowe, "Grupa docelowa usługi", "quill", sekcja(szkolenie, ["grupaDocelowa", "grupaDocelowaHtml", "groupHtml"]), "#informacjepodstawowesekcja-grupadocelowauslugi-wysiwyg .ql-editor", "SEMPER"),
      pole("minimum-uczestnikow", podstawowe, "Minimalna liczba uczestników", "liczba", online ? "2" : "5", "#informacjepodstawowesekcja-minimalnaliczbauczestnikow"),
      pole("maksimum-uczestnikow", podstawowe, "Maksymalna liczba uczestników", "liczba", "15", "#informacjepodstawowesekcja-maksymalnaliczbauczestnikow"),
      pole("cel-edukacyjny", cel, "Cel edukacyjny", "przełącznik", "TAK", ""),
      pole("kwalifikacje-zrk", cel, "Czy usługa pozwala na uzyskanie kwalifikacji włączonej do ZSK?", "przełącznik", "NIE", "#qualificationsZrk .field-glownyceluslugisekcja-czyuslugadajekwalifikacjezrk"),
      pole("kwalifikacje-inne", cel, "Czy usługa pozwala na uzyskanie kwalifikacji niewłączonych do ZSK?", "przełącznik", "NIE", "#qualificationsZrk .field-glownyceluslugisekcja-czyuslugadajekwalifikacjeinnenizzrk"),
      pole("kompetencje", cel, "Czy usługa prowadzi do nabycia kompetencji?", "przełącznik", "TAK", "#qualificationsZrk .field-glownyceluslugisekcja-czyuslugaprowadzidonabyciakompetencji"),
      pole("kompetencje-dokument", cel, "Pytanie 1 w sekcji kompetencji", "przełącznik", "TAK", ""), pole("kompetencje-walidacja", cel, "Pytanie 2 w sekcji kompetencji", "przełącznik", "TAK", ""), pole("kompetencje-rozwiazania", cel, "Pytanie 3 w sekcji kompetencji", "przełącznik", "TAK", ""),
      pole("opis-celu", cel, "Cel edukacyjny - opis", "tekst", sekcja(szkolenie, ["celSzkolenia", "celSzkoleniaHtml", "goalHtml"]), "#glownyceluslugisekcja-celedukacyjnyopis", "SEMPER"),
      definicja("efekty-uczenia", cel, "Efekty uczenia się", "pole_tabeli", "-", "reguła BUR", { tabela: "Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji", kolumna: "Efekty uczenia się" }),
      definicja("kryteria-weryfikacji", cel, "Kryteria weryfikacji", "pole_tabeli", "-", "reguła BUR", { tabela: "Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji", kolumna: "Kryteria weryfikacji" }),
      definicja("metoda-walidacji", cel, "Wybierz metodę walidacji", "select2", "Wywiad swobodny", "reguła BUR", { tabela: "Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji", kolumna: "Metody walidacji", typ: "select2" })
    ];
  }
  przestrzeń.pobierzDefinicjePólWypełnieniaBur = pobierzDefinicjePólWypełnieniaBur;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
