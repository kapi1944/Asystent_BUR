(function testyPaneluTerminów() {
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

  function utwórzPanelTerminów() {
    return fetch("../panel/panel.html").then(function odczytaj(odpowiedź) {
      return odpowiedź.text();
    }).then(function osadź(html) {
      const terminy = [
        { dataStartBur: "21-06-2027", dataKoniecBur: "22-06-2027", miejsce: "Gdańsk", forma: "stacjonarna" },
        { dataStartBur: "21-06-2027", dataKoniecBur: "22-06-2027", miejsce: "Warszawa", forma: "stacjonarna" },
        { dataStartBur: "21-06-2027", dataKoniecBur: "22-06-2027", miejsce: "Szkolenie online", forma: "online" },
        { dataStartBur: "15-10-2027", dataKoniecBur: "16-10-2027", miejsce: "Wrocław", forma: "stacjonarna" },
        { dataStartBur: "15-10-2027", dataKoniecBur: "16-10-2027", miejsce: "Szkolenie online", forma: "online" }
      ];
      const dane = {
        ostatnieSzkolenieSemper: { tytułOryginalny: "Test", terminy: terminy, sekcje: {} },
        wybranyTerminSemperIndex: 0,
        harmonogramBurPrzygotowany: true,
        odciskAktualnegoTerminuBur: "2027-05-17|2027-05-18|stacjonarna|gdansk|https://uslugirozwojowe.parp.gov.pl/edit/1"
      };
      const ramka = document.createElement("iframe");
      const konfiguracja = "<base href='../panel/'><script>(function(){"
        + "const dane=" + JSON.stringify(dane) + ";"
        + "let terminBur={dataRozpoczęcia:'2027-06-21',dataZakończenia:'2027-06-22',tryb:'stacjonarna',lokalizacja:'Warszawa',url:'https://uslugirozwojowe.parp.gov.pl/edit/1'};"
        + "const aktywowane=[],zaktualizowane=[],wiadomości=[];"
        + "window.__daneTestowe=dane;window.__ustawTerminBur=function(nowy){terminBur=nowy;wiadomości.forEach(function(fn){fn({typ:'ZMIENIONO_AKTUALNY_TERMIN_BUR',wynik:terminBur},{tab:{id:1}});});};"
        + "window.chrome={runtime:{lastError:null,sendMessage:function(a,b){if(b){b({});}},onMessage:{addListener:function(fn){wiadomości.push(fn);}}},scripting:{insertCSS:function(){return Promise.resolve();},executeScript:function(){return Promise.resolve();}},"
        + "storage:{local:{get:function(klucze,cb){const wynik={};klucze.forEach(function(k){wynik[k]=dane[k];});cb(wynik);},set:function(nowe,cb){Object.assign(dane,nowe);if(cb){cb();}},remove:function(klucze,cb){klucze.forEach(function(k){delete dane[k];});if(cb){cb();}}},session:{get:function(a,b){b({});},set:function(a,b){if(b){b();}}}},"
        + "tabs:{query:function(){return Promise.resolve([{id:1,url:terminBur.url,active:true}]);},sendMessage:function(id,msg,cb){if(msg.typ==='PING_SKRYPTU_STRONY'){cb({ok:true,typ:'PONG_SKRYPTU_STRONY',typStrony:'BUR',wersjaSkryptu:'test'});}else if(msg.typ==='POBIERZ_AKTUALNY_TERMIN_BUR'){cb({typ:'ODPOWIEDŹ_AKTUALNY_TERMIN_BUR',wynik:terminBur});}else if(msg.typ==='SPRAWDŹ_PROGRAM_I_HARMONOGRAM_BUR'){cb({wynik:{}});}else{cb({wynik:{ok:true}});}},onActivated:{addListener:function(fn){aktywowane.push(fn);}},onUpdated:{addListener:function(fn){zaktualizowane.push(fn);}}}};"
        + "})();<\/script>";
      ramka.hidden = true;
      ramka.srcdoc = html.replace("<head>", "<head>" + konfiguracja);
      document.body.appendChild(ramka);
      return new Promise(function gotowy(resolve) {
        ramka.addEventListener("load", function poZaładowaniu() {
          poczekajNa(function dopasowano() {
            return ramka.contentWindow.__daneTestowe.wybranyTerminSemperIndex === 1;
          }).then(function zwróć() { resolve(ramka); });
        }, { once: true });
      });
    });
  }

  test("panel grupuje terminy i automatycznie dopasowuje wariant BUR", function sprawdź() {
    return utwórzPanelTerminów().then(function zweryfikuj(ramka) {
      const dokument = ramka.contentWindow.document;
      const nagłówki = Array.from(dokument.querySelectorAll(".naglowek-grupy-terminow")).map(function tekst(element) { return element.textContent; });
      sprawdzRownosc(nagłówki.join("|"), "21–22.06.2027|15–16.10.2027");
      sprawdzRownosc(dokument.querySelectorAll(".pozycja-terminu-semper").length, 5);
      sprawdzWarunek(dokument.querySelector('.pozycja-terminu-semper[data-indeks-terminu="1"]').classList.contains("wybrany"));
      sprawdzWarunek(dokument.querySelector("#aktualny-zakres-bur").textContent.includes("21–22.06.2027"));
      sprawdzWarunek(dokument.querySelector("#aktualne-szczegoly-bur").textContent.includes("Warszawa"));
      sprawdzWarunek(!dokument.querySelector("#aktualne-szczegoly-bur").textContent.includes("Gdańsk"));
      sprawdzWarunek(!dokument.querySelector("#lista-terminow-semper").textContent.includes("Szkolenie online · online"));
      sprawdzWarunek(dokument.querySelector("#lista-terminow-semper").textContent.includes("Termin 3 · Online"));
      ramka.remove();
    });
  });

  test("sticky terminu BUR pokazuje brak nierozpoznanego terminu", function sprawdź() {
    return utwórzPanelTerminów().then(function zweryfikuj(ramka) {
      ramka.contentWindow.__ustawTerminBur({ url: "https://uslugirozwojowe.parp.gov.pl/edit/1" });
      return poczekajNa(function pokazanoBrak() {
        return ramka.contentWindow.document.querySelector("#aktualny-zakres-bur").textContent === "Nie wybrano terminu";
      }).then(function zakończ() { ramka.remove(); });
    });
  });

  test("sticky terminu BUR aktualizuje datę natychmiast po zmianie formularza", function sprawdź() {
    return utwórzPanelTerminów().then(function zweryfikuj(ramka) {
      const dokument = ramka.contentWindow.document;
      ramka.contentWindow.__ustawTerminBur({ dataRozpoczęcia: "2027-10-15", dataZakończenia: "2027-10-16", tryb: "stacjonarna", lokalizacja: "Wrocław", url: "https://uslugirozwojowe.parp.gov.pl/edit/1" });
      return poczekajNa(function pokazanoNowy() {
        return dokument.querySelector("#aktualny-zakres-bur").textContent.includes("15–16.10.2027");
      }).then(function sprawdźSzczegóły() {
        sprawdzWarunek(dokument.querySelector("#aktualne-szczegoly-bur").textContent.includes("Wrocław"));
        ramka.remove();
      });
    });
  });

  test("sticky terminu BUR nie pozostawia danych poprzedniego terminu", function sprawdź() {
    return utwórzPanelTerminów().then(function zweryfikuj(ramka) {
      const dokument = ramka.contentWindow.document;
      ramka.contentWindow.__ustawTerminBur({ dataRozpoczęcia: "2027-10-15", dataZakończenia: "2027-10-16", tryb: "online", lokalizacja: "", url: "https://uslugirozwojowe.parp.gov.pl/edit/1" });
      return poczekajNa(function pokazanoNowy() {
        return dokument.querySelector("#aktualny-zakres-bur").textContent.includes("15–16.10.2027");
      }).then(function sprawdźBrakStarychDanych() {
        const tekst = dokument.querySelector("#aktualny-termin-bur").textContent;
        sprawdzWarunek(!tekst.includes("21–22.06.2027") && !tekst.includes("Warszawa"));
        sprawdzWarunek(tekst.includes("online"));
        ramka.remove();
      });
    });
  });

  test("filtr panelu nie zmienia automatycznie wybranego terminu", function sprawdź() {
    return utwórzPanelTerminów().then(function zweryfikuj(ramka) {
      const dokument = ramka.contentWindow.document;
      dokument.querySelector('[data-filtr-terminow="online"]').click();
      sprawdzRownosc(dokument.querySelectorAll(".pozycja-terminu-semper").length, 2);
      sprawdzRownosc(dokument.querySelectorAll(".grupa-terminow").length, 2);
      sprawdzRownosc(ramka.contentWindow.__daneTestowe.wybranyTerminSemperIndex, 1);
      ramka.remove();
    });
  });

  test("ręczny wybór niezgodnego terminu pokazuje ostrzeżenie", function sprawdź() {
    return utwórzPanelTerminów().then(function zweryfikuj(ramka) {
      const dokument = ramka.contentWindow.document;
      dokument.querySelector('.pozycja-terminu-semper[data-indeks-terminu="3"]').click();
      return poczekajNa(function zapisanoWybór() {
        return ramka.contentWindow.__daneTestowe.wybranyTerminSemperIndex === 3;
      }).then(function sprawdźZapis() {
        sprawdzRownosc(ramka.contentWindow.__daneTestowe.źródłoWyboruTerminuSemper, "ręczny");
        sprawdzWarunek(dokument.querySelector("#status-dopasowania-terminu").textContent.includes("niezgodny"));
        sprawdzRownosc(ramka.contentWindow.__daneTestowe.harmonogramBurPrzygotowany, false);
        ramka.remove();
      });
    });
  });
})();
