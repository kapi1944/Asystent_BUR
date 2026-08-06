(function zarejestrujProfileDostawcow(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function normalizujNazweKontaBur(tekst) {
    return String(tekst || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleUpperCase("pl-PL");
  }

  const TEKST_ORGANIZACYJNY_IIST = "Przebieg szkolenia może zostać dostosowany do bieżących potrzeb organizacyjnych, co może skutkować aktualizacją harmonogramu. O wszelkich zmianach uczestnicy zostaną poinformowani najpóźniej 7 dni przed terminem rozpoczęcia usługi. Wprowadzone modyfikacje nie wpływają na zakres szkolenia ani na całkowitą liczbę godzin jego realizacji.\n\nWskaźnik liczby zapisanych osób widoczny w Bazie Usług Rozwojowych nie przedstawia finalnego stanu rekrutacji. Nabór prowadzony jest jednocześnie poprzez inne kanały, w tym w formule komercyjnej, dlatego rzeczywista liczebność grupy może być wyższa niż wynika z danych prezentowanych w BUR. Z tego względu warto zgłosić swój udział z odpowiednim wyprzedzeniem, ponieważ kompletowanie grup odbywa się na podstawie wszystkich otrzymanych zgłoszeń.";
  const MATERIAŁY_ONLINE_IIST = "Cena zawiera:\nuczestnictwo w szkoleniu on-line,\nmateriały szkoleniowe w wersji elektronicznej,\nrenomowany certyfikat potwierdzający ukończenie szkolenia (w wersji elektronicznej lub papierowej),\nkonsultacje poszkoleniowe";
  const WARUNKI_UCZESTNICTWA_ONLINE_IIST = "INFORMACJE DOTYCZĄCE ZGŁOSZEŃ\nDla uczestników finansujących udział w szkoleniu w minimum 70% lub w całości ze środków publicznych następuje zwolnienie z obowiązku opłaty podatku VAT. Zwolnienie z podatku VAT na podstawie § 3 ust. 1 pkt 14 Rozporządzenia Ministra Finansów z dnia 20 grudnia 2013 r. w sprawie zwolnień od podatku od towarów i usług oraz warunków stosowania tych zwolnień (tekst jednolity DzU. 2025 poz. 832).\n• Walidacja usługi odbędzie się poprzez PRE i POST TESTY przekazane dla uczestników na początku szkolenia oraz ponownie weryfikowane przed jego zakończeniem.\n• Usługa będzie rejestrowana w celu kontroli i audytu. Wizerunek uczestników będzie rejestrowany. Uczestnik zobowiązany jest to posiadania i używania sprawnej kamerki internetowej.";
  const INFORMACJE_DODATKOWE_ONLINE_IIST = "Korzyści udziału w szkoleniu online:\n\nwygodna forma szkolenia - wystarczy dostęp do urządzenia z internetem (komputer, tablet, telefon), słuchawki lub głośniki i ulubiony fotel\nszkolenie realizowane jest w nowoczesnej formie w wirtualnym pokoju konferencyjnym i kameralnej grupie uczestników\nbierzesz udział w pełnowartościowym szkoleniu - Trener prowadzi zajęcia \"na żywo\" - widzisz go i słyszysz\npokaz prezentacji, ankiet i ćwiczeń widzisz na ekranie swojego komputera w czasie rzeczywistym.\npodczas szkolenia Trener aktywizuje uczestników zadając pytania, na które można odpowiedzieć w czasie rzeczywistym\notrzymujesz certyfikat wydany przez jedną z wiodących firm szkoleniowych w Polsce\nmasz dostęp do konsultacji poszkoleniowych w formie e-mail do 4 tygodni po zrealizowanym szkoleniu";
  const WARUNKI_TECHNICZNE_ONLINE_IIST = "Szkolenie realizowane jest z wykorzystaniem platformy Zoom (https://zoom-video.pl/).\nDo udziału w zajęciach niezbędny jest komputer, laptop lub inne urządzenie umożliwiające połączenie z internetem. Zalecane jest korzystanie z aktualnej wersji jednej z następujących przeglądarek internetowych: Google Chrome, Mozilla Firefox, Microsoft Edge, Safari lub Opera.\nUrządzenie uczestnika powinno posiadać co najmniej dwurdzeniowy procesor o taktowaniu 2 GHz (rekomendowany czterordzeniowy), minimum 2 GB pamięci RAM (zalecane 4 GB lub więcej) oraz system operacyjny Windows 8 lub nowszy (preferowany Windows 10 i nowsze wersje), macOS 10.13 lub nowszy, Linux albo Chrome OS.\nDo sprawnego uczestnictwa wymagane jest połączenie internetowe o przepustowości co najmniej 512 kb/s. Dla zapewnienia większego komfortu pracy rekomendowane jest łącze o prędkości minimum 2 Mb/s, natomiast przy jednoczesnej transmisji obrazu i dźwięku zaleca się przepustowość co najmniej 2,5 Mb/s.\nUdział w szkoleniu nie wymaga instalowania dodatkowego oprogramowania poza możliwością korzystania z platformy Zoom w przeglądarce lub aplikacji. Link umożliwiający dołączenie do spotkania pozostaje aktywny przez cały czas trwania usługi – od jej rozpoczęcia do zakończenia.";
  const KODY_DOSTĘPOWE_ONLINE_IIST = "Dostęp do wirtualnego pokoju konferencyjnego zostanie przesłany na adres e-mail Uczestnika szkolenia na 7 dni przed terminem jego rozpoczęcia.";

  const PROFILE_DOSTAWCOW = {
    semper: {
      id: "semper",
      nazwa: "SEMPER",
      pełnaNazwa: "CENTRUM ORGANIZACJI SZKOLEŃ I KONFERENCJI SEMPER MAGDALENA WOLNIEWICZ-KESARIA",
      kolorAkcentu: "#e53935",
      domenyŹródłowe: ["szkolenia-semper.pl"],
      wzorceNazwyKontaBur: ["CENTRUM ORGANIZACJI SZKOLEŃ I KONFERENCJI SEMPER MAGDALENA WOLNIEWICZ-KESARIA", "SEMPER"],
      podstawaWpisuBur: "",
      wariantZajęćBur: "Zajęcia grupowe",
      usługaZamkniętaBur: "NIE",
      liczbaUczestnikówBur: { onlineMinimum: "2", stacjonarneMinimum: "5", maksimum: "15" },
      osobaProwadzącaUsługę: { imięINazwisko: "Trener SEMPER", email: "trener@szkolenia-semper.pl", rola: "Osoba prowadząca usługę", opisDoświadczenia: "Trener SEMPER" },
      osobaProwadzącaWalidację: { imięINazwisko: "Koordynator SEMPER", email: "koordynator@szkolenia-semper.pl", rola: "Osoba prowadząca walidację", opisDoświadczenia: "Koordynator SEMPER" },
      daneKontaktowe: { imięINazwisko: "Angelika Poznańska", email: "a.poznanska@szkolenia-semper.pl", telefon: "(+48) 570 590 060" },
      tekstNadProgramem: "",
      tekstPodProgramem: "",
      sposóbProgramuBur: "semper",
      materiałyOnline: "",
      warunkiUczestnictwaOnline: "",
      informacjeDodatkoweOnline: "",
      warunkiTechniczneOnline: "",
      kodyDostępoweOnline: ""
    },
    iist: {
      id: "iist",
      nazwa: "IIST",
      pełnaNazwa: "MIĘDZYNARODOWY INSTYTUT SZKOLEŃ SPECJALISTYCZNYCH IIST PARAG KESARIA",
      kolorAkcentu: "#2e89be",
      domenyŹródłowe: ["szkoleniaiist.com.pl"],
      wzorceNazwyKontaBur: ["MIĘDZYNARODOWY INSTYTUT SZKOLEŃ SPECJALISTYCZNYCH IIST PARAG KESARIA"],
      podstawaWpisuBur: "Certyfikat systemu zarządzania jakością wg. ISO 9001:2015 (PN-EN ISO 9001:2015) - w zakresie usług szkoleniowych",
      wariantZajęćBur: "Zajęcia grupowe",
      usługaZamkniętaBur: "NIE",
      liczbaUczestnikówBur: null,
      osobaProwadzącaUsługę: { imięINazwisko: "Ekspert IIST", email: "ekspert@iist.pl", rola: "Osoba prowadząca usługę", opisDoświadczenia: "Ekspert IIST" },
      osobaProwadzącaWalidację: { imięINazwisko: "Koordynator IIST", email: "koordynator@iist.pl", rola: "Osoba prowadząca walidację", opisDoświadczenia: "Koordynator IIST" },
      daneKontaktowe: { imięINazwisko: "Ewa Nizioł", email: "bur@iist.pl", telefon: "(+48) 530 409 030" },
      tekstNadProgramem: "",
      tekstPodProgramem: TEKST_ORGANIZACYJNY_IIST,
      sposóbProgramuBur: "cel_program_organizacja",
      materiałyOnline: MATERIAŁY_ONLINE_IIST,
      warunkiUczestnictwaOnline: WARUNKI_UCZESTNICTWA_ONLINE_IIST,
      informacjeDodatkoweOnline: INFORMACJE_DODATKOWE_ONLINE_IIST,
      warunkiTechniczneOnline: WARUNKI_TECHNICZNE_ONLINE_IIST,
      kodyDostępoweOnline: KODY_DOSTĘPOWE_ONLINE_IIST,
      harmonogramBur: {
        prowadzącyWedługRoli: {
          ekspert: "ekspert@iist.pl",
          walidator: "koordynator@iist.pl",
          brak: ""
        },
        tematyWedługKlucza: {
          standard: "szkolenie (rozmowa na żywo, współdzielenie ekranu, ćwiczenia)",
          podsumowanie: "Podsumowanie i zakończenie szkolenia",
          brak: ""
        }
      },
      przełącznikiGłównegoCelu: { celEdukacyjny: "TAK", kwalifikacjeZsk: "NIE", kwalifikacjeInne: "NIE", kompetencje: "TAK" }
    }
  };

  function pobierzProfilDostawcy(id) {
    return PROFILE_DOSTAWCOW[id] || null;
  }

  function wykryjProfilPoNazwieKontaBur(tekst) {
    const nazwa = normalizujNazweKontaBur(tekst);
    if (!nazwa) {
      return null;
    }
    if (nazwa.includes(normalizujNazweKontaBur(PROFILE_DOSTAWCOW.iist.pełnaNazwa))) {
      return PROFILE_DOSTAWCOW.iist;
    }
    if (nazwa.includes("SEMPER")) {
      return PROFILE_DOSTAWCOW.semper;
    }
    return null;
  }

  function czyProfilZgodnyZKontemBur(profilId, wykryteKonto) {
    const idWykrytegoKonta = typeof wykryteKonto === "string"
      ? wykryteKonto
      : wykryteKonto && (wykryteKonto.profilId || wykryteKonto.id);
    return Boolean(idWykrytegoKonta && profilId === idWykrytegoKonta);
  }

  function kluczDanychProfilu(profilId) {
    return "daneŹródłoweWedługProfilu_" + profilId;
  }

  function normalizujFragmentProgramu(tekst) {
    return String(tekst || "").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  function zbudujProgramDostawcy(profilId, szkolenie) {
    const profil = pobierzProfilDostawcy(profilId);
    const sekcje = szkolenie && szkolenie.sekcje || {};
    if (!profil) { return normalizujFragmentProgramu(sekcje.program || ""); }
    const tekstNad = sekcje.tekstNadProgramem || sekcje.efektyPoSzkoleniu || sekcje.celEdukacyjnyEfekty || "";
    let program = String(sekcje.program || "");
    if (profil.sposóbProgramuBur === "cel_program_organizacja") {
      [tekstNad, profil.tekstPodProgramem].filter(Boolean).forEach(function usuńPowtórzenie(fragment) {
        const wzorzec = String(fragment).trim().split(/\s+/).map(function escapuj(część) { return część.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("\\s+");
        program = program.replace(new RegExp(wzorzec, "gi"), "");
      });
    }
    const fragmenty = profil.sposóbProgramuBur === "cel_program_organizacja"
      ? [tekstNad, program, profil.tekstPodProgramem]
      : [program];
    const wynik = [];
    fragmenty.map(normalizujFragmentProgramu).filter(Boolean).forEach(function dodaj(fragment) {
      const klucz = normalizujFragmentProgramu(fragment).toLowerCase();
      if (!wynik.some(function istnieje(wartość) { return normalizujFragmentProgramu(wartość).toLowerCase() === klucz; })) { wynik.push(fragment); }
    });
    return wynik.join("\n\n");
  }

  function unieważnijStanOperacjiProfilu(stan) {
    return Object.assign({}, stan || {}, { podglądWypełnieniaBur: null, aktywnaOperacjaBur: null, harmonogramBurPrzygotowany: false, harmonogramBurNieaktualny: true });
  }

  przestrzeń.PROFILE_DOSTAWCOW = PROFILE_DOSTAWCOW;
  przestrzeń.pobierzProfilDostawcy = pobierzProfilDostawcy;
  przestrzeń.wykryjProfilPoNazwieKontaBur = wykryjProfilPoNazwieKontaBur;
  przestrzeń.normalizujNazweKontaBur = normalizujNazweKontaBur;
  przestrzeń.czyProfilZgodnyZKontemBur = czyProfilZgodnyZKontemBur;
  przestrzeń.kluczDanychProfilu = kluczDanychProfilu;
  przestrzeń.normalizujFragmentProgramu = normalizujFragmentProgramu;
  przestrzeń.zbudujProgramDostawcy = zbudujProgramDostawcy;
  przestrzeń.unieważnijStanOperacjiProfilu = unieważnijStanOperacjiProfilu;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
