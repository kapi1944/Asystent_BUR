(function zarejestrujProgramIHarmonogram(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  const EMAIL_TRENERA = "trener@szkolenia-semper.pl";
  const EMAIL_WALIDATORA = "koordynator@szkolenia-semper.pl";
  const INFORMACJA_ORGANIZACYJNA = [
    "Organizator zastrzega sobie prawo do zmiany harmonogramu realizacji usługi. Ostateczne informacje zostaną przekazane uczestnikom najpóźniej na 7 dni przed rozpoczęciem szkolenia. Zmiana harmonogramu nie wpływa na całkowity wymiar godzin szkolenia.",
    "Prosimy o traktowanie liczby zapisów widocznych w BUR wyłącznie orientacyjnie. Rejestracje poprzez BUR są tylko częścią zapisów na szkolenie, ponieważ prowadzimy również nabór komercyjny, którego liczba uczestników nie jest widoczna w systemie BUR. Zachęcamy do rezerwacji miejsca - grupy szkoleniowe są tworzone również na podstawie zapisów spoza BUR."
  ].join("\n\n");

  function oczyscLinie(tekst) {
    return String(tekst || "").replace(/\s+/g, " ").trim();
  }

  function normalizujTekstDoPorównania(tekst) {
    return String(tekst || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function escapujHtml(tekst) {
    return String(tekst || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapujXml(tekst) {
    return String(tekst || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function czyHtml(tekst) {
    return /<\/?[a-z][\s\S]*>/i.test(String(tekst || ""));
  }

  function czyElementBlokowy(element) {
    return /^(P|DIV|SECTION|ARTICLE|H[1-6]|UL|OL|LI|TABLE|TR|TD|TH)$/i.test(element.tagName || "");
  }

  function pobierzTekstZHtml(html) {
    if (typeof DOMParser === "undefined") {
      return String(html || "").replace(/<[^>]+>/g, "\n");
    }

    const dokument = new DOMParser().parseFromString(String(html || ""), "text/html");
    const linie = [];

    dokument.querySelectorAll("script, style, iframe, object, svg, img, form, input, button").forEach(function usuń(element) {
      element.remove();
    });

    function dodajLinię(tekst) {
      const linia = oczyscLinie(tekst);

      if (linia) {
        linie.push(linia);
      }
    }

    function przejdź(element) {
      if (!element) {
        return;
      }

      if (element.nodeType === Node.TEXT_NODE) {
        dodajLinię(element.textContent);
        return;
      }

      if (element.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      if (element.tagName === "BR") {
        linie.push("");
        return;
      }

      if (element.tagName === "LI") {
        dodajLinię("- " + element.textContent);
        return;
      }

      const dzieciBlokowe = Array.from(element.children).filter(czyElementBlokowy);

      if (czyElementBlokowy(element) && dzieciBlokowe.length === 0) {
        dodajLinię(element.textContent);
        return;
      }

      Array.from(element.childNodes).forEach(przejdź);
    }

    przejdź(dokument.body);

    return linie.join("\n");
  }

  function oczyśćProgramSemper(program) {
    const tekstŹródłowy = czyHtml(program) ? pobierzTekstZHtml(program) : String(program || "");

    return tekstŹródłowy
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map(function oczyść(linia) {
        return linia.replace(/[ \t]+/g, " ").trim();
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function przygotujTekstProgramu(program) {
    const czystyProgram = oczyśćProgramSemper(program);
    const porównanieProgramu = normalizujTekstDoPorównania(czystyProgram);
    const porównanieInformacji = normalizujTekstDoPorównania(INFORMACJA_ORGANIZACYJNA);

    if (porównanieProgramu.includes(porównanieInformacji)) {
      return czystyProgram;
    }

    return [czystyProgram, INFORMACJA_ORGANIZACYJNA].filter(Boolean).join("\n\n");
  }

  function konwertujTekstProgramuNaHtml(tekst) {
    const linie = String(tekst || "").replace(/\r\n?/g, "\n").split("\n");
    const html = [];
    let typListy = "";
    let akapit = [];

    function zamknijAkapit() {
      if (akapit.length) {
        html.push("<p>" + escapujHtml(akapit.join(" ")) + "</p>");
        akapit = [];
      }
    }

    function zamknijListę() {
      if (typListy) {
        html.push("</" + typListy + ">");
        typListy = "";
      }
    }

    linie.forEach(function dodajLinię(linia) {
      const tekstLinii = linia.trim();
      const wypunktowanie = tekstLinii.match(/^[-*•–]\s+(.+)$/);
      const numerowanie = tekstLinii.match(/^\d+[.)]\s+(.+)$/);

      if (!tekstLinii) {
        zamknijAkapit();
        zamknijListę();
        return;
      }

      if (wypunktowanie || numerowanie) {
        const nowyTypListy = numerowanie ? "ol" : "ul";
        zamknijAkapit();

        if (typListy !== nowyTypListy) {
          zamknijListę();
          typListy = nowyTypListy;
          html.push("<" + typListy + ">");
        }

        html.push("<li>" + escapujHtml((wypunktowanie || numerowanie)[1]) + "</li>");
        return;
      }

      zamknijListę();
      akapit.push(tekstLinii);
    });

    zamknijAkapit();
    zamknijListę();

    return html.join("");
  }

  function utwórzPozycjęHarmonogramu(dane) {
    const wartości = dane || {};

    return {
      przedmiot: wartości.przedmiot || "",
      prowadzacy: wartości.prowadzacy || "",
      dzien_swiadczenia: wartości.dzien_swiadczenia || "",
      czas_rozpoczecia: wartości.czas_rozpoczecia || "",
      czas_zakonczenia: wartości.czas_zakonczenia || "",
      typ_aktywnosci: wartości.typ_aktywnosci || "Zajęcia"
    };
  }

  function pobierzGodzinyDnia(indeksDnia, czyOnline, liczbaDni) {
    const liczbaDniSzkolenia = Math.max(1, Number(liczbaDni || 1));
    const pierwszyDzień = indeksDnia === 0;
    const ostatniDzień = indeksDnia === liczbaDniSzkolenia - 1;

    if (czyOnline) {
      return ostatniDzień
        ? {
            zajęcia: ["09:00", "13:00"],
            przerwa: ["13:00", "14:00"],
            walidacja: ["14:00", "15:00"]
          }
        : {
            zajęcia: ["09:00", "14:00"],
            przerwa: ["14:00", "15:00"],
            walidacja: null
          };
    }

    if (pierwszyDzień && ostatniDzień) {
      return {
        zajęcia: ["10:00", "16:00"],
        przerwa: ["16:00", "17:00"],
        walidacja: ["17:00", "18:00"]
      };
    }

    if (pierwszyDzień) {
      return {
        zajęcia: ["10:00", "17:00"],
        przerwa: ["17:00", "18:00"],
        walidacja: null
      };
    }

    return ostatniDzień
      ? {
          zajęcia: ["09:00", "15:00"],
          przerwa: ["15:00", "16:00"],
          walidacja: ["16:00", "17:00"]
        }
      : {
          zajęcia: ["09:00", "16:00"],
          przerwa: ["16:00", "17:00"],
          walidacja: null
        };
  }

  function parsujDatęBur(wartość) {
    const tekst = String(wartość || "").trim();
    let dopasowanie = tekst.match(/^(\d{2})-(\d{2})-(\d{4})$/);

    if (dopasowanie) {
      return new Date(Number(dopasowanie[3]), Number(dopasowanie[2]) - 1, Number(dopasowanie[1]), 12, 0, 0, 0);
    }

    dopasowanie = tekst.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

    if (dopasowanie) {
      return new Date(Number(dopasowanie[3]), Number(dopasowanie[2]) - 1, Number(dopasowanie[1]), 12, 0, 0, 0);
    }

    dopasowanie = tekst.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dopasowanie) {
      return new Date(Number(dopasowanie[1]), Number(dopasowanie[2]) - 1, Number(dopasowanie[3]), 12, 0, 0, 0);
    }

    return null;
  }

  function formatujDatęBur(data) {
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
      return "";
    }

    return [
      String(data.getDate()).padStart(2, "0"),
      String(data.getMonth() + 1).padStart(2, "0"),
      String(data.getFullYear())
    ].join("-");
  }

  function przygotujTematHarmonogramu(tytuł) {
    let temat = oczyscLinie(tytuł)
      .replace(/\b[123]\s*[-–]?\s*dniowe\s+szkolenie\b/gi, "")
      .replace(/\b[123]\s*[-–]?\s*dniowe\b/gi, "")
      .replace(/\bw\s+(Zakopanem|Gdańsku|Gdansku|Kołobrzegu|Kolobrzegu)\b/gi, "")
      .replace(/\(?\s*noclegi i wyżywienie w cenie szkolenia\s*\)?/gi, "")
      .replace(/\(?\s*noclegi i wyzywienie w cenie szkolenia\s*\)?/gi, "")
      .replace(/\s+[–-]\s*$/g, "")
      .replace(/^[–-]\s+/g, "")
      .replace(/\s+([.,;:!?])/g, "$1")
      .replace(/[.。]+$/g, "")
      .replace(/\s*[–-]\s*$/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    temat = temat
      .replace(/\(\s*\)/g, "")
      .replace(/\s+([)\]}])/g, "$1")
      .replace(/([([{])\s+/g, "$1")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (temat.length > 200) {
      return temat.slice(0, 197) + "...";
    }

    return temat;
  }

  function zbudujDatyZakresu(dataStart, dataKoniec) {
    const start = parsujDatęBur(dataStart);
    const koniec = parsujDatęBur(dataKoniec);
    const daty = [];

    if (!start || !koniec || start.getTime() > koniec.getTime()) {
      return daty;
    }

    for (let data = new Date(start.getTime()); data.getTime() <= koniec.getTime(); data.setDate(data.getDate() + 1)) {
      daty.push(formatujDatęBur(data));
    }

    return daty;
  }

  function pobierzDatyHarmonogramuZTerminu(termin) {
    if (!termin) {
      return [];
    }

    return zbudujDatyZakresu(
      termin.dataStartBur || termin.dataOdTekst,
      termin.dataKoniecBur || termin.dataDoTekst || termin.dataOdTekst
    );
  }

  function wybierzTerminHarmonogramu(szkolenie, indeks) {
    const terminy = szkolenie && Array.isArray(szkolenie.terminy) ? szkolenie.terminy : [];
    const czyWybranoIndeks = indeks !== null && indeks !== undefined && indeks !== "";
    const liczbowyIndeks = czyWybranoIndeks ? Number(indeks) : NaN;

    if (terminy.length === 1) {
      return {
        ok: true,
        termin: terminy[0],
        indeks: 0,
        liczbaTerminów: terminy.length
      };
    }

    if (terminy.length > 1 && !czyWybranoIndeks) {
      return {
        ok: false,
        komunikat: "Wybierz termin SEMPER do wygenerowania harmonogramu.",
        kod: "BRAK_WYBORU_TERMINU",
        liczbaTerminów: terminy.length
      };
    }

    if (!terminy.length) {
      return {
        ok: true,
        termin: {},
        indeks: null,
        liczbaTerminów: terminy.length
      };
    }

    if (!Number.isInteger(liczbowyIndeks) || liczbowyIndeks < 0 || liczbowyIndeks >= terminy.length) {
      return {
        ok: false,
        komunikat: "Wybrany termin SEMPER jest nieprawidłowy.",
        kod: "NIEPRAWIDLOWY_TERMIN",
        liczbaTerminów: terminy.length
      };
    }

    return {
      ok: true,
      termin: terminy[liczbowyIndeks],
      indeks: liczbowyIndeks,
      liczbaTerminów: terminy.length
    };
  }

  function znormalizujDaty(daty) {
    const unikalne = new Map();

    (Array.isArray(daty) ? daty : []).forEach(function dodajDatę(data) {
      const obiektDaty = data instanceof Date ? data : parsujDatęBur(data);
      const tekstDaty = formatujDatęBur(obiektDaty);

      if (tekstDaty) {
        unikalne.set(tekstDaty, obiektDaty.getTime());
      }
    });

    return Array.from(unikalne.entries())
      .sort(function sortuj(pierwsza, druga) {
        return pierwsza[1] - druga[1];
      })
      .map(function pobierzTekst(wpis) {
        return wpis[0];
      });
  }

  function zbudujPozycjeHarmonogramu(dane) {
    const wartości = dane || {};
    const daty = znormalizujDaty(wartości.daty);
    const tematSzkolenia = wartości.tematSzkolenia || "";
    const emailTrenera = wartości.emailTrenera || EMAIL_TRENERA;
    const emailWalidatora = wartości.emailWalidatora || EMAIL_WALIDATORA;
    const pozycje = [];

    daty.forEach(function dodajDzień(data, indeks) {
      const godziny = pobierzGodzinyDnia(indeks, Boolean(wartości.czyOnline), daty.length);

      pozycje.push(utwórzPozycjęHarmonogramu({
        przedmiot: tematSzkolenia,
        prowadzacy: emailTrenera,
        dzien_swiadczenia: data,
        czas_rozpoczecia: godziny.zajęcia[0],
        czas_zakonczenia: godziny.zajęcia[1],
        typ_aktywnosci: "Zajęcia"
      }));

      pozycje.push(utwórzPozycjęHarmonogramu({
        dzien_swiadczenia: data,
        czas_rozpoczecia: godziny.przerwa[0],
        czas_zakonczenia: godziny.przerwa[1],
        typ_aktywnosci: "Przerwa"
      }));

      if (godziny.walidacja) {
        pozycje.push(utwórzPozycjęHarmonogramu({
          prowadzacy: emailWalidatora,
          dzien_swiadczenia: data,
          czas_rozpoczecia: godziny.walidacja[0],
          czas_zakonczenia: godziny.walidacja[1],
          typ_aktywnosci: "Walidacja"
        }));
      }
    });

    return pozycje;
  }

  function wygenerujTagXml(nazwa, wartość) {
    const tekst = String(wartość || "");

    if (!tekst) {
      return "<" + nazwa + "/>";
    }

    return "<" + nazwa + ">" + escapujXml(tekst) + "</" + nazwa + ">";
  }

  function wygenerujXmlHarmonogramu(pozycje) {
    const wiersze = (Array.isArray(pozycje) ? pozycje : []).map(function dodajWiersz(pozycja) {
      const wartości = pozycja || {};

      return [
        "    <row>",
        "      " + wygenerujTagXml("przedmiot", wartości.przedmiot),
        "      " + wygenerujTagXml("prowadzacy", wartości.prowadzacy),
        "      " + wygenerujTagXml("dzien_swiadczenia", wartości.dzien_swiadczenia),
        "      " + wygenerujTagXml("czas_rozpoczecia", wartości.czas_rozpoczecia),
        "      " + wygenerujTagXml("czas_zakonczenia", wartości.czas_zakonczenia),
        "      " + wygenerujTagXml("typ_aktywnosci", wartości.typ_aktywnosci),
        "    </row>"
      ].join("\n");
    });

    return ["<response>", "  <data>", wiersze.join("\n"), "  </data>", "</response>"].join("\n");
  }

  przestrzeń.EMAIL_TRENERA_HARMONOGRAMU = EMAIL_TRENERA;
  przestrzeń.EMAIL_WALIDATORA_HARMONOGRAMU = EMAIL_WALIDATORA;
  przestrzeń.INFORMACJA_ORGANIZACYJNA_PROGRAMU = INFORMACJA_ORGANIZACYJNA;
  przestrzeń.oczyśćProgramSemper = oczyśćProgramSemper;
  przestrzeń.przygotujTekstProgramu = przygotujTekstProgramu;
  przestrzeń.konwertujTekstProgramuNaHtml = konwertujTekstProgramuNaHtml;
  przestrzeń.pobierzGodzinyDnia = pobierzGodzinyDnia;
  przestrzeń.przygotujTematHarmonogramu = przygotujTematHarmonogramu;
  przestrzeń.pobierzDatyHarmonogramuZTerminu = pobierzDatyHarmonogramuZTerminu;
  przestrzeń.wybierzTerminHarmonogramu = wybierzTerminHarmonogramu;
  przestrzeń.zbudujPozycjeHarmonogramu = zbudujPozycjeHarmonogramu;
  przestrzeń.wygenerujXmlHarmonogramu = wygenerujXmlHarmonogramu;
  przestrzeń.zbudujDatyZakresu = zbudujDatyZakresu;
  przestrzeń.parsujDatęBur = parsujDatęBur;

  globalny.BurAsystent = przestrzeń;
})(globalThis);
