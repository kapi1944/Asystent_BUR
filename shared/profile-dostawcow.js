(function zarejestrujProfileDostawcow(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function normalizujNazweKontaBur(tekst) {
    return String(tekst || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleUpperCase("pl-PL");
  }

  const PROFILE_DOSTAWCOW = {
    semper: {
      id: "semper",
      nazwa: "SEMPER",
      pełnaNazwa: "SEMPER",
      kolorAkcentu: "#e53935",
      domenyŹródłowe: ["szkolenia-semper.pl"],
      wzorceNazwyKontaBur: ["SEMPER"],
      podstawaWpisuBur: "",
      osobaProwadzącaUsługę: {},
      osobaProwadzącaWalidację: {},
      daneKontaktowe: {},
      tekstNadProgramem: "",
      tekstPodProgramem: "",
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
      osobaProwadzącaUsługę: { imięINazwisko: "Ekspert IIST", email: "ekspert@iist.pl", rola: "Osoba prowadząca usługę", opisDoświadczenia: "Ekspert IIST" },
      osobaProwadzącaWalidację: { imięINazwisko: "Koordynator IIST", email: "koordynator@iist.pl", rola: "Osoba prowadząca walidację", opisDoświadczenia: "Koordynator IIST" },
      daneKontaktowe: { imięINazwisko: "Ewa Nizioł", email: "bur@iist.pl", telefon: "(+48) 530 409 030" },
      tekstNadProgramem: "",
      tekstPodProgramem: "",
      materiałyOnline: "",
      warunkiUczestnictwaOnline: "",
      informacjeDodatkoweOnline: "",
      warunkiTechniczneOnline: "",
      kodyDostępoweOnline: ""
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

  function unieważnijStanOperacjiProfilu(stan) {
    return Object.assign({}, stan || {}, { podglądWypełnieniaBur: null, aktywnaOperacjaBur: null, harmonogramBurPrzygotowany: false, harmonogramBurNieaktualny: true });
  }

  przestrzeń.PROFILE_DOSTAWCOW = PROFILE_DOSTAWCOW;
  przestrzeń.pobierzProfilDostawcy = pobierzProfilDostawcy;
  przestrzeń.wykryjProfilPoNazwieKontaBur = wykryjProfilPoNazwieKontaBur;
  przestrzeń.normalizujNazweKontaBur = normalizujNazweKontaBur;
  przestrzeń.czyProfilZgodnyZKontemBur = czyProfilZgodnyZKontemBur;
  przestrzeń.kluczDanychProfilu = kluczDanychProfilu;
  przestrzeń.unieważnijStanOperacjiProfilu = unieważnijStanOperacjiProfilu;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
