(function zarejestrujKluczeStorage(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  przestrzeń.KLUCZE_STORAGE = Object.freeze({
    AKTYWNY_PROFIL_DOSTAWCY: "aktywnyProfilDostawcy",
    DANE_ŹRÓDŁOWE_WEDŁUG_PROFILU_SEMPER: "daneŹródłoweWedługProfilu_semper",
    DANE_ŹRÓDŁOWE_WEDŁUG_PROFILU_IIST: "daneŹródłoweWedługProfilu_iist",
    SZKOLENIE_ŹRÓDŁOWE: "szkolenieŹródłowe",
    OSTATNIE_SZKOLENIE_SEMPER: "ostatnieSzkolenieSemper",
    OSTATNIE_OSTRZEŻENIA_SEMPER: "ostatnieOstrzezeniaSemper",
    OSTATNIE_ŁĄCZE_SEMPER: "ostatnieŁączeSemper",
    DATA_IMPORTU_SEMPER: "dataImportuSemper",
    WYBRANY_TERMIN_SEMPER_INDEX: "wybranyTerminSemperIndex",
    ŹRÓDŁO_WYBORU_TERMINU_SEMPER: "źródłoWyboruTerminuSemper",
    AKTUALNY_TERMIN_BUR: "aktualnyTerminBur",
    ODCISK_AKTUALNEGO_TERMINU_BUR: "odciskAktualnegoTerminuBur",
    ZGODNOŚĆ_WYBRANEGO_TERMINU_BUR: "zgodnośćWybranegoTerminuBur",
    AKTYWNA_OPERACJA_BUR: "aktywnaOperacjaBur",
    PODGLĄD_WYPEŁNIENIA_BUR: "podglądWypełnieniaBur",
    WYBRANY_TERMIN_HARMONOGRAMU_BUR: "wybranyTerminHarmonogramuBur",
    OSTATNIE_POZYCJE_HARMONOGRAMU_BUR: "ostatniePozycjeHarmonogramuBur",
    OSTATNI_WYBRANY_TERMIN_HARMONOGRAMU_BUR: "ostatniWybranyTerminHarmonogramuBur",
    OSTATNIE_OSTRZEŻENIA_HARMONOGRAMU_BUR: "ostatnieOstrzeżeniaHarmonogramuBur",
    OSTRZEŻENIA_HARMONOGRAMU_BUR: "ostrzezeniaHarmonogramuBur",
    HARMONOGRAM_BUR_PRZYGOTOWANY: "harmonogramBurPrzygotowany",
    HARMONOGRAM_BUR_NIEAKTUALNY: "harmonogramBurNieaktualny",
    HARMONOGRAM_BUR_PRZYGOTOWANY_AT: "harmonogramBurPrzygotowanyAt",
    DATY_PRZYGOTOWANEGO_HARMONOGRAMU_BUR: "datyPrzygotowanegoHarmonogramuBur",
    KONTEKST_PRZYGOTOWANEGO_HARMONOGRAMU_BUR: "kontekstPrzygotowanegoHarmonogramuBur",
    METRYKA_PRZYGOTOWANEGO_HARMONOGRAMU_BUR: "metrykaPrzygotowanegoHarmonogramuBur",
    ODCISK_TERMINU_BUR_PRZYGOTOWANEGO_HARMONOGRAMU: "odciskTerminuBurPrzygotowanegoHarmonogramu",
    AKTYWNA_SERIA_OGŁOSZEŃ_BUR: "aktywnaSeriaOgloszenBur",
    STAN_WALIDACJI_BUR: "stanWalidacjiBur",
    STAN_PANELU_BUR: "stanPaneluBur"
  });

  globalny.BurAsystent = przestrzeń;
})(typeof globalThis !== "undefined" ? globalThis : this);
