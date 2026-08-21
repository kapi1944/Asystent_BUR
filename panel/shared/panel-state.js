(function zarejestrujStanPanelu(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const panel = przestrzeń.panel || {};

  function utwórzStanPanelu() {
    let aktywnaZakładka = "semper";
    let czyZakładkaWybranaRęcznie = false;

    return Object.freeze({
      pobierzAktywnąZakładkę: function pobierzAktywnąZakładkę() {
        return aktywnaZakładka;
      },
      ustawAktywnąZakładkę: function ustawAktywnąZakładkę(zakładka) {
        aktywnaZakładka = zakładka;
      },
      czyZakładkaWybranaRęcznie: function pobierzWybórRęcznyZakładki() {
        return czyZakładkaWybranaRęcznie;
      },
      ustawCzyZakładkaWybranaRęcznie: function ustawCzyZakładkaWybranaRęcznie(wartość) {
        czyZakładkaWybranaRęcznie = wartość === true;
      },
      pobierzMigawkę: function pobierzMigawkę() {
        return {
          aktywnaZakładka: aktywnaZakładka,
          wybranaRęcznie: czyZakładkaWybranaRęcznie
        };
      }
    });
  }

  panel.stan = Object.freeze({ utwórzStanPanelu: utwórzStanPanelu });
  przestrzeń.panel = panel;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
