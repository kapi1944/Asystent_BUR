(function zarejestrujKolejkęTerminówBur(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const MIASTA_BUR = ["Warszawa", "Wrocław", "Kraków", "Poznań", "Zakopane", "Kołobrzeg", "Gdańsk", "Katowice", "Szczecin"];

  function pobierzMiastoBur(tekst) {
    return MIASTA_BUR.find(function znajdź(miasto) {
      return String(tekst || "").toLocaleLowerCase("pl-PL").includes(miasto.toLocaleLowerCase("pl-PL"));
    }) || "";
  }

  function czyTerminOnlineKolejki(tekst) {
    return /online|zdaln|remote|wideokonferenc/i.test(String(tekst || ""));
  }

  function sparsujLinięTerminu(linia) {
    const dopasowanie = String(linia || "").match(/^(\d{4}-\d{2}-\d{2})-(\d{4}-\d{2}-\d{2})\s+(.+)$/);
    if (!dopasowanie) {
      return null;
    }

    const opis = dopasowanie[3];
    const online = czyTerminOnlineKolejki(opis);
    const miasto = online ? "" : pobierzMiastoBur(opis);
    if (!online && !miasto) {
      return null;
    }

    return {
      dataOd: dopasowanie[1],
      dataDo: dopasowanie[2],
      miasto: miasto,
      online: online,
      źródło: linia
    };
  }

  function sparsujBlokTerminu(linie, indeks) {
    const od = String(linie[indeks] || "").match(/^od:\s*(\d{4}-\d{2}-\d{2})/i);
    const doDaty = String(linie[indeks + 1] || "").match(/^do:\s*(\d{4}-\d{2}-\d{2})/i);
    if (!od || !doDaty) {
      return null;
    }

    let koniec = indeks + 2;
    while (koniec < linie.length && !/^od:\s*/i.test(linie[koniec]) && !/^\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}\s+/.test(linie[koniec])) {
      koniec += 1;
    }
    const opis = linie.slice(indeks, koniec).join(" ");
    const online = czyTerminOnlineKolejki(opis);
    const miasto = online ? "" : pobierzMiastoBur(opis);
    if (!online && !miasto) {
      return { następnyIndeks: koniec, termin: null };
    }

    return {
      następnyIndeks: koniec,
      termin: { dataOd: od[1], dataDo: doDaty[1], miasto: miasto, online: online, źródło: linie.slice(indeks, koniec).join("\n") }
    };
  }

  function parsujKolejkęTerminówBur(tekst) {
    const linie = String(tekst || "").replace(/\r/g, "").split("\n").map(function oczyść(linia) { return linia.trim(); }).filter(Boolean);
    const terminy = [];
    const błędne = [];

    for (let indeks = 0; indeks < linie.length; indeks += 1) {
      const linia = linie[indeks];
      const prosty = sparsujLinięTerminu(linia);
      if (prosty) {
        terminy.push(prosty);
        continue;
      }
      if (/^od:\s*/i.test(linia)) {
        const blok = sparsujBlokTerminu(linie, indeks);
        if (blok && blok.termin) {
          terminy.push(blok.termin);
          indeks = blok.następnyIndeks - 1;
          continue;
        }
        błędne.push(linia);
        continue;
      }
      if (/^(do:|\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}\s+)/i.test(linia)) {
        continue;
      }
      błędne.push(linia);
    }

    return { terminy: terminy, błędne: błędne };
  }

  function policzKolejkęTerminówBur(wynik) {
    const terminy = wynik && Array.isArray(wynik.terminy) ? wynik.terminy : [];
    const online = terminy.filter(function filtrujOnline(termin) { return termin.online; }).length;
    return { stacjonarne: terminy.length - online, online: online, łącznie: terminy.length, karty: terminy.length };
  }

  function opiszTerminKolejkiBur(termin) {
    return [termin.dataOd + " – " + termin.dataDo, termin.online ? "Online" : termin.miasto + " · stacjonarna"].join(" · ");
  }

  przestrzeń.parsujKolejkęTerminówBur = parsujKolejkęTerminówBur;
  przestrzeń.policzKolejkęTerminówBur = policzKolejkęTerminówBur;
  przestrzeń.opiszTerminKolejkiBur = opiszTerminKolejkiBur;
  przestrzeń.MIASTA_KOLEJKI_BUR = MIASTA_BUR.slice();
  globalny.BurAsystent = przestrzeń;
})(globalThis);
