(function zarejestrujPrzygotowanieWypelnieniaBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  function wartośćSekcji(szkolenie, nazwy) { const sekcje = szkolenie.sekcje || {}; return nazwy.map(function pobierz(nazwa) { return sekcje[nazwa]; }).find(Boolean) || ""; }
  function definicje(szkolenie, termin) {
    return [
      ["Informacje podstawowe", "Tytuł", szkolenie.tytułPoNormalizacjiBur || szkolenie.tytulBur || szkolenie.tytułOryginalny || "", "input", "#informacjepodstawowesekcja-tytuluslugi", "SEMPER"],
      ["Informacje podstawowe", "Data rozpoczęcia usługi", termin.dataStartBur || "", "input", "#informacjepodstawowesekcja-datarozpoczeciauslugi", "SEMPER"],
      ["Informacje podstawowe", "Data zakończenia usługi", termin.dataKoniecBur || "", "input", "#informacjepodstawowesekcja-datazakonczeniauslugi", "SEMPER"],
      ["Informacje podstawowe", "Data zakończenia rekrutacji", termin.dataZakończeniaRekrutacjiBur || termin.dataZakonczeniaRekrutacjiBur || "", "input", "#informacjepodstawowesekcja-datazakonczeniarekrutacji", "SEMPER"],
      ["Informacje podstawowe", "Grupa docelowa usługi", wartośćSekcji(szkolenie, ["grupaDocelowa", "grupaDocelowaHtml", "groupHtml"]), "quill", "#informacjepodstawowesekcja-grupadocelowauslugi-wysiwyg .ql-editor", "SEMPER"],
      ["Informacje podstawowe", "Minimalna liczba uczestników", /online/i.test([termin.forma, termin.miejsce].join(" ")) ? "2" : "5", "input", "#informacjepodstawowesekcja-minimalnaliczbauczestnikow", "reguła BUR"],
      ["Informacje podstawowe", "Maksymalna liczba uczestników", "15", "input", "#informacjepodstawowesekcja-maksymalnaliczbauczestnikow", "reguła BUR"]
    ];
  }
  function przygotujPropozycje(dokument, szkolenie, termin) {
    return definicje(szkolenie || {}, termin || {}).map(function utwórz(dane, indeks) {
      const element = dokument.querySelector(dane[4]); const aktualna = element ? (przestrzeń.pobierzWartośćPola(element) || "") : ""; const proponowana = dane[2];
      const status = !element ? "brak_pola_bur" : !proponowana ? "brak_danych_źródłowych" : aktualna === proponowana ? "bez_zmiany" : aktualna ? "konflikt" : "uzupełnienie_pustego";
      return { id: "propozycja-" + indeks, sekcja: dane[0], pole: dane[1], typPola: dane[3], wartośćAktualna: aktualna, wartośćProponowana: proponowana, źródło: dane[5], status: status, blokująca: status === "brak_pola_bur", domyślnieZaznaczona: status === "uzupełnienie_pustego", komunikat: status === "konflikt" ? "Istniejąca wartość wymaga świadomej decyzji." : "", definicjaPola: { sekcja: dane[0], etykieta: dane[1], selektory: [dane[4]], typ: dane[3] } };
    });
  }
  przestrzeń.przygotujPropozycjeWypełnieniaBur = przygotujPropozycje;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
