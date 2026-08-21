(function zarejestrujFasadęProfiliDostawców(globalny) {
  const przestrzeń = globalny.BurAsystent || {};
  const regułyDostawców = przestrzeń.providerRules;
  const detektorProfilu = przestrzeń.profileDetector;

  przestrzeń.PROFILE_DOSTAWCOW = regułyDostawców.getAll();
  przestrzeń.pobierzProfilDostawcy = regułyDostawców.get;
  przestrzeń.wykryjProfilPoNazwieKontaBur = detektorProfilu.detect;
  przestrzeń.normalizujNazweKontaBur = detektorProfilu.normalizeAccountName;
  przestrzeń.czyProfilZgodnyZKontemBur = detektorProfilu.matches;
  przestrzeń.kluczDanychProfilu = regułyDostawców.utwórzKluczDanychProfilu;
  przestrzeń.normalizujFragmentProgramu = regułyDostawców.normalizujFragmentProgramu;
  przestrzeń.zbudujProgramDostawcy = regułyDostawców.zbudujProgramDostawcy;
  przestrzeń.unieważnijStanOperacjiProfilu = regułyDostawców.unieważnijStanOperacjiProfilu;
  przestrzeń.AKTUALNA_PODSTAWA_WPISU_BUR = regułyDostawców.getExpectedBurValue("semper", "qualityBasis");
  przestrzeń.NIEAKTUALNA_PODSTAWA_WPISU_BUR = regułyDostawców.getPreviousBurValue("semper", "qualityBasis");
  globalny.BurAsystent = przestrzeń;
})(globalThis);
