(function testyEtapuTrzeciegoPólBur() {
  const bur = window.BurAsystent;

  function utwórzDokument(html) {
    const dokument = document.implementation.createHTMLDocument("Etap 3 pól BUR");
    dokument.body.innerHTML = html;
    return dokument;
  }

  function definicjaSelecta(selektor) {
    return { selektoryNatywne: [selektor], etykieta: "Forma świadczenia usługi" };
  }

  function wczytajFixture(nazwa) {
    return fetch("fixtures/" + nazwa).then(function sprawdź(odpowiedź) {
      if (!odpowiedź.ok) {
        throw new Error("Nie udało się wczytać fixture: " + nazwa);
      }
      return odpowiedź.text();
    }).then(function parsuj(html) {
      return new DOMParser().parseFromString(html, "text/html");
    });
  }

  test("Etap 3: adapter odczytuje prawidłowy natywny select", function sprawdź() {
    const dokument = utwórzDokument("<select id='forma'><option value='s'>stacjonarna</option><option value='z' selected>zdalna w czasie rzeczywistym</option></select>");
    const wynik = bur.adapterSelect2.read(dokument, definicjaSelecta("#forma"));
    sprawdzWarunek(wynik.ok);
    sprawdzRownosc(wynik.wartość, "z");
    sprawdzRownosc(wynik.tekst, "zdalna w czasie rzeczywistym");
  });

  test("Etap 3: adapter obsługuje prawidłowe Select2 przez natywny select", function sprawdź() {
    const dokument = utwórzDokument("<div class='form-group'><select id='forma' class='select2-hidden-accessible'><option value='s' selected>stacjonarna</option><option value='z'>zdalna w czasie rzeczywistym</option></select><span id='select2-forma-container'>stacjonarna</span></div>");
    const select = dokument.querySelector("select");
    const prezentacja = dokument.querySelector("span");
    select.addEventListener("change", function zsynchronizuj() { prezentacja.textContent = select.selectedOptions[0].textContent; });
    const wynik = bur.adapterSelect2.setExactAndVerify(dokument, prezentacja, "zdalna w czasie rzeczywistym");
    sprawdzWarunek(wynik.ok);
    sprawdzRownosc(select.value, "z");
    sprawdzRownosc(prezentacja.textContent, "zdalna w czasie rzeczywistym");
  });

  test("Etap 3: dokładne dopasowanie nie wybiera dłuższej podobnej opcji", function sprawdź() {
    const dokument = utwórzDokument("<select id='forma'><option value='hybryda'>Online hybrydowo</option><option value='online'>Online</option></select>");
    const wynik = bur.adapterSelect2.setExactAndVerify(dokument, definicjaSelecta("#forma"), "Online");
    sprawdzWarunek(wynik.ok);
    sprawdzRownosc(dokument.querySelector("select").value, "online");
  });

  test("Etap 3: brak oczekiwanej opcji kończy operację błędem", function sprawdź() {
    const dokument = utwórzDokument("<select id='forma'><option>stacjonarna</option></select>");
    const wynik = bur.adapterSelect2.setExactAndVerify(dokument, definicjaSelecta("#forma"), "online");
    sprawdzWarunek(!wynik.ok);
    sprawdzRownosc(wynik.kodBłędu, "BRAK_OCZEKIWANEJ_OPCJI");
  });

  test("Etap 3: dwie dokładnie pasujące opcje są niejednoznaczne", function sprawdź() {
    const dokument = utwórzDokument("<select id='forma'><option value='a'>online</option><option value='b'>online</option></select>");
    const wynik = bur.adapterSelect2.setExactAndVerify(dokument, definicjaSelecta("#forma"), "online");
    sprawdzWarunek(!wynik.ok);
    sprawdzRownosc(wynik.kodBłędu, "NIEJEDNOZNACZNA_OPCJA");
  });

  test("Etap 3: dwa możliwe pola nie są rozstrzygane arbitralnie", function sprawdź() {
    const dokument = utwórzDokument("<select name='forma'><option>online</option></select><select name='forma'><option>online</option></select>");
    const wynik = bur.adapterSelect2.setExactAndVerify(dokument, definicjaSelecta("select[name='forma']"), "online");
    sprawdzWarunek(!wynik.ok);
    sprawdzRownosc(wynik.kodBłędu, "WIELE_NATYWNYCH_SELECTOW");
  });

  test("Etap 3: stabilny selektor działa mimo nieaktualnej znanej etykiety", function sprawdź() {
    const dokument = utwórzDokument("<label for='forma'>Forma realizacji zajęć</label><select id='forma'><option>stacjonarna</option><option>online</option></select>");
    const wynik = bur.adapterSelect2.setExactAndVerify(dokument, { selektoryNatywne: ["#forma"], etykieta: "Forma świadczenia usługi" }, "online");
    sprawdzWarunek(wynik.ok);
    sprawdzRownosc(dokument.querySelector("select").value, "online");
  });

  test("Etap 3: zmiana wyłącznie wizualna nie przechodzi weryfikacji", function sprawdź() {
    const dokument = utwórzDokument("<div class='form-group'><select id='forma'><option value='s' selected>stacjonarna</option><option value='z'>online</option></select><span id='select2-forma-container'>online</span></div>");
    const wynik = bur.adapterSelect2.verifyExact(dokument, dokument.querySelector("span"), "online");
    sprawdzWarunek(!wynik.ok);
    sprawdzRownosc(wynik.kodBłędu, "NIEPOTWIERDZONA_WARTOŚĆ_NATYWNA");
  });

  test("Etap 3: read-back wykrywa odrzucenie wartości po zdarzeniu change", function sprawdź() {
    const dokument = utwórzDokument("<select id='forma'><option value='s' selected>stacjonarna</option><option value='z'>online</option></select>");
    const select = dokument.querySelector("select");
    select.addEventListener("change", function odrzućZmianę() { select.value = "s"; });
    const wynik = bur.adapterSelect2.setExactAndVerify(dokument, definicjaSelecta("#forma"), "online");
    sprawdzWarunek(!wynik.ok);
    sprawdzRownosc(wynik.kodBłędu, "NIEPOTWIERDZONA_WARTOŚĆ_NATYWNA");
    sprawdzRownosc(select.value, "s");
  });

  test("Etap 3: istniejący formularz SEMPER rozwiązuje wspólne pole osób", function sprawdź() {
    return wczytajFixture("bur-osoby-semper.html").then(function zweryfikuj(dokument) {
      const wynik = bur.resolverPólBur.rozwiąż(dokument, bur.pobierzCelFormularzaBur("osobyProwadzace"));
      sprawdzWarunek(wynik.element && wynik.element.id === "osobyprowadzace-grid");
    });
  });

  test("Etap 3: istniejący formularz IIST przechodzi dokładny zapis Select2", function sprawdź() {
    return wczytajFixture("bur-formularz-wstepny-iist.html").then(function zweryfikuj(dokument) {
      const definicja = bur.pobierzDefinicjęPolaBur("formaSwiadczenia");
      const wynik = bur.adapterSelect2.setExactAndVerify(dokument, definicja, "zdalna w czasie rzeczywistym");
      sprawdzWarunek(wynik.ok);
      sprawdzRownosc(dokument.querySelector("#formularzwstepnysekcja-formaswiadczenia").value, "zdalna w czasie rzeczywistym");
    });
  });
})();
