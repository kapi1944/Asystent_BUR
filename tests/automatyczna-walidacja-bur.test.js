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

  test("klauzule o indywidualnej karcie rabatowej są automatycznie usuwane", function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("test usuwania kart rabatowych");
    dokument.body.innerHTML = [
      "<div class='ql-editor' contenteditable='true'>",
      "<p>Ważna informacja organizacyjna pozostaje bez zmian.</p>",
      "<p>Otrzymujesz&nbsp;indywidualną&nbsp;kartę&nbsp;rabatową&nbsp;upoważniającą&nbsp;do&nbsp;10%&nbsp;zniżki&nbsp;na&nbsp;wszystkie&nbsp;kolejne&nbsp;szkolenia&nbsp;stacjonarne&nbsp;i&nbsp;online organizowane przez Centrum Organizacji Szkoleń i Konferencji SEMPER.</p>",
      "<p>Każdy z Uczestników otrzyma indywidualną kartę rabatową upoważniającą do 10 % zniżki na wszystkie kolejne szkolenia otwarte organizowane przez Międzynarodowy Instytut Szkoleń Specjalistycznych IIST.</p>",
      "</div>"
    ].join("");

    const liczbaUsuniętych = BurAsystent.usuńKlauzuleKartRabatowych(dokument);
    const treść = dokument.querySelector(".ql-editor").textContent;

    sprawdzRownosc(liczbaUsuniętych, 2);
    sprawdzWarunek(treść.includes("Ważna informacja organizacyjna"));
    sprawdzWarunek(!/kart\S* rabatow/i.test(treść));
  });

  test("automatyczne usunięcie klauzuli potwierdza cztery suwaki TAK", function sprawdź() {
    const kontener = document.createElement("div");
    kontener.innerHTML = [
      "<div class='ql-editor' contenteditable='true'><p>Każdy uczestnik otrzyma indywidualną kartę rabatową upoważniającą do 10% zniżki na wszystkie kolejne szkolenia otwarte.</p></div>",
      "<div id='qualificationsZrk'><div class='field-glownyceluslugisekcja-czyuslugaprowadzidonabyciakompetencji'><label><input type='checkbox'><span class='toggler'></span></label></div></div>",
      "<div id='leadsToAcquisitionOfCompetences'>",
      "<div class='question-field-section'><label><input id='pytanieformularz-czydokumentzawieraopisefektowuczeniasie_v2-czyzaznaczono' type='checkbox'><span>Pytanie 1.</span><span class='toggler'></span></label></div>",
      "<div class='question-field-section'><label><input id='pytanieformularz-czydokumentpotwierdzazewalidacjabazujenakryteriachweryfikacji_v2-czyzaznaczono' type='checkbox'><span>Pytanie 2.</span><span class='toggler'></span></label></div>",
      "<div class='question-field-section'><label><input id='pytanieformularz-czydokumentpotwierdzaseparacjeprocesowksztalceniaiszkolenia_v2-czyzaznaczono' type='checkbox'><span>Pytanie 3.</span><span class='toggler'></span></label></div>",
      "</div>"
    ].join("");
    document.body.appendChild(kontener);

    return new Promise(function poczekajNaKorektę(resolve) { setTimeout(resolve, 120); })
      .then(function sprawdźWynik() {
        const komunikat = document.getElementById("bur-asystent-komunikat-korekty-kompetencji");
        sprawdzWarunek(!kontener.textContent.includes("kartę rabatową"), "Klauzula nie została usunięta automatycznie.");
        sprawdzWarunek(Array.from(kontener.querySelectorAll("input[type='checkbox']")).every(function zaznaczony(pole) { return pole.checked; }), "Nie wszystkie cztery suwaki ustawiono na TAK.");
        sprawdzWarunek(Boolean(komunikat) && komunikat.textContent.includes("Suwaki kompetencji ustawione na TAK: 4/4."), "Komunikat nie potwierdza stanu 4/4.");
      })
      .finally(function posprzątaj() { kontener.remove(); });
  });
})();
