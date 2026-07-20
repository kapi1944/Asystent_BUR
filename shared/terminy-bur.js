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

  function czyTerminOnline(termin) {
    return /online/i.test([termin && termin.forma, termin && termin.miejsce].join(" "));
  }

  function czyTerminMaTryb(termin, trybBur) {
    const tryb = String(trybBur || "").toLowerCase();
    if (!/online|stacjon/.test(tryb)) {
      return true;
    }
    return /online/.test(tryb) === czyTerminOnline(termin);
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
      return { status: "brak-dat-bur", indeks: null, indeksy: [] };
    }

    let kandydaci = lista.map(function dodajIndeks(termin, indeks) {
      return { termin: termin, indeks: indeks };
    }).filter(function zgodneDaty(kandydat) {
      return czyDatyTerminówZgodne(kandydat.termin, terminBur);
    });

    if (!kandydaci.length) {
      return { status: "brak", indeks: null, indeksy: [] };
    }

    if (kandydaci.length === 1) {
      return { status: "dopasowany", indeks: kandydaci[0].indeks, indeksy: [kandydaci[0].indeks] };
    }

    const poTrybie = kandydaci.filter(function zgodnyTryb(kandydat) {
      return czyTerminMaTryb(kandydat.termin, terminBur && terminBur.tryb);
    });
    if (poTrybie.length) {
      kandydaci = poTrybie;
    }

    if (kandydaci.length === 1) {
      return { status: "dopasowany", indeks: kandydaci[0].indeks, indeksy: [kandydaci[0].indeks], kryterium: "tryb" };
    }

    const poLokalizacji = kandydaci.filter(function zgodnaLokalizacja(kandydat) {
      return czyTerminMaLokalizację(kandydat.termin, terminBur && terminBur.lokalizacja);
    });
    if (poLokalizacji.length) {
      kandydaci = poLokalizacji;
    }

    if (kandydaci.length === 1) {
      return { status: "dopasowany", indeks: kandydaci[0].indeks, indeksy: [kandydaci[0].indeks], kryterium: "lokalizacja" };
    }

    return {
      status: "niejednoznaczny",
      indeks: null,
      indeksy: kandydaci.map(function pobierzIndeks(kandydat) { return kandydat.indeks; })
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
  przestrzeń.czyDatyTerminówZgodne = czyDatyTerminówZgodne;
  przestrzeń.dopasujTerminSemperDoBur = dopasujTerminSemperDoBur;
  przestrzeń.filtrujTerminySemper = filtrujTerminySemper;
  przestrzeń.grupujTerminySemper = grupujTerminySemper;
  przestrzeń.opiszTerminSemper = opiszTerminSemper;
  przestrzeń.utwórzOdciskTerminuBur = utwórzOdciskTerminuBur;
  przestrzeń.sprawdźZgodnośćPrzygotowanegoHarmonogramu = sprawdźZgodnośćPrzygotowanegoHarmonogramu;

  globalny.BurAsystent = przestrzeń;
})(globalThis);
