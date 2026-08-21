(function zarejestrujKatalogSelektorówBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function definicjaPola(id, dane) {
    return Object.assign({
      id: id,
      selektory: [],
      selektoryAwaryjne: [],
      selektoryNatywne: [],
      selektorSekcji: "",
      sekcja: "",
      etykieta: "",
      typKontrolki: "input"
    }, dane || {});
  }

  const katalog = {
    rodzajUslugi: definicjaPola("rodzajUslugi", { selektory: ["#formularzwstepnysekcja-rodzajuslugiid"], selektoryNatywne: ["#formularzwstepnysekcja-rodzajuslugiid"], sekcja: "Formularz wstępny", etykieta: "Rodzaj świadczonej usługi", typKontrolki: "select2" }),
    podrodzajUslugi: definicjaPola("podrodzajUslugi", { selektory: ["#formularzwstepnysekcja-podrodzajuslugiid"], selektoryNatywne: ["#formularzwstepnysekcja-podrodzajuslugiid"], sekcja: "Formularz wstępny", etykieta: "Podrodzaj świadczonej usługi", typKontrolki: "select2" }),
    formaSwiadczenia: definicjaPola("formaSwiadczenia", { selektory: ["#select2-formularzwstepnysekcja-formaswiadczenia-container"], selektoryAwaryjne: ["#formularzwstepnysekcja-formaswiadczenia"], selektoryNatywne: ["#formularzwstepnysekcja-formaswiadczenia"], sekcja: "Formularz wstępny", etykieta: "Forma świadczenia usługi", typKontrolki: "select2" }),
    wariantZajec: definicjaPola("wariantZajec", { selektory: ["#select2-formularzwstepnysekcja-wariantzajec-container"], selektoryAwaryjne: ["#formularzwstepnysekcja-wariantzajec"], selektoryNatywne: ["#formularzwstepnysekcja-wariantzajec"], sekcja: "Formularz wstępny", etykieta: "Wariant zajęć", typKontrolki: "select2" }),
    podstawaWpisu: definicjaPola("podstawaWpisu", { selektory: ["#formularzwstepnysekcja-podstawauzyskaniawpisuid", "#select2-formularzwstepnysekcja-podstawauzyskaniawpisuid-container"], selektoryNatywne: ["#formularzwstepnysekcja-podstawauzyskaniawpisuid", "select[name='formularzwstepnysekcja[podstawauzyskaniawpisuid]']", "select[name*='podstawauzyskaniawpisu']"], sekcja: "Formularz wstępny", etykieta: "Podstawa uzyskania wpisu do BUR", typKontrolki: "select2" }),
    uslugaZamknieta: definicjaPola("uslugaZamknieta", { selektory: ["#formularzwstepnysekcja-czyuslugadedykowanaLabel"], sekcja: "Formularz wstępny", etykieta: "Usługa zamknięta", typKontrolki: "przełącznik" }),
    dataRozpoczecia: definicjaPola("dataRozpoczecia", { selektory: ["#informacjepodstawowesekcja-datarozpoczeciauslugi"], sekcja: "Informacje podstawowe", etykieta: "Data rozpoczęcia usługi", typKontrolki: "input" }),
    dataZakonczenia: definicjaPola("dataZakonczenia", { selektory: ["#informacjepodstawowesekcja-datazakonczeniauslugi"], sekcja: "Informacje podstawowe", etykieta: "Data zakończenia usługi", typKontrolki: "input" }),
    dataZakonczeniaRekrutacji: definicjaPola("dataZakonczeniaRekrutacji", { selektory: ["#informacjepodstawowesekcja-datazakonczeniarekrutacji"], sekcja: "Informacje podstawowe", etykieta: "Data zakończenia rekrutacji", typKontrolki: "input" }),
    minimalnaLiczbaUczestnikow: definicjaPola("minimalnaLiczbaUczestnikow", { selektory: ["#informacjepodstawowesekcja-minimalnaliczbauczestnikow"], sekcja: "Informacje podstawowe", etykieta: "Minimalna liczba uczestników", typKontrolki: "input" }),
    maksymalnaLiczbaUczestnikow: definicjaPola("maksymalnaLiczbaUczestnikow", { selektory: ["#informacjepodstawowesekcja-maksymalnaliczbauczestnikow"], sekcja: "Informacje podstawowe", etykieta: "Maksymalna liczba uczestników", typKontrolki: "input" }),
    liczbaGodzin: definicjaPola("liczbaGodzin", { selektory: ["#informacjepodstawowesekcja-liczbagodzinuslugi"], sekcja: "Informacje podstawowe", etykieta: "Liczba godzin usługi", typKontrolki: "input" }),
    cenaNetto: definicjaPola("cenaNetto", { selektory: ["#informacjepodstawowesekcja-cenanettouslugi"], selektoryAwaryjne: ["#informacjepodstawowesekcja-cena"], sekcja: "Informacje podstawowe", etykieta: "Cena netto", typKontrolki: "input" }),
    lokalizacjaAdres: definicjaPola("lokalizacjaAdres", { selektory: ["#lokalizacjauslugisekcja-adres"], selektoryAwaryjne: ["#lokalizacjauslugisekcja-miasto"], sekcja: "Lokalizacja usługi", etykieta: "Lokalizacja i adres", typKontrolki: "input" }),
    osobyProwadzace: definicjaPola("osobyProwadzace", { selektory: ["#osoby-prowadzace-grid"], selektoryAwaryjne: ["#osobyprowadzace-grid", "#osoby-prowadzace-grid table"], sekcja: "Osoby prowadzące", etykieta: "Osoby prowadzące", typKontrolki: "tabela" }),
    program: definicjaPola("program", { selektory: ["#programiharmonogramuslugisekcja-programuslugi-wysiwyg .ql-editor"], selektoryAwaryjne: ["#programiharmonogramuslugisekcja-programuslugi-wysiwyg"], sekcja: "Program i harmonogram usługi", etykieta: "Program usługi", typKontrolki: "edytorTekstowy" }),
    kontaktImieNazwisko: definicjaPola("kontaktImieNazwisko", { selektory: ["#osobadokontaktusekcja-godnosc", "input[name='OsobaDoKontaktuSekcja[godnosc]']", "#danekontaktowesekcja-imieinazwisko", "input[id*='danekontaktowe' i][id*='imie' i]", "input[name*='danekontaktowe' i][name*='imie' i]"], sekcja: "Dane kontaktowe", etykieta: "Imię i nazwisko", typKontrolki: "input" }),
    kontaktEmail: definicjaPola("kontaktEmail", { selektory: ["#osobadokontaktusekcja-email", "input[name='OsobaDoKontaktuSekcja[email]']", "#danekontaktowesekcja-email", "input[id*='danekontaktowe' i][type='email']", "input[id*='danekontaktowe' i][id*='email' i]", "input[name*='danekontaktowe' i][name*='email' i]"], selektoryAwaryjne: ["#danekontaktowesekcja-adrese-mail"], sekcja: "Dane kontaktowe", etykieta: "E-mail", typKontrolki: "input" }),
    kontaktTelefon: definicjaPola("kontaktTelefon", { selektory: ["#osobadokontaktusekcja-telefon", "input[name='OsobaDoKontaktuSekcja[telefon]']", "#danekontaktowesekcja-telefon", "input[id*='danekontaktowe' i][type='tel']", "input[id*='danekontaktowe' i][id*='telefon' i]", "input[name*='danekontaktowe' i][name*='telefon' i]"], sekcja: "Dane kontaktowe", etykieta: "Telefon", typKontrolki: "input" }),
    daneKontaktowe: definicjaPola("daneKontaktowe", { selektoryAwaryjne: ["#daneKontaktowe", "#danekontaktowesekcja"], sekcja: "Dane kontaktowe", etykieta: "Dane kontaktowe", typKontrolki: "input" }),
    informacjaOMaterialach: definicjaPola("informacjaOMaterialach", { selektory: ["#informacjedodatkowesekcja-informacjaomaterialachdlaosobuczestniczacychwusludze-wysiwyg .ql-editor"], sekcja: "Informacje dodatkowe", etykieta: "Informacja o materiałach dla uczestników usługi", typKontrolki: "edytorTekstowy" }),
    warunkiUczestnictwa: definicjaPola("warunkiUczestnictwa", { selektory: ["#informacjedodatkowesekcja-warunkiuczestnictwa-wysiwyg .ql-editor"], sekcja: "Informacje dodatkowe", etykieta: "Warunki uczestnictwa", typKontrolki: "edytorTekstowy" }),
    informacjeDodatkowe: definicjaPola("informacjeDodatkowe", { selektory: ["#informacjedodatkowesekcja-informacjedodatkowe-wysiwyg .ql-editor"], sekcja: "Informacje dodatkowe", etykieta: "Informacje dodatkowe", typKontrolki: "edytorTekstowy" }),
    warunkiTechniczne: definicjaPola("warunkiTechniczne", { selektory: ["#informacjedodatkowesekcja-warunkitechniczne-wysiwyg .ql-editor"], sekcja: "Informacje dodatkowe", etykieta: "Warunki techniczne", typKontrolki: "edytorTekstowy" }),
    kodyDostepowe: definicjaPola("kodyDostepowe", { selektory: ["#informacjedodatkowesekcja-kodydostepowedouslugi-wysiwyg .ql-editor"], sekcja: "Informacje dodatkowe", etykieta: "Kody dostępowe do usługi", typKontrolki: "edytorTekstowy" }),
    tytul: definicjaPola("tytul", { selektory: ["#informacjepodstawowesekcja-tytuluslugi", "input[name*='tytuluslugi' i]", "textarea[name*='tytuluslugi' i]"], sekcja: "Informacje podstawowe", etykieta: "Tytuł", typKontrolki: "input" }),
    grupaDocelowa: definicjaPola("grupaDocelowa", { selektory: ["#informacjepodstawowesekcja-grupadocelowauslugi-wysiwyg .ql-editor"], sekcja: "Informacje podstawowe", etykieta: "Grupa docelowa usługi", typKontrolki: "edytorTekstowy" }),
    celEdukacyjny: definicjaPola("celEdukacyjny", { sekcja: "Główny cel usługi", etykieta: "Cel edukacyjny", typKontrolki: "input" }),
    opisCeluEdukacyjnego: definicjaPola("opisCeluEdukacyjnego", { selektory: ["#glownyceluslugisekcja-celedukacyjnyopis"], sekcja: "Główny cel usługi", etykieta: "Cel edukacyjny - opis", typKontrolki: "input" }),
    kwalifikacjeZrk: definicjaPola("kwalifikacjeZrk", { selektory: ["#qualificationsZrk .field-glownyceluslugisekcja-czyuslugadajekwalifikacjezrk"], sekcja: "Główny cel usługi", etykieta: "Czy usługa pozwala na uzyskanie kwalifikacji włączonej do ZSK?", typKontrolki: "przełącznik" }),
    kwalifikacjeInne: definicjaPola("kwalifikacjeInne", { selektory: ["#qualificationsZrk .field-glownyceluslugisekcja-czyuslugadajekwalifikacjeinnenizzrk"], sekcja: "Główny cel usługi", etykieta: "Czy usługa pozwala na uzyskanie kwalifikacji niewłączonych do ZSK?", typKontrolki: "przełącznik" }),
    kompetencje: definicjaPola("kompetencje", { selektoryAwaryjne: ["#qualificationsZrk .field-glownyceluslugisekcja-czyuslugaprowadzidonabyciakompetencji"], sekcja: "Główny cel usługi", etykieta: "Czy usługa prowadzi do nabycia kompetencji?", typKontrolki: "input" }),
    kompetencjeDokument: definicjaPola("kompetencjeDokument", { sekcja: "Główny cel usługi", etykieta: "Czy dokument potwierdzający uzyskanie kompetencji", typKontrolki: "input" }),
    kompetencjeWalidacja: definicjaPola("kompetencjeWalidacja", { sekcja: "Główny cel usługi", etykieta: "Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają, że walidacja", typKontrolki: "input" }),
    kompetencjeRozwiazania: definicjaPola("kompetencjeRozwiazania", { sekcja: "Główny cel usługi", etykieta: "Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają zastosowanie rozwiązań", typKontrolki: "input" }),
    efektyUczenia: definicjaPola("efektyUczenia", { sekcja: "Główny cel usługi", etykieta: "Efekty uczenia się", tabela: "Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji", kolumna: "Efekty uczenia się", typKontrolki: "tabela" }),
    kryteriaWeryfikacji: definicjaPola("kryteriaWeryfikacji", { sekcja: "Główny cel usługi", etykieta: "Kryteria weryfikacji", tabela: "Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji", kolumna: "Kryteria weryfikacji", typKontrolki: "tabela" }),
    metodaWalidacji: definicjaPola("metodaWalidacji", { sekcja: "Główny cel usługi", etykieta: "Wybierz metodę walidacji", tabela: "Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji", kolumna: "Metody walidacji", typKontrolki: "select2" })
  };

  function pobierzDefinicjęPolaBur(id) {
    return katalog[id] || null;
  }

  function pobierzDefinicjęPodstawyWpisuBur() {
    return katalog.podstawaWpisu;
  }

  przestrzeń.KATALOG_SELEKTORÓW_PÓL_BUR = katalog;
  przestrzeń.pobierzDefinicjęPolaBur = pobierzDefinicjęPolaBur;
  przestrzeń.pobierzDefinicjęPodstawyWpisuBur = pobierzDefinicjęPodstawyWpisuBur;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
