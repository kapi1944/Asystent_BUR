(function testyNormalizacji() {
  const normalizujTytulBur = window.BurAsystent.normalizujTytulBur;

  test("usuwa 1-dniowe", function sprawdz() {
    sprawdzRownosc(
      normalizujTytulBur("Kadry i place - 1-dniowe szkolenie praktyczne."),
      "Kadry i place - Szkolenie praktyczne."
    );
  });

  test("usuwa 2 dniowe", function sprawdz() {
    sprawdzRownosc(
      normalizujTytulBur("Podatki VAT. 2 dniowe szkolenie warsztatowe."),
      "Podatki VAT. Szkolenie warsztatowe."
    );
  });

  test("usuwa 3-dniowe", function sprawdz() {
    sprawdzRownosc(
      normalizujTytulBur("Prawo pracy - 3-dniowe szkolenie."),
      "Prawo pracy - Szkolenie."
    );
  });

  test("usuwa informacje o noclegach i wyzywieniu", function sprawdz() {
    sprawdzRownosc(
      normalizujTytulBur("Prawo ochrony środowiska w praktyce – 3-dniowe szkolenie w Zakopanem (noclegi i wyżywienie w cenie szkolenia)."),
      "Prawo ochrony środowiska w praktyce – Szkolenie w Zakopanem."
    );
  });

  test("usuwa informacje o wyzywieniu i zakwaterowaniu", function sprawdz() {
    sprawdzRownosc(
      normalizujTytulBur("Audyt wewnętrzny. 2-dniowe szkolenie (wyżywienie i zakwaterowanie w cenie szkolenia)."),
      "Audyt wewnętrzny. Szkolenie."
    );
  });

  test("normalizuje dlugi tytul z przykladu", function sprawdz() {
    sprawdzRownosc(
      normalizujTytulBur("Zielona transformacja: Nowe regulacje UE, obowiązki dla firm i JST, Fit for 55, CBAM i Zielony Ład w praktyce. 2-dniowe szkolenie warsztatowe dla sektora publicznego i prywatnego."),
      "Zielona transformacja: Nowe regulacje UE, obowiązki dla firm i JST, Fit for 55, CBAM i Zielony Ład w praktyce. Szkolenie warsztatowe dla sektora publicznego i prywatnego."
    );
  });
})();
