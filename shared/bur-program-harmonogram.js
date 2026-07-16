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

  const NAGŁÓWKI_XLSX_HARMONOGRAMU = [
    "Przedmiot / temat (max 200 znaków)",
    "Prowadzący (adres email lub \"Podmiot zewnętrzny\")",
    "Termin (w formacie dd-mm-yyyy)",
    "Godzina od (w formacie hh:mm)",
    "Godzina do (w formacie hh:mm)",
    "Typ aktywności (Zajęcia/Walidacja/Przerwa)"
  ];

  function obliczCrc32(dane) {
    let crc = 0xffffffff;

    for (let indeks = 0; indeks < dane.length; indeks += 1) {
      crc ^= dane[indeks];
      for (let bit = 0; bit < 8; bit += 1) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }

    return (crc ^ 0xffffffff) >>> 0;
  }

  function zapiszLiczbę(dane, pozycja, wartość, liczbaBajtów) {
    for (let indeks = 0; indeks < liczbaBajtów; indeks += 1) {
      dane[pozycja + indeks] = (wartość >>> (indeks * 8)) & 0xff;
    }
  }

  function połączBajty(fragmenty) {
    const długość = fragmenty.reduce(function zsumuj(suma, fragment) {
      return suma + fragment.length;
    }, 0);
    const wynik = new Uint8Array(długość);
    let pozycja = 0;

    fragmenty.forEach(function skopiuj(fragment) {
      wynik.set(fragment, pozycja);
      pozycja += fragment.length;
    });

    return wynik;
  }

  function utwórzArchiwumZip(pliki) {
    const encoder = new TextEncoder();
    const wpisy = pliki.map(function utwórzWpis(plik) {
      const nazwa = encoder.encode(plik.nazwa);
      const dane = encoder.encode(plik.zawartość);
      const crc = obliczCrc32(dane);
      const nagłówek = new Uint8Array(30 + nazwa.length);

      zapiszLiczbę(nagłówek, 0, 0x04034b50, 4);
      zapiszLiczbę(nagłówek, 4, 20, 2);
      zapiszLiczbę(nagłówek, 6, 0x0800, 2);
      zapiszLiczbę(nagłówek, 14, crc, 4);
      zapiszLiczbę(nagłówek, 18, dane.length, 4);
      zapiszLiczbę(nagłówek, 22, dane.length, 4);
      zapiszLiczbę(nagłówek, 26, nazwa.length, 2);
      nagłówek.set(nazwa, 30);

      return { nazwa: nazwa, dane: dane, crc: crc, lokalny: połączBajty([nagłówek, dane]) };
    });
    let przesunięcie = 0;
    const katalog = wpisy.map(function utwórzWpisKatalogu(wpis) {
      const nagłówek = new Uint8Array(46 + wpis.nazwa.length);

      zapiszLiczbę(nagłówek, 0, 0x02014b50, 4);
      zapiszLiczbę(nagłówek, 4, 20, 2);
      zapiszLiczbę(nagłówek, 6, 20, 2);
      zapiszLiczbę(nagłówek, 8, 0x0800, 2);
      zapiszLiczbę(nagłówek, 16, wpis.crc, 4);
      zapiszLiczbę(nagłówek, 20, wpis.dane.length, 4);
      zapiszLiczbę(nagłówek, 24, wpis.dane.length, 4);
      zapiszLiczbę(nagłówek, 28, wpis.nazwa.length, 2);
      zapiszLiczbę(nagłówek, 42, przesunięcie, 4);
      nagłówek.set(wpis.nazwa, 46);
      przesunięcie += wpis.lokalny.length;
      return nagłówek;
    });
    const daneKatalogu = połączBajty(katalog);
    const zakończenie = new Uint8Array(22);

    zapiszLiczbę(zakończenie, 0, 0x06054b50, 4);
    zapiszLiczbę(zakończenie, 8, wpisy.length, 2);
    zapiszLiczbę(zakończenie, 10, wpisy.length, 2);
    zapiszLiczbę(zakończenie, 12, daneKatalogu.length, 4);
    zapiszLiczbę(zakończenie, 16, przesunięcie, 4);
    return połączBajty(wpisy.map(function pobierzLokalny(wpis) { return wpis.lokalny; }).concat([daneKatalogu, zakończenie]));
  }

  function utwórzKomórkęTekstową(kolumna, wiersz, wartość) {
    return '<c r="' + kolumna + wiersz + '" t="inlineStr"><is><t xml:space="preserve">' + escapujXml(String(wartość || "")) + "</t></is></c>";
  }

  function wygenerujDaneXlsxHarmonogramu(pozycje) {
    const wiersze = [NAGŁÓWKI_XLSX_HARMONOGRAMU].concat((Array.isArray(pozycje) ? pozycje : []).map(function mapujPozycję(pozycja) {
      const wartości = pozycja || {};
      return [wartości.przedmiot, wartości.prowadzacy, wartości.dzien_swiadczenia, wartości.czas_rozpoczecia, wartości.czas_zakonczenia, wartości.typ_aktywnosci];
    }));
    const arkusz = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' +
      wiersze.map(function utwórzWiersz(wartości, indeksWiersza) {
        return '<row r="' + (indeksWiersza + 1) + '">' + wartości.map(function utwórzKomórkę(wartość, indeksKolumny) {
          return utwórzKomórkęTekstową(String.fromCharCode(65 + indeksKolumny), indeksWiersza + 1, wartość);
        }).join("") + "</row>";
      }).join("") + "</sheetData></worksheet>";

    return utwórzArchiwumZip([
      { nazwa: "[Content_Types].xml", zawartość: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>' },
      { nazwa: "_rels/.rels", zawartość: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { nazwa: "xl/workbook.xml", zawartość: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Harmonogram" sheetId="1" r:id="rId1"/></sheets></workbook>' },
      { nazwa: "xl/_rels/workbook.xml.rels", zawartość: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>' },
      { nazwa: "xl/worksheets/sheet1.xml", zawartość: arkusz }
    ]);
  }

  function czyTenSamIndeksTerminu(indeksPrzygotowany, indeksAktualny) {
    const przygotowany = indeksPrzygotowany === null || indeksPrzygotowany === undefined || indeksPrzygotowany === "" ? null : Number(indeksPrzygotowany);
    const aktualny = indeksAktualny === null || indeksAktualny === undefined || indeksAktualny === "" ? null : Number(indeksAktualny);

    return przygotowany === aktualny;
  }

  function sprawdźGotowośćHarmonogramuBur(dane) {
    const źródło = dane || {};
    const pozycje = Array.isArray(źródło.ostatniePozycjeHarmonogramuBur) ? źródło.ostatniePozycjeHarmonogramuBur : [];
    if (!źródło.harmonogramBurPrzygotowany || !pozycje.length) {
      return {
        ok: false,
        komunikat: "Najpierw kliknij »Przygotuj harmonogram« i sprawdź podgląd."
      };
    }

    if (!czyTenSamIndeksTerminu(źródło.ostatniWybranyTerminHarmonogramuBur, źródło.wybranyTerminSemperIndex)) {
      return {
        ok: false,
        nieaktualny: true,
        komunikat: "Wybrany termin SEMPER zmienił się po przygotowaniu harmonogramu. Kliknij ponownie »Przygotuj harmonogram«."
      };
    }

    return {
      ok: true,
      pozycje: pozycje,
      indeksTerminu: źródło.ostatniWybranyTerminHarmonogramuBur
    };
  }

  function czyZerowePodsumowanieHarmonogramu(tekstyWierszy) {
    const teksty = (Array.isArray(tekstyWierszy) ? tekstyWierszy : [])
      .map(function oczyść(tekst) {
        return normalizujTekstDoPorównania(tekst);
      })
      .filter(Boolean);
    const tekst = teksty.join(" ");

    if (!tekst) {
      return false;
    }

    const wymaganePola = [
      /suma godzin zegarowych usługi[^0-9]*0?0:00/,
      /w tym suma godzin zajęć[^0-9]*0?0:00/,
      /w tym suma godzin walidacji[^0-9]*0?0:00/,
      /w tym suma przerw[^0-9]*0?0:00/,
      /suma godzin dydaktycznych bez przerw[^0-9]*0?0:00/
    ];
    const zawieraPozycjęHarmonogramu = /\b(zajęcia|przerwa|walidacja)\b/.test(tekst);
    const zawieraNiezerowyCzas = /\b(?!0?0:00\b)\d{1,2}:\d{2}\b/.test(tekst);

    return !zawieraPozycjęHarmonogramu &&
      !zawieraNiezerowyCzas &&
      wymaganePola.every(function sprawdźPole(wzorzec) {
        return wzorzec.test(tekst);
      });
  }

  function czyTabelaHarmonogramuMaPozycje(wiersze) {
    const tekstyWierszy = (Array.isArray(wiersze) ? wiersze : []).map(function pobierzTekst(wiersz) {
      const tekst = typeof wiersz === "string" ? wiersz : (wiersz && (wiersz.tekst || wiersz.textContent)) || "";

      return String(tekst).replace(/\s+/g, " ").trim();
    });

    if (czyZerowePodsumowanieHarmonogramu(tekstyWierszy)) {
      return false;
    }

    return tekstyWierszy.some(function sprawdźWiersz(tekst) {
      return tekst.length > 0;
    });
  }

  function czyUruchomićFallbackHarmonogramu(warunki) {
    const stan = warunki || {};

    return Boolean(
      stan.tabelaIstnieje &&
      stan.klikniętoWprowadzenie &&
      stan.xlsxNieudany &&
      !stan.istniejącePozycje &&
      Array.isArray(stan.pozycje) &&
      stan.pozycje.length > 0
    );
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
  przestrzeń.NAGŁÓWKI_XLSX_HARMONOGRAMU = NAGŁÓWKI_XLSX_HARMONOGRAMU;
  przestrzeń.wygenerujDaneXlsxHarmonogramu = wygenerujDaneXlsxHarmonogramu;
  przestrzeń.sprawdźGotowośćHarmonogramuBur = sprawdźGotowośćHarmonogramuBur;
  przestrzeń.czyTabelaHarmonogramuMaPozycje = czyTabelaHarmonogramuMaPozycje;
  przestrzeń.czyUruchomićFallbackHarmonogramu = czyUruchomićFallbackHarmonogramu;
  przestrzeń.zbudujDatyZakresu = zbudujDatyZakresu;
  przestrzeń.parsujDatęBur = parsujDatęBur;

  globalny.BurAsystent = przestrzeń;
})(globalThis);
