(function uruchomPanel(globalny) {
  const przestrzeń = globalny.BurAsystent;
  const komunikaty = przestrzeń.KOMUNIKATY;
  const komunikatBrakuSkryptu = "Nie znaleziono skryptu strony na tej karcie. Odśwież stronę BUR/SEMPER albo otwórz obsługiwaną stronę.";
  const elementy = {
    statusStrony: document.getElementById("status-strony"),
    statusAkcji: document.getElementById("status-akcji"),
    statusSemper: document.getElementById("status-semper"),
    przyciskPobierz: document.getElementById("przycisk-pobierz"),
    przyciskSzukajLinku: document.getElementById("przycisk-szukaj-linku"),
    przyciskUzupełnijZLinku: document.getElementById("przycisk-uzupelnij-z-linku"),
    linkLubFrazaSemper: document.getElementById("link-lub-fraza-semper"),
    wynikiSemper: document.getElementById("wyniki-semper"),
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
    przyciskUzupełnijProgram: document.getElementById("przycisk-uzupelnij-program"),
    przyciskGenerujHarmonogram: document.getElementById("przycisk-generuj-harmonogram"),
    przyciskImportujHarmonogramXml: document.getElementById("przycisk-importuj-harmonogram-xml"),
    przyciskWypełnijHarmonogramRęcznie: document.getElementById("przycisk-wypelnij-harmonogram-recznie")
  };
  let ostatnieTerminySemper = [];

  function ustawStatus(element, tekst, klasa) {
    element.textContent = tekst;
    element.className = (element === elementy.statusStrony ? "status " : "komunikat ") + klasa;
  }

  function ustawStatusProgramuHarmonogramu(tekst, klasa) {
    ustawStatus(elementy.statusProgramuHarmonogramu, tekst, klasa || "status-neutralny");
  }

  function wpisz(pole, wartość) {
    elementy[pole].textContent = wartość || "-";
  }

  function formatujUnikalne(wartości) {
    const czyste = wartości.filter(Boolean);
    return Array.from(new Set(czyste)).join("\n");
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
    elementy.wybórTerminuSemper.textContent = "";

    if (!ostatnieTerminySemper.length) {
      const opcja = document.createElement("option");

      opcja.value = "";
      opcja.textContent = "Brak zaimportowanych terminów";
      elementy.wybórTerminuSemper.appendChild(opcja);
      elementy.wybórTerminuSemper.disabled = true;
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
  }

  function zapiszWybórTerminuSemper() {
    const wartość = elementy.wybórTerminuSemper.value;
    const indeks = wartość === "" ? null : Number(wartość);

    zapiszStorage({
      wybranyTerminSemperIndex: indeks
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

    wpisz("tytułOryginalny", szkolenie.tytułOryginalny || szkolenie.tytulOryginalny);
    wpisz("tytułBur", szkolenie.tytułPoNormalizacjiBur || szkolenie.tytułBur || szkolenie.tytulBur);
    wpisz("terminy", formatujTerminy(terminy));
    wpisz("lokalizacje", formatujUnikalne(terminy.map(function pobierzMiejsce(termin) { return termin.miejsce; })));
    wpisz("cena", formatujUnikalne(terminy.map(function pobierzCenę(termin) { return termin.cena; })));
    wpisz("czasTrwania", formatujUnikalne(terminy.map(function pobierzCzas(termin) { return termin.czasTrwania; })));
    wpisz("celSzkolenia", sekcje.celSzkolenia);
    wpisz("grupaDocelowa", sekcje.grupaDocelowa);
    wpisz("korzyści", sekcje.korzysci || sekcje.korzyści);
    wpisz("program", sekcje.program);
    wpisz("inwestycja", sekcje.inwestycja);
    pokażWybórTerminuSemper(terminy, wynik.wybranyTerminSemperIndex);
    pokażOstrzeżenia(wynik.ostrzeżenia || wynik.ostrzezenia || []);
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
    elementy.przyciskWalidujBur.disabled = !czyBur;
    elementy.przyciskWyczyśćPodświetlenia.disabled = !czyBur;

    if (!czyBur) {
      ustawStatus(elementy.statusWalidacjiBur, "Otwórz formularz BUR, aby wykonać walidację.", "status-ostrzezenie");
    } else if (elementy.statusWalidacjiBur.textContent === "Otwórz formularz BUR, aby wykonać walidację.") {
      ustawStatus(elementy.statusWalidacjiBur, "Gotowy do walidacji.", "status-neutralny");
    }
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

  function pobierzPierwszyTerminSzkolenia(szkolenie) {
    const terminy = szkolenie && Array.isArray(szkolenie.terminy) ? szkolenie.terminy : [];

    return terminy[0] || null;
  }

  function czyTerminOnline(termin) {
    const tekst = [
      termin ? termin.forma : "",
      termin ? termin.miejsce : ""
    ].join(" ");

    return /online/i.test(tekst);
  }

  function pobierzDatyTerminu(termin) {
    if (!termin) {
      return [];
    }

    return przestrzeń.zbudujDatyZakresu(
      termin.dataStartBur || termin.dataOdTekst,
      termin.dataKoniecBur || termin.dataDoTekst || termin.dataOdTekst
    );
  }

  function zbudujDaneProgramuHarmonogramu() {
    return odczytajStorage(["ostatnieSzkolenieSemper"]).then(function zbuduj(dane) {
      const szkolenie = dane.ostatnieSzkolenieSemper;
      const termin = pobierzPierwszyTerminSzkolenia(szkolenie);
      const daty = pobierzDatyTerminu(termin);

      if (!szkolenie) {
        throw new Error("Najpierw zaimportuj dane z SEMPER.");
      }

      if (daty.length === 0) {
        throw new Error("Nie udało się ustalić dat harmonogramu z ostatniego importu SEMPER.");
      }

      const tematSzkolenia = szkolenie.tytułPoNormalizacjiBur || szkolenie.tytułBur || szkolenie.tytulBur || szkolenie.tytułOryginalny || szkolenie.tytulOryginalny || "";
      const pozycje = przestrzeń.zbudujPozycjeHarmonogramu({
        tematSzkolenia: tematSzkolenia,
        daty: daty,
        czyOnline: czyTerminOnline(termin),
        emailTrenera: przestrzeń.EMAIL_TRENERA_HARMONOGRAMU,
        emailWalidatora: przestrzeń.EMAIL_WALIDATORA_HARMONOGRAMU
      });

      return {
        program: szkolenie.sekcje ? szkolenie.sekcje.program : "",
        tematSzkolenia: tematSzkolenia,
        pozycje: pozycje,
        xml: przestrzeń.wygenerujXmlHarmonogramu(pozycje)
      };
    });
  }

  function wyślijAkcjęProgramuHarmonogramu(typKomunikatu, komunikatSukcesu) {
    ustawStatusProgramuHarmonogramu("Przygotowuję dane...", "status-neutralny");

    zbudujDaneProgramuHarmonogramu()
      .then(function wyślij(dane) {
        return bezpiecznieWyślijDoAktywnejKarty(Object.assign({ typ: typKomunikatu }, dane));
      })
      .then(function pokażWynik(odpowiedź) {
        const wynik = odpowiedź && odpowiedź.wynik;

        if (!wynik || !wynik.ok) {
          throw new Error((wynik && wynik.błąd) || "Akcja nie powiodła się.");
        }

        ustawStatusProgramuHarmonogramu(wynik.komunikat || komunikatSukcesu, wynik.ostrzeżenia && wynik.ostrzeżenia.length ? "status-ostrzezenie" : "status-odczytano");
        odświeżStanProgramuHarmonogramu();
      })
      .catch(function pokażBłąd(błąd) {
        ustawStatusProgramuHarmonogramu(błąd && błąd.message ? błąd.message : "Nie udało się wykonać akcji.", "status-blad");
      });
  }

  function wygenerujHarmonogramWPanelu() {
    ustawStatusProgramuHarmonogramu("Generuję harmonogram...", "status-neutralny");

    zbudujDaneProgramuHarmonogramu()
      .then(function pokażWynik(dane) {
        return zapiszStorage({
          ostatniePozycjeHarmonogramuBur: dane.pozycje,
          ostatniXmlHarmonogramuBur: dane.xml
        }).then(function pokaż() {
          ustawStatusProgramuHarmonogramu("Wygenerowano " + dane.pozycje.length + " pozycji harmonogramu. Możesz importować XML albo użyć trybu ręcznego.", "status-odczytano");
        });
      })
      .catch(function pokażBłąd(błąd) {
        ustawStatusProgramuHarmonogramu(błąd && błąd.message ? błąd.message : "Nie udało się wygenerować harmonogramu.", "status-blad");
      });
  }

  function wyczyśćWynikWalidacjiBur() {
    elementy.wynikWalidacjiBur.textContent = "";
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
    tytuł.textContent = wynik.tytuł || "Wybrany link SEMPER";
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

    wybory.slice(0, 8).forEach(function dodajWynik(wynik) {
      const przycisk = document.createElement("button");
      const tytuł = document.createElement("strong");
      const url = document.createElement("span");

      przycisk.type = "button";
      przycisk.className = "wynik-semper";
      tytuł.textContent = wynik.tytuł || "Wynik SEMPER";
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

    return bezpiecznieWyślijDoAktywnejKarty({ typ: komunikaty.POBIERZ_TYTUŁ_Z_BUR })
      .then(function użyjTytułuBur(odpowiedź) {
        const wynik = odpowiedź && odpowiedź.wynik;

        if (wynik && wynik.ok && wynik.frazaWyszukiwania) {
          elementy.linkLubFrazaSemper.value = wynik.frazaWyszukiwania;
          return wynik.frazaWyszukiwania;
        }

        return wpisanaFraza;
      })
      .catch(function użyjInputa() {
        return wpisanaFraza;
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
          throw new Error("Wpisz frazę SEMPER albo otwórz formularz BUR z tytułem usługi.");
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

        if (!wynik.ok) {
          ustawStatus(elementy.statusSemper, "Nie znalazłem pewnego linku. Wklej link SEMPER ręcznie.", "status-ostrzezenie");
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
          ustawStatus(elementy.statusSemper, "Znaleziono kilka możliwych wyników. Wybierz właściwy link.", "status-ostrzezenie");
          return;
        }

        ustawStatus(elementy.statusSemper, "Nie znalazłem pewnego linku. Wklej link SEMPER ręcznie.", "status-ostrzezenie");
      })
      .catch(function pokażBłąd(błąd) {
        ustawStatus(elementy.statusSemper, błąd && błąd.message ? błąd.message : "Nie udało się wyszukać linku SEMPER.", "status-blad");
      });
  }

  function importujSzkolenieZLinku() {
    const url = przestrzeń.normalizujŁączeSemper(elementy.linkLubFrazaSemper.value);

    wyczyśćWynikiSemper();

    if (!przestrzeń.czyŁączeSzczegółówSzkolenia(url)) {
      ustawStatus(elementy.statusSemper, "Podaj poprawny link szczegółów szkolenia SEMPER.", "status-blad");
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

        return zapiszStorage({
          ostatnieSzkolenieSemper: szkolenie,
          ostatnieŁączeSemper: wynik.url || url,
          dataImportuSemper: new Date().toISOString(),
          wybranyTerminSemperIndex: wybranyTerminSemperIndex
        }).then(function zwróćWynik() {
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
          (wynikParsera.ostrzeżenia || wynikParsera.ostrzezenia || []).length ? "Zaimportowano, ale są braki." : "Zaimportowano dane z SEMPER.",
          (wynikParsera.ostrzeżenia || wynikParsera.ostrzezenia || []).length ? "status-ostrzezenie" : "status-odczytano"
        );
      })
      .catch(function pokażBłąd(błąd) {
        ustawStatus(elementy.statusSemper, błąd && błąd.message ? błąd.message : "Nie udało się pobrać danych z linku.", "status-blad");
      });
  }

  function odczytajOstatniImport() {
    odczytajStorage(["ostatnieSzkolenieSemper", "ostatnieŁączeSemper", "dataImportuSemper", "wybranyTerminSemperIndex"])
      .then(function pokażDane(dane) {
        if (!dane.ostatnieSzkolenieSemper) {
          return;
        }

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

  elementy.przyciskPobierz.addEventListener("click", pobierzDaneZeStrony);
  elementy.przyciskSzukajLinku.addEventListener("click", szukajLinkuSemper);
  elementy.przyciskUzupełnijZLinku.addEventListener("click", importujSzkolenieZLinku);
  elementy.wybórTerminuSemper.addEventListener("change", zapiszWybórTerminuSemper);
  elementy.przyciskWalidujBur.addEventListener("click", walidujFormularzBurZPanelu);
  elementy.przyciskWyczyśćPodświetlenia.addEventListener("click", wyczyśćPodświetleniaBurZPanelu);
  elementy.przyciskUzupełnijProgram.addEventListener("click", function uzupełnijProgram() {
    wyślijAkcjęProgramuHarmonogramu(komunikaty.UZUPEŁNIJ_PROGRAM_BUR, "Uzupełniono program usługi.");
  });
  elementy.przyciskGenerujHarmonogram.addEventListener("click", wygenerujHarmonogramWPanelu);
  elementy.przyciskImportujHarmonogramXml.addEventListener("click", function importujXml() {
    wyślijAkcjęProgramuHarmonogramu(komunikaty.IMPORTUJ_HARMONOGRAM_XML_BUR, "Zaimportowano harmonogram XML.");
  });
  elementy.przyciskWypełnijHarmonogramRęcznie.addEventListener("click", function wypełnijRęcznie() {
    wyślijAkcjęProgramuHarmonogramu(komunikaty.WYPEŁNIJ_HARMONOGRAM_RĘCZNIE_BUR, "Wypełniono harmonogram ręcznie.");
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
})(globalThis);
