(function testyWorkflowSeriiBur() {
  const asystent = window.BurAsystent;

  function termin(indeks, liczbaDni) {
    const dzień = 10 + indeks * 2;
    const koniec = dzień + Number(liczbaDni || 1) - 1;
    return {
      identyfikator: "termin-workflow-" + indeks,
      dataStartBur: String(dzień).padStart(2, "0") + "-09-2027",
      dataKoniecBur: String(koniec).padStart(2, "0") + "-09-2027",
      dataZakończeniaRekrutacjiBur: String(dzień - 1).padStart(2, "0") + "-09-2027",
      forma: "online", miejsce: "Szkolenie online", cena: "1200 PLN"
    };
  }

  function daneSerii(liczba) {
    const terminy = Array.from({ length: liczba }, function utwórz(_, indeks) { return termin(indeks, 1); });
    const szkolenie = {
      profilId: "iist", tytułPoNormalizacjiBur: "Szkolenie IIST",
      urlŹródła: "https://szkoleniaiist.com.pl/workflow", sekcje: { program: "Program IIST" }, terminy: terminy
    };
    return {
      profilId: "iist", szkolenieId: "iist-workflow", tytul: szkolenie.tytułPoNormalizacjiBur,
      urlZrodla: szkolenie.urlŹródła, odciskSzkolenia: asystent.utwórzOdciskSzkoleniaSerii(szkolenie),
      sposobTworzeniaKart: "nowe_formularze", szkolenie: szkolenie, terminy: terminy,
      indeksyTerminów: terminy.map(function indeks(_, pozycja) { return pozycja; })
    };
  }

  function utwórzŚrodowisko(opcje) {
    const ustawienia = opcje || {};
    const magazyn = ustawienia.magazyn || { session: {}, local: {} };
    const karty = ustawienia.karty || new Map();
    const wiadomości = [];
    const liczbaWywołań = {};
    let licznikKart = 200;
    let aktywneEtapy = 0;
    let maksimumAktywnych = 0;
    let aktywnaKarta = { id: 199, url: "https://uslugirozwojowe.parp.gov.pl/dodaj-usluge", status: "complete", active: true };

    function raport(tabId) {
      const kopiowanie = ustawienia.kopiowanie;
      return {
        url: tabId === 199 ? aktywnaKarta.url : (karty.get(tabId) || {}).url,
        kontoBur: { profilId: ustawienia.kontoSemper ? "semper" : "iist", nazwaOrganizacji: ustawienia.kontoSemper ? "SEMPER" : "IIST" },
        typFormularza: kopiowanie && tabId === 199 ? "edycja_uslugi" : "dodawanie_uslugi",
        czyPustyFormularz: !kopiowanie, odciskInstancjiFormularza: "formularz-" + tabId,
        wzorzecKopiowania: kopiowanie ? {
          urlWzorca: aktywnaKarta.url, numerUslugi: "12345",
          adresAkcjiKopiowania: "https://uslugirozwojowe.parp.gov.pl/kopiuj/12345",
          jednoznacznaAkcjaKopiowania: true, kopieBezposrednioZTegoSamegoWzorca: true,
          kopiowanieLancuchoweDozwolone: false
        } : { numerUslugi: "", jednoznacznaAkcjaKopiowania: false, kopieBezposrednioZTegoSamegoWzorca: false }
      };
    }

    async function wynikEtapu(tabId, wiadomość) {
      aktywneEtapy += 1; maksimumAktywnych = Math.max(maksimumAktywnych, aktywneEtapy);
      await Promise.resolve();
      const etap = wiadomość.etap;
      const kontekst = wiadomość.kontekst;
      const klucz = kontekst.jobId + "|" + etap;
      liczbaWywołań[klucz] = (liczbaWywołań[klucz] || 0) + 1;
      let wynik = { ok: true, etap: etap, status: "zakończony", czasMs: 1 };
      if (ustawienia.błądLokalnyTerminu === kontekst.wybranyTermin.identyfikator && etap === "wypelnianie_pol") {
        wynik = { ok: false, etap: etap, status: "blad", błąd: "Lokalny błąd pola.", czasMs: 1 };
      } else if (ustawienia.globalnyBłądTerminu === kontekst.wybranyTermin.identyfikator && etap === "kontrola_kontekstu") {
        wynik = { ok: false, etap: etap, status: "wymaga_decyzji", globalnyBłąd: true, błąd: "Konto BUR przestało być kontem IIST.", czasMs: 1 };
      } else if (ustawienia.błądRaz && ustawienia.błądRaz.etap === etap && !ustawienia.błądRaz.użyty) {
        ustawienia.błądRaz.użyty = true; wynik = { ok: false, etap: etap, status: "blad", błąd: "Błąd jednorazowy.", czasMs: 1 };
      } else if (etap === "kontrola_stanu_formularza") {
        wynik.stanFormularza = ustawienia.kopiowanie ? "kopia" : "pusty";
      } else if (etap === "przygotowanie_propozycji") {
        wynik.propozycje = [{ id: "data-rozpoczecia", zaznaczona: true, wartośćProponowana: kontekst.wybranyTermin.dataStartBur }];
      } else if (etap === "wypelnianie_pol") {
        wynik.liczbaUzupełnionychPól = 12;
      } else if (etap === "generowanie_harmonogramu") {
        const harmonogram = asystent.generujHarmonogramDlaTerminu({ profilId: "iist", forma: "online", dataStartBur: kontekst.wybranyTermin.dataStartBur, dataKoniecBur: kontekst.wybranyTermin.dataKoniecBur });
        wynik = Object.assign(wynik, harmonogram, { statusHarmonogramu: "przygotowany" });
      } else if (etap === "import_harmonogramu" && ustawienia.ręcznyImportTerminu === kontekst.wybranyTermin.identyfikator) {
        wynik = { ok: false, etap: etap, status: "wymaga_recznego_importu", statusHarmonogramu: "wymaga_recznego_importu", csv: { nazwa: kontekst.jobId + ".csv", bajty: [239, 187, 191, 65] }, czasMs: 1 };
      } else if (etap === "import_harmonogramu") {
        wynik.statusHarmonogramu = "zaimportowany";
      } else if (etap === "weryfikacja_harmonogramu") {
        wynik.statusHarmonogramu = "zweryfikowany";
      } else if (etap === "walidacja_formularza") {
        wynik.wynikWalidacji = { statusOgólny: "poprawny", pozycje: [] };
        wynik.raportHarmonogramu = { ok: true };
        wynik.odciskFormularza = "odcisk-wyniku-" + kontekst.jobId;
        wynik.odciskInstancjiFormularza = "formularz-" + tabId;
      } else if (etap === "gotowe_do_kontroli") {
        wynik.odciskFormularza = kontekst.odciskFormularzaPoWalidacji;
      }
      aktywneEtapy -= 1;
      return { typ: asystent.KOMUNIKATY.ODPOWIEDZ_ETAP_WORKFLOW_BUR_DLA_ZADANIA, wynik: wynik };
    }

    const interfejs = {
      pobierzStorage: function pobierz(rodzaj, klucz) { const wynik = {}; wynik[klucz] = magazyn[rodzaj][klucz] || null; return JSON.parse(JSON.stringify(wynik)); },
      zapiszStorage: function zapisz(rodzaj, dane) { Object.assign(magazyn[rodzaj], JSON.parse(JSON.stringify(dane))); },
      pobierzAktywnąKartę: function pobierz() { return aktywnaKarta; },
      utwórzKartę: function utwórz(dane) { licznikKart += 1; const karta = { id: licznikKart, url: dane.url, status: "complete", active: false }; karty.set(karta.id, karta); return karta; },
      pobierzKartę: function pobierz(tabId) { return karty.get(tabId) || (tabId === aktywnaKarta.id ? aktywnaKarta : null); },
      wyślijDoKarty: function wyślij(tabId, wiadomość) {
        wiadomości.push({ tabId: tabId, wiadomość: wiadomość });
        if (wiadomość.typ === asystent.KOMUNIKATY.PING_SKRYPTU_STRONY) { return { ok: true, typ: asystent.KOMUNIKATY.PONG_SKRYPTU_STRONY }; }
        if (wiadomość.typ === asystent.KOMUNIKATY.SPRAWDZ_KARTE_SERII_BUR) { return { wynik: raport(tabId) }; }
        if (wiadomość.typ === asystent.KOMUNIKATY.WALIDUJ_FORMULARZ_BUR_DLA_ZADANIA) {
          return wynikEtapu(tabId, Object.assign({}, wiadomość, { etap: "walidacja_formularza" }));
        }
        return wynikEtapu(tabId, wiadomość);
      },
      wstrzyknijSkrypt: function wstrzyknij() {}, aktywujKartę: function aktywuj() {}
    };
    return {
      koordynator: asystent.utwórzKoordynatorSeriiBur(interfejs), interfejs: interfejs, magazyn: magazyn,
      karty: karty, wiadomości: wiadomości, liczbaWywołań: liczbaWywołań,
      maksimumAktywnych: function pobierz() { return maksimumAktywnych; },
      zmieńAktywnąKartę: function zmień(karta) { aktywnaKarta = karta; }
    };
  }

  async function przygotujIUruchom(liczba, opcje) {
    const środowisko = utwórzŚrodowisko(opcje);
    const dane = daneSerii(liczba);
    if (opcje && opcje.kopiowanie) { dane.sposobTworzeniaKart = "kopiowanie_z_wzorca"; }
    const utworzenie = await środowisko.koordynator.utwórzSerię(dane);
    const seria = await środowisko.koordynator.uruchomWorkflowSerii();
    return { środowisko: środowisko, utworzenie: utworzenie, seria: seria };
  }

  test("workflow dwóch kart przekazuje dwa różne terminy do właściwych tabId", async function sprawdź() {
    const wynik = await przygotujIUruchom(2);
    const konteksty = wynik.środowisko.wiadomości.filter(function etap(pozycja) { return pozycja.wiadomość.etap === "kontrola_kontekstu"; });
    sprawdzRownosc(new Set(konteksty.map(function termin(pozycja) { return pozycja.wiadomość.kontekst.wybranyTermin.identyfikator; })).size, 2);
    sprawdzRownosc(new Set(konteksty.map(function karta(pozycja) { return pozycja.tabId; })).size, 2);
  });

  test("workflow ośmiu kart kończy osiem niezależnych zadań", async function sprawdź() {
    const wynik = await przygotujIUruchom(8);
    sprawdzRownosc(wynik.seria.zadania.filter(function gotowe(zadanie) { return zadanie.status === "gotowe_do_kontroli"; }).length, 8);
    sprawdzRownosc(new Set(wynik.seria.zadania.map(function odcisk(zadanie) { return zadanie.odciskFormularzaPoWalidacji; })).size, 8);
  });

  test("kontekst każdego etapu zachowuje batchId jobId i tabId", async function sprawdź() {
    const wynik = await przygotujIUruchom(2);
    wynik.środowisko.wiadomości.filter(function etap(pozycja) { return pozycja.wiadomość.etap; }).forEach(function sprawdźKontekst(pozycja) {
      sprawdzRownosc(pozycja.wiadomość.kontekst.tabId, pozycja.tabId);
      sprawdzWarunek(Boolean(pozycja.wiadomość.kontekst.batchId && pozycja.wiadomość.kontekst.jobId));
    });
  });

  test("workflow nie zależy od aktywnej karty przeglądarki", async function sprawdź() {
    const środowisko = utwórzŚrodowisko();
    const utworzenie = await środowisko.koordynator.utwórzSerię(daneSerii(2));
    środowisko.zmieńAktywnąKartę({ id: 999, url: "https://example.test/", status: "complete", active: true });
    await środowisko.koordynator.uruchomWorkflowSerii();
    sprawdzWarunek(środowisko.wiadomości.filter(function etap(pozycja) { return pozycja.wiadomość.etap; }).every(function właściwa(pozycja) { return utworzenie.seria.zadania.some(function zadanie(element) { return element.tabId === pozycja.tabId; }); }));
  });

  test("workflow nie zależy od globalnego indeksu terminu", async function sprawdź() {
    window.wybranyTerminSemperIndex = 777;
    const wynik = await przygotujIUruchom(2);
    const terminy = wynik.seria.zadania.map(function terminZadania(zadanie) { return zadanie.wybranyTermin.identyfikator; });
    sprawdzRownosc(terminy.join(","), "termin-workflow-0,termin-workflow-1");
  });

  test("koordynator modyfikuje maksymalnie jedną kartę naraz", async function sprawdź() {
    const wynik = await przygotujIUruchom(8);
    sprawdzRownosc(wynik.środowisko.maksimumAktywnych(), 1);
  });

  test("pusty formularz automatycznie przechodzi przygotowanie propozycji", async function sprawdź() {
    const wynik = await przygotujIUruchom(1);
    sprawdzRownosc(wynik.seria.zadania[0].stanFormularza, "pusty");
    sprawdzRownosc(wynik.seria.zadania[0].liczbaUzupełnionychPól, 12);
  });

  test("rozpoznana kopia używa zawsze bezpośredniego URL wzorca", async function sprawdź() {
    const wynik = await przygotujIUruchom(2, { kopiowanie: true });
    sprawdzWarunek(Array.from(wynik.środowisko.karty.values()).every(function url(karta) { return karta.url.endsWith("/kopiuj/12345"); }));
    sprawdzWarunek(wynik.seria.zadania.every(function stan(zadanie) { return zadanie.stanFormularza === "kopia"; }));
  });

  test("konflikt niepustego pola kończy tylko właściwe zadanie decyzją", async function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("test");
    const wynik = await asystent.wykonajWorkflowBurDlaZadania(dokument, {}, { etap: "przygotowanie_propozycji", adaptery: { przygotowanie_propozycji: function konflikt() { return { ok: false, status: "wymaga_decyzji", konflikty: [{ id: "grupa-docelowa" }] }; } } });
    sprawdzRownosc(wynik.status, "wymaga_decyzji");
    sprawdzRownosc(wynik.konflikty[0].id, "grupa-docelowa");
  });

  test("adapter osób korzysta z istniejącej funkcji zastępowania IIST", async function sprawdź() {
    const kod = await (await fetch("../content/workflow-bur-dla-zadania.js")).text();
    sprawdzWarunek(kod.includes("przestrzeń.zastąpOsobyProwadzące") && kod.includes("pobierzProfilDostawcy(\"iist\")"));
  });

  test("workflow serii nie wprowadza osób ani adresów SEMPER", async function sprawdź() {
    const kod = await (await fetch("../content/workflow-bur-dla-zadania.js")).text();
    sprawdzWarunek(!/pobierzProfilDostawcy\(["']semper/i.test(kod));
    sprawdzWarunek(kod.includes("!/semper|szkolenia-semper"));
  });

  [1, 2, 3].forEach(function dodajTestHarmonogramu(liczbaDni) {
    test("adapter generuje harmonogram IIST " + liczbaDni + "-dniowy z terminu jobId", async function sprawdź() {
      const wybranyTermin = termin(0, liczbaDni);
      const wynik = await asystent.wykonajWorkflowBurDlaZadania(document, { wybranyTermin: wybranyTermin }, { etap: "generowanie_harmonogramu" });
      sprawdzWarunek(wynik.ok && wynik.pozycje.length > 0);
      sprawdzRownosc(wynik.liczbaDni, liczbaDni);
      sprawdzRownosc(new Set(wynik.pozycje.map(function data(pozycja) { return pozycja.dzien_swiadczenia; })).size, liczbaDni);
    });
  });

  test("import i porównanie są osobnymi trwałymi etapami", async function sprawdź() {
    const wynik = await przygotujIUruchom(1);
    const etapy = wynik.seria.zadania[0].etapy;
    sprawdzRownosc(etapy.import_harmonogramu.status, "zakończony");
    sprawdzRownosc(etapy.weryfikacja_harmonogramu.status, "zakończony");
    sprawdzRownosc(wynik.seria.zadania[0].statusHarmonogramu, "zweryfikowany");
  });

  test("odrzucony syntetyczny import zachowuje CSV dla jobId", async function sprawdź() {
    const wynik = await przygotujIUruchom(1, { ręcznyImportTerminu: "termin-workflow-0" });
    sprawdzRownosc(wynik.seria.zadania[0].status, "wymaga_recznego_importu");
    sprawdzWarunek(wynik.seria.zadania[0].csv.bajty.length > 0);
  });

  test("manualny import jednego zadania nie zatrzymuje następnego", async function sprawdź() {
    const wynik = await przygotujIUruchom(2, { ręcznyImportTerminu: "termin-workflow-0" });
    sprawdzRownosc(wynik.seria.zadania[0].status, "wymaga_recznego_importu");
    sprawdzRownosc(wynik.seria.zadania[1].status, "gotowe_do_kontroli");
  });

  test("każda karta otrzymuje niezależną walidację z własnym terminem", async function sprawdź() {
    const wynik = await przygotujIUruchom(2);
    const walidacje = wynik.środowisko.wiadomości.filter(function wybierz(pozycja) { return pozycja.wiadomość.etap === "walidacja_formularza"; });
    sprawdzRownosc(walidacje.length, 2);
    sprawdzWarunek(walidacje[0].wiadomość.kontekst.jobId !== walidacje[1].wiadomość.kontekst.jobId);
  });

  test("błąd jednego zadania nie zatrzymuje pozostałych", async function sprawdź() {
    const wynik = await przygotujIUruchom(2, { błądLokalnyTerminu: "termin-workflow-0" });
    sprawdzRownosc(wynik.seria.zadania[0].status, "blad");
    sprawdzRownosc(wynik.seria.zadania[1].status, "gotowe_do_kontroli");
  });

  test("globalny konflikt konta zatrzymuje serię", async function sprawdź() {
    const wynik = await przygotujIUruchom(2, { globalnyBłądTerminu: "termin-workflow-0" });
    sprawdzRownosc(wynik.seria.status, "wymaga_decyzji");
    sprawdzRownosc(wynik.seria.zadania[1].następnyEtapIndex, 0);
  });

  test("zamknięcie karty podczas serii nie uruchamia ponownej mutacji", async function sprawdź() {
    const środowisko = utwórzŚrodowisko();
    const wynik = await środowisko.koordynator.utwórzSerię(daneSerii(1));
    środowisko.karty.delete(wynik.seria.zadania[0].tabId);
    await środowisko.koordynator.odświeżStanKart();
    sprawdzRownosc(wynik.seria.zadania[0].status, "karta_zamknieta");
  });

  test("restart service workera nie powtarza etapu modyfikującego w ciemno", async function sprawdź() {
    const środowisko = utwórzŚrodowisko();
    const wynik = await środowisko.koordynator.utwórzSerię(daneSerii(1));
    const zadanie = wynik.seria.zadania[0]; zadanie.etap = "import_harmonogramu"; zadanie.status = "import_harmonogramu"; zadanie.następnyEtapIndex = 9;
    zadanie.etapy.import_harmonogramu = { status: "w_toku", rozpoczęto: new Date().toISOString() };
    środowisko.magazyn.session.aktywnaSeriaOgloszenBur = JSON.parse(JSON.stringify(wynik.seria));
    const drugi = asystent.utwórzKoordynatorSeriiBur(środowisko.interfejs);
    const odtworzona = await drugi.inicjalizuj();
    sprawdzRownosc(odtworzona.zadania[0].status, "wymaga_decyzji");
  });

  test("ponowienie zaczyna się od błędnego etapu", async function sprawdź() {
    const opcje = { błądRaz: { etap: "przygotowanie_programu", użyty: false } };
    const wynik = await przygotujIUruchom(1, opcje);
    const zadanie = wynik.seria.zadania[0];
    const liczbaKontroliPrzed = wynik.środowisko.liczbaWywołań[zadanie.jobId + "|kontrola_kontekstu"];
    await wynik.środowisko.koordynator.ponówZadanie(zadanie.jobId);
    sprawdzRownosc(wynik.środowisko.liczbaWywołań[zadanie.jobId + "|kontrola_kontekstu"], liczbaKontroliPrzed);
    sprawdzRownosc(zadanie.status, "gotowe_do_kontroli");
  });

  test("ponowna walidacja używa neutralnego komunikatu i konkretnego tabId", async function sprawdź() {
    const wynik = await przygotujIUruchom(1);
    const zadanie = wynik.seria.zadania[0];
    await wynik.środowisko.koordynator.walidujPonownie(zadanie.jobId);
    const wiadomość = wynik.środowisko.wiadomości[wynik.środowisko.wiadomości.length - 1];
    sprawdzRownosc(wiadomość.tabId, zadanie.tabId);
    sprawdzRownosc(wiadomość.wiadomość.typ, asystent.KOMUNIKATY.WALIDUJ_FORMULARZ_BUR_DLA_ZADANIA);
  });

  test("workflow serii nie klika zapisu roboczego ani publikacji", async function sprawdź() {
    const kod = (await (await fetch("../content/workflow-bur-dla-zadania.js")).text()) + (await (await fetch("../background/koordynator-serii-bur.js")).text());
    sprawdzWarunek(!/\.click\s*\(\)/.test(kod));
    sprawdzWarunek(!/Zapisz Roboczo|Opublikuj/.test(kod));
  });

  test("pomiary lokalnego workflow i serii są zapisywane bez czasu zewnętrznego BUR", async function sprawdź() {
    const danePomiaru = daneSerii(1);
    const dokumentPomiaru = new DOMParser().parseFromString(await (await fetch("fixtures/bur-pusty-formularz.html")).text(), "text/html");
    const początekPrzygotowania = performance.now();
    asystent.przygotujPropozycjeWypełnieniaBur(dokumentPomiaru, danePomiaru.szkolenie, danePomiaru.terminy[0], { profilId: "iist" });
    const przygotowanieKartyMs = performance.now() - początekPrzygotowania;
    const początekGeneratora = performance.now();
    let harmonogramPomiaru;
    for (let indeks = 0; indeks < 1000; indeks += 1) {
      harmonogramPomiaru = asystent.generujHarmonogramDlaTerminu({ profilId: "iist", forma: "online", dataStartBur: "10-09-2027", dataKoniecBur: "12-09-2027" });
    }
    const generowanieHarmonogramuMs = (performance.now() - początekGeneratora) / 1000;
    const początekImportu = performance.now();
    const csvPomiaru = asystent.wygenerujDaneCsvHarmonogramu(harmonogramPomiaru.pozycje);
    const importMs = performance.now() - początekImportu;
    const początekWalidacji = performance.now();
    asystent.walidujFormularzBur(dokumentPomiaru, { szkolenieSemper: danePomiaru.szkolenie, wybranyTermin: danePomiaru.terminy[0], profilId: "iist", wykryteKontoBur: { profilId: "iist" } });
    const walidacjaMs = performance.now() - początekWalidacji;
    const początek = performance.now();
    const wynik = await przygotujIUruchom(8);
    const pełnyCzasSerii = performance.now() - początek;
    const pierwsze = wynik.seria.zadania[0].etapy;
    window.POMIARY_WORKFLOW_SERII_BUR = {
      przygotowanieKartyMs: przygotowanieKartyMs,
      generowanieHarmonogramuMs: generowanieHarmonogramuMs,
      przygotowanieCsvMs: importMs,
      walidacjaMs: walidacjaMs,
      pełnyCzasZadaniaMs: Object.values(pierwsze).reduce(function suma(wartość, etap) { return wartość + Number(etap.czasMs || 0); }, 0),
      pełnyCzasSeriiOsiemMs: pełnyCzasSerii
    };
    document.body.dataset.pomiarySeriiBur = JSON.stringify(window.POMIARY_WORKFLOW_SERII_BUR);
    sprawdzWarunek(csvPomiaru.length > 3 && window.POMIARY_WORKFLOW_SERII_BUR.pełnyCzasSeriiOsiemMs >= 0);
  });
})();
