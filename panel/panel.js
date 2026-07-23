(function uruchomPanel(globalny) {
  const przestrzeń = globalny.BurAsystent;
  const komunikaty = przestrzeń.KOMUNIKATY;
  const komunikatBrakuSkryptu = "Nie znaleziono skryptu strony na tej karcie. Odśwież stronę BUR/SEMPER albo otwórz obsługiwaną stronę.";
  const plikiContentBur = [
    "shared/komunikaty.js",
    "shared/cele-formularza-bur.js",
    "shared/model-walidacji.js",
    "shared/normalizacja-tytulu.js",
    "shared/daty.js",
    "shared/terminy-bur.js",
    "shared/stan-operacji-bur.js",
    "shared/bur-program-harmonogram.js",
    "shared/wyszukiwarka-semper.js",
    "shared/selektory-bur.js",
    "shared/walidatory-bur.js",
    "shared/definicje-pol-bur.js",
    "shared/przygotowanie-wypelnienia-bur.js",
    "shared/wypełniacz-bur.js",
    "content/bur-content.js"
  ];
  const styleContentBur = ["content/bur-highlighter.css"];
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
    listaTerminówSemper: document.getElementById("lista-terminow-semper"),
    wybórNiejednoznacznegoTerminu: document.getElementById("wybor-niejednoznacznego-terminu"),
    wybranyTerminHarmonogramu: document.getElementById("wybrany-termin-harmonogramu"),
    zgodnośćTerminuHarmonogramu: document.getElementById("zgodnosc-terminu-harmonogramu"),
    listaTerminówHarmonogramuKolejka: document.getElementById("lista-terminow-harmonogramu-kolejka"),
    listaTerminówHarmonogramuSemper: document.getElementById("lista-terminow-harmonogramu-semper"),
    kolejkaTermowWejście: document.getElementById("kolejka-terminow-wejscie"),
    kolejkaTermowPodsumowanie: document.getElementById("kolejka-terminow-podsumowanie"),
    kolejkaTermowPodgląd: document.getElementById("kolejka-terminow-podglad"),
    kolejkaTermowBłędy: document.getElementById("kolejka-terminow-bledy"),
    kolejkaDzisiajDodane: document.getElementById("kolejka-dzisiaj-dodane"),
    kolejkaŁącznieDodane: document.getElementById("kolejka-lacznie-dodane"),
    statusKolejkiTerminów: document.getElementById("status-kolejki-terminow"),
    przyciskZapiszKolejkę: document.getElementById("przycisk-zapisz-kolejke"),
    przyciskNoweSzkolenie: document.getElementById("przycisk-nowe-szkolenie"),
    przyciskResetujKolejkę: document.getElementById("przycisk-resetuj-kolejke"),
    przyciskSkorygujDzienny: document.getElementById("przycisk-skoryguj-dzienny"),
    przyciskResetujLiczniki: document.getElementById("przycisk-resetuj-liczniki"),
    aktualnyTerminBur: document.getElementById("aktualny-termin-bur"),
    aktualnyTytułBur: document.getElementById("aktualny-tytul-bur"),
    aktualnyZakresBur: document.getElementById("aktualny-zakres-bur"),
    aktualneSzczegółyBur: document.getElementById("aktualne-szczegoly-bur"),
    zgodnośćAktualnegoTerminuBur: document.getElementById("zgodnosc-aktualnego-terminu-bur"),
    statusDopasowaniaTerminu: document.getElementById("status-dopasowania-terminu"),
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
    przyciskImportujHarmonogramXlsx: document.getElementById("przycisk-importuj-harmonogram-xlsx"),
    przyciskPobierzHarmonogramCsv: document.getElementById("przycisk-pobierz-harmonogram-csv"),
    diagnostykaImportuHarmonogramu: document.getElementById("diagnostyka-importu-harmonogramu"),
    przyciskWypełnijHarmonogramRęcznie: document.getElementById("przycisk-wypelnij-harmonogram-recznie")
  };
  let ostatnieTerminySemper = [];
  let ostatnieSzkolenieSemperZPanelu = null;
  let ostatniWybranyTerminSemperIndex = null;
  let czyAktywnaKartaBur = false;
  let aktywnaOperacjaBur = null;
  let podglądWypełnieniaBur = null;
  let ostatniWynikWalidacjiBur = null;
  let aktualnyTerminBur = null;
  let stanDopasowaniaTerminuBur = { status: "brak-dat-bur", indeks: null, indeksy: [] };
  let filtrTerminówSemper = "wszystkie";
  let filtrTerminówHarmonogramu = "wszystkie";
  let wybranyTerminHarmonogramuBur = null;
  let ostatnieTerminyKolejkiBur = [];
  let źródłoWyboruTerminuSemper = "brak";
  let aktywnaZakładkaPanelu = "semper";
  let czyUżytkownikWybrałZakładkę = false;
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

  function zakończOperacjęBurBłędem(etap, komunikat) {
    const treść = komunikat || "Nieznany błąd operacji BUR.";

    if (!aktywnaOperacjaBur) {
      podglądWypełnieniaBur = null;
      elementy.przyciskZastosujZmianyBur.disabled = true;
      return Promise.resolve();
    }

    if (aktywnaOperacjaBur.etap !== "błąd" && aktywnaOperacjaBur.etap !== "zakończono") {
      try {
        aktywnaOperacjaBur = przestrzeń.zapiszBłądOperacjiBur(
          aktywnaOperacjaBur,
          etap || aktywnaOperacjaBur.etap,
          treść
        );
      } catch (błądStanu) {
        aktywnaOperacjaBur = Object.assign({}, aktywnaOperacjaBur, {
          etap: "błąd",
          blokuje: false,
          zaktualizowano: new Date().toISOString(),
          błąd: {
            etap: etap || aktywnaOperacjaBur.etap,
            komunikat: treść,
            czas: new Date().toISOString()
          }
        });
      }
    }

    podglądWypełnieniaBur = null;
    elementy.przyciskZastosujZmianyBur.disabled = true;

    return zapiszStorage({
      aktywnaOperacjaBur: aktywnaOperacjaBur,
      podglądWypełnieniaBur: null
    }).then(function odświeżPoBłędzie() {
      odświeżStatusOperacjiBur();
    });
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
    const daty = przestrzeń.pobierzDatyTerminuSemper(termin);
    return przestrzeń.formatujZakresDatPrezentacyjny(daty.dataRozpoczęcia, daty.dataZakończenia)
      + " · " + przestrzeń.opiszTerminSemper(termin, indeks);
  }

  function czyTerminHarmonogramuPasujeDoFiltra(termin) {
    if (filtrTerminówHarmonogramu === "online") {
      return termin && termin.tryb === "online";
    }
    if (filtrTerminówHarmonogramu === "stacjonarne") {
      return termin && termin.tryb !== "online";
    }
    return true;
  }

  function pobierzKandydatówSemperHarmonogramu() {
    return ostatnieTerminySemper.map(function mapujTermin(termin, indeks) {
      return przestrzeń.utwórzTerminHarmonogramuZeSemper(termin, indeks);
    });
  }

  function pobierzKandydatówKolejkiHarmonogramu() {
    return ostatnieTerminyKolejkiBur.map(function mapujTermin(termin) {
      return przestrzeń.utwórzTerminHarmonogramuZKolejki(termin);
    });
  }

  function odświeżDostępnośćHarmonogramu() {
    const maSzkolenie = Boolean(ostatnieSzkolenieSemperZPanelu);
    const maTermin = Boolean(wybranyTerminHarmonogramuBur && wybranyTerminHarmonogramuBur.stabilnyId);
    elementy.przyciskGenerujHarmonogram.disabled = !(maSzkolenie && maTermin);
  }

  function opiszAktualnyTerminBurDlaHarmonogramu() {
    if (!aktualnyTerminBur) {
      return "Nie odczytano terminu BUR";
    }
    const daty = przestrzeń.pobierzDatyTerminuBur(aktualnyTerminBur);
    const zakres = przestrzeń.formatujZakresDatPrezentacyjny(daty.dataRozpoczęcia, daty.dataZakończenia) || "Brak dat";
    return [zakres, aktualnyTerminBur.lokalizacja, aktualnyTerminBur.tryb].filter(Boolean).join(" · ");
  }

  function odświeżOznaczenieZgodnościAktualnegoTerminuBur() {
    if (!elementy.zgodnośćAktualnegoTerminuBur) {
      return;
    }
    const zgodne = Boolean(
      wybranyTerminHarmonogramuBur
      && aktualnyTerminBur
      && przestrzeń.sprawdźZgodnośćTerminuHarmonogramuZBur(
        wybranyTerminHarmonogramuBur,
        aktualnyTerminBur
      ).ok
    );
    elementy.zgodnośćAktualnegoTerminuBur.classList.toggle("ukryty", !zgodne);
  }

  function odświeżZgodnośćTerminuHarmonogramu() {
    odświeżOznaczenieZgodnościAktualnegoTerminuBur();
    if (!elementy.zgodnośćTerminuHarmonogramu) {
      return;
    }
    if (!wybranyTerminHarmonogramuBur) {
      ustawStatus(elementy.zgodnośćTerminuHarmonogramu, "Wybierz termin, dla którego przygotować harmonogram.", "status-neutralny");
      return;
    }
    if (!aktualnyTerminBur) {
      ustawStatus(elementy.zgodnośćTerminuHarmonogramu, "Możesz przygotować harmonogram bez otwartej karty BUR.", "status-neutralny");
      return;
    }

    const zgodność = przestrzeń.sprawdźZgodnośćTerminuHarmonogramuZBur(
      wybranyTerminHarmonogramuBur,
      aktualnyTerminBur
    );
    if (zgodność.ok) {
      ustawStatus(elementy.zgodnośćTerminuHarmonogramu, "Termin harmonogramu jest zgodny z aktualnie edytowanym BUR.", "status-odczytano");
      return;
    }

    ustawStatus(
      elementy.zgodnośćTerminuHarmonogramu,
      "⚠ Termin harmonogramu różni się od aktualnie edytowanego BUR. Przygotowanie jest dozwolone; import zostanie sprawdzony ponownie przed zmianą tabeli.",
      "status-ostrzezenie"
    );
  }

  function pokażWybranyTerminHarmonogramu() {
    if (!elementy.wybranyTerminHarmonogramu) {
      return;
    }
    elementy.wybranyTerminHarmonogramu.textContent = wybranyTerminHarmonogramuBur
      ? przestrzeń.opiszTerminHarmonogramu(wybranyTerminHarmonogramuBur)
      : "Nie wybrano terminu harmonogramu.";
    odświeżZgodnośćTerminuHarmonogramu();
    odświeżDostępnośćHarmonogramu();
  }

  function utwórzPrzyciskTerminuHarmonogramu(termin, opis) {
    const przycisk = document.createElement("button");
    const tekst = document.createElement("span");
    const wybrany = przestrzeń.czyTenSamTerminHarmonogramu(termin, wybranyTerminHarmonogramuBur);
    przycisk.type = "button";
    przycisk.className = "pozycja-terminu-harmonogramu" + (wybrany ? " wybrany" : "");
    przycisk.setAttribute("aria-pressed", wybrany ? "true" : "false");
    przycisk.dataset.idTerminuHarmonogramu = termin.stabilnyId;
    tekst.textContent = opis;
    przycisk.appendChild(tekst);

    if (aktualnyTerminBur) {
      const zgodność = przestrzeń.sprawdźZgodnośćTerminuHarmonogramuZBur(termin, aktualnyTerminBur);
      if (zgodność.ok || zgodność.zgodneDaty) {
        const oznaczenie = document.createElement("span");
        oznaczenie.className = zgodność.ok ? "oznaczenie-bur" : "oznaczenie-zgodnej-daty";
        oznaczenie.textContent = zgodność.ok ? "✓ edytowany BUR" : "zgodna data";
        przycisk.appendChild(oznaczenie);
      }
    }

    przycisk.addEventListener("click", function wybierzTerminHarmonogramu() {
      ustawTerminHarmonogramu(termin);
    });
    return przycisk;
  }

  function renderujListęTerminówHarmonogramuKolejki() {
    const kontener = elementy.listaTerminówHarmonogramuKolejka;
    if (!kontener) {
      return;
    }
    kontener.textContent = "";
    const kandydaci = pobierzKandydatówKolejkiHarmonogramu().filter(czyTerminHarmonogramuPasujeDoFiltra);
    if (!kandydaci.length) {
      const pusty = document.createElement("p");
      pusty.className = "pusta-lista-terminow";
      pusty.textContent = ostatnieTerminyKolejkiBur.length
        ? "Brak terminów kolejki dla wybranego filtra."
        : "Wklej terminy w zakładce „Terminy”, aby pojawiły się tutaj.";
      kontener.appendChild(pusty);
      return;
    }

    kandydaci.forEach(function dodaj(termin) {
      const szczegóły = termin.tryb === "online"
        ? "Online"
        : [termin.lokalizacja, "stacjonarna"].filter(Boolean).join(" · ");
      const zakres = przestrzeń.formatujZakresDatPrezentacyjny(termin.dataRozpoczęcia, termin.dataZakończenia);
      kontener.appendChild(utwórzPrzyciskTerminuHarmonogramu(termin, zakres + " · " + szczegóły));
    });
  }

  function renderujListęTerminówHarmonogramuSemper() {
    const kontener = elementy.listaTerminówHarmonogramuSemper;
    if (!kontener) {
      return;
    }
    kontener.textContent = "";
    const grupy = przestrzeń.grupujTerminySemper(ostatnieTerminySemper, filtrTerminówHarmonogramu);
    if (!grupy.length) {
      const pusty = document.createElement("p");
      pusty.className = "pusta-lista-terminow";
      pusty.textContent = ostatnieTerminySemper.length
        ? "Brak terminów SEMPER dla wybranego filtra."
        : "Brak zaimportowanych terminów SEMPER.";
      kontener.appendChild(pusty);
      return;
    }

    grupy.forEach(function dodajGrupę(grupa) {
      const sekcja = document.createElement("section");
      const nagłówek = document.createElement("h3");
      sekcja.className = "grupa-terminow";
      nagłówek.className = "naglowek-grupy-terminow";
      nagłówek.textContent = grupa.etykieta;
      sekcja.appendChild(nagłówek);

      grupa.pozycje.forEach(function dodajTermin(pozycja) {
        const terminHarmonogramu = przestrzeń.utwórzTerminHarmonogramuZeSemper(pozycja.termin, pozycja.indeks);
        sekcja.appendChild(
          utwórzPrzyciskTerminuHarmonogramu(
            terminHarmonogramu,
            przestrzeń.opiszTerminSemper(pozycja.termin, pozycja.indeks)
          )
        );
      });
      kontener.appendChild(sekcja);
    });
  }

  function renderujListęTerminówHarmonogramu() {
    renderujListęTerminówHarmonogramuKolejki();
    renderujListęTerminówHarmonogramuSemper();
    pokażWybranyTerminHarmonogramu();
  }

  function ustawFiltrTerminówHarmonogramu(filtr) {
    filtrTerminówHarmonogramu = filtr || "wszystkie";
    document.querySelectorAll("[data-filtr-harmonogramu]").forEach(function oznaczFiltr(przycisk) {
      przycisk.setAttribute("aria-pressed", przycisk.dataset.filtrHarmonogramu === filtrTerminówHarmonogramu ? "true" : "false");
    });
    renderujListęTerminówHarmonogramu();
  }

  function ustawTerminHarmonogramu(termin, opcje) {
    const ustawienia = opcje || {};
    const poprzedni = wybranyTerminHarmonogramuBur;
    const nowy = termin ? Object.assign({}, termin) : null;
    const czyZmieniono = !(
      (!poprzedni && !nowy)
      || (poprzedni && nowy && przestrzeń.czyTenSamTerminHarmonogramu(poprzedni, nowy))
    );

    wybranyTerminHarmonogramuBur = nowy;
    renderujListęTerminówHarmonogramu();

    const zapis = {
      wybranyTerminHarmonogramuBur: nowy
    };
    if (czyZmieniono && ustawienia.zachowajPrzygotowany !== true) {
      zapis.harmonogramBurPrzygotowany = false;
      zapis.harmonogramBurNieaktualny = true;
      elementy.przyciskImportujHarmonogramXlsx.disabled = true;
      elementy.przyciskPobierzHarmonogramCsv.disabled = true;
      elementy.przyciskWypełnijHarmonogramRęcznie.disabled = true;
      if (!ustawienia.cicho) {
        ustawStatusProgramuHarmonogramu(
          nowy
            ? "Zmieniono termin harmonogramu. Kliknij »Przygotuj harmonogram«."
            : "Wybrany termin harmonogramu przestał być dostępny.",
          "status-ostrzezenie"
        );
      }
    }
    return zapiszStorage(zapis).catch(function pomińBłądZapisu() {});
  }

  function zsynchronizujWybórTerminuHarmonogramuZSemper() {
    const kandydaci = pobierzKandydatówSemperHarmonogramu();
    if (wybranyTerminHarmonogramuBur && wybranyTerminHarmonogramuBur.źródło === "semper") {
      const nadalIstnieje = kandydaci.find(function sprawdź(termin) {
        return przestrzeń.czyTenSamTerminHarmonogramu(termin, wybranyTerminHarmonogramuBur);
      });
      if (!nadalIstnieje) {
        ustawTerminHarmonogramu(null, { cicho: true });
        return;
      }
      wybranyTerminHarmonogramuBur = Object.assign({}, nadalIstnieje);
      zapiszStorage({ wybranyTerminHarmonogramuBur: wybranyTerminHarmonogramuBur }).catch(function pomińBłądZapisu() {});
    }
    if (!wybranyTerminHarmonogramuBur && kandydaci.length === 1) {
      ustawTerminHarmonogramu(kandydaci[0], { cicho: true, zachowajPrzygotowany: true });
      return;
    }
    renderujListęTerminówHarmonogramu();
  }

  function zsynchronizujWybórTerminuHarmonogramuZKolejką(terminy) {
    ostatnieTerminyKolejkiBur = Array.isArray(terminy) ? terminy.slice() : [];
    if (wybranyTerminHarmonogramuBur && wybranyTerminHarmonogramuBur.źródło === "kolejka") {
      const kandydaci = pobierzKandydatówKolejkiHarmonogramu();
      const nadalIstnieje = kandydaci.some(function sprawdź(termin) {
        return przestrzeń.czyTenSamTerminHarmonogramu(termin, wybranyTerminHarmonogramuBur);
      });
      if (!nadalIstnieje) {
        ustawTerminHarmonogramu(null, { cicho: true });
        return;
      }
    }
    renderujListęTerminówHarmonogramu();
  }

  function pokażAktualnyTerminBur(terminBur) {
    const daty = przestrzeń.pobierzDatyTerminuBur(terminBur);
    const tytuł = String(terminBur && terminBur.tytuł || "").replace(/\s+/g, " ").trim();
    aktualnyTerminBur = terminBur && daty.dataRozpoczęcia && daty.dataZakończenia ? terminBur : null;
    elementy.aktualnyTytułBur.textContent = tytuł || "Brak tytułu usługi";
    elementy.aktualnyTytułBur.title = tytuł || "Brak tytułu usługi";

    if (!aktualnyTerminBur) {
      elementy.aktualnyZakresBur.textContent = "Nie wybrano terminu";
      elementy.aktualneSzczegółyBur.textContent = "";
      elementy.aktualneSzczegółyBur.classList.add("ukryty");
      elementy.aktualnyTerminBur.classList.remove("ukryty");
      odświeżZgodnośćTerminuHarmonogramu();
      renderujListęTerminówHarmonogramu();
      return;
    }

    const tryb = przestrzeń.normalizujTrybTerminu(aktualnyTerminBur.tryb);
    const lokalizacjaLubTryb = tryb === "online"
      ? "Online"
      : (aktualnyTerminBur.lokalizacja || (tryb === "stacjonarny" ? "stacjonarna" : ""));
    const zakres = przestrzeń.formatujZakresDatPrezentacyjny(daty.dataRozpoczęcia, daty.dataZakończenia);
    elementy.aktualnyZakresBur.textContent = [zakres, lokalizacjaLubTryb].filter(Boolean).join(" · ");
    elementy.aktualneSzczegółyBur.textContent = "";
    elementy.aktualneSzczegółyBur.classList.add("ukryty");
    elementy.aktualnyTerminBur.classList.remove("ukryty");
    odświeżZgodnośćTerminuHarmonogramu();
    renderujListęTerminówHarmonogramu();
  }

  function czyWybranyTerminJestWłaściwyDlaBur() {
    const indeks = ostatniWybranyTerminSemperIndex;

    if (!Number.isInteger(indeks) || !aktualnyTerminBur || !ostatnieTerminySemper[indeks]
      || !przestrzeń.czyDatyTerminówZgodne(ostatnieTerminySemper[indeks], aktualnyTerminBur)) {
      return false;
    }

    if (stanDopasowaniaTerminuBur.status === "dopasowany") {
      return stanDopasowaniaTerminuBur.indeks === indeks;
    }

    return stanDopasowaniaTerminuBur.status === "niejednoznaczny"
      && źródłoWyboruTerminuSemper === "ręczny"
      && stanDopasowaniaTerminuBur.indeksy.includes(indeks);
  }

  function pokażStatusDopasowaniaTerminu() {
    const wybrany = Number.isInteger(ostatniWybranyTerminSemperIndex)
      ? ostatnieTerminySemper[ostatniWybranyTerminSemperIndex]
      : null;
    const zakresBur = aktualnyTerminBur
      ? przestrzeń.formatujZakresDatPrezentacyjny(
        przestrzeń.pobierzDatyTerminuBur(aktualnyTerminBur).dataRozpoczęcia,
        przestrzeń.pobierzDatyTerminuBur(aktualnyTerminBur).dataZakończenia
      )
      : "";

    if (!aktualnyTerminBur) {
      ustawStatus(elementy.statusDopasowaniaTerminu, "Nie odczytano jeszcze dat z formularza BUR.", "status-neutralny");
    } else if (wybrany && !przestrzeń.czyDatyTerminówZgodne(wybrany, aktualnyTerminBur)) {
      ustawStatus(elementy.statusDopasowaniaTerminu, "Wybrany ręcznie termin SEMPER jest niezgodny z aktualnymi datami BUR: " + zakresBur + ".", "status-ostrzezenie");
    } else if (czyWybranyTerminJestWłaściwyDlaBur()) {
      ustawStatus(elementy.statusDopasowaniaTerminu, źródłoWyboruTerminuSemper === "automatyczny" ? "Automatycznie dopasowano termin SEMPER do BUR." : "Wybrany termin jest zgodny z aktualnym terminem BUR.", "status-odczytano");
    } else if (wybrany) {
      ustawStatus(elementy.statusDopasowaniaTerminu, "Wybrany ręcznie termin SEMPER nie jest zgodny z rozpoznanym trybem lub lokalizacją BUR.", "status-ostrzezenie");
    } else if (stanDopasowaniaTerminuBur.status === "niejednoznaczny") {
      ustawStatus(elementy.statusDopasowaniaTerminu, "Znaleziono kilka terminów SEMPER zgodnych z datą aktualnej usługi BUR. Wybierz właściwą lokalizację lub tryb.", "status-ostrzezenie");
    } else if (stanDopasowaniaTerminuBur.status === "brak") {
      ustawStatus(elementy.statusDopasowaniaTerminu, "Nie znaleziono terminu SEMPER zgodnego z aktualnym terminem BUR: " + zakresBur + ".", "status-ostrzezenie");
    } else {
      ustawStatus(elementy.statusDopasowaniaTerminu, "Wczytaj terminy SEMPER, aby wykonać dopasowanie.", "status-neutralny");
    }
  }

  function renderujWybórNiejednoznacznegoTerminu() {
    const kontener = elementy.wybórNiejednoznacznegoTerminu;
    kontener.textContent = "";

    if (stanDopasowaniaTerminuBur.status !== "niejednoznaczny" || czyWybranyTerminJestWłaściwyDlaBur()) {
      kontener.classList.add("ukryty");
      return;
    }

    const daty = aktualnyTerminBur && przestrzeń.pobierzDatyTerminuBur(aktualnyTerminBur);
    const kandydaci = stanDopasowaniaTerminuBur.indeksy
      .filter(function zachowajIstniejące(indeks) { return Boolean(ostatnieTerminySemper[indeks]); });

    if (!daty || !kandydaci.length) {
      kontener.classList.add("ukryty");
      return;
    }

    const nagłówek = document.createElement("h3");
    const przyciski = document.createElement("div");
    nagłówek.textContent = "Wybierz termin dla " + przestrzeń.formatujZakresDatPrezentacyjny(daty.dataRozpoczęcia, daty.dataZakończenia);
    przyciski.className = "przyciski-wyboru-niejednoznacznego";

    kandydaci.forEach(function dodajKandydata(indeks) {
      const przycisk = document.createElement("button");
      przycisk.type = "button";
      przycisk.dataset.indeksKandydata = String(indeks);
      przycisk.textContent = przestrzeń.opiszWariantTerminuSemper(ostatnieTerminySemper[indeks]);
      przycisk.addEventListener("click", function wybierzKandydata() {
        elementy.wybórTerminuSemper.value = String(indeks);
        zapiszWybórTerminuSemper("ręczny");
      });
      przyciski.appendChild(przycisk);
    });

    kontener.appendChild(nagłówek);
    kontener.appendChild(przyciski);
    kontener.classList.remove("ukryty");
  }

  function renderujListęTerminówSemper() {
    const grupy = przestrzeń.grupujTerminySemper(ostatnieTerminySemper, filtrTerminówSemper);
    elementy.listaTerminówSemper.textContent = "";

    if (!grupy.length) {
      const pustaLista = document.createElement("p");
      pustaLista.className = "pusta-lista-terminow";
      pustaLista.textContent = ostatnieTerminySemper.length ? "Brak terminów dla wybranego filtra." : "Brak zaimportowanych terminów.";
      elementy.listaTerminówSemper.appendChild(pustaLista);
      renderujWybórNiejednoznacznegoTerminu();
      return;
    }

    grupy.forEach(function dodajGrupę(grupa) {
      const sekcja = document.createElement("section");
      const nagłówek = document.createElement("h3");
      sekcja.className = "grupa-terminow";
      nagłówek.className = "naglowek-grupy-terminow";
      nagłówek.textContent = grupa.etykieta;
      sekcja.appendChild(nagłówek);

      grupa.pozycje.forEach(function dodajTermin(pozycja) {
        const przycisk = document.createElement("button");
        const opis = document.createElement("span");
        const zgodnyZBur = aktualnyTerminBur && przestrzeń.czyDatyTerminówZgodne(pozycja.termin, aktualnyTerminBur);
        const wybranyJakoWłaściwy = pozycja.indeks === ostatniWybranyTerminSemperIndex && czyWybranyTerminJestWłaściwyDlaBur();
        przycisk.type = "button";
        przycisk.className = "pozycja-terminu-semper" + (pozycja.indeks === ostatniWybranyTerminSemperIndex ? " wybrany" : "");
        przycisk.dataset.indeksTerminu = String(pozycja.indeks);
        przycisk.setAttribute("aria-pressed", pozycja.indeks === ostatniWybranyTerminSemperIndex ? "true" : "false");
        opis.textContent = przestrzeń.opiszTerminSemper(pozycja.termin, pozycja.indeks);
        przycisk.appendChild(opis);
        if (wybranyJakoWłaściwy || zgodnyZBur) {
          const oznaczenie = document.createElement("span");
          oznaczenie.className = wybranyJakoWłaściwy ? "oznaczenie-bur" : "oznaczenie-zgodnej-daty";
          oznaczenie.textContent = wybranyJakoWłaściwy ? "✓ BUR" : "zgodna data";
          przycisk.appendChild(oznaczenie);
        }
        przycisk.addEventListener("click", function wybierzRęcznie() {
          elementy.wybórTerminuSemper.value = String(pozycja.indeks);
          zapiszWybórTerminuSemper("ręczny");
        });
        sekcja.appendChild(przycisk);
      });
      elementy.listaTerminówSemper.appendChild(sekcja);
    });
    renderujWybórNiejednoznacznegoTerminu();
  }

  function ustawFiltrTerminówSemper(filtr) {
    filtrTerminówSemper = filtr || "wszystkie";
    document.querySelectorAll("[data-filtr-terminow]").forEach(function oznaczFiltr(przycisk) {
      przycisk.setAttribute("aria-pressed", przycisk.dataset.filtrTerminow === filtrTerminówSemper ? "true" : "false");
    });
    renderujListęTerminówSemper();
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
      renderujListęTerminówSemper();
      pokażStatusDopasowaniaTerminu();
      odświeżDostępnośćWypełniania();
      zsynchronizujWybórTerminuHarmonogramuZSemper();
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
    renderujListęTerminówSemper();
    pokażStatusDopasowaniaTerminu();
    odświeżDostępnośćWypełniania();
    zsynchronizujWybórTerminuHarmonogramuZSemper();
  }

  function zapiszWybórTerminuSemper(źródło) {
    const wartość = elementy.wybórTerminuSemper.value;
    const indeks = wartość === "" ? null : Number(wartość);
    const poprzedniIndeks = ostatniWybranyTerminSemperIndex;
    const czyZmienionoTermin = poprzedniIndeks !== indeks;

    ostatniWybranyTerminSemperIndex = indeks;
    źródłoWyboruTerminuSemper = źródło || "ręczny";
    renderujListęTerminówSemper();
    pokażStatusDopasowaniaTerminu();
    odświeżDostępnośćWypełniania();

    if (!czyZmienionoTermin) {
      zapiszStorage({
        wybranyTerminSemperIndex: indeks,
        źródłoWyboruTerminuSemper: źródłoWyboruTerminuSemper,
        zgodnośćWybranegoTerminuBur: Boolean(ostatnieTerminySemper[indeks] && aktualnyTerminBur && przestrzeń.czyDatyTerminówZgodne(ostatnieTerminySemper[indeks], aktualnyTerminBur))
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
        źródłoWyboruTerminuSemper: źródłoWyboruTerminuSemper,
        zgodnośćWybranegoTerminuBur: Boolean(termin && aktualnyTerminBur && przestrzeń.czyDatyTerminówZgodne(termin, aktualnyTerminBur))
      }).then(function odświeżWidok() {
        if (szkolenie) {
          pokażSzkolenie({ szkolenie: szkolenie, ostrzeżenia: ostrzeżenia, wybranyTerminSemperIndex: indeks });
        }
      });
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
    aktualnyTerminBur = null;
    stanDopasowaniaTerminuBur = { status: "brak-dat-bur", indeks: null, indeksy: [] };
    źródłoWyboruTerminuSemper = "brak";
    pokażAktualnyTerminBur(null);
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

    if (/^https:\/\/(?:[^./]+\.)*uslugirozwojowe\.parp\.gov\.pl\//i.test(url || "")) {
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
        const błądRuntime = chrome.runtime.lastError;

        if (błądRuntime) {
          reject(new Error(błądRuntime.message || komunikatBrakuSkryptu));
          return;
        }

        resolve(odpowiedź);
      });
    });
  }

  function sprawdźPołączenieKarty(karta) {
    return wyślijDoKarty(karta, { typ: komunikaty.PING_SKRYPTU_STRONY }).then(function sprawdźPong(odpowiedź) {
      if (!odpowiedź || odpowiedź.typ !== komunikaty.PONG_SKRYPTU_STRONY) {
        throw new Error("Skrypt strony nie odpowiedział poprawnym komunikatem PONG.");
      }

      return odpowiedź;
    });
  }

  function wstrzyknijContentBur(karta) {
    if (!karta || !karta.id || rozpoznajTypStrony(karta.url) !== "BUR") {
      return Promise.reject(new Error("Nie można wstrzyknąć skryptu do nieobsługiwanej karty."));
    }

    if (!chrome.scripting || !chrome.scripting.executeScript) {
      return Promise.reject(new Error("Brak dostępu do chrome.scripting — przeładuj rozszerzenie."));
    }

    const wstrzyknięcieCss = chrome.scripting.insertCSS
      ? chrome.scripting.insertCSS({
        target: { tabId: karta.id },
        files: styleContentBur
      }).catch(function pomińBłądCss() {})
      : Promise.resolve();

    return wstrzyknięcieCss
      .then(function wstrzyknijPliki() {
        return chrome.scripting.executeScript({
          target: { tabId: karta.id },
          files: plikiContentBur
        });
      })
      .then(function poczekajNaListener() {
        return new Promise(function opóźnij(resolve) {
          setTimeout(resolve, 120);
        });
      });
  }

  function zapewnijSkryptStrony(karta) {
    return sprawdźPołączenieKarty(karta).catch(function spróbujPonownie(pierwszyBłąd) {
      if (rozpoznajTypStrony(karta && karta.url) !== "BUR") {
        throw pierwszyBłąd;
      }

      return wstrzyknijContentBur(karta)
        .then(function sprawdźPoWstrzyknięciu() {
          return sprawdźPołączenieKarty(karta);
        })
        .catch(function zwróćDokładnyBłąd(błąd) {
          const szczegóły = błąd && błąd.message ? błąd.message : komunikatBrakuSkryptu;
          throw new Error("Nie udało się uruchomić skryptu BUR: " + szczegóły);
        });
    });
  }

  function bezpiecznieWyślijDoAktywnejKarty(komunikat) {
    return pobierzAktywnąKartę().then(function wyślij(karta) {
      if (!czyObsługiwanaKarta(karta)) {
        throw new Error("Aktywna karta nie jest obsługiwaną stroną BUR/SEMPER.");
      }

      return zapewnijSkryptStrony(karta).then(function wyślijPoPołączeniu() {
        return wyślijDoKarty(karta, komunikat);
      });
    });
  }

  function wyślijKomunikatKolejkiDoBur(komunikat) {
    return pobierzAktywnąKartę().then(function wyślij(karta) {
      if (!karta || rozpoznajTypStrony(karta.url) !== "BUR") {
        throw new Error("Otwórz kartę BUR, aby zarządzać kolejką terminów.");
      }
      return zapewnijSkryptStrony(karta).then(function wyślijPoPołączeniu() {
        return wyślijDoKarty(karta, komunikat);
      });
    }).then(function sprawdźOdpowiedź(odpowiedź) {
      if (!odpowiedź || odpowiedź.typ !== komunikaty.ODPOWIEDŹ_STAN_KOLEJKI_BUR) {
        throw new Error("Nie udało się odczytać kolejki terminów z karty BUR.");
      }
      if (odpowiedź.wynik && odpowiedź.wynik.błąd) {
        throw new Error(odpowiedź.wynik.błąd);
      }
      return odpowiedź.wynik || {};
    });
  }

  function renderujPodglądKolejkiTerminów() {
    const wynik = przestrzeń.parsujKolejkęTerminówBur(elementy.kolejkaTermowWejście.value);
    const liczby = przestrzeń.policzKolejkęTerminówBur(wynik);
    zsynchronizujWybórTerminuHarmonogramuZKolejką(wynik.terminy);
    elementy.kolejkaTermowPodsumowanie.textContent = "";
    [
      ["Stacjonarne", liczby.stacjonarne],
      ["Online", liczby.online],
      ["Łącznie", liczby.łącznie],
      ["Kart do otwarcia", liczby.karty]
    ].forEach(function dodajLicznik(dane) {
      const pozycja = document.createElement("span");
      pozycja.textContent = dane[0] + ": " + dane[1];
      elementy.kolejkaTermowPodsumowanie.appendChild(pozycja);
    });

    elementy.kolejkaTermowPodgląd.textContent = "";
    if (wynik.terminy.length) {
      const lista = document.createElement("ol");
      lista.className = "lista-podgladu-kolejki";
      wynik.terminy.forEach(function dodajTermin(termin) {
        const pozycja = document.createElement("li");
        const opis = document.createElement("span");
        const przycisk = document.createElement("button");
        const terminHarmonogramu = przestrzeń.utwórzTerminHarmonogramuZKolejki(termin);
        opis.textContent = przestrzeń.opiszTerminKolejkiBur(termin);
        przycisk.type = "button";
        przycisk.className = "uzyj-do-harmonogramu";
        przycisk.textContent = "Użyj do harmonogramu";
        przycisk.addEventListener("click", function wybierzZKolejki() {
          ustawTerminHarmonogramu(terminHarmonogramu).then(function przejdźDoHarmonogramu() {
            ustawAktywnąZakładkęPanelu("harmonogram", true, true);
          });
        });
        pozycja.appendChild(opis);
        pozycja.appendChild(przycisk);
        lista.appendChild(pozycja);
      });
      elementy.kolejkaTermowPodgląd.appendChild(lista);
    } else {
      elementy.kolejkaTermowPodgląd.textContent = "Brak poprawnie rozpoznanych terminów.";
    }

    elementy.kolejkaTermowBłędy.textContent = wynik.błędne.length
      ? "Wymagają poprawy: " + wynik.błędne.join(" | ")
      : "";
    elementy.kolejkaTermowBłędy.classList.toggle("ukryty", !wynik.błędne.length);
    return wynik;
  }

  function pokażStanKolejkiTerminów(stan, komunikat, klasa) {
    const dane = stan || {};
    elementy.kolejkaDzisiajDodane.textContent = String(dane.dzisiajDodane || 0);
    elementy.kolejkaŁącznieDodane.textContent = String(dane.łącznieDodane || 0);
    if (dane.suroweTerminy !== undefined) {
      elementy.kolejkaTermowWejście.value = dane.suroweTerminy;
    }
    renderujPodglądKolejkiTerminów();
    ustawStatus(elementy.statusKolejkiTerminów, komunikat || "Kolejka BUR jest gotowa.", klasa || "status-neutralny");
  }

  function odświeżKolejkęTerminówBur() {
    return wyślijKomunikatKolejkiDoBur({ typ: komunikaty.POBIERZ_STAN_KOLEJKI_BUR })
      .then(function pokaż(stan) { pokażStanKolejkiTerminów(stan); return stan; })
      .catch(function pokażBłąd(błąd) {
        ustawStatus(elementy.statusKolejkiTerminów, błąd.message, "status-ostrzezenie");
      });
  }

  function zapiszKolejkęTerminówBur(czyNoweSzkolenie, czyMaStacjonarne) {
    const wynik = renderujPodglądKolejkiTerminów();
    if (!wynik.terminy.length || wynik.błędne.length) {
      ustawStatus(elementy.statusKolejkiTerminów, "Popraw nierozpoznane pozycje przed zapisaniem kolejki.", "status-ostrzezenie");
      return;
    }
    const maTerminyStacjonarne = czyMaStacjonarne === undefined
      ? wynik.terminy.some(function stacjonarny(termin) { return !termin.online; })
      : czyMaStacjonarne;
    const typ = czyNoweSzkolenie ? komunikaty.USTAW_TRYB_NOWEGO_SZKOLENIA_BUR : komunikaty.ZAPISZ_KOLEJKĘ_BUR;
    wyślijKomunikatKolejkiDoBur({ typ: typ, suroweTerminy: elementy.kolejkaTermowWejście.value, czyMaStacjonarne: maTerminyStacjonarne })
      .then(function pokaż(stan) {
        pokażStanKolejkiTerminów(stan, czyNoweSzkolenie ? "Ustawiono tryb Nowe szkolenie i zresetowano kolejkę." : "Zapisano i przygotowano kolejkę.", "status-odczytano");
      })
      .catch(function pokażBłąd(błąd) { ustawStatus(elementy.statusKolejkiTerminów, błąd.message, "status-blad"); });
  }

  function resetujKolejkęTerminówBur() {
    wyślijKomunikatKolejkiDoBur({ typ: komunikaty.RESETUJ_KOLEJKĘ_BUR })
      .then(function pokaż(stan) { pokażStanKolejkiTerminów(stan, "Kolejka została zresetowana.", "status-odczytano"); })
      .catch(function pokażBłąd(błąd) { ustawStatus(elementy.statusKolejkiTerminów, błąd.message, "status-blad"); });
  }

  function skorygujDziennyLicznikBur() {
    const wartość = window.prompt("Podaj nową wartość dziennego licznika:", elementy.kolejkaDzisiajDodane.textContent || "0");
    if (wartość === null) {
      return;
    }
    wyślijKomunikatKolejkiDoBur({ typ: komunikaty.SKORYGUJ_DZIENNY_LICZNIK_BUR, wartość: wartość })
      .then(function pokaż(stan) { pokażStanKolejkiTerminów(stan, "Skorygowano dzienny licznik.", "status-odczytano"); })
      .catch(function pokażBłąd(błąd) { ustawStatus(elementy.statusKolejkiTerminów, błąd.message, "status-blad"); });
  }

  function resetujLicznikiKolejkiBur() {
    if (!window.confirm("Czy zresetować dzienny i łączny licznik?")) {
      return;
    }
    wyślijKomunikatKolejkiDoBur({ typ: komunikaty.RESETUJ_LICZNIKI_BUR })
      .then(function pokaż(stan) { pokażStanKolejkiTerminów(stan, "Zresetowano liczniki.", "status-odczytano"); })
      .catch(function pokażBłąd(błąd) { ustawStatus(elementy.statusKolejkiTerminów, błąd.message, "status-blad"); });
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

  function pobierzAktualnyTerminBurZKarty() {
    return pobierzAktywnąKartę().then(function odczytajZKarty(karta) {
      if (!karta || rozpoznajTypStrony(karta.url) !== "BUR") {
        return null;
      }
      return zapewnijSkryptStrony(karta).then(function wyślijŻądanie() {
        return wyślijDoKarty(karta, { typ: komunikaty.POBIERZ_AKTUALNY_TERMIN_BUR });
      }).then(function pobierzWynik(odpowiedź) {
        return odpowiedź && odpowiedź.typ === komunikaty.ODPOWIEDŹ_AKTUALNY_TERMIN_BUR
          ? odpowiedź.wynik || null
          : null;
      });
    });
  }

  function synchronizujAktualnyTerminBur(czyWymusićDopasowanie) {
    return Promise.all([
      pobierzAktualnyTerminBurZKarty(),
      odczytajStorage([
        "ostatnieSzkolenieSemper",
        "wybranyTerminSemperIndex",
        "odciskAktualnegoTerminuBur",
        "źródłoWyboruTerminuSemper",
        "harmonogramBurPrzygotowany"
      ])
    ]).then(function zastosujSynchronizację(wyniki) {
      const terminBur = wyniki[0];
      const dane = wyniki[1] || {};
      const datyBur = przestrzeń.pobierzDatyTerminuBur(terminBur);

      pokażAktualnyTerminBur(terminBur);
      if (!terminBur || !datyBur.dataRozpoczęcia || !datyBur.dataZakończenia) {
        stanDopasowaniaTerminuBur = { status: "brak-dat-bur", indeks: null, indeksy: [] };
        pokażStatusDopasowaniaTerminu();
        renderujListęTerminówSemper();
        return { terminBur: terminBur, dopasowanie: stanDopasowaniaTerminuBur };
      }

      const szkolenie = dane.ostatnieSzkolenieSemper || {};
      const terminy = Array.isArray(szkolenie.terminy) ? szkolenie.terminy : [];
      const nowyOdcisk = przestrzeń.utwórzOdciskTerminuBur(terminBur);
      const poprzedniOdcisk = dane.odciskAktualnegoTerminuBur || "";
      const czyZmienionoKontekst = Boolean(
        (poprzedniOdcisk && poprzedniOdcisk !== nowyOdcisk)
        || (!poprzedniOdcisk && dane.harmonogramBurPrzygotowany)
      );
      let wybranyIndeks = Number.isInteger(dane.wybranyTerminSemperIndex) ? dane.wybranyTerminSemperIndex : null;
      let źródło = dane.źródłoWyboruTerminuSemper || "brak";
      const poprzedniIndeks = wybranyIndeks;
      stanDopasowaniaTerminuBur = przestrzeń.dopasujTerminSemperDoBur(terminy, terminBur);

      if (stanDopasowaniaTerminuBur.status === "dopasowany") {
        const zachowajWybórRęczny = !czyZmienionoKontekst && !czyWymusićDopasowanie && źródło === "ręczny" && Number.isInteger(wybranyIndeks);
        if (!zachowajWybórRęczny) {
          wybranyIndeks = stanDopasowaniaTerminuBur.indeks;
          źródło = "automatyczny";
        }
        if (!zachowajWybórRęczny && filtrTerminówSemper !== "wszystkie" && !przestrzeń.filtrujTerminySemper(terminy, filtrTerminówSemper).some(function widoczny(pozycja) { return pozycja.indeks === wybranyIndeks; })) {
          ustawFiltrTerminówSemper("wszystkie");
        }
      } else if (stanDopasowaniaTerminuBur.status === "niejednoznaczny") {
        const ręcznyWybórNadalPasuje = !czyZmienionoKontekst
          && źródło === "ręczny"
          && stanDopasowaniaTerminuBur.indeksy.includes(wybranyIndeks);
        if (!ręcznyWybórNadalPasuje) {
          wybranyIndeks = null;
          źródło = "brak";
        }
      } else if (czyZmienionoKontekst) {
        źródło = "zapamiętany-niezgodny";
      }

      const wybranyTermin = Number.isInteger(wybranyIndeks) ? terminy[wybranyIndeks] : null;
      const zgodnyZBur = Boolean(wybranyTermin && przestrzeń.czyDatyTerminówZgodne(wybranyTermin, terminBur));
      źródłoWyboruTerminuSemper = źródło;

      return zapiszStorage({
        aktualnyTerminBur: terminBur,
        odciskAktualnegoTerminuBur: nowyOdcisk,
        wybranyTerminSemperIndex: wybranyIndeks,
        źródłoWyboruTerminuSemper: źródło,
        zgodnośćWybranegoTerminuBur: zgodnyZBur
      }).then(function odświeżPoSynchronizacji() {
        pokażWybórTerminuSemper(terminy, wybranyIndeks);
        odświeżZgodnośćTerminuHarmonogramu();
        return { terminBur: terminBur, dopasowanie: stanDopasowaniaTerminuBur, wybranyIndeks: wybranyIndeks };
      });
    });
  }

  function zapiszStanSesjiWalidacji() {
    if (!chrome.storage.session) {
      return Promise.resolve();
    }
    return new Promise(function utwórzPromise(resolve) {
      chrome.storage.session.set({
        stanWalidacjiBur: {
          wynik: ostatniWynikWalidacjiBur,
          pozycjaPrzewijania: document.documentElement.scrollTop || document.body.scrollTop || 0
        }
      }, resolve);
    });
  }

  function odczytajStanSesjiWalidacji() {
    if (!chrome.storage.session) {
      return;
    }
    chrome.storage.session.get(["stanWalidacjiBur"], function pokażStan(dane) {
      const stan = dane && dane.stanWalidacjiBur;
      if (!stan || !stan.wynik) {
        return;
      }
      ostatniWynikWalidacjiBur = stan.wynik;
      pokażWynikWalidacjiBur(stan.wynik, false);
      requestAnimationFrame(function przywróćPrzewijanie() {
        window.scrollTo(0, stan.pozycjaPrzewijania || 0);
      });
    });
  }

  function ustawAktywnąZakładkęPanelu(zakładka, zapiszStan, wybórRęczny) {
    const dozwolone = ["semper", "terminy", "checklista", "harmonogram", "diagnostyka"];
    aktywnaZakładkaPanelu = dozwolone.includes(zakładka) ? zakładka : "semper";
    if (wybórRęczny === true) {
      czyUżytkownikWybrałZakładkę = true;
    }
    document.body.dataset.aktywnaZakladka = aktywnaZakładkaPanelu;
    document.querySelectorAll("[data-przelacz-zakladke]").forEach(function ustawPrzycisk(przycisk) {
      przycisk.setAttribute("aria-pressed", String(przycisk.dataset.przelaczZakladke === aktywnaZakładkaPanelu));
    });
    if (zapiszStan !== false && chrome.storage.session) {
      chrome.storage.session.set({ stanPaneluBur: {
        aktywnaZakładka: aktywnaZakładkaPanelu,
        wybranaRęcznie: czyUżytkownikWybrałZakładkę
      } });
    }
    if (aktywnaZakładkaPanelu === "terminy") {
      odświeżKolejkęTerminówBur();
    }
  }

  function wybierzZakładkęDlaKarty(karta) {
    const url = String(karta && karta.url || "");
    if (rozpoznajTypStrony(url) === "SEMPER") {
      return "semper";
    }
    if (rozpoznajTypStrony(url) === "BUR") {
      return /lista|list|uslugi\/?(?:\?|$)/i.test(url) ? "terminy" : "checklista";
    }
    return aktywnaZakładkaPanelu;
  }

  function odczytajStanPanelu() {
    if (!chrome.storage.session) {
      return;
    }
    chrome.storage.session.get(["stanPaneluBur"], function przywróćStan(dane) {
      const stan = dane && dane.stanPaneluBur;
      if (!stan || !stan.aktywnaZakładka) {
        return;
      }
      czyUżytkownikWybrałZakładkę = stan.wybranaRęcznie !== false;
      ustawAktywnąZakładkęPanelu(stan.aktywnaZakładka, false);
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

        return zapewnijSkryptStrony(karta).then(function pobierzStanPoPołączeniu() {
          return wyślijDoKarty(karta, { typ: komunikaty.SPRAWDŹ_PROGRAM_I_HARMONOGRAM_BUR });
        });
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

  function zbudujOstrzeżeniaHarmonogramu(terminHarmonogramu, daty, tytuł, temat) {
    const ostrzeżenia = [];
    const tytułOczyszczony = String(tytuł || "").replace(/\s+/g, " ").trim();

    if (!czyDatySąKolejne(daty)) {
      ostrzeżenia.push("Daty harmonogramu nie są kolejnymi dniami.");
    }

    if (tytułOczyszczony && temat !== tytułOczyszczony) {
      ostrzeżenia.push("Temat został skrócony do pola harmonogramu.");
    }

    if (!terminHarmonogramu || !terminHarmonogramu.dataRozpoczęcia || !terminHarmonogramu.dataZakończenia) {
      ostrzeżenia.push("Nietypowy termin — sprawdź harmonogram przed importem.");
    }

    return ostrzeżenia;
  }

  function zbudujDaneProgramuHarmonogramu() {
    return odczytajStorage(["ostatnieSzkolenieSemper", "wybranyTerminHarmonogramuBur"]).then(function zbuduj(dane) {
      const szkolenie = dane.ostatnieSzkolenieSemper;
      let terminHarmonogramu = wybranyTerminHarmonogramuBur || dane.wybranyTerminHarmonogramuBur;

      if (!szkolenie) {
        throw new Error("Najpierw zaimportuj dane z SEMPER, aby ustalić temat harmonogramu.");
      }

      if (!terminHarmonogramu) {
        const terminySemper = Array.isArray(szkolenie.terminy) ? szkolenie.terminy : [];
        if (terminySemper.length === 1) {
          terminHarmonogramu = przestrzeń.utwórzTerminHarmonogramuZeSemper(terminySemper[0], 0);
          wybranyTerminHarmonogramuBur = terminHarmonogramu;
          zapiszStorage({ wybranyTerminHarmonogramuBur: terminHarmonogramu }).catch(function pomińBłądZapisu() {});
          renderujListęTerminówHarmonogramu();
        } else {
          throw new Error("Wybierz termin, dla którego przygotować harmonogram.");
        }
      }

      const datyTerminu = przestrzeń.pobierzDatyTerminuHarmonogramu(terminHarmonogramu);
      const daty = przestrzeń.zbudujDatyZakresu(datyTerminu.dataRozpoczęcia, datyTerminu.dataZakończenia);

      if (daty.length === 0) {
        throw new Error("Nie udało się ustalić dat wybranego terminu harmonogramu.");
      }

      const tytułHarmonogramu = pobierzTytułHarmonogramu(szkolenie);
      const tematSzkolenia = przestrzeń.przygotujTematHarmonogramu(tytułHarmonogramu);
      const czyOnline = terminHarmonogramu.tryb === "online";
      const pozycje = przestrzeń.zbudujPozycjeHarmonogramu({
        tematSzkolenia: tematSzkolenia,
        daty: daty,
        czyOnline: czyOnline,
        emailTrenera: przestrzeń.EMAIL_TRENERA_HARMONOGRAMU,
        emailWalidatora: przestrzeń.EMAIL_WALIDATORA_HARMONOGRAMU
      });
      const ostrzeżenia = zbudujOstrzeżeniaHarmonogramu(terminHarmonogramu, daty, tytułHarmonogramu, tematSzkolenia);

      return {
        program: szkolenie.sekcje ? szkolenie.sekcje.program : "",
        tematSzkolenia: tematSzkolenia,
        terminHarmonogramu: terminHarmonogramu,
        opisTerminu: przestrzeń.opiszTerminHarmonogramu(terminHarmonogramu),
        indeksTerminu: Number.isInteger(terminHarmonogramu.indeksSemper) ? terminHarmonogramu.indeksSemper : null,
        tryb: terminHarmonogramu.tryb || (czyOnline ? "online" : "stacjonarny"),
        źródłoTerminu: terminHarmonogramu.źródło || "",
        ostrzeżenia: ostrzeżenia,
        pozycje: pozycje
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
      ["Termin harmonogramu", dane.opisTerminu || (dane.kontekstTerminu ? przestrzeń.opiszTerminHarmonogramu(dane.kontekstTerminu) : "-")],
      ["Źródło", dane.źródłoTerminu || (dane.kontekstTerminu && dane.kontekstTerminu.źródło) || "-"],
      ["Tryb", dane.tryb || (dane.kontekstTerminu && dane.kontekstTerminu.tryb) || "-"],
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
    const kontekstTerminu = Object.assign({}, dane.terminHarmonogramu || {});
    const datyTerminu = przestrzeń.pobierzDatyTerminuHarmonogramu(kontekstTerminu);
    return zapiszStorage({
      ostatniePozycjeHarmonogramuBur: dane.pozycje,
      ostatniWybranyTerminHarmonogramuBur: dane.indeksTerminu,
      ostatnieOstrzeżeniaHarmonogramuBur: dane.ostrzeżenia || [],
      ostrzezeniaHarmonogramuBur: dane.ostrzeżenia || [],
      harmonogramBurPrzygotowany: true,
      harmonogramBurNieaktualny: false,
      harmonogramBurPrzygotowanyAt: new Date().toISOString(),
      datyPrzygotowanegoHarmonogramuBur: datyTerminu,
      kontekstPrzygotowanegoHarmonogramuBur: kontekstTerminu,
      odciskTerminuBurPrzygotowanegoHarmonogramu: ""
    });
  }

  function odczytajPrzygotowanyHarmonogram() {
    return odczytajStorage([
      "ostatniePozycjeHarmonogramuBur",
      "ostatniWybranyTerminHarmonogramuBur",
      "ostatnieOstrzeżeniaHarmonogramuBur",
      "ostrzezeniaHarmonogramuBur",
      "harmonogramBurPrzygotowany",
      "harmonogramBurNieaktualny",
      "harmonogramBurPrzygotowanyAt",
      "datyPrzygotowanegoHarmonogramuBur",
      "kontekstPrzygotowanegoHarmonogramuBur"
    ]).then(function sprawdź(dane) {
      const gotowość = przestrzeń.sprawdźGotowośćHarmonogramuBur(dane);

      if (!gotowość.ok) {
        throw new Error(gotowość.komunikat);
      }

      const kontekstTerminu = dane.kontekstPrzygotowanegoHarmonogramuBur || Object.assign({
        źródło: "legacy"
      }, dane.datyPrzygotowanegoHarmonogramuBur || {});

      return {
        pozycje: dane.ostatniePozycjeHarmonogramuBur,
        indeksTerminu: dane.ostatniWybranyTerminHarmonogramuBur,
        ostrzeżenia: dane.ostatnieOstrzeżeniaHarmonogramuBur || dane.ostrzezeniaHarmonogramuBur || [],
        przygotowanyAt: dane.harmonogramBurPrzygotowanyAt,
        terminHarmonogramu: dane.datyPrzygotowanegoHarmonogramuBur,
        kontekstTerminu: kontekstTerminu,
        opisTerminu: przestrzeń.opiszTerminHarmonogramu(kontekstTerminu),
        źródłoTerminu: kontekstTerminu.źródło || "",
        tryb: kontekstTerminu.tryb || ""
      };
    });
  }

  function zweryfikujPrzygotowanyHarmonogramZBur() {
    return synchronizujAktualnyTerminBur().then(function odczytajDatyPrzygotowania() {
      return odczytajStorage(["datyPrzygotowanegoHarmonogramuBur", "kontekstPrzygotowanegoHarmonogramuBur"]);
    }).then(function porównajDaty(dane) {
      const kontekst = dane.kontekstPrzygotowanegoHarmonogramuBur || Object.assign({
        źródło: "legacy"
      }, dane.datyPrzygotowanegoHarmonogramuBur || {});
      const zgodność = przestrzeń.sprawdźZgodnośćTerminuHarmonogramuZBur(kontekst, aktualnyTerminBur);
      if (!zgodność.ok) {
        const przygotowany = przestrzeń.opiszTerminHarmonogramu(kontekst);
        const edytowany = opiszAktualnyTerminBurDlaHarmonogramu();
        throw new Error(
          "NIE WPROWADZONO HARMONOGRAMU\n\nPrzygotowany:\n"
          + przygotowany
          + "\n\nEdytowany BUR:\n"
          + edytowany
          + "\n\nOtwórz właściwy termin BUR albo wybierz inny harmonogram."
        );
      }
      return true;
    });
  }

  function odświeżStanPrzygotowaniaHarmonogramu() {
    return odczytajStorage([
      "ostatniePozycjeHarmonogramuBur",
      "ostatniWybranyTerminHarmonogramuBur",
      "harmonogramBurPrzygotowany",
      "harmonogramBurNieaktualny",
      "kontekstPrzygotowanegoHarmonogramuBur"
    ]).then(function pokaż(dane) {
      const gotowość = przestrzeń.sprawdźGotowośćHarmonogramuBur(dane);

      elementy.przyciskImportujHarmonogramXlsx.disabled = !gotowość.ok;
      elementy.przyciskPobierzHarmonogramCsv.disabled = !gotowość.ok;
      elementy.przyciskWypełnijHarmonogramRęcznie.disabled = !gotowość.ok;

      if (!gotowość.ok && !dane.harmonogramBurPrzygotowany) {
        ustawStatusProgramuHarmonogramu("Brak przygotowanego harmonogramu.", "status-neutralny");
      } else if (!gotowość.ok) {
        ustawStatusProgramuHarmonogramu(gotowość.komunikat, "status-ostrzezenie");
      }
      odświeżZgodnośćTerminuHarmonogramu();
    }).catch(function pomińBłądStorage() {
      elementy.przyciskImportujHarmonogramXlsx.disabled = true;
      elementy.przyciskPobierzHarmonogramCsv.disabled = true;
      elementy.przyciskWypełnijHarmonogramRęcznie.disabled = true;
    });
  }

  function pokażDiagnostykęImportuHarmonogramu(diagnostyka) {
    if (!elementy.diagnostykaImportuHarmonogramu) {
      return;
    }

    if (!diagnostyka) {
      elementy.diagnostykaImportuHarmonogramu.textContent = "Brak danych diagnostycznych z formularza BUR.";
      return;
    }

    elementy.diagnostykaImportuHarmonogramu.textContent = JSON.stringify(diagnostyka, null, 2);
  }

  function pobierzPrzygotowanyCsvDoTestu() {
    ustawStatusProgramuHarmonogramu("Przygotowuję CSV do ręcznego testu...", "status-neutralny");

    odczytajPrzygotowanyHarmonogram()
      .then(function pobierzCsv(dane) {
        const nazwaPliku = przestrzeń.zbudujNazwęPlikuHarmonogramu(dane.kontekstTerminu || dane.terminHarmonogramu || {}, new Date(), "csv");
        if (typeof przestrzeń.wygenerujDaneCsvHarmonogramu !== "function") {
          throw new Error("Generator CSV nie jest dostępny w panelu.");
        }

        const bajtyCsv = przestrzeń.wygenerujDaneCsvHarmonogramu(dane.pozycje || []);
        const plik = new Blob([bajtyCsv], {
          type: "text/csv;charset=utf-8"
        });
        const url = URL.createObjectURL(plik);
        const link = document.createElement("a");

        link.href = url;
        link.download = nazwaPliku;
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(function zwolnijUrl() {
          URL.revokeObjectURL(url);
        }, 5000);

        pokażDiagnostykęImportuHarmonogramu({
          tryb: "ręczny test pliku",
          nazwaPliku: nazwaPliku,
          typPliku: plik.type,
          rozmiarPliku: plik.size,
          liczbaPozycji: Array.isArray(dane.pozycje) ? dane.pozycje.length : 0,
          instrukcja: "Kliknij ręcznie „Wybierz plik” w BUR i wskaż pobrany plik. Jeśli ręczny import zadziała, format CSV jest poprawny, a BUR ignoruje syntetyczne zdarzenia rozszerzenia."
        });

        ustawStatusProgramuHarmonogramu(
          "Pobrano " + nazwaPliku + ". Wybierz go teraz ręcznie przyciskiem „Wybierz plik” w BUR.",
          "status-odczytano"
        );
      })
      .catch(function pokażBłąd(błąd) {
        ustawStatusProgramuHarmonogramu(
          błąd && błąd.message ? błąd.message : "Nie udało się pobrać CSV.",
          "status-blad"
        );
      });
  }

  function zbudujKomunikatRaportuHarmonogramu(wynik) {
    const raport = wynik || {};
    const części = [];

    if (raport.istniejącePozycje) {
      części.push("W BUR istnieje już harmonogram. Stary harmonogram nie zostanie usunięty bez potwierdzenia.");
      części.push("Aktualne pozycje: " + (raport.liczbaPozycjiWTabeli || 0) + ". Przygotowane pozycje: " + (raport.liczbaOczekiwanychPozycji || 0) + ".");
    } else if (raport.częściowyImport) {
      części.push("Import częściowy — awaryjne wypełnianie ręczne zostało zablokowane.");
    } else if (raport.ok && raport.metoda === "CSV") {
      części.push("Wprowadzono przez import CSV.");
    } else if (raport.ok && raport.metoda === "fallback ręczny") {
      części.push("Wypełniono harmonogram ręcznie po użyciu osobnej akcji awaryjnej.");
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

    if (raport.błądXlsx) {
      części.push("Błąd wcześniejszego importu: " + raport.błądXlsx);
    }

    if (raport.błąd) {
      części.push("Błąd: " + raport.błąd);
    }

    if (Array.isArray(raport.ostrzeżenia) && raport.ostrzeżenia.length) {
      części.push("Wykryto " + raport.ostrzeżenia.length + " różnic do ręcznego sprawdzenia.");
    }

    if (raport.usunięto !== undefined && raport.nowyCsvZaimportowany) {
      części.push("Usunięto " + raport.usunięto + " poprzednich pozycji i zaimportowano nowy harmonogram.");
    }

    if (raport.usunięto !== undefined && raport.nowyCsvZaimportowany === false) {
      części.push("Usunięto " + raport.usunięto + " poprzednich pozycji, ale nowy CSV nie został zaimportowany.");
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
    przyciskUsuń.addEventListener("click", function potwierdźZamianę() {
      if (!window.confirm("Czy potwierdzasz usunięcie obecnego harmonogramu przed wprowadzeniem przygotowanego?")) {
        return;
      }

      wprowadźPrzygotowanyHarmonogramDoBur(komunikaty.ZASTĄP_HARMONOGRAM_BUR);
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
    const początekPrzygotowania = globalny.performance && typeof globalny.performance.now === "function"
      ? globalny.performance.now()
      : 0;
    wyczyśćDecyzjęHarmonogramuBur();
    ustawStatusProgramuHarmonogramu("Przygotowuję harmonogram...", "status-neutralny");

    zbudujDaneProgramuHarmonogramu()
      .then(function pokażWynik(dane) {
        pokażPodglądHarmonogramu(dane);
        return zapiszDaneHarmonogramu(dane).then(function pokaż() {
          elementy.przyciskImportujHarmonogramXlsx.disabled = false;
          elementy.przyciskPobierzHarmonogramCsv.disabled = false;
          elementy.przyciskWypełnijHarmonogramRęcznie.disabled = false;
          ustawStatusProgramuHarmonogramu("Harmonogram przygotowany. Sprawdź podgląd przed wprowadzeniem do BUR.", dane.ostrzeżenia.length ? "status-ostrzezenie" : "status-odczytano");
          if (globalny.__BUR_ASYSTENT_DIAGNOSTYKA_WYDAJNOŚCI__ && początekPrzygotowania) {
            console.debug("BUR Asystent: przygotowanie harmonogramu", Math.round(globalny.performance.now() - początekPrzygotowania) + " ms");
          }
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

    zweryfikujPrzygotowanyHarmonogramZBur()
      .then(odczytajPrzygotowanyHarmonogram)
      .then(function wyślij(dane) {
        pokażPodglądHarmonogramu(dane);

        return bezpiecznieWyślijDoAktywnejKarty({
          typ: typKomunikatu,
          pozycje: dane.pozycje,
          indeksTerminu: dane.indeksTerminu,
          przygotowanyAt: dane.przygotowanyAt,
          terminHarmonogramu: dane.terminHarmonogramu,
          kontekstTerminu: dane.kontekstTerminu
        });
      })
      .then(function pokażWynik(odpowiedź) {
        const wynik = odpowiedź && odpowiedź.wynik ? odpowiedź.wynik : {};
        const komunikat = zbudujKomunikatRaportuHarmonogramu(wynik);

        pokażDiagnostykęImportuHarmonogramu(wynik.diagnostyka || {
          komunikat: "Formularz BUR nie zwrócił szczegółowej diagnostyki.",
          wynik: wynik
        });

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

  function wyczyśćWynikWalidacjiBur(zapiszStan) {
    elementy.wynikWalidacjiBur.textContent = "";
    ostatniWynikWalidacjiBur = null;
    if (zapiszStan !== false) {
      zapiszStanSesjiWalidacji();
    }
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

  function przejdźDoPolaWalidacji(cel) {
    if (!cel) {
      ustawStatus(elementy.statusWalidacjiBur, "Nie znaleziono odpowiadającego pola w aktualnej wersji formularza BUR.", "status-ostrzezenie");
      return;
    }
    pobierzAktywnąKartę()
      .then(function sprawdźKartę(karta) {
        if (!karta || rozpoznajTypStrony(karta.url) !== "BUR") {
          throw new Error("Otwórz formularz BUR, aby przejść do pola.");
        }
        return wyślijDoKarty(karta, { typ: komunikaty.PRZEJDŹ_DO_POLA_BUR, cel: cel });
      })
      .then(function obsłużOdpowiedź(odpowiedź) {
        const wynik = odpowiedź && odpowiedź.wynik;
        if (!wynik || !wynik.ok) {
          throw new Error(wynik && wynik.błąd ? wynik.błąd : "Nie znaleziono odpowiadającego pola w aktualnej wersji formularza BUR.");
        }
        ustawStatus(elementy.statusWalidacjiBur, "Przejście do pola formularza BUR.", "status-odczytano");
      })
      .catch(function pokażBłąd(błąd) {
        ustawStatus(elementy.statusWalidacjiBur, błąd && błąd.message ? błąd.message : "Nie znaleziono odpowiadającego pola w aktualnej wersji formularza BUR.", "status-ostrzezenie");
      });
  }

  function pokażWynikWalidacjiBur(wynik, zapiszStan) {
    const pozycje = wynik && Array.isArray(wynik.pozycje) ? wynik.pozycje : [];
    const liczniki = policzPozycjeWalidacji(pozycje);
    const podsumowanie = document.createElement("div");
    const grupy = new Map();

    wyczyśćWynikWalidacjiBur(false);
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
        const element = document.createElement("button");
        const tytuł = document.createElement("strong");
        const komunikat = document.createElement("span");
        const wartości = document.createElement("span");

        element.type = "button";
        element.className = "pozycja-walidacji walidacja-" + pozycja.status;
        element.dataset.celFormularza = pozycja.celFormularza || "";
        element.setAttribute("aria-label", "Przejdź do pola: " + pozycja.pole);
        tytuł.textContent = pozycja.pole + " - " + pozycja.status;
        komunikat.textContent = pozycja.komunikat || "";
        wartości.textContent = "Aktualnie: " + (pozycja.aktualnaWartość || "-") + " | Oczekiwane: " + (pozycja.oczekiwanaWartość || "-");
        element.appendChild(tytuł);
        element.appendChild(komunikat);
        element.appendChild(wartości);
        element.addEventListener("click", function przejdźDoPola() {
          przejdźDoPolaWalidacji(pozycja.celFormularza);
        });
        sekcja.appendChild(element);
      });

      elementy.wynikWalidacjiBur.appendChild(sekcja);
    });

    ustawStatus(
      elementy.statusWalidacjiBur,
      "Walidacja zakończona: " + liczniki.błędy + " błędów, " + liczniki.ostrzeżenia + " ostrzeżeń, " + liczniki.poprawne + " poprawnych pól.",
      liczniki.błędy ? "status-blad" : (liczniki.ostrzeżenia ? "status-ostrzezenie" : "status-odczytano")
    );
    ostatniWynikWalidacjiBur = wynik;
    if (zapiszStan !== false) {
      zapiszStanSesjiWalidacji();
    }
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
    if (typ !== "BUR") {
      pokażAktualnyTerminBur(null);
    }
    if (!czyUżytkownikWybrałZakładkę) {
      ustawAktywnąZakładkęPanelu(wybierzZakładkęDlaKarty(karta), false);
    }

    if (typ === "Nieobsługiwana strona") {
      ustawStatus(elementy.statusStrony, typ, "status-ostrzezenie");
      elementy.przyciskPobierz.disabled = true;
      ustawDostępnośćWalidacji(false);
      return Promise.resolve();
    }

    return zapewnijSkryptStrony(karta)
      .then(function pokażPong(odpowiedź) {
        const typStrony = odpowiedź && odpowiedź.typStrony ? odpowiedź.typStrony : typ;
        const wersja = odpowiedź && odpowiedź.wersjaSkryptu ? " · " + odpowiedź.wersjaSkryptu : "";
        ustawStatus(elementy.statusStrony, typStrony + wersja, "status-odczytano");
        elementy.przyciskPobierz.disabled = false;
        ustawDostępnośćWalidacji(typStrony === "BUR");
        odświeżStanProgramuHarmonogramu();
        if (typStrony === "BUR") {
          synchronizujAktualnyTerminBur().catch(function pokażBrakSynchronizacji() {
            ustawStatus(elementy.statusDopasowaniaTerminu, "Nie udało się odczytać aktualnego terminu BUR.", "status-ostrzezenie");
          });
        }
      })
      .catch(function pokażŁagodnyBłąd(błąd) {
        const szczegóły = błąd && błąd.message ? " " + błąd.message : "";
        ustawStatus(elementy.statusStrony, "Nie udało się połączyć z formularzem BUR. Odśwież stronę i spróbuj ponownie." + szczegóły, "status-ostrzezenie");
        elementy.przyciskPobierz.disabled = false;
        ustawDostępnośćWalidacji(false);
        pokażStanProgramuHarmonogramu({});
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
      "wybranyTerminHarmonogramuBur",
      "ostatniePozycjeHarmonogramuBur",
      "ostatniWybranyTerminHarmonogramuBur",
      "ostatnieOstrzeżeniaHarmonogramuBur",
      "ostrzezeniaHarmonogramuBur",
      "harmonogramBurPrzygotowany",
      "harmonogramBurNieaktualny",
      "harmonogramBurPrzygotowanyAt",
      "datyPrzygotowanegoHarmonogramuBur",
      "kontekstPrzygotowanegoHarmonogramuBur",
      "odciskTerminuBurPrzygotowanegoHarmonogramu",
      "aktualnyTerminBur",
      "odciskAktualnegoTerminuBur",
      "źródłoWyboruTerminuSemper",
      "zgodnośćWybranegoTerminuBur"
    ];

    wyczyśćDane();
    wybranyTerminHarmonogramuBur = null;
    ostatnieTerminyKolejkiBur = [];
    renderujListęTerminówHarmonogramu();
    wyczyśćWynikiSemper();
    wyczyśćWynikWypełnianiaBur();
    wyczyśćWynikWalidacjiBur();
    wyczyśćDecyzjęHarmonogramuBur();
    pokażPodglądHarmonogramu({});
    elementy.linkLubFrazaSemper.value = "";
    elementy.przyciskImportujHarmonogramXlsx.disabled = true;
    elementy.przyciskPobierzHarmonogramCsv.disabled = true;
    elementy.przyciskWypełnijHarmonogramRęcznie.disabled = true;
    pokażDiagnostykęImportuHarmonogramu(null);
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
        synchronizujAktualnyTerminBur().catch(function pomińBrakFormularzaBur() {});
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
        const korektaPodstawyWpisu = odpowiedź && odpowiedź.wynik && odpowiedź.wynik.korektaPodstawyWpisu;
        if (!propozycje) { throw new Error("Nie udało się przygotować podglądu zmian BUR."); }
        podglądWypełnieniaBur = { propozycje: propozycje, kartaId: aktywnaOperacjaBur.identyfikatorKartyBur, indeksTerminu: aktywnaOperacjaBur.indeksTerminu, odciskSzkolenia: aktywnaOperacjaBur.odciskSzkolenia };
        aktywnaOperacjaBur = przestrzeń.przejdźOperacjęBur(aktywnaOperacjaBur, "oczekuje_na_zatwierdzenie");
        zapiszStorage({ podglądWypełnieniaBur: podglądWypełnieniaBur, aktywnaOperacjaBur: aktywnaOperacjaBur });
        renderujPodglądWypełnieniaBur(); odświeżStatusOperacjiBur(); elementy.przyciskZastosujZmianyBur.disabled = false;
        ustawStatus(
          elementy.statusSemper,
          korektaPodstawyWpisu && !korektaPodstawyWpisu.ok
            ? "Podgląd jest gotowy, ale nie skorygowano podstawy wpisu do BUR: " + korektaPodstawyWpisu.komunikat
            : "Podgląd zmian jest gotowy. Zaznacz zmiany i zatwierdź.",
          korektaPodstawyWpisu && !korektaPodstawyWpisu.ok ? "status-ostrzezenie" : "status-odczytano"
        );
      })
      .catch(function pokażBłąd(błąd) {
        const komunikat = błąd && błąd.message
          ? błąd.message
          : "Nie udało się przygotować podglądu zmian formularza BUR.";

        return zakończOperacjęBurBłędem(
          aktywnaOperacjaBur ? aktywnaOperacjaBur.etap : "przygotowywanie",
          komunikat
        ).then(function pokażStatus() {
          ustawStatus(elementy.statusSemper, komunikat, "status-blad");
        });
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
    if (!podglądWypełnieniaBur || !aktywnaOperacjaBur) {
      return;
    }

    const wybrane = (podglądWypełnieniaBur.propozycje || []).filter(function tylkoZaznaczone(propozycja) {
      return propozycja.zaznaczona;
    });

    if (!wybrane.length) {
      ustawStatus(elementy.statusSemper, "Nie zaznaczono żadnych zmian do zastosowania.", "status-ostrzezenie");
      return;
    }

    pobierzAktywnąKartę()
      .then(function zastosuj(karta) {
        if (!karta || karta.id !== podglądWypełnieniaBur.kartaId) {
          throw new Error("Zmieniła się karta BUR — przygotuj podgląd ponownie.");
        }

        aktywnaOperacjaBur = przestrzeń.przejdźOperacjęBur(aktywnaOperacjaBur, "wprowadzanie");

        return zapiszStorage({ aktywnaOperacjaBur: aktywnaOperacjaBur }).then(function wyślij() {
          return wyślijDoKarty(karta, {
            typ: komunikaty.ZASTOSUJ_ZATWIERDZONE_ZMIANY_BUR,
            propozycje: podglądWypełnieniaBur.propozycje
          });
        });
      })
      .then(function raportuj(odpowiedź) {
        const wynik = odpowiedź && odpowiedź.wynik ? odpowiedź.wynik : {};
        const wyniki = Array.isArray(wynik.wyniki) ? wynik.wyniki : [];
        const nieudane = wyniki.filter(function tylkoNieudane(pozycja) {
          return !pozycja.ok;
        });

        pokażWynikWypełnianiaBur({
          uzupełnione: wyniki.filter(function tylkoUdane(pozycja) { return pozycja.ok; }),
          ostrzeżenia: [],
          błędy: nieudane,
          pominięte: []
        });

        if (!wynik.ok || nieudane.length) {
          const pierwszyBłąd = nieudane[0];
          throw new Error(
            pierwszyBłąd && pierwszyBłąd.komunikat
              ? pierwszyBłąd.komunikat
              : "Nie wszystkie zatwierdzone zmiany zostały potwierdzone przez BUR."
          );
        }

        aktywnaOperacjaBur = przestrzeń.przejdźOperacjęBur(aktywnaOperacjaBur, "walidowanie");
        aktywnaOperacjaBur = przestrzeń.przejdźOperacjęBur(aktywnaOperacjaBur, "zakończono");
        podglądWypełnieniaBur = null;

        return zapiszStorage({
          aktywnaOperacjaBur: aktywnaOperacjaBur,
          podglądWypełnieniaBur: null
        });
      })
      .then(function zakończ() {
        odświeżStatusOperacjiBur();
        elementy.przyciskZastosujZmianyBur.disabled = true;
        ustawStatus(elementy.statusSemper, "Zastosowano i potwierdzono wszystkie wybrane zmiany.", "status-odczytano");
      })
      .catch(function pokażBłąd(wyjątek) {
        const komunikat = wyjątek && wyjątek.message
          ? wyjątek.message
          : "Nie udało się zastosować zmian BUR.";

        return zakończOperacjęBurBłędem(
          aktywnaOperacjaBur ? aktywnaOperacjaBur.etap : "wprowadzanie",
          komunikat
        ).then(function pokażStatus() {
          ustawStatus(elementy.statusSemper, komunikat + " Przygotuj podgląd ponownie.", "status-blad");
        });
      });
  }
  function odczytajOstatniImport() {
    odczytajStorage(["ostatnieSzkolenieSemper", "ostatnieŁączeSemper", "dataImportuSemper", "wybranyTerminSemperIndex", "wybranyTerminHarmonogramuBur", "aktywnaOperacjaBur"])
      .then(function pokażDane(dane) {
        aktywnaOperacjaBur = dane.aktywnaOperacjaBur || null;
        wybranyTerminHarmonogramuBur = dane.wybranyTerminHarmonogramuBur || null;
        odświeżStatusOperacjiBur();
        renderujListęTerminówHarmonogramu();
        if (!dane.ostatnieSzkolenieSemper) {
          odświeżDostępnośćHarmonogramu();
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
  renderujListęTerminówHarmonogramu();
  odświeżDostępnośćHarmonogramu();
  elementy.przyciskImportujHarmonogramXlsx.disabled = true;
  elementy.przyciskPobierzHarmonogramCsv.disabled = true;
  elementy.przyciskWypełnijHarmonogramRęcznie.disabled = true;

  elementy.przyciskPobierz.addEventListener("click", pobierzDaneZeStrony);
  elementy.przyciskWyczyśćPanel.addEventListener("click", wyczyśćPanelImportu);
  elementy.przyciskSzukajLinku.addEventListener("click", szukajLinkuSemper);
  elementy.przyciskUzupełnijZLinku.addEventListener("click", importujSzkolenieZLinku);
  elementy.przyciskWypełnijFormularz.addEventListener("click", wypełnijFormularzBurZPanelu);
  elementy.przyciskZastosujZmianyBur.addEventListener("click", zastosujZatwierdzoneZmianyBur);
  elementy.kolejkaTermowWejście.addEventListener("input", function odświeżPodglądKolejki() {
    renderujPodglądKolejkiTerminów();
    ustawStatus(elementy.statusKolejkiTerminów, "Podgląd zmieniony. Działająca kolejka nie została zmieniona.", "status-neutralny");
  });
  elementy.przyciskZapiszKolejkę.addEventListener("click", function zapiszKolejkę() { zapiszKolejkęTerminówBur(false); });
  elementy.przyciskNoweSzkolenie.addEventListener("click", function noweSzkolenie() {
    zapiszKolejkęTerminówBur(true, window.confirm("Czy szkolenie ma terminy stacjonarne?"));
  });
  elementy.przyciskResetujKolejkę.addEventListener("click", resetujKolejkęTerminówBur);
  elementy.przyciskSkorygujDzienny.addEventListener("click", skorygujDziennyLicznikBur);
  elementy.przyciskResetujLiczniki.addEventListener("click", resetujLicznikiKolejkiBur);
  elementy.wybórTerminuSemper.addEventListener("change", function wybierzTerminZKontrolki() {
    zapiszWybórTerminuSemper("ręczny");
  });
  document.querySelectorAll("[data-filtr-terminow]").forEach(function dodajObsługęFiltra(przycisk) {
    przycisk.addEventListener("click", function filtrujTerminy() {
      ustawFiltrTerminówSemper(przycisk.dataset.filtrTerminow);
    });
  });
  document.querySelectorAll("[data-filtr-harmonogramu]").forEach(function dodajObsługęFiltraHarmonogramu(przycisk) {
    przycisk.addEventListener("click", function filtrujTerminyHarmonogramu() {
      ustawFiltrTerminówHarmonogramu(przycisk.dataset.filtrHarmonogramu);
    });
  });
  elementy.przyciskWalidujBur.addEventListener("click", walidujFormularzBurZPanelu);
  elementy.przyciskWyczyśćPodświetlenia.addEventListener("click", wyczyśćPodświetleniaBurZPanelu);
  elementy.przyciskUzupełnijProgram.addEventListener("click", uzupełnijProgramWPanelu);
  elementy.przyciskGenerujHarmonogram.addEventListener("click", przygotujHarmonogramWPanelu);
  elementy.przyciskImportujHarmonogramXlsx.addEventListener("click", function importujCsv() {
    pokażDiagnostykęImportuHarmonogramu({
      etap: "PANEL_WYSYŁA_POLECENIE_IMPORTU",
      czas: new Date().toISOString()
    });
    wprowadźPrzygotowanyHarmonogramDoBur(komunikaty.WPROWADŹ_HARMONOGRAM_DO_BUR);
  });
  elementy.przyciskPobierzHarmonogramCsv.addEventListener("click", pobierzPrzygotowanyCsvDoTestu);
  elementy.przyciskWypełnijHarmonogramRęcznie.addEventListener("click", function wypełnijRęcznie() {
    wprowadźPrzygotowanyHarmonogramDoBur(komunikaty.WYPEŁNIJ_HARMONOGRAM_RĘCZNIE_BUR);
  });
  document.querySelectorAll("[data-przelacz-zakladke]").forEach(function dodajObsługęZakładki(przycisk) {
    przycisk.addEventListener("click", function wybierzZakładkę() {
      ustawAktywnąZakładkęPanelu(przycisk.dataset.przelaczZakladke, true, true);
    });
  });
  document.getElementById("karta-diagnostyka").appendChild(document.getElementById("diagnostyka-semper"));
  chrome.tabs.onActivated.addListener(function poZmianieKarty() {
    pobierzAktywnąKartę().then(ustawStatusStronyDlaKarty).catch(function pomińBłąd() {});
  });
  chrome.tabs.onUpdated.addListener(function poOdświeżeniuKarty(tabId, zmiana, karta) {
    if (zmiana.status !== "complete" || !karta || !karta.active) {
      return;
    }

    ustawStatusStronyDlaKarty(karta).catch(function pomińBłąd() {});
  });
  if (chrome.runtime.onMessage && chrome.runtime.onMessage.addListener) {
    chrome.runtime.onMessage.addListener(function poZmianieTerminuBur(wiadomość, nadawca) {
      if (!wiadomość || wiadomość.typ !== komunikaty.ZMIENIONO_AKTUALNY_TERMIN_BUR) {
        return false;
      }

      pobierzAktywnąKartę().then(function odświeżJeśliAktywna(karta) {
        if (!karta || nadawca && nadawca.tab && nadawca.tab.id !== karta.id) {
          return;
        }
        return synchronizujAktualnyTerminBur(true);
      }).catch(function pomińBłądSynchronizacji() {});
      return false;
    });
  }
  window.addEventListener("scroll", function zapiszPozycjęWalidacji() {
    if (ostatniWynikWalidacjiBur) {
      zapiszStanSesjiWalidacji();
    }
  }, { passive: true });

  pobierzAktywnąKartę()
    .then(ustawStatusStronyDlaKarty)
    .catch(function pokażBłądStartowy() {
      ustawStatus(elementy.statusStrony, "Nieobsługiwana strona", "status-ostrzezenie");
      elementy.przyciskPobierz.disabled = true;
      ustawDostępnośćWalidacji(false);
    });

  odczytajOstatniImport();
  odczytajStanPanelu();
  odczytajStanSesjiWalidacji();
  odświeżStanProgramuHarmonogramu();
  odświeżStanPrzygotowaniaHarmonogramu();
})(globalThis);
