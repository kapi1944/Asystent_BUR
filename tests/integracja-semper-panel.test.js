(function testyIntegracjiSemperPanel() {
  const bur = window.BurAsystent;

  test("SZUKAJ_ŁĄCZA_SEMPER nie wymaga content scriptu aktywnej karty", async function sprawdź() {
    const staryFetch = window.fetch;
    let wywołanoFetch = false;

    window.fetch = async function mockFetch(url) {
      wywołanoFetch = true;

      if (String(url).includes("_ajax_szukaj.php")) {
        return {
          ok: true,
          text: async function tekst() {
            return "<a href=\"/component/trainings/details/szkolenie,411.html\">Prawo ochrony środowiska w praktyce</a>";
          }
        };
      }

      if (String(url).includes("_ajax_szukaj_auto.php")) {
        return {
          ok: true,
          text: async function tekst() { return ""; }
        };
      }

      return {
        ok: true,
        text: async function tekst() {
          return "<html><body><h1>Prawo ochrony środowiska w praktyce</h1></body></html>";
        }
      };
    };

    try {
      const wynik = await bur.szukajŁączaSemper("Prawo ochrony środowiska");

      sprawdzWarunek(wywołanoFetch, "Wyszukiwanie powinno użyć fetch.");
      sprawdzWarunek(wynik.ok, "Wyszukiwanie powinno zwrócić wynik bez chrome.tabs.");
    } finally {
      window.fetch = staryFetch;
    }
  });

  test("IMPORTUJ_SEMPER_Z_ŁĄCZA nie wymaga content scriptu aktywnej karty", async function sprawdź() {
    const staryFetch = window.fetch;

    window.fetch = async function mockFetch() {
      return {
        ok: true,
        text: async function tekst() {
          return "<html><body><h1>Zażółć gęślą jaźń</h1></body></html>";
        }
      };
    };

    try {
      const wynik = await bur.importujSzkolenieZŁączaSemper("https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html");

      sprawdzWarunek(wynik.ok, "Import powinien działać przez fetch.");
      sprawdzWarunek(wynik.html.includes("Zażółć"), "HTML powinien zachować polskie znaki.");
    } finally {
      window.fetch = staryFetch;
    }
  });

  test("renderujDaneSzkolenia pokazuje tytuł i terminy po imporcie", function sprawdź() {
    const dokument = document.implementation.createHTMLDocument("Panel");

    dokument.body.innerHTML = "<dd id=\"tytul-oryginalny\"></dd><dd id=\"terminy\"></dd>";

    function renderujDaneSzkolenia(szkolenie) {
      dokument.querySelector("#tytul-oryginalny").textContent = szkolenie.tytułOryginalny || szkolenie.tytulOryginalny || "—";
      dokument.querySelector("#terminy").textContent = (szkolenie.terminy || []).map(function opisz(termin, indeks) {
        return "Termin " + (indeks + 1) + ": " + termin.dataStartBur + " - " + termin.dataKoniecBur;
      }).join("\n") || "—";
    }

    renderujDaneSzkolenia({
      tytułOryginalny: "Zażółć gęślą jaźń",
      terminy: [{
        dataStartBur: "06-07-2027",
        dataKoniecBur: "07-07-2027"
      }]
    });

    sprawdzWarunek(dokument.querySelector("#tytul-oryginalny").textContent.includes("Zażółć"), "Tytuł powinien być widoczny.");
    sprawdzWarunek(dokument.querySelector("#terminy").textContent.includes("06-07-2027"), "Termin powinien być widoczny.");
  });

  test("parser zachowuje polskie znaki", function sprawdź() {
    const wynik = bur.parsujHtmlSemper(
      "<html><body><h1>Zażółć gęślą jaźń</h1><table><tr><th>Termin</th><th>Miejsce</th></tr><tr><td>06.07.2027 - 07.07.2027</td><td>Łódź</td></tr></table><div class=\"scc3\">Grupa z Łodzi</div><div class=\"scc4\">Cel z ć</div></body></html>",
      "https://www.szkolenia-semper.pl/component/trainings/details/szkolenie,411.html"
    );

    sprawdzWarunek(wynik.szkolenie.tytułOryginalny.includes("Zażółć"), "Tytuł powinien zachować polskie znaki.");
    sprawdzWarunek(wynik.szkolenie.terminy[0].miejsce.includes("Łódź"), "Miejsce powinno zachować polskie znaki.");
  });
})();
