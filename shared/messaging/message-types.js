(function zarejestrujTypyWiadomości(globalny) {
  const przestrzeń = globalny.BurAsystent || {};

  przestrzeń.TYPY_WIADOMOŚCI = Object.freeze({
    PING_BUR: "bur.ping",
    PONG_BUR: "bur.pong",
    ZAPEWNIJ_CONTENT_SCRIPT_BUR: "bur.ensureContentScript"
  });

  globalny.BurAsystent = przestrzeń;
})(typeof globalThis !== "undefined" ? globalThis : this);
