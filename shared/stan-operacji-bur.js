(function zarejestrujStanOperacjiBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const ETAPY = ["bezczynny", "przygotowywanie", "oczekuje_na_zatwierdzenie", "wprowadzanie", "walidowanie", "zakończono", "błąd"];
  const PRZEJŚCIA = {
    bezczynny: ["przygotowywanie"], przygotowywanie: ["oczekuje_na_zatwierdzenie", "błąd"],
    oczekuje_na_zatwierdzenie: ["wprowadzanie", "przygotowywanie", "błąd"], wprowadzanie: ["walidowanie", "błąd"],
    walidowanie: ["zakończono", "błąd"], zakończono: ["przygotowywanie"], błąd: ["przygotowywanie", "wprowadzanie", "walidowanie"]
  };
  const CZAS_WYGASNIĘCIA_MS = 15 * 60 * 1000;

  function teraz() { return new Date().toISOString(); }
  function utwórzId() { return "bur-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8); }
  function kluczBlokady(dane) { return [dane.identyfikatorKartyBur || "", dane.odciskSzkolenia || "", dane.indeksTerminu].join("|"); }
  function czyAktywny(etap) { return ["przygotowywanie", "oczekuje_na_zatwierdzenie", "wprowadzanie", "walidowanie"].includes(etap); }

  function utwórzOperację(dane) {
    const operacja = Object.assign({ identyfikator: utwórzId(), etap: "bezczynny", rozpoczęto: teraz(), zaktualizowano: teraz(), błąd: null, zakończoneEtapy: [], blokuje: true }, dane || {});
    if (!ETAPY.includes(operacja.etap)) { throw new Error("Nieznany etap operacji BUR."); }
    return operacja;
  }
  function czyWygasła(operacja, czas) { return czyAktywny(operacja && operacja.etap) && new Date(czas || teraz()).getTime() - new Date(operacja.zaktualizowano).getTime() > CZAS_WYGASNIĘCIA_MS; }
  function znajdźKonflikt(operacje, dane, czas) { return (operacje || []).find(function sprawdź(operacja) { return czyAktywny(operacja.etap) && !czyWygasła(operacja, czas) && kluczBlokady(operacja) === kluczBlokady(dane); }) || null; }
  function przejdź(operacja, etap, dane) {
    if (!operacja || !PRZEJŚCIA[operacja.etap] || !PRZEJŚCIA[operacja.etap].includes(etap)) { throw new Error("Niedozwolone przejście stanu operacji BUR."); }
    const zakończoneEtapy = operacja.zakończoneEtapy.slice();
    if (!zakończoneEtapy.includes(operacja.etap)) { zakończoneEtapy.push(operacja.etap); }
    return Object.assign({}, operacja, dane || {}, { etap: etap, zaktualizowano: teraz(), zakończoneEtapy: zakończoneEtapy, błąd: etap === "błąd" ? (dane && dane.błąd) || { etap: operacja.etap, komunikat: "Nieznany błąd", czas: teraz() } : null });
  }
  function zapiszBłąd(operacja, etap, komunikat) { return przejdź(operacja, "błąd", { błąd: { etap: etap, komunikat: komunikat, czas: teraz() } }); }
  function zwolnijWygasłą(operacja) { return Object.assign({}, operacja, { etap: "błąd", blokuje: false, zaktualizowano: teraz(), błąd: { etap: operacja.etap, komunikat: "Blokada operacji wygasła i została zwolniona.", czas: teraz() } }); }

  przestrzeń.ETAPY_OPERACJI_BUR = ETAPY;
  przestrzeń.utwórzOperacjęBur = utwórzOperację;
  przestrzeń.czyOperacjaBurWygasła = czyWygasła;
  przestrzeń.znajdźKonfliktOperacjiBur = znajdźKonflikt;
  przestrzeń.przejdźOperacjęBur = przejdź;
  przestrzeń.zapiszBłądOperacjiBur = zapiszBłąd;
  przestrzeń.zwolnijWygasłąOperacjęBur = zwolnijWygasłą;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
