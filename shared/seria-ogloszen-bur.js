(function zarejestrujSerięOgłoszeńBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const STATUSY_SERII_BUR = [
    "oczekuje", "otwieranie_karty", "oczekiwanie_na_zaladowanie",
    "oczekiwanie_na_content_script", "kontrola_konta", "karta_gotowa",
    "wymaga_decyzji", "blad", "karta_zamknieta", "anulowane"
  ];

  function utwórzIdSerii(prefiks) {
    const losowy = globalny.crypto && typeof globalny.crypto.randomUUID === "function"
      ? globalny.crypto.randomUUID()
      : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
    return String(prefiks || "id") + "-" + losowy;
  }

  function parsujDatęSerii(wartość) {
    const dopasowanie = String(wartość || "").match(/^(\d{2})[-.](\d{2})[-.](\d{4})$/);
    if (!dopasowanie) { return null; }
    const data = new Date(Number(dopasowanie[3]), Number(dopasowanie[2]) - 1, Number(dopasowanie[1]));
    return Number.isNaN(data.getTime()) ? null : data;
  }

  function obliczLiczbęDniSerii(dataStartBur, dataKoniecBur) {
    const początek = parsujDatęSerii(dataStartBur);
    const koniec = parsujDatęSerii(dataKoniecBur);
    if (!początek || !koniec || koniec < początek) { return 0; }
    return Math.round((koniec.getTime() - początek.getTime()) / 86400000) + 1;
  }

  function oceńTerminSeriiBur(termin, indeksTerminu) {
    const dane = termin || {};
    const forma = String(dane.forma || "").toLowerCase();
    const liczbaDni = obliczLiczbęDniSerii(dane.dataStartBur, dane.dataKoniecBur);
    const szablon = przestrzeń.pobierzSzablonHarmonogramu
      ? przestrzeń.pobierzSzablonHarmonogramu("iist", forma, liczbaDni)
      : null;
    const powody = [];
    if (!dane.dataStartBur || !dane.dataKoniecBur || !liczbaDni) { powody.push("Brak poprawnego zakresu dat."); }
    if (!forma || forma === "nieznana") { powody.push("Forma terminu jest nieznana."); }
    if (forma === "stacjonarna") { powody.push("Terminy stacjonarne nie są obsługiwane."); }
    if (liczbaDni > 3) { powody.push("Termin ma więcej niż 3 dni."); }
    if (!szablon) { powody.push("Brak obsługiwanego szablonu harmonogramu."); }
    if (dane.błądParsera || dane.bladParsera || dane.wymagaDecyzji || (Array.isArray(dane.błędy) && dane.błędy.length)) {
      powody.push("Błąd parsera wymaga decyzji.");
    }
    return {
      indeksTerminu: indeksTerminu,
      terminId: dane.identyfikator || dane.id || [dane.dataStartBur, dane.dataKoniecBur, forma, dane.miejsce || ""].join("|"),
      liczbaDni: liczbaDni,
      szablonHarmonogramu: szablon ? { id: szablon.id, nazwa: szablon.nazwa, wersja: szablon.wersja } : null,
      możnaPrzygotowaćAutomatycznie: powody.length === 0,
      powodyBlokady: powody
    };
  }

  function utwórzZadanieSeriiBur(batchId, profilId, termin, indeksTerminu, teraz) {
    const ocena = oceńTerminSeriiBur(termin, indeksTerminu);
    return {
      jobId: utwórzIdSerii("job"), batchId: batchId, profilId: profilId,
      terminId: ocena.terminId, indeksTerminu: indeksTerminu,
      dataStartBur: termin.dataStartBur || "", dataKoniecBur: termin.dataKoniecBur || "",
      dataZakonczeniaRekrutacjiBur: termin.dataZakończeniaRekrutacjiBur || termin.dataZakonczeniaRekrutacjiBur || "",
      forma: termin.forma || "", miejsce: termin.miejsce || "", cena: termin.cena || "",
      liczbaDni: ocena.liczbaDni, szablonHarmonogramu: ocena.szablonHarmonogramu,
      tabId: null, urlKarty: "", typFormularza: "", etap: "oczekuje", status: "oczekuje",
      raport: null, wynikWalidacji: null, bledy: ocena.powodyBlokady.slice(), ostrzezenia: [],
      proby: 0, utworzono: teraz, zaktualizowano: teraz
    };
  }

  function utwórzSerięOgłoszeńBur(dane) {
    const wejście = dane || {};
    const teraz = wejście.teraz || new Date().toISOString();
    const batchId = utwórzIdSerii("batch");
    const profilId = wejście.profilId || "iist";
    const terminy = Array.isArray(wejście.terminy) ? wejście.terminy : [];
    const indeksy = Array.isArray(wejście.indeksyTerminów) ? wejście.indeksyTerminów : terminy.map(function indeks(_, indeks) { return indeks; });
    return {
      batchId: batchId, profilId: profilId, szkolenieId: wejście.szkolenieId || "",
      tytul: wejście.tytul || "", urlZrodla: wejście.urlZrodla || "", odciskSzkolenia: wejście.odciskSzkolenia || "",
      sposobTworzeniaKart: wejście.sposobTworzeniaKart || "nowe_formularze",
      urlFormularzaBazowego: wejście.urlFormularzaBazowego || "", utworzono: teraz, zaktualizowano: teraz,
      status: "oczekuje", zatrzymanaPrzyczyna: "",
      wzorzecKopiowania: wejście.wzorzecKopiowania || null,
      zadania: terminy.map(function mapuj(termin, pozycja) { return utwórzZadanieSeriiBur(batchId, profilId, termin, indeksy[pozycja], teraz); })
    };
  }

  function znajdźZadaniePoKarcie(seria, tabId) {
    return seria && Array.isArray(seria.zadania)
      ? seria.zadania.find(function znajdź(zadanie) { return zadanie.tabId === tabId; }) || null
      : null;
  }

  function rozpoznajWzorzecKopiowaniaBur(dokument) {
    const akcje = Array.from(dokument.querySelectorAll("a, button")).filter(function znajdź(element) {
      return /^\s*kopiuj usługę\s*$/i.test(element.textContent || "");
    });
    const tekst = String(dokument.body && dokument.body.textContent || "");
    const url = String(dokument.location && dokument.location.href || "");
    const numer = (tekst.match(/(?:numer|nr)\s+usługi\s*[:#]?\s*([\d/.-]+)/i) || [])[1] || ((url.match(/uslug[ai]\/([\d-]+)/i) || [])[1] || "");
    const element = akcje[0];
    const adresAkcji = element && (element.href || element.getAttribute("data-url") || element.getAttribute("formaction") || "") || "";
    return {
      urlWzorca: url, numerUslugi: numer, jednoznacznaAkcjaKopiowania: akcje.length === 1,
      adresAkcjiKopiowania: adresAkcji,
      kopieBezposrednioZTegoSamegoWzorca: akcje.length === 1 && Boolean(adresAkcji),
      kopiowanieLancuchoweDozwolone: false
    };
  }

  przestrzeń.STATUSY_SERII_BUR = STATUSY_SERII_BUR;
  przestrzeń.utwórzIdSerii = utwórzIdSerii;
  przestrzeń.obliczLiczbęDniSerii = obliczLiczbęDniSerii;
  przestrzeń.oceńTerminSeriiBur = oceńTerminSeriiBur;
  przestrzeń.utwórzZadanieSeriiBur = utwórzZadanieSeriiBur;
  przestrzeń.utwórzSerięOgłoszeńBur = utwórzSerięOgłoszeńBur;
  przestrzeń.znajdźZadaniePoKarcie = znajdźZadaniePoKarcie;
  przestrzeń.rozpoznajWzorzecKopiowaniaBur = rozpoznajWzorzecKopiowaniaBur;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
