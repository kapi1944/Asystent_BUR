(function testujStabilizacjęWorkflowIist(globalny) {
  const asystent = globalny.BurAsystent;
  const pamięćFixture = {};
  const warianty = [
    { dni: 1, plik: "iist-online-1-dzien.html", koniec: "10-09-2027", pozycje: 10, szablon: "iist-online-1-dzien", sumy: ["06:00", "04:40", "00:20", "01:00", "06:40"] },
    { dni: 2, plik: "iist-online-2-dni.html", koniec: "11-09-2027", pozycje: 17, szablon: "iist-online-2-dni", sumy: ["12:00", "09:40", "00:20", "02:00", "13:20"] },
    { dni: 3, plik: "iist-online-3-dni.html", koniec: "12-09-2027", pozycje: 24, szablon: "iist-online-3-dni", sumy: ["18:00", "14:40", "00:20", "03:00", "20:00"] }
  ];

  async function pobierzFixture(nazwa) {
    if (!pamięćFixture[nazwa]) {
      pamięćFixture[nazwa] = await fetch("fixtures/" + nazwa).then(function odczytaj(odpowiedź) {
        if (!odpowiedź.ok) { throw new Error("Nie udało się odczytać fixture " + nazwa + "."); }
        return odpowiedź.text();
      });
    }
    return pamięćFixture[nazwa];
  }

  async function dokumentFixture(nazwa) {
    return new DOMParser().parseFromString(await pobierzFixture(nazwa), "text/html");
  }

  function znajdźDefinicję(definicje, id) {
    const definicja = definicje.find(function znajdź(pozycja) { return pozycja.id === id; });
    sprawdzWarunek(Boolean(definicja), "Brak definicji " + id + ".");
    return definicja;
  }

  function zbudujMetrykę(szkolenie, termin, harmonogram, wariant) {
    return {
      profilId: "iist",
      nazwaProfilu: "IIST",
      tytułSzkolenia: szkolenie.tytułPoNormalizacjiBur || szkolenie.tytułOryginalny,
      urlŹródłowy: szkolenie.urlŹródła,
      dataStartBur: termin.dataStartBur,
      dataKoniecBur: termin.dataKoniecBur,
      forma: termin.forma,
      liczbaDni: wariant.dni,
      identyfikatorWybranegoTerminu: "fixture-iist-" + wariant.dni,
      szablonId: harmonogram.szablonId,
      nazwaSzablonu: harmonogram.nazwaSzablonu,
      wersjaSzablonu: harmonogram.wersjaSzablonu,
      podsumowanie: harmonogram.podsumowanie
    };
  }

  function wstawHarmonogramDoFixture(dokument, pozycje) {
    const ciało = dokument.querySelector("#harmonogram-grid tbody");
    pozycje.forEach(function dodajPozycję(pozycja, indeks) {
      const wiersz = dokument.createElement("tr");
      [indeks + 1, pozycja.typ_aktywnosci, pozycja.dzien_swiadczenia, pozycja.czas_rozpoczecia, pozycja.czas_zakonczenia, pozycja.przedmiot, pozycja.prowadzacy].forEach(function dodajKomórkę(wartość) {
        const komórka = dokument.createElement("td");
        komórka.textContent = wartość;
        wiersz.appendChild(komórka);
      });
      ciało.appendChild(wiersz);
    });
  }

  function odczytajHarmonogramZFixture(dokument) {
    return Array.from(dokument.querySelectorAll("#harmonogram-grid tbody tr")).map(function odczytaj(wiersz) {
      const komórki = Array.from(wiersz.cells).map(function tekst(komórka) { return komórka.textContent.trim(); });
      return { typAktywności: komórki[1], data: komórki[2], od: komórki[3], do: komórki[4], przedmiot: komórki[5], prowadzący: komórki[6] };
    });
  }

  function poprawnyKontekstImportu(szkolenie, termin, harmonogram, wariant) {
    const metryka = zbudujMetrykę(szkolenie, termin, harmonogram, wariant);
    return {
      metryka: metryka,
      aktywnyProfilId: "iist",
      wykryteKontoBur: { profilId: "iist", nazwaOrganizacji: "IIST" },
      aktualnyTerminBur: { tytuł: metryka.tytułSzkolenia, dataRozpoczęcia: termin.dataStartBur, dataZakończenia: termin.dataKoniecBur, tryb: "online" },
      identyfikatorWybranegoTerminu: metryka.identyfikatorWybranegoTerminu,
      pozycje: harmonogram.pozycje,
      osobyProwadząceTekst: "Ekspert IIST ekspert@iist.pl Koordynator IIST koordynator@iist.pl"
    };
  }

  warianty.forEach(function dodajTestWariantu(wariant) {
    test("E2E IIST online " + wariant.dni + " dni przechodzi pełny workflow na fixtures", async function sprawdź() {
      const htmlIist = await pobierzFixture(wariant.plik);
      const wynikParsera = asystent.parsujHtmlIist(htmlIist, "https://szkoleniaiist.com.pl/fixture-" + wariant.dni + "/");
      const szkolenie = wynikParsera.szkolenie;
      const termin = szkolenie.terminy[0];
      const dokumentBur = await dokumentFixture("bur-pusty-formularz.html");
      const konto = asystent.wykryjProfilPoNazwieKontaBur(dokumentBur.querySelector("header").textContent);

      sprawdzRownosc(szkolenie.profilId, "iist", "Nie wykryto profilu IIST.");
      sprawdzRownosc(konto.id, "iist", "Nie wykryto konta IIST.");
      sprawdzWarunek(szkolenie.tytułOryginalny.includes("Audytor"), "Nie pobrano szkolenia.");
      sprawdzRownosc(termin.forma, "online");
      sprawdzRownosc(termin.dataStartBur, "10-09-2027");
      sprawdzRownosc(termin.dataKoniecBur, wariant.koniec);
      sprawdzRownosc(termin.dataZakończeniaRekrutacjiBur, "09-09-2027");

      const propozycje = asystent.przygotujPropozycjeWypełnieniaBur(dokumentBur, szkolenie, termin, { profilId: "iist" });
      const definicje = asystent.pobierzDefinicjePólWypełnieniaBur({ profilId: "iist", szkolenieŹródłowe: szkolenie, wybranyTermin: termin });
      sprawdzWarunek(propozycje.length >= 20, "Nie przygotowano kompletnej propozycji.");
      sprawdzRownosc(znajdźDefinicję(definicje, "podstawa-wpisu").wartośćProponowana, asystent.pobierzProfilDostawcy("iist").podstawaWpisuBur);
      sprawdzRownosc(znajdźDefinicję(definicje, "opis-celu").wartośćProponowana, szkolenie.sekcje.celEdukacyjnyOpis);
      sprawdzWarunek(znajdźDefinicję(definicje, "program").wartośćProponowana.includes("Po zakończeniu szkolenia"));
      sprawdzRownosc(znajdźDefinicję(definicje, "osoby-prowadzace").wartośćProponowana.length, 2);
      sprawdzRownosc(znajdźDefinicję(definicje, "kontakt-email").wartośćProponowana, "bur@iist.pl");

      let operacja = asystent.przejdźOperacjęBur(asystent.utwórzOperacjęBur({ identyfikatorKartyBur: 1, odciskSzkolenia: szkolenie.tytułPoNormalizacjiBur, indeksTerminu: 0 }), "przygotowywanie");
      operacja = asystent.przejdźOperacjęBur(operacja, "oczekuje_na_zatwierdzenie");
      operacja = asystent.przejdźOperacjęBur(operacja, "wprowadzanie");
      sprawdzRownosc(operacja.etap, "wprowadzanie", "Zatwierdzenie zmian nie uruchomiło wprowadzania.");

      for (const idDefinicji of ["tytul", "opis-celu", "program", "kontakt-imie", "kontakt-email", "kontakt-telefon"]) {
        const definicja = znajdźDefinicję(definicje, idDefinicji);
        const wynikZapisu = await asystent.ustawPoleBurZWeryfikacją(dokumentBur, {
          sekcja: definicja.sekcja,
          pole: definicja.pole,
          typPola: definicja.typPola,
          wartość: definicja.wartośćProponowana,
          definicjaPola: definicja.definicjaPola,
          zezwólNaNadpisanie: true
        });
        sprawdzWarunek(wynikZapisu.ok, "Nie zapisano zatwierdzonego pola " + idDefinicji + ": " + wynikZapisu.komunikat);
      }

      const profilIist = asystent.pobierzProfilDostawcy("iist");
      const tabelaOsób = dokumentBur.querySelector("#osobyprowadzace-grid tbody");
      const wynikOsób = await asystent.zastąpOsobyProwadzące(dokumentBur, [profilIist.osobaProwadzącaUsługę, profilIist.osobaProwadzącaWalidację], {
        pobierzWiersze: function pobierzWiersze() { return Array.from(tabelaOsób.rows); },
        usuńWiersz: function usuńWiersz(wiersz) { wiersz.remove(); return true; },
        dodajOsobę: function dodajOsobę(osoba) { const wiersz = tabelaOsób.insertRow(); wiersz.insertCell().textContent = osoba.imięINazwisko; wiersz.insertCell().textContent = osoba.email; return true; },
        potwierdźOsobę: function potwierdźOsobę() { return true; }
      });
      sprawdzWarunek(wynikOsób.ok);
      sprawdzRownosc(tabelaOsób.rows.length, 2);
      sprawdzWarunek(tabelaOsób.textContent.includes("ekspert@iist.pl") && tabelaOsób.textContent.includes("koordynator@iist.pl"));

      const harmonogram = asystent.generujHarmonogramDlaTerminu({ profilId: "iist", forma: termin.forma, dataStartBur: termin.dataStartBur, dataKoniecBur: termin.dataKoniecBur });
      sprawdzWarunek(harmonogram.ok, harmonogram.komunikat);
      sprawdzRownosc(harmonogram.szablonId, wariant.szablon);
      sprawdzRownosc(harmonogram.pozycje.length, wariant.pozycje);
      sprawdzRownosc(JSON.stringify([harmonogram.podsumowanie.zegarowe, harmonogram.podsumowanie.zajęcia, harmonogram.podsumowanie.walidacja, harmonogram.podsumowanie.przerwy, harmonogram.podsumowanie.dydaktyczneBezPrzerw]), JSON.stringify(wariant.sumy));

      const csv = asystent.wygenerujDaneCsvHarmonogramu(harmonogram.pozycje);
      const tekstCsv = new TextDecoder("utf-8").decode(csv).replace(/^\uFEFF/, "");
      sprawdzRownosc(tekstCsv.trim().split("\r\n").length, wariant.pozycje + 1, "CSV ma niepoprawną liczbę wierszy.");
      sprawdzWarunek(tekstCsv.includes('"ekspert@iist.pl"') && tekstCsv.includes('"koordynator@iist.pl"'));

      wstawHarmonogramDoFixture(dokumentBur, harmonogram.pozycje);
      const poImporcie = odczytajHarmonogramZFixture(dokumentBur);
      const porównanie = asystent.porównajHarmonogramPoImporcie(harmonogram.pozycje, poImporcie, harmonogram.podsumowanie, harmonogram.podsumowanie);
      sprawdzWarunek(porównanie.ok, porównanie.błędy.join(" "));
      const checklista = asystent.walidujKontekstImportuHarmonogramu(poprawnyKontekstImportu(szkolenie, termin, harmonogram, wariant));
      sprawdzWarunek(checklista.ok, checklista.błąd);
    });
  });

  test("Fixtures BUR reprezentują pusty częściowy istniejący i oba zestawy osób", async function sprawdź() {
    const pusty = await dokumentFixture("bur-pusty-formularz.html");
    const częściowy = await dokumentFixture("bur-czesciowo-wypelniony.html");
    const istniejący = await dokumentFixture("bur-istniejacy-harmonogram.html");
    const semper = await dokumentFixture("bur-osoby-semper.html");
    const iist = await dokumentFixture("bur-osoby-iist.html");
    sprawdzRownosc(pusty.querySelector("#informacjepodstawowesekcja-tytuluslugi").value, "");
    sprawdzRownosc(częściowy.querySelector("#informacjepodstawowesekcja-tytuluslugi").value, "Stary tytuł");
    sprawdzRownosc(istniejący.querySelectorAll("#harmonogram-grid tbody tr").length, 1);
    sprawdzWarunek(/szkolenia-semper\.pl/.test(semper.querySelector("#osobyprowadzace-grid").textContent));
    sprawdzWarunek(/ekspert@iist\.pl/.test(iist.querySelector("#osobyprowadzace-grid").textContent));
  });

  test("Workflow blokuje konflikty konta tytułu terminu dat i osób", async function sprawdź() {
    const szkolenie = asystent.parsujHtmlIist(await pobierzFixture("iist-online-2-dni.html"), "https://szkoleniaiist.com.pl/fixture/").szkolenie;
    const termin = szkolenie.terminy[0];
    const harmonogram = asystent.generujHarmonogramDlaTerminu({ profilId: "iist", forma: "online", dataStartBur: termin.dataStartBur, dataKoniecBur: termin.dataKoniecBur });
    const wariant = warianty[1];
    const przypadki = [
      ["konto", function zmień(kontekst) { kontekst.wykryteKontoBur = { profilId: "semper" }; }],
      ["profil", function zmień(kontekst) { kontekst.aktywnyProfilId = "semper"; }],
      ["termin", function zmień(kontekst) { kontekst.identyfikatorWybranegoTerminu = "inny"; }],
      ["tytuł", function zmień(kontekst) { kontekst.aktualnyTerminBur.tytuł = "Inny tytuł"; }],
      ["daty", function zmień(kontekst) { kontekst.aktualnyTerminBur.dataZakończenia = "12-09-2027"; }],
      ["ekspert", function zmień(kontekst) { kontekst.osobyProwadząceTekst = "Koordynator IIST koordynator@iist.pl"; }],
      ["koordynator", function zmień(kontekst) { kontekst.osobyProwadząceTekst = "Ekspert IIST ekspert@iist.pl"; }]
    ];
    przypadki.forEach(function sprawdźPrzypadek(przypadek) {
      const kontekst = poprawnyKontekstImportu(szkolenie, termin, harmonogram, wariant);
      przypadek[1](kontekst);
      sprawdzWarunek(!asystent.walidujKontekstImportuHarmonogramu(kontekst).ok, "Nie zablokowano przypadku: " + przypadek[0]);
    });
    sprawdzWarunek(!asystent.czyProfilZgodnyZKontemBur("semper", { profilId: "iist" }));
    sprawdzWarunek(!asystent.czyProfilZgodnyZKontemBur("iist", { profilId: "semper" }));
    sprawdzRownosc(asystent.wykryjProfilPoNazwieKontaBur("SEMPER").id, "semper");
    sprawdzRownosc(asystent.wykryjProfilPoNazwieKontaBur("MIĘDZYNARODOWY INSTYTUT SZKOLEŃ SPECJALISTYCZNYCH IIST PARAG KESARIA").id, "iist", "Zmiana konta nie została wykryta.");
  });

  test("Workflow blokuje pozostałości SEMPER niepełny import liczbę pozycji i sumy", async function sprawdź() {
    const szkolenie = asystent.parsujHtmlIist(await pobierzFixture("iist-online-1-dzien.html"), "https://szkoleniaiist.com.pl/fixture/").szkolenie;
    const termin = szkolenie.terminy[0];
    const harmonogram = asystent.generujHarmonogramDlaTerminu({ profilId: "iist", forma: "online", dataStartBur: termin.dataStartBur, dataKoniecBur: termin.dataKoniecBur });
    const częściowy = asystent.porównajHarmonogramPoImporcie(harmonogram.pozycje, harmonogram.pozycje.slice(0, 5), harmonogram.podsumowanie, {});
    sprawdzWarunek(!częściowy.ok && częściowy.częściowyImport);
    const złaLiczba = poprawnyKontekstImportu(szkolenie, termin, harmonogram, warianty[0]);
    złaLiczba.pozycje = złaLiczba.pozycje.slice(0, 9);
    sprawdzWarunek(!asystent.walidujKontekstImportuHarmonogramu(złaLiczba).ok);
    const złeSumy = poprawnyKontekstImportu(szkolenie, termin, harmonogram, warianty[0]);
    złeSumy.metryka.podsumowanie = Object.assign({}, złeSumy.metryka.podsumowanie, { minutyZajęć: 1 });
    sprawdzWarunek(!asystent.walidujKontekstImportuHarmonogramu(złeSumy).ok);
    const adresSemper = poprawnyKontekstImportu(szkolenie, termin, harmonogram, warianty[0]);
    adresSemper.pozycje = adresSemper.pozycje.map(function kopia(pozycja) { return Object.assign({}, pozycja); });
    adresSemper.pozycje[1].prowadzacy = "trener@szkolenia-semper.pl";
    sprawdzWarunek(!asystent.walidujKontekstImportuHarmonogramu(adresSemper).ok);
    const osobySemper = await dokumentFixture("bur-osoby-semper.html");
    sprawdzWarunek(/semper/i.test(osobySemper.querySelector("#osobyprowadzace-grid").textContent));
    const pozostałościOsób = poprawnyKontekstImportu(szkolenie, termin, harmonogram, warianty[0]);
    pozostałościOsób.osobyProwadząceTekst += " " + osobySemper.querySelector("#osobyprowadzace-grid").textContent;
    const kontrolaOsób = asystent.walidujKontekstImportuHarmonogramu(pozostałościOsób);
    sprawdzWarunek(!kontrolaOsób.ok && kontrolaOsób.błąd.includes("pozostałości osób SEMPER"));
  });

  test("Ponowne otwarcie panelu odświeżenie strony i wygasła operacja zachowują bezpieczny stan", function sprawdź() {
    const harmonogram = asystent.generujHarmonogramDlaTerminu({ profilId: "iist", forma: "online", dataStartBur: "10-09-2027", dataKoniecBur: "10-09-2027" });
    const zapis = { harmonogramBurPrzygotowany: true, harmonogramBurNieaktualny: false, ostatniePozycjeHarmonogramuBur: harmonogram.pozycje };
    sprawdzWarunek(asystent.sprawdźGotowośćHarmonogramuBur(JSON.parse(JSON.stringify(zapis))).ok, "Ponowne otwarcie panelu utraciło przygotowanie.");
    sprawdzWarunek(asystent.sprawdźGotowośćHarmonogramuBur(JSON.parse(JSON.stringify(zapis))).ok, "Odświeżenie strony utraciło przygotowanie.");
    let operacja = asystent.przejdźOperacjęBur(asystent.utwórzOperacjęBur({ identyfikatorKartyBur: 1 }), "przygotowywanie");
    operacja.zaktualizowano = "2000-01-01T00:00:00.000Z";
    sprawdzWarunek(asystent.czyOperacjaBurWygasła(operacja));
    sprawdzRownosc(asystent.zwolnijWygasłąOperacjęBur(operacja).blokuje, false);
  });

  test("Brak dostępu do strony źródłowej zwraca kontrolowany błąd", async function sprawdź() {
    const poprzedniFetch = globalny.fetch;
    globalny.fetch = function odmówDostępu() { return Promise.resolve({ ok: false, status: 403 }); };
    try {
      let błąd = null;
      try { await asystent.importujSzkolenieZLinkuIist("https://szkoleniaiist.com.pl/brak-dostepu/"); } catch (wyjątek) { błąd = wyjątek; }
      sprawdzWarunek(Boolean(błąd) && błąd.message.includes("403"));
    } finally {
      globalny.fetch = poprzedniFetch;
    }
  });

  test("Dwukrotne uruchomienie importu jest blokowane w panelu", async function sprawdź() {
    const kod = await fetch("../panel/panel.js").then(function odczytaj(odpowiedź) { return odpowiedź.text(); });
    sprawdzWarunek(kod.includes("czyImportHarmonogramuWToku"));
    sprawdzWarunek(kod.includes("IMPORT_HARMONOGRAMU_W_TOKU"));
    sprawdzWarunek(kod.includes(".finally(function zakończImport()"));
  });

  test("Regresja profili nie miesza danych SEMPER i IIST", function sprawdź() {
    const semper = asystent.generujHarmonogramDlaTerminu({ profilId: "semper", forma: "online", dataStartBur: "10-09-2027", dataKoniecBur: "11-09-2027", tematSzkolenia: "Szkolenie SEMPER" });
    const iist = asystent.generujHarmonogramDlaTerminu({ profilId: "iist", forma: "online", dataStartBur: "10-09-2027", dataKoniecBur: "11-09-2027" });
    sprawdzWarunek(!JSON.stringify(semper).includes("@iist.pl"));
    sprawdzWarunek(!JSON.stringify(iist).includes("szkolenia-semper.pl"));
    sprawdzWarunek(!JSON.stringify(asystent.pobierzDefinicjePólWypełnieniaBur({ profilId: "semper", szkolenieŹródłowe: { profilId: "semper", sekcje: {} }, wybranyTermin: { forma: "online" } })).includes("IIST"));
  });

  test("Wydajność etapów workflow IIST pozostaje w granicach testu lokalnego", function sprawdź() {
    const początekGeneratora = performance.now();
    let harmonogram;
    for (let indeks = 0; indeks < 1000; indeks += 1) {
      harmonogram = asystent.generujHarmonogramDlaTerminu({ profilId: "iist", forma: "online", dataStartBur: "10-09-2027", dataKoniecBur: "12-09-2027" });
    }
    const generowaniePozycji = performance.now() - początekGeneratora;

    const dokument = document.implementation.createHTMLDocument("Pomiar");
    const początekRenderu = performance.now();
    const tabela = dokument.createElement("table");
    harmonogram.pozycje.forEach(function renderuj(pozycja) { const wiersz = tabela.insertRow(); Object.values(pozycja).forEach(function dodaj(wartość) { wiersz.insertCell().textContent = wartość; }); });
    dokument.body.appendChild(tabela);
    const renderPodglądu = performance.now() - początekRenderu;

    const początekCsv = performance.now();
    const csv = asystent.wygenerujDaneCsvHarmonogramu(harmonogram.pozycje);
    const przygotowanieCsv = performance.now() - początekCsv;

    const dokumentImportu = document.implementation.createHTMLDocument("Import");
    dokumentImportu.body.innerHTML = "<div id='harmonogram-grid'><div><table><tbody></tbody></table></div></div>";
    const początekImportu = performance.now();
    wstawHarmonogramDoFixture(dokumentImportu, harmonogram.pozycje);
    const importBur = performance.now() - początekImportu;

    const początekWeryfikacji = performance.now();
    const raport = asystent.porównajHarmonogramPoImporcie(harmonogram.pozycje, odczytajHarmonogramZFixture(dokumentImportu), harmonogram.podsumowanie, harmonogram.podsumowanie);
    const weryfikacja = performance.now() - początekWeryfikacji;
    sprawdzWarunek(raport.ok && csv.length > 3);
    sprawdzWarunek(generowaniePozycji < 1000, "1000 generowań trwało zbyt długo: " + generowaniePozycji + " ms.");
    [renderPodglądu, przygotowanieCsv, importBur, weryfikacja].forEach(function sprawdźCzas(czas) { sprawdzWarunek(czas < 250, "Etap fixture trwał zbyt długo: " + czas + " ms."); });

    const metryki = { generowanie1000Ms: generowaniePozycji, generowanieJednoMs: generowaniePozycji / 1000, renderPodgląduMs: renderPodglądu, przygotowanieCsvMs: przygotowanieCsv, importFixtureMs: importBur, weryfikacjaMs: weryfikacja };
    let element = document.getElementById("metryki-wydajnosci-iist");
    if (!element) { element = document.createElement("pre"); element.id = "metryki-wydajnosci-iist"; element.hidden = true; document.body.appendChild(element); }
    element.textContent = JSON.stringify(metryki);
  });
})(globalThis);
