(function testujWorkflowHarmonogramuIist(globalny) {
  const asystent = globalny.BurAsystent;

  function przygotuj(liczbaDni) {
    const datyKońcowe = { 1: "10-09-2027", 2: "11-09-2027", 3: "12-09-2027", 4: "13-09-2027" };
    return asystent.generujHarmonogramDlaTerminu({
      profilId: "iist",
      forma: "online",
      dataStartBur: "10-09-2027",
      dataKoniecBur: datyKońcowe[liczbaDni]
    });
  }

  function zbudujMetrykę(liczbaDni) {
    const wynik = przygotuj(liczbaDni);
    return {
      profilId: "iist",
      nazwaProfilu: "IIST",
      tytułSzkolenia: "Audyt ISO",
      urlŹródłowy: "https://szkoleniaiist.com.pl/audyt-iso/",
      dataStartBur: "10-09-2027",
      dataKoniecBur: liczbaDni === 1 ? "10-09-2027" : (liczbaDni === 2 ? "11-09-2027" : "12-09-2027"),
      forma: "online",
      liczbaDni: liczbaDni,
      identyfikatorWybranegoTerminu: "termin-iist-" + liczbaDni,
      przygotowanoAt: "2027-08-01T10:00:00.000Z",
      szablonId: wynik.szablonId,
      nazwaSzablonu: wynik.nazwaSzablonu,
      wersjaSzablonu: wynik.wersjaSzablonu,
      podsumowanie: wynik.podsumowanie
    };
  }

  function poprawnyKontekst(liczbaDni) {
    const wynik = przygotuj(liczbaDni);
    const metryka = zbudujMetrykę(liczbaDni);
    return {
      metryka: metryka,
      aktywnyProfilId: "iist",
      wykryteKontoBur: { profilId: "iist" },
      aktualnyTerminBur: {
        tytuł: "Audyt ISO",
        dataRozpoczęcia: metryka.dataStartBur,
        dataZakończenia: metryka.dataKoniecBur,
        tryb: "online"
      },
      identyfikatorWybranegoTerminu: metryka.identyfikatorWybranegoTerminu,
      pozycje: wynik.pozycje,
      osobyProwadząceTekst: "Ekspert IIST ekspert@iist.pl Koordynator IIST koordynator@iist.pl"
    };
  }

  test("Workflow IIST automatycznie wybiera szablon 1 dnia", function sprawdź() {
    const wynik = przygotuj(1);
    sprawdzWarunek(wynik.ok);
    sprawdzRownosc(wynik.szablonId, "iist-online-1-dzien");
    sprawdzRownosc(wynik.nazwaSzablonu, "IIST online — 1 dzień");
  });

  test("Workflow IIST automatycznie wybiera szablon 2 dni", function sprawdź() {
    const wynik = przygotuj(2);
    sprawdzWarunek(wynik.ok);
    sprawdzRownosc(wynik.szablonId, "iist-online-2-dni");
  });

  test("Workflow IIST automatycznie wybiera szablon 3 dni", function sprawdź() {
    const wynik = przygotuj(3);
    sprawdzWarunek(wynik.ok);
    sprawdzRownosc(wynik.szablonId, "iist-online-3-dni");
    sprawdzRownosc(wynik.nazwaSzablonu, "IIST online — 3 dni");
  });

  test("Workflow IIST blokuje zakres 4 dni", function sprawdź() {
    const wynik = przygotuj(4);
    sprawdzWarunek(!wynik.ok);
    sprawdzRownosc(wynik.liczbaDni, 4);
  });

  test("Import IIST blokuje aktywny profil SEMPER", function sprawdź() {
    const kontekst = poprawnyKontekst(1);
    kontekst.aktywnyProfilId = "semper";
    const wynik = asystent.walidujKontekstImportuHarmonogramu(kontekst);
    sprawdzWarunek(!wynik.ok && wynik.błąd.includes("Aktywny profil"));
  });

  test("Import IIST blokuje wykryte konto SEMPER", function sprawdź() {
    const kontekst = poprawnyKontekst(1);
    kontekst.wykryteKontoBur = { profilId: "semper" };
    const wynik = asystent.walidujKontekstImportuHarmonogramu(kontekst);
    sprawdzWarunek(!wynik.ok && wynik.błąd.includes("nie jest kontem IIST"));
  });

  test("Import IIST blokuje zmianę terminu po przygotowaniu", function sprawdź() {
    const kontekst = poprawnyKontekst(2);
    kontekst.aktualnyTerminBur.dataZakończenia = "12-09-2027";
    const wynik = asystent.walidujKontekstImportuHarmonogramu(kontekst);
    sprawdzWarunek(!wynik.ok && wynik.błąd.includes("Termin BUR zmienił się"));
  });

  test("Import IIST blokuje zmianę formy i tytułu w BUR", function sprawdź() {
    const kontekst = poprawnyKontekst(2);
    kontekst.aktualnyTerminBur.tryb = "stacjonarna";
    kontekst.aktualnyTerminBur.tytuł = "Inne szkolenie";
    const wynik = asystent.walidujKontekstImportuHarmonogramu(kontekst);
    sprawdzWarunek(!wynik.ok && wynik.błąd.includes("Forma świadczenia") && wynik.błąd.includes("innego szkolenia"));
  });

  test("Import IIST blokuje zmianę profilu po przygotowaniu", function sprawdź() {
    const kontekst = poprawnyKontekst(2);
    kontekst.metryka.profilId = "semper";
    const wynik = asystent.walidujKontekstImportuHarmonogramu(kontekst);
    sprawdzWarunek(!wynik.ok && wynik.błąd.includes("Aktywny profil zmienił się"));
  });

  test("Import IIST blokuje brak osób prowadzących", function sprawdź() {
    const kontekst = poprawnyKontekst(1);
    kontekst.osobyProwadząceTekst = "Brak osób";
    const wynik = asystent.walidujKontekstImportuHarmonogramu(kontekst);
    sprawdzRownosc(wynik.kod, "BRAK_OSÓB_IIST");
    sprawdzWarunek(wynik.błąd.includes("Najpierw uzupełnij osoby prowadzące dla profilu IIST."));
  });

  test("Import IIST akceptuje obecność obu osób prowadzących", function sprawdź() {
    const wynik = asystent.walidujKontekstImportuHarmonogramu(poprawnyKontekst(3));
    sprawdzWarunek(wynik.ok, wynik.błąd);
  });

  test("Import IIST blokuje zmianę sum kontrolnych po przygotowaniu", function sprawdź() {
    const kontekst = poprawnyKontekst(1);
    kontekst.metryka.podsumowanie = Object.assign({}, kontekst.metryka.podsumowanie, { minutyZajęć: 1 });
    const wynik = asystent.walidujKontekstImportuHarmonogramu(kontekst);
    sprawdzWarunek(!wynik.ok && wynik.błąd.includes("Suma kontrolna minutyZajęć"));
  });

  test("Podgląd IIST pokazuje profil szablon i wszystkie sumy", async function sprawdź() {
    const kod = await fetch("../panel/panel.js").then(function odczytaj(odpowiedź) { return odpowiedź.text(); });
    ["Profil", "Forma", "Szablon", "Zakres dat", "Liczba pozycji", "Zajęcia", "Walidacja", "Przerwy", "Czas zegarowy", "Godziny dydaktyczne"].forEach(function sprawdźEtykietę(etykieta) {
      sprawdzWarunek(kod.includes('["' + etykieta + '"'), "Brak metryki podglądu: " + etykieta);
    });
    sprawdzWarunek(kod.includes('email + " — " + osoba.imięINazwisko'));
    const html = await fetch("../panel/panel.html").then(function odczytaj(odpowiedź) { return odpowiedź.text(); });
    const dokument = new DOMParser().parseFromString(html, "text/html");
    const kontrola = dokument.getElementById("kontrola-harmonogramu");
    const przyciskImportu = dokument.getElementById("przycisk-importuj-harmonogram-xlsx");
    sprawdzWarunek(Boolean(kontrola.compareDocumentPosition(przyciskImportu) & Node.DOCUMENT_POSITION_FOLLOWING));
  });

  test("Import tworzy CSV wyłącznie w pamięci", async function sprawdź() {
    const kod = await fetch("../content/bur-content.js").then(function odczytaj(odpowiedź) { return odpowiedź.text(); });
    const csv = asystent.wygenerujDaneCsvHarmonogramu(przygotuj(1).pozycje);
    sprawdzWarunek(csv instanceof Uint8Array && csv.length > 3);
    sprawdzWarunek(kod.includes("new File([bajtyCsv]") && kod.includes("new DataTransfer()"));
    sprawdzWarunek(!kod.includes("showOpenFilePicker"));
  });

  test("Diagnostyczny CSV IIST ma wymaganą nazwę", function sprawdź() {
    sprawdzRownosc(asystent.zbudujDiagnostycznąNazwęCsvIist(zbudujMetrykę(3)), "BUR_IIST_Online_3dni_10-09-2027--12-09-2027.csv");
  });

  test("Porównanie po imporcie sprawdza każdy wiersz i kolejność", function sprawdź() {
    const wynik = przygotuj(1);
    const aktualne = wynik.pozycje.map(function skopiuj(pozycja) { return Object.assign({}, pozycja); });
    sprawdzWarunek(asystent.porównajHarmonogramPoImporcie(wynik.pozycje, aktualne, wynik.podsumowanie, wynik.podsumowanie).ok);
    aktualne[0] = Object.assign({}, aktualne[1]);
    const różny = asystent.porównajHarmonogramPoImporcie(wynik.pozycje, aktualne, wynik.podsumowanie, wynik.podsumowanie);
    sprawdzWarunek(!różny.ok && różny.różnice.some(function maRóżnicę(różnica) { return różnica.pozycja === 1; }));
  });

  test("Porównanie wykrywa częściowy import IIST", function sprawdź() {
    const wynik = przygotuj(2);
    const raport = asystent.porównajHarmonogramPoImporcie(wynik.pozycje, wynik.pozycje.slice(0, 5), wynik.podsumowanie, {});
    sprawdzWarunek(!raport.ok && raport.częściowyImport);
    sprawdzRownosc(raport.liczbaPozycjiWTabeli, 5);
    sprawdzRownosc(raport.liczbaOczekiwanychPozycji, 17);
  });

  test("Istniejący harmonogram wymaga podglądu różnic i potwierdzenia", async function sprawdź() {
    const pliki = await Promise.all(["../content/bur-content.js", "../panel/panel.js"].map(function pobierz(ścieżka) { return fetch(ścieżka).then(function odczytaj(odpowiedź) { return odpowiedź.text(); }); }));
    sprawdzWarunek(pliki[0].includes("istniejącePozycje: true") && pliki[0].includes("raportRóżnic.różnice"));
    sprawdzWarunek(pliki[1].includes("window.confirm") && pliki[1].includes("Usuń obecny harmonogram i wprowadź przygotowany"));
  });

  test("Workflow IIST blokuje adresy SEMPER", function sprawdź() {
    const kontekst = poprawnyKontekst(1);
    kontekst.pozycje[1] = Object.assign({}, kontekst.pozycje[1], { prowadzacy: "trener@szkolenia-semper.pl" });
    const wynik = asystent.walidujKontekstImportuHarmonogramu(kontekst);
    sprawdzWarunek(!wynik.ok && wynik.błąd.includes("adres SEMPER"));
  });

  test("Workflow SEMPER zachowuje generator zgodności i import CSV", function sprawdź() {
    const wynik = asystent.generujHarmonogramDlaTerminu({ profilId: "semper", forma: "online", dataStartBur: "10-09-2027", dataKoniecBur: "11-09-2027", tematSzkolenia: "SEMPER" });
    sprawdzWarunek(wynik.ok);
    sprawdzRownosc(wynik.szablonId, "semper-zgodność");
    const kontrola = asystent.walidujKontekstImportuHarmonogramu({ metryka: { profilId: "semper" }, aktywnyProfilId: "semper" });
    sprawdzWarunek(kontrola.ok, kontrola.błąd);
  });

  test("UI harmonogramu zmienia nazwy źródeł dla profilu IIST lokalnie", async function sprawdź() {
    const kod = await fetch("../panel/panel.js").then(function odczytaj(odpowiedź) { return odpowiedź.text(); });
    sprawdzWarunek(kod.includes('"Terminy " + profil.nazwa'));
    sprawdzWarunek(kod.includes('"Diagnostyka " + profil.nazwa'));
    sprawdzWarunek(kod.includes('dane.źródło === "iist"') || (await fetch("../shared/terminy-bur.js").then(function odczytaj(odpowiedź) { return odpowiedź.text(); })).includes('dane.źródło === "iist"'));
  });
})(globalThis);
