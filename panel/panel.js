(function uruchomPanel(globalny) {
  const przestrzeń = globalny.BurAsystent;
  const komunikaty = przestrzeń.KOMUNIKATY;
  const komunikatBrakuSkryptu = "Nie znaleziono skryptu strony na tej karcie. Odśwież stronę BUR/SEMPER albo otwórz obsługiwaną stronę.";
  const elementy = {
    statusStrony: document.getElementById("status-strony"),
    statusAkcji: document.getElementById("status-akcji"),
    statusSemper: document.getElementById("status-semper"),
    statusOperacjiBur: document.getElementById("status-operacji-bur"),
    diagnostykaFraza: document.getElementById("diagnostyka-fraza"),
    diagnostykaŹródłoFrazy: document.getElementById("diagnostyka-zrodlo-frazy"),
    diagnostykaKandydaci: document.getElementById("diagnostyka-kandydaci"),
    diagnostykaBłądSw: document.getElementById("diagnostyka-blad-sw"),
    diagnostykaZapisImportu: document.getElementById("diagnostyka-zapis-importu"),
    diagnostykaTerminyImportu: document.getElementById("diagnostyka-terminy-importu"),
    przyciskPobierz: document.getElementById("przycisk-pobierz"),
    przyciskWyczyśćPanel: document.getElementById("przycisk-wyczysc-panel"),
    przyciskSzukajLinku: document.getElementById("przycisk-szukaj-linku"),
    przyciskUzupełnijZLinku: document.getElementById("przycisk-uzupelnij-z-linku"),
    przyciskWypełnijFormularz: document.getElementById("przycisk-wypełnij-formularz"),
    przyciskZastosujZmianyBur: document.getElementById("przycisk-zastosuj-zmiany-bur"),
    linkLubFrazaSemper: document.getElementById("link-lub-fraza-semper"),
    wynikiSemper: document.getElementById("wyniki-semper"),
    wynikWypełnianiaBur: document.getElementById("wynik-wypełniania-bur"),
    podglądZmianBur: document.getElementById("podglad-zmian-bur"),
    wybórTerminuSemper: document.getElementById("wybor-terminu-semper"),
    przyciskWalidujBur: document.getElementById("przycisk-waliduj-bur"),
    przyciskWyczyśćPodświetlenia: document.getElementById("przycisk-wyczysc-podswietlenia"),
    statusWalidacjiBur: document.getElementById("status-walidacji-bur"),
    wynikWalidacjiBur: document.getElementById("wynik-walidacji-bur"),
    ostrzeżeniaKarta: document.getElementById("ostrzezenia-karta"),
    listaOstrzeżeń: document.getElementById("lista-ostrzezen"),
    tytułOryginalny: document.getElementById("tytul-oryginalny"),
    tytułBur: document.getElementById("tytul-bur"),
    terminy: document.getElementById("terminy"),
    lokalizacje: document.getElementById("lokalizacje"),
    cena: document.getElementById("cena"),
    czasTrwania: document.getElementById("czas-trwania"),
    celSzkolenia: document.getElementById("cel-szkolenia"),
    grupaDocelowa: document.getElementById("grupa-docelowa"),
    korzyści: document.getElementById("korzysci"),
    program: document.getElementById("program"),
    inwestycja: document.getElementById("inwestycja"),
    statusEdytoraProgramu: document.getElementById("status-edytora-programu"),
    statusTabeliHarmonogramu: document.getElementById("status-tabeli-harmonogramu"),
    statusProgramuHarmonogramu: document.getElementById("status-programu-harmonogramu"),
    podglądHarmonogramu: document.getElementById("podglad-harmonogramu"),
    decyzjaHarmonogramuBur: document.getElementById("decyzja-harmonogramu-bur"),
    przyciskUzupełnijProgram: document.getElementById("przycisk-uzupelnij-program"),
    przyciskGenerujHarmonogram: document.getElementById("przycisk-generuj-harmonogram"),
    przyciskImportujHarmonogramXml: document.getElementById("przycisk-importuj-harmonogram-xml"),
    przyciskWypełnijHarmonogramRęcznie: document.getElementById("przycisk-wypelnij-harmonogram-recznie")
  };
  let ostatnieTerminySemper = [];
  let ostatnieSzkolenieSemperZPanelu = null;
  let ostatniWybranyTerminSemperIndex = null;
  let czyAktywnaKartaBur = false;
  let aktywnaOperacjaBur = null;
  let podglądWypełnieniaBur = null;
  const diagnostykaSemper = {
    fraza: "",
    źródłoFrazy: "",
    liczbaKandydatów: "",
    ostatniBłądServiceWorkera: "",
    importZapisałSzkolenie: "",
    liczbaTerminówPoImporcie: ""
  };

  function ustawStatus(element, tekst, klasa) {
    element.textContent = tekst;
    element.className = (element === elementy.statusStrony ? "status " : "komunikat ") + klasa;
  }

  function ustawStatusProgramuHarmonogramu(tekst, klasa) {
    ustawStatus(elementy.statusProgramuHarmonogramu, tekst, klasa || "status-neutralny");
  }

  function odświeżStatusOperacjiBur() {
    if (!aktywnaOperacjaBur) {
      ustawStatus(elementy.statusOperacjiBur, "Brak aktywnej operacji BUR.", "status-neutralny");
      return;
    }
    if (przestrzeń.czyOperacjaBurWygasła(aktywnaOperacjaBur)) {
      aktywnaOperacjaBur = przestrzeń.zwolnijWygasłąOperacjęBur(aktywnaOperacjaBur);
      zapiszStorage({ aktywnaOperacjaBur: aktywnaOperacjaBur });
    }
    const błąd = aktywnaOperacjaBur.błąd;
    ustawStatus(elementy.statusOperacjiBur, błąd ? "Operacja BUR: " + błąd.komunikat : "Operacja BUR: " + aktywnaOperacjaBur.etap + ".", błąd ? "status-ostrzezenie" : "status-neutralny");
  }

  function rozpocznijOperacjęBur(karta, szkolenie, indeksTerminu) {
    const dane = { identyfikatorKartyBur: karta.id, odciskSzkolenia: JSON.stringify([szkolenie.tytułOryginalny || szkolenie.tytulOryginalny || "", elementy.linkLubFrazaSemper.value]), indeksTerminu: indeksTerminu };
    const konflikt = aktywnaOperacjaBur && przestrzeń.znajdźKonfliktOperacjiBur([aktywnaOperacjaBur], dane);
    if (konflikt) { throw new Error("Ta karta i termin mają już aktywną operację BUR."); }
    aktywnaOperacjaBur = przestrzeń.przejdźOperacjęBur(przestrzeń.utwórzOperacjęBur(dane), "przygotowywanie");
    return zapiszStorage({ aktywnaOperacjaBur: aktywnaOperacjaBur }).then(function zwróć() { odświeżStatusOperacjiBur(); return aktywnaOperacjaBur; });
  }

  function wyczyśćDecyzjęHarmonogramuBur() {
    elementy.decyzjaHarmonogramuBur.textContent = "";
    elementy.decyzjaHarmonogramuBur.classList.add("ukryty");
  }

  function pokażDiagnostykęSemper() {
    elementy.diagnostykaFraza.textContent = diagnostykaSemper.fraza || "-";
    elementy.diagnostykaŹródłoFrazy.textContent = diagnostykaSemper.źródłoFrazy || "-";
    elementy.diagnostykaKandydaci.textContent = diagnostykaSemper.liczbaKandydatów === "" ? "-" : String(diagnostykaSemper.liczbaKandydatów);
    elementy.diagnostykaBłądSw.textContent = diagnostykaSemper.ostatniBłądServiceWorkera || "-";
    elementy.diagnostykaZapisImportu.textContent = diagnostykaSemper.importZapisałSzkolenie || "-";
    elementy.diagnostykaTerminyImportu.textContent = diagnostykaSemper.liczbaTerminówPoImporcie === "" ? "-" : String(diagnostykaSemper.liczbaTerminówPoImporcie);
  }

  function wpisz(pole, wartość) {
    elementy[pole].textContent = wartość || "—";
  }

  function formatujWartośćDanych(wartość) {
    if (wartość === null || wartość === undefined || wartość === "") {
      return "—";
    }

    if (Array.isArray(wartość)) {
      return wartość.map(formatujWartośćDanych).filter(function zostaw(tekst) {
        return tekst && tekst !== "—";
      }).join("\n");
    }

    if (typeof wartość === "object") {
      return Object.keys(wartość).map(function zbudujWiersz(klucz) {
        const tekst = formatujWartośćDanych(wartość[klucz]);

        return tekst && tekst !== "—" ? klucz + ": " + tekst : "";
      }).filter(Boolean).join("\n") || "—";
    }

    const tekst = String(wartość).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    if (tekst.length > 900) {
      return tekst.slice(0, 900).trim() + "…";
    }

    return tekst || "—";
  }

  function czyTreśćWyglądaJakTabelaTerminów(treść) {
    return przestrzeń.czyTreśćWyglądaJakTabelaTerminów
      ? przestrzeń.czyTreśćWyglądaJakTabelaTerminów(treść)
      : false;
  }

  function formatujSekcjęSzkolenia(wartość) {
    const tekst = formatujWartośćDanych(wartość);

    if (!tekst || tekst === "—" || czyTreśćWyglądaJakTabelaTerminów(tekst)) {
      return "Brak danych";
    }

    return tekst;
  }

  function formatujUnikalne(wartości) {
    const czyste = wartości.filter(Boolean);
    return Array.from(new Set(czyste)).join("\n");
  }

  function pobierzCenęBezZakwaterowania(szkolenie, sekcje) {
    return szkolenie.cenaBezZakwaterowania || sekcje.cenaBezZakwaterowania || "";
  }

  function formatujCenySzkolenia(terminy, szkolenie, sekcje) {
    const cenaZTerminów = formatujUnikalne(terminy.map(function pobierzCenę(termin) { return termin.cena; }));
    const cenaBezZakwaterowania = pobierzCenęBezZakwaterowania(szkolenie, sekcje);

    return [
      cenaZTerminów,
      cenaBezZakwaterowania ? "Cena bez zakwaterowania: " + cenaBezZakwaterowania : ""
    ].filter(Boolean).join("\n");
  }

  function formatujInwestycjęSzkolenia(szkolenie, sekcje) {
    const inwestycja = formatujSekcjęSzkolenia(sekcje.inwestycja || sekcje.inwestycjaHtml);
    const cenaBezZakwaterowania = pobierzCenęBezZakwaterowania(szkolenie, sekcje);

    if (!cenaBezZakwaterowania || inwestycja.includes(cenaBezZakwaterowania)) {
      return inwestycja;
    }

    return [inwestycja, "Cena bez zakwaterowania: " + cenaBezZakwaterowania].join("\n");
  }

  function uzupełnijOstrzeżeniaSekcji(ostrzeżenia, sekcje) {
    const wynik = Array.isArray(ostrzeżenia) ? ostrzeżenia.slice() : [];
    const pola = [
      { nazwa: "Cel szkolenia", wartość: sekcje.celSzkolenia || sekcje.celSzkoleniaHtml || sekcje.goalHtml },
      { nazwa: "Grupa docelowa", wartość: sekcje.grupaDocelowa || sekcje.grupaDocelowaHtml || sekcje.groupHtml },
      { nazwa: "Korzyści", wartość: sekcje.korzysci || sekcje.korzyści || sekcje.benefitsHtml },
      { nazwa: "Program", wartość: sekcje.program || sekcje.programHtml },
      { nazwa: "Inwestycja", wartość: sekcje.inwestycja || sekcje.inwestycjaHtml }
    ];

    pola.forEach(function sprawdźPole(pole) {
      const tekst = formatujSekcjęSzkolenia(pole.wartość);
      const komunikat = "Brak właściwej sekcji SEMPER: " + pole.nazwa + ".";

      if (tekst === "Brak danych" && !wynik.includes(komunikat)) {
        wynik.push(komunikat);
      }
    });

    return wynik;
  }

  function pobierzDatęRekrutacji(termin) {
    return termin.dataZakończeniaRekrutacjiBur || termin.dataZakonczeniaRekrutacjiBur || "";
  }

  function formatujTerminy(terminy) {
    if (!terminy || terminy.length === 0) {
      return "";
    }

    return terminy.map(function formatujTermin(termin, indeks) {
      const części = [
        "Termin " + (indeks + 1),
        "SEMPER: " + (termin.dataOdTekst || "?") + " - " + (termin.dataDoTekst || "?"),
        "BUR: " + (termin.dataStartBur || "?") + " - " + (termin.dataKoniecBur || "?"),
        "Rekrutacja do: " + (pobierzDatęRekrutacji(termin) || "?"),
        termin.miejsce ? "Miejsce: " + termin.miejsce : "",
        termin.forma ? "Forma: " + termin.forma : "",
        termin.statusTerminu ? "Status: " + termin.statusTerminu : "",
        termin.czyDojazdZakopane ? "Zakopane: wykryto dzień dojazdowy" : ""
      ].filter(Boolean);

      return części.join("\n");
    }).join("\n\n");
  }

  function opiszTerminDoWyboru(termin, indeks) {
    const zakres = [
      termin.dataStartBur || termin.dataOdTekst || "?",
      termin.dataKoniecBur || termin.dataDoTekst || "?"
    ].join(" - ");
    const części = [
      "Termin " + (indeks + 1),
      zakres,
      termin.miejsce || "",
      termin.forma || ""
    ].filter(Boolean);

    return części.join(" | ");
  }

  function pokażWybórTerminuSemper(terminy, wybranyIndeks) {
    ostatnieTerminySemper = Array.isArray(terminy) ? terminy : [];
    ostatniWybranyTerminSemperIndex = wybranyIndeks;
    elementy.wybórTerminuSemper.textContent = "";

    if (!ostatnieTerminySemper.length) {
      const opcja = document.createElement("option");

      opcja.value = "";
      opcja.textContent = "Brak zaimportowanych terminów";
      elementy.wybórTerminuSemper.appendChild(opcja);
      elementy.wybórTerminuSemper.disabled = true;
      odświeżDostępnośćWypełniania();
      return;
    }

    if (ostatnieTerminySemper.length > 1) {
      const opcjaPusta = document.createElement("option");

      opcjaPusta.value = "";
      opcjaPusta.textContent = "Wybierz termin SEMPER";
      elementy.wybórTerminuSemper.appendChild(opcjaPusta);
    }

    ostatnieTerminySemper.forEach(function dodajTermin(termin, indeks) {
      const opcja = document.createElement("option");

      opcja.value = String(indeks);
      opcja.textContent = opiszTerminDoWyboru(termin, indeks);
      elementy.wybórTerminuSemper.appendChild(opcja);
    });

    elementy.wybórTerminuSemper.disabled = false;

    if (wybranyIndeks !== null && wybranyIndeks !== undefined && wybranyIndeks !== "") {
      elementy.wybórTerminuSemper.value = String(wybranyIndeks);
    } else {
      elementy.wybórTerminuSemper.value = ostatnieTerminySemper.length === 1 ? "0" : "";
    }

    ostatniWybranyTerminSemperIndex = elementy.wybórTerminuSemper.value === "" ? null : Number(elementy.wybórTerminuSemper.value);
    odświeżDostępnośćWypełniania();
  }

  function zapiszWybórTerminuSemper() {
    const wartość = elementy.wybórTerminuSemper.value;
    const indeks = wartość === "" ? null : Number(wartość);
    const poprzedniIndeks = ostatniWybranyTerminSemperIndex;
    const czyZmienionoTermin = poprzedniIndeks !== indeks;

    ostatniWybranyTerminSemperIndex = indeks;
    odświeżDostępnośćWypełniania();

    if (!czyZmienionoTermin) {
      zapiszStorage({
        wybranyTerminSemperIndex: indeks
      }).catch(function pomińBłądZapisu() {});
      return;
    }

    odczytajStorage(["ostatnieSzkolenieSemper", "ostatnieOstrzezeniaSemper"]).then(function zastosujCenęWybranegoTerminu(dane) {
      const szkolenie = dane.ostatnieSzkolenieSemper;
      const termin = szkolenie && szkolenie.terminy && szkolenie.terminy[indeks];
      const ostrzeżenia = przestrzeń.zastosujCenęBezZakwaterowaniaWybranegoTerminu
        ? przestrzeń.zastosujCenęBezZakwaterowaniaWybranegoTerminu(szkolenie || {}, termin, dane.ostatnieOstrzezeniaSemper || [])
        : (dane.ostatnieOstrzezeniaSemper || []);

      return zapiszStorage({
        ostatnieSzkolenieSemper: szkolenie,
        ostatnieOstrzezeniaSemper: ostrzeżenia,
        wybranyTerminSemperIndex: indeks,
        harmonogramBurPrzygotowany: false,
        harmonogramBurNieaktualny: true
      }).then(function odświeżWidok() {
        if (szkolenie) {
          pokażSzkolenie({ szkolenie: szkolenie, ostrzeżenia: ostrzeżenia, wybranyTerminSemperIndex: indeks });
        }
      });
    }).then(function pokażInformację() {
      elementy.przyciskImportujHarmonogramXml.disabled = true;
      ustawStatusProgramuHarmonogramu("Zmieniono termin SEMPER. Kliknij ponownie »Przygotuj harmonogram«.", "status-ostrzezenie");
    }).catch(function pomińBłądZapisu() {});
  }

  function pokażOstrzeżenia(ostrzeżenia) {
    elementy.listaOstrzeżeń.textContent = "";

    if (!ostrzeżenia || ostrzeżenia.length === 0) {
      elementy.ostrzeżeniaKarta.classList.add("ukryty");
      return;
    }

    ostrzeżenia.forEach(function dodajOstrzeżenie(tekst) {
      const pozycja = document.createElement("li");
      pozycja.textContent = tekst;
      elementy.listaOstrzeżeń.appendChild(pozycja);
    });

    elementy.ostrzeżeniaKarta.classList.remove("ukryty");
  }

  function wyczyśćDane() {
    ostatnieSzkolenieSemperZPanelu = null;
    [
      "tytułOryginalny",
      "tytułBur",
      "terminy",
      "lokalizacje",
      "cena",
      "czasTrwania",
      "celSzkolenia",
      "grupaDocelowa",
      "korzyści",
      "program",
      "inwestycja"
    ].forEach(function wyczyść(pole) {
      wpisz(pole, "");
    });

    pokażOstrzeżenia([]);
    pokażWybórTerminuSemper([], null);
  }

  function pokażSzkolenie(wynik) {
    const szkolenie = wynik.szkolenie || wynik || {};
    const sekcje = szkolenie.sekcje || {};
    const terminy = szkolenie.terminy || [];

    ostatnieSzkolenieSemperZPanelu = szkolenie;
    wpisz("tytułOryginalny", szkolenie.tytułOryginalny || szkolenie.tytulOryginalny);
    wpisz("tytułBur", szkolenie.tytułPoNormalizacjiBur || szkolenie.tytułBur || szkolenie.tytulBur);
    wpisz("terminy", formatujTerminy(terminy));
    wpisz("lokalizacje", formatujUnikalne(terminy.map(function pobierzMiejsce(termin) { return termin.miejsce; })));
    wpisz("cena", formatujCenySzkolenia(terminy, szkolenie, sekcje));
    wpisz("czasTrwania", formatujUnikalne(terminy.map(function pobierzCzas(termin) { return termin.czasTrwania; })));
    wpisz("celSzkolenia", formatujSekcjęSzkolenia(sekcje.celSzkolenia || sekcje.celSzkoleniaHtml || sekcje.goalHtml));
    wpisz("grupaDocelowa", formatujSekcjęSzkolenia(sekcje.grupaDocelowa || sekcje.grupaDocelowaHtml || sekcje.groupHtml));
    wpisz("korzyści", formatujSekcjęSzkolenia(sekcje.korzysci || sekcje.korzyści || sekcje.benefitsHtml));
    wpisz("program", formatujSekcjęSzkolenia(sekcje.program || sekcje.programHtml));
    wpisz("inwestycja", formatujInwestycjęSzkolenia(szkolenie, sekcje));
    pokażWybórTerminuSemper(terminy, wynik.wybranyTerminSemperIndex);
    pokażOstrzeżenia(uzupełnijOstrzeżeniaSekcji(wynik.ostrzeżenia || wynik.ostrzezenia || [], sekcje));
  }

  function renderujDaneSzkolenia(szkolenie, daneDodatkowe) {
    pokażSzkolenie(Object.assign({}, daneDodatkowe || {}, {
      szkolenie: szkolenie || {}
    }));
  }

  function odświeżDaneSzkoleniaZMagazynu() {
    return odczytajStorage(["ostatnieSzkolenieSemper", "wybranyTerminSemperIndex", "ostatnieOstrzezeniaSemper"]).then(function pokaż(dane) {
      if (dane.ostatnieSzkolenieSemper) {
        renderujDaneSzkolenia(dane.ostatnieSzkolenieSemper, {
          wybranyTerminSemperIndex: dane.wybranyTerminSemperIndex,
          ostrzeżenia: dane.ostatnieOstrzezeniaSemper || []
        });
      }
    });
  }

  function pobierzAktywnąKartę() {
    return chrome.tabs.query({ active: true, currentWindow: true }).then(function wybierzKartę(karty) {
      return karty[0] || null;
    });
  }

  function rozpoznajTypStrony(url) {
    if (/^https:\/\/(www\.)?szkolenia-semper\.pl\//i.test(url || "")) {
      return "SEMPER";
    }

    if (/^https:\/\/uslugirozwojowe\.parp\.gov\.pl\//i.test(url || "")) {
      return "BUR";
    }

    return "Nieobsługiwana strona";
  }

  function czyObsługiwanaKarta(karta) {
    return karta && karta.id && rozpoznajTypStrony(karta.url) !== "Nieobsługiwana strona";
  }

  function ustawDostępnośćWalidacji(czyBur) {
    czyAktywnaKartaBur = Boolean(czyBur);
    elementy.przyciskWalidujBur.disabled = !czyBur;
    elementy.przyciskWyczyśćPodświetlenia.disabled = !czyBur;
    odświeżDostępnośćWypełniania();

    if (!czyBur) {
      ustawStatus(elementy.statusWalidacjiBur, "Otwórz formularz BUR, aby wykonać walidację.", "status-ostrzezenie");
    } else if (elementy.statusWalidacjiBur.textContent === "Otwórz formularz BUR, aby wykonać walidację.") {
      ustawStatus(elementy.statusWalidacjiBur, "Gotowy do walidacji.", "status-neutralny");
    }
  }

  function odświeżDostępnośćWypełniania() {
    const maSzkolenie = Boolean(ostatnieSzkolenieSemperZPanelu);
    const maJedenTermin = ostatnieTerminySemper.length === 1;
    const maWybranyTermin = ostatniWybranyTerminSemperIndex !== null && ostatniWybranyTerminSemperIndex !== undefined && ostatniWybranyTerminSemperIndex !== "";

    elementy.przyciskWypełnijFormularz.disabled = !(maSzkolenie && (maJedenTermin || maWybranyTermin) && czyAktywnaKartaBur);
  }

  function wyślijDoKarty(karta, komunikat) {
    return new Promise(function utwórzPromise(resolve, reject) {
      chrome.tabs.sendMessage(karta.id, komunikat, function obsłużOdpowiedź(odpowiedź) {
        if (chrome.runtime.lastError) {
          reject(new Error(komunikatBrakuSkryptu));
          return;
        }

        resolve(odpowiedź);
      });
    });
  }

  function bezpiecznieWyślijDoAktywnejKarty(komunikat) {
    return pobierzAktywnąKartę().then(function wyślij(karta) {
      if (!czyObsługiwanaKarta(karta)) {
        throw new Error("Aktywna karta nie jest obsługiwaną stroną BUR/SEMPER.");
      }

      return wyślijDoKarty(karta, komunikat);
    });
  }

  function wyślijDoServiceWorkera(komunikat) {
    return new Promise(function utwórzPromise(resolve, reject) {
      chrome.runtime.sendMessage(komunikat, function obsłużOdpowiedź(odpowiedź) {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || "Brak odpowiedzi service workera."));
          return;
        }

        resolve(odpowiedź);
      });
    });
  }

  function zapiszStorage(dane) {
    return new Promise(function utwórzPromise(resolve, reject) {
      chrome.storage.local.set(dane, function poZapisie() {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve();
      });
    });
  }

  function odczytajStorage(klucze) {
    return new Promise(function utwórzPromise(resolve, reject) {
      chrome.storage.local.get(klucze, function poOdczycie(dane) {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve(dane || {});
      });
    });
  }

  function usuńStorage(klucze) {
    return new Promise(function utwórzPromise(resolve, reject) {
      chrome.storage.local.remove(klucze, function poUsunięciu() {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve();
      });
    });
  }

  function ustawStatusElementu(element, czyZnaleziono) {
    element.textContent = czyZnaleziono ? "Znaleziono" : "Nie znaleziono";
  }

  function pokażStanProgramuHarmonogramu(wynik) {
    const stan = wynik || {};

    ustawStatusElementu(elementy.statusEdytoraProgramu, Boolean(stan.znalezionoEdytorProgramu));
    ustawStatusElementu(elementy.statusTabeliHarmonogramu, Boolean(stan.znalezionoTabelęHarmonogramu));
  }

  function odświeżStanProgramuHarmonogramu() {
    return pobierzAktywnąKartę()
      .then(function sprawdźKartę(karta) {
        if (!karta || rozpoznajTypStrony(karta.url) !== "BUR") {
          pokażStanProgramuHarmonogramu({});
          return null;
        }

        return wyślijDoKarty(karta, { typ: komunikaty.SPRAWDŹ_PROGRAM_I_HARMONOGRAM_BUR });
      })
      .then(function pokażOdpowiedź(odpowiedź) {
        if (odpowiedź && odpowiedź.wynik) {
          pokażStanProgramuHarmonogramu(odpowiedź.wynik);
        }
      })
      .catch(function pomińBłąd() {
        pokażStanProgramuHarmonogramu({});
      });
  }

  function czyTerminOnline(termin) {
    const tekst = [
      termin ? termin.forma : "",
      termin ? termin.miejsce : ""
    ].join(" ");

    return /online/i.test(tekst);
  }

  function pobierzDatyTerminu(termin) {
    return przestrzeń.pobierzDatyHarmonogramuZTerminu(termin);
  }

  function pobierzTytułHarmonogramu(szkolenie) {
    return szkolenie.tytułPoNormalizacjiBur || szkolenie.tytułBur || szkolenie.tytulBur || szkolenie.tytułOryginalny || szkolenie.tytulOryginalny || "";
  }

  function czyDatySąKolejne(daty) {
    const listaDat = Array.isArray(daty) ? daty : [];

    for (let indeks = 1; indeks < listaDat.length; indeks += 1) {
      const poprzednia = przestrzeń.parsujDatęBur(listaDat[indeks - 1]);
      const aktualna = przestrzeń.parsujDatęBur(listaDat[indeks]);

      if (!poprzednia || !aktualna) {
        return false;
      }

      poprzednia.setDate(poprzednia.getDate() + 1);

      if (poprzednia.getTime() !== aktualna.getTime()) {
        return false;
      }
    }

    return true;
  }

  function zbudujOstrzeżeniaHarmonogramu(wybór, daty, tytuł, temat) {
    const ostrzeżenia = [];
    const termin = wybór.termin || {};
    const tytułOczyszczony = String(tytuł || "").replace(/\s+/g, " ").trim();

    if (!czyDatySąKolejne(daty)) {
      ostrzeżenia.push("Daty harmonogramu nie są kolejnymi dniami.");
    }

    if (tytułOczyszczony && temat !== tytułOczyszczony) {
      ostrzeżenia.push("Temat został skrócony do pola harmonogramu.");
    }

    if (!termin.dataStartBur || !termin.dataKoniecBur) {
      ostrzeżenia.push("Nietypowy termin — sprawdź harmonogram przed importem.");
    }

    if (wybór.liczbaTerminów > 1 && (wybór.indeks === null || wybór.indeks === undefined)) {
      ostrzeżenia.push("Szkolenie ma więcej niż jeden termin i nie wybrano terminu SEMPER.");
    }

    return ostrzeżenia;
  }

  function zbudujDaneProgramuHarmonogramu() {
    return odczytajStorage(["ostatnieSzkolenieSemper", "wybranyTerminSemperIndex"]).then(function zbuduj(dane) {
      const szkolenie = dane.ostatnieSzkolenieSemper;

      if (!szkolenie) {
        throw new Error("Najpierw zaimportuj dane z SEMPER.");
      }

      const wybór = przestrzeń.wybierzTerminHarmonogramu(szkolenie, dane.wybranyTerminSemperIndex);

      if (!wybór.ok) {
        throw new Error(wybór.komunikat || "Wybierz termin SEMPER do wygenerowania harmonogramu.");
      }

      const termin = wybór.termin;
      const daty = pobierzDatyTerminu(termin);

      if (daty.length === 0) {
        throw new Error("Nie udało się ustalić dat harmonogramu z wybranego terminu SEMPER.");
      }

      const tytułHarmonogramu = pobierzTytułHarmonogramu(szkolenie);
      const tematSzkolenia = przestrzeń.przygotujTematHarmonogramu(tytułHarmonogramu);
      const czyOnline = czyTerminOnline(termin);
      const pozycje = przestrzeń.zbudujPozycjeHarmonogramu({
        tematSzkolenia: tematSzkolenia,
        daty: daty,
        czyOnline: czyOnline,
        emailTrenera: przestrzeń.EMAIL_TRENERA_HARMONOGRAMU,
        emailWalidatora: przestrzeń.EMAIL_WALIDATORA_HARMONOGRAMU
      });
      const ostrzeżenia = zbudujOstrzeżeniaHarmonogramu(wybór, daty, tytułHarmonogramu, tematSzkolenia);

      return {
        program: szkolenie.sekcje ? szkolenie.sekcje.program : "",
        tematSzkolenia: tematSzkolenia,
        termin: termin,
        opisTerminu: opiszTerminDoWyboru(termin, wybór.indeks),
        indeksTerminu: wybór.indeks,
        tryb: czyOnline ? "online" : "stacjonarny",
        ostrzeżenia: ostrzeżenia,
        pozycje: pozycje,
        xml: przestrzeń.wygenerujXmlHarmonogramu(pozycje)
      };
    });
  }

  function dodajTekstPodglądu(rodzic, znacznik, tekst, klasa) {
    const element = document.createElement(znacznik);

    if (klasa) {
      element.className = klasa;
    }

    element.textContent = tekst;
    rodzic.appendChild(element);
    return element;
  }

  function pokażBłądPodgląduHarmonogramu(komunikat) {
    elementy.podglądHarmonogramu.textContent = "";
    dodajTekstPodglądu(elementy.podglądHarmonogramu, "p", komunikat, "podglad-harmonogramu-blad");
  }

  function pokażPodglądHarmonogramu(dane) {
    const podgląd = elementy.podglądHarmonogramu;
    const pozycje = dane && Array.isArray(dane.pozycje) ? dane.pozycje : [];
    const tabela = document.createElement("table");
    const nagłówek = document.createElement("thead");
    const ciało = document.createElement("tbody");
    const wierszNagłówka = document.createElement("tr");
    const kolumny = ["Lp.", "Typ aktywności", "Data", "Od", "Do", "Przedmiot/temat", "Prowadzący"];

    podgląd.textContent = "";

    if (!pozycje.length) {
      dodajTekstPodglądu(podgląd, "p", "Brak wygenerowanego podglądu harmonogramu.", "podglad-harmonogramu-pusty");
      return;
    }

    const metryka = document.createElement("dl");
    metryka.className = "podglad-harmonogramu-metryka";
    [
      ["Wybrany termin SEMPER", dane.opisTerminu || "-"],
      ["Tryb", dane.tryb || "-"],
      ["Liczba pozycji", String(pozycje.length)]
    ].forEach(function dodajWpis(wpis) {
      dodajTekstPodglądu(metryka, "dt", wpis[0]);
      dodajTekstPodglądu(metryka, "dd", wpis[1]);
    });
    podgląd.appendChild(metryka);

    if (dane.ostrzeżenia && dane.ostrzeżenia.length) {
      const lista = document.createElement("ul");

      lista.className = "podglad-harmonogramu-ostrzezenia";
      dane.ostrzeżenia.forEach(function dodajOstrzeżenie(ostrzeżenie) {
        dodajTekstPodglądu(lista, "li", ostrzeżenie);
      });
      podgląd.appendChild(lista);
    }

    kolumny.forEach(function dodajKolumnę(nazwa) {
      dodajTekstPodglądu(wierszNagłówka, "th", nazwa);
    });
    nagłówek.appendChild(wierszNagłówka);

    pozycje.forEach(function dodajPozycję(pozycja, indeks) {
      const wiersz = document.createElement("tr");
      const wartości = [
        String(indeks + 1),
        pozycja.typ_aktywnosci || "",
        pozycja.dzien_swiadczenia || "",
        pozycja.czas_rozpoczecia || "",
        pozycja.czas_zakonczenia || "",
        pozycja.przedmiot || "",
        pozycja.prowadzacy || ""
      ];

      wiersz.className = "podglad-typ-" + String(pozycja.typ_aktywnosci || "").toLowerCase();
      wartości.forEach(function dodajWartość(wartość) {
        dodajTekstPodglądu(wiersz, "td", wartość);
      });
      ciało.appendChild(wiersz);
    });

    tabela.appendChild(nagłówek);
    tabela.appendChild(ciało);
    podgląd.appendChild(tabela);
  }

  function zapiszDaneHarmonogramu(dane) {
    return zapiszStorage({
      ostatniePozycjeHarmonogramuBur: dane.pozycje,
      ostatniXmlHarmonogramuBur: dane.xml,
      ostatniWybranyTerminHarmonogramuBur: dane.indeksTerminu,
      ostatnieOstrzeżeniaHarmonogramuBur: dane.ostrzeżenia || [],
      ostrzezeniaHarmonogramuBur: dane.ostrzeżenia || [],
      harmonogramBurPrzygotowany: true,
      harmonogramBurNieaktualny: false,
      harmonogramBurPrzygotowanyAt: new Date().toISOString()
    });
  }

  function odczytajPrzygotowanyHarmonogram() {
    return odczytajStorage([
      "ostatniePozycjeHarmonogramuBur",
      "ostatniXmlHarmonogramuBur",
      "ostatniWybranyTerminHarmonogramuBur",
      "ostatnieOstrzeżeniaHarmonogramuBur",
      "ostrzezeniaHarmonogramuBur",
      "harmonogramBurPrzygotowany",
      "harmonogramBurPrzygotowanyAt",
      "wybranyTerminSemperIndex"
    ]).then(function sprawdź(dane) {
      const gotowość = przestrzeń.sprawdźGotowośćHarmonogramuBur(dane);

      if (!gotowość.ok) {
        throw new Error(gotowość.komunikat);
      }

      return {
        pozycje: dane.ostatniePozycjeHarmonogramuBur,
        xml: dane.ostatniXmlHarmonogramuBur,
        indeksTerminu: dane.ostatniWybranyTerminHarmonogramuBur,
        ostrzeżenia: dane.ostatnieOstrzeżeniaHarmonogramuBur || dane.ostrzezeniaHarmonogramuBur || [],
        przygotowanyAt: dane.harmonogramBurPrzygotowanyAt
      };
    });
  }

  function odświeżStanPrzygotowaniaHarmonogramu() {
    return odczytajStorage([
      "ostatniePozycjeHarmonogramuBur",
      "ostatniXmlHarmonogramuBur",
      "ostatniWybranyTerminHarmonogramuBur",
      "harmonogramBurPrzygotowany",
      "wybranyTerminSemperIndex"
    ]).then(function pokaż(dane) {
      const gotowość = przestrzeń.sprawdźGotowośćHarmonogramuBur(dane);

      elementy.przyciskImportujHarmonogramXml.disabled = !gotowość.ok;

      if (!gotowość.ok && !dane.harmonogramBurPrzygotowany) {
        ustawStatusProgramuHarmonogramu("Brak przygotowanego harmonogramu.", "status-neutralny");
      } else if (!gotowość.ok) {
        ustawStatusProgramuHarmonogramu(gotowość.komunikat, "status-ostrzezenie");
      }
    }).catch(function pomińBłądStorage() {
      elementy.przyciskImportujHarmonogramXml.disabled = true;
    });
  }

  function zbudujKomunikatRaportuHarmonogramu(wynik) {
    const raport = wynik || {};
    const części = [];

    if (raport.istniejącePozycje) {
      części.push("Nie wprowadzono harmonogramu, ponieważ w BUR istnieją już pozycje.");
    } else if (raport.ok && raport.metoda === "XML") {
      części.push("Wprowadzono przez import XML.");
    } else if (raport.ok && raport.metoda === "fallback ręczny") {
      części.push("Import XML nie powiódł się — użyto ręcznego wypełniania.");
    } else if (raport.ok) {
      części.push(raport.komunikat || "Harmonogram wprowadzony.");
    } else {
      części.push("Nie udało się wprowadzić harmonogramu.");
    }

    if (raport.liczbaOczekiwanychPozycji !== undefined) {
      części.push("Oczekiwane pozycje: " + raport.liczbaOczekiwanychPozycji + ".");
    }

    if (raport.liczbaPozycjiWTabeli !== undefined) {
      części.push("Pozycje w tabeli po operacji: " + raport.liczbaPozycjiWTabeli + ".");
    }

    if (raport.błądXml) {
      części.push("Błąd XML: " + raport.błądXml);
    }

    if (raport.błąd) {
      części.push("Błąd: " + raport.błąd);
    }

    części.push("Sprawdź formularz BUR przed ręcznym zapisaniem.");
    return części.join(" ");
  }

  function pokażKonfliktHarmonogramuBur(wynik) {
    const obecneWiersze = Array.isArray(wynik.obecneWiersze) ? wynik.obecneWiersze : [];
    const nagłówek = document.createElement("h3");
    const opis = document.createElement("p");
    const lista = document.createElement("ol");
    const przyciskAnuluj = document.createElement("button");
    const przyciskUsuń = document.createElement("button");
    const siatka = document.createElement("div");

    wyczyśćDecyzjęHarmonogramuBur();

    nagłówek.textContent = "W BUR istnieje już harmonogram";
    opis.textContent = "Aby wprowadzić nowy harmonogram, trzeba najpierw usunąć obecne pozycje. Usuwanie wymaga dodatkowego potwierdzenia.";
    obecneWiersze.forEach(function dodajWiersz(wiersz) {
      const pozycja = document.createElement("li");

      pozycja.textContent = wiersz.tekst || "";
      lista.appendChild(pozycja);
    });

    if (!obecneWiersze.length) {
      const pozycja = document.createElement("li");

      pozycja.textContent = "Nie udało się odczytać treści obecnych wierszy.";
      lista.appendChild(pozycja);
    }

    przyciskAnuluj.type = "button";
    przyciskAnuluj.textContent = "Anuluj";
    przyciskAnuluj.addEventListener("click", function anuluj() {
      wyczyśćDecyzjęHarmonogramuBur();
      ustawStatusProgramuHarmonogramu("Anulowano wprowadzanie harmonogramu.", "status-neutralny");
    });

    przyciskUsuń.type = "button";
    przyciskUsuń.textContent = "Usuń obecny harmonogram i wprowadź przygotowany";
    przyciskUsuń.addEventListener("click", function pokażBlokadęUsuwania() {
      if (!window.confirm("Czy potwierdzasz usunięcie obecnego harmonogramu przed wprowadzeniem przygotowanego?")) {
        return;
      }

      ustawStatusProgramuHarmonogramu("Automatyczne usuwanie istniejącego harmonogramu zostanie wdrożone w następnym etapie. Usuń pozycje ręcznie i kliknij ponownie »Wprowadź harmonogram do BUR«.", "status-ostrzezenie");
    });

    siatka.className = "siatka-przycisków";
    siatka.appendChild(przyciskAnuluj);
    siatka.appendChild(przyciskUsuń);

    elementy.decyzjaHarmonogramuBur.appendChild(nagłówek);
    elementy.decyzjaHarmonogramuBur.appendChild(opis);
    elementy.decyzjaHarmonogramuBur.appendChild(lista);
    elementy.decyzjaHarmonogramuBur.appendChild(siatka);
    elementy.decyzjaHarmonogramuBur.classList.remove("ukryty");
  }

  function przygotujHarmonogramWPanelu() {
    wyczyśćDecyzjęHarmonogramuBur();
    ustawStatusProgramuHarmonogramu("Przygotowuję harmonogram...", "status-neutralny");

    zbudujDaneProgramuHarmonogramu()
      .then(function pokażWynik(dane) {
        pokażPodglądHarmonogramu(dane);
        return zapiszDaneHarmonogramu(dane).then(function pokaż() {
          elementy.przyciskImportujHarmonogramXml.disabled = false;
          ustawStatusProgramuHarmonogramu("Harmonogram przygotowany. Sprawdź podgląd przed wprowadzeniem do BUR.", dane.ostrzeżenia.length ? "status-ostrzezenie" : "status-odczytano");
        });
      })
      .catch(function pokażBłąd(błąd) {
        const komunikat = błąd && błąd.message ? błąd.message : "Nie udało się przygotować harmonogramu.";

        pokażBłądPodgląduHarmonogramu(komunikat);
        ustawStatusProgramuHarmonogramu(komunikat, "status-blad");
      });
  }

  function uzupełnijProgramWPanelu() {
    ustawStatusProgramuHarmonogramu("Uzupełniam program usługi...", "status-neutralny");

    odczytajStorage(["ostatnieSzkolenieSemper"])
      .then(function wyślij(dane) {
        const szkolenie = dane.ostatnieSzkolenieSemper || {};

        if (!dane.ostatnieSzkolenieSemper) {
          throw new Error("Najpierw zaimportuj dane z SEMPER.");
        }

        return bezpiecznieWyślijDoAktywnejKarty({
          typ: komunikaty.UZUPEŁNIJ_PROGRAM_BUR,
          program: szkolenie.sekcje ? szkolenie.sekcje.program : ""
        });
      })
      .then(function pokażWynik(odpowiedź) {
        const wynik = odpowiedź && odpowiedź.wynik;

        if (!wynik || !wynik.ok) {
          throw new Error((wynik && wynik.błąd) || "Nie udało się uzupełnić programu.");
        }

        ustawStatusProgramuHarmonogramu(wynik.komunikat || "Uzupełniono program usługi.", "status-odczytano");
        odświeżStanProgramuHarmonogramu();
      })
      .catch(function pokażBłąd(błąd) {
        const komunikat = błąd && błąd.message ? błąd.message : "Nie udało się uzupełnić programu.";

        ustawStatusProgramuHarmonogramu(komunikat, "status-blad");
      });
  }

  function wprowadźPrzygotowanyHarmonogramDoBur(typKomunikatu) {
    wyczyśćDecyzjęHarmonogramuBur();
    ustawStatusProgramuHarmonogramu("Wprowadzanie harmonogramu do BUR...", "status-neutralny");

    odczytajPrzygotowanyHarmonogram()
      .then(function wyślij(dane) {
        pokażPodglądHarmonogramu(dane);

        return bezpiecznieWyślijDoAktywnejKarty({
          typ: typKomunikatu,
          pozycje: dane.pozycje,
          xml: dane.xml,
          indeksTerminu: dane.indeksTerminu,
          przygotowanyAt: dane.przygotowanyAt
        });
      })
      .then(function pokażWynik(odpowiedź) {
        const wynik = odpowiedź && odpowiedź.wynik ? odpowiedź.wynik : {};
        const komunikat = zbudujKomunikatRaportuHarmonogramu(wynik);

        if (wynik.istniejącePozycje) {
          pokażKonfliktHarmonogramuBur(wynik);
          ustawStatusProgramuHarmonogramu(komunikat, "status-ostrzezenie");
          return;
        }

        if (!wynik.ok) {
          throw new Error(komunikat);
        }

        ustawStatusProgramuHarmonogramu(komunikat, wynik.metoda === "fallback ręczny" ? "status-ostrzezenie" : "status-odczytano");
        odświeżStanProgramuHarmonogramu();
      })
      .catch(function pokażBłąd(błąd) {
        const komunikat = błąd && błąd.message ? błąd.message : "Nie udało się wprowadzić harmonogramu.";

        ustawStatusProgramuHarmonogramu(komunikat, "status-blad");
      });
  }

  function wyczyśćWynikWalidacjiBur() {
    elementy.wynikWalidacjiBur.textContent = "";
  }

  function wyczyśćWynikWypełnianiaBur() {
    elementy.wynikWypełnianiaBur.textContent = "";
  }

  function dodajPozycjęWypełniania(kontener, pozycja) {
    const element = document.createElement("div");
    const tytuł = document.createElement("strong");
    const opis = document.createElement("span");

    element.className = "pozycja-wypełniania";
    tytuł.textContent = (pozycja.sekcja || "BUR") + " - " + (pozycja.pole || "Problem");
    opis.textContent = pozycja.komunikat || pozycja.powód || "";
    element.appendChild(tytuł);
    element.appendChild(opis);
    kontener.appendChild(element);
  }

  function pokażWynikWypełnianiaBur(wynik) {
    const raport = wynik || {};
    const uzupełnione = raport.uzupełnione || [];
    const ostrzeżenia = raport.ostrzeżenia || [];
    const błędy = raport.błędy || [];
    const pominięte = raport.pominięte || [];
    const podsumowanie = document.createElement("div");
    const problemy = ostrzeżenia.concat(błędy).concat(pominięte).slice(0, 6);

    wyczyśćWynikWypełnianiaBur();
    podsumowanie.className = "komunikat " + (błędy.length ? "status-blad" : (ostrzeżenia.length || pominięte.length ? "status-ostrzezenie" : "status-odczytano"));
    podsumowanie.textContent = "Uzupełniono: " + uzupełnione.length + ", ostrzeżenia: " + ostrzeżenia.length + ", błędy: " + błędy.length + ".";
    elementy.wynikWypełnianiaBur.appendChild(podsumowanie);

    problemy.forEach(function pokażProblem(pozycja) {
      dodajPozycjęWypełniania(elementy.wynikWypełnianiaBur, pozycja);
    });
  }

  function policzPozycjeWalidacji(pozycje) {
    return (pozycje || []).reduce(function zlicz(liczniki, pozycja) {
      if (pozycja.status === "błąd") {
        liczniki.błędy += 1;
      } else if (pozycja.status === "ostrzeżenie") {
        liczniki.ostrzeżenia += 1;
      } else if (pozycja.status === "poprawne") {
        liczniki.poprawne += 1;
      }

      return liczniki;
    }, {
      błędy: 0,
      ostrzeżenia: 0,
      poprawne: 0
    });
  }

  function dodajLicznikWalidacji(kontener, etykieta, wartość, klasa) {
    const licznik = document.createElement("div");
    const liczba = document.createElement("strong");
    const opis = document.createElement("span");

    licznik.className = "licznik-walidacji " + klasa;
    liczba.textContent = String(wartość);
    opis.textContent = etykieta;
    licznik.appendChild(liczba);
    licznik.appendChild(opis);
    kontener.appendChild(licznik);
  }

  function pokażWynikWalidacjiBur(wynik) {
    const pozycje = wynik && Array.isArray(wynik.pozycje) ? wynik.pozycje : [];
    const liczniki = policzPozycjeWalidacji(pozycje);
    const podsumowanie = document.createElement("div");
    const grupy = new Map();

    wyczyśćWynikWalidacjiBur();
    podsumowanie.className = "podsumowanie-walidacji";
    dodajLicznikWalidacji(podsumowanie, "błędy", liczniki.błędy, "walidacja-błąd");
    dodajLicznikWalidacji(podsumowanie, "ostrzeżenia", liczniki.ostrzeżenia, "walidacja-ostrzeżenie");
    dodajLicznikWalidacji(podsumowanie, "poprawne", liczniki.poprawne, "walidacja-poprawne");
    elementy.wynikWalidacjiBur.appendChild(podsumowanie);

    pozycje.forEach(function pogrupuj(pozycja) {
      const sekcja = pozycja.sekcja || "Inne";

      if (!grupy.has(sekcja)) {
        grupy.set(sekcja, []);
      }

      grupy.get(sekcja).push(pozycja);
    });

    grupy.forEach(function pokażSekcję(lista, nazwaSekcji) {
      const sekcja = document.createElement("section");
      const nagłówek = document.createElement("h3");

      sekcja.className = "sekcja-walidacji";
      nagłówek.textContent = nazwaSekcji;
      sekcja.appendChild(nagłówek);

      lista.forEach(function pokażPozycję(pozycja) {
        const element = document.createElement("div");
        const tytuł = document.createElement("strong");
        const komunikat = document.createElement("span");
        const wartości = document.createElement("span");

        element.className = "pozycja-walidacji walidacja-" + pozycja.status;
        tytuł.textContent = pozycja.pole + " - " + pozycja.status;
        komunikat.textContent = pozycja.komunikat || "";
        wartości.textContent = "Aktualnie: " + (pozycja.aktualnaWartość || "-") + " | Oczekiwane: " + (pozycja.oczekiwanaWartość || "-");
        element.appendChild(tytuł);
        element.appendChild(komunikat);
        element.appendChild(wartości);
        sekcja.appendChild(element);
      });

      elementy.wynikWalidacjiBur.appendChild(sekcja);
    });

    ustawStatus(
      elementy.statusWalidacjiBur,
      "Walidacja zakończona: " + liczniki.błędy + " błędów, " + liczniki.ostrzeżenia + " ostrzeżeń, " + liczniki.poprawne + " poprawnych pól.",
      liczniki.błędy ? "status-blad" : (liczniki.ostrzeżenia ? "status-ostrzezenie" : "status-odczytano")
    );
  }

  function obsłużOdpowiedźWalidacjiBur(odpowiedź) {
    if (!odpowiedź) {
      throw new Error("Brak odpowiedzi z formularza BUR.");
    }

    if (odpowiedź.typ === komunikaty.BRAK_DANYCH_SEMPER) {
      wyczyśćWynikWalidacjiBur();
      throw new Error(odpowiedź.komunikat || "Najpierw pobierz dane szkolenia ze strony SEMPER albo użyj funkcji »Uzupełnij z linku«.");
    }

    if (odpowiedź.typ === komunikaty.BRAK_WYBRANEGO_TERMINU_SEMPER) {
      wyczyśćWynikWalidacjiBur();
      throw new Error(odpowiedź.komunikat || "Wybierz termin SEMPER do walidacji BUR.");
    }

    if (odpowiedź.typ !== komunikaty.ODPOWIEDŹ_WALIDACJA_BUR) {
      throw new Error("Nieznany typ odpowiedzi walidacji BUR.");
    }

    if (odpowiedź.wybranyTerminSemperIndex !== undefined) {
      elementy.wybórTerminuSemper.value = String(odpowiedź.wybranyTerminSemperIndex);
      zapiszWybórTerminuSemper();
    }

    pokażWynikWalidacjiBur(odpowiedź.wynik || {});
  }

  function walidujFormularzBurZPanelu() {
    wyczyśćWynikWalidacjiBur();
    ustawStatus(elementy.statusWalidacjiBur, "Waliduję formularz BUR...", "status-neutralny");
    elementy.przyciskWalidujBur.disabled = true;

    pobierzAktywnąKartę()
      .then(function sprawdźKartę(karta) {
        if (!karta || rozpoznajTypStrony(karta.url) !== "BUR") {
          throw new Error("Otwórz formularz BUR, aby wykonać walidację.");
        }

        return wyślijDoKarty(karta, { typ: komunikaty.WALIDUJ_FORMULARZ_BUR });
      })
      .then(obsłużOdpowiedźWalidacjiBur)
      .catch(function pokażBłąd(błąd) {
        ustawStatus(elementy.statusWalidacjiBur, błąd && błąd.message ? błąd.message : "Nie udało się wykonać walidacji BUR.", "status-blad");
      })
      .finally(function odblokuj() {
        pobierzAktywnąKartę().then(ustawStatusStronyDlaKarty);
      });
  }

  function wyczyśćPodświetleniaBurZPanelu() {
    ustawStatus(elementy.statusWalidacjiBur, "Czyszczę podświetlenia...", "status-neutralny");

    pobierzAktywnąKartę()
      .then(function sprawdźKartę(karta) {
        if (!karta || rozpoznajTypStrony(karta.url) !== "BUR") {
          throw new Error("Otwórz formularz BUR, aby wyczyścić podświetlenia.");
        }

        return wyślijDoKarty(karta, { typ: komunikaty.WYCZYŚĆ_PODŚWIETLENIA_BUR });
      })
      .then(function pokażWyczyszczenie(odpowiedź) {
        const wynik = odpowiedź && odpowiedź.wynik;

        wyczyśćWynikWalidacjiBur();
        ustawStatus(elementy.statusWalidacjiBur, wynik && wynik.komunikat ? wynik.komunikat : "Wyczyszczono podświetlenia BUR.", "status-odczytano");
      })
      .catch(function pokażBłąd(błąd) {
        ustawStatus(elementy.statusWalidacjiBur, błąd && błąd.message ? błąd.message : "Nie udało się wyczyścić podświetleń.", "status-blad");
      });
  }

  function ustawStatusStronyDlaKarty(karta) {
    const typ = rozpoznajTypStrony(karta ? karta.url : "");

    if (typ === "Nieobsługiwana strona") {
      ustawStatus(elementy.statusStrony, typ, "status-ostrzezenie");
      elementy.przyciskPobierz.disabled = true;
      ustawDostępnośćWalidacji(false);
      return Promise.resolve();
    }

    return wyślijDoKarty(karta, { typ: komunikaty.PING_SKRYPTU_STRONY })
      .then(function pokażPong(odpowiedź) {
        const typStrony = odpowiedź && odpowiedź.typStrony ? odpowiedź.typStrony : typ;
        ustawStatus(elementy.statusStrony, typStrony, "status-odczytano");
        elementy.przyciskPobierz.disabled = false;
        ustawDostępnośćWalidacji(typStrony === "BUR");
        odświeżStanProgramuHarmonogramu();
      })
      .catch(function pokażŁagodnyBłąd() {
        ustawStatus(elementy.statusStrony, typ + " - odśwież stronę, jeśli panel nie odpowiada", "status-ostrzezenie");
        elementy.przyciskPobierz.disabled = false;
        ustawDostępnośćWalidacji(typ === "BUR");
        odświeżStanProgramuHarmonogramu();
      });
  }

  function obsłużOdpowiedźZeStrony(odpowiedź) {
    if (!odpowiedź) {
      throw new Error("Brak odpowiedzi ze strony.");
    }

    if (odpowiedź.typ === komunikaty.BLAD_PARSERA) {
      throw new Error(odpowiedź.blad || "Błąd parsera.");
    }

    if (odpowiedź.typ === komunikaty.ODPOWIEDZ_DANE_SEMPER) {
      pokażSzkolenie(odpowiedź.wynik || {});
      ustawStatus(elementy.statusAkcji, "Odczytano dane SEMPER.", (odpowiedź.wynik?.ostrzeżenia || odpowiedź.wynik?.ostrzezenia || []).length ? "status-ostrzezenie" : "status-odczytano");
      return;
    }

    if (odpowiedź.typ === komunikaty.ODPOWIEDZ_STATUS_STRONY) {
      ustawStatus(elementy.statusAkcji, "Wykryto BUR. Dostępna jest walidacja formularza.", "status-odczytano");
      return;
    }

    throw new Error("Nieznany typ odpowiedzi.");
  }

  function pobierzDaneZeStrony() {
    elementy.przyciskPobierz.disabled = true;
    ustawStatus(elementy.statusAkcji, "Pobieranie danych...", "status-neutralny");

    bezpiecznieWyślijDoAktywnejKarty({ typ: komunikaty.POBIERZ_DANE_ZE_STRONY })
      .then(obsłużOdpowiedźZeStrony)
      .catch(function pokażBłąd(błąd) {
        ustawStatus(elementy.statusAkcji, błąd && błąd.message ? błąd.message : "Nie udało się pobrać danych.", "status-blad");
      })
      .finally(function odblokuj() {
        pobierzAktywnąKartę().then(ustawStatusStronyDlaKarty);
      });
  }

  function wyczyśćPanelImportu() {
    const klucze = [
      "ostatnieSzkolenieSemper",
      "ostatnieŁączeSemper",
      "dataImportuSemper",
      "wybranyTerminSemperIndex",
      "ostatniePozycjeHarmonogramuBur",
      "ostatniXmlHarmonogramuBur",
      "ostatniWybranyTerminHarmonogramuBur",
      "ostatnieOstrzeżeniaHarmonogramuBur",
      "ostrzezeniaHarmonogramuBur",
      "harmonogramBurPrzygotowany",
      "harmonogramBurNieaktualny",
      "harmonogramBurPrzygotowanyAt"
    ];

    wyczyśćDane();
    wyczyśćWynikiSemper();
    wyczyśćWynikWypełnianiaBur();
    wyczyśćWynikWalidacjiBur();
    wyczyśćDecyzjęHarmonogramuBur();
    pokażPodglądHarmonogramu({});
    elementy.linkLubFrazaSemper.value = "";
    elementy.przyciskImportujHarmonogramXml.disabled = true;
    diagnostykaSemper.fraza = "";
    diagnostykaSemper.źródłoFrazy = "";
    diagnostykaSemper.liczbaKandydatów = "";
    diagnostykaSemper.ostatniBłądServiceWorkera = "";
    diagnostykaSemper.importZapisałSzkolenie = "";
    diagnostykaSemper.liczbaTerminówPoImporcie = "";
    pokażDiagnostykęSemper();

    usuńStorage(klucze)
      .then(function pokażWyczyszczenie() {
        ustawStatus(elementy.statusAkcji, "Wyczyszczono dane panelu z poprzednich importów.", "status-odczytano");
        ustawStatus(elementy.statusSemper, "Gotowy do wyszukiwania.", "status-neutralny");
        ustawStatusProgramuHarmonogramu("Brak przygotowanego harmonogramu.", "status-neutralny");
      })
      .catch(function pokażBłąd(błąd) {
        ustawStatus(elementy.statusAkcji, błąd && błąd.message ? błąd.message : "Nie udało się wyczyścić danych panelu.", "status-blad");
      });
  }

  function wyczyśćWynikiSemper() {
    elementy.wynikiSemper.textContent = "";
  }

  function pokażWybraneŁącze(wynik) {
    wyczyśćWynikiSemper();

    const karta = document.createElement("div");
    const tytuł = document.createElement("strong");
    const url = document.createElement("span");
    const link = document.createElement("a");

    karta.className = "wynik-semper";
    tytuł.textContent = "Znaleziono: " + (wynik.tytuł || wynik.title || "Wybrany link SEMPER");
    url.textContent = wynik.url;
    link.href = wynik.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.className = "link-zewnętrzny";
    link.textContent = "Otwórz w nowej karcie";
    karta.appendChild(tytuł);
    karta.appendChild(url);
    karta.appendChild(link);
    elementy.wynikiSemper.appendChild(karta);
  }

  function pokażWyborySemper(wybory) {
    wyczyśćWynikiSemper();

    const nagłówek = document.createElement("strong");

    nagłówek.className = "nagłówek-wyników-semper";
    nagłówek.textContent = "Wybierz szkolenie SEMPER";
    elementy.wynikiSemper.appendChild(nagłówek);

    wybory.slice(0, 8).forEach(function dodajWynik(wynik) {
      const przycisk = document.createElement("button");
      const tytuł = document.createElement("strong");
      const url = document.createElement("span");

      przycisk.type = "button";
      przycisk.className = "wynik-semper";
      tytuł.textContent = wynik.tytuł || wynik.title || "Wynik SEMPER";
      url.textContent = wynik.url;
      przycisk.appendChild(tytuł);
      przycisk.appendChild(url);
      przycisk.addEventListener("click", function wybierzWynik() {
        elementy.linkLubFrazaSemper.value = wynik.url;
        ustawStatus(elementy.statusSemper, "Wybrano link SEMPER.", "status-odczytano");
        pokażWybraneŁącze(wynik);
      });

      elementy.wynikiSemper.appendChild(przycisk);
    });
  }

  function pobierzFrazeZBurLubInputa() {
    const wpisanaFraza = przestrzeń.oczyśćLinię(elementy.linkLubFrazaSemper.value);

    if (wpisanaFraza) {
      diagnostykaSemper.fraza = wpisanaFraza;
      diagnostykaSemper.źródłoFrazy = "input";
      pokażDiagnostykęSemper();
      return Promise.resolve(wpisanaFraza);
    }

    return pobierzAktywnąKartę()
      .then(function sprawdźKartę(karta) {
        if (!karta || rozpoznajTypStrony(karta.url) !== "BUR") {
          return "";
        }

        return wyślijDoKarty(karta, { typ: komunikaty.POBIERZ_TYTUŁ_Z_BUR });
      })
      .then(function użyjTytułuBur(odpowiedź) {
        const wynik = odpowiedź && odpowiedź.wynik;

        if (wynik && wynik.ok && wynik.frazaWyszukiwania) {
          elementy.linkLubFrazaSemper.value = wynik.frazaWyszukiwania;
          diagnostykaSemper.fraza = wynik.frazaWyszukiwania;
          diagnostykaSemper.źródłoFrazy = "tytuł BUR";
          pokażDiagnostykęSemper();
          return wynik.frazaWyszukiwania;
        }

        diagnostykaSemper.fraza = wpisanaFraza;
        diagnostykaSemper.źródłoFrazy = wpisanaFraza ? "input" : "";
        pokażDiagnostykęSemper();
        return wpisanaFraza;
      })
      .catch(function użyjInputa() {
        diagnostykaSemper.fraza = "";
        diagnostykaSemper.źródłoFrazy = "";
        pokażDiagnostykęSemper();
        return "";
      });
  }

  function szukajLinkuSemper() {
    wyczyśćWynikiSemper();
    ustawStatus(elementy.statusSemper, "Szukam...", "status-neutralny");

    pobierzFrazeZBurLubInputa()
      .then(function sprawdźFrazę(fraza) {
        const wartość = przestrzeń.oczyśćLinię(fraza);

        if (przestrzeń.czyŁączeSzczegółówSzkolenia(wartość)) {
          elementy.linkLubFrazaSemper.value = przestrzeń.normalizujŁączeSemper(wartość);
          ustawStatus(elementy.statusSemper, "Wykryto link SEMPER. Kliknij »Uzupełnij z linku«.", "status-ostrzezenie");
          return null;
        }

        if (wartość.length < 3) {
          throw new Error("Najpierw pobierz dane z formularza BUR albo wpisz frazę szkolenia.");
        }

        ustawStatus(elementy.statusSemper, "Szukam szkolenia na SEMPER...", "status-neutralny");
        return wyślijDoServiceWorkera({
          typ: komunikaty.SZUKAJ_ŁĄCZA_SEMPER,
          fraza: wartość
        });
      })
      .then(function pokażWynik(odpowiedź) {
        if (!odpowiedź) {
          return;
        }

        const wynik = odpowiedź.wynik || {};
        const diagnostyka = wynik.diagnostyka || {};

        if (diagnostyka.fraza) {
          diagnostykaSemper.fraza = diagnostyka.fraza;
        }

        if (diagnostyka.liczbaKandydatów !== undefined) {
          diagnostykaSemper.liczbaKandydatów = diagnostyka.liczbaKandydatów;
        }

        diagnostykaSemper.ostatniBłądServiceWorkera = wynik.błąd || diagnostyka.błądDirect || diagnostyka.błądAutocomplete || "";
        pokażDiagnostykęSemper();

        if (!wynik.ok) {
          const czyBłądSieci = /Nie udało się wyszukać szkolenia na SEMPER/i.test(wynik.błąd || "");

          ustawStatus(
            elementy.statusSemper,
            czyBłądSieci ? "Nie udało się wyszukać szkolenia na SEMPER." : "Nie znaleziono pewnego linku SEMPER.",
            "status-blad"
          );
          return;
        }

        if (wynik.wynik && wynik.wynik.url) {
          elementy.linkLubFrazaSemper.value = wynik.wynik.url;
          pokażWybraneŁącze(wynik.wynik);
          ustawStatus(elementy.statusSemper, "Znaleziono link SEMPER.", "status-odczytano");
          return;
        }

        if (wynik.wybory && wynik.wybory.length) {
          pokażWyborySemper(wynik.wybory);
          ustawStatus(elementy.statusSemper, "Wybierz właściwe szkolenie.", "status-ostrzezenie");
          return;
        }

        ustawStatus(elementy.statusSemper, "Nie znaleziono pewnego linku. Wklej link SEMPER ręcznie.", "status-blad");
      })
      .catch(function pokażBłąd(błąd) {
        diagnostykaSemper.ostatniBłądServiceWorkera = błąd && błąd.message ? błąd.message : "Nie udało się wyszukać linku SEMPER.";
        pokażDiagnostykęSemper();
        ustawStatus(elementy.statusSemper, błąd && błąd.message ? błąd.message : "Nie udało się wyszukać szkolenia na SEMPER.", "status-blad");
      });
  }

  function importujSzkolenieZLinku() {
    const url = przestrzeń.normalizujŁączeSemper(elementy.linkLubFrazaSemper.value);

    wyczyśćWynikiSemper();

    if (!przestrzeń.czyŁączeSzczegółówSzkolenia(url)) {
      ustawStatus(elementy.statusSemper, "Wklej poprawny link do szkolenia na szkolenia-semper.pl.", "status-blad");
      return;
    }

    elementy.linkLubFrazaSemper.value = url;
    ustawStatus(elementy.statusSemper, "Pobieram dane z SEMPER...", "status-neutralny");

    wyślijDoServiceWorkera({
      typ: komunikaty.IMPORTUJ_SEMPER_Z_ŁĄCZA,
      url: url
    })
      .then(function sparsujHtml(odpowiedź) {
        const wynik = odpowiedź && odpowiedź.wynik;

        if (!wynik || !wynik.ok || !wynik.html) {
          throw new Error((wynik && wynik.błąd) || "Nie udało się pobrać danych z linku.");
        }

        const wynikParsera = przestrzeń.parsujHtmlSemper(wynik.html, wynik.url || url);
        const szkolenie = wynikParsera.szkolenie;
        const wybranyTerminSemperIndex = szkolenie.terminy && szkolenie.terminy.length === 1 ? 0 : null;
        const wybranyTermin = wybranyTerminSemperIndex === null ? null : szkolenie.terminy[wybranyTerminSemperIndex];
        const ostrzeżenia = przestrzeń.zastosujCenęBezZakwaterowaniaWybranegoTerminu
          ? przestrzeń.zastosujCenęBezZakwaterowaniaWybranegoTerminu(szkolenie, wybranyTermin, wynikParsera.ostrzeżenia || wynikParsera.ostrzezenia || [])
          : (wynikParsera.ostrzeżenia || wynikParsera.ostrzezenia || []);

        wynikParsera.ostrzeżenia = ostrzeżenia;
        wynikParsera.ostrzezenia = ostrzeżenia;

        return zapiszStorage({
          ostatnieSzkolenieSemper: szkolenie,
          ostatnieOstrzezeniaSemper: ostrzeżenia,
          ostatnieŁączeSemper: wynik.url || url,
          dataImportuSemper: new Date().toISOString(),
          wybranyTerminSemperIndex: wybranyTerminSemperIndex,
          harmonogramBurPrzygotowany: false,
          harmonogramBurNieaktualny: true
        }).then(function zwróćWynik() {
          diagnostykaSemper.importZapisałSzkolenie = "tak";
          diagnostykaSemper.liczbaTerminówPoImporcie = szkolenie.terminy ? szkolenie.terminy.length : 0;
          diagnostykaSemper.ostatniBłądServiceWorkera = "";
          pokażDiagnostykęSemper();
          wynikParsera.wybranyTerminSemperIndex = wybranyTerminSemperIndex;
          return wynikParsera;
        });
      })
      .then(function pokażImport(wynikParsera) {
        pokażSzkolenie(wynikParsera);
        pokażWybraneŁącze({
          url: wynikParsera.url || url,
          tytuł: wynikParsera.szkolenie.tytułOryginalny || wynikParsera.szkolenie.tytulOryginalny
        });
        ustawStatus(
          elementy.statusSemper,
          (wynikParsera.ostrzeżenia || wynikParsera.ostrzezenia || []).length ? "Zaimportowano, ale część sekcji jest pusta." : "Zaimportowano dane z SEMPER.",
          (wynikParsera.ostrzeżenia || wynikParsera.ostrzezenia || []).length ? "status-ostrzezenie" : "status-odczytano"
        );
      })
      .catch(function pokażBłąd(błąd) {
        diagnostykaSemper.ostatniBłądServiceWorkera = błąd && błąd.message ? błąd.message : "Nie udało się pobrać danych z linku.";
        diagnostykaSemper.importZapisałSzkolenie = "nie";
        pokażDiagnostykęSemper();
        ustawStatus(elementy.statusSemper, błąd && błąd.message ? błąd.message : "Nie udało się pobrać danych z linku.", "status-blad");
      });
  }

  function pobierzWybranyTerminWypełniania(szkolenie, indeks) {
    const terminy = szkolenie && Array.isArray(szkolenie.terminy) ? szkolenie.terminy : [];
    const czyWybranoIndeks = indeks !== null && indeks !== undefined && indeks !== "";
    const liczbowyIndeks = czyWybranoIndeks ? Number(indeks) : NaN;

    if (terminy.length === 1) {
      return {
        ok: true,
        termin: terminy[0],
        indeks: 0
      };
    }

    if (!terminy.length) {
      return {
        ok: true,
        termin: {},
        indeks: null
      };
    }

    if (!Number.isInteger(liczbowyIndeks) || liczbowyIndeks < 0 || liczbowyIndeks >= terminy.length) {
      return {
        ok: false,
        komunikat: "Wybierz termin SEMPER do wypełnienia formularza."
      };
    }

    return {
      ok: true,
      termin: terminy[liczbowyIndeks],
      indeks: liczbowyIndeks
    };
  }

  function wypełnijFormularzBurZPanelu() {
    wyczyśćWynikWypełnianiaBur();
    ustawStatus(elementy.statusSemper, "Przygotowuję podgląd zmian formularza BUR...", "status-neutralny");

    Promise.all([
      pobierzAktywnąKartę(),
      odczytajStorage(["ostatnieSzkolenieSemper", "wybranyTerminSemperIndex"])
    ])
      .then(function sprawdźDane(wyniki) {
        const karta = wyniki[0];
        const dane = wyniki[1];
        const szkolenieSemper = dane.ostatnieSzkolenieSemper || ostatnieSzkolenieSemperZPanelu;
        const wybór = pobierzWybranyTerminWypełniania(szkolenieSemper, dane.wybranyTerminSemperIndex);

        if (!szkolenieSemper) {
          throw new Error("Najpierw użyj »Uzupełnij z linku«.");
        }

        if (!wybór.ok) {
          throw new Error(wybór.komunikat || "Wybierz termin SEMPER do wypełnienia formularza.");
        }

        if (!karta || rozpoznajTypStrony(karta.url) !== "BUR") {
          throw new Error("Otwórz formularz BUR, aby wypełnić pola.");
        }

        return rozpocznijOperacjęBur(karta, szkolenieSemper, wybór.indeks).then(function przygotujOperację() { return wyślijDoKarty(karta, {
          typ: komunikaty.PRZYGOTUJ_WYPEŁNIENIE_BUR,
          szkolenieSemper: szkolenieSemper,
          wybranyTermin: wybór.termin
        }); });
      })
      .then(function pokażOdpowiedź(odpowiedź) {
        const propozycje = odpowiedź && odpowiedź.wynik && odpowiedź.wynik.propozycje;
        if (!propozycje) { throw new Error("Nie udało się przygotować podglądu zmian BUR."); }
        podglądWypełnieniaBur = { propozycje: propozycje, kartaId: aktywnaOperacjaBur.identyfikatorKartyBur, indeksTerminu: aktywnaOperacjaBur.indeksTerminu, odciskSzkolenia: aktywnaOperacjaBur.odciskSzkolenia };
        aktywnaOperacjaBur = przestrzeń.przejdźOperacjęBur(aktywnaOperacjaBur, "oczekuje_na_zatwierdzenie");
        zapiszStorage({ podglądWypełnieniaBur: podglądWypełnieniaBur, aktywnaOperacjaBur: aktywnaOperacjaBur });
        renderujPodglądWypełnieniaBur(); odświeżStatusOperacjiBur(); elementy.przyciskZastosujZmianyBur.disabled = false;
        ustawStatus(elementy.statusSemper, "Podgląd zmian jest gotowy. Zaznacz zmiany i zatwierdź.", "status-odczytano");
      })
      .catch(function pokażBłąd(błąd) {
        ustawStatus(elementy.statusSemper, błąd && błąd.message ? błąd.message : "Nie udało się wypełnić formularza BUR.", "status-blad");
      })
      .finally(function odśwież() {
        pobierzAktywnąKartę().then(ustawStatusStronyDlaKarty);
      });
  }

  function renderujPodglądWypełnieniaBur() {
    elementy.podglądZmianBur.textContent = "";
    (podglądWypełnieniaBur && podglądWypełnieniaBur.propozycje || []).forEach(function dodaj(propozycja) {
      const etykieta = document.createElement("label"); const checkbox = document.createElement("input"); const tekst = document.createElement("span");
      checkbox.type = "checkbox"; checkbox.checked = propozycja.domyślnieZaznaczona; checkbox.disabled = propozycja.status === "bez_zmiany" || propozycja.status === "brak_pola_bur";
      checkbox.addEventListener("change", function zapiszDecyzję() { propozycja.zaznaczona = checkbox.checked; zapiszStorage({ podglądWypełnieniaBur: podglądWypełnieniaBur }); });
      propozycja.zaznaczona = checkbox.checked; tekst.textContent = propozycja.sekcja + " — " + propozycja.pole + ": „" + propozycja.wartośćAktualna + "” → „" + propozycja.wartośćProponowana + "” (" + propozycja.status + ")";
      etykieta.appendChild(checkbox); etykieta.appendChild(tekst); elementy.podglądZmianBur.appendChild(etykieta);
    });
  }

  function zastosujZatwierdzoneZmianyBur() {
    if (!podglądWypełnieniaBur || !aktywnaOperacjaBur) { return; }
    pobierzAktywnąKartę().then(function zastosuj(karta) {
      if (!karta || karta.id !== podglądWypełnieniaBur.kartaId) { throw new Error("Zmieniła się karta BUR — przygotuj podgląd ponownie."); }
      aktywnaOperacjaBur = przestrzeń.przejdźOperacjęBur(aktywnaOperacjaBur, "wprowadzanie"); return wyślijDoKarty(karta, { typ: komunikaty.ZASTOSUJ_ZATWIERDZONE_ZMIANY_BUR, propozycje: podglądWypełnieniaBur.propozycje });
    }).then(function raportuj(odpowiedź) { pokażWynikWypełnianiaBur({ uzupełnione: (odpowiedź.wynik.wyniki || []).filter(function filtruj(w) { return w.ok; }), ostrzeżenia: [], błędy: (odpowiedź.wynik.wyniki || []).filter(function filtruj(w) { return !w.ok; }), pominięte: [] }); aktywnaOperacjaBur = przestrzeń.przejdźOperacjęBur(aktywnaOperacjaBur, "walidowanie"); aktywnaOperacjaBur = przestrzeń.przejdźOperacjęBur(aktywnaOperacjaBur, "zakończono"); return zapiszStorage({ aktywnaOperacjaBur: aktywnaOperacjaBur }); }).then(function zakończ() { odświeżStatusOperacjiBur(); elementy.przyciskZastosujZmianyBur.disabled = true; ustawStatus(elementy.statusSemper, "Zastosowano zmiany — sprawdź raport.", "status-odczytano"); }).catch(function błąd(wyjątek) { ustawStatus(elementy.statusSemper, wyjątek.message, "status-blad"); });
  }

  function odczytajOstatniImport() {
    odczytajStorage(["ostatnieSzkolenieSemper", "ostatnieŁączeSemper", "dataImportuSemper", "wybranyTerminSemperIndex", "aktywnaOperacjaBur"])
      .then(function pokażDane(dane) {
        aktywnaOperacjaBur = dane.aktywnaOperacjaBur || null;
        odświeżStatusOperacjiBur();
        if (!dane.ostatnieSzkolenieSemper) {
          return;
        }

        diagnostykaSemper.importZapisałSzkolenie = "tak";
        diagnostykaSemper.liczbaTerminówPoImporcie = Array.isArray(dane.ostatnieSzkolenieSemper.terminy) ? dane.ostatnieSzkolenieSemper.terminy.length : 0;
        pokażDiagnostykęSemper();

        pokażSzkolenie({
          szkolenie: dane.ostatnieSzkolenieSemper,
          ostrzeżenia: [],
          wybranyTerminSemperIndex: dane.wybranyTerminSemperIndex
        });

        if (dane.ostatnieŁączeSemper) {
          elementy.linkLubFrazaSemper.value = dane.ostatnieŁączeSemper;
          pokażWybraneŁącze({
            url: dane.ostatnieŁączeSemper,
            tytuł: dane.ostatnieSzkolenieSemper.tytułOryginalny || dane.ostatnieSzkolenieSemper.tytulOryginalny || "Ostatni import SEMPER"
          });
        }

        ustawStatus(elementy.statusSemper, "Wczytano ostatni import SEMPER ze storage.", "status-odczytano");
      })
      .catch(function pomińBłądStorage() {});
  }

  przestrzeń.renderujDaneSzkolenia = renderujDaneSzkolenia;
  przestrzeń.odświeżDaneSzkoleniaZMagazynu = odświeżDaneSzkoleniaZMagazynu;
  pokażDiagnostykęSemper();
  odświeżDostępnośćWypełniania();
  elementy.przyciskImportujHarmonogramXml.disabled = true;

  elementy.przyciskPobierz.addEventListener("click", pobierzDaneZeStrony);
  elementy.przyciskWyczyśćPanel.addEventListener("click", wyczyśćPanelImportu);
  elementy.przyciskSzukajLinku.addEventListener("click", szukajLinkuSemper);
  elementy.przyciskUzupełnijZLinku.addEventListener("click", importujSzkolenieZLinku);
  elementy.przyciskWypełnijFormularz.addEventListener("click", wypełnijFormularzBurZPanelu);
  elementy.przyciskZastosujZmianyBur.addEventListener("click", zastosujZatwierdzoneZmianyBur);
  elementy.wybórTerminuSemper.addEventListener("change", zapiszWybórTerminuSemper);
  elementy.przyciskWalidujBur.addEventListener("click", walidujFormularzBurZPanelu);
  elementy.przyciskWyczyśćPodświetlenia.addEventListener("click", wyczyśćPodświetleniaBurZPanelu);
  elementy.przyciskUzupełnijProgram.addEventListener("click", uzupełnijProgramWPanelu);
  elementy.przyciskGenerujHarmonogram.addEventListener("click", przygotujHarmonogramWPanelu);
  elementy.przyciskImportujHarmonogramXml.addEventListener("click", function importujXml() {
    wprowadźPrzygotowanyHarmonogramDoBur(komunikaty.WPROWADŹ_HARMONOGRAM_DO_BUR);
  });
  elementy.przyciskWypełnijHarmonogramRęcznie.addEventListener("click", function wypełnijRęcznie() {
    wprowadźPrzygotowanyHarmonogramDoBur(komunikaty.WYPEŁNIJ_HARMONOGRAM_RĘCZNIE_BUR);
  });

  pobierzAktywnąKartę()
    .then(ustawStatusStronyDlaKarty)
    .catch(function pokażBłądStartowy() {
      ustawStatus(elementy.statusStrony, "Nieobsługiwana strona", "status-ostrzezenie");
      elementy.przyciskPobierz.disabled = true;
      ustawDostępnośćWalidacji(false);
    });

  odczytajOstatniImport();
  odświeżStanProgramuHarmonogramu();
  odświeżStanPrzygotowaniaHarmonogramu();
})(globalThis);
