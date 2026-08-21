(function zarejestrujResolverPólBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function normalizujTekstDoWalidacji(wartość) {
    const dokument = globalny.document;
    const element = dokument && dokument.createElement ? dokument.createElement("div") : null;
    let tekst = String(wartość || "");

    if (/<[a-z][\s\S]*>/i.test(tekst) && element) {
      element.innerHTML = tekst;
      tekst = element.textContent || "";
    }

    return tekst.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }

  function normalizujKluczBur(wartość) {
    return normalizujTekstDoWalidacji(wartość)
      .toLowerCase()
      .replace(/ł/g, "l")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function wynikBłędu(kodBłędu, metodaZnalezienia, selektor) {
    return { element: null, metodaZnalezienia: metodaZnalezienia || "brak", selektor: selektor || "", kodBłędu: kodBłędu || "BRAK_ELEMENTU" };
  }

  function pobierzIdBezpiecznie(id) {
    if (!id) {
      return "";
    }
    if (globalny.CSS && globalny.CSS.escape) {
      return "#" + globalny.CSS.escape(id);
    }
    return "#" + String(id).replace(/([ #;?%&,.+*~':"!^$[\]()=>|/@])/g, "\\$1");
  }

  function znajdźKontenerPola(element) {
    if (!element) {
      return null;
    }
    return element.closest(
      ".question-field, .form-group, .field, [class*='field-'], .row, tr, td, .select2-container, .ql-container, .card-body"
    ) || element.parentElement || element;
  }

  function znajdźKontrolkiWKontenerze(kontener) {
    if (!kontener) {
      return [];
    }
    if (kontener.matches && kontener.matches("input, textarea, select, .ql-editor, .select2-selection, [id^='select2-'][id$='-container'], [contenteditable='true']")) {
      return [kontener];
    }
    return Array.from(kontener.querySelectorAll
      ? kontener.querySelectorAll("input:not([type='hidden']), textarea, select, .ql-editor, .select2-selection, [id^='select2-'][id$='-container'], [contenteditable='true']")
      : []);
  }

  function rozwiążPoSelektorach(dokument, selektory) {
    const lista = Array.isArray(selektory) ? selektory : [selektory];
    for (let indeks = 0; indeks < lista.length; indeks += 1) {
      const selektor = lista[indeks];
      let kandydaci = [];
      if (!selektor) {
        continue;
      }
      try {
        kandydaci = Array.from(dokument.querySelectorAll(selektor));
      } catch (błąd) {
        continue;
      }
      if (kandydaci.length > 1) {
        return wynikBłędu("NIEJEDNOZNACZNY_SELEKTOR", "niejednoznaczny selektor", selektor);
      }
      if (kandydaci.length === 1) {
        return { element: kandydaci[0], metodaZnalezienia: indeks ? "selektor alternatywny" : "selektor podstawowy", selektor: selektor, kodBłędu: "" };
      }
    }
    return wynikBłędu("BRAK_ELEMENTU", "brak", "");
  }

  function znajdźPolePoSelektorach(dokument, selektory) {
    return rozwiążPoSelektorach(dokument, selektory).element;
  }

  function rozwiążPoEtykiecie(dokument, tekstEtykiety) {
    const szukanyKlucz = normalizujKluczBur(tekstEtykiety);
    if (!szukanyKlucz) {
      return wynikBłędu("BRAK_ETYKIETY", "etykieta", "");
    }

    const kandydaciPól = [];
    Array.from(dokument.querySelectorAll("label, dt, th, span, div, p")).forEach(function sprawdźEtykietę(etykieta) {
      const tekst = normalizujKluczBur(etykieta.textContent || "");
      if (!tekst || tekst.length > 260 || !tekst.includes(szukanyKlucz)) {
        return;
      }

      if (etykieta.htmlFor) {
        let polePoId = null;
        try {
          polePoId = dokument.querySelector(pobierzIdBezpiecznie(etykieta.htmlFor));
        } catch (błąd) {}
        if (polePoId) {
          kandydaciPól.push(polePoId);
          return;
        }
      }

      const kontener = znajdźKontenerPola(etykieta);
      if (!kontener || kontener === dokument.body) {
        return;
      }
      const kontrolki = znajdźKontrolkiWKontenerze(kontener).filter(function pomińEtykietę(pole) { return pole !== etykieta; });
      if (kontrolki.length === 1) {
        kandydaciPól.push(kontrolki[0]);
      } else if (kontrolki.length > 1) {
        kontrolki.forEach(function dodaj(pole) { kandydaciPól.push(pole); });
      } else {
        kandydaciPól.push(kontener);
      }
    });

    const unikalne = Array.from(new Set(kandydaciPól));
    if (unikalne.length > 1) {
      return wynikBłędu("NIEJEDNOZNACZNA_ETYKIETA", "niejednoznaczna etykieta", "");
    }
    return unikalne.length === 1
      ? { element: unikalne[0], metodaZnalezienia: "etykieta", selektor: "", kodBłędu: "" }
      : wynikBłędu("BRAK_ELEMENTU", "etykieta", "");
  }

  function znajdźPolePoEtykiecie(dokument, tekstEtykiety) {
    return rozwiążPoEtykiecie(dokument, tekstEtykiety).element;
  }

  function rozwiążSekcjęPoNagłówku(dokument, tekstNagłówka) {
    const szukanyKlucz = normalizujKluczBur(tekstNagłówka);
    const selektoryNagłówków = "h1, h2, h3, h4, h5, h6, .card-header, legend";
    let pasujące = Array.from(dokument.querySelectorAll(selektoryNagłówków)).filter(function pasuje(element) {
      const tekst = normalizujKluczBur(element.textContent || "");
      return tekst && tekst.length <= 180 && tekst.includes(szukanyKlucz);
    });
    if (!pasujące.length) {
      pasujące = Array.from(dokument.querySelectorAll("strong, b, span, div")).filter(function pasujeAwaryjnie(element) {
        const tekst = normalizujKluczBur(element.textContent || "");
        return tekst && tekst.length <= 180 && tekst.includes(szukanyKlucz);
      });
    }
    const sekcje = Array.from(new Set(pasujące.map(function pobierzSekcję(element) {
      return element.closest("section, fieldset, .card, .panel") || element.parentElement || element;
    })));
    if (sekcje.length > 1) {
      return wynikBłędu("NIEJEDNOZNACZNA_SEKCJA", "niejednoznaczna sekcja", "");
    }
    return sekcje.length === 1
      ? { element: sekcje[0], metodaZnalezienia: "sekcja", selektor: "", kodBłędu: "" }
      : wynikBłędu("BRAK_SEKCJI", "sekcja", "");
  }

  function znajdźSekcjęPoNagłówku(dokument, tekstNagłówka) {
    return rozwiążSekcjęPoNagłówku(dokument, tekstNagłówka).element;
  }

  function rozwiążPoleWTabeliBur(dokument, tytułTabeli, nazwaKolumny) {
    const kluczTabeli = normalizujKluczBur(tytułTabeli);
    const kluczKolumny = normalizujKluczBur(nazwaKolumny);
    const pasująceTabele = [];

    Array.from(dokument.querySelectorAll("table")).forEach(function sprawdźTabelę(tabela) {
      const nagłówki = Array.from(tabela.querySelectorAll("thead th, thead td"));
      const właściweNagłówki = nagłówki.length ? nagłówki : Array.from(tabela.querySelectorAll("tr:first-child th, tr:first-child td"));
      const indeksKolumny = właściweNagłówki.findIndex(function sprawdźNagłówek(nagłówek) {
        return normalizujKluczBur(nagłówek.textContent || "").includes(kluczKolumny);
      });
      if (indeksKolumny < 0) {
        return;
      }

      const podpis = normalizujKluczBur([
        tabela.querySelector("caption") && tabela.querySelector("caption").textContent,
        tabela.getAttribute("aria-label"),
        tabela.closest("section, fieldset, .card, .panel") && tabela.closest("section, fieldset, .card, .panel").textContent
      ].filter(Boolean).join(" "));
      const nagłówkiEfektów = ["efekty uczenia sie", "kryteria weryfikacji", "metody walidacji"];
      const czyTabelaEfektów = nagłówkiEfektów.every(function zawiera(oczekiwany) {
        return właściweNagłówki.some(function pasuje(nagłówek) { return normalizujKluczBur(nagłówek.textContent || "").includes(oczekiwany); });
      });
      if (kluczTabeli && !podpis.includes(kluczTabeli) && !czyTabelaEfektów) {
        return;
      }
      pasująceTabele.push({ tabela: tabela, indeksKolumny: indeksKolumny });
    });

    if (pasująceTabele.length > 1) {
      return wynikBłędu("NIEJEDNOZNACZNA_TABELA", "niejednoznaczna tabela", "");
    }
    if (!pasująceTabele.length) {
      return wynikBłędu("BRAK_TABELI", "tabela", "");
    }

    const daneTabeli = pasująceTabele[0];
    if (kluczKolumny.includes("metody walidacji")) {
      const polaWalidacji = Array.from(new Set(Array.from(daneTabeli.tabela.querySelectorAll(
        "tbody select, tbody [id^='select2-'][id$='-container'], tbody .select2-selection__rendered"
      ))));
      if (polaWalidacji.length > 1) {
        return wynikBłędu("NIEJEDNOZNACZNE_POLE_TABELI", "niejednoznaczne pole tabeli", "");
      }
      if (polaWalidacji.length === 1) {
        return { element: polaWalidacji[0], metodaZnalezienia: "tabela", selektor: "", kodBłędu: "" };
      }
    }
    const pola = [];
    Array.from(daneTabeli.tabela.querySelectorAll("tbody tr, tr")).forEach(function sprawdźWiersz(wiersz) {
      const komórki = Array.from(wiersz.children || []).filter(function tylkoTd(element) { return element.tagName === "TD"; });
      const komórka = komórki[daneTabeli.indeksKolumny];
      if (!komórka) {
        return;
      }
      const kontrolki = Array.from(komórka.querySelectorAll(
        "input:not([type='hidden']), textarea, select, .ql-editor, [id^='select2-'][id$='-container'], .select2-selection__rendered, .select2-selection, [contenteditable='true']"
      ));
      if (kontrolki.length) {
        kontrolki.forEach(function dodaj(kontrolka) { pola.push(kontrolka); });
      } else if (komórka.querySelector("input[type='hidden']") || normalizujTekstDoWalidacji(komórka.textContent || "")) {
        pola.push(komórka);
      }
    });

    const unikalne = Array.from(new Set(pola));
    if (unikalne.length > 1) {
      return wynikBłędu("NIEJEDNOZNACZNE_POLE_TABELI", "niejednoznaczne pole tabeli", "");
    }
    return unikalne.length === 1
      ? { element: unikalne[0], metodaZnalezienia: "tabela", selektor: "", kodBłędu: "" }
      : wynikBłędu("BRAK_POLA_TABELI", "tabela", "");
  }

  function znajdźPoleWTabeliBur(dokument, tytułTabeli, nazwaKolumny) {
    return rozwiążPoleWTabeliBur(dokument, tytułTabeli, nazwaKolumny).element;
  }

  function rozwiążPole(dokument, definicjaPola) {
    const definicja = definicjaPola || {};
    const poSelektorze = rozwiążPoSelektorach(dokument, (definicja.selektory || []).concat(definicja.selektoryAwaryjne || []));
    if (poSelektorze.element || poSelektorze.kodBłędu === "NIEJEDNOZNACZNY_SELEKTOR") {
      return poSelektorze;
    }

    if (definicja.etykieta) {
      const poEtykiecie = rozwiążPoEtykiecie(dokument, definicja.etykieta);
      if (poEtykiecie.element || poEtykiecie.kodBłędu === "NIEJEDNOZNACZNA_ETYKIETA") {
        poEtykiecie.metodaZnalezienia = poEtykiecie.element ? "etykieta globalna" : poEtykiecie.metodaZnalezienia;
        return poEtykiecie;
      }
    }

    if (definicja.sekcja && definicja.etykieta) {
      const sekcja = rozwiążSekcjęPoNagłówku(dokument, definicja.sekcja);
      if (sekcja.kodBłędu === "NIEJEDNOZNACZNA_SEKCJA") {
        return sekcja;
      }
      if (sekcja.element) {
        const wSekcji = rozwiążPoEtykiecie(sekcja.element, definicja.etykieta);
        if (wSekcji.element || wSekcji.kodBłędu === "NIEJEDNOZNACZNA_ETYKIETA") {
          wSekcji.metodaZnalezienia = wSekcji.element ? "etykieta w sekcji" : wSekcji.metodaZnalezienia;
          return wSekcji;
        }
      }
    }

    if (definicja.tabela && definicja.kolumna) {
      return rozwiążPoleWTabeliBur(dokument, definicja.tabela, definicja.kolumna);
    }
    return wynikBłędu("BRAK_ELEMENTU", "brak", "");
  }

  function znajdźPoleBur(dokument, definicjaPola) {
    return rozwiążPole(dokument, definicjaPola).element;
  }

  const resolver = {
    rozwiąż: rozwiążPole,
    rozwiążPoSelektorach: rozwiążPoSelektorach,
    rozwiążPoEtykiecie: rozwiążPoEtykiecie,
    rozwiążSekcjęPoNagłówku: rozwiążSekcjęPoNagłówku,
    rozwiążPoleWTabeli: rozwiążPoleWTabeliBur
  };

  przestrzeń.resolverPólBur = resolver;
  przestrzeń.normalizujTekstDoWalidacji = normalizujTekstDoWalidacji;
  przestrzeń.normalizujKluczBur = normalizujKluczBur;
  przestrzeń.znajdźPolePoSelektorach = znajdźPolePoSelektorach;
  przestrzeń.znajdźPolePoEtykiecie = znajdźPolePoEtykiecie;
  przestrzeń.znajdźSekcjęPoNagłówku = znajdźSekcjęPoNagłówku;
  przestrzeń.znajdźKontenerPola = znajdźKontenerPola;
  przestrzeń.znajdźPoleWTabeliBur = znajdźPoleWTabeliBur;
  przestrzeń.znajdźPoleBur = znajdźPoleBur;
  przestrzeń.znajdźPoleBurZSzczegółami = rozwiążPole;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
