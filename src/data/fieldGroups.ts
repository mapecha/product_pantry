import { FieldGroup } from '../types/Product';

export const fieldGroups: FieldGroup[] = [
  {
    title: 'ZÁKLADNÍ INFORMACE',
    emoji: '🟩',
    fields: [
      { key: 'nazevProduktu', label: 'Název produktu' },
      { key: 'stav', label: 'Stav' },
      { key: 'extrakceStitku', label: 'Extrakce štítků' },
      { key: 'typProduktu', label: 'Typ produktu' },
      { key: 'objem', label: 'Objem' },
      { key: 'jednotka', label: 'Jednotka' },
      { key: 'znacka', label: 'Značka' },
      { key: 'popis', label: 'Popis' },
      { key: 'skladovani', label: 'Skladování' },
      { key: 'navod', label: 'Návod' },
      { key: 'zeme', label: 'Země' },
      { key: 'nazevVyrobce', label: 'Název výrobce' },
      { key: 'adresaVyrobce', label: 'Adresa výrobce' },
      { key: 'emailVyrobce', label: 'Email výrobce' },
    ]
  },
  {
    title: 'LOGISTIKA',
    emoji: '📦',
    fields: [
      { key: 'logistikaId', label: 'ID' },
      { key: 'kus', label: 'Kus' },
      { key: 'lepenkovaKrabice', label: 'Lepenková krabice' },
      { key: 'vrstva', label: 'Vrstva' },
      { key: 'paleta', label: 'Paleta' },
      { key: 'trvanlivost', label: 'Trvanlivost' },
      { key: 'minTepl', label: 'Min. tepl.' },
      { key: 'maxTepl', label: 'Max. tepl.' },
    ]
  },
  {
    title: 'INGREDIENCE',
    emoji: '🧪',
    fields: [
      { key: 'stavIngredience', label: 'Stav' },
      { key: 'ingredience', label: 'Ingredience' },
      { key: 'potravinanskePrisady', label: 'Potravinářské přísady' },
      { key: 'obsahujiAlergeny', label: 'Obsahují alergeny' },
      { key: 'muzeObsahovatAlergeny', label: 'Může obsahovat alergeny' },
    ]
  },
  {
    title: 'ŽIVINY',
    emoji: '🥗',
    fields: [
      { key: 'energieKJ', label: 'Energie v kJ' },
      { key: 'energieKcal', label: 'Energie v kcal' },
      { key: 'tuky', label: 'Tuky' },
      { key: 'nasyceneTuky', label: 'Nasycené tuky' },
      { key: 'sacharidy', label: 'Sacharidy' },
      { key: 'cukry', label: 'Cukry' },
      { key: 'proteiny', label: 'Proteiny' },
      { key: 'sul', label: 'Sůl' },
      { key: 'vlaknina', label: 'Vláknina' },
    ]
  },
  {
    title: 'SPECIÁLNÍ ATRIBUTY',
    emoji: '🏷️',
    fields: [
      { key: 'intrastat', label: 'Intrastat' },
      { key: 'znackaEU', label: 'Značka EU pro biopotraviny' },
      { key: 'uradEU', label: 'Úřad EU pro ekologickou výrobu' },
      { key: 'obsahAlkoholu', label: 'Obsah alkoholu %' },
    ]
  },
  {
    title: 'CENY',
    emoji: '💰',
    fields: [
      { key: 'kupniCena', label: 'Kupní cena' },
      { key: 'prodejniCena', label: 'Prodejní cena' },
      { key: 'doporucenaCena', label: 'Doporučená cena' },
      { key: 'sazbaDPH', label: 'Sazba DPH' },
      { key: 'fakturacniJednotka', label: 'Fakturační jednotka' },
      { key: 'mena', label: 'Měna' },
      { key: 'datumOd', label: 'Datum od' },
      { key: 'datumDo', label: 'Datum do' },
    ]
  },
  {
    title: 'METADATA',
    emoji: '🧾',
    fields: [
      { key: 'idGDSN', label: 'ID GDSN' },
      { key: 'typGDSN', label: 'Typ GDSN' },
      { key: 'vytvoreno', label: 'Vytvořeno v' },
      { key: 'vytvořil', label: 'Vytvořil' },
    ]
  },
  {
    title: 'BEZPEČNOST',
    emoji: '⚠️',
    fields: [
      { key: 'parametry', label: 'Parametry' },
      { key: 'zpusobPouziti', label: 'Způsob použití zákazníkem' },
      { key: 'signalniSlovo', label: 'Signální slovo' },
      { key: 'zpusobSkladovani', label: 'Způsob skladování' },
      { key: 'tridyNebezpeci', label: 'Třídy nebezpečí' },
      { key: 'dalsiInformace', label: 'Další informace' },
      { key: 'seznamZabezpeceni', label: 'Seznam zabezpečení' },
    ]
  },
  {
    title: 'HIERARCHIE',
    emoji: '📂',
    fields: [
      { key: 'uroven', label: 'Úroveň' },
      { key: 'odpovědnyUzivatel', label: 'Odpovědný uživatel' },
      { key: 'odpovědnyStarsiUzivatel', label: 'Odpovědný starší uživatel' },
      { key: 'odpovědnyDisponent', label: 'Odpovědný disponent' },
      { key: 'kategorie', label: 'Kategorie' },
      { key: 'podkategorie', label: 'Podkategorie' },
      { key: 'stavGenerovaniAI', label: 'Stav generování AI' },
    ]
  },
  {
    title: 'NAKUPOVAT',
    emoji: '🛍️',
    fields: [
      { key: 'popisNakup', label: 'Popis' },
      { key: 'klicovaSlovaNakup', label: 'Klíčová slova pro vyhledávání' },
      { key: 'stitkyProduktu', label: 'Štítky produktu' },
      { key: 'stavGenerovaniAINakup', label: 'Stav generování AI' },
    ]
  },
  {
    title: 'PRODEJCE',
    emoji: '🧾',
    fields: [
      { key: 'kratkyPopis', label: 'Krátký popis' },
      { key: 'odrazky', label: 'Odrážky', type: 'array' },
      { key: 'klicovaSlovaProdej', label: 'Klíčová slova pro vyhledávání' },
      { key: 'kategorieProdej', label: 'Kategorie' },
    ]
  },
];