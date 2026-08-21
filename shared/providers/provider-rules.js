(function zarejestrujRegułyDostawców(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  const PODSTAWA_WPISU_BUR_SEMPER = "Znak Jakości TGLS Quality Alliance";
  const POPRZEDNIA_PODSTAWA_WPISU_BUR_SEMPER = "(nieaktualna) Znak Jakości TGLS Quality Alliance";
  const PODSTAWA_WPISU_BUR_IIST = "Certyfikat systemu zarządzania jakością wg. ISO 9001:2015 (PN-EN ISO 9001:2015) - w zakresie usług szkoleniowych";
  const TEKST_ORGANIZACYJNY_IIST = "Przebieg szkolenia może zostać dostosowany do bieżących potrzeb organizacyjnych, co może skutkować aktualizacją harmonogramu. O wszelkich zmianach uczestnicy zostaną poinformowani najpóźniej 7 dni przed terminem rozpoczęcia usługi. Wprowadzone modyfikacje nie wpływają na zakres szkolenia ani na całkowitą liczbę godzin jego realizacji.\n\nWskaźnik liczby zapisanych osób widoczny w Bazie Usług Rozwojowych nie przedstawia finalnego stanu rekrutacji. Nabór prowadzony jest jednocześnie poprzez inne kanały, w tym w formule komercyjnej, dlatego rzeczywista liczebność grupy może być wyższa niż wynika z danych prezentowanych w BUR. Z tego względu warto zgłosić swój udział z odpowiednim wyprzedzeniem, ponieważ kompletowanie grup odbywa się na podstawie wszystkich otrzymanych zgłoszeń.";
  const MATERIAŁY_STACJONARNE_IIST = "Cena zawiera:\n• uczestnictwo w szkoleniu,\n• materiały dydaktyczne [autorski podręcznik Uczestnika szkolenia, materiały dodatkowe wykorzystywane podczas warsztatów praktycznych]\n• materiały piśmiennicze [notatnik, długopis]\n• dyplom potwierdzający ukończenie szkolenia\n• konsultacje poszkoleniowe\n• oraz serwisy kawowe i obiadowe (nie obejmuje noclegu).";
  const MATERIAŁY_ONLINE_IIST = "Cena zawiera:\n• uczestnictwo w szkoleniu on-line,\n• materiały szkoleniowe w wersji elektronicznej,\n• renomowany certyfikat potwierdzający ukończenie szkolenia (w wersji elektronicznej lub papierowej),\n• konsultacje poszkoleniowe";
  const WARUNKI_UCZESTNICTWA_STACJONARNE_IIST = "INFORMACJE DOTYCZĄCE ZGŁOSZEŃ\n\nDla uczestników finansujących udział w szkoleniu w minimum 70% lub w całości ze środków publicznych następuje zwolnienie z obowiązku opłaty podatku VAT. Zwolnienie z podatku VAT na podstawie § 3 ust. 1 pkt 14 Rozporządzenia Ministra Finansów z dnia 20 grudnia 2013 r. w sprawie zwolnień od podatku od towarów i usług oraz warunków stosowania tych zwolnień (tekst jednolity DzU. 2025 poz. 832).\n\n• Walidacja usługi odbędzie się poprzez PRE i POST TESTY przekazane dla uczestników na początku szkolenia oraz ponownie weryfikowane przed jego zakończeniem.";
  const WARUNKI_UCZESTNICTWA_ONLINE_IIST = WARUNKI_UCZESTNICTWA_STACJONARNE_IIST + "\n\n• Usługa będzie rejestrowana w celu kontroli i audytu. Wizerunek uczestników będzie rejestrowany. Uczestnik zobowiązany jest to posiadania i używania sprawnej kamerki internetowej.";
  const INFORMACJE_DODATKOWE_STACJONARNE_IIST = "Zajęcia są prowadzone metodą warsztatową opartą na aktywizacji uczestników szkolenia poprzez pracę w małych grupach, dyskusje na forum grupy oraz ćwiczenia, studia przypadków, scenki rodzajowe, pracę indywidualną, symulacje i mini- wykłady z omówieniem przykładów z życia i prezentacją multimedialną. Przedmiotem zajęć są realne trudności uwzględniające specyfikę danej branży oraz potrzeby i możliwości osób biorących udział w warsztatach. Uczestnicy uczą się poprzez doświadczenie ćwiczą różne sytuacje, mają możliwość konsultacji indywidualnych. Nauka poprzez kreatywność, elastyczność i osobiste doświadczenia jest najskuteczniejszą formą zdobywania nowych umiejętności.";
  const INFORMACJE_DODATKOWE_ONLINE_IIST = "• wygodna forma szkolenia - wystarczy dostęp do urządzenia z internetem (komputer, tablet, telefon), słuchawki lub głośniki i ulubiony fotel\n• szkolenie realizowane jest w nowoczesnej formie w wirtualnym pokoju konferencyjnym i kameralnej grupie uczestników\n• bierzesz udział w pełnowartościowym szkoleniu - Trener prowadzi zajęcia \"na żywo\" - widzisz go i słyszysz\n• pokaz prezentacji, ankiet i ćwiczeń widzisz na ekranie swojego komputera w czasie rzeczywistym.\n• podczas szkolenia Trener aktywizuje uczestników zadając pytania, na które można odpowiedzieć w czasie rzeczywistym\n• otrzymujesz certyfikat wydany przez jedną z wiodących firm szkoleniowych w Polsce\n• masz dostęp do konsultacji poszkoleniowych w formie e-mail do 4 tygodni po zrealizowanym szkoleniu";
  const WARUNKI_TECHNICZNE_ONLINE_IIST = "Szkolenie realizowane jest z wykorzystaniem platformy Zoom (https://zoom-video.pl/).\nDo udziału w zajęciach niezbędny jest komputer, laptop lub inne urządzenie umożliwiające połączenie z internetem. Zalecane jest korzystanie z aktualnej wersji jednej z następujących przeglądarek internetowych: Google Chrome, Mozilla Firefox, Microsoft Edge, Safari lub Opera.\nUrządzenie uczestnika powinno posiadać co najmniej dwurdzeniowy procesor o taktowaniu 2 GHz (rekomendowany czterordzeniowy), minimum 2 GB pamięci RAM (zalecane 4 GB lub więcej) oraz system operacyjny Windows 8 lub nowszy (preferowany Windows 10 i nowsze wersje), macOS 10.13 lub nowszy, Linux albo Chrome OS.\nDo sprawnego uczestnictwa wymagane jest połączenie internetowe o przepustowości co najmniej 512 kb/s. Dla zapewnienia większego komfortu pracy rekomendowane jest łącze o prędkości minimum 2 Mb/s, natomiast przy jednoczesnej transmisji obrazu i dźwięku zaleca się przepustowość co najmniej 2,5 Mb/s.\nUdział w szkoleniu nie wymaga instalowania dodatkowego oprogramowania poza możliwością korzystania z platformy Zoom w przeglądarce lub aplikacji. Link umożliwiający dołączenie do spotkania pozostaje aktywny przez cały czas trwania usługi – od jej rozpoczęcia do zakończenia.";
  const KODY_DOSTĘPOWE_ONLINE_IIST = "Dostęp do wirtualnego pokoju konferencyjnego zostanie przesłany na adres e-mail Uczestnika szkolenia na 7 dni przed terminem jego rozpoczęcia.";

  const REGUŁY_SEMPER = {
    id: "semper",
    nazwa: "SEMPER",
    pełnaNazwa: "CENTRUM ORGANIZACJI SZKOLEŃ I KONFERENCJI SEMPER MAGDALENA WOLNIEWICZ-KESARIA",
    kolorAkcentu: "#e53935",
    domenyŹródłowe: ["szkolenia-semper.pl"],
    wzorceNazwyKontaBur: ["CENTRUM ORGANIZACJI SZKOLEŃ I KONFERENCJI SEMPER MAGDALENA WOLNIEWICZ-KESARIA", "SEMPER"],
    oczekiwaneWartościBur: { qualityBasis: PODSTAWA_WPISU_BUR_SEMPER },
    poprzednieWartościBur: { qualityBasis: POPRZEDNIA_PODSTAWA_WPISU_BUR_SEMPER },
    podstawaWpisuBur: PODSTAWA_WPISU_BUR_SEMPER,
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
  };

  const REGUŁY_IIST = {
    id: "iist",
    nazwa: "IIST",
    pełnaNazwa: "MIĘDZYNARODOWY INSTYTUT SZKOLEŃ SPECJALISTYCZNYCH IIST PARAG KESARIA",
    kolorAkcentu: "#2e89be",
    domenyŹródłowe: ["szkoleniaiist.com.pl"],
    wzorceNazwyKontaBur: ["MIĘDZYNARODOWY INSTYTUT SZKOLEŃ SPECJALISTYCZNYCH IIST PARAG KESARIA"],
    oczekiwaneWartościBur: { qualityBasis: PODSTAWA_WPISU_BUR_IIST },
    poprzednieWartościBur: {},
    podstawaWpisuBur: PODSTAWA_WPISU_BUR_IIST,
    rodzajUsługiBur: "Usługa szkoleniowa",
    podrodzajUsługiBur: "Usługa szkoleniowa",
    wariantZajęćBur: "Zajęcia grupowe",
    usługaZamkniętaBur: "NIE",
    liczbaUczestnikówBur: { onlineMinimum: "2", stacjonarneMinimum: "5", maksimum: "15" },
    osobaProwadzącaUsługę: { imięINazwisko: "Ekspert IIST", email: "ekspert@iist.pl", rola: "Osoba prowadząca usługę", opisDoświadczenia: "Ekspert IIST" },
    osobaProwadzącaWalidację: { imięINazwisko: "Koordynator IIST", email: "koordynator@iist.pl", rola: "Osoba prowadząca walidację", opisDoświadczenia: "Koordynator IIST" },
    daneKontaktowe: { imięINazwisko: "Ewa Nizioł", email: "bur@iist.pl", telefon: "(+48) 530 409 030" },
    tekstNadProgramem: "",
    tekstPodProgramem: TEKST_ORGANIZACYJNY_IIST,
    sposóbProgramuBur: "cel_program_organizacja",
    materiały: { online: MATERIAŁY_ONLINE_IIST, stacjonarna: MATERIAŁY_STACJONARNE_IIST },
    warunkiUczestnictwa: { online: WARUNKI_UCZESTNICTWA_ONLINE_IIST, stacjonarna: WARUNKI_UCZESTNICTWA_STACJONARNE_IIST },
    informacjeDodatkowe: { online: INFORMACJE_DODATKOWE_ONLINE_IIST, stacjonarna: INFORMACJE_DODATKOWE_STACJONARNE_IIST },
    warunkiTechniczne: { online: WARUNKI_TECHNICZNE_ONLINE_IIST, stacjonarna: "" },
    kodyDostępowe: { online: KODY_DOSTĘPOWE_ONLINE_IIST, stacjonarna: "" },
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
  };

  const REGUŁY_DOSTAWCÓW = {
    semper: REGUŁY_SEMPER,
    iist: REGUŁY_IIST
  };

  function pobierzReguły(identyfikator) {
    return REGUŁY_DOSTAWCÓW[identyfikator] || null;
  }

  function pobierzListęReguł() {
    return Object.keys(REGUŁY_DOSTAWCÓW).map(function pobierz(identyfikator) {
      return REGUŁY_DOSTAWCÓW[identyfikator];
    });
  }

  function pobierzWszystkieReguły() {
    return REGUŁY_DOSTAWCÓW;
  }

  function pobierzOczekiwanąWartośćBur(identyfikator, klucz) {
    const reguły = pobierzReguły(identyfikator);
    return reguły && reguły.oczekiwaneWartościBur && reguły.oczekiwaneWartościBur[klucz] || null;
  }

  function pobierzPoprzedniąWartośćBur(identyfikator, klucz) {
    const reguły = pobierzReguły(identyfikator);
    return reguły && reguły.poprzednieWartościBur && reguły.poprzednieWartościBur[klucz] || null;
  }

  function utwórzKluczDanychProfilu(identyfikatorProfilu) {
    return "daneŹródłoweWedługProfilu_" + identyfikatorProfilu;
  }

  function normalizujFragmentProgramu(tekst) {
    return String(tekst || "").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  function zbudujProgramDostawcy(identyfikatorProfilu, szkolenie) {
    const profil = pobierzReguły(identyfikatorProfilu);
    const sekcje = szkolenie && szkolenie.sekcje || {};
    if (!profil) { return normalizujFragmentProgramu(sekcje.program || ""); }
    const tekstNad = profil.sposóbProgramuBur === "cel_program_organizacja"
      ? sekcje.korzysci || ""
      : sekcje.tekstNadProgramem || sekcje.efektyPoSzkoleniu || sekcje.celEdukacyjnyEfekty || "";
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

  przestrzeń.providerRules = {
    get: pobierzReguły,
    list: pobierzListęReguł,
    getAll: pobierzWszystkieReguły,
    getExpectedBurValue: pobierzOczekiwanąWartośćBur,
    getPreviousBurValue: pobierzPoprzedniąWartośćBur,
    utwórzKluczDanychProfilu: utwórzKluczDanychProfilu,
    normalizujFragmentProgramu: normalizujFragmentProgramu,
    zbudujProgramDostawcy: zbudujProgramDostawcy,
    unieważnijStanOperacjiProfilu: unieważnijStanOperacjiProfilu
  };
  globalny.BurAsystent = przestrzeń;
})(globalThis);
