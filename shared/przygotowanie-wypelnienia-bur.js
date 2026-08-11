(function zarejestrujPrzygotowanieWypelnieniaBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  function przygotujPropozycje(dokument, szkolenie, termin, kontekst) {
    return przestrzeń.pobierzDefinicjePólWypełnieniaBur({
      szkolenieSemper: szkolenie || {},
      szkolenieŹródłowe: szkolenie || {},
      wybranyTermin: termin || {},
      profilId: kontekst && kontekst.profilId || szkolenie && szkolenie.profilId || "semper"
    }).map(function utwórz(definicja) {
      const znalezione = przestrzeń.znajdźPoleBurZSzczegółami
        ? przestrzeń.znajdźPoleBurZSzczegółami(dokument, definicja.definicjaPola || {})
        : { element: null, metodaZnalezienia: "brak", selektor: "" };
      const element = znalezione.element;
      let aktualna = "";

      if (element) {
        if (definicja.typPola === "przełącznik" && przestrzeń.pobierzStanPrzełącznika) {
          aktualna = przestrzeń.pobierzStanPrzełącznika(element) || "";
        } else {
          aktualna = przestrzeń.pobierzWartośćPola(element) || "";
        }
      }

      const proponowana = definicja.wartośćProponowana;
      const zgodne = definicja.id === "forma-swiadczenia" && przestrzeń.normalizujTrybTerminu
        ? przestrzeń.normalizujTrybTerminu(aktualna) === przestrzeń.normalizujTrybTerminu(proponowana)
        : definicja.typPola === "data" && przestrzeń.normalizujDatęBur
        ? przestrzeń.normalizujDatęBur(aktualna) === przestrzeń.normalizujDatęBur(proponowana)
        : String(aktualna || "").trim() === String(proponowana || "").trim();
      const status = definicja.regułaNieDotyczy
        ? "reguła_dotyczy_tylko_online"
        : definicja.doSprawdzenia
          ? "do_sprawdzenia"
          : !element
        ? "brak_pola_bur"
        : !proponowana
          ? "brak_danych_źródłowych"
          : zgodne
            ? "bez_zmiany"
            : aktualna
              ? "konflikt"
              : "uzupełnienie_pustego";

      return Object.assign({}, definicja, {
        wartośćAktualna: aktualna,
        status: status,
        domyślnieZaznaczona: status === "uzupełnienie_pustego",
        komunikat: status === "konflikt"
          ? "Istniejąca wartość wymaga świadomej decyzji."
          : "",
        metodaZnalezienia: znalezione.metodaZnalezienia || "",
        selektorZnaleziony: znalezione.selektor || "",
        tylkoOnline: Boolean(definicja.tylkoOnline),
        profilId: kontekst && kontekst.profilId || szkolenie && szkolenie.profilId || "semper"
      });
    });
  }
  przestrzeń.przygotujPropozycjeWypełnieniaBur = przygotujPropozycje;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
