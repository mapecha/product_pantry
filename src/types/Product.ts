export interface Product {
  id: string;
  // Základní informace
  nazevProduktu: string;
  stav: string;
  extrakceStitku: string;
  typProduktu: string;
  objem: string;
  jednotka: string;
  znacka: string;
  popis: string;
  skladovani: string;
  navod: string;
  zeme: string;
  nazevVyrobce: string;
  adresaVyrobce: string;
  emailVyrobce: string;
  
  // Logistika
  logistikaId: string;
  kus: string;
  lepenkovaKrabice: string;
  vrstva: string;
  paleta: string;
  trvanlivost: string;
  minTepl: string;
  maxTepl: string;
  
  // Ingredience
  stavIngredience: string;
  ingredience: string;
  potravinanskePrisady: string;
  obsahujiAlergeny: string;
  muzeObsahovatAlergeny: string;
  
  // Živiny
  energieKJ: string;
  energieKcal: string;
  tuky: string;
  nasyceneTuky: string;
  sacharidy: string;
  cukry: string;
  proteiny: string;
  sul: string;
  vlaknina: string;
  
  // Speciální atributy
  intrastat: string;
  znackaEU: string;
  uradEU: string;
  obsahAlkoholu: string;
  
  // Ceny
  kupniCena: string;
  prodejniCena: string;
  doporucenaCena: string;
  sazbaDPH: string;
  fakturacniJednotka: string;
  mena: string;
  datumOd: string;
  datumDo: string;
  
  // Metadata
  idGDSN: string;
  typGDSN: string;
  vytvoreno: string;
  vytvořil: string;
  
  // Bezpečnost
  parametry: string;
  zpusobPouziti: string;
  signalniSlovo: string;
  zpusobSkladovani: string;
  tridyNebezpeci: string;
  dalsiInformace: string;
  seznamZabezpeceni: string;
  
  // Hierarchie
  uroven: string;
  odpovědnyUzivatel: string;
  odpovědnyStarsiUzivatel: string;
  odpovědnyDisponent: string;
  kategorie: string;
  podkategorie: string;
  stavGenerovaniAI: string;
  
  // Nakupovat
  popisNakup: string;
  klicovaSlovaNakup: string;
  stitkyProduktu: string;
  stavGenerovaniAINakup: string;
  
  // Prodejce
  kratkyPopis: string;
  odrazky: string[];
  klicovaSlovaProdej: string;
  kategorieProdej: string;
}

export interface FieldGroup {
  title: string;
  emoji: string;
  fields: FieldDefinition[];
}

export interface FieldDefinition {
  key: keyof Product;
  label: string;
  type?: 'text' | 'array';
}