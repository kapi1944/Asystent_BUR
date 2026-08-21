(function zarejestrujDiagnostykęPanelu(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const panel = przestrzeń.panel || {};

  function utwórzDiagnostykę(dokument) {
    const stan = {
      fraza: "",
      źródłoFrazy: "",
      liczbaKandydatów: "",
      ostatniBłądServiceWorkera: "",
      importZapisałSzkolenie: "",
      liczbaTerminówPoImporcie: ""
    };
    const elementy = {
      fraza: dokument.getElementById("diagnostyka-fraza"),
      źródłoFrazy: dokument.getElementById("diagnostyka-zrodlo-frazy"),
      liczbaKandydatów: dokument.getElementById("diagnostyka-kandydaci"),
      ostatniBłądServiceWorkera: dokument.getElementById("diagnostyka-blad-sw"),
      importZapisałSzkolenie: dokument.getElementById("diagnostyka-zapis-importu"),
      liczbaTerminówPoImporcie: dokument.getElementById("diagnostyka-terminy-importu")
    };

    function renderuj() {
      elementy.fraza.textContent = stan.fraza || "-";
      elementy.źródłoFrazy.textContent = stan.źródłoFrazy || "-";
      elementy.liczbaKandydatów.textContent = stan.liczbaKandydatów === "" ? "-" : String(stan.liczbaKandydatów);
      elementy.ostatniBłądServiceWorkera.textContent = stan.ostatniBłądServiceWorkera || "-";
      elementy.importZapisałSzkolenie.textContent = stan.importZapisałSzkolenie || "-";
      elementy.liczbaTerminówPoImporcie.textContent = stan.liczbaTerminówPoImporcie === "" ? "-" : String(stan.liczbaTerminówPoImporcie);
    }

    function aktualizuj(zmiany) {
      Object.keys(zmiany).forEach(function aktualizujPole(pole) {
        if (Object.prototype.hasOwnProperty.call(stan, pole)) {
          stan[pole] = zmiany[pole];
        }
      });
      renderuj();
    }

    function wyczyść() {
      Object.keys(stan).forEach(function wyczyśćPole(pole) {
        stan[pole] = "";
      });
      renderuj();
    }

    function zamontuj() {
      const karta = dokument.getElementById("karta-diagnostyka");
      const diagnostyka = dokument.getElementById("diagnostyka-semper");
      if (karta && diagnostyka) {
        karta.appendChild(diagnostyka);
      }
      renderuj();
    }

    return Object.freeze({
      aktualizuj: aktualizuj,
      renderuj: renderuj,
      wyczyść: wyczyść,
      zamontuj: zamontuj
    });
  }

  panel.diagnostyka = Object.freeze({ utwórzDiagnostykę: utwórzDiagnostykę });
  przestrzeń.panel = panel;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
