(function testySeriiOgłoszeńBur() {
  const asystent = window.BurAsystent;

  function termin(indeks) {
    const dzień = String(10 + indeks).padStart(2, "0");
    return {
      identyfikator: "termin-" + indeks, dataStartBur: dzień + "-09-2027", dataKoniecBur: dzień + "-09-2027",
      dataZakończeniaRekrutacjiBur: String(9 + indeks).padStart(2, "0") + "-09-2027",
      forma: "online", miejsce: "Szkolenie online", cena: "1000 PLN"
    };
  }

  function daneSerii(liczba) {
    return {
      profilId: "iist", szkolenieId: "szkolenie-iist", tytul: "Szkolenie IIST", urlZrodla: "https://szkoleniaiist.com.pl/test",
      odciskSzkolenia: "odcisk-iist", sposobTworzeniaKart: "nowe_formularze",
      terminy: Array.from({ length: liczba }, function utwórz(_, indeks) { return termin(indeks); }),
      indeksyTerminów: Array.from({ length: liczba }, function indeks(_, pozycja) { return pozycja; })
    };
  }

  function utwórzŚrodowisko(opcje) {
    const ustawienia = opcje || {};
    const magazyn = ustawienia.magazyn || { session: {}, local: {} };
    const karty = ustawienia.karty || new Map();
    const raporty = ustawienia.raporty || new Map();
    let licznikKart = ustawienia.licznikKart || 100;
    let liczbaUtworzonych = 0;
    const aktywnaKarta = { id: 99, url: "https://uslugirozwojowe.parp.gov.pl/dodaj-usluge", status: "complete", active: true };

    function raport(tabId) {
      if (raporty.has(tabId)) { return raporty.get(tabId); }
      return {
        url: tabId === 99 ? aktywnaKarta.url : karty.get(tabId).url,
        kontoBur: { profilId: "iist", nazwaOrganizacji: "IIST" }, typFormularza: "dodawanie_uslugi",
        czyPustyFormularz: true, odciskInstancjiFormularza: ustawienia.wspólnyOdcisk ? "ten-sam" : "formularz-" + tabId,
        wzorzecKopiowania: { urlWzorca: aktywnaKarta.url, numerUslugi: "", jednoznacznaAkcjaKopiowania: false, kopieBezposrednioZTegoSamegoWzorca: false, kopiowanieLancuchoweDozwolone: false }
      };
    }

    const api = {
      pobierzStorage: function pobierz(rodzaj, klucz) { const wynik = {}; wynik[klucz] = magazyn[rodzaj][klucz] || null; return JSON.parse(JSON.stringify(wynik)); },
      zapiszStorage: function zapisz(rodzaj, dane) { Object.assign(magazyn[rodzaj], JSON.parse(JSON.stringify(dane))); },
      pobierzAktywnąKartę: function pobierzAktywną() { return aktywnaKarta; },
      utwórzKartę: function utwórz(dane) { licznikKart += 1; liczbaUtworzonych += 1; const karta = { id: licznikKart, url: dane.url, status: "complete", active: false }; karty.set(karta.id, karta); return karta; },
      pobierzKartę: function pobierzKartę(tabId) { return karty.get(tabId) || (tabId === 99 ? aktywnaKarta : null); },
      wyślijDoKarty: function wyślij(tabId, wiadomość) {
        if (wiadomość.typ === asystent.KOMUNIKATY.PING_SKRYPTU_STRONY) { return { ok: true, typ: asystent.KOMUNIKATY.PONG_SKRYPTU_STRONY }; }
        return { typ: asystent.KOMUNIKATY.ODPOWIEDZ_SERIA_OGLOSZEN_BUR, wynik: raport(tabId) };
      },
      wstrzyknijSkrypt: function wstrzyknij() {}, aktywujKartę: function aktywuj() {}
    };
    return {
      koordynator: asystent.utwórzKoordynatorSeriiBur(api), magazyn: magazyn, karty: karty, raporty: raporty,
      pobierzLiczbęUtworzonych: function pobierz() { return liczbaUtworzonych; }, raport: raport, aktywnaKarta: aktywnaKarta, api: api
    };
  }

  test("seria BUR z jednym terminem tworzy jedno zadanie", function sprawdź() {
    const seria = asystent.utwórzSerięOgłoszeńBur(daneSerii(1));
    sprawdzRownosc(seria.zadania.length, 1);
    sprawdzRownosc(seria.zadania[0].indeksTerminu, 0);
  });

  test("seria BUR z ośmioma terminami tworzy osiem zadań", function sprawdź() {
    sprawdzRownosc(asystent.utwórzSerięOgłoszeńBur(daneSerii(8)).zadania.length, 8);
  });

  test("batchId i jobId są unikalne", function sprawdź() {
    const pierwsza = asystent.utwórzSerięOgłoszeńBur(daneSerii(8));
    const druga = asystent.utwórzSerięOgłoszeńBur(daneSerii(1));
    sprawdzWarunek(pierwsza.batchId !== druga.batchId);
    sprawdzRownosc(new Set(pierwsza.zadania.map(function id(zadanie) { return zadanie.jobId; })).size, 8);
  });

  test("każde zadanie serii otrzymuje osobny tabId", async function sprawdź() {
    const środowisko = utwórzŚrodowisko();
    const wynik = await środowisko.koordynator.utwórzSerię(daneSerii(8));
    sprawdzRownosc(new Set(wynik.seria.zadania.map(function karta(zadanie) { return zadanie.tabId; })).size, 8);
  });

  test("przypisanie terminów nie zależy od aktywnej karty", async function sprawdź() {
    const środowisko = utwórzŚrodowisko();
    const wynik = await środowisko.koordynator.utwórzSerię(daneSerii(1));
    sprawdzWarunek(wynik.seria.zadania[0].tabId !== środowisko.aktywnaKarta.id);
    sprawdzRownosc(wynik.seria.zadania[0].terminId, "termin-0");
  });

  test("seria odtwarza się po restarcie service workera bez nowych kart", async function sprawdź() {
    const środowisko = utwórzŚrodowisko();
    await środowisko.koordynator.utwórzSerię(daneSerii(1));
    const drugi = asystent.utwórzKoordynatorSeriiBur(środowisko.api);
    const odtworzona = await drugi.inicjalizuj();
    sprawdzRownosc(odtworzona.zadania.length, 1);
    sprawdzRownosc(środowisko.pobierzLiczbęUtworzonych(), 1);
  });

  test("zamknięcie jednej karty oznacza tylko jej zadanie", async function sprawdź() {
    const środowisko = utwórzŚrodowisko();
    const wynik = await środowisko.koordynator.utwórzSerię(daneSerii(2));
    await środowisko.koordynator.poZamknięciuKarty(wynik.seria.zadania[0].tabId);
    sprawdzRownosc(wynik.seria.zadania[0].status, "karta_zamknieta");
    sprawdzRownosc(wynik.seria.zadania[1].status, "karta_gotowa");
  });

  test("ponowienie jednego zadania nie zmienia przypisania innych", async function sprawdź() {
    const środowisko = utwórzŚrodowisko();
    const wynik = await środowisko.koordynator.utwórzSerię(daneSerii(2));
    const drugiTabId = wynik.seria.zadania[1].tabId;
    await środowisko.koordynator.ponówZadanie(wynik.seria.zadania[0].jobId);
    sprawdzRownosc(wynik.seria.zadania[1].tabId, drugiTabId);
  });

  test("anulowanie serii nie zamyka ani nie modyfikuje kart", async function sprawdź() {
    const środowisko = utwórzŚrodowisko();
    await środowisko.koordynator.utwórzSerię(daneSerii(2));
    const anulowana = await środowisko.koordynator.anulujSerię();
    sprawdzRownosc(anulowana.status, "anulowane");
    sprawdzRownosc(środowisko.karty.size, 2);
  });

  test("konflikt konta SEMPER i IIST blokuje preflight", async function sprawdź() {
    const środowisko = utwórzŚrodowisko();
    środowisko.raporty.set(99, Object.assign(środowisko.raport(99), { kontoBur: { profilId: "semper" } }));
    const wynik = await środowisko.koordynator.sprawdźGotowość("nowe_formularze");
    sprawdzWarunek(!wynik.ok && wynik.błędy.join(" ").includes("IIST"));
  });

  test("nierozpoznany formularz blokuje preflight", async function sprawdź() {
    const środowisko = utwórzŚrodowisko();
    środowisko.raporty.set(99, Object.assign(środowisko.raport(99), { typFormularza: "nierozpoznany" }));
    sprawdzWarunek(!(await środowisko.koordynator.sprawdźGotowość("nowe_formularze")).ok);
  });

  test("brak niezależności nowych formularzy zatrzymuje serię", async function sprawdź() {
    const środowisko = utwórzŚrodowisko({ wspólnyOdcisk: true });
    const wynik = await środowisko.koordynator.utwórzSerię(daneSerii(2));
    sprawdzRownosc(wynik.seria.status, "wymaga_decyzji");
    sprawdzWarunek(wynik.seria.zatrzymanaPrzyczyna.includes("niezależności"));
  });

  test("ponowienie istniejącej karty nie otwiera jej podwójnie", async function sprawdź() {
    const środowisko = utwórzŚrodowisko();
    const wynik = await środowisko.koordynator.utwórzSerię(daneSerii(1));
    await środowisko.koordynator.ponówZadanie(wynik.seria.zadania[0].jobId);
    sprawdzRownosc(środowisko.pobierzLiczbęUtworzonych(), 1);
  });

  test("preflight rozpoznaje jeden wzorzec kopiowania", async function sprawdź() {
    const środowisko = utwórzŚrodowisko();
    środowisko.raporty.set(99, Object.assign(środowisko.raport(99), {
      typFormularza: "edycja_uslugi",
      wzorzecKopiowania: { urlWzorca: środowisko.aktywnaKarta.url, numerUslugi: "12345", adresAkcjiKopiowania: "https://uslugirozwojowe.parp.gov.pl/kopiuj/12345", jednoznacznaAkcjaKopiowania: true, kopieBezposrednioZTegoSamegoWzorca: true, kopiowanieLancuchoweDozwolone: false }
    }));
    const wynik = await środowisko.koordynator.sprawdźGotowość("kopiowanie_z_wzorca");
    sprawdzWarunek(wynik.ok);
    sprawdzRownosc(wynik.raport.wzorzecKopiowania.numerUslugi, "12345");
  });

  test("tryb wzorca zabrania kopiowania łańcuchowego", async function sprawdź() {
    const środowisko = utwórzŚrodowisko();
    const wzorzec = Object.assign(środowisko.raport(99), {
      typFormularza: "edycja_uslugi",
      wzorzecKopiowania: { numerUslugi: "12345", adresAkcjiKopiowania: "https://uslugirozwojowe.parp.gov.pl/kopiuj/12345", jednoznacznaAkcjaKopiowania: true, kopieBezposrednioZTegoSamegoWzorca: true, kopiowanieLancuchoweDozwolone: false }
    });
    środowisko.raporty.set(99, wzorzec);
    const wynik = await środowisko.koordynator.utwórzSerię(Object.assign(daneSerii(2), { sposobTworzeniaKart: "kopiowanie_z_wzorca" }));
    sprawdzWarunek(wynik.ok);
    sprawdzRownosc(środowisko.pobierzLiczbęUtworzonych(), 2);
    sprawdzWarunek(Array.from(środowisko.karty.values()).every(function tenSamWzorzec(karta) { return karta.url === "https://uslugirozwojowe.parp.gov.pl/kopiuj/12345"; }));
  });

  test("adapter BUR rozpoznaje jedną bezpośrednią akcję kopiowania", function sprawdź() {
    const dokument = new DOMParser().parseFromString("<h1>Usługa</h1><p>Numer usługi: 12345</p><a href='https://uslugirozwojowe.parp.gov.pl/kopiuj/12345'>Kopiuj usługę</a>", "text/html");
    const wzorzec = asystent.rozpoznajWzorzecKopiowaniaBur(dokument);
    sprawdzRownosc(wzorzec.numerUslugi, "12345");
    sprawdzWarunek(wzorzec.jednoznacznaAkcjaKopiowania && wzorzec.kopieBezposrednioZTegoSamegoWzorca);
  });

  test("adapter BUR odrzuca niejednoznaczną akcję kopiowania", function sprawdź() {
    const dokument = new DOMParser().parseFromString("<p>Numer usługi: 12345</p><a href='/a'>Kopiuj usługę</a><button>Kopiuj usługę</button>", "text/html");
    const wzorzec = asystent.rozpoznajWzorzecKopiowaniaBur(dokument);
    sprawdzWarunek(!wzorzec.jednoznacznaAkcjaKopiowania);
    sprawdzWarunek(!wzorzec.kopiowanieLancuchoweDozwolone);
  });

  test("nieobsługiwany harmonogram IIST nie blokuje przygotowania niezależnych pól", function sprawdź() {
    const ocena = asystent.oceńTerminSeriiBur({ dataStartBur: "10-09-2027", dataKoniecBur: "13-09-2027", forma: "online" }, 0);
    sprawdzWarunek(ocena.możnaPrzygotowaćAutomatycznie);
    sprawdzWarunek(ocena.harmonogramWymagaDecyzji);
  });

  test("panel serii ma wybór terminów, preflight i tabelę zadań", async function sprawdź() {
    const wyniki = await Promise.all([fetch("../panel/panel.html").then(function tekst(odpowiedź) { return odpowiedź.text(); }), fetch("../panel/panel.js").then(function tekst(odpowiedź) { return odpowiedź.text(); })]);
    const dokument = new DOMParser().parseFromString(wyniki[0], "text/html");
    sprawdzWarunek(Boolean(dokument.getElementById("lista-terminow-serii")));
    sprawdzWarunek(Boolean(dokument.getElementById("przycisk-sprawdz-gotowosc-serii")));
    sprawdzWarunek(Boolean(dokument.getElementById("zadania-serii")));
    sprawdzWarunek(wyniki[1].includes("data-indeks-terminu-serii"));
    sprawdzWarunek(wyniki[1].includes("UTWORZ_SERIE_OGLOSZEN_BUR"));
  });
})();
