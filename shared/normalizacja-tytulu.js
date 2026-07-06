(function zarejestrujNormalizacjeTytulu(globalny) {
  const przestrzen = globalny.BurAsystent || {};

  function normalizujSpacje(tekst) {
    return String(tekst || "")
      .replace(/\s+/g, " ")
      .replace(/\s+([.,;:!?])/g, "$1")
      .replace(/([([{])\s+/g, "$1")
      .replace(/\s+([)\]}])/g, "$1")
      .trim();
  }

  function poprawWielkaLitereSzkolenia(tekst) {
    return tekst.replace(/(^|[.!?]\s+|[–-]\s+)(szkolenie\b)/gi, function zmienLitery(caly, poczatek) {
      return poczatek + "Szkolenie";
    });
  }

  function normalizujTytulBur(tytul) {
    let wynik = String(tytul || "");

    wynik = wynik
      .replace(/\b[123]\s*-\s*dniowe\b/gi, "")
      .replace(/\b[123]\s+dniowe\b/gi, "")
      .replace(/\s*\(noclegi i wyzywienie w cenie szkolenia\)\s*/gi, " ")
      .replace(/\s*\(noclegi i wyżywienie w cenie szkolenia\)\s*/gi, " ")
      .replace(/\s*\(wyzywienie i zakwaterowanie w cenie szkolenia\)\s*/gi, " ")
      .replace(/\s*\(wyżywienie i zakwaterowanie w cenie szkolenia\)\s*/gi, " ");

    wynik = normalizujSpacje(wynik);
    wynik = poprawWielkaLitereSzkolenia(wynik);

    return wynik;
  }

  przestrzen.normalizujTytulBur = normalizujTytulBur;
  przestrzen.normalizujTytułBur = normalizujTytulBur;
  globalny.BurAsystent = przestrzen;
})(globalThis);
