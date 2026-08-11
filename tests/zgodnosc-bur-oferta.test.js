(function zarejestrujTestyZgodnościBurZOfertą() {
  const bur = window.BurAsystent;
  const tytułŹródłowy = "Sztuczna inteligencja w logistyce. Praktyczne wykorzystanie AI do planowania";

  function termin(start, koniec, forma, miejsce) {
    return { dataStartBur: start, dataKoniecBur: koniec, forma: forma || "online", miejsce: miejsce || "Szkolenie online" };
  }

  function stan(ustawienia) {
    return bur.utwórzStanZgodnościBurZOfertą(Object.assign({
      profil: "semper",
      szkolenie: { profilId: "semper", tytułOryginalny: tytułŹródłowy },
      terminy: [termin("21-06-2027", "22-06-2027")],
      terminBur: { tytuł: "Sztuczna inteligencja w logistyce – praktyczne wykorzystanie AI", dataRozpoczęcia: "2027-06-21", dataZakończenia: "2027-06-22", tryb: "online" },
      wybranyIndeks: 0,
      źródłoWyboru: "ręczny"
    }, ustawienia || {}));
  }

  test("zgodne daty i tytuł dają pełną zgodność BUR z SEMPER", function sprawdź() {
    const wynik = stan();
    sprawdzWarunek(wynik.zgodneDaty && wynik.zgodnyTytuł && wynik.pełnaZgodność);
  });

  test("inny wybrany termin nie daje pełnej zgodności", function sprawdź() {
    const wynik = stan({ terminy: [termin("15-07-2027", "16-07-2027")] });
    sprawdzWarunek(!wynik.zgodneDaty && !wynik.pełnaZgodność);
  });

  test("ponowny odczyt dat potwierdza zgodność wybranego terminu", function sprawdź() {
    const wynik = stan({ terminBur: { tytuł: tytułŹródłowy, dataRozpoczęcia: "21.06.2027", dataZakończenia: "22.06.2027" } });
    sprawdzWarunek(wynik.pełnaZgodność);
  });

  test("ręcznie wpisany termin istniejący w ofercie zostaje odnaleziony", function sprawdź() {
    const wynik = stan({ wybranyIndeks: null, źródłoWyboru: "brak" });
    sprawdzRownosc(wynik.dopasowanyIndeks, 0);
  });

  test("ręcznie wpisany termin spoza oferty otrzymuje status brak", function sprawdź() {
    const wynik = stan({ wybranyIndeks: null, terminBur: { tytuł: tytułŹródłowy, dataRozpoczęcia: "01-08-2027", dataZakończenia: "02-08-2027" } });
    sprawdzRownosc(wynik.dopasowanie.status, "brak");
    sprawdzRownosc(wynik.dopasowanyIndeks, null);
  });

  test("zgodne daty i różne szkolenie nie dają pełnej zgodności", function sprawdź() {
    const wynik = stan({ terminBur: { tytuł: "Zarządzanie projektami budowlanymi", dataRozpoczęcia: "21-06-2027", dataZakończenia: "22-06-2027" } });
    sprawdzWarunek(wynik.zgodneDaty && !wynik.zgodnyTytuł && !wynik.pełnaZgodność);
  });

  test("różnice interpunkcyjne tytułu nie zrywają zgodności", function sprawdź() {
    sprawdzWarunek(bur.czyTytułySzkoleńZgodne(
      "Sztuczna inteligencja w logistyce – praktyczne wykorzystanie AI",
      "Sztuczna inteligencja w logistyce.Praktyczne wykorzystanie AI do planowania"
    ));
  });

  test("krótki wspólny początek tytułu nie tworzy fałszywej zgodności", function sprawdź() {
    sprawdzWarunek(!bur.czyTytułySzkoleńZgodne("Excel dla początkujących", "Excel dla zaawansowanych"));
  });

  test("dwa warianty tych samych dat pozostają niejednoznaczne bez formy i lokalizacji", function sprawdź() {
    const wynik = stan({
      wybranyIndeks: null,
      terminy: [termin("21-06-2027", "22-06-2027", "online", "Online"), termin("21-06-2027", "22-06-2027", "stacjonarna", "Warszawa")],
      terminBur: { tytuł: tytułŹródłowy, dataRozpoczęcia: "21-06-2027", dataZakończenia: "22-06-2027" }
    });
    sprawdzRownosc(wynik.dopasowanie.status, "niejednoznaczny");
    sprawdzRownosc(wynik.dopasowanyIndeks, null);
  });

  test("zmiana profilu na IIST przelicza stan dla nowego tytułu", function sprawdź() {
    const wynik = stan({ profil: "iist", szkolenie: { profilId: "iist", tytułOryginalny: "Audytor wewnętrzny ISO 9001" }, wybranyIndeks: null });
    sprawdzRownosc(wynik.profil, "iist");
    sprawdzWarunek(!wynik.zgodnyTytuł && !wynik.pełnaZgodność);
  });

  test("wybór terminu zapisuje start koniec i datę rekrutacji przez istniejący adapter", async function sprawdź() {
    const kontener = document.createElement("div");
    kontener.innerHTML = "<input id='informacjepodstawowesekcja-datarozpoczeciauslugi' type='date'><input id='informacjepodstawowesekcja-datazakonczeniauslugi' type='date'><input id='informacjepodstawowesekcja-datazakonczeniarekrutacji' type='date'>";
    document.body.appendChild(kontener);
    const wynik = await bur.ustawTerminBurZWeryfikacją(document, termin("15-07-2027", "16-07-2027"));
    sprawdzWarunek(wynik.ok);
    sprawdzRownosc(kontener.children[0].value, "2027-07-15");
    sprawdzRownosc(kontener.children[1].value, "2027-07-16");
    sprawdzRownosc(kontener.children[2].value, "2027-07-14");
    kontener.remove();
  });

  test("programatyczny zapis terminu wysyła jedno odświeżenie bez pętli", async function sprawdź() {
    const kontener = document.createElement("div");
    kontener.innerHTML = "<input id='informacjepodstawowesekcja-datarozpoczeciauslugi' type='date'><input id='informacjepodstawowesekcja-datazakonczeniauslugi' type='date'><input id='informacjepodstawowesekcja-datazakonczeniarekrutacji' type='date'>";
    document.body.appendChild(kontener);
    window.chrome.runtime = window.chrome.runtime || {};
    const poprzednieWysyłanie = window.chrome.runtime.sendMessage;
    let liczbaPowiadomień = 0;
    window.chrome.runtime.sendMessage = function policz(wiadomość, odpowiedź) {
      if (wiadomość.typ === bur.KOMUNIKATY.ZMIENIONO_AKTUALNY_TERMIN_BUR) { liczbaPowiadomień += 1; }
      if (odpowiedź) { odpowiedź({}); }
    };
    await bur.ustawTerminBurZWeryfikacją(document, termin("15-07-2027", "16-07-2027"));
    await new Promise(function odczekaj(resolve) { setTimeout(resolve, 100); });
    window.chrome.runtime.sendMessage = poprzednieWysyłanie;
    kontener.remove();
    sprawdzRownosc(liczbaPowiadomień, 1);
  });
})();
