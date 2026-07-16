(function zarejestrujPrzygotowanieWypelnieniaBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  function przygotujPropozycje(dokument, szkolenie, termin) {
    return przestrzeń.pobierzDefinicjePólWypełnieniaBur({ szkolenieSemper: szkolenie || {}, wybranyTermin: termin || {} }).map(function utwórz(definicja) {
      const selektor = definicja.definicjaPola.selektory && definicja.definicjaPola.selektory[0];
      const element = selektor ? dokument.querySelector(selektor) : null;
      const aktualna = element ? (przestrzeń.pobierzWartośćPola(element) || "") : "";
      const proponowana = definicja.wartośćProponowana;
      const zgodne = definicja.typPola === "data" && przestrzeń.normalizujDatęBur
        ? przestrzeń.normalizujDatęBur(aktualna) === przestrzeń.normalizujDatęBur(proponowana)
        : aktualna === proponowana;
      const status = !element ? "brak_pola_bur" : !proponowana ? "brak_danych_źródłowych" : zgodne ? "bez_zmiany" : aktualna ? "konflikt" : "uzupełnienie_pustego";
      return Object.assign({}, definicja, { wartośćAktualna: aktualna, status: status, domyślnieZaznaczona: status === "uzupełnienie_pustego", komunikat: status === "konflikt" ? "Istniejąca wartość wymaga świadomej decyzji." : "" });
    });
  }
  przestrzeń.przygotujPropozycjeWypełnieniaBur = przygotujPropozycje;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
