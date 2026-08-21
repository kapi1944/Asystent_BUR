(function uruchomAplikacjęPanelu(globalny) {
  const panel = globalny.BurAsystent.panel;
  const flagiRefresh = panel.konfiguracja.features.refresh;
  const mountRefresh = document.getElementById("mount-refresh");

  if (mountRefresh) {
    mountRefresh.hidden = !flagiRefresh.enabled;
  }

  panel.aplikacja.inicjalizuj();
})(globalThis);
