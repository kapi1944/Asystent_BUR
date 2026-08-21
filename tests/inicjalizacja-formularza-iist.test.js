(function testyInicjalizacjiFormularzaIist() {
  const bur = window.BurAsystent;
  const kontoIist = { profilId: "iist", nazwaOrganizacji: "MIĘDZYNARODOWY INSTYTUT SZKOLEŃ SPECJALISTYCZNYCH IIST PARAG KESARIA" };

  function opcje(wartości) {
    return [""].concat(wartości).map(function utwórz(wartość) { return "<option>" + wartość + "</option>"; }).join("");
  }

  function utwórzDokument() {
    const dokument = document.implementation.createHTMLDocument("Formularz wstępny IIST");
    dokument.body.innerHTML = [
      "<form id='formularz-uslugi'>",
      "<select id='formularzwstepnysekcja-rodzajuslugiid'>" + opcje(["Usługa szkoleniowa"]) + "</select>",
      "<select id='formularzwstepnysekcja-podrodzajuslugiid'>" + opcje(["Usługa szkoleniowa"]) + "</select>",
      "<select id='formularzwstepnysekcja-formaswiadczenia'>" + opcje(["zdalna w czasie rzeczywistym", "stacjonarna"]) + "</select>",
      "<select id='formularzwstepnysekcja-wariantzajec'>" + opcje(["Zajęcia grupowe"]) + "</select>",
      "<select id='formularzwstepnysekcja-podstawauzyskaniawpisuid'>" + opcje(["Certyfikat systemu zarządzania jakością wg. ISO 9001:2015 (PN-EN ISO 9001:2015) - w zakresie usług szkoleniowych"]) + "</select>",
      "<label id='formularzwstepnysekcja-czyuslugadedykowanaLabel'><input type='checkbox' id='formularzwstepnysekcja-czyuslugadedykowana'><span>NIE</span></label>",
      "</form>"
    ].join("");
    return dokument;
  }

  function symulujAjax(dokument, kolejność, stareReferencje) {
    const selektory = [
      "#formularzwstepnysekcja-rodzajuslugiid", "#formularzwstepnysekcja-podrodzajuslugiid",
      "#formularzwstepnysekcja-formaswiadczenia", "#formularzwstepnysekcja-wariantzajec",
      "#formularzwstepnysekcja-podstawauzyskaniawpisuid"
    ];
    selektory.forEach(function nasłuchuj(selektor, indeks) {
      dokument.querySelector(selektor).addEventListener("change", function przebuduj() {
        kolejność.push(selektor);
        if (indeks < selektory.length - 1) {
          const następny = dokument.querySelector(selektory[indeks + 1]);
          stareReferencje.push(następny);
          następny.replaceWith(następny.cloneNode(true));
          symulujPojedynczyAjax(dokument, selektory, indeks + 1, kolejność, stareReferencje);
        } else {
          const tytuł = dokument.createElement("input");
          tytuł.id = "informacjepodstawowesekcja-tytuluslugi";
          dokument.querySelector("form").appendChild(tytuł);
        }
      }, { once: true });
    });
  }

  function symulujPojedynczyAjax(dokument, selektory, indeks, kolejność, stareReferencje) {
    const pole = dokument.querySelector(selektory[indeks]);
    pole.addEventListener("change", function przebuduj() {
      kolejność.push(selektory[indeks]);
      if (indeks < selektory.length - 1) {
        const następny = dokument.querySelector(selektory[indeks + 1]);
        stareReferencje.push(następny);
        następny.replaceWith(następny.cloneNode(true));
        symulujPojedynczyAjax(dokument, selektory, indeks + 1, kolejność, stareReferencje);
      } else {
        const tytuł = dokument.createElement("input");
        tytuł.id = "informacjepodstawowesekcja-tytuluslugi";
        dokument.querySelector("form").appendChild(tytuł);
      }
    }, { once: true });
  }

  test("IIST inicjalizuje dynamiczny formularz w wymaganej kolejności i odnawia DOM", async function sprawdź() {
    const dokument = utwórzDokument();
    const kolejność = [];
    const stareReferencje = [];
    symulujAjax(dokument, kolejność, stareReferencje);
    const wynik = await bur.inicjalizujFormularzWstępnyIist(dokument, { profilId: "iist", wybranyTermin: { forma: "online" }, pobierzKontoBur: function konto() { return kontoIist; }, limitInicjalizacjiMs: 200 });
    sprawdzWarunek(wynik.ok, wynik.komunikat);
    sprawdzRownosc(kolejność.join("|"), ["#formularzwstepnysekcja-rodzajuslugiid", "#formularzwstepnysekcja-podrodzajuslugiid", "#formularzwstepnysekcja-formaswiadczenia", "#formularzwstepnysekcja-wariantzajec", "#formularzwstepnysekcja-podstawauzyskaniawpisuid"].join("|"));
    sprawdzWarunek(stareReferencje.every(function odłączona(element) { return !element.isConnected; }));
    sprawdzRownosc(dokument.querySelector("#formularzwstepnysekcja-formaswiadczenia").selectedOptions[0].textContent, "zdalna w czasie rzeczywistym");
  });

  test("timeout przebudowy AJAX kończy inicjalizację kontrolowanym statusem", async function sprawdź() {
    const wynik = await bur.inicjalizujFormularzWstępnyIist(utwórzDokument(), { profilId: "iist", wybranyTermin: { forma: "online" }, pobierzKontoBur: function konto() { return kontoIist; }, limitInicjalizacjiMs: 20 });
    sprawdzWarunek(!wynik.ok);
    sprawdzRownosc(wynik.status, "wymaga_decyzji");
    sprawdzRownosc(wynik.kodBłędu, "TIMEOUT_AJAX_BUR");
  });

  test("brak dokładnej opcji BUR nie uruchamia podobnego wyboru", async function sprawdź() {
    const dokument = utwórzDokument();
    dokument.querySelector("#formularzwstepnysekcja-rodzajuslugiid").innerHTML = opcje(["Usługa szkoleniowa specjalistyczna"]);
    const wynik = await bur.inicjalizujFormularzWstępnyIist(dokument, { profilId: "iist", wybranyTermin: { forma: "online" }, pobierzKontoBur: function konto() { return kontoIist; }, limitInicjalizacjiMs: 20 });
    sprawdzWarunek(!wynik.ok);
    sprawdzRownosc(wynik.kodBłędu, "BRAK_OCZEKIWANEJ_OPCJI");
  });
})();
