(function zarejestrujDaty(globalny) {
  const przestrzen = globalny.BurAsystent || {};

  const miesiace = {
    stycznia: 1,
    luty: 2,
    lutego: 2,
    marca: 3,
    kwietnia: 4,
    maja: 5,
    czerwca: 6,
    lipca: 7,
    sierpnia: 8,
    wrzesnia: 9,
    września: 9,
    pazdziernika: 10,
    października: 10,
    listopada: 11,
    grudnia: 12
  };

  function utworzDate(rok, miesiac, dzien) {
    if (!rok || !miesiac || !dzien) {
      return null;
    }

    return new Date(Number(rok), Number(miesiac) - 1, Number(dzien), 12, 0, 0, 0);
  }

  function kopiujDate(data) {
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
      return null;
    }

    return new Date(data.getFullYear(), data.getMonth(), data.getDate(), 12, 0, 0, 0);
  }

  function dodajDni(data, liczbaDni) {
    const wynik = kopiujDate(data);

    if (!wynik) {
      return null;
    }

    wynik.setDate(wynik.getDate() + Number(liczbaDni || 0));
    return wynik;
  }

  function formatujDateBur(data) {
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
      return "";
    }

    const dzien = String(data.getDate()).padStart(2, "0");
    const miesiac = String(data.getMonth() + 1).padStart(2, "0");
    const rok = data.getFullYear();

    return dzien + "-" + miesiac + "-" + rok;
  }

  function policzDniZakresu(dataOd, dataDo) {
    if (!dataOd || !dataDo) {
      return 0;
    }

    const milisekundyDnia = 24 * 60 * 60 * 1000;
    return Math.round((dataDo.getTime() - dataOd.getTime()) / milisekundyDnia) + 1;
  }

  function pobierzLiczbeDni(czasTrwania) {
    const tekst = String(czasTrwania || "");
    const dopasowanie = tekst.match(/(\d+)\s*(?:dni|dzien|dzień)/i);

    return dopasowanie ? Number(dopasowanie[1]) : 0;
  }

  function parsujZakresDatSemper(tekst) {
    const wartosc = String(tekst || "").replace(/\s+/g, " ").trim();
    const datyIso = wartosc.match(/\d{4}-\d{2}-\d{2}/g) || [];

    if (datyIso.length >= 2) {
      const pierwsza = datyIso[0].split("-");
      const druga = datyIso[1].split("-");

      return {
        dataOd: utworzDate(pierwsza[0], pierwsza[1], pierwsza[2]),
        dataDo: utworzDate(druga[0], druga[1], druga[2])
      };
    }

    if (datyIso.length === 1) {
      const jedna = datyIso[0].split("-");
      const data = utworzDate(jedna[0], jedna[1], jedna[2]);

      return {
        dataOd: data,
        dataDo: kopiujDate(data)
      };
    }

    let dopasowanie = wartosc.match(/(\d{4})[.-](\d{1,2})[.-](\d{1,2})\s*(?:-|–|do)\s*(\d{4})[.-](\d{1,2})[.-](\d{1,2})/i);

    if (dopasowanie) {
      return {
        dataOd: utworzDate(dopasowanie[1], dopasowanie[2], dopasowanie[3]),
        dataDo: utworzDate(dopasowanie[4], dopasowanie[5], dopasowanie[6])
      };
    }

    dopasowanie = wartosc.match(/(\d{1,2})[.-](\d{1,2})[.-](\d{4})\s*(?:-|–|do)\s*(\d{1,2})[.-](\d{1,2})[.-](\d{4})/i);

    if (dopasowanie) {
      return {
        dataOd: utworzDate(dopasowanie[3], dopasowanie[2], dopasowanie[1]),
        dataDo: utworzDate(dopasowanie[6], dopasowanie[5], dopasowanie[4])
      };
    }

    dopasowanie = wartosc.match(/(\d{1,2})[.-](\d{1,2})\s*(?:-|–|do)\s*(\d{1,2})[.-](\d{1,2})[.-](\d{4})/i);

    if (dopasowanie) {
      return {
        dataOd: utworzDate(dopasowanie[5], dopasowanie[2], dopasowanie[1]),
        dataDo: utworzDate(dopasowanie[5], dopasowanie[4], dopasowanie[3])
      };
    }

    dopasowanie = wartosc.match(/(\d{1,2})\s*(?:-|–)\s*(\d{1,2})[.-](\d{1,2})[.-](\d{4})/i);

    if (dopasowanie) {
      return {
        dataOd: utworzDate(dopasowanie[4], dopasowanie[3], dopasowanie[1]),
        dataDo: utworzDate(dopasowanie[4], dopasowanie[3], dopasowanie[2])
      };
    }

    dopasowanie = wartosc.match(/(\d{1,2})\s*(?:-|–)\s*(\d{1,2})\s+([a-ząćęłńóśźż]+)\s+(\d{4})/i);

    if (dopasowanie) {
      const miesiac = miesiace[dopasowanie[3].toLowerCase()];

      return {
        dataOd: utworzDate(dopasowanie[4], miesiac, dopasowanie[1]),
        dataDo: utworzDate(dopasowanie[4], miesiac, dopasowanie[2])
      };
    }

    dopasowanie = wartosc.match(/(\d{1,2})[.-](\d{1,2})[.-](\d{4})/i);

    if (dopasowanie) {
      const data = utworzDate(dopasowanie[3], dopasowanie[2], dopasowanie[1]);

      return {
        dataOd: data,
        dataDo: kopiujDate(data)
      };
    }

    return {
      dataOd: null,
      dataDo: null
    };
  }

  function obliczDatyBurDlaTerminu(dane) {
    const wartosci = dane || {};
    const dataOd = kopiujDate(wartosci.dataOd);
    const dataDo = kopiujDate(wartosci.dataDo);
    const miejsce = String(wartosci.miejsce || "");
    const czasTrwania = String(wartosci.czasTrwania || "");
    const liczbaDniZakresu = policzDniZakresu(dataOd, dataDo);
    const liczbaDniSzkolenia = pobierzLiczbeDni(czasTrwania);
    const czyZakopane = /zakopane/i.test(miejsce);
    const czyOnline = /online/i.test(miejsce);
    const czyDojazdZakopane = !czyOnline && czyZakopane && (liczbaDniSzkolenia === 3 || liczbaDniZakresu === 4);
    const dataStartBur = czyDojazdZakopane ? dodajDni(dataOd, 1) : dataOd;
    const dataKoniecBur = dataDo;
    const dataZakonczeniaRekrutacjiBur = dodajDni(dataStartBur, -1);

    return {
      dataStartBur: formatujDateBur(dataStartBur),
      dataKoniecBur: formatujDateBur(dataKoniecBur),
      dataZakonczeniaRekrutacjiBur: formatujDateBur(dataZakonczeniaRekrutacjiBur),
      dataZakończeniaRekrutacjiBur: formatujDateBur(dataZakonczeniaRekrutacjiBur),
      czyDojazdZakopane: Boolean(czyDojazdZakopane)
    };
  }

  przestrzen.parsujZakresDatSemper = parsujZakresDatSemper;
  przestrzen.parsujZakresDat = parsujZakresDatSemper;
  przestrzen.formatujDateBur = formatujDateBur;
  przestrzen.obliczDatyBurDlaTerminu = obliczDatyBurDlaTerminu;

  globalny.BurAsystent = przestrzen;
})(globalThis);
