export interface Kommune {
  kommunenavn: string;
  kommunenummer: string;
}

export interface Fylke {
  fylke_navn: string;
  fylke_nummer: string;
  kommuner: Kommune[];
}

export const norwegianLocations: Fylke[] = [
  {
    "fylke_navn": "Akershus",
    "fylke_nummer": "32",
    "kommuner": [
      {"kommunenavn": "Asker", "kommunenummer": "3201"},
      {"kommunenavn": "Bærum", "kommunenummer": "3205"},
      {"kommunenavn": "Eidsvoll", "kommunenummer": "3236"},
      {"kommunenavn": "Enebakk", "kommunenummer": "3227"},
      {"kommunenavn": "Frogn", "kommunenummer": "3212"},
      {"kommunenavn": "Gjerdrum", "kommunenummer": "3229"},
      {"kommunenavn": "Hurdal", "kommunenummer": "3238"},
      {"kommunenavn": "Lillestrøm", "kommunenummer": "3221"},
      {"kommunenavn": "Lunner", "kommunenummer": "3224"},
      {"kommunenavn": "Nannestad", "kommunenummer": "3237"},
      {"kommunenavn": "Nes", "kommunenummer": "3235"},
      {"kommunenavn": "Nesodden", "kommunenummer": "3218"},
      {"kommunenavn": "Nittedal", "kommunenummer": "3230"},
      {"kommunenavn": "Nordre Follo", "kommunenummer": "3219"},
      {"kommunenavn": "Rælingen", "kommunenummer": "3228"},
      {"kommunenavn": "Ullensaker", "kommunenummer": "3233"},
      {"kommunenavn": "Vestby", "kommunenummer": "3211"},
      {"kommunenavn": "Ås", "kommunenummer": "3214"}
    ]
  },
  {
    "fylke_navn": "Buskerud",
    "fylke_nummer": "33",
    "kommuner": [
      {"kommunenavn": "Drammen", "kommunenummer": "3301"},
      {"kommunenavn": "Flesberg", "kommunenummer": "3332"},
      {"kommunenavn": "Flå", "kommunenummer": "3330"},
      {"kommunenavn": "Gol", "kommunenummer": "3334"},
      {"kommunenavn": "Hemsedal", "kommunenummer": "3336"},
      {"kommunenavn": "Hol", "kommunenummer": "3338"},
      {"kommunenavn": "Hole", "kommunenummer": "3327"},
      {"kommunenavn": "Kongsberg", "kommunenummer": "3305"},
      {"kommunenavn": "Krødsherad", "kommunenummer": "3329"},
      {"kommunenavn": "Modum", "kommunenummer": "3326"},
      {"kommunenavn": "Nesbyen", "kommunenummer": "3335"},
      {"kommunenavn": "Nore og Uvdal", "kommunenummer": "3341"},
      {"kommunenavn": "Ringerike", "kommunenummer": "3306"},
      {"kommunenavn": "Rollag", "kommunenummer": "3334"},
      {"kommunenavn": "Sigdal", "kommunenummer": "3328"},
      {"kommunenavn": "Ål", "kommunenummer": "3337"}
    ]
  },
  {
    "fylke_navn": "Innlandet",
    "fylke_nummer": "34",
    "kommuner": [
      {"kommunenavn": "Alvdal", "kommunenummer": "3428"},
      {"kommunenavn": "Dovre", "kommunenummer": "3431"},
      {"kommunenavn": "Eidskog", "kommunenummer": "3416"},
      {"kommunenavn": "Elverum", "kommunenummer": "3420"},
      {"kommunenavn": "Engerdal", "kommunenummer": "3435"},
      {"kommunenavn": "Etnedal", "kommunenummer": "3451"},
      {"kommunenavn": "Folldal", "kommunenummer": "3429"},
      {"kommunenavn": "Gausdal", "kommunenummer": "3441"},
      {"kommunenavn": "Gjøvik", "kommunenummer": "3407"},
      {"kommunenavn": "Gran", "kommunenummer": "3446"},
      {"kommunenavn": "Grue", "kommunenummer": "3417"},
      {"kommunenavn": "Hamar", "kommunenummer": "3403"},
      {"kommunenavn": "Kongsvinger", "kommunenummer": "3401"},
      {"kommunenavn": "Lesja", "kommunenummer": "3432"},
      {"kommunenavn": "Lillehammer", "kommunenummer": "3405"},
      {"kommunenavn": "Lom", "kommunenummer": "3434"},
      {"kommunenavn": "Løten", "kommunenummer": "3412"},
      {"kommunenavn": "Nord-Aurdal", "kommunenummer": "3451"},
      {"kommunenavn": "Nord-Fron", "kommunenummer": "3436"},
      {"kommunenavn": "Nord-Odal", "kommunenummer": "3414"},
      {"kommunenavn": "Nordre Land", "kommunenummer": "3448"},
      {"kommunenavn": "Os", "kommunenummer": "3430"},
      {"kommunenavn": "Rendalen", "kommunenummer": "3433"},
      {"kommunenavn": "Ringebu", "kommunenummer": "3440"},
      {"kommunenavn": "Ringsaker", "kommunenummer": "3411"},
      {"kommunenavn": "Sel", "kommunenummer": "3437"},
      {"kommunenavn": "Skjåk", "kommunenummer": "3433"},
      {"kommunenavn": "Stange", "kommunenummer": "3413"},
      {"kommunenavn": "Stor-Elvdal", "kommunenummer": "3439"},
      {"kommunenavn": "Søndre Land", "kommunenummer": "3449"},
      {"kommunenavn": "Sør-Aurdal", "kommunenummer": "3452"},
      {"kommunenavn": "Sør-Fron", "kommunenummer": "3438"},
      {"kommunenavn": "Sør-Odal", "kommunenummer": "3415"},
      {"kommunenavn": "Tolga", "kommunenummer": "3426"},
      {"kommunenavn": "Trysil", "kommunenummer": "3421"},
      {"kommunenavn": "Tynset", "kommunenummer": "3427"},
      {"kommunenavn": "Vang", "kommunenummer": "3453"},
      {"kommunenavn": "Vestre Slidre", "kommunenummer": "3452"},
      {"kommunenavn": "Vestre Toten", "kommunenummer": "3443"},
      {"kommunenavn": "Vågå", "kommunenummer": "3435"},
      {"kommunenavn": "Våler", "kommunenummer": "3419"},
      {"kommunenavn": "Østre Toten", "kommunenummer": "3442"},
      {"kommunenavn": "Øyer", "kommunenummer": "3440"},
      {"kommunenavn": "Øystre Slidre", "kommunenummer": "3451"}
    ]
  },
  {
    "fylke_navn": "Oslo",
    "fylke_nummer": "03",
    "kommuner": [
      {"kommunenavn": "Oslo", "kommunenummer": "0301"}
    ]
  },
  {
    "fylke_navn": "Vestfold",
    "fylke_nummer": "38",
    "kommuner": [
      {"kommunenavn": "Færder", "kommunenummer": "3803"},
      {"kommunenavn": "Horten", "kommunenummer": "3801"},
      {"kommunenavn": "Holmestrand", "kommunenummer": "3802"},
      {"kommunenavn": "Larvik", "kommunenummer": "3805"},
      {"kommunenavn": "Sandefjord", "kommunenummer": "3804"},
      {"kommunenavn": "Tønsberg", "kommunenummer": "3806"}
    ]
  },
  {
    "fylke_navn": "Telemark",
    "fylke_nummer": "40",
    "kommuner": [
      {"kommunenavn": "Bamble", "kommunenummer": "4003"},
      {"kommunenavn": "Drangedal", "kommunenummer": "4001"},
      {"kommunenavn": "Fyresdal", "kommunenummer": "4013"},
      {"kommunenavn": "Hjartdal", "kommunenummer": "4012"},
      {"kommunenavn": "Kragerø", "kommunenummer": "4002"},
      {"kommunenavn": "Kviteseid", "kommunenummer": "4014"},
      {"kommunenavn": "Midt-Telemark", "kommunenummer": "4007"},
      {"kommunenavn": "Nissedal", "kommunenummer": "4015"},
      {"kommunenavn": "Nome", "kommunenummer": "4011"},
      {"kommunenavn": "Notodden", "kommunenummer": "4010"},
      {"kommunenavn": "Porsgrunn", "kommunenummer": "4004"},
      {"kommunenavn": "Seljord", "kommunenummer": "4016"},
      {"kommunenavn": "Siljan", "kommunenummer": "4005"},
      {"kommunenavn": "Skien", "kommunenummer": "4006"},
      {"kommunenavn": "Tinn", "kommunenummer": "4017"},
      {"kommunenavn": "Tokke", "kommunenummer": "4018"},
      {"kommunenavn": "Vinje", "kommunenummer": "4019"}
    ]
  },
  {
    "fylke_navn": "Agder",
    "fylke_nummer": "42",
    "kommuner": [
      {"kommunenavn": "Arendal", "kommunenummer": "4203"},
      {"kommunenavn": "Birkenes", "kommunenummer": "4213"},
      {"kommunenavn": "Bygland", "kommunenummer": "4214"},
      {"kommunenavn": "Bykle", "kommunenummer": "4215"},
      {"kommunenavn": "Evje og Hornnes", "kommunenummer": "4216"},
      {"kommunenavn": "Farsund", "kommunenummer": "4217"},
      {"kommunenavn": "Flekkefjord", "kommunenummer": "4218"},
      {"kommunenavn": "Froland", "kommunenummer": "4219"},
      {"kommunenavn": "Gjerstad", "kommunenummer": "4220"},
      {"kommunenavn": "Grimstad", "kommunenummer": "4204"},
      {"kommunenavn": "Iveland", "kommunenummer": "4221"},
      {"kommunenavn": "Kristiansand", "kommunenummer": "4204"},
      {"kommunenavn": "Kvinesdal", "kommunenummer": "4222"},
      {"kommunenavn": "Lillesand", "kommunenummer": "4223"},
      {"kommunenavn": "Lindesnes", "kommunenummer": "4224"},
      {"kommunenavn": "Lyngdal", "kommunenummer": "4225"},
      {"kommunenavn": "Mandal", "kommunenummer": "4226"},
      {"kommunenavn": "Risør", "kommunenummer": "4227"},
      {"kommunenavn": "Sirdal", "kommunenummer": "4228"},
      {"kommunenavn": "Tvedestrand", "kommunenummer": "4229"},
      {"kommunenavn": "Valle", "kommunenummer": "4230"},
      {"kommunenavn": "Vegårshei", "kommunenummer": "4231"},
      {"kommunenavn": "Vennesla", "kommunenummer": "4232"},
      {"kommunenavn": "Åseral", "kommunenummer": "4233"}
    ]
  },
  {
    "fylke_navn": "Rogaland",
    "fylke_nummer": "11",
    "kommuner": [
      {"kommunenavn": "Bokn", "kommunenummer": "1160"},
      {"kommunenavn": "Eigersund", "kommunenummer": "1101"},
      {"kommunenavn": "Gjesdal", "kommunenummer": "1102"},
      {"kommunenavn": "Haugesund", "kommunenummer": "1106"},
      {"kommunenavn": "Hjelmeland", "kommunenummer": "1133"},
      {"kommunenavn": "Hå", "kommunenummer": "1119"},
      {"kommunenavn": "Karmøy", "kommunenummer": "1149"},
      {"kommunenavn": "Klepp", "kommunenummer": "1120"},
      {"kommunenavn": "Kvitsøy", "kommunenummer": "1151"},
      {"kommunenavn": "Lund", "kommunenummer": "1121"},
      {"kommunenavn": "Randaberg", "kommunenummer": "1127"},
      {"kommunenavn": "Rennesøy", "kommunenummer": "1134"},
      {"kommunenavn": "Riska", "kommunenummer": "1135"},
      {"kommunenavn": "Sandnes", "kommunenummer": "1108"},
      {"kommunenavn": "Sauda", "kommunenummer": "1136"},
      {"kommunenavn": "Sokndal", "kommunenummer": "1111"},
      {"kommunenavn": "Sola", "kommunenummer": "1124"},
      {"kommunenavn": "Stavanger", "kommunenummer": "1103"},
      {"kommunenavn": "Strand", "kommunenummer": "1130"},
      {"kommunenavn": "Suldal", "kommunenummer": "1137"},
      {"kommunenavn": "Time", "kommunenummer": "1122"},
      {"kommunenavn": "Tysvær", "kommunenummer": "1146"},
      {"kommunenavn": "Utsira", "kommunenummer": "1159"}
    ]
  },
  {
    "fylke_navn": "Vestland",
    "fylke_nummer": "46",
    "kommuner": [
      {"kommunenavn": "Alver", "kommunenummer": "4601"},
      {"kommunenavn": "Askøy", "kommunenummer": "4602"},
      {"kommunenavn": "Aurland", "kommunenummer": "4603"},
      {"kommunenavn": "Austevoll", "kommunenummer": "4604"},
      {"kommunenavn": "Bergen", "kommunenummer": "4601"},
      {"kommunenavn": "Bjørnafjorden", "kommunenummer": "4605"},
      {"kommunenavn": "Bremanger", "kommunenummer": "4606"},
      {"kommunenavn": "Etne", "kommunenummer": "4607"},
      {"kommunenavn": "Fedje", "kommunenummer": "4608"},
      {"kommunenavn": "Fitjar", "kommunenummer": "4609"},
      {"kommunenavn": "Fjaler", "kommunenummer": "4610"},
      {"kommunenavn": "Flåm", "kommunenummer": "4611"},
      {"kommunenavn": "Kvinnherad", "kommunenummer": "4612"},
      {"kommunenavn": "Kvam", "kommunenummer": "4613"},
      {"kommunenavn": "Kinn", "kommunenummer": "4614"},
      {"kommunenavn": "Lærdal", "kommunenummer": "4615"},
      {"kommunenavn": "Luster", "kommunenummer": "4616"},
      {"kommunenavn": "Masfjorden", "kommunenummer": "4617"},
      {"kommunenavn": "Modalen", "kommunenummer": "4618"},
      {"kommunenavn": "Osterøy", "kommunenummer": "4619"},
      {"kommunenavn": "Sogndal", "kommunenummer": "4620"},
      {"kommunenavn": "Solund", "kommunenummer": "4621"},
      {"kommunenavn": "Stad", "kommunenummer": "4622"},
      {"kommunenavn": "Stord", "kommunenummer": "4623"},
      {"kommunenavn": "Stryn", "kommunenummer": "4624"},
      {"kommunenavn": "Sunnfjord", "kommunenummer": "4625"},
      {"kommunenavn": "Sveio", "kommunenummer": "4626"},
      {"kommunenavn": "Tysnes", "kommunenummer": "4627"},
      {"kommunenavn": "Ullensvang", "kommunenummer": "4628"},
      {"kommunenavn": "Ulvik", "kommunenummer": "4629"},
      {"kommunenavn": "Vaksdal", "kommunenummer": "4630"},
      {"kommunenavn": "Voss", "kommunenummer": "4631"},
      {"kommunenavn": "Øygarden", "kommunenummer": "4632"}
    ]
  },
  {
    "fylke_navn": "Møre og Romsdal",
    "fylke_nummer": "15",
    "kommuner": [
      {"kommunenavn": "Aukra", "kommunenummer": "1547"},
      {"kommunenavn": "Averøy", "kommunenummer": "1554"},
      {"kommunenavn": "Fjord", "kommunenummer": "1539"},
      {"kommunenavn": "Hustadvika", "kommunenummer": "1554"},
      {"kommunenavn": "Kristiansund", "kommunenummer": "1505"},
      {"kommunenavn": "Molde", "kommunenummer": "1506"},
      {"kommunenavn": "Rauma", "kommunenummer": "1539"},
      {"kommunenavn": "Sande", "kommunenummer": "1563"},
      {"kommunenavn": "Smøla", "kommunenummer": "1573"},
      {"kommunenavn": "Stranda", "kommunenummer": "1525"},
      {"kommunenavn": "Sula", "kommunenummer": "1563"},
      {"kommunenavn": "Sunndal", "kommunenummer": "1563"},
      {"kommunenavn": "Surnadal", "kommunenummer": "1563"},
      {"kommunenavn": "Sykkylven", "kommunenummer": "1566"},
      {"kommunenavn": "Tingvoll", "kommunenummer": "1560"},
      {"kommunenavn": "Ulstein", "kommunenummer": "1516"},
      {"kommunenavn": "Vanylven", "kommunenummer": "1576"},
      {"kommunenavn": "Vestnes", "kommunenummer": "1573"},
      {"kommunenavn": "Volda", "kommunenummer": "1577"},
      {"kommunenavn": "Ørskog", "kommunenummer": "1520"},
      {"kommunenavn": "Ørsta", "kommunenummer": "1520"},
      {"kommunenavn": "Ålesund", "kommunenummer": "1507"}
    ]
  },
  {
    "fylke_navn": "Trøndelag",
    "fylke_nummer": "50",
    "kommuner": [
      {"kommunenavn": "Flatanger", "kommunenummer": "5014"},
      {"kommunenavn": "Frøya", "kommunenummer": "5006"},
      {"kommunenavn": "Grong", "kommunenummer": "5021"},
      {"kommunenavn": "Hitra", "kommunenummer": "5007"},
      {"kommunenavn": "Høylandet", "kommunenummer": "5022"},
      {"kommunenavn": "Indre Fosen", "kommunenummer": "5015"},
      {"kommunenavn": "Inderøy", "kommunenummer": "5023"},
      {"kommunenavn": "Klæbu", "kommunenummer": "5016"},
      {"kommunenavn": "Leka", "kommunenummer": "5017"},
      {"kommunenavn": "Levanger", "kommunenummer": "5025"},
      {"kommunenavn": "Lierne", "kommunenummer": "5026"},
      {"kommunenavn": "Malvik", "kommunenummer": "5018"},
      {"kommunenavn": "Melhus", "kommunenummer": "5019"},
      {"kommunenavn": "Meråker", "kommunenummer": "5027"},
      {"kommunenavn": "Midtre Gauldal", "kommunenummer": "5028"},
      {"kommunenavn": "Namsos", "kommunenummer": "5001"},
      {"kommunenavn": "Namsskogan", "kommunenummer": "5029"},
      {"kommunenavn": "Nærøysund", "kommunenummer": "5030"},
      {"kommunenavn": "Oppdal", "kommunenummer": "5031"},
      {"kommunenavn": "Orkland", "kommunenummer": "5032"},
      {"kommunenavn": "Osen", "kommunenummer": "5033"},
      {"kommunenavn": "Overhalla", "kommunenummer": "5034"},
      {"kommunenavn": "Rennebu", "kommunenummer": "5035"},
      {"kommunenavn": "Rindal", "kommunenummer": "5036"},
      {"kommunenavn": "Røros", "kommunenummer": "5037"},
      {"kommunenavn": "Selbu", "kommunenummer": "5038"},
      {"kommunenavn": "Skaun", "kommunenummer": "5039"},
      {"kommunenavn": "Snåsa", "kommunenummer": "5040"},
      {"kommunenavn": "Steinkjer", "kommunenummer": "5004"},
      {"kommunenavn": "Stjørdal", "kommunenummer": "5041"},
      {"kommunenavn": "Trondheim", "kommunenummer": "5001"},
      {"kommunenavn": "Tydal", "kommunenummer": "5042"},
      {"kommunenavn": "Verdal", "kommunenummer": "5043"},
      {"kommunenavn": "Ørland", "kommunenummer": "5044"}
    ]
  },
  {
    "fylke_navn": "Nordland",
    "fylke_nummer": "18",
    "kommuner": [
      {"kommunenavn": "Alstahaug", "kommunenummer": "1820"},
      {"kommunenavn": "Andøy", "kommunenummer": "1871"},
      {"kommunenavn": "Beiarn", "kommunenummer": "1839"},
      {"kommunenavn": "Bindal", "kommunenummer": "1811"},
      {"kommunenavn": "Bodø", "kommunenummer": "1804"},
      {"kommunenavn": "Brønnøy", "kommunenummer": "1813"},
      {"kommunenavn": "Bø", "kommunenummer": "1867"},
      {"kommunenavn": "Dønna", "kommunenummer": "1818"},
      {"kommunenavn": "Evenes", "kommunenummer": "1853"},
      {"kommunenavn": "Fauske", "kommunenummer": "1841"},
      {"kommunenavn": "Flakstad", "kommunenummer": "1859"},
      {"kommunenavn": "Gildeskål", "kommunenummer": "1838"},
      {"kommunenavn": "Grane", "kommunenummer": "1825"},
      {"kommunenavn": "Hadsel", "kommunenummer": "1866"},
      {"kommunenavn": "Hamarøy", "kommunenummer": "1875"},
      {"kommunenavn": "Hattfjelldal", "kommunenummer": "1826"},
      {"kommunenavn": "Hemnes", "kommunenummer": "1832"},
      {"kommunenavn": "Herøy", "kommunenummer": "1818"},
      {"kommunenavn": "Leirfjord", "kommunenummer": "1818"},
      {"kommunenavn": "Lurøy", "kommunenummer": "1834"},
      {"kommunenavn": "Lødingen", "kommunenummer": "1865"},
      {"kommunenavn": "Meløy", "kommunenummer": "1836"},
      {"kommunenavn": "Moskenes", "kommunenummer": "1874"},
      {"kommunenavn": "Narvik", "kommunenummer": "1806"},
      {"kommunenavn": "Nesna", "kommunenummer": "1828"},
      {"kommunenavn": "Rana", "kommunenummer": "1833"},
      {"kommunenavn": "Rødøy", "kommunenummer": "1836"},
      {"kommunenavn": "Røst", "kommunenummer": "11876"},
      {"kommunenavn": "Saltdal", "kommunenummer": "1840"},
      {"kommunenavn": "Sømna", "kommunenummer": "1812"},
      {"kommunenavn": "Sortland", "kommunenummer": "1870"},
      {"kommunenavn": "Steigen", "kommunenummer": "1848"},
      {"kommunenavn": "Sørfold", "kommunenummer": "1845"},
      {"kommunenavn": "Tjeldsund", "kommunenummer": "1851"},
      {"kommunenavn": "Træna", "kommunenummer": "1835"},
      {"kommunenavn": "Tysfjord", "kommunenummer": "1849"},
      {"kommunenavn": "Værøy", "kommunenummer": "1877"},
      {"kommunenavn": "Vefsn", "kommunenummer": "1824"},
      {"kommunenavn": "Vega", "kommunenummer": "1815"},
      {"kommunenavn": "Vestvågøy", "kommunenummer": "1860"},
      {"kommunenavn": "Vevelstad", "kommunenummer": "1816"},
      {"kommunenavn": "Øksnes", "kommunenummer": "1868"}
    ]
  },
  {
    "fylke_navn": "Troms og Finnmark",
    "fylke_nummer": "54",
    "kommuner": [
      {"kommunenavn": "Alta", "kommunenummer": "5401"},
      {"kommunenavn": "Berlevåg", "kommunenummer": "5405"},
      {"kommunenavn": "Båtsfjord", "kommunenummer": "5411"},
      {"kommunenavn": "Deatnu", "kommunenummer": "5421"},
      {"kommunenavn": "Gamvik", "kommunenummer": "5412"},
      {"kommunenavn": "Guovdageaidnu", "kommunenummer": "5422"},
      {"kommunenavn": "Hammerfest", "kommunenummer": "5402"},
      {"kommunenavn": "Hasvik", "kommunenummer": "5413"},
      {"kommunenavn": "Ibestad", "kommunenummer": "5414"},
      {"kommunenavn": "Kárášjohka", "kommunenummer": "5423"},
      {"kommunenavn": "Kvænangen", "kommunenummer": "5415"},
      {"kommunenavn": "Kvæfjord", "kommunenummer": "5416"},
      {"kommunenavn": "Lebesby", "kommunenummer": "5417"},
      {"kommunenavn": "Loppa", "kommunenummer": "5418"},
      {"kommunenavn": "Lyngen", "kommunenummer": "5419"},
      {"kommunenavn": "Måsøy", "kommunenummer": "5420"},
      {"kommunenavn": "Nordkapp", "kommunenummer": "5424"},
      {"kommunenavn": "Nordreisa", "kommunenummer": "5425"},
      {"kommunenavn": "Porsanger", "kommunenummer": "5426"},
      {"kommunenavn": "Senja", "kommunenummer": "5427"},
      {"kommunenavn": "Sør-Varanger", "kommunenummer": "5428"},
      {"kommunenavn": "Storfjord", "kommunenummer": "5429"},
      {"kommunenavn": "Tromsø", "kommunenummer": "5401"},
      {"kommunenavn": "Unjárga", "kommunenummer": "5430"},
      {"kommunenavn": "Vadsø", "kommunenummer": "5403"},
      {"kommunenavn": "Vardø", "kommunenummer": "5404"}
    ]
  }
];

// Convenience functions
export const getAllCounties = (): string[] => {
  return norwegianLocations.map(fylke => fylke.fylke_navn);
};

export const getMunicipalitiesByCounty = (county: string): Kommune[] => {
  const fylke = norwegianLocations.find(f => f.fylke_navn === county);
  return fylke ? fylke.kommuner : [];
};

export const getAllMunicipalities = (): Kommune[] => {
  return norwegianLocations.flatMap(fylke => fylke.kommuner);
};

export const getMunicipalityByName = (name: string): Kommune | undefined => {
  for (const fylke of norwegianLocations) {
    const kommune = fylke.kommuner.find(k => k.kommunenavn === name);
    if (kommune) return kommune;
  }
  return undefined;
};

export const getCountyByMunicipality = (municipalityName: string): string | undefined => {
  for (const fylke of norwegianLocations) {
    if (fylke.kommuner.some(k => k.kommunenavn === municipalityName)) {
      return fylke.fylke_navn;
    }
  }
  return undefined;
};