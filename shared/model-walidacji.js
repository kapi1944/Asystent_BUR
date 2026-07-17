(function zarejestrujModelWalidacji(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  function utwórzPozycjęWalidacjiBur(dane) {
    const wartości = dane || {};
    const cel = przestrzeń.pobierzCelDlaPozycjiWalidacji
      ? przestrzeń.pobierzCelDlaPozycjiWalidacji(wartości.pole || "")
      : { id: "nieznanePole", celFormularza: "" };

    return {
      id: wartości.id || cel.id,
      celFormularza: wartości.celFormularza || cel.celFormularza,
      sekcja: wartości.sekcja || "",
      pole: wartości.pole || "",
      status: wartości.status || "ostrzeżenie",
      komunikat: wartości.komunikat || "",
      oczekiwanaWartość: wartości.oczekiwanaWartość || "",
      aktualnaWartość: wartości.aktualnaWartość || "",
      opisPola: wartości.opisPola || "",
      selektorPomocniczy: wartości.selektorPomocniczy || ""
    };
  }

  function utwórzWynikWalidacjiBur(pozycje) {
    const lista = Array.isArray(pozycje) ? pozycje : [];
    const maBłędy = lista.some(function sprawdźBłąd(pozycja) {
      return pozycja.status === "błąd";
    });
    const maOstrzeżenia = lista.some(function sprawdźOstrzeżenie(pozycja) {
      return pozycja.status === "ostrzeżenie";
    });

    return {
      statusOgólny: maBłędy ? "błędy" : (maOstrzeżenia ? "ostrzeżenia" : "poprawny"),
      pozycje: lista
    };
  }

  przestrzeń.utwórzPozycjęWalidacjiBur = utwórzPozycjęWalidacjiBur;
  przestrzeń.utwórzWynikWalidacjiBur = utwórzWynikWalidacjiBur;

  globalny.BurAsystent = przestrzeń;
})(globalThis);
