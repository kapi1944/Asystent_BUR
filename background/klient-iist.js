(function zarejestrujKlientaIist(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const limitCzasuPobieraniaIist = 30000;
  function normalizujŁączeIist(url) {
    try {
      const adres = new URL(String(url || "").trim());
      adres.hash = "";
      return /^(?:www\.)?szkoleniaiist\.com\.pl$/i.test(adres.hostname) && /^https:$/.test(adres.protocol) && adres.pathname !== "/" ? adres.href : "";
    } catch (błąd) { return ""; }
  }
  async function importujSzkolenieZLinkuIist(url) {
    const adres = normalizujŁączeIist(url);
    if (!adres) { throw new Error("Wklej poprawny link do szkolenia IIST."); }
    const kontroler = new AbortController();
    const licznikCzasu = setTimeout(function przerwijPobieranie() { kontroler.abort(); }, limitCzasuPobieraniaIist);
    try {
      const odpowiedź = await fetch(adres, { method: "GET", credentials: "omit", signal: kontroler.signal });
      if (!odpowiedź.ok) { throw new Error("IIST zwrócił błąd HTTP " + odpowiedź.status + "."); }
      return { ok: true, url: adres, html: await odpowiedź.text() };
    } catch (błąd) {
      if (błąd && błąd.name === "AbortError") { throw new Error("Przekroczono limit czasu pobierania strony IIST."); }
      throw błąd;
    } finally {
      clearTimeout(licznikCzasu);
    }
  }
  przestrzeń.normalizujŁączeIist = normalizujŁączeIist;
  przestrzeń.normalizujLinkIist = normalizujŁączeIist;
  przestrzeń.czyLinkSzkoleniaIist = function czyLinkSzkoleniaIist(url) { return Boolean(normalizujŁączeIist(url)); };
  przestrzeń.importujSzkolenieZLinkuIist = importujSzkolenieZLinkuIist;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
