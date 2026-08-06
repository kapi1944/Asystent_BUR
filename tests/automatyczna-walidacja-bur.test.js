(function testyAutomatycznejWalidacjiBur() {
  test("formularz BUR uruchamia walidację po edycji pola i zmianie wybranego terminu", function sprawdź() {
    return fetch("../content/bur-content.js")
      .then(function odczytaj(odpowiedź) { return odpowiedź.text(); })
      .then(function sprawdźKod(kod) {
        sprawdzWarunek(kod.includes('document.addEventListener("input", zaplanujAutomatycznąWalidacjęBur, true)'));
        sprawdzWarunek(kod.includes('document.addEventListener("change", zaplanujAutomatycznąWalidacjęBur, true)'));
        sprawdzWarunek(kod.includes("chrome.storage.onChanged.addListener(obsłużZmianęKontekstuWalidacjiBur)"));
        sprawdzWarunek(kod.includes("zastosujWynikWalidacjiNaStronie(document, wynik)"));
      });
  });

  test("lista usług BUR jest wyłączona z walidacji formularza edycji", function sprawdź() {
    return Promise.all([
      fetch("../content/bur-content.js").then(function odczytaj(odpowiedź) { return odpowiedź.text(); }),
      fetch("../panel/panel.js").then(function odczytaj(odpowiedź) { return odpowiedź.text(); })
    ]).then(function sprawdźKod(pliki) {
      sprawdzWarunek(pliki[0].includes('pathname.startsWith("/usluga/usluga/lista")'));
      sprawdzWarunek(pliki[1].includes('pathname.startsWith("/usluga/usluga/lista")'));
    });
  });
})();
