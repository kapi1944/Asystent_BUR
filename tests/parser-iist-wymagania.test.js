(function testyWymagańParseraIist() {
  const bur = window.BurAsystent;
  let htmlPrzykładu = "";
  async function wynikFixture() {
    if (!htmlPrzykładu) { htmlPrzykładu = await fetch("fixtures/iist-szkolenie.html").then(function odczytaj(odpowiedź) { return odpowiedź.text(); }); }
    return bur.parsujHtmlIist(htmlPrzykładu, "https://szkoleniaiist.com.pl/audytor-wewnetrzny-iso-9001/");
  }
  test("wymagania IIST: rozpoznanie tytułu", async function sprawdź() { sprawdzWarunek((await wynikFixture()).szkolenie.tytułOryginalny.includes("Audytor wewnętrzny")); });
  test("wymagania IIST: rozpoznanie programu", async function sprawdź() { sprawdzWarunek((await wynikFixture()).szkolenie.sekcje.program.includes("Planowanie audytu")); });
  test("wymagania IIST: rozpoznanie grupy docelowej", async function sprawdź() { sprawdzWarunek((await wynikFixture()).szkolenie.sekcje.grupaDocelowa.includes("pełnomocnicy jakości")); });
  test("wymagania IIST: rozdzielenie obu części celu", async function sprawdź() { const sekcje = (await wynikFixture()).szkolenie.sekcje; sprawdzWarunek(sekcje.celEdukacyjnyOpis.startsWith("Celem szkolenia")); sprawdzWarunek(sekcje.efektyPoSzkoleniu.startsWith("Po zakończeniu")); sprawdzRownosc(sekcje.celSzkolenia, sekcje.celEdukacyjnyOpis); sprawdzRownosc(sekcje.tekstNadProgramem, sekcje.efektyPoSzkoleniu); });
  test("wymagania IIST: wariant frazy po zakończeniu", function sprawdź() { const ostrzeżenia = []; const wynik = bur.rozdzielCelEdukacyjnyIist("Celem kursu jest rozwój kompetencji. Uczestnicy po zakończeniu szkolenia będą potrafili sporządzić raport.", ostrzeżenia); sprawdzWarunek(wynik.efekty.startsWith("Uczestnicy po zakończeniu")); sprawdzRownosc(ostrzeżenia.length, 0); });
  test("wymagania IIST: brak drugiej części celu", function sprawdź() { const ostrzeżenia = []; const tekst = "Celem szkolenia jest przekazanie wiedzy."; const wynik = bur.rozdzielCelEdukacyjnyIist(tekst, ostrzeżenia); sprawdzRownosc(wynik.opis, tekst); sprawdzRownosc(wynik.efekty, ""); sprawdzWarunek(ostrzeżenia.length > 0); });
  test("wymagania IIST: termin online", async function sprawdź() { const termin = (await wynikFixture()).szkolenie.terminy.find(function znajdź(pozycja) { return pozycja.forma === "online"; }); sprawdzRownosc(termin.miejsce, "Szkolenie online"); sprawdzRownosc(termin.cena, "1 490 zł netto"); sprawdzRownosc(termin.czasTrwania, "16 godzin"); });
  test("wymagania IIST: termin stacjonarny", async function sprawdź() { const termin = (await wynikFixture()).szkolenie.terminy.find(function znajdź(pozycja) { return /Warszawa/.test(pozycja.miejsce); }); sprawdzRownosc(termin.forma, "stacjonarna"); });
  test("wymagania IIST: kilka terminów", async function sprawdź() { sprawdzRownosc((await wynikFixture()).szkolenie.terminy.length, 3); });
  test("wymagania IIST: rekrutacja dzień wcześniej", async function sprawdź() { const termin = (await wynikFixture()).szkolenie.terminy.find(function znajdź(pozycja) { return pozycja.dataStartBur === "15-09-2026"; }); sprawdzRownosc(termin.dataZakończeniaRekrutacjiBur, "14-09-2026"); });
  test("wymagania IIST: przejście rekrutacji na poprzedni miesiąc", function sprawdź() { sprawdzRownosc(bur.wyliczDateZakonczeniaRekrutacjiBur("01-10-2026"), "30-09-2026"); });
  test("wymagania IIST: przejście rekrutacji na poprzedni rok", function sprawdź() { sprawdzRownosc(bur.wyliczDateZakonczeniaRekrutacjiBur("01-01-2027"), "31-12-2026"); });
  test("wymagania IIST: odrzucenie obcego linku", function sprawdź() { sprawdzRownosc(bur.czyLinkSzkoleniaIist("https://example.com/szkolenie/"), false); sprawdzRownosc(bur.czyLinkSzkoleniaIist("https://szkoleniaiist.com.pl/szkolenie/"), true); });
  test("wymagania IIST: sanityzacja niebezpiecznego HTML", function sprawdź() { const dokument = document.implementation.createHTMLDocument("test"); dokument.body.innerHTML = '<div onclick="alert(1)"><p style="color:red">Treść</p><script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">link</a></div>'; const html = bur.sanityzujHtmlIist(dokument.body); sprawdzWarunek(html.includes("Treść")); sprawdzWarunek(!/script|img|onclick|onerror|style=|javascript:/i.test(html)); });
  test("wymagania IIST: osobny zapis SEMPER i IIST", function sprawdź() { const dane = {}; dane[bur.kluczDanychProfilu("semper")] = { profilId: "semper" }; dane[bur.kluczDanychProfilu("iist")] = { profilId: "iist" }; sprawdzRownosc(dane[bur.kluczDanychProfilu("semper")].profilId, "semper"); sprawdzRownosc(dane[bur.kluczDanychProfilu("iist")].profilId, "iist"); });
})();
