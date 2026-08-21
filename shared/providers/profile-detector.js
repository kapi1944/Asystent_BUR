(function zarejestrujDetektorProfilu(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const regułyDostawców = przestrzeń.providerRules;

  function normalizujNazwęKontaBur(tekst) {
    return String(tekst || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleUpperCase("pl-PL");
  }

  function wykryjProfilPoNazwieKontaBur(tekst) {
    const nazwa = normalizujNazwęKontaBur(tekst);
    if (!nazwa) {
      return null;
    }

    const listaProfili = regułyDostawców.list();
    for (let indeks = 0; indeks < listaProfili.length; indeks += 1) {
      const profil = listaProfili[indeks];
      const wzorce = profil.wzorceNazwyKontaBur || [];
      const czyPasuje = wzorce.some(function pasuje(wzorzec) {
        return nazwa.includes(normalizujNazwęKontaBur(wzorzec));
      });
      if (czyPasuje) {
        return profil;
      }
    }
    return null;
  }

  function czyProfilZgodnyZKontemBur(identyfikatorProfilu, wykryteKonto) {
    const identyfikatorWykrytegoKonta = typeof wykryteKonto === "string"
      ? wykryteKonto
      : wykryteKonto && (wykryteKonto.profilId || wykryteKonto.id);
    return Boolean(identyfikatorWykrytegoKonta && identyfikatorProfilu === identyfikatorWykrytegoKonta);
  }

  przestrzeń.profileDetector = {
    detect: wykryjProfilPoNazwieKontaBur,
    normalizeAccountName: normalizujNazwęKontaBur,
    matches: czyProfilZgodnyZKontemBur
  };
  globalny.BurAsystent = przestrzeń;
})(globalThis);
