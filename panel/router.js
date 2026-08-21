(function zarejestrujRouterPanelu(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const panel = przestrzeń.panel || {};

  function utwórzRouterPanelu(opcje) {
    const dokument = opcje.dokument;
    const stanPanelu = opcje.stanPanelu;
    const dozwoloneZakładki = opcje.dozwoloneZakładki.slice();
    let czyPodłączony = false;

    function ustawAktywnąZakładkę(zakładka, ustawienia) {
      const konfiguracja = ustawienia || {};
      const aktywnaZakładka = dozwoloneZakładki.includes(zakładka) ? zakładka : "semper";

      stanPanelu.ustawAktywnąZakładkę(aktywnaZakładka);
      if (konfiguracja.wybórRęczny === true) {
        stanPanelu.ustawCzyZakładkaWybranaRęcznie(true);
      }

      dokument.body.dataset.aktywnaZakladka = aktywnaZakładka;
      dokument.querySelectorAll("[data-przelacz-zakladke]").forEach(function ustawPrzycisk(przycisk) {
        przycisk.setAttribute("aria-pressed", String(przycisk.dataset.przelaczZakladke === aktywnaZakładka));
      });

      if (konfiguracja.zapiszStan !== false && opcje.zapiszStan) {
        opcje.zapiszStan(stanPanelu.pobierzMigawkę());
      }
      if (opcje.poZmianie) {
        opcje.poZmianie(aktywnaZakładka);
      }

      return aktywnaZakładka;
    }

    function podłącz() {
      if (czyPodłączony) {
        return;
      }
      czyPodłączony = true;
      dokument.querySelectorAll("[data-przelacz-zakladke]").forEach(function dodajObsługęZakładki(przycisk) {
        przycisk.addEventListener("click", function wybierzZakładkę() {
          ustawAktywnąZakładkę(przycisk.dataset.przelaczZakladke, {
            zapiszStan: true,
            wybórRęczny: true
          });
        });
      });
    }

    return Object.freeze({
      podłącz: podłącz,
      ustawAktywnąZakładkę: ustawAktywnąZakładkę
    });
  }

  panel.router = Object.freeze({ utwórzRouterPanelu: utwórzRouterPanelu });
  przestrzeń.panel = panel;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
