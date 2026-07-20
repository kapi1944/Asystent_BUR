(function testyNiejednoznacznychTerminówBur() {
  const bur = window.BurAsystent;
  const terminy = [
    { dataStartBur: "01-07-2027", dataKoniecBur: "02-07-2027", miejsce: "Wrocław", forma: "stacjonarna" },
    { dataStartBur: "01-07-2027", dataKoniecBur: "02-07-2027", miejsce: "Szkolenie online", forma: "online" }
  ];

  function poczekajNa(warunek) {
    return new Promise(function czekaj(resolve, reject) {
      let próby = 0;
      const zegar = window.setInterval(function sprawdź() {
        próby += 1;
        if (warunek()) {
          window.clearInterval(zegar);
          resolve();
        } else if (próby > 80) {
          window.clearInterval(zegar);
          reject(new Error("Panel nie osiągnął oczekiwanego stanu."));
        }
      }, 25);
    });
  }

  function utwórzPanelNiejednoznaczny() {
    return fetch("../panel/panel.html").then(function odczytaj(odpowiedź) {
      return odpowiedź.text();
    }).then(function osadź(html) {
      const dane = {
        ostatnieSzkolenieSemper: { tytułOryginalny: "Test", terminy: terminy, sekcje: {} },
        wybranyTerminSemperIndex: null,
        źródłoWyboruTerminuSemper: "brak",
        odciskAktualnegoTerminuBur: "2027-07-01|2027-07-02|||https://uslugirozwojowe.parp.gov.pl/edit/1"
      };
      const ramka = document.createElement("iframe");
      const konfiguracja = "<base href='../panel/'><script>(function(){"
        + "const dane=" + JSON.stringify(dane) + ";"
        + "const terminBur={dataRozpoczęcia:'2027-07-01',dataZakończenia:'2027-07-02',tryb:'',lokalizacja:'',url:'https://uslugirozwojowe.parp.gov.pl/edit/1'};"
        + "window.__daneTestowe=dane;"
        + "window.chrome={runtime:{lastError:null,sendMessage:function(a,b){b({});}},scripting:{insertCSS:function(){return Promise.resolve();},executeScript:function(){return Promise.resolve();}},storage:{local:{get:function(klucze,cb){const wynik={};klucze.forEach(function(k){wynik[k]=dane[k];});cb(wynik);},set:function(nowe,cb){Object.assign(dane,nowe);if(cb){cb();}},remove:function(klucze,cb){klucze.forEach(function(k){delete dane[k];});if(cb){cb();}}},session:{get:function(a,b){b({});},set:function(a,b){if(b){b();}}}},tabs:{query:function(){return Promise.resolve([{id:1,url:terminBur.url,active:true}]);},sendMessage:function(id,msg,cb){if(msg.typ==='PING_SKRYPTU_STRONY'){cb({ok:true,typ:'PONG_SKRYPTU_STRONY',typStrony:'BUR',wersjaSkryptu:'test'});}else if(msg.typ==='POBIERZ_AKTUALNY_TERMIN_BUR'){cb({typ:'ODPOWIEDŹ_AKTUALNY_TERMIN_BUR',wynik:terminBur});}else if(msg.typ==='SPRAWDŹ_PROGRAM_I_HARMONOGRAM_BUR'){cb({wynik:{}});}else{cb({wynik:{ok:true}});}},onActivated:{addListener:function(){}},onUpdated:{addListener:function(){}}}};"
        + "})();<\/script>";
      ramka.hidden = true;
      ramka.srcdoc = html.replace("<head>", "<head>" + konfiguracja);
      document.body.appendChild(ramka);
      return new Promise(function gotowy(resolve) {
        ramka.addEventListener("load", function poZaładowaniu() {
          poczekajNa(function pokazanoKandydatów() {
            return ramka.contentWindow.document.querySelectorAll("[data-indeks-kandydata]").length === 2;
          }).then(function zwróć() { resolve(ramka); });
        }, { once: true });
      });
    });
  }

  test("normalizuje warianty online i stacjonarne", function sprawdź() {
    sprawdzRownosc(bur.normalizujTrybTerminu("Szkolenie online"), "online");
    sprawdzRownosc(bur.normalizujTrybTerminu("forma zdalna"), "online");
    sprawdzRownosc(bur.normalizujTrybTerminu("stacjonarny"), "stacjonarny");
  });

  test("znany tryb Online wybiera wyłącznie termin online", function sprawdź() {
    const wynik = bur.dopasujTerminSemperDoBur(terminy, { dataRozpoczęcia: "2027-07-01", dataZakończenia: "2027-07-02", tryb: "forma zdalna" });
    sprawdzRownosc(wynik.status, "dopasowany");
    sprawdzRownosc(wynik.indeks, 1);
  });

  test("znany tryb stacjonarny usuwa online z kandydatów", function sprawdź() {
    const rozszerzone = terminy.concat({ dataStartBur: "01-07-2027", dataKoniecBur: "02-07-2027", miejsce: "Warszawa", forma: "stacjonarny" });
    const wynik = bur.dopasujTerminSemperDoBur(rozszerzone, { dataRozpoczęcia: "2027-07-01", dataZakończenia: "2027-07-02", tryb: "stacjonarne" });
    sprawdzRownosc(wynik.status, "niejednoznaczny");
    sprawdzRownosc(wynik.indeksy.join(","), "0,2");
  });

  test("nierozpoznany tryb pozostawia kandydatów do wyboru", function sprawdź() {
    const wynik = bur.dopasujTerminSemperDoBur(terminy, { dataRozpoczęcia: "2027-07-01", dataZakończenia: "2027-07-02", tryb: "hybrydowa" });
    sprawdzRownosc(wynik.status, "niejednoznaczny");
    sprawdzRownosc(wynik.indeksy.join(","), "0,1");
  });

  test("kontekst harmonogramu rozróżnia warianty o tych samych datach", function sprawdź() {
    const stacjonarny = bur.utwórzKontekstTerminuSemper(terminy[0], 0);
    const online = bur.utwórzKontekstTerminuSemper(terminy[1], 1);
    sprawdzWarunek(!bur.czyKontekstTerminuSemperZgodny(stacjonarny, online));
  });

  test("wybór niejednoznacznych kandydatów nie zależy od filtra listy", function sprawdź() {
    return utwórzPanelNiejednoznaczny().then(function zweryfikuj(ramka) {
      const dokument = ramka.contentWindow.document;
      sprawdzRownosc(dokument.querySelectorAll(".oznaczenie-bur").length, 0);
      sprawdzRownosc(dokument.querySelectorAll("[data-indeks-kandydata]").length, 2);
      dokument.querySelector('[data-filtr-terminow="stacjonarne"]').click();
      sprawdzRownosc(dokument.querySelectorAll(".pozycja-terminu-semper").length, 1);
      sprawdzRownosc(dokument.querySelectorAll("[data-indeks-kandydata]").length, 2);
      ramka.remove();
    });
  });

  test("kliknięcie kandydata wybiera wspólny termin i unieważnia wariant harmonogramu", function sprawdź() {
    return utwórzPanelNiejednoznaczny().then(function zweryfikuj(ramka) {
      const dokument = ramka.contentWindow.document;
      const dane = ramka.contentWindow.__daneTestowe;
      dane.wybranyTerminSemperIndex = 0;
      dane.źródłoWyboruTerminuSemper = "ręczny";
      dane.harmonogramBurPrzygotowany = true;
      dokument.querySelector('[data-indeks-kandydata="1"]').click();
      return poczekajNa(function zapisanoWybór() {
        return dane.wybranyTerminSemperIndex === 1 && dane.harmonogramBurPrzygotowany === false;
      }).then(function sprawdźWybór() {
        dokument.querySelector('[data-filtr-terminow="wszystkie"]').click();
        sprawdzRownosc(dokument.querySelectorAll(".oznaczenie-bur").length, 1);
        sprawdzRownosc(dokument.querySelector('.oznaczenie-bur').textContent, "✓ BUR");
        ramka.remove();
      });
    });
  });

  test("wprowadzenie blokuje harmonogram starego wariantu o tych samych datach", function sprawdź() {
    return utwórzPanelNiejednoznaczny().then(function zweryfikuj(ramka) {
      const dokument = ramka.contentWindow.document;
      const dane = ramka.contentWindow.__daneTestowe;
      dane.wybranyTerminSemperIndex = 1;
      dane.źródłoWyboruTerminuSemper = "ręczny";
      dane.harmonogramBurPrzygotowany = true;
      dane.ostatniWybranyTerminHarmonogramuBur = 1;
      dane.ostatniePozycjeHarmonogramuBur = [{ przedmiot: "Test", dzien_swiadczenia: "2027-07-01" }];
      dane.datyPrzygotowanegoHarmonogramuBur = { dataRozpoczęcia: "2027-07-01", dataZakończenia: "2027-07-02" };
      dane.kontekstPrzygotowanegoHarmonogramuBur = bur.utwórzKontekstTerminuSemper(terminy[0], 0);
      const przycisk = dokument.getElementById("przycisk-importuj-harmonogram-xlsx");
      przycisk.disabled = false;
      przycisk.click();
      return poczekajNa(function pokazanoBlokadę() {
        return dokument.getElementById("status-programu-harmonogramu").textContent.includes("innego wariantu");
      }).then(function sprawdźBlokadę() {
        ramka.remove();
      });
    });
  });
})();
