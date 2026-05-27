export const ZAGREB_DISTRICTS = [
  "Brezovica",
  "Črnomerec",
  "Donja Dubrava",
  "Donji Grad",
  "Gornja Dubrava",
  "Gornji Grad - Medveščak",
  "Maksimir",
  "Novi Zagreb - Istok",
  "Novi Zagreb - Zapad",
  "Peščenica - Žitnjak",
  "Podsljeme",
  "Podsused - Vrapče",
  "Sesvete",
  "Stenjevec",
  "Trešnjevka - Jug",
  "Trešnjevka - Sjever",
  "Trnje",
  "Zagreb - Okolica",
] as const;

export type ZagrebDistrict = (typeof ZAGREB_DISTRICTS)[number];
