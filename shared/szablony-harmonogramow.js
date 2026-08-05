(function zarejestrujSzablonyHarmonogramow(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const DOZWOLONE_ROLE_PROWADZĄCYCH = ["ekspert", "walidator", "brak"];
  const DOZWOLONE_KLUCZE_TEMATÓW = ["standard", "podsumowanie", "brak"];

  function utwórzWiersz(indeksDnia, od, doGodziny, typAktywności, kluczTematu, rolaProwadzącego) {
    return {
      indeksDnia: indeksDnia,
      od: od,
      do: doGodziny,
      typAktywnosci: typAktywności,
      temat: kluczTematu,
      rolaProwadzacego: rolaProwadzącego
    };
  }

  const DZIEŃ_ROZPOCZYNAJĄCY_IIST_ONLINE = [
    utwórzWiersz(0, "09:00", "09:10", "Walidacja", "brak", "walidator"),
    utwórzWiersz(0, "09:10", "10:30", "Zajęcia", "standard", "ekspert"),
    utwórzWiersz(0, "10:30", "10:50", "Przerwa", "brak", "brak"),
    utwórzWiersz(0, "10:50", "12:00", "Zajęcia", "standard", "ekspert"),
    utwórzWiersz(0, "12:00", "12:20", "Przerwa", "brak", "brak"),
    utwórzWiersz(0, "12:20", "13:30", "Zajęcia", "standard", "ekspert"),
    utwórzWiersz(0, "13:30", "13:50", "Przerwa", "brak", "brak"),
    utwórzWiersz(0, "13:50", "15:00", "Zajęcia", "standard", "ekspert")
  ];

  const DZIEŃ_ŚRODKOWY_IIST_ONLINE = [
    utwórzWiersz(0, "09:00", "10:30", "Zajęcia", "standard", "ekspert"),
    utwórzWiersz(0, "10:30", "10:50", "Przerwa", "brak", "brak"),
    utwórzWiersz(0, "10:50", "12:00", "Zajęcia", "standard", "ekspert"),
    utwórzWiersz(0, "12:00", "12:20", "Przerwa", "brak", "brak"),
    utwórzWiersz(0, "12:20", "13:30", "Zajęcia", "standard", "ekspert"),
    utwórzWiersz(0, "13:30", "13:50", "Przerwa", "brak", "brak"),
    utwórzWiersz(0, "13:50", "15:00", "Zajęcia", "standard", "ekspert")
  ];

  const DZIEŃ_KOŃCOWY_IIST_ONLINE = [
    utwórzWiersz(0, "09:00", "10:30", "Zajęcia", "standard", "ekspert"),
    utwórzWiersz(0, "10:30", "10:50", "Przerwa", "brak", "brak"),
    utwórzWiersz(0, "10:50", "12:00", "Zajęcia", "standard", "ekspert"),
    utwórzWiersz(0, "12:00", "12:20", "Przerwa", "brak", "brak"),
    utwórzWiersz(0, "12:20", "13:30", "Zajęcia", "standard", "ekspert"),
    utwórzWiersz(0, "13:30", "13:50", "Przerwa", "brak", "brak"),
    utwórzWiersz(0, "13:50", "14:40", "Zajęcia", "standard", "ekspert"),
    utwórzWiersz(0, "14:40", "14:50", "Walidacja", "brak", "walidator"),
    utwórzWiersz(0, "14:50", "15:00", "Zajęcia", "podsumowanie", "ekspert")
  ];

  // Wariant źródłowy nie zawierał wiersza 13:50–14:40 ani części opisów. Ten szablon jest
  // znormalizowaną kompozycją reguł dnia rozpoczynającego i końcowego.
  const JEDEN_DZIEŃ_IIST_ONLINE = [
    utwórzWiersz(0, "09:00", "09:10", "Walidacja", "brak", "walidator"),
    utwórzWiersz(0, "09:10", "10:30", "Zajęcia", "standard", "ekspert"),
    utwórzWiersz(0, "10:30", "10:50", "Przerwa", "brak", "brak"),
    utwórzWiersz(0, "10:50", "12:00", "Zajęcia", "standard", "ekspert"),
    utwórzWiersz(0, "12:00", "12:20", "Przerwa", "brak", "brak"),
    utwórzWiersz(0, "12:20", "13:30", "Zajęcia", "standard", "ekspert"),
    utwórzWiersz(0, "13:30", "13:50", "Przerwa", "brak", "brak"),
    utwórzWiersz(0, "13:50", "14:40", "Zajęcia", "standard", "ekspert"),
    utwórzWiersz(0, "14:40", "14:50", "Walidacja", "brak", "walidator"),
    utwórzWiersz(0, "14:50", "15:00", "Zajęcia", "podsumowanie", "ekspert")
  ];

  function ustawIndeksDnia(wiersze, indeksDnia) {
    return wiersze.map(function skopiujWiersz(wiersz) {
      return Object.assign({}, wiersz, { indeksDnia: indeksDnia });
    });
  }

  const SZABLONY_HARMONOGRAMOW = {
    iist: {
      online: {
        1: {
          id: "iist-online-1-dzien",
          nazwa: "IIST online — 1 dzień",
          wersja: "1",
          pozycje: JEDEN_DZIEŃ_IIST_ONLINE,
          sumaKontrolna: { liczbaPozycji: 10, minutyZegarowe: 360, minutyZajęć: 280, minutyWalidacji: 20, minutyPrzerw: 60, minutyDydaktyczneBezPrzerw: 400 }
        },
        2: {
          id: "iist-online-2-dni",
          nazwa: "IIST online — 2 dni",
          wersja: "1",
          pozycje: ustawIndeksDnia(DZIEŃ_ROZPOCZYNAJĄCY_IIST_ONLINE, 0)
            .concat(ustawIndeksDnia(DZIEŃ_KOŃCOWY_IIST_ONLINE, 1)),
          sumaKontrolna: { liczbaPozycji: 17, minutyZegarowe: 720, minutyZajęć: 580, minutyWalidacji: 20, minutyPrzerw: 120, minutyDydaktyczneBezPrzerw: 800 }
        },
        3: {
          id: "iist-online-3-dni",
          nazwa: "IIST online — 3 dni",
          wersja: "1",
          pozycje: ustawIndeksDnia(DZIEŃ_ROZPOCZYNAJĄCY_IIST_ONLINE, 0)
            .concat(ustawIndeksDnia(DZIEŃ_ŚRODKOWY_IIST_ONLINE, 1))
            .concat(ustawIndeksDnia(DZIEŃ_KOŃCOWY_IIST_ONLINE, 2)),
          sumaKontrolna: { liczbaPozycji: 24, minutyZegarowe: 1080, minutyZajęć: 880, minutyWalidacji: 20, minutyPrzerw: 180, minutyDydaktyczneBezPrzerw: 1200 }
        }
      }
    }
  };

  function normalizujFormę(forma) {
    const wartość = String(forma || "").trim().toLowerCase();
    return wartość === "online" ? "online" : wartość;
  }

  function pobierzSzablonHarmonogramu(profilId, forma, liczbaDni) {
    const profil = SZABLONY_HARMONOGRAMOW[String(profilId || "").toLowerCase()];
    const szablonyFormy = profil && profil[normalizujFormę(forma)];
    return szablonyFormy && szablonyFormy[Number(liczbaDni)] || null;
  }

  function parsujDatęLokalną(wartość) {
    const tekst = String(wartość || "").trim();
    let dopasowanie = tekst.match(/^(\d{2})[-.](\d{2})[-.](\d{4})$/);
    let rok;
    let miesiąc;
    let dzień;

    if (dopasowanie) {
      dzień = Number(dopasowanie[1]);
      miesiąc = Number(dopasowanie[2]);
      rok = Number(dopasowanie[3]);
    } else {
      dopasowanie = tekst.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!dopasowanie) {
        return null;
      }
      rok = Number(dopasowanie[1]);
      miesiąc = Number(dopasowanie[2]);
      dzień = Number(dopasowanie[3]);
    }

    const data = new Date(rok, miesiąc - 1, dzień, 12, 0, 0, 0);
    return data.getFullYear() === rok && data.getMonth() === miesiąc - 1 && data.getDate() === dzień ? data : null;
  }

  function formatujDatęLokalną(data) {
    return [
      String(data.getDate()).padStart(2, "0"),
      String(data.getMonth() + 1).padStart(2, "0"),
      String(data.getFullYear())
    ].join("-");
  }

  function pobierzDatyZakresuLokalnego(dataStartBur, dataKoniecBur) {
    const start = parsujDatęLokalną(dataStartBur);
    const koniec = parsujDatęLokalną(dataKoniecBur);
    const daty = [];

    if (!start || !koniec || start.getTime() > koniec.getTime()) {
      return daty;
    }

    for (let data = new Date(start.getTime()); data.getTime() <= koniec.getTime(); data.setDate(data.getDate() + 1)) {
      daty.push(formatujDatęLokalną(data));
    }

    return daty;
  }

  function minutyGodziny(godzina) {
    const części = String(godzina || "").match(/^(\d{2}):(\d{2})$/);
    return części ? Number(części[1]) * 60 + Number(części[2]) : NaN;
  }

  function formatujMinuty(minuty) {
    const wartość = Math.max(0, Math.round(Number(minuty) || 0));
    return String(Math.floor(wartość / 60)).padStart(2, "0") + ":" + String(wartość % 60).padStart(2, "0");
  }

  function obliczPodsumowanieHarmonogramu(pozycje) {
    const podsumowanie = {
      liczbaPozycji: Array.isArray(pozycje) ? pozycje.length : 0,
      minutyZegarowe: 0,
      minutyZajęć: 0,
      minutyWalidacji: 0,
      minutyPrzerw: 0,
      minutyDydaktyczneBezPrzerw: 0
    };

    (Array.isArray(pozycje) ? pozycje : []).forEach(function zsumuj(pozycja) {
      const czas = minutyGodziny(pozycja.czas_zakonczenia) - minutyGodziny(pozycja.czas_rozpoczecia);
      if (!Number.isFinite(czas) || czas < 0) {
        return;
      }
      podsumowanie.minutyZegarowe += czas;
      if (pozycja.typ_aktywnosci === "Zajęcia") {
        podsumowanie.minutyZajęć += czas;
      } else if (pozycja.typ_aktywnosci === "Walidacja") {
        podsumowanie.minutyWalidacji += czas;
      } else if (pozycja.typ_aktywnosci === "Przerwa") {
        podsumowanie.minutyPrzerw += czas;
      }
    });

    podsumowanie.minutyDydaktyczneBezPrzerw = Math.round((podsumowanie.minutyZajęć + podsumowanie.minutyWalidacji) / 45 * 60);
    podsumowanie.zegarowe = formatujMinuty(podsumowanie.minutyZegarowe);
    podsumowanie.zajęcia = formatujMinuty(podsumowanie.minutyZajęć);
    podsumowanie.walidacja = formatujMinuty(podsumowanie.minutyWalidacji);
    podsumowanie.przerwy = formatujMinuty(podsumowanie.minutyPrzerw);
    podsumowanie.dydaktyczneBezPrzerw = formatujMinuty(podsumowanie.minutyDydaktyczneBezPrzerw);
    return podsumowanie;
  }

  function dodajBłądJeśli(błędy, warunek, komunikat) {
    if (warunek) {
      błędy.push(komunikat);
    }
  }

  function walidujDaneSzablonu(szablon, konfiguracja) {
    const błędy = [];
    const prowadzący = konfiguracja && konfiguracja.prowadzącyWedługRoli || {};
    const tematy = konfiguracja && konfiguracja.tematyWedługKlucza || {};

    szablon.pozycje.forEach(function sprawdźWiersz(wiersz, indeks) {
      dodajBłądJeśli(błędy, !DOZWOLONE_ROLE_PROWADZĄCYCH.includes(wiersz.rolaProwadzacego), "Wiersz szablonu " + (indeks + 1) + " ma niedozwoloną rolę prowadzącego: " + wiersz.rolaProwadzacego + ".");
      dodajBłądJeśli(błędy, !DOZWOLONE_KLUCZE_TEMATÓW.includes(wiersz.temat), "Wiersz szablonu " + (indeks + 1) + " ma niedozwolony klucz tematu: " + wiersz.temat + ".");
    });

    dodajBłądJeśli(błędy, !String(prowadzący.ekspert || "").trim(), "Profil nie definiuje prowadzącego dla roli ekspert.");
    dodajBłądJeśli(błędy, !String(prowadzący.walidator || "").trim(), "Profil nie definiuje prowadzącego dla roli walidator.");
    dodajBłądJeśli(błędy, prowadzący.brak !== "", "Rola brak musi być mapowana na pusty ciąg.");
    dodajBłądJeśli(błędy, !String(tematy.standard || "").trim(), "Profil nie definiuje tematu standardowego.");
    dodajBłądJeśli(błędy, !String(tematy.podsumowanie || "").trim(), "Profil nie definiuje tematu podsumowania.");
    dodajBłądJeśli(błędy, tematy.brak !== "", "Klucz tematu brak musi być mapowany na pusty ciąg.");
    return błędy;
  }

  function walidujWygenerowanyHarmonogram(kontekst, pozycje) {
    const dane = kontekst || {};
    const lista = Array.isArray(pozycje) ? pozycje : [];
    const daty = pobierzDatyZakresuLokalnego(dane.dataStartBur, dane.dataKoniecBur);
    const szablon = pobierzSzablonHarmonogramu(dane.profilId, dane.forma, daty.length);
    const profil = przestrzeń.pobierzProfilDostawcy && przestrzeń.pobierzProfilDostawcy(dane.profilId);
    const konfiguracja = profil && profil.harmonogramBur;
    const prowadzący = konfiguracja && konfiguracja.prowadzącyWedługRoli || {};
    const tematy = konfiguracja && konfiguracja.tematyWedługKlucza || {};
    const błędy = [];

    if (!szablon) {
      błędy.push("Brak szablonu dla profilu " + (dane.profilId || "brak") + ", formy " + (dane.forma || "brak") + " i " + daty.length + " dni.");
      return błędy;
    }

    błędy.push.apply(błędy, walidujDaneSzablonu(szablon, konfiguracja));

    dodajBłądJeśli(błędy, lista.length !== szablon.sumaKontrolna.liczbaPozycji, "Niepoprawna liczba pozycji: " + lista.length + ", oczekiwano " + szablon.sumaKontrolna.liczbaPozycji + ".");

    daty.forEach(function sprawdźDzień(data, indeksDnia) {
      const wierszeDnia = lista.filter(function wybierz(pozycja) { return pozycja.dzien_swiadczenia === data; });
      dodajBłądJeśli(błędy, !wierszeDnia.length, "Brak pozycji dla daty " + data + ".");
      wierszeDnia.forEach(function sprawdźKolejność(pozycja, indeks) {
        const od = minutyGodziny(pozycja.czas_rozpoczecia);
        const doGodziny = minutyGodziny(pozycja.czas_zakonczenia);
        dodajBłądJeśli(błędy, !Number.isFinite(od) || !Number.isFinite(doGodziny) || od >= doGodziny, "Nieprawidłowe godziny pozycji " + (indeks + 1) + " w dniu " + data + ".");
        if (indeks === 0) {
          dodajBłądJeśli(błędy, pozycja.czas_rozpoczecia !== "09:00", "Dzień " + data + " nie rozpoczyna się o 09:00.");
        } else {
          const poprzednia = wierszeDnia[indeks - 1];
          const koniecPoprzedniej = minutyGodziny(poprzednia.czas_zakonczenia);
          dodajBłądJeśli(błędy, od < koniecPoprzedniej, "Pozycje nakładają się w dniu " + data + " przy " + pozycja.czas_rozpoczecia + ".");
          dodajBłądJeśli(błędy, od > koniecPoprzedniej, "Luka w harmonogramie dnia " + data + " przed " + pozycja.czas_rozpoczecia + ".");
        }
        if (indeks === wierszeDnia.length - 1) {
          dodajBłądJeśli(błędy, pozycja.czas_zakonczenia !== "15:00", "Dzień " + data + " nie kończy się o 15:00.");
        }
      });

      lista.filter(function wybierzNieprawidłowąDatę(pozycja, indeksPozycji) {
        const wzorzec = szablon.pozycje[indeksPozycji];
        return wzorzec && wzorzec.indeksDnia === indeksDnia && pozycja.dzien_swiadczenia !== data;
      }).forEach(function zgłośNieprawidłowąDatę(pozycja) {
        błędy.push("Nieprawidłowa data pozycji " + pozycja.czas_rozpoczecia + "–" + pozycja.czas_zakonczenia + ": " + pozycja.dzien_swiadczenia + ", oczekiwano " + data + ".");
      });
    });

    lista.forEach(function sprawdźPozycję(pozycja, indeks) {
      const numer = indeks + 1;
      const wierszSzablonu = szablon.pozycje[indeks];
      if (wierszSzablonu) {
        const oczekiwanaData = daty[wierszSzablonu.indeksDnia];
        const oczekiwanyTemat = tematy[wierszSzablonu.temat] || "";
        const oczekiwanyProwadzący = prowadzący[wierszSzablonu.rolaProwadzacego] || "";
        dodajBłądJeśli(błędy, pozycja.dzien_swiadczenia !== oczekiwanaData, "Pozycja " + numer + " ma datę niezgodną z szablonem: " + pozycja.dzien_swiadczenia + ", oczekiwano " + oczekiwanaData + ".");
        dodajBłądJeśli(błędy, pozycja.czas_rozpoczecia !== wierszSzablonu.od || pozycja.czas_zakonczenia !== wierszSzablonu.do, "Pozycja " + numer + " ma godziny niezgodne z szablonem.");
        dodajBłądJeśli(błędy, pozycja.typ_aktywnosci !== wierszSzablonu.typAktywnosci, "Pozycja " + numer + " ma typ aktywności niezgodny z szablonem.");
        dodajBłądJeśli(błędy, pozycja.przedmiot !== oczekiwanyTemat, "Pozycja " + numer + " ma temat niezgodny z szablonem.");
        dodajBłądJeśli(błędy, pozycja.prowadzacy !== oczekiwanyProwadzący, "Pozycja " + numer + " ma prowadzącego niezgodnego z szablonem.");
      }
      dodajBłądJeśli(błędy, !daty.includes(pozycja.dzien_swiadczenia), "Pozycja " + numer + " ma datę spoza terminu: " + pozycja.dzien_swiadczenia + ".");
      dodajBłądJeśli(błędy, !["Zajęcia", "Walidacja", "Przerwa"].includes(pozycja.typ_aktywnosci), "Pozycja " + numer + " ma nieprawidłowy typ aktywności: " + pozycja.typ_aktywnosci + ".");
      if (pozycja.typ_aktywnosci === "Zajęcia") {
        dodajBłądJeśli(błędy, pozycja.prowadzacy !== prowadzący.ekspert, "Pozycja zajęć " + numer + " nie ma prowadzącego eksperta.");
      } else if (pozycja.typ_aktywnosci === "Walidacja") {
        dodajBłądJeśli(błędy, pozycja.prowadzacy !== prowadzący.walidator, "Pozycja walidacji " + numer + " nie ma walidatora.");
        dodajBłądJeśli(błędy, pozycja.przedmiot !== "", "Pozycja walidacji " + numer + " ma niepusty temat.");
      } else if (pozycja.typ_aktywnosci === "Przerwa") {
        dodajBłądJeśli(błędy, pozycja.prowadzacy !== "", "Pozycja przerwy " + numer + " ma prowadzącego.");
        dodajBłądJeśli(błędy, pozycja.przedmiot !== "", "Pozycja przerwy " + numer + " ma niepusty temat.");
      }
      dodajBłądJeśli(błędy, /szkolenia-semper\.pl/i.test(JSON.stringify(pozycja)), "Pozycja " + numer + " zawiera adres SEMPER.");
      if (pozycja.przedmiot === tematy.podsumowanie) {
        dodajBłądJeśli(błędy, indeks !== lista.length - 1, "Temat podsumowania występuje przed ostatnim wierszem.");
      }
    });

    dodajBłądJeśli(błędy, !lista.length || lista[lista.length - 1].przedmiot !== tematy.podsumowanie, "Ostatni wiersz nie zawiera tematu podsumowania.");

    const podsumowanie = obliczPodsumowanieHarmonogramu(lista);
    Object.keys(szablon.sumaKontrolna).forEach(function sprawdźSumę(pole) {
      dodajBłądJeśli(błędy, podsumowanie[pole] !== szablon.sumaKontrolna[pole], "Niezgodna suma kontrolna " + pole + ": " + podsumowanie[pole] + ", oczekiwano " + szablon.sumaKontrolna[pole] + ".");
    });
    return błędy;
  }

  function zbudujBłądZakresu(kontekst, liczbaDni, dodatkowyKomunikat) {
    const początek = String(kontekst.dataStartBur || "brak");
    const koniec = String(kontekst.dataKoniecBur || "brak");
    const opis = "Data początku: " + początek + ", data końca: " + koniec + ", rozpoznana liczba dni: " + liczbaDni + ".";
    return {
      ok: false,
      kod: "NIEOBSŁUGIWANY_ZAKRES_HARMONOGRAMU",
      komunikat: (dodatkowyKomunikat || "Zakres dat nie odpowiada obsługiwanemu szablonowi.") + " " + opis,
      błędy: [(dodatkowyKomunikat || "Zakres dat nie odpowiada obsługiwanemu szablonowi."), opis],
      pozycje: [],
      liczbaDni: liczbaDni,
      dataStartBur: początek,
      dataKoniecBur: koniec
    };
  }

  function generujHarmonogramDlaTerminu(kontekst) {
    const dane = kontekst || {};
    const daty = pobierzDatyZakresuLokalnego(dane.dataStartBur, dane.dataKoniecBur);
    const profilId = String(dane.profilId || "").toLowerCase();
    const forma = normalizujFormę(dane.forma);

    if (!daty.length) {
      return zbudujBłądZakresu(dane, 0, "Nieprawidłowy zakres dat harmonogramu.");
    }

    if (profilId === "semper") {
      if (typeof przestrzeń.zbudujPozycjeHarmonogramu !== "function") {
        return zbudujBłądZakresu(dane, daty.length, "Generator zgodności SEMPER nie jest dostępny.");
      }
      const pozycjeSemper = przestrzeń.zbudujPozycjeHarmonogramu({
        daty: daty,
        tematSzkolenia: dane.tematSzkolenia || "",
        czyOnline: forma === "online",
        emailTrenera: dane.emailTrenera,
        emailWalidatora: dane.emailWalidatora
      });
      return {
        ok: true,
        pozycje: pozycjeSemper,
        podsumowanie: obliczPodsumowanieHarmonogramu(pozycjeSemper),
        liczbaDni: daty.length,
        szablonId: "semper-zgodność",
        nazwaSzablonu: "SEMPER — generator zgodności",
        wersjaSzablonu: "legacy"
      };
    }

    const szablon = pobierzSzablonHarmonogramu(profilId, forma, daty.length);
    if (!szablon) {
      return zbudujBłądZakresu(dane, daty.length, "Brak szablonu harmonogramu dla profilu " + (profilId || "brak") + " i formy " + (forma || "brak") + ".");
    }

    const profil = przestrzeń.pobierzProfilDostawcy && przestrzeń.pobierzProfilDostawcy(profilId);
    const konfiguracja = profil && profil.harmonogramBur;
    if (!konfiguracja) {
      return zbudujBłądZakresu(dane, daty.length, "Brak konfiguracji harmonogramu profilu " + profilId + ".");
    }

    const pozycje = szablon.pozycje.map(function wygenerujPozycję(wiersz) {
      return {
        przedmiot: konfiguracja.tematyWedługKlucza[wiersz.temat] || "",
        prowadzacy: konfiguracja.prowadzącyWedługRoli[wiersz.rolaProwadzacego] || "",
        dzien_swiadczenia: daty[wiersz.indeksDnia] || "",
        czas_rozpoczecia: wiersz.od,
        czas_zakonczenia: wiersz.do,
        typ_aktywnosci: wiersz.typAktywnosci
      };
    });
    const błędy = walidujWygenerowanyHarmonogram(Object.assign({}, dane, { profilId: profilId, forma: forma }), pozycje);
    if (błędy.length) {
      return { ok: false, kod: "NIEPRAWIDŁOWY_HARMONOGRAM", komunikat: "Wygenerowany harmonogram nie przeszedł kontroli: " + błędy.join(" "), błędy: błędy, pozycje: [], liczbaDni: daty.length };
    }

    return {
      ok: true,
      pozycje: pozycje,
      podsumowanie: obliczPodsumowanieHarmonogramu(pozycje),
      liczbaDni: daty.length,
      szablonId: szablon.id,
      nazwaSzablonu: szablon.nazwa,
      wersjaSzablonu: szablon.wersja
    };
  }

  function normalizujTekstPorównania(wartość) {
    return String(wartość || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim().toLocaleLowerCase("pl-PL");
  }

  function normalizujDatęPorównania(wartość) {
    const data = parsujDatęLokalną(wartość);
    return data ? formatujDatęLokalną(data) : "";
  }

  function pobierzPoleAktualnejPozycji(pozycja, pole) {
    const mapowanie = {
      typ_aktywnosci: "typAktywności",
      dzien_swiadczenia: "data",
      czas_rozpoczecia: "od",
      czas_zakonczenia: "do",
      przedmiot: "przedmiot",
      prowadzacy: "prowadzący"
    };
    return pozycja && (pozycja[pole] !== undefined ? pozycja[pole] : pozycja[mapowanie[pole]]) || "";
  }

  function porównajHarmonogramPoImporcie(oczekiwanePozycje, aktualnePozycje, oczekiwanePodsumowanie, aktualnePodsumowanie) {
    const oczekiwane = Array.isArray(oczekiwanePozycje) ? oczekiwanePozycje : [];
    const aktualne = Array.isArray(aktualnePozycje) ? aktualnePozycje : [];
    const różnice = [];
    const błędy = [];
    const pola = [
      ["Typ aktywności", "typ_aktywnosci"],
      ["Data", "dzien_swiadczenia"],
      ["Od", "czas_rozpoczecia"],
      ["Do", "czas_zakonczenia"],
      ["Przedmiot/temat", "przedmiot"],
      ["Prowadzący", "prowadzacy"]
    ];

    if (aktualne.length !== oczekiwane.length) {
      błędy.push("Tabela zawiera " + aktualne.length + " pozycji, oczekiwano dokładnie " + oczekiwane.length + ".");
    }

    oczekiwane.forEach(function porównajPozycję(oczekiwana, indeks) {
      const aktualna = aktualne[indeks];
      if (!aktualna) {
        różnice.push({ pozycja: indeks + 1, pole: "Wiersz", oczekiwane: "Pozycja istnieje", aktualne: "Brak pozycji" });
        return;
      }
      pola.forEach(function porównajPole(definicja) {
        const oczekiwanaWartość = oczekiwana[definicja[1]] || "";
        const aktualnaWartość = pobierzPoleAktualnejPozycji(aktualna, definicja[1]);
        if (normalizujTekstPorównania(oczekiwanaWartość) !== normalizujTekstPorównania(aktualnaWartość)) {
          różnice.push({ pozycja: indeks + 1, pole: definicja[0], oczekiwane: oczekiwanaWartość, aktualne: aktualnaWartość });
        }
      });
    });

    if (aktualne.length > oczekiwane.length) {
      aktualne.slice(oczekiwane.length).forEach(function dodajNadmiarową(pozycja, indeks) {
        różnice.push({ pozycja: oczekiwane.length + indeks + 1, pole: "Wiersz", oczekiwane: "Brak pozycji", aktualne: pozycja.tekst || "Nadmiarowa pozycja" });
      });
    }

    const etykietySum = {
      zegarowe: "Czas zegarowy",
      zajęcia: "Zajęcia",
      walidacja: "Walidacja",
      przerwy: "Przerwy",
      dydaktyczneBezPrzerw: "Godziny dydaktyczne"
    };
    const oczekiwaneSumy = oczekiwanePodsumowanie || {};
    const aktualneSumy = aktualnePodsumowanie || {};
    Object.keys(etykietySum).forEach(function porównajSumę(pole) {
      if (aktualneSumy[pole] && normalizujTekstPorównania(aktualneSumy[pole]) !== normalizujTekstPorównania(oczekiwaneSumy[pole])) {
        różnice.push({ pozycja: "Podsumowanie", pole: etykietySum[pole], oczekiwane: oczekiwaneSumy[pole] || "", aktualne: aktualneSumy[pole] });
      }
    });

    if (różnice.length) {
      błędy.push("Wykryto " + różnice.length + " różnic między przygotowanym harmonogramem a tabelą BUR.");
    }

    return {
      ok: błędy.length === 0,
      błędy: błędy,
      ostrzeżenia: [],
      różnice: różnice,
      częściowyImport: aktualne.length > 0 && (aktualne.length !== oczekiwane.length || różnice.length > 0),
      liczbaOczekiwanychPozycji: oczekiwane.length,
      liczbaPozycjiWTabeli: aktualne.length,
      podsumowanieBur: aktualneSumy
    };
  }

  function walidujKontekstImportuHarmonogramu(kontekst) {
    const dane = kontekst || {};
    const metryka = dane.metryka || {};
    const błędy = [];
    const aktywnyProfilId = String(dane.aktywnyProfilId || "").toLowerCase();
    const profilId = String(metryka.profilId || "").toLowerCase();
    const aktualnyTermin = dane.aktualnyTerminBur || {};

    if (!profilId) {
      błędy.push("Brak profilu w metryce przygotowanego harmonogramu.");
    }
    if (!aktywnyProfilId || aktywnyProfilId !== profilId) {
      błędy.push("Aktywny profil zmienił się po przygotowaniu harmonogramu.");
    }

    if (profilId === "iist") {
      if (!dane.wykryteKontoBur || dane.wykryteKontoBur.profilId !== "iist") {
        błędy.push("Wykryte konto BUR nie jest kontem IIST.");
      }
      if (normalizujTekstPorównania(metryka.tytułSzkolenia) !== normalizujTekstPorównania(aktualnyTermin.tytuł)) {
        błędy.push("Harmonogram został przygotowany dla innego szkolenia.");
      }
      if (normalizujDatęPorównania(metryka.dataStartBur) !== normalizujDatęPorównania(aktualnyTermin.dataRozpoczęcia)
        || normalizujDatęPorównania(metryka.dataKoniecBur) !== normalizujDatęPorównania(aktualnyTermin.dataZakończenia)) {
        błędy.push("Termin BUR zmienił się po przygotowaniu harmonogramu.");
      }
      if (normalizujFormę(metryka.forma) !== normalizujFormę(aktualnyTermin.tryb)) {
        błędy.push("Forma świadczenia zmieniła się po przygotowaniu harmonogramu.");
      }
      if (dane.identyfikatorWybranegoTerminu && metryka.identyfikatorWybranegoTerminu
        && dane.identyfikatorWybranegoTerminu !== metryka.identyfikatorWybranegoTerminu) {
        błędy.push("Wybrano inny termin niż użyty do przygotowania harmonogramu.");
      }

      const błędyStruktury = walidujWygenerowanyHarmonogram({
        profilId: "iist",
        forma: metryka.forma,
        dataStartBur: metryka.dataStartBur,
        dataKoniecBur: metryka.dataKoniecBur
      }, dane.pozycje);
      błędy.push.apply(błędy, błędyStruktury);

      const podsumowanie = obliczPodsumowanieHarmonogramu(dane.pozycje);
      const zapisanePodsumowanie = metryka.podsumowanie || {};
      ["liczbaPozycji", "minutyZegarowe", "minutyZajęć", "minutyWalidacji", "minutyPrzerw", "minutyDydaktyczneBezPrzerw"].forEach(function sprawdźSumę(pole) {
        if (podsumowanie[pole] !== zapisanePodsumowanie[pole]) {
          błędy.push("Suma kontrolna " + pole + " zmieniła się po przygotowaniu harmonogramu.");
        }
      });
      if (/szkolenia-semper\.pl/i.test(JSON.stringify(dane.pozycje || []))) {
        błędy.push("Harmonogram IIST zawiera adres SEMPER.");
      }

      if (dane.osobyProwadząceTekst !== undefined) {
        const osoby = normalizujTekstPorównania(dane.osobyProwadząceTekst);
        if (!osoby.includes("ekspert@iist.pl") || !osoby.includes("koordynator@iist.pl")) {
          błędy.push("Najpierw uzupełnij osoby prowadzące dla profilu IIST.");
        }
        if (/semper|szkolenia-semper\.pl/i.test(osoby)) {
          błędy.push("Usuń pozostałości osób SEMPER przed importem harmonogramu IIST.");
        }
      }
    }

    return {
      ok: błędy.length === 0,
      kod: błędy.includes("Najpierw uzupełnij osoby prowadzące dla profilu IIST.") ? "BRAK_OSÓB_IIST" : (błędy.length ? "NIEZGODNY_KONTEKST_IMPORTU" : ""),
      błędy: błędy,
      błąd: błędy.join(" ")
    };
  }

  function zbudujDiagnostycznąNazwęCsvIist(metryka) {
    const dane = metryka || {};
    return "BUR_IIST_Online_" + Number(dane.liczbaDni || 0) + "dni_"
      + (normalizujDatęPorównania(dane.dataStartBur) || "brak-daty") + "--"
      + (normalizujDatęPorównania(dane.dataKoniecBur) || "brak-daty") + ".csv";
  }

  przestrzeń.SZABLONY_HARMONOGRAMOW = SZABLONY_HARMONOGRAMOW;
  przestrzeń.pobierzSzablonHarmonogramu = pobierzSzablonHarmonogramu;
  przestrzeń.generujHarmonogramDlaTerminu = generujHarmonogramDlaTerminu;
  przestrzeń.obliczPodsumowanieHarmonogramu = obliczPodsumowanieHarmonogramu;
  przestrzeń.walidujWygenerowanyHarmonogram = walidujWygenerowanyHarmonogram;
  przestrzeń.porównajHarmonogramPoImporcie = porównajHarmonogramPoImporcie;
  przestrzeń.walidujKontekstImportuHarmonogramu = walidujKontekstImportuHarmonogramu;
  przestrzeń.zbudujDiagnostycznąNazwęCsvIist = zbudujDiagnostycznąNazwęCsvIist;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
