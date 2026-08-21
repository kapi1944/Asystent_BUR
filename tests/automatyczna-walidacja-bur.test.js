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

  test("cztery przełączniki kompetencji są automatycznie ustawiane na TAK", function sprawdź() {
    return fetch("fixtures/bur-przelaczniki-walidacji.html")
      .then(function odczytaj(odpowiedź) { return odpowiedź.text(); })
      .then(function sprawdźKorektę(html) {
        const dokument = document.implementation.createHTMLDocument("test korekty kompetencji");
        dokument.body.innerHTML = html;
        const kontenerKompetencji = dokument.querySelector("#qualificationsZrk");
        kontenerKompetencji.insertAdjacentHTML("afterbegin", [
          "<div class='field-glownyceluslugisekcja-czyuslugaprowadzidonabyciakompetencji'>",
          "<div class='toggle-switch'><label><input type='checkbox'><span class='toggler'></span></label></div>",
          "</div>"
        ].join(""));
        dokument.querySelectorAll("#leadsToAcquisitionOfCompetences input[type='checkbox']").forEach(function ustawNie(pole) {
          pole.checked = false;
        });

        const skorygowane = BurAsystent.skorygujPrzełącznikiKompetencji(dokument, false);

        sprawdzRownosc(skorygowane.length, 4);
        sprawdzWarunek(Array.from(dokument.querySelectorAll("#qualificationsZrk input[type='checkbox']"))
          .filter(function tylkoKompetencje(pole) { return !pole.id.includes("czyceledukacyjny"); })
          .every(function ustawioneNaTak(pole) { return pole.checked; }));
      });
  });
})();
