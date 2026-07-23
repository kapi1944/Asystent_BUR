(function zarejestrujObsługęTerminówBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function parsujDatęTerminu(wartość) {
    const tekst = String(wartość || "").trim();
    let dopasowanie = tekst.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

    if (dopasowanie) {
      return { rok: Number(dopasowanie[1]), miesiąc: Number(dopasowanie[2]), dzień: Number(dopasowanie[3]) };
    }

    dopasowanie = tekst.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
    return dopasowanie
      ? { rok: Number(dopasowanie[3]), miesiąc: Number(dopasowanie[2]), dzień: Number(dopasowanie[1]) }
      : null;
  }

  function formatujCzęśćDaty(data, zRokiem) {
    if (!data) {
      return "";
    }

    const dzień = String(data.dzień).padStart(2, "0");
    const miesiąc = String(data.miesiąc).padStart(2, "0");
    return dzień + "." + miesiąc + (zRokiem ? "." + data.rok : "");
  }

  function formatujZakresDatPrezentacyjny(dataOd, dataDo) {
    const początek = parsujDatęTerminu(dataOd);
    const koniec = parsujDatęTerminu(dataDo || dataOd);

    if (!początek || !koniec) {
      return [dataOd, dataDo].filter(Boolean).join(" – ");
    }

    if (początek.rok === koniec.rok && początek.miesiąc === koniec.miesiąc) {
      if (początek.dzień === koniec.dzień) {
        return formatujCzęśćDaty(początek, true);
      }
      return String(początek.dzień).padStart(2, "0") + "–" + formatujCzęśćDaty(koniec, true);
    }

    if (początek.rok === koniec.rok) {
      return formatujCzęśćDaty(początek, false) + "–" + formatujCzęśćDaty(koniec, true);
    }

    return formatujCzęśćDaty(początek, true) + "–" + formatujCzęśćDaty(koniec, true);
  }

  function normalizujDatęTerminu(wartość) {
    const data = parsujDatęTerminu(wartość);
    return data
      ? [data.rok, String(data.miesiąc).padStart(2, "0"), String(data.dzień).padStart(2, "0")].join("-")
      : "";
  }

  function pobierzDatyTerminuSemper(termin) {
    const dane = termin || {};
    return {
      dataRozpoczęcia: normalizujDatęTerminu(dane.dataStartBur || dane.dataOdTekst),
      dataZakończenia: normalizujDatęTerminu(dane.dataKoniecBur || dane.dataDoTekst)
    };
  }

  function pobierzDatyTerminuBur(terminBur) {
    const dane = terminBur || {};
    return {
      dataRozpoczęcia: normalizujDatęTerminu(dane.dataRozpoczęcia || dane.dataRozpoczecia || dane.dataStart),
      dataZakończenia: normalizujDatęTerminu(dane.dataZakończenia || dane.dataZakonczenia || dane.dataKoniec)
    };
  }

  function normalizujTrybTerminu(wartość) {
    const tekst = String(wartość || "")
      .toLocaleLowerCase("pl-PL")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (/online|zdaln|remote|wideokonferenc|e-learning|elearning/.test(tekst)) {
      return "online";
    }
    if (/stacjon/.test(tekst)) {
      return "stacjonarny";
    }
    return "";
  }

  function pobierzTrybTerminu(termin) {
    const dane = termin || {};
    return normalizujTrybTerminu([dane.forma, dane.miejsce].filter(Boolean).join(" "));
  }

  function czyTerminOnline(termin) {
    return pobierzTrybTerminu(termin) === "online";
  }

  function czyTerminMaTryb(termin, trybBur) {
    const tryb = normalizujTrybTerminu(trybBur);
    if (!tryb) {
      return true;
    }
    return pobierzTrybTerminu(termin) === tryb;
  }

  function normalizujLokalizację(wartość) {
    return String(wartość || "")
      .toLowerCase()
      .replace(/ł/g, "l")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/szkolenie|stacjonarn\w*|online/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function czyTerminMaLokalizację(termin, lokalizacjaBur) {
    const semper = normalizujLokalizację(termin && termin.miejsce);
    const bur = normalizujLokalizację(lokalizacjaBur);
    return !bur || !semper || semper === bur || semper.includes(bur) || bur.includes(semper);
  }

  function czyDatyTerminówZgodne(terminSemper, terminBur) {
    const semper = pobierzDatyTerminuSemper(terminSemper);
    const bur = pobierzDatyTerminuBur(terminBur);
    return Boolean(semper.dataRozpoczęcia && semper.dataZakończenia && bur.dataRozpoczęcia && bur.dataZakończenia)
      && semper.dataRozpoczęcia === bur.dataRozpoczęcia
      && semper.dataZakończenia === bur.dataZakończenia;
  }

  function dopasujTerminSemperDoBur(terminy, terminBur) {
    const lista = Array.isArray(terminy) ? terminy : [];
    const datyBur = pobierzDatyTerminuBur(terminBur);

    if (!datyBur.dataRozpoczęcia || !datyBur.dataZakończenia) {
      return { status: "brak-dat-bur", indeks: null, indeksy: [], indeksyZgodneDaty: [] };
    }

    let kandydaci = lista.map(function dodajIndeks(termin, indeks) {
      return { termin: termin, indeks: indeks };
    }).filter(function zgodneDaty(kandydat) {
      return czyDatyTerminówZgodne(kandydat.termin, terminBur);
    });

    if (!kandydaci.length) {
      return { status: "brak", indeks: null, indeksy: [], indeksyZgodneDaty: [] };
    }

    const indeksyZgodneDaty = kandydaci.map(function pobierzIndeks(kandydat) { return kandydat.indeks; });

    if (kandydaci.length === 1) {
      return { status: "dopasowany", indeks: kandydaci[0].indeks, indeksy: [kandydaci[0].indeks], indeksyZgodneDaty: indeksyZgodneDaty };
    }

    const poTrybie = kandydaci.filter(function zgodnyTryb(kandydat) {
      return czyTerminMaTryb(kandydat.termin, terminBur && terminBur.tryb);
    });
    if (poTrybie.length) {
      kandydaci = poTrybie;
    }

    if (kandydaci.length === 1) {
      return { status: "dopasowany", indeks: kandydaci[0].indeks, indeksy: [kandydaci[0].indeks], indeksyZgodneDaty: indeksyZgodneDaty, kryterium: "tryb" };
    }

    const poLokalizacji = kandydaci.filter(function zgodnaLokalizacja(kandydat) {
      return czyTerminMaLokalizację(kandydat.termin, terminBur && terminBur.lokalizacja);
    });
    if (poLokalizacji.length) {
      kandydaci = poLokalizacji;
    }

    if (kandydaci.length === 1) {
      return { status: "dopasowany", indeks: kandydaci[0].indeks, indeksy: [kandydaci[0].indeks], indeksyZgodneDaty: indeksyZgodneDaty, kryterium: "lokalizacja" };
    }

    return {
      status: "niejednoznaczny",
      indeks: null,
      indeksy: kandydaci.map(function pobierzIndeks(kandydat) { return kandydat.indeks; }),
      indeksyZgodneDaty: indeksyZgodneDaty
    };
  }

  function filtrujTerminySemper(terminy, filtr) {
    const trybFiltra = filtr || "wszystkie";
    return (Array.isArray(terminy) ? terminy : []).map(function dodajIndeks(termin, indeks) {
      return { termin: termin, indeks: indeks };
    }).filter(function zastosujFiltr(pozycja) {
      if (trybFiltra === "online") {
        return czyTerminOnline(pozycja.termin);
      }
      if (trybFiltra === "stacjonarne") {
        return !czyTerminOnline(pozycja.termin);
      }
      return true;
    });
  }

  function grupujTerminySemper(terminy, filtr) {
    const grupy = [];
    const mapa = new Map();

    filtrujTerminySemper(terminy, filtr).forEach(function dodajDoGrupy(pozycja) {
      const daty = pobierzDatyTerminuSemper(pozycja.termin);
      const klucz = daty.dataRozpoczęcia + "|" + daty.dataZakończenia;
      let grupa = mapa.get(klucz);

      if (!grupa) {
        grupa = {
          klucz: klucz,
          dataRozpoczęcia: daty.dataRozpoczęcia,
          dataZakończenia: daty.dataZakończenia,
          etykieta: formatujZakresDatPrezentacyjny(daty.dataRozpoczęcia, daty.dataZakończenia),
          pozycje: []
        };
        mapa.set(klucz, grupa);
        grupy.push(grupa);
      }
      grupa.pozycje.push(pozycja);
    });

    return grupy;
  }

  function opiszTerminSemper(termin, indeks) {
    if (czyTerminOnline(termin)) {
      return "Termin " + (indeks + 1) + " · Online";
    }
    return ["Termin " + (indeks + 1), termin && termin.miejsce, "stacjonarna"].filter(Boolean).join(" · ");
  }

  function opiszWariantTerminuSemper(termin) {
    if (czyTerminOnline(termin)) {
      return "Online";
    }
    return [termin && termin.miejsce, "stacjonarna"].filter(Boolean).join(" · ") || "Stacjonarna";
  }

  function utwórzStabilnyIdTerminuHarmonogramu(dane) {
    const wartości = dane || {};
    return [
      wartości.źródło || "termin",
      normalizujDatęTerminu(wartości.dataRozpoczęcia),
      normalizujDatęTerminu(wartości.dataZakończenia),
      normalizujTrybTerminu(wartości.tryb),
      normalizujLokalizację(wartości.lokalizacja),
      String(wartości.wariant || "")
    ].join("|");
  }

  function utwórzTerminHarmonogramuZeSemper(termin, indeks) {
    const dane = termin || {};
    const daty = pobierzDatyTerminuSemper(dane);
    const tryb = pobierzTrybTerminu(dane) || (czyTerminOnline(dane) ? "online" : "stacjonarny");
    const lokalizacja = tryb === "online" ? "" : String(dane.miejsce || "").trim();
    const wynik = {
      źródło: "semper",
      dataRozpoczęcia: daty.dataRozpoczęcia,
      dataZakończenia: daty.dataZakończenia,
      tryb: tryb,
      lokalizacja: lokalizacja,
      indeksSemper: Number.isInteger(indeks) ? indeks : null,
      wariant: ""
    };
    wynik.stabilnyId = dane.id || dane.identyfikator || utwórzStabilnyIdTerminuHarmonogramu(wynik);
    return wynik;
  }

  function utwórzTerminHarmonogramuZKolejki(termin) {
    const dane = termin || {};
    const wynik = {
      źródło: "kolejka",
      dataRozpoczęcia: normalizujDatęTerminu(dane.dataOd || dane.dataRozpoczęcia),
      dataZakończenia: normalizujDatęTerminu(dane.dataDo || dane.dataZakończenia || dane.dataOd),
      tryb: dane.online ? "online" : "stacjonarny",
      lokalizacja: dane.online ? "" : String(dane.miasto || dane.lokalizacja || "").trim(),
      wariant: ""
    };
    wynik.stabilnyId = dane.stabilnyId || utwórzStabilnyIdTerminuHarmonogramu(wynik);
    return wynik;
  }

  function pobierzDatyTerminuHarmonogramu(termin) {
    const dane = termin || {};
    return {
      dataRozpoczęcia: normalizujDatęTerminu(dane.dataRozpoczęcia || dane.dataOd || dane.dataStartBur),
      dataZakończenia: normalizujDatęTerminu(dane.dataZakończenia || dane.dataDo || dane.dataKoniecBur || dane.dataRozpoczęcia || dane.dataOd)
    };
  }

  function czyTenSamTerminHarmonogramu(pierwszy, drugi) {
    const a = pierwszy || {};
    const b = drugi || {};
    return Boolean(a.stabilnyId && b.stabilnyId)
      && a.stabilnyId === b.stabilnyId
      && String(a.źródło || "") === String(b.źródło || "");
  }

  function sprawdźZgodnośćTerminuHarmonogramuZBur(terminHarmonogramu, terminBur) {
    const harmonogram = pobierzDatyTerminuHarmonogramu(terminHarmonogramu);
    const bur = pobierzDatyTerminuBur(terminBur);
    const trybHarmonogramu = normalizujTrybTerminu(terminHarmonogramu && terminHarmonogramu.tryb);
    const trybBur = normalizujTrybTerminu(terminBur && terminBur.tryb);
    const lokalizacjaHarmonogramu = normalizujLokalizację(terminHarmonogramu && terminHarmonogramu.lokalizacja);
    const lokalizacjaBur = normalizujLokalizację(terminBur && terminBur.lokalizacja);
    const zgodneDaty = Boolean(
      harmonogram.dataRozpoczęcia
      && harmonogram.dataZakończenia
      && bur.dataRozpoczęcia
      && bur.dataZakończenia
      && harmonogram.dataRozpoczęcia === bur.dataRozpoczęcia
      && harmonogram.dataZakończenia === bur.dataZakończenia
    );
    const zgodnyTryb = !trybHarmonogramu || !trybBur || trybHarmonogramu === trybBur;
    const zgodnaLokalizacja = trybHarmonogramu === "online"
      || !lokalizacjaHarmonogramu
      || !lokalizacjaBur
      || lokalizacjaHarmonogramu === lokalizacjaBur
      || lokalizacjaHarmonogramu.includes(lokalizacjaBur)
      || lokalizacjaBur.includes(lokalizacjaHarmonogramu);

    return {
      ok: zgodneDaty && zgodnyTryb && zgodnaLokalizacja,
      zgodneDaty: zgodneDaty,
      zgodnyTryb: zgodnyTryb,
      zgodnaLokalizacja: zgodnaLokalizacja,
      datyHarmonogramu: harmonogram,
      datyBur: bur,
      trybHarmonogramu: trybHarmonogramu,
      trybBur: trybBur,
      lokalizacjaHarmonogramu: lokalizacjaHarmonogramu,
      lokalizacjaBur: lokalizacjaBur
    };
  }

  function opiszTerminHarmonogramu(termin) {
    const dane = termin || {};
    const daty = pobierzDatyTerminuHarmonogramu(dane);
    const zakres = formatujZakresDatPrezentacyjny(daty.dataRozpoczęcia, daty.dataZakończenia) || "Brak dat";
    const szczegóły = dane.tryb === "online"
      ? ["Online"]
      : [dane.lokalizacja, "stacjonarna"].filter(Boolean);
    const źródło = dane.źródło === "kolejka" ? "Kolejka BUR" : (dane.źródło === "semper" ? "SEMPER" : "");
    return [zakres].concat(szczegóły).concat(źródło ? ["Źródło: " + źródło] : []).join(" · ");
  }

  function utwórzKontekstTerminuSemper(termin, indeks) {
    const kontekst = utwórzTerminHarmonogramuZeSemper(termin, indeks);
    return {
      dataRozpoczęcia: kontekst.dataRozpoczęcia,
      dataZakończenia: kontekst.dataZakończenia,
      tryb: kontekst.tryb,
      lokalizacja: normalizujLokalizację(kontekst.lokalizacja),
      stabilnyId: kontekst.stabilnyId
    };
  }

  function czyKontekstTerminuSemperZgodny(pierwszy, drugi) {
    const a = pierwszy || {};
    const b = drugi || {};
    return Boolean(a.stabilnyId && b.stabilnyId)
      && a.stabilnyId === b.stabilnyId
      && a.dataRozpoczęcia === b.dataRozpoczęcia
      && a.dataZakończenia === b.dataZakończenia
      && a.tryb === b.tryb
      && a.lokalizacja === b.lokalizacja;
  }

  function utwórzOdciskTerminuBur(terminBur) {
    const daty = pobierzDatyTerminuBur(terminBur);
    return [daty.dataRozpoczęcia, daty.dataZakończenia, String(terminBur && terminBur.tryb || "").toLowerCase(), normalizujLokalizację(terminBur && terminBur.lokalizacja), terminBur && terminBur.url || ""].join("|");
  }

  function sprawdźZgodnośćPrzygotowanegoHarmonogramu(datyHarmonogramu, terminBur) {
    const harmonogram = pobierzDatyTerminuBur(datyHarmonogramu);
    const bur = pobierzDatyTerminuBur(terminBur);
    return {
      ok: Boolean(harmonogram.dataRozpoczęcia && harmonogram.dataZakończenia && bur.dataRozpoczęcia && bur.dataZakończenia)
        && harmonogram.dataRozpoczęcia === bur.dataRozpoczęcia
        && harmonogram.dataZakończenia === bur.dataZakończenia,
      datyHarmonogramu: harmonogram,
      datyBur: bur
    };
  }

  przestrzeń.formatujZakresDatPrezentacyjny = formatujZakresDatPrezentacyjny;
  przestrzeń.normalizujDatęTerminu = normalizujDatęTerminu;
  przestrzeń.pobierzDatyTerminuSemper = pobierzDatyTerminuSemper;
  przestrzeń.pobierzDatyTerminuBur = pobierzDatyTerminuBur;
  przestrzeń.czyTerminOnlineBur = czyTerminOnline;
  przestrzeń.normalizujTrybTerminu = normalizujTrybTerminu;
  przestrzeń.pobierzTrybTerminuSemper = pobierzTrybTerminu;
  przestrzeń.czyDatyTerminówZgodne = czyDatyTerminówZgodne;
  przestrzeń.dopasujTerminSemperDoBur = dopasujTerminSemperDoBur;
  przestrzeń.filtrujTerminySemper = filtrujTerminySemper;
  przestrzeń.grupujTerminySemper = grupujTerminySemper;
  przestrzeń.opiszTerminSemper = opiszTerminSemper;
  przestrzeń.opiszWariantTerminuSemper = opiszWariantTerminuSemper;
  function formatujDatęNazwyPlikuHarmonogramu(wartość) {
    if (typeof wartość === "string") {
      const zTekstu = normalizujDatęTerminu(wartość.slice(0, 10));
      if (zTekstu) {
        return zTekstu;
      }
    }

    const data = wartość instanceof Date ? wartość : new Date();
    if (Number.isNaN(data.getTime())) {
      return "";
    }

    return [
      String(data.getFullYear()),
      String(data.getMonth() + 1).padStart(2, "0"),
      String(data.getDate()).padStart(2, "0")
    ].join("-");
  }

  function oczyśćFragmentNazwyPlikuHarmonogramu(wartość) {
    return String(wartość || "")
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
      .replace(/\s+/g, " ")
      .replace(/[. ]+$/g, "")
      .trim();
  }

  function zbudujNazwęPlikuHarmonogramu(termin, dataUtworzenia, rozszerzenie) {
    const dane = termin || {};
    const daty = pobierzDatyTerminuHarmonogramu(dane);
    const dataPliku = formatujDatęNazwyPlikuHarmonogramu(dataUtworzenia)
      || formatujDatęNazwyPlikuHarmonogramu(new Date());
    const tryb = normalizujTrybTerminu(dane.tryb);
    const lokalizacja = tryb === "online" ? "Online" : (dane.lokalizacja || "Stacjonarne");
    const bezpiecznaLokalizacja = oczyśćFragmentNazwyPlikuHarmonogramu(lokalizacja) || "Stacjonarne";
    const dataOd = daty.dataRozpoczęcia || "brak-daty";
    const dataDo = daty.dataZakończenia || dataOd;
    const typPliku = String(rozszerzenie || "csv").replace(/[^a-z0-9]+/gi, "").toLowerCase() || "csv";

    return "[" + dataPliku + "]_BUR_Harmonogram_" + dataOd + "--" + dataDo + "_" + bezpiecznaLokalizacja + "." + typPliku;
  }

  przestrzeń.utwórzOdciskTerminuBur = utwórzOdciskTerminuBur;
  przestrzeń.utwórzKontekstTerminuSemper = utwórzKontekstTerminuSemper;
  przestrzeń.czyKontekstTerminuSemperZgodny = czyKontekstTerminuSemperZgodny;
  przestrzeń.utwórzTerminHarmonogramuZeSemper = utwórzTerminHarmonogramuZeSemper;
  przestrzeń.utwórzTerminHarmonogramuZKolejki = utwórzTerminHarmonogramuZKolejki;
  przestrzeń.pobierzDatyTerminuHarmonogramu = pobierzDatyTerminuHarmonogramu;
  przestrzeń.czyTenSamTerminHarmonogramu = czyTenSamTerminHarmonogramu;
  przestrzeń.sprawdźZgodnośćTerminuHarmonogramuZBur = sprawdźZgodnośćTerminuHarmonogramuZBur;
  przestrzeń.opiszTerminHarmonogramu = opiszTerminHarmonogramu;
  przestrzeń.zbudujNazwęPlikuHarmonogramu = zbudujNazwęPlikuHarmonogramu;
  przestrzeń.sprawdźZgodnośćPrzygotowanegoHarmonogramu = sprawdźZgodnośćPrzygotowanegoHarmonogramu;

  globalny.BurAsystent = przestrzeń;
})(globalThis);
