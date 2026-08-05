(function zarejestrujWorkflowBurDlaZadania(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const komunikaty = przestrzeń.KOMUNIKATY;
  const DOZWOLONE_NADPISANIA_KOPII = ["forma-swiadczenia", "data-rozpoczecia", "data-zakonczenia", "data-rekrutacji"];
  const aktywneImporty = new Set();

  function tekstBłędu(błąd) { return błąd && błąd.message ? błąd.message : String(błąd || "Nieznany błąd."); }
  function normalizuj(tekst) { return String(tekst || "").replace(/\s+/g, " ").trim().toLocaleLowerCase("pl-PL"); }
  function czyUrlBur(url) { return /^https:\/\/[^/]*uslugirozwojowe\.parp\.gov\.pl\//i.test(String(url || "")); }
  function pobierzUrl(dokument, opcje) { return String(opcje && opcje.url || dokument.location && dokument.location.href || globalny.location && globalny.location.href || ""); }

  function wynikEtapu(etap, wynik, początek) {
    const dane = wynik || {};
    return Object.assign({
      ok: dane.ok !== false, etap: etap, status: dane.status || (dane.ok === false ? "blad" : "zakończony"),
      błędy: dane.błędy || dane.bledy || (dane.błąd ? [dane.błąd] : []),
      ostrzeżenia: dane.ostrzeżenia || dane.ostrzezenia || [],
      czasMs: Math.max(0, (globalny.performance && performance.now ? performance.now() : Date.now()) - początek)
    }, dane);
  }

  function pobierzKonto(dokument) {
    return typeof przestrzeń.wykryjKontoDostawcyBur === "function"
      ? przestrzeń.wykryjKontoDostawcyBur(dokument)
      : (typeof przestrzeń.wykryjKontoBur === "function" ? przestrzeń.wykryjKontoBur() : null);
  }

  function pobierzTekstOsób(dokument) {
    const tabela = dokument.querySelector("#osobyprowadzace-grid, #prowadzacy-grid, [id*='osobyprowadzace'][role='grid']");
    return tabela ? String(tabela.textContent || "").replace(/\s+/g, " ").trim() : "";
  }

  function pobierzProgram(dokument) {
    const cel = przestrzeń.znajdźCelFormularzaBur && przestrzeń.znajdźCelFormularzaBur(dokument, "program");
    return cel && cel.ok ? przestrzeń.pobierzWartośćPola(cel.element) || "" : "";
  }

  function oczyśćWynikWalidacji(wynik) {
    return {
      statusOgólny: wynik && wynik.statusOgólny || "błędy",
      pozycje: (wynik && wynik.pozycje || []).map(function mapuj(pozycja) {
        return {
          sekcja: pozycja.sekcja, pole: pozycja.pole, celFormularza: pozycja.celFormularza,
          status: pozycja.status, komunikat: pozycja.komunikat,
          oczekiwanaWartość: pozycja.oczekiwanaWartość, aktualnaWartość: pozycja.aktualnaWartość
        };
      })
    };
  }

  function sprawdźPrzypisanieKarty(kontekst) {
    const przypisanie = globalny.__BUR_ASYSTENT_PRZYPISANIE_SERII__;
    if (przypisanie && (przypisanie.jobId !== kontekst.jobId || przypisanie.batchId !== kontekst.batchId)) {
      return { ok: false, globalnyBłąd: true, status: "wymaga_decyzji", błąd: "Karta została przypisana do innego jobId. Wykryto ryzyko mieszania danych między kartami." };
    }
    globalny.__BUR_ASYSTENT_PRZYPISANIE_SERII__ = { batchId: kontekst.batchId, jobId: kontekst.jobId };
    return { ok: true };
  }

  function kontrolujKontekst(dokument, kontekst, opcje) {
    const błędy = [];
    const url = pobierzUrl(dokument, opcje);
    const konto = pobierzKonto(dokument);
    const termin = kontekst.wybranyTermin || {};
    const szablon = przestrzeń.pobierzSzablonHarmonogramu("iist", termin.forma, kontekst.liczbaDni);
    const przypisanie = sprawdźPrzypisanieKarty(kontekst);
    if (!przypisanie.ok) { return przypisanie; }
    if (!czyUrlBur(url)) { błędy.push("URL karty nie należy do BUR."); }
    if (!konto || konto.profilId !== "iist") { return { ok: false, globalnyBłąd: true, status: "wymaga_decyzji", błąd: "Konto BUR przestało być kontem IIST." }; }
    if (kontekst.profilId !== "iist") { return { ok: false, globalnyBłąd: true, status: "wymaga_decyzji", błąd: "Profil zadania jest niezgodny z profilem serii IIST." }; }
    const aktualnyOdcisk = przestrzeń.utwórzOdciskSzkoleniaSerii(kontekst.szkolenie);
    if (!kontekst.odciskSzkolenia || aktualnyOdcisk !== kontekst.odciskSzkolenia) {
      return { ok: false, globalnyBłąd: true, status: "wymaga_decyzji", błąd: "Zmienił się odcisk szkolenia IIST." };
    }
    if (!termin.dataStartBur || !termin.dataKoniecBur || !termin.dataZakończeniaRekrutacjiBur && !termin.dataZakonczeniaRekrutacjiBur) { błędy.push("Termin zadania nie ma kompletu dat."); }
    if (termin.forma !== "online") { błędy.push("Seria obsługuje wyłącznie terminy online."); }
    if (!szablon || String(szablon.wersja) !== String(kontekst.wersjaSzablonu || "")) { błędy.push("Brak zgodnego szablonu harmonogramu 1/2/3 dni."); }
    const odciskInstancji = przestrzeń.pobierzOdciskInstancjiFormularza(dokument);
    if (kontekst.odciskInstancjiFormularza && odciskInstancji !== kontekst.odciskInstancjiFormularza) {
      return { ok: false, globalnyBłąd: true, status: "wymaga_decyzji", błąd: "Odcisk instancji formularza nie odpowiada jobId. Wykryto ryzyko mieszania kart." };
    }
    const typFormularza = przestrzeń.rozpoznajTypFormularzaSeriiBur(dokument);
    if (!["dodawanie_uslugi", "edycja_uslugi"].includes(typFormularza)) { błędy.push("Nie rozpoznano formularza usługi BUR."); }
    if (kontekst.sposobTworzeniaKart === "nowe_formularze" && typFormularza !== "dodawanie_uslugi") { błędy.push("Karta nie jest niezależnym formularzem dodawania usługi."); }
    const tekstStatusu = normalizuj(dokument.body && dokument.body.textContent);
    if (/status usługi\s*:?\s*(?:opublikowana|zaakceptowana)|usługa (?:została )?opublikowana/.test(tekstStatusu)) { błędy.push("Karta jest już zapisaną lub opublikowaną usługą."); }
    return { ok: błędy.length === 0, status: błędy.length ? "blad" : "zakończony", błędy: błędy, kontoBur: konto, typFormularza: typFormularza, url: url, odciskInstancjiFormularza: odciskInstancji };
  }

  function kontrolujStanFormularza(dokument, kontekst) {
    const pusty = przestrzeń.czyPustyFormularzSeriiBur(dokument);
    const aktualnyTermin = przestrzeń.odczytajAktualnyTerminBur(dokument);
    const oczekiwanyTytuł = kontekst.oczekiwanyTytul || "";
    if (aktualnyTermin.tytuł && oczekiwanyTytuł && normalizuj(aktualnyTermin.tytuł) !== normalizuj(oczekiwanyTytuł)) {
      return { ok: false, status: "wymaga_decyzji", błąd: "Formularz zawiera dane innego szkolenia. Tytuł nie zostanie nadpisany automatycznie.", aktualnyTermin: aktualnyTermin };
    }
    const stan = pusty ? "pusty" : (kontekst.sposobTworzeniaKart === "kopiowanie_z_wzorca" ? "kopia" : "czesciowo_wypelniony");
    if (!pusty && kontekst.sposobTworzeniaKart === "nowe_formularze") {
      return { ok: false, status: "wymaga_decyzji", błąd: "Niezależny nowy formularz zawiera dane po preflight. Nie zostanie automatycznie nadpisany.", aktualnyTermin: aktualnyTermin };
    }
    return { ok: true, stanFormularza: stan, aktualnyTermin: aktualnyTermin, czyPustyFormularz: pusty };
  }

  function przygotujPropozycje(dokument, kontekst) {
    const propozycje = przestrzeń.przygotujPropozycjeWypełnieniaBur(dokument, kontekst.szkolenie, kontekst.wybranyTermin, { profilId: kontekst.profilId });
    const konflikty = [];
    const wybrane = propozycje.map(function oznacz(propozycja) {
      const osobnyEtap = propozycja.typPola === "osoby_prowadzace" || propozycja.id === "program";
      const pustePole = propozycja.status === "uzupełnienie_pustego";
      const kontrolowaneNadpisanie = propozycja.status === "konflikt" && DOZWOLONE_NADPISANIA_KOPII.includes(propozycja.id)
        && ["kopia", "czesciowo_wypelniony"].includes(kontekst.stanFormularza);
      if (propozycja.status === "konflikt" && !kontrolowaneNadpisanie && !osobnyEtap) {
        konflikty.push({ id: propozycja.id, pole: propozycja.pole, wartośćAktualna: propozycja.wartośćAktualna, wartośćOczekiwana: propozycja.wartośćProponowana });
      }
      return Object.assign({}, propozycja, { zaznaczona: !osobnyEtap && (pustePole || kontrolowaneNadpisanie) });
    });
    if (konflikty.length) {
      return { ok: false, status: "wymaga_decyzji", błąd: "Niepuste pola stałe profilu IIST różnią się od oczekiwanych wartości.", konflikty: konflikty, propozycje: wybrane };
    }
    return { ok: true, propozycje: wybrane, liczbaWybranych: wybrane.filter(function wybrana(pozycja) { return pozycja.zaznaczona; }).length };
  }

  async function wypełnijPola(dokument, kontekst) {
    const wyniki = [];
    for (const propozycja of kontekst.propozycje || []) {
      if (!propozycja.zaznaczona) { continue; }
      const znalezione = przestrzeń.znajdźPoleBurZSzczegółami(dokument, propozycja.definicjaPola);
      const aktualna = znalezione.element ? przestrzeń.pobierzWartośćPola(znalezione.element) : "";
      if (String(aktualna || "") !== String(propozycja.wartośćAktualna || "")) {
        wyniki.push({ ok: false, status: "konflikt_po_przygotowaniu", pole: propozycja.pole, komunikat: "Wartość zmieniła się po przygotowaniu propozycji." });
        continue;
      }
      wyniki.push(await przestrzeń.ustawPoleBurZWeryfikacją(dokument, {
        sekcja: propozycja.sekcja, pole: propozycja.pole, typPola: propozycja.typPola,
        wartość: propozycja.wartośćProponowana, definicjaPola: propozycja.definicjaPola,
        zezwólNaNadpisanie: propozycja.status === "konflikt", dokładnySelect2: propozycja.dokładnySelect2
      }));
    }
    const błędy = wyniki.filter(function błędny(wynik) { return !wynik.ok; });
    return { ok: błędy.length === 0, wyniki: wyniki, liczbaUzupełnionychPól: wyniki.filter(function poprawny(wynik) { return wynik.ok; }).length, błędy: błędy.map(function tekst(wynik) { return wynik.komunikat || wynik.kodBłędu || "Nie potwierdzono pola."; }) };
  }

  function kontrolujPola(dokument, kontekst) {
    const ponownie = przestrzeń.przygotujPropozycjeWypełnieniaBur(dokument, kontekst.szkolenie, kontekst.wybranyTermin, { profilId: kontekst.profilId });
    const wymaganeId = new Set((kontekst.propozycje || []).filter(function wybrana(pozycja) { return pozycja.zaznaczona; }).map(function id(pozycja) { return pozycja.id; }));
    const błędne = ponownie.filter(function sprawdź(pozycja) { return wymaganeId.has(pozycja.id) && pozycja.status !== "bez_zmiany"; });
    return { ok: błędne.length === 0, błędy: błędne.map(function tekst(pozycja) { return "Nie potwierdzono pola: " + pozycja.pole + "."; }), liczbaPotwierdzonychPól: wymaganeId.size - błędne.length };
  }

  async function zastąpOsoby(dokument, kontekst) {
    const profil = przestrzeń.pobierzProfilDostawcy("iist");
    const osoby = [profil.osobaProwadzącaUsługę, profil.osobaProwadzącaWalidację];
    return przestrzeń.zastąpOsobyProwadzące(dokument, osoby, kontekst.adapterOsób);
  }

  function kontrolujOsoby(dokument) {
    const profil = przestrzeń.pobierzProfilDostawcy("iist");
    const tabela = dokument.querySelector("#osobyprowadzace-grid, #prowadzacy-grid, [id*='osobyprowadzace'][role='grid']");
    const wiersze = przestrzeń.pobierzWierszeOsóbProwadzących(tabela);
    const tekst = pobierzTekstOsób(dokument);
    const oczekiwane = [profil.osobaProwadzącaUsługę, profil.osobaProwadzącaWalidację];
    const poprawne = wiersze.length === 2 && oczekiwane.every(function osoba(pozycja) { return normalizuj(tekst).includes(normalizuj(pozycja.imięINazwisko)) && normalizuj(tekst).includes(normalizuj(pozycja.email)); }) && !/semper|szkolenia-semper\.pl/i.test(tekst);
    return { ok: poprawne, liczbaOsób: wiersze.length, tekstOsób: tekst, błędy: poprawne ? [] : ["Tabela nie zawiera dokładnie dwóch osób IIST albo zawiera dane SEMPER."] };
  }

  async function przygotujProgram(dokument, kontekst) {
    const program = przestrzeń.zbudujProgramDostawcy("iist", kontekst.szkolenie);
    const propozycja = przestrzeń.przygotujPropozycjeWypełnieniaBur(dokument, kontekst.szkolenie, kontekst.wybranyTermin, { profilId: "iist" }).find(function znajdź(pozycja) { return pozycja.id === "program"; });
    if (!propozycja) { return { ok: false, błąd: "Nie znaleziono istniejącej definicji programu BUR." }; }
    if (propozycja.status === "konflikt") { return { ok: false, status: "wymaga_decyzji", błąd: "Niepusty program różni się od programu IIST." }; }
    if (propozycja.status === "bez_zmiany") { return { ok: true, program: program, bezZmiany: true }; }
    const wynik = await przestrzeń.ustawPoleBurZWeryfikacją(dokument, { sekcja: propozycja.sekcja, pole: propozycja.pole, typPola: propozycja.typPola, wartość: program, definicjaPola: propozycja.definicjaPola, zezwólNaNadpisanie: false });
    return Object.assign({}, wynik, { program: program });
  }

  function generujHarmonogram(kontekst) {
    return przestrzeń.generujHarmonogramDlaTerminu({
      profilId: "iist", forma: kontekst.wybranyTermin.forma,
      dataStartBur: kontekst.wybranyTermin.dataStartBur, dataKoniecBur: kontekst.wybranyTermin.dataKoniecBur
    });
  }

  function przygotujCsvAwaryjny(harmonogram, kontekst) {
    const bajty = przestrzeń.wygenerujDaneCsvHarmonogramu(harmonogram.pozycje || []);
    return {
      nazwa: przestrzeń.zbudujDiagnostycznąNazwęCsvIist({ liczbaDni: kontekst.liczbaDni, dataStartBur: kontekst.wybranyTermin.dataStartBur, dataKoniecBur: kontekst.wybranyTermin.dataKoniecBur }),
      typ: "text/csv;charset=utf-8", bajty: Array.from(bajty instanceof Uint8Array ? bajty : new Uint8Array(bajty))
    };
  }

  async function importujHarmonogram(dokument, kontekst) {
    const harmonogram = kontekst.harmonogram || {};
    if (aktywneImporty.has(kontekst.jobId)) { return { ok: false, błąd: "Import harmonogramu dla tego jobId jest już aktywny." }; }
    const aktualnyTermin = przestrzeń.odczytajAktualnyTerminBur(dokument);
    const osoby = pobierzTekstOsób(dokument);
    const kontrola = przestrzeń.walidujKontekstImportuHarmonogramu({
      metryka: {
        profilId: "iist", tytułSzkolenia: kontekst.oczekiwanyTytul,
        dataStartBur: kontekst.wybranyTermin.dataStartBur, dataKoniecBur: kontekst.wybranyTermin.dataKoniecBur,
        forma: kontekst.wybranyTermin.forma, podsumowanie: harmonogram.podsumowanie,
        identyfikatorWybranegoTerminu: kontekst.terminId
      },
      aktywnyProfilId: "iist", wykryteKontoBur: pobierzKonto(dokument), aktualnyTerminBur: aktualnyTermin,
      identyfikatorWybranegoTerminu: kontekst.terminId, pozycje: harmonogram.pozycje || [], osobyProwadząceTekst: osoby
    });
    if (!kontrola.ok) { return { ok: false, błąd: kontrola.błąd, błędy: kontrola.błędy }; }
    aktywneImporty.add(kontekst.jobId);
    try {
      const czyKontrolowaneZastąpienie = ["kopia", "czesciowo_wypelniony"].includes(kontekst.stanFormularza);
      const wynik = czyKontrolowaneZastąpienie
        ? await przestrzeń.zastąpHarmonogram(harmonogram.pozycje || [], harmonogram.podsumowanie)
        : await przestrzeń.wprowadźHarmonogramDoBur(harmonogram.pozycje || [], harmonogram.podsumowanie);
      if (wynik.ok) { return Object.assign({}, wynik, { statusHarmonogramu: "zaimportowany" }); }
      if (wynik.istniejącePozycje || wynik.częściowyImport) { return Object.assign({}, wynik, { ok: false, status: "wymaga_decyzji", statusHarmonogramu: "konflikt" }); }
      return Object.assign({}, wynik, { ok: false, status: "wymaga_recznego_importu", statusHarmonogramu: "wymaga_recznego_importu", csv: przygotujCsvAwaryjny(harmonogram, kontekst) });
    } finally {
      aktywneImporty.delete(kontekst.jobId);
    }
  }

  function weryfikujHarmonogram(kontekst) {
    const harmonogram = kontekst.harmonogram || {};
    const raport = przestrzeń.sprawdzHarmonogramPoWypelnieniu(harmonogram.pozycje || [], harmonogram.podsumowanie);
    return { ok: Boolean(raport.ok), raport: raport, statusHarmonogramu: raport.ok ? "zweryfikowany" : "niezgodny", błędy: raport.błędy || [] };
  }

  function walidujDlaZadania(dokument, kontekst) {
    const wynikFormularza = przestrzeń.walidujFormularzBur(dokument, {
      szkolenieSemper: kontekst.szkolenie, wybranyTermin: kontekst.wybranyTermin,
      profilId: kontekst.profilId, wykryteKontoBur: pobierzKonto(dokument)
    });
    const wynikHarmonogramu = weryfikujHarmonogram(kontekst);
    const oczyszczony = oczyśćWynikWalidacji(wynikFormularza);
    const błędyFormularza = oczyszczony.pozycje.filter(function błąd(pozycja) { return pozycja.status === "błąd"; });
    const termin = przestrzeń.odczytajAktualnyTerminBur(dokument);
    const osoby = pobierzTekstOsób(dokument);
    const program = pobierzProgram(dokument);
    const podsumowanie = przestrzeń.odczytajPodsumowanieHarmonogramuBur();
    const liczbaPozycji = przestrzeń.pobierzWierszeHarmonogramu().length;
    const odciskFormularza = przestrzeń.utwórzOdciskTekstuSerii({
      tytuł: termin.tytuł, profil: kontekst.profilId,
      daty: [termin.dataRozpoczęcia, termin.dataZakończenia, termin.dataZakończeniaRekrutacji || termin.dataZakonczeniaRekrutacji],
      osoby: osoby, program: program, liczbaPozycji: liczbaPozycji, podsumowanie: podsumowanie
    });
    const ok = błędyFormularza.length === 0 && wynikHarmonogramu.ok;
    return {
      ok: ok, status: ok ? "zakończony" : "blad", wynikWalidacji: oczyszczony,
      raportHarmonogramu: wynikHarmonogramu.raport, odciskFormularza: odciskFormularza,
      odciskInstancjiFormularza: przestrzeń.pobierzOdciskInstancjiFormularza(dokument),
      błędy: błędyFormularza.map(function tekst(pozycja) { return pozycja.sekcja + " / " + pozycja.pole + ": " + pozycja.komunikat; }).concat(wynikHarmonogramu.błędy || []),
      ostrzeżenia: oczyszczony.pozycje.filter(function ostrzeżenie(pozycja) { return pozycja.status === "ostrzeżenie"; }).map(function tekst(pozycja) { return pozycja.sekcja + " / " + pozycja.pole + ": " + pozycja.komunikat; })
    };
  }

  async function wykonajWorkflowBurDlaZadania(dokument, kontekst, opcje) {
    const ustawienia = opcje || {};
    const etap = ustawienia.etap;
    const początek = globalny.performance && performance.now ? performance.now() : Date.now();
    try {
      if (ustawienia.adaptery && typeof ustawienia.adaptery[etap] === "function") { return wynikEtapu(etap, await ustawienia.adaptery[etap](dokument, kontekst), początek); }
      let wynik;
      if (etap === "kontrola_kontekstu") { wynik = kontrolujKontekst(dokument, kontekst, ustawienia); }
      else if (etap === "kontrola_stanu_formularza") { wynik = kontrolujStanFormularza(dokument, kontekst); }
      else if (etap === "przygotowanie_propozycji") { wynik = przygotujPropozycje(dokument, kontekst); }
      else if (etap === "wypelnianie_pol") { wynik = await wypełnijPola(dokument, kontekst); }
      else if (etap === "kontrola_pol") { wynik = kontrolujPola(dokument, kontekst); }
      else if (etap === "zastepowanie_osob_prowadzacych") { wynik = await zastąpOsoby(dokument, kontekst); }
      else if (etap === "kontrola_osob_prowadzacych") { wynik = kontrolujOsoby(dokument); }
      else if (etap === "przygotowanie_programu") { wynik = await przygotujProgram(dokument, kontekst); }
      else if (etap === "generowanie_harmonogramu") { wynik = generujHarmonogram(kontekst); }
      else if (etap === "import_harmonogramu") { wynik = await importujHarmonogram(dokument, kontekst); }
      else if (etap === "weryfikacja_harmonogramu") { wynik = weryfikujHarmonogram(kontekst); }
      else if (etap === "walidacja_formularza") { wynik = walidujDlaZadania(dokument, kontekst); }
      else if (etap === "gotowe_do_kontroli") {
        wynik = kontekst.wynikWalidacji && kontekst.wynikWalidacji.ok && kontekst.odciskFormularzaPoWalidacji
          ? { ok: true, status: "gotowe_do_kontroli", odciskFormularza: kontekst.odciskFormularzaPoWalidacji }
          : { ok: false, status: "blad", błąd: "Brak poprawnej walidacji i odcisku formularza." };
      } else { wynik = { ok: false, błąd: "Nieobsługiwany etap workflow zadania: " + etap }; }
      return wynikEtapu(etap, wynik, początek);
    } catch (błąd) {
      return wynikEtapu(etap, { ok: false, status: "blad", błąd: tekstBłędu(błąd) }, początek);
    }
  }

  przestrzeń.wykonajWorkflowBurDlaZadania = wykonajWorkflowBurDlaZadania;
  przestrzeń.walidujFormularzBurDlaZadania = walidujDlaZadania;
  globalny.BurAsystent = przestrzeń;

  if (globalny.chrome && chrome.runtime && chrome.runtime.onMessage && !globalny.__BUR_ASYSTENT_WORKFLOW_ZADANIA_LOADED__) {
    globalny.__BUR_ASYSTENT_WORKFLOW_ZADANIA_LOADED__ = true;
    chrome.runtime.onMessage.addListener(function obsłużWorkflowZadania(wiadomość, nadawca, odpowiedz) {
      if (!wiadomość || ![komunikaty.WYKONAJ_ETAP_WORKFLOW_BUR_DLA_ZADANIA, komunikaty.WALIDUJ_FORMULARZ_BUR_DLA_ZADANIA].includes(wiadomość.typ)) { return false; }
      const etap = wiadomość.typ === komunikaty.WALIDUJ_FORMULARZ_BUR_DLA_ZADANIA ? "walidacja_formularza" : wiadomość.etap;
      wykonajWorkflowBurDlaZadania(document, wiadomość.kontekst || wiadomość, { etap: etap })
        .then(function zwróć(wynik) { odpowiedz({ typ: komunikaty.ODPOWIEDZ_ETAP_WORKFLOW_BUR_DLA_ZADANIA, wynik: wynik }); });
      return true;
    });
  }
})(globalThis);
