(function testujNawigacjęPanelu() {
  function pobierzPlik(ścieżka) {
    return fetch(ścieżka).then(function sprawdźOdpowiedź(odpowiedź) {
      if (!odpowiedź.ok) {
        throw new Error("Nie udało się odczytać pliku: " + ścieżka);
      }
      return odpowiedź.text();
    });
  }

  function pobierzElementyNawigacji(html) {
    const dokument = new DOMParser().parseFromString(html, "text/html");
    return Array.from(dokument.querySelectorAll("[data-przelacz-zakladke]"));
  }

  test("przygotowanie harmonogramu nie zależy od aktywnej karty BUR ani synchronizacji terminu", function sprawdźPrzygotowanieLokalne() {
    return pobierzPlik("../panel/panel.js").then(function sprawdźKod(kod) {
      const funkcja = kod.match(/function przygotujHarmonogramWPanelu\(\) \{([\s\S]*?)\n  \}\n\n  function uzupełnijProgramWPanelu/);

      sprawdzWarunek(Boolean(funkcja), "Nie znaleziono funkcji przygotowania harmonogramu.");
      sprawdzWarunek(!funkcja[1].includes("zweryfikujTerminPrzedPrzygotowaniem"), "Przygotowanie harmonogramu nie może synchronizować terminu BUR.");
      sprawdzWarunek(!funkcja[1].includes("pobierzAktualnyTerminBurZKarty"), "Przygotowanie harmonogramu nie może odczytywać aktywnej karty BUR.");
      sprawdzWarunek(funkcja[1].includes("zbudujDaneProgramuHarmonogramu()"), "Przygotowanie ma lokalnie budować dane harmonogramu.");
    });
  });

  function utwórzPanelTestowy(czySkryptStronyDostępny) {
    return pobierzPlik("../panel/panel.html").then(function utwórzRamkę(html) {
      const ramka = document.createElement("iframe");
      const konfiguracjaChrome = JSON.stringify(Boolean(czySkryptStronyDostępny));
      const mockChrome = "<base href='../panel/'><script>"
        + "window.chrome={runtime:{lastError:null,sendMessage:function(a,b){b({});}},scripting:{insertCSS:function(){return Promise.resolve();},executeScript:function(){return Promise.reject(new Error('Brak skryptu'));}},storage:{local:{get:function(a,b){b({});},set:function(a,b){if(b){b();}},remove:function(a,b){if(b){b();}}},session:{get:function(a,b){b({});},set:function(a,b){if(b){b();}}}},tabs:{query:function(){return Promise.resolve([{id:1,url:'https://uslugirozwojowe.parp.gov.pl/list',active:true}]);},sendMessage:function(a,b,c){if(!"
        + konfiguracjaChrome
        + "){window.chrome.runtime.lastError={message:'Brak skryptu'};c();window.chrome.runtime.lastError=null;return;}c({ok:true,typ:'PONG_SKRYPTU_STRONY',typStrony:'BUR',wersjaSkryptu:'test'});},onActivated:{addListener:function(){}},onUpdated:{addListener:function(){}}}};"
        + "</script>";
      ramka.hidden = true;
      ramka.srcdoc = html.replace("<head>", "<head>" + mockChrome);
      document.body.appendChild(ramka);
      return new Promise(function poczekaj(resolve, reject) {
        ramka.addEventListener("load", function gotowe() {
          if (ramka.contentWindow.document.body.dataset.aktywnaZakladka) {
            resolve(ramka);
            return;
          }
          reject(new Error("Panel nie ustawił aktywnej sekcji."));
        }, { once: true });
      });
    });
  }

  test("Panel ma pięć pionowych przycisków nawigacji", function sprawdźPrzyciski() {
    return Promise.all([pobierzPlik("../panel/panel.html"), pobierzPlik("../panel/panel.css")]).then(function sprawdźPliki(wyniki) {
      const przyciski = pobierzElementyNawigacji(wyniki[0]);
      const zakładki = przyciski.map(function pobierzZakładkę(przycisk) { return przycisk.dataset.przelaczZakladke; });

      sprawdzRownosc(przyciski.length, 5, "Panel powinien zawierać pięć przycisków nawigacji.");
      sprawdzRownosc(zakładki.join(","), "semper,terminy,checklista,harmonogram,diagnostyka", "Kolejność zakładek jest niepoprawna.");
      sprawdzWarunek(/\.zakladki-panelu\s*\{[^}]*flex-direction:\s*column;/s.test(wyniki[1]), "Nawigacja musi być pionowa.");
      sprawdzWarunek(!/\.zakladki-panelu\s*\{[^}]*overflow-x:\s*auto;/s.test(wyniki[1]), "Nawigacja nie może wymagać poziomego przewijania.");
    });
  });

  test("Nawigacja panelu jest kompaktowa i pozostaje sticky", function sprawdźSticky() {
    return pobierzPlik("../panel/panel.css").then(function sprawdźCss(css) {
      const regułaNawigacji = css.match(/\.zakladki-panelu\s*\{([\s\S]*?)\n\}/);
      const regułaPrzycisków = css.match(/\.zakladki-panelu button\s*\{([\s\S]*?)\n\}/);

      sprawdzWarunek(Boolean(regułaNawigacji), "Brakuje wspólnego wrappera nawigacji.");
      sprawdzWarunek(/position:\s*sticky;/.test(regułaNawigacji[1]), "Wrapper nawigacji musi być sticky.");
      sprawdzWarunek(/top:\s*0;/.test(regułaNawigacji[1]), "Sticky navigation musi mieć ustalony top.");
      sprawdzWarunek(/z-index:\s*3;/.test(regułaNawigacji[1]), "Sticky navigation musi pozostać nad przewijaną treścią.");
      sprawdzWarunek(/background:\s*var\(--panel-drugi\);/.test(regułaNawigacji[1]), "Sticky navigation musi mieć nieprzezroczyste tło.");
      sprawdzWarunek(Boolean(regułaPrzycisków) && /min-height:\s*36px;/.test(regułaPrzycisków[1]), "Przyciski nawigacji powinny mieć kompaktową wysokość 36 px.");
      sprawdzWarunek(/gap:\s*5px;/.test(regułaNawigacji[1]), "Odstęp między przyciskami nawigacji powinien być kompaktowy.");
    });
  });

  test("Domyślnie aktywna jest tylko sekcja SEMPER", function sprawdźStanDomyślny() {
    return pobierzPlik("../panel/panel.html").then(function sprawdźHtml(html) {
      const dokument = new DOMParser().parseFromString(html, "text/html");
      const aktywne = Array.from(dokument.querySelectorAll('.zakladki-panelu [aria-pressed="true"]'));

      sprawdzRownosc(dokument.body.dataset.aktywnaZakladka, "semper", "Panel musi mieć domyślną zakładkę.");
      sprawdzRownosc(aktywne.length, 1, "Tylko jeden przycisk może być aktywny.");
      sprawdzRownosc(aktywne[0].dataset.przelaczZakladke, "semper", "SEMPER powinien być aktywny przy starcie.");
    });
  });

  test("wybór niejednoznacznego terminu znajduje się przed akcjami harmonogramu", function sprawdźPołożenieWyboru() {
    return pobierzPlik("../panel/panel.html").then(function sprawdźHtml(html) {
      const dokument = new DOMParser().parseFromString(html, "text/html");
      const wybór = dokument.getElementById("wybor-niejednoznacznego-terminu");
      const statusTabeli = dokument.getElementById("status-tabeli-harmonogramu");
      const przyciski = dokument.querySelector("#przycisk-uzupelnij-program").closest(".siatka-przycisków");

      sprawdzWarunek(wybór.closest('[data-zakladki="harmonogram"]') !== null, "Wybór terminu powinien należeć do zakładki Harmonogram.");
      sprawdzWarunek(Boolean(statusTabeli.compareDocumentPosition(wybór) & Node.DOCUMENT_POSITION_FOLLOWING), "Wybór terminu powinien być po statusie tabeli harmonogramu.");
      sprawdzWarunek(Boolean(wybór.compareDocumentPosition(przyciski) & Node.DOCUMENT_POSITION_FOLLOWING), "Wybór terminu powinien być przed przyciskami harmonogramu.");
    });
  });

  test("Przyciski przełączają sekcję kliknięciem oraz klawiaturą", function sprawdźObsługęPrzełączania() {
    return utwórzPanelTestowy(true).then(function sprawdźPanel(ramka) {
      const dokument = ramka.contentWindow.document;
      const zakładki = ["semper", "terminy", "checklista", "harmonogram", "diagnostyka"];

      zakładki.forEach(function sprawdźZakładkę(nazwa) {
        const przycisk = dokument.querySelector('[data-przelacz-zakladke="' + nazwa + '"]');
        przycisk.click();
        sprawdzRownosc(dokument.body.dataset.aktywnaZakladka, nazwa, "Kliknięcie nie przełączyło zakładki " + nazwa + ".");
        sprawdzRownosc(dokument.querySelectorAll('.zakladki-panelu [aria-pressed="true"]').length, 1, "Aktywna może być tylko jedna zakładka.");
        sprawdzRownosc(przycisk.getAttribute("aria-pressed"), "true", "Aktywny przycisk musi mieć aria-pressed=true.");
      });

      const przyciskChecklista = dokument.querySelector('[data-przelacz-zakladke="checklista"]');
      przyciskChecklista.click();
      return Promise.resolve().then(function sprawdźRęcznyWybór() {
        sprawdzRownosc(dokument.body.dataset.aktywnaZakladka, "checklista", "Ręczny wybór nie może zostać nadpisany po odświeżeniu statusu.");

        const przyciskSemper = dokument.querySelector('[data-przelacz-zakladke="semper"]');
      przyciskSemper.focus();
      przyciskSemper.dispatchEvent(new ramka.contentWindow.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      przyciskSemper.click();
      przyciskSemper.dispatchEvent(new ramka.contentWindow.KeyboardEvent("keydown", { key: " ", bubbles: true }));
      przyciskSemper.click();
      sprawdzRownosc(dokument.body.dataset.aktywnaZakladka, "semper", "Enter i Spacja muszą pozostawiać aktywną wybraną sekcję.");
      ramka.remove();
      return pobierzPlik("../panel/panel.js").then(function sprawdźWarunekRęcznegoWyboru(skrypt) {
        sprawdzWarunek(/if \(!czyUżytkownikWybrałZakładkę\) \{\s*ustawAktywnąZakładkęPanelu/s.test(skrypt), "Odświeżenie statusu nie może nadpisywać ręcznego wyboru.");
      });
      });
    });
  });

  test("Brak skryptu strony nie pozostawia pustego panelu", function sprawdźBłądPołączenia() {
    return utwórzPanelTestowy(false).then(function sprawdźPanel(ramka) {
      const dokument = ramka.contentWindow.document;
      const komunikat = dokument.getElementById("status-strony").textContent;

      sprawdzWarunek(komunikat.includes("Nie udało się połączyć z formularzem BUR."), "Brakuje czytelnego komunikatu po błędzie połączenia.");
      sprawdzRownosc(dokument.querySelectorAll('.zakladki-panelu [aria-pressed="true"]').length, 1, "Błąd połączenia nie może ukrywać nawigacji.");
      sprawdzWarunek(Boolean(dokument.querySelector('[data-zakladki="terminy"]')), "Błąd połączenia nie może usuwać treści panelu.");
      ramka.remove();
    });
  });

  test("Panel ma fallback wstrzyknięcia content scriptu i obsługuje subdomeny BUR", function sprawdźHotfixPołączenia() {
    return Promise.all([
      pobierzPlik("../panel/panel.js"),
      pobierzPlik("../content/bur-content.js"),
      pobierzPlik("../manifest.json")
    ]).then(function sprawdźPliki(wyniki) {
      const panel = wyniki[0];
      const content = wyniki[1];
      const manifest = wyniki[2];

      sprawdzWarunek(panel.includes("chrome.scripting.executeScript"), "Panel nie ma fallbacku ponownego wstrzyknięcia content scriptu.");
      sprawdzWarunek(panel.includes("zapewnijSkryptStrony"), "Panel nie wykonuje handshake przed operacją BUR.");
      sprawdzWarunek(content.includes("__BUR_ASYSTENT_CONTENT_LISTENER_LOADED__"), "Content script nie chroni przed podwójnym listenerem.");
      sprawdzWarunek(content.includes("wersjaSkryptu"), "PING content scriptu nie zwraca wersji.");
      sprawdzWarunek(manifest.includes("https://*.uslugirozwojowe.parp.gov.pl/*"), "Manifest nie obsługuje subdomen BUR.");
    });
  });
  test("Import harmonogramu używa #import i nie otwiera modalu osoby prowadzącej", function sprawdźZakresImportu() {
    return pobierzPlik("../content/bur-content.js").then(function sprawdźContent(skrypt) {
      sprawdzWarunek(
        skrypt.includes("const inputPliku = await znajdźInputPlikuImportu();"),
        "Import powinien oczekiwać na input utworzony przez przycisk #import."
      );
      sprawdzWarunek(
        skrypt.includes('przyciskImportu.id !== "import"'),
        "Import nie jest ograniczony do właściwego przycisku #import."
      );
      sprawdzWarunek(
        skrypt.includes("znajdźPrzyciskDodajPozycjęHarmonogramu"),
        "Tryb awaryjny nie ma dedykowanego wyszukiwania przycisku Dodaj pozycję."
      );
      sprawdzWarunek(
        !skrypt.includes("const przyciskDodaj = znajdźPrzyciskPoTekście([/dodaj/i"),
        "Pozostało zbyt szerokie wyszukiwanie dowolnego przycisku Dodaj."
      );
      sprawdzWarunek(
        skrypt.includes("fallbackDostępny: pobierzLiczbęPozycjiWTabeli() === 0"),
        "Fallback powinien być dostępny wyłącznie przy pustej tabeli."
      );
      sprawdzWarunek(
        skrypt.includes("komórki.length >= 7 && /^\\d+$/"),
        "Wiersze podsumowania godzin nadal mogą być liczone jako pozycje harmonogramu."
      );
    });
  });

  test("Import harmonogramu generuje CSV zgodny ze wzorcem BUR", function sprawdźImportCsv() {
    return Promise.all([
      pobierzPlik("../content/bur-content.js"),
      pobierzPlik("../panel/panel.html")
    ]).then(function sprawdźPliki(wyniki) {
      sprawdzWarunek(
        wyniki[0].includes('"harmonogram-bur.csv"'),
        "Content script nie tworzy pliku harmonogram-bur.csv."
      );
      sprawdzWarunek(
        wyniki[0].includes('metoda: "CSV"'),
        "Raport importu nie używa metody CSV."
      );
      sprawdzWarunek(
        !wyniki[0].includes("return importujXlsxZFallbackiem(pozycjeHarmonogramu);"),
        "Główna akcja nadal uruchamia import XLSX."
      );
      sprawdzWarunek(
        wyniki[1].includes("plik CSV zgodny ze wzorcem BUR"),
        "Panel nadal opisuje przygotowanie pliku XLSX."
      );
    });
  });


})();
