(function zarejestrujFlagiFunkcjiPanelu(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const panel = przestrzeń.panel || {};

  panel.konfiguracja = Object.freeze({
    features: Object.freeze({
      refresh: Object.freeze({
        enabled: false,
        autoCorrection: false,
        autoPublish: false
      })
    })
  });

  przestrzeń.panel = panel;
  globalny.BurAsystent = przestrzeń;
})(globalThis);
