(function zarejestrujModel(globalny) {
  const przestrzen = globalny.BurAsystent || {};

  const FORMY_SZKOLENIA = {
    ONLINE: "online",
    STACJONARNA: "stacjonarna",
    NIEZNANA: "nieznana"
  };

  function utworzSekcjeOpisuSemper(dane) {
    const wartosci = dane || {};

    return {
      celSzkolenia: wartosci.celSzkolenia || "",
      grupaDocelowa: wartosci.grupaDocelowa || "",
      korzysci: wartosci.korzysci || "",
      program: wartosci.program || "",
      inwestycja: wartosci.inwestycja || "",
      inwestycjaHtml: wartosci.inwestycjaHtml || wartosci.inwestycja || "",
      cenaBezZakwaterowania: wartosci.cenaBezZakwaterowania || "",
      cenaBezZakwaterowaniaRodzaj: wartosci.cenaBezZakwaterowaniaRodzaj || "",
      cenyStacjonarne: wartosci.cenyStacjonarne || "",
      cenyOnline: wartosci.cenyOnline || ""
    };
  }

  function utworzTerminSzkolenia(dane) {
    const wartosci = dane || {};

    return {
      dataOdTekst: wartosci.dataOdTekst || "",
      dataDoTekst: wartosci.dataDoTekst || "",
      dataStartBur: wartosci.dataStartBur || "",
      dataKoniecBur: wartosci.dataKoniecBur || "",
      dataZakończeniaRekrutacjiBur: wartosci.dataZakończeniaRekrutacjiBur || wartosci.dataZakonczeniaRekrutacjiBur || "",
      miejsce: wartosci.miejsce || "",
      forma: wartosci.forma || FORMY_SZKOLENIA.NIEZNANA,
      cena: wartosci.cena || "",
      cenaBezZakwaterowania: wartosci.cenaBezZakwaterowania || "",
      cenaBezZakwaterowaniaRodzaj: wartosci.cenaBezZakwaterowaniaRodzaj || "",
      czasTrwania: wartosci.czasTrwania || "",
      czyDojazdZakopane: Boolean(wartosci.czyDojazdZakopane)
    };
  }

  function utworzSzkolenieSemper(dane) {
    const wartosci = dane || {};

    return {
      urlZrodla: wartosci.urlZrodla || "",
      urlŹródła: wartosci.urlŹródła || wartosci.urlZrodla || "",
      tytulOryginalny: wartosci.tytulOryginalny || "",
      tytułOryginalny: wartosci.tytułOryginalny || wartosci.tytulOryginalny || "",
      tytulBur: wartosci.tytulBur || "",
      tytułBur: wartosci.tytułBur || wartosci.tytulBur || "",
      tytułPoNormalizacjiBur: wartosci.tytułPoNormalizacjiBur || wartosci.tytulBur || "",
      terminy: Array.isArray(wartosci.terminy) ? wartosci.terminy : [],
      sekcje: utworzSekcjeOpisuSemper(wartosci.sekcje),
      cenaBezZakwaterowania: wartosci.cenaBezZakwaterowania || (wartosci.sekcje ? wartosci.sekcje.cenaBezZakwaterowania : "") || "",
      cenaBezZakwaterowaniaRodzaj: wartosci.cenaBezZakwaterowaniaRodzaj || (wartosci.sekcje ? wartosci.sekcje.cenaBezZakwaterowaniaRodzaj : "") || "",
      inwestycja: wartosci.inwestycja || (wartosci.sekcje ? wartosci.sekcje.inwestycja : ""),
      inwestycjaHtml: wartosci.inwestycjaHtml || (wartosci.sekcje ? wartosci.sekcje.inwestycjaHtml : "")
    };
  }

  przestrzen.FORMY_SZKOLENIA = FORMY_SZKOLENIA;
  przestrzen.utworzSekcjeOpisuSemper = utworzSekcjeOpisuSemper;
  przestrzen.utworzTerminSzkolenia = utworzTerminSzkolenia;
  przestrzen.utworzSzkolenieSemper = utworzSzkolenieSemper;

  globalny.BurAsystent = przestrzen;
})(globalThis);
