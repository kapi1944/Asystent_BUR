(function zarejestrujTestyHarmonogramu() {
  function zbudujTabelę(wiersze) {
    const tabela = document.createElement("table");
    tabela.id = "testowa-tabela-harmonogramu";
    tabela.innerHTML = "<thead><tr><th>Lp.</th><th>Typ aktywności</th><th>Data</th><th>Od</th><th>Do</th><th>Przedmiot/temat</th><th>Prowadzący</th></tr></thead><tbody></tbody>";
    const ciało = tabela.querySelector("tbody");
    wiersze.forEach(function dodajWiersz(wartości) {
      const wiersz = document.createElement("tr");
      wartości.forEach(function dodajKomórkę(wartość) {
        const komórka = document.createElement("td");
        komórka.textContent = wartość;
        wiersz.appendChild(komórka);
      });
      ciało.appendChild(wiersz);
    });
    const siatka = document.createElement("div");
    siatka.id = "harmonogram-grid";
    const kontener = document.createElement("div");
    kontener.appendChild(tabela);
    siatka.appendChild(kontener);
    document.body.appendChild(siatka);
    return tabela;
  }

  function posprzątaj() {
    const siatka = document.getElementById("harmonogram-grid");
    if (siatka) { siatka.remove(); }
  }

  const przestrzen = window.BurAsystent;
  const pozycja = {
    przedmiot: "Bezpieczny temat",
    prowadzacy: "trener@example.pl",
    dzien_swiadczenia: "2026-08-01",
    czas_rozpoczecia: "09:00",
    czas_zakonczenia: "10:00",
    typ_aktywnosci: "Zajęcia"
  };

  test("wiersze podsumowań 00:00 nie są pozycjami harmonogramu", function sprawdźPustąTabelę() {
    zbudujTabelę([
      ["", "Suma godzin zegarowych usługi", "00:00", "", "", "", ""],
      ["", "W tym suma godzin zajęć", "00:00", "", "", "", ""]
    ]);
    sprawdzRownosc(przestrzen.pobierzWierszeHarmonogramu().length, 0);
    posprzątaj();
  });

  test("parser strukturalny odczytuje pola numerowanej pozycji", function sprawdźParser() {
    zbudujTabelę([["1", "Zajęcia", "2026-08-01", "09:00", "10:00", "Temat", "Prowadzący"]]);
    const wynik = przestrzen.pobierzWierszeHarmonogramu()[0];
    sprawdzRownosc(wynik.typAktywności, "Zajęcia");
    sprawdzRownosc(wynik.data, "2026-08-01");
    sprawdzRownosc(wynik.od, "09:00");
    sprawdzRownosc(wynik.do, "10:00");
    sprawdzRownosc(wynik.przedmiot, "Temat");
    sprawdzRownosc(wynik.prowadzący, "Prowadzący");
    posprzątaj();
  });

  test("zgodny import nie ma różnic, a różnica jest ostrzeżeniem", function sprawdźRaport() {
    zbudujTabelę([["1", "Zajęcia", "2026-08-01", "09:00", "10:00", "Bezpieczny temat", "trener@example.pl"]]);
    const zgodny = przestrzen.sprawdzHarmonogramPoWypelnieniu([pozycja]);
    sprawdzRownosc(zgodny.ok, true);
    sprawdzRownosc(zgodny.ostrzeżenia.length, 0, "Raport zgodny: " + JSON.stringify(zgodny));
    const inny = przestrzen.sprawdzHarmonogramPoWypelnieniu([Object.assign({}, pozycja, { prowadzacy: "inny@example.pl" })]);
    sprawdzRownosc(inny.ok, true);
    sprawdzRownosc(inny.ostrzeżenia.length, 1);
    sprawdzRownosc(inny.ostrzeżenia[0].pole, "Prowadzący");
    posprzątaj();
  });
})();
