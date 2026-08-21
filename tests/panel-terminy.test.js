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

  function utwórzPanelTerminów(htmlAutomatycznegoImportu) {
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
        ostatnieSzkolenieSemper: { tytułOryginalny: "Prawo ochrony środowiska w praktyce", terminy: terminy, sekcje: {} },
        wybranyTerminSemperIndex: 0,
        harmonogramBurPrzygotowany: true,
        odciskAktualnegoTerminuBur: "2027-05-17|2027-05-18|stacjonarna|gdansk|https://uslugirozwojowe.parp.gov.pl/edit/1"
      };
      const ramka = document.createElement("iframe");
      const konfiguracja = "<base href='../panel/'><script>(function(){"
        + "const dane=" + JSON.stringify(dane) + ";"
        + "const htmlAutomatycznegoImportu=" + JSON.stringify(htmlAutomatycznegoImportu || "") + ";"
        + "let terminBur={tytuł:'Prawo ochrony środowiska w praktyce',dataRozpoczęcia:'2027-06-21',dataZakończenia:'2027-06-22',tryb:'stacjonarna',lokalizacja:'Warszawa',url:'https://uslugirozwojowe.parp.gov.pl/edit/1'};"
        + "const aktywowane=[],zaktualizowane=[],wiadomości=[],wiadomościRuntime=[];"
        + "window.__daneTestowe=dane;window.__wiadomościRuntime=wiadomościRuntime;window.__ustawTerminBur=function(nowy){terminBur=nowy;wiadomości.forEach(function(fn){fn({typ:'ZMIENIONO_AKTUALNY_TERMIN_BUR',wynik:terminBur},{tab:{id:1}});});};"
        + "window.chrome={runtime:{lastError:null,sendMessage:function(a,b){wiadomościRuntime.push(a);if(!b){return;}if(a&&a.typ==='bur.ensureContentScript'){b({ok:true,wynik:{pong:{ok:true,typ:'bur.pong',typStrony:'BUR',wersjaSkryptu:'test'}}});}else if(htmlAutomatycznegoImportu&&a.typ==='SZUKAJ_ŁĄCZA_SEMPER'){b({wynik:{ok:true,wynik:{url:'https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html',tytuł:'Prawo ochrony środowiska w praktyce'}}});}else if(htmlAutomatycznegoImportu&&a.typ==='IMPORTUJ_SEMPER_Z_ŁĄCZA'){b({wynik:{ok:true,html:htmlAutomatycznegoImportu,url:a.url}});}else{b({});}},onMessage:{addListener:function(fn){wiadomości.push(fn);}}},scripting:{insertCSS:function(){return Promise.resolve();},executeScript:function(){return Promise.resolve();}},"
        + "storage:{local:{get:function(klucze,cb){const wynik={};klucze.forEach(function(k){wynik[k]=dane[k];});cb(wynik);},set:function(nowe,cb){Object.assign(dane,nowe);if(cb){cb();}},remove:function(klucze,cb){klucze.forEach(function(k){delete dane[k];});if(cb){cb();}}},session:{get:function(a,b){b({});},set:function(a,b){if(b){b();}}}},"
        + "tabs:{query:function(){return Promise.resolve([{id:1,url:terminBur.url,active:true}]);},sendMessage:function(id,msg,cb){if(msg.typ==='PING_SKRYPTU_STRONY'){cb({ok:true,typ:'PONG_SKRYPTU_STRONY',typStrony:'BUR',wersjaSkryptu:'test'});}else if(msg.typ==='POBIERZ_AKTUALNY_TERMIN_BUR'){cb({typ:'ODPOWIEDŹ_AKTUALNY_TERMIN_BUR',wynik:terminBur});}else if(msg.typ==='USTAW_TERMIN_BUR'){terminBur=Object.assign({},terminBur,{dataRozpoczęcia:msg.termin.dataStartBur,dataZakończenia:msg.termin.dataKoniecBur,tryb:msg.termin.forma,lokalizacja:msg.termin.miejsce});cb({typ:'ODPOWIEDŹ_USTAW_TERMIN_BUR',wynik:{ok:true,zgodneDaty:true,terminBur:terminBur}});}else if(msg.typ==='SPRAWDŹ_PROGRAM_I_HARMONOGRAM_BUR'){cb({wynik:{}});}else{cb({wynik:{ok:true}});}},onActivated:{addListener:function(fn){aktywowane.push(fn);}},onUpdated:{addListener:function(fn){zaktualizowane.push(fn);}}}};"
        + "})();<\/script>";
      ramka.hidden = true;
      ramka.srcdoc = html.replace("<head>", "<head>" + konfiguracja);
      document.body.appendChild(ramka);
      return new Promise(function gotowy(resolve) {
        ramka.addEventListener("load", function poZaładowaniu() {
          poczekajNa(function dopasowano() {
            const danePanelu = ramka.contentWindow.__daneTestowe;
            return htmlAutomatycznegoImportu
              ? Boolean(danePanelu.ostatnieŁączeSemper && danePanelu.wybranyTerminSemperIndex === 0)
              : danePanelu.wybranyTerminSemperIndex === 1;
          }).then(function zwróć() { resolve(ramka); });
        }, { once: true });
      });
    });
  }

  test("panel pokazuje jednoliniowe terminy i automatycznie dopasowuje wariant BUR", function sprawdź() {
    return utwórzPanelTerminów().then(function zweryfikuj(ramka) {
      const dokument = ramka.contentWindow.document;
      sprawdzRownosc(dokument.querySelectorAll(".naglowek-grupy-terminow").length, 0);
      sprawdzRownosc(dokument.querySelectorAll(".pozycja-terminu-semper").length, 5);
      sprawdzWarunek(dokument.querySelector('.pozycja-terminu-semper[data-indeks-terminu="1"]').classList.contains("wybrany"));
      sprawdzWarunek(dokument.querySelector("#aktualny-zakres-bur").textContent.includes("21–22.06.2027"));
      sprawdzRownosc(dokument.querySelector("#aktualny-tytul-bur").textContent, "Prawo ochrony środowiska w praktyce");
      sprawdzWarunek(!dokument.querySelector("#aktualny-tytul-bur").textContent.includes("Test"), "Tytuł SEMPER nie może zastąpić tytułu BUR.");
      sprawdzWarunek(dokument.querySelector("#aktualne-szczegoly-bur").textContent.includes("Warszawa"));
      sprawdzWarunek(!dokument.querySelector("#aktualne-szczegoly-bur").textContent.includes("Gdańsk"));
      sprawdzWarunek(!dokument.querySelector("#lista-terminow-semper").textContent.includes("Szkolenie online · online"));
      sprawdzWarunek(dokument.querySelector("#lista-terminow-semper").textContent.includes("Termin 3 · 21–22.06.2027 · Online"));
      sprawdzWarunek(dokument.querySelector("#lista-terminow-harmonogramu-semper").textContent.includes("Termin 1 · 21–22.06.2027 · Gdańsk"));
      sprawdzRownosc(ramka.contentWindow.getComputedStyle(dokument.querySelector(".pozycja-terminu-semper > span")).whiteSpace, "nowrap");
      sprawdzRownosc(ramka.contentWindow.getComputedStyle(dokument.querySelector(".pozycja-terminu-harmonogramu > span")).whiteSpace, "nowrap");
      ramka.remove();
    });
  });

  test("kompletny termin BUR automatycznie uruchamia wyszukiwanie szkolenia", function sprawdź() {
    return utwórzPanelTerminów().then(function zweryfikuj(ramka) {
      return poczekajNa(function wysłanoWyszukiwanie() {
        return ramka.contentWindow.__wiadomościRuntime.some(function jestWyszukiwaniem(wiadomość) {
          return wiadomość.typ === "SZUKAJ_ŁĄCZA_SEMPER";
        });
      }).then(function sprawdźFrazę() {
        const wiadomość = ramka.contentWindow.__wiadomościRuntime.find(function znajdźWyszukiwanie(pozycja) {
          return pozycja.typ === "SZUKAJ_ŁĄCZA_SEMPER";
        });
        sprawdzRownosc(wiadomość.fraza, "Prawo ochrony środowiska w praktyce");
        ramka.remove();
      });
    });
  });

  test("automatyczne wyszukiwanie importuje ofertę i dopasowuje termin po lokalizacji", function sprawdź() {
    const html = [
      "<html><body><h1>Prawo ochrony środowiska w praktyce</h1><table>",
      "<tr><th>Termin</th><th>Miejsce</th><th>Czas trwania</th><th>Koszt</th></tr>",
      "<tr><td>21.06.2027 - 22.06.2027</td><td>Warszawa</td><td>2 dni</td><td>1900 zł netto</td></tr>",
      "</table></body></html>"
    ].join("");

    return utwórzPanelTerminów(html).then(function zweryfikuj(ramka) {
      return poczekajNa(function zaimportowanoIDopasowano() {
        const dane = ramka.contentWindow.__daneTestowe;
        return dane.ostatnieŁączeSemper && dane.wybranyTerminSemperIndex === 0;
      }).then(function sprawdźWynik() {
        const dane = ramka.contentWindow.__daneTestowe;
        sprawdzRownosc(dane.ostatnieŁączeSemper, "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html");
        sprawdzRownosc(dane.ostatnieSzkolenieSemper.terminy[0].miejsce, "Warszawa");
        sprawdzRownosc(dane.źródłoWyboruTerminuSemper, "automatyczny");
        ramka.remove();
      });
    });
  });

  test("długi tytuł sticky jest jednowierszowy z ellipsis i pełnym tooltipem", function sprawdź() {
    return utwórzPanelTerminów().then(function zweryfikuj(ramka) {
      const dokument = ramka.contentWindow.document;
      const długiTytuł = "Bardzo długi tytuł aktualnie edytowanej usługi BUR dotyczącej prawa ochrony środowiska w praktyce";
      ramka.contentWindow.__ustawTerminBur({ tytuł: długiTytuł, dataRozpoczęcia: "2027-06-21", dataZakończenia: "2027-06-22", url: "https://uslugirozwojowe.parp.gov.pl/edit/1" });
      return poczekajNa(function pokazanoTytuł() {
        return dokument.querySelector("#aktualny-tytul-bur").textContent === długiTytuł;
      }).then(function sprawdźPrezentację() {
        const element = dokument.querySelector("#aktualny-tytul-bur");
        const styl = ramka.contentWindow.getComputedStyle(element);
        sprawdzRownosc(element.title, długiTytuł);
        sprawdzRownosc(styl.overflow, "hidden");
        sprawdzRownosc(styl.textOverflow, "ellipsis");
        sprawdzRownosc(styl.whiteSpace, "nowrap");
        ramka.remove();
      });
    });
  });

  test("zmiana usługi aktualizuje tytuł i usuwa tytuł poprzedniej", function sprawdź() {
    return utwórzPanelTerminów().then(function zweryfikuj(ramka) {
      const dokument = ramka.contentWindow.document;
      ramka.contentWindow.__ustawTerminBur({ tytuł: "Druga usługa BUR", dataRozpoczęcia: "2027-10-15", dataZakończenia: "2027-10-16", url: "https://uslugirozwojowe.parp.gov.pl/edit/2" });
      return poczekajNa(function pokazanoNowyTytuł() {
        return dokument.querySelector("#aktualny-tytul-bur").textContent === "Druga usługa BUR";
      }).then(function sprawdźZmianę() {
        sprawdzWarunek(!dokument.querySelector("#aktualny-termin-bur").textContent.includes("Prawo ochrony środowiska"));
        ramka.contentWindow.__ustawTerminBur({ tytuł: "", dataRozpoczęcia: "2027-10-15", dataZakończenia: "2027-10-16", url: "https://uslugirozwojowe.parp.gov.pl/edit/3" });
        return poczekajNa(function pokazanoBrakTytułu() {
          return dokument.querySelector("#aktualny-tytul-bur").textContent === "Brak tytułu usługi";
        });
      }).then(function zakończ() {
        sprawdzRownosc(dokument.querySelector("#aktualny-tytul-bur").title, "Brak tytułu usługi");
        ramka.remove();
      });
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
      sprawdzRownosc(dokument.querySelectorAll(".grupa-terminow").length, 0);
      sprawdzRownosc(ramka.contentWindow.__daneTestowe.wybranyTerminSemperIndex, 1);
      ramka.remove();
    });
  });

  test("ręczny wybór terminu zapisuje daty BUR i potwierdza zgodność", function sprawdź() {
    return utwórzPanelTerminów().then(function zweryfikuj(ramka) {
      const dokument = ramka.contentWindow.document;
      dokument.querySelector('.pozycja-terminu-semper[data-indeks-terminu="3"]').click();
      return poczekajNa(function zapisanoWybór() {
        return ramka.contentWindow.__daneTestowe.wybranyTerminSemperIndex === 3;
      }).then(function sprawdźZapis() {
        sprawdzRownosc(ramka.contentWindow.__daneTestowe.źródłoWyboruTerminuSemper, "ręczny");
        sprawdzWarunek(dokument.querySelector("#status-dopasowania-terminu").textContent.includes("zgodny"));
        sprawdzWarunek(dokument.querySelector("#aktualny-termin-bur").classList.contains("stan-zgodny"));
        sprawdzWarunek(dokument.querySelector("#aktualny-termin-zrodlowy").classList.contains("stan-zgodny"));
        sprawdzRownosc(ramka.contentWindow.__daneTestowe.harmonogramBurPrzygotowany, false);
        ramka.remove();
      });
    });
  });
})();
