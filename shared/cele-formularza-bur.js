(function zarejestrujCeleFormularzaBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function skróćCelEdukacyjnyDoLimituBur(wartość, limit) {
    const tekst = String(wartość || "").trim();
    const maksymalnaDługość = Number(limit) || 500;
    if (tekst.length <= maksymalnaDługość) {
      return tekst;
    }
    const fragment = tekst.slice(0, maksymalnaDługość);
    const zakończeniaZdań = Array.from(fragment.matchAll(/[.!?](?:["”')\]]+)?(?=\s|$)/g));
    if (zakończeniaZdań.length) {
      const ostatnieZakończenie = zakończeniaZdań[zakończeniaZdań.length - 1];
      return fragment.slice(0, ostatnieZakończenie.index + ostatnieZakończenie[0].length).trim();
    }
    const ostatniaSpacja = fragment.lastIndexOf(" ");
    return fragment.slice(0, ostatniaSpacja > 0 ? ostatniaSpacja : maksymalnaDługość).trim();
  }

  const celeKontrolerów = {
    harmonogram: { id: "harmonogram", selektory: ["#harmonogram-grid > div > table"], selektoryAwaryjne: ["#harmonogram-grid", "#import"], sekcja: "Program i harmonogram usługi", etykieta: "Harmonogram", typKontrolki: "tabela" },
    publikacja: { id: "publikacja", selektory: [], selektoryAwaryjne: ["button[type='submit']", "button[name*='publik']"], sekcja: "Publikacja", etykieta: "Opublikuj", typKontrolki: "przycisk" }
  };
  const cele = Object.assign({}, przestrzeń.KATALOG_SELEKTORÓW_PÓL_BUR || {}, celeKontrolerów);

  const celeWalidacji = {
    "Rodzaj świadczonej usługi": "rodzajUslugi",
    "Podrodzaj świadczonej usługi": "podrodzajUslugi",
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
    const wynik = przestrzeń.resolverPólBur.rozwiążPoSelektorach(dokument, selektory || []);
    if (!wynik.element) {
      return null;
    }
    const styl = globalny.getComputedStyle ? globalny.getComputedStyle(wynik.element) : null;
    return !styl || (styl.display !== "none" && styl.visibility !== "hidden") ? wynik.element : null;
  }

  function rozwińSekcjęCeluBur(dokument, cel, element) {
    const kontener = (cel.selektorSekcji && dokument.querySelector(cel.selektorSekcji))
      || (element && przestrzeń.znajdźSekcjęPoNagłówku ? przestrzeń.znajdźSekcjęPoNagłówku(dokument, cel.sekcja) : null);
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
  przestrzeń.skróćCelEdukacyjnyDoLimituBur = skróćCelEdukacyjnyDoLimituBur;
  przestrzeń.pobierzCelFormularzaBur = pobierzCelFormularzaBur;
  przestrzeń.pobierzCelDlaPozycjiWalidacji = pobierzCelDlaPozycjiWalidacji;
  przestrzeń.znajdźCelFormularzaBur = znajdźCelFormularzaBur;
  przestrzeń.rozwińSekcjęCeluBur = rozwińSekcjęCeluBur;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
