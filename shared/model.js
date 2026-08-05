(function zarejestrujModel(globalny) {
  const przestrzen = globalny.BurAsystent || {};

  const FORMY_SZKOLENIA = {
    ONLINE: "online",
    STACJONARNA: "stacjonarna",
    NIEZNANA: "nieznana"
  };

  function utworzSekcjeSzkolenia(dane) {
    const wartosci = dane || {};
    const celEdukacyjnyOpis = wartosci.celEdukacyjnyOpis || wartosci.celSzkolenia || "";

    return {
      celEdukacyjnyOpis: celEdukacyjnyOpis,
      celSzkolenia: celEdukacyjnyOpis,
      efektyPoSzkoleniu: wartosci.efektyPoSzkoleniu || "",
      tekstNadProgramem: wartosci.tekstNadProgramem || wartosci.efektyPoSzkoleniu || "",
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

  function utworzSekcjeOpisuSemper(dane) {
    return utworzSekcjeSzkolenia(dane);
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

  function utworzSzkolenie(dane) {
    const wartosci = dane || {};
    const urlŹródła = wartosci.urlŹródła || wartosci.urlZrodla || "";
    const tytułOryginalny = wartosci.tytułOryginalny || wartosci.tytulOryginalny || "";
    const tytułBur = wartosci.tytułBur || wartosci.tytulBur || "";
    const ostrzeżenia = Array.isArray(wartosci.ostrzeżenia) ? wartosci.ostrzeżenia : (Array.isArray(wartosci.ostrzezenia) ? wartosci.ostrzezenia : []);

    return {
      profilId: wartosci.profilId || "",
      urlŹródła: urlŹródła,
      tytułOryginalny: tytułOryginalny,
      tytułBur: tytułBur,
      terminy: Array.isArray(wartosci.terminy) ? wartosci.terminy : [],
      sekcje: utworzSekcjeSzkolenia(wartosci.sekcje),
      ostrzeżenia: ostrzeżenia,
      urlZrodla: urlŹródła,
      tytulOryginalny: tytułOryginalny,
      tytulBur: tytułBur,
      tytułPoNormalizacjiBur: wartosci.tytułPoNormalizacjiBur || tytułBur,
      ostrzezenia: ostrzeżenia,
      cenaBezZakwaterowania: wartosci.cenaBezZakwaterowania || (wartosci.sekcje ? wartosci.sekcje.cenaBezZakwaterowania : "") || "",
      cenaBezZakwaterowaniaRodzaj: wartosci.cenaBezZakwaterowaniaRodzaj || (wartosci.sekcje ? wartosci.sekcje.cenaBezZakwaterowaniaRodzaj : "") || "",
      inwestycja: wartosci.inwestycja || (wartosci.sekcje ? wartosci.sekcje.inwestycja : ""),
      inwestycjaHtml: wartosci.inwestycjaHtml || (wartosci.sekcje ? wartosci.sekcje.inwestycjaHtml : "")
    };
  }

  function utworzSzkolenieSemper(dane) {
    return utworzSzkolenie(Object.assign({ profilId: "semper" }, dane || {}));
  }

  przestrzen.FORMY_SZKOLENIA = FORMY_SZKOLENIA;
  przestrzen.utworzSekcjeSzkolenia = utworzSekcjeSzkolenia;
  przestrzen.utworzSekcjeOpisuSemper = utworzSekcjeOpisuSemper;
  przestrzen.utworzTerminSzkolenia = utworzTerminSzkolenia;
  przestrzen.utworzSzkolenie = utworzSzkolenie;
  przestrzen.utworzSzkolenieSemper = utworzSzkolenieSemper;

  globalny.BurAsystent = przestrzen;
})(globalThis);
