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

  function ustawStatusStronyDlaKarty(karta) {
    const typ = rozpoznajTypStrony(karta ? karta.url : "");

    if (typ === "Nieobsługiwana strona") {
      ustawStatus(elementy.statusStrony, typ, "status-ostrzezenie");
      elementy.przyciskPobierz.disabled = true;
      return Promise.resolve();
    }

    return wyślijDoKarty(karta, { typ: komunikaty.PING_SKRYPTU_STRONY })
      .then(function pokażPong(odpowiedź) {
        const typStrony = odpowiedź && odpowiedź.typStrony ? odpowiedź.typStrony : typ;
        ustawStatus(elementy.statusStrony, typStrony, "status-odczytano");
        elementy.przyciskPobierz.disabled = false;
        odświeżStanProgramuHarmonogramu();
      })
      .catch(function pokażŁagodnyBłąd() {
        ustawStatus(elementy.statusStrony, typ + " - odśwież stronę, jeśli panel nie odpowiada", "status-ostrzezenie");
        elementy.przyciskPobierz.disabled = false;
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
      ustawStatus(elementy.statusAkcji, "Wykryto BUR. Wypełnianie formularzy nie jest jeszcze włączone.", "status-odczytano");
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

        return zapiszStorage({
          ostatnieSzkolenieSemper: szkolenie,
          ostatnieŁączeSemper: wynik.url || url,
          dataImportuSemper: new Date().toISOString()
        }).then(function zwróćWynik() {
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
    odczytajStorage(["ostatnieSzkolenieSemper", "ostatnieŁączeSemper", "dataImportuSemper"])
      .then(function pokażDane(dane) {
        if (!dane.ostatnieSzkolenieSemper) {
          return;
        }

        pokażSzkolenie({
          szkolenie: dane.ostatnieSzkolenieSemper,
          ostrzeżenia: []
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
    });

  odczytajOstatniImport();
  odświeżStanProgramuHarmonogramu();
})(globalThis);
