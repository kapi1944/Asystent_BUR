(function zarejestrujCeleFormularzaBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function definicjaCelu(id, dane) {
    return Object.assign({
      id: id,
      selektory: [],
      selektoryAwaryjne: [],
      selektorSekcji: "",
      sekcja: "",
      etykieta: "",
      typKontrolki: "input"
    }, dane || {});
  }

  const cele = {
    formaSwiadczenia: definicjaCelu("formaSwiadczenia", { selektory: ["#select2-formularzwstepnysekcja-formaswiadczenia-container"], selektoryAwaryjne: ["#formularzwstepnysekcja-formaswiadczenia"], sekcja: "Formularz wstępny", etykieta: "Forma świadczenia usługi", typKontrolki: "select2" }),
    wariantZajec: definicjaCelu("wariantZajec", { selektory: ["#select2-formularzwstepnysekcja-wariantzajec-container"], selektoryAwaryjne: ["#formularzwstepnysekcja-wariantzajec"], sekcja: "Formularz wstępny", etykieta: "Wariant zajęć", typKontrolki: "select2" }),
    podstawaWpisu: definicjaCelu("podstawaWpisu", { selektory: ["#formularzwstepnysekcja-podstawauzyskaniawpisuid", "#select2-formularzwstepnysekcja-podstawauzyskaniawpisuid-container"], sekcja: "Formularz wstępny", etykieta: "Podstawa uzyskania wpisu do BUR", typKontrolki: "select2" }),
    uslugaZamknieta: definicjaCelu("uslugaZamknieta", { selektory: ["#formularzwstepnysekcja-czyuslugadedykowanaLabel"], sekcja: "Formularz wstępny", etykieta: "Usługa zamknięta", typKontrolki: "przełącznik" }),
    dataRozpoczecia: definicjaCelu("dataRozpoczecia", { selektory: ["#informacjepodstawowesekcja-datarozpoczeciauslugi"], sekcja: "Informacje podstawowe", etykieta: "Data rozpoczęcia usługi", typKontrolki: "input" }),
    dataZakonczenia: definicjaCelu("dataZakonczenia", { selektory: ["#informacjepodstawowesekcja-datazakonczeniauslugi"], sekcja: "Informacje podstawowe", etykieta: "Data zakończenia usługi", typKontrolki: "input" }),
    dataZakonczeniaRekrutacji: definicjaCelu("dataZakonczeniaRekrutacji", { selektory: ["#informacjepodstawowesekcja-datazakonczeniarekrutacji"], sekcja: "Informacje podstawowe", etykieta: "Data zakończenia rekrutacji", typKontrolki: "input" }),
    minimalnaLiczbaUczestnikow: definicjaCelu("minimalnaLiczbaUczestnikow", { selektory: ["#informacjepodstawowesekcja-minimalnaliczbauczestnikow"], sekcja: "Informacje podstawowe", etykieta: "Minimalna liczba uczestników", typKontrolki: "input" }),
    maksymalnaLiczbaUczestnikow: definicjaCelu("maksymalnaLiczbaUczestnikow", { selektory: ["#informacjepodstawowesekcja-maksymalnaliczbauczestnikow"], sekcja: "Informacje podstawowe", etykieta: "Maksymalna liczba uczestników", typKontrolki: "input" }),
    liczbaGodzin: definicjaCelu("liczbaGodzin", { selektory: ["#informacjepodstawowesekcja-liczbagodzinuslugi"], sekcja: "Informacje podstawowe", etykieta: "Liczba godzin usługi", typKontrolki: "input" }),
    cenaNetto: definicjaCelu("cenaNetto", { selektory: ["#informacjepodstawowesekcja-cenanettouslugi"], selektoryAwaryjne: ["#informacjepodstawowesekcja-cena"], sekcja: "Informacje podstawowe", etykieta: "Cena netto", typKontrolki: "input" }),
    lokalizacjaAdres: definicjaCelu("lokalizacjaAdres", { selektory: ["#lokalizacjauslugisekcja-adres"], selektoryAwaryjne: ["#lokalizacjauslugisekcja-miasto"], sekcja: "Lokalizacja usługi", etykieta: "Lokalizacja i adres", typKontrolki: "input" }),
    osobyProwadzace: definicjaCelu("osobyProwadzace", { selektory: ["#osobyprowadzace-grid"], selektoryAwaryjne: ["#prowadzacy-grid", "[id*='osobyprowadzace'][role='grid']"], sekcja: "Osoby prowadzące", etykieta: "Osoby prowadzące", typKontrolki: "tabela" }),
    program: definicjaCelu("program", { selektory: ["#programiharmonogramuslugisekcja-programuslugi-wysiwyg .ql-editor"], selektoryAwaryjne: ["#programiharmonogramuslugisekcja-programuslugi-wysiwyg"], sekcja: "Program i harmonogram usługi", etykieta: "Program usługi", typKontrolki: "edytorTekstowy" }),
    kontaktImieNazwisko: definicjaCelu("kontaktImieNazwisko", { selektory: ["#danekontaktowesekcja-imieinazwisko", "input[id*='danekontaktowe' i][id*='imie' i]", "input[name*='danekontaktowe' i][name*='imie' i]"], sekcja: "Dane kontaktowe", etykieta: "Imię i nazwisko", typKontrolki: "input" }),
    kontaktEmail: definicjaCelu("kontaktEmail", { selektory: ["#danekontaktowesekcja-email", "input[id*='danekontaktowe' i][type='email']", "input[id*='danekontaktowe' i][id*='email' i]", "input[name*='danekontaktowe' i][name*='email' i]"], selektoryAwaryjne: ["#danekontaktowesekcja-adrese-mail"], sekcja: "Dane kontaktowe", etykieta: "E-mail", typKontrolki: "input" }),
    kontaktTelefon: definicjaCelu("kontaktTelefon", { selektory: ["#danekontaktowesekcja-telefon", "input[id*='danekontaktowe' i][type='tel']", "input[id*='danekontaktowe' i][id*='telefon' i]", "input[name*='danekontaktowe' i][name*='telefon' i]"], sekcja: "Dane kontaktowe", etykieta: "Telefon", typKontrolki: "input" }),
    daneKontaktowe: definicjaCelu("daneKontaktowe", { selektoryAwaryjne: ["#daneKontaktowe", "#danekontaktowesekcja"], sekcja: "Dane kontaktowe", etykieta: "Dane kontaktowe", typKontrolki: "input" }),
    informacjaOMaterialach: definicjaCelu("informacjaOMaterialach", { selektory: ["#informacjedodatkowesekcja-informacjaomaterialachdlaosobuczestniczacychwusludze-wysiwyg .ql-editor"], sekcja: "Informacje dodatkowe", etykieta: "Informacja o materiałach dla uczestników usługi", typKontrolki: "edytorTekstowy" }),
    warunkiUczestnictwa: definicjaCelu("warunkiUczestnictwa", { selektory: ["#informacjedodatkowesekcja-warunkiuczestnictwa-wysiwyg .ql-editor"], sekcja: "Informacje dodatkowe", etykieta: "Warunki uczestnictwa", typKontrolki: "edytorTekstowy" }),
    informacjeDodatkowe: definicjaCelu("informacjeDodatkowe", { selektory: ["#informacjedodatkowesekcja-informacjedodatkowe-wysiwyg .ql-editor"], sekcja: "Informacje dodatkowe", etykieta: "Informacje dodatkowe", typKontrolki: "edytorTekstowy" }),
    warunkiTechniczne: definicjaCelu("warunkiTechniczne", { selektory: ["#informacjedodatkowesekcja-warunkitechniczne-wysiwyg .ql-editor"], sekcja: "Informacje dodatkowe", etykieta: "Warunki techniczne", typKontrolki: "edytorTekstowy" }),
    kodyDostepowe: definicjaCelu("kodyDostepowe", { selektory: ["#informacjedodatkowesekcja-kodydostepowedouslugi-wysiwyg .ql-editor"], sekcja: "Informacje dodatkowe", etykieta: "Kody dostępowe do usługi", typKontrolki: "edytorTekstowy" }),
    harmonogram: definicjaCelu("harmonogram", { selektory: ["#harmonogram-grid > div > table"], selektoryAwaryjne: ["#harmonogram-grid", "#import"], sekcja: "Program i harmonogram usługi", etykieta: "Harmonogram", typKontrolki: "tabela" }),
    publikacja: definicjaCelu("publikacja", { selektoryAwaryjne: ["button[type='submit']", "button[name*='publik']"], sekcja: "Publikacja", etykieta: "Opublikuj", typKontrolki: "przycisk" }),
    tytul: definicjaCelu("tytul", { selektory: ["#informacjepodstawowesekcja-tytuluslugi", "input[name*='tytuluslugi' i]", "textarea[name*='tytuluslugi' i]"], sekcja: "Informacje podstawowe", etykieta: "Tytuł", typKontrolki: "input" }),
    grupaDocelowa: definicjaCelu("grupaDocelowa", { selektory: ["#informacjepodstawowesekcja-grupadocelowauslugi-wysiwyg .ql-editor"], sekcja: "Informacje podstawowe", etykieta: "Grupa docelowa usługi", typKontrolki: "edytorTekstowy" }),
    celEdukacyjny: definicjaCelu("celEdukacyjny", { sekcja: "Główny cel usługi", etykieta: "Cel edukacyjny", typKontrolki: "input" }),
    opisCeluEdukacyjnego: definicjaCelu("opisCeluEdukacyjnego", { selektory: ["#glownyceluslugisekcja-celedukacyjnyopis"], sekcja: "Główny cel usługi", etykieta: "Cel edukacyjny - opis", typKontrolki: "input" }),
    kwalifikacjeZrk: definicjaCelu("kwalifikacjeZrk", { selektory: ["#qualificationsZrk .field-glownyceluslugisekcja-czyuslugadajekwalifikacjezrk"], sekcja: "Główny cel usługi", etykieta: "Czy usługa pozwala na uzyskanie kwalifikacji włączonej do ZSK?", typKontrolki: "przełącznik" }),
    kwalifikacjeInne: definicjaCelu("kwalifikacjeInne", { selektory: ["#qualificationsZrk .field-glownyceluslugisekcja-czyuslugadajekwalifikacjeinnenizzrk"], sekcja: "Główny cel usługi", etykieta: "Czy usługa pozwala na uzyskanie kwalifikacji niewłączonych do ZSK?", typKontrolki: "przełącznik" }),
    kompetencje: definicjaCelu("kompetencje", { selektoryAwaryjne: ["#qualificationsZrk .field-glownyceluslugisekcja-czyuslugaprowadzidonabyciakompetencji"], sekcja: "Główny cel usługi", etykieta: "Czy usługa prowadzi do nabycia kompetencji?", typKontrolki: "input" }),
    kompetencjeDokument: definicjaCelu("kompetencjeDokument", { sekcja: "Główny cel usługi", etykieta: "Czy dokument potwierdzający uzyskanie kompetencji", typKontrolki: "input" }),
    kompetencjeWalidacja: definicjaCelu("kompetencjeWalidacja", { sekcja: "Główny cel usługi", etykieta: "Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają, że walidacja", typKontrolki: "input" }),
    kompetencjeRozwiazania: definicjaCelu("kompetencjeRozwiazania", { sekcja: "Główny cel usługi", etykieta: "Czy dokument lub wyraźnie z nim powiązane inne dokumenty związane ze wsparciem potwierdzają zastosowanie rozwiązań", typKontrolki: "input" }),
    efektyUczenia: definicjaCelu("efektyUczenia", { sekcja: "Główny cel usługi", etykieta: "Efekty uczenia się", tabela: "Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji", kolumna: "Efekty uczenia się", typKontrolki: "tabela" }),
    kryteriaWeryfikacji: definicjaCelu("kryteriaWeryfikacji", { sekcja: "Główny cel usługi", etykieta: "Kryteria weryfikacji", tabela: "Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji", kolumna: "Kryteria weryfikacji", typKontrolki: "tabela" }),
    metodaWalidacji: definicjaCelu("metodaWalidacji", { sekcja: "Główny cel usługi", etykieta: "Wybierz metodę walidacji", tabela: "Efekty uczenia się oraz kryteria weryfikacji ich osiągnięcia i Metody walidacji", kolumna: "Metody walidacji", typKontrolki: "select2" })
  };

  const celeWalidacji = {
    "Forma świadczenia usługi": "formaSwiadczenia",
    "Wariant zajęć": "wariantZajec",
    "Data rozpoczęcia usługi": "dataRozpoczecia",
    "Data zakończenia usługi": "dataZakonczenia",
    "Data zakończenia rekrutacji": "dataZakonczeniaRekrutacji",
    "Minimalna liczba uczestników": "minimalnaLiczbaUczestnikow",
    "Maksymalna liczba uczestników": "maksymalnaLiczbaUczestnikow",
    "Liczba godzin usługi": "liczbaGodzin",
    "Cena netto": "cenaNetto",
    "Lokalizacja i adres": "lokalizacjaAdres",
    "Osoby prowadzące": "osobyProwadzace",
    "Program": "program",
    "Dane kontaktowe": "daneKontaktowe",
    "Harmonogram": "harmonogram",
    "Tytuł": "tytul",
    "Grupa docelowa usługi": "grupaDocelowa",
    "Cel edukacyjny": "celEdukacyjny",
    "Czy usługa prowadzi do nabycia kompetencji?": "kompetencje",
    "Pytanie 1 w sekcji kompetencji": "kompetencjeDokument",
    "Pytanie 2 w sekcji kompetencji": "kompetencjeWalidacja",
    "Pytanie 3 w sekcji kompetencji": "kompetencjeRozwiazania",
    "Efekty uczenia się": "efektyUczenia",
    "Kryteria weryfikacji": "kryteriaWeryfikacji",
    "Wybierz metodę walidacji": "metodaWalidacji"
  };

  function pobierzCelFormularzaBur(id) {
    return cele[id] || null;
  }

  function pobierzCelDlaPozycjiWalidacji(pole) {
    const cel = celeWalidacji[pole] || "";
    const identyfikatorZapasowy = "pole-" + String(pole || "nieznane")
      .toLowerCase()
      .replace(/ł/g, "l")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return { id: cel || identyfikatorZapasowy, celFormularza: cel || identyfikatorZapasowy };
  }

  function znajdźPierwszyWidoczny(dokument, selektory) {
    const lista = Array.isArray(selektory) ? selektory : [];
    for (let indeks = 0; indeks < lista.length; indeks += 1) {
      try {
        const elementy = Array.from(dokument.querySelectorAll(lista[indeks]));
        const widoczny = elementy.find(function wybierz(element) {
          const styl = globalny.getComputedStyle ? globalny.getComputedStyle(element) : null;
          return !styl || (styl.display !== "none" && styl.visibility !== "hidden");
        });
        if (widoczny) {
          return widoczny;
        }
      } catch (błąd) {}
    }
    return null;
  }

  function rozwińSekcjęCeluBur(dokument, cel, element) {
    const kontener = (cel.selektorSekcji && dokument.querySelector(cel.selektorSekcji)) || (element && przestrzeń.znajdźSekcjęPoNagłówku ? przestrzeń.znajdźSekcjęPoNagłówku(dokument, cel.sekcja) : null);
    const szczegóły = (kontener && kontener.closest("details")) || (element && element.closest("details"));
    if (szczegóły && !szczegóły.open) {
      szczegóły.open = true;
    }
    if (kontener) {
      const przycisk = kontener.querySelector("[aria-expanded='false'], .collapsed");
      if (przycisk && typeof przycisk.click === "function") {
        przycisk.click();
      }
    }
  }

  function znajdźCelFormularzaBur(dokument, id) {
    const cel = pobierzCelFormularzaBur(id);
    if (!cel) {
      return { ok: false, błąd: "Nie znaleziono odpowiadającego pola w aktualnej wersji formularza BUR." };
    }
    let element = null;
    if (cel.tabela && cel.kolumna && typeof przestrzeń.znajdźPoleWTabeliBur === "function") {
      element = przestrzeń.znajdźPoleWTabeliBur(dokument, cel.tabela, cel.kolumna);
    }
    if (!element) {
      element = znajdźPierwszyWidoczny(dokument, cel.selektory);
    }
    if (!element) {
      element = znajdźPierwszyWidoczny(dokument, cel.selektoryAwaryjne);
    }
    if (!element && przestrzeń.znajdźPoleBurZSzczegółami) {
      element = przestrzeń.znajdźPoleBurZSzczegółami(dokument, { sekcja: cel.sekcja, etykieta: cel.etykieta }).element;
    }
    if (!element) {
      return { ok: false, błąd: "Nie znaleziono odpowiadającego pola w aktualnej wersji formularza BUR." };
    }
    rozwińSekcjęCeluBur(dokument, cel, element);
    return { ok: true, cel: cel, element: element };
  }

  przestrzeń.REJESTR_CELÓW_FORMULARZA_BUR = cele;
  przestrzeń.pobierzCelFormularzaBur = pobierzCelFormularzaBur;
  przestrzeń.pobierzCelDlaPozycjiWalidacji = pobierzCelDlaPozycjiWalidacji;
  przestrzeń.znajdźCelFormularzaBur = znajdźCelFormularzaBur;
  przestrzeń.rozwińSekcjęCeluBur = rozwińSekcjęCeluBur;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
