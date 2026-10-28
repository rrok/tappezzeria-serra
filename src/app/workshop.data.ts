export interface ServiceItem {
  id: string;
  category: 'epoca' | 'cappotte' | 'moto' | 'moderne' | 'nautica-arredo';
  categoryLabel: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  badge: string;
  highlights: string[];
  materials: string[];
  estimatedTime: string;
  warrantyNote: string;
}

export interface MaterialSwatch {
  id: string;
  category: 'pelle' | 'cappotte' | 'tessuti' | 'cuciture';
  name: string;
  origin: string;
  colorHex: string;
  secondaryHex?: string;
  textureType: 'grain' | 'canvas' | 'suede' | 'stitch-diamond' | 'stitch-double';
  description: string;
  bestFor: string[];
  specs: {
    spessore: string;
    resistenzaUV: string;
    autenticita: string;
  };
}

export interface RestorationProject {
  id: string;
  title: string;
  vehicle: string;
  year: string;
  category: 'epoca' | 'cappotte' | 'moto' | 'moderne';
  categoryLabel: string;
  image: string;
  beforeSummary: string;
  afterSummary: string;
  materialsUsed: string;
  hoursWorked: string;
  stitchingType: string;
  clientLocation: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  vehicleOrWork: string;
  rating: number;
  quote: string;
  highlightTag: string;
  source: string;
  verifiedWork: string;
}

export const WORKSHOP_INFO = {
  legalName: 'Tappezzeria Serra S.n.c. di Sindoni Claudio & Figlio',
  altLegalName: 'Tappezzeria Serra di Famiglia Sindoni',
  shortName: 'Tappezzeria Serra',
  tagline: 'Maestri Sellai e Tappezzieri per Auto d’Epoca, Cappotte e Moto a Bologna',
  streetAddress: 'Via Emilia Ponente, 107/A',
  postalCode: '40133',
  city: 'Bologna (BO)',
  district: 'Quartiere Borgo Panigale - Reno (Zona Santa Viola)',
  phoneDisplay: '051 382482',
  phoneHref: 'tel:+39051382482',
  email: 'tappezzeriaserra.bo@gmail.com',
  partitaIva: '03397670377',
  codiceAteco: '95.24.02 – Laboratori di tappezzeria artigianale',
  googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Tappezzeria+Serra+Via+Emilia+Ponente+107A+40133+Bologna+BO&dir_action=navigate',
  hours: [
    { days: 'Lunedì – Venerdì', morning: '08:00 – 12:30', afternoon: '14:30 – 18:30', open: true },
    { days: 'Sabato – Domenica', morning: 'Chiuso', afternoon: 'Su appuntamento per consegne', open: false }
  ],
  heritagePillars: [
    {
      number: '2+',
      label: 'Generazioni Sindoni',
      detail: 'Arte sellaia tramandata di padre in figlio in Via Emilia Ponente'
    },
    {
      number: '100%',
      label: 'Fatto a Mano a Bologna',
      detail: 'Taglio, sagomatura gommapiuma e cucitura sartoriale in bottega'
    },
    {
      number: 'ASI / FIVA',
      label: 'Restauri Fedeli',
      detail: 'Pellami, vipla, panno Lancia e tele conformi alle specifiche storiche'
    },
    {
      number: '5.0 ★',
      label: 'Reputazione Locale',
      detail: '«Il top a Bologna» secondo automobilisti, collezionisti e motoclub'
    }
  ]
};

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'auto-epoca',
    category: 'epoca',
    categoryLabel: 'Macchine d’Epoca',
    title: 'Restauro Integrale Interni Auto d’Epoca',
    subtitle: 'Selleria storica conforme ai registri ASI, FIVA e Motor Valley',
    description:
      'Ricostruiamo con rigore filologico gli abitacoli di vetture storiche italiane ed estere. Dal risanamento dei telai metallici e delle molle dei sedili alla sagomatura a mano delle imbottiture, fino al rivestimento in vera pelle pieno fiore, panno Lancia o skai d’epoca con profili (piping) e cuciture fedeli all’uscita di fabbrica.',
    image: 'images/interni-epoca.jpg',
    badge: 'Specialità Storica',
    highlights: [
      'Sedili anteriori e panchette posteriori con ricostruzione imbottiture in crine o poliuretano a densità differenziata',
      'Pannelli porta, cruscotti rivestiti in pelle, tunnel centrale e cappelliere su misura',
      'Moquette bouclé o velluto di lana bordata a mano con battitacco in gomma o pelle',
      'Conservazione della patina originale dove possibile o rifacimento totale da concorso d’eleganza'
    ],
    materials: ['Pelle Connolly / Pieno Fiore', 'Panno Lancia Originale', 'Vipla & Skai Storico', 'Moquette Lana Bouclé'],
    estimatedTime: 'Da 1 a 3 settimane (in base alla complessità dell’abitacolo)',
    warrantyNote: 'Certificazione dei materiali impiegati per omologazioni Targa Oro ASI'
  },
  {
    id: 'cappotte-cabrio',
    category: 'cappotte',
    categoryLabel: 'Cappotte & Spider',
    title: 'Cappotte per Cabriolet e Spider d’Epoca e Moderne',
    subtitle: 'Riparazione, sostituzione teli, lunotti e tensionamento telai capote',
    description:
      'La cappotta di uno spider richiede precisione millimetrica per garantire tenuta ermetica all’acqua, assenza di fruscii aerodinamici e una linea tesa ed elegante. Realizziamo e installiamo cappotte su misura o su dime originali per spider storici (Alfa Romeo, Fiat, Lancia, MG, Triumph, Porsche, Mercedes) e cabriolet contemporanee.',
    image: 'images/cappotte-cabrio.jpg',
    badge: 'Alta Precisione',
    highlights: [
      'Confezionamento e montaggio cappotte in tela impermeabile a triplo strato Sonnenland® o Mohair',
      'Sostituzione lunotto posteriore in PVC cristallo omologato (cucito o termosaldata) o cristallo',
      'Registrazione tiranteria, cavi di tensione, fasce elastiche e sostituzione guarnizioni perimetrali',
      'Realizzazione di copricappotta (tonneau cover) su misura con bottoni automatici Tenax o Loxx'
    ],
    materials: ['Tela Sonnenland® Triplo Strato', 'Mohair Inglese', 'PVC Cabrio Grana Originale', 'Cristallo flessibile anti-UV'],
    estimatedTime: '3 – 6 giorni lavorativi con collaudo tenuta idrica',
    warrantyNote: 'Cuciture con filati poliestere idrorepellenti ad alta tenacità anti-UV'
  },
  {
    id: 'selle-moto',
    category: 'moto',
    categoryLabel: 'Selle Moto & Scooter',
    title: 'Selleria Moto Artigianale, Restauro & Comfort Gel',
    subtitle: 'Partner storico dei motociclisti bolognesi e dei club Guzzisti Emiliani',
    description:
      'Che si tratti del restauro fedele della sella di una Moto Guzzi, Ducati o Vespa d’epoca, della personalizzazione Café Racer / Scrambler o della riparazione della sella del tuo scooter quotidiano, modelliamo ogni seduta sulle esigenze del pilota. Inseriamo strati in Gel medicale e Memory Foam per annullare l’indolenzimento nei lunghi viaggi.',
    image: 'images/selle-moto.jpg',
    badge: 'Convenzione Motoclub',
    highlights: [
      'Rifacimento fodere selle moto e scooter con materiali antiscivolo, idrorepellenti e resistenti al sole',
      'Modifica ergonomica: inserimento lastre in Gel poliuretanico + Memory Foam, scavo o rialzo/ribassamento seduta',
      'Trapuntature a diamante, a cannelloni termosaldato o cucito con filati a contrasto e ricami personalizzati',
      'Restauro completo selle moto d’epoca (recupero fondo in lamiera, molle, cinghia passeggero e profili cromati)'
    ],
    materials: ['Pelle Idrorepellente', 'Bielastico Tecnico Antiscivolo', 'Gel Poliuretanico HD', 'Memory Foam Alta Densità'],
    estimatedTime: '24 – 72 ore su prenotazione (anche servizio rapido per pendolari)',
    warrantyNote: 'Barriera impermeabile interna tra spugna e rivestimento per evitare infiltrazioni d’acqua'
  },
  {
    id: 'cieli-auto-moderne',
    category: 'moderne',
    categoryLabel: 'Cieli Auto & Sedili',
    title: 'Ripristino Cieli Auto Scollati, Fianchetti e Volanti',
    subtitle: 'Tetti interni «pari al nuovo» e riparazioni mirate senza sostituire l’intero sedile',
    description:
      'Con il tempo e il calore estivo, il tessuto del cielo dell’auto (imperiale) tende a scollarsi e cedere. Nella nostra bottega smontiamo il guscio, rimuoviamo completamente la vecchia gommapiuma deteriorata e applichiamo tessuti accoppiati originali con collanti poliuretanici ad altissima resistenza termica (fino a 110°C).',
    image: 'images/hero-workshop.jpg',
    badge: 'Più Richiesto a Bologna',
    highlights: [
      'Rifacimento completo cielo auto (con o senza tetto apribile) e montanti per Audi, VW, BMW, Mercedes, Alfa Romeo e tutte le marche',
      'Sostituzione parziale di fianchetti sedili usurati o strappati con ricerca del tessuto/pelle identico all’originale',
      'Ripristino imbottitura sedile guida affossata e compatibilità certificata con cuciture Airbag laterali',
      'Rivestimento pannelli portiera scollati, braccioli, cuffie leva cambio e selleria per flotte commerciali'
    ],
    materials: ['Tessuto Cielo Accoppiato 3mm', 'Colla Termoresistente 110°C', 'Vera Pelle Automotive', 'Alcantara® Originale'],
    estimatedTime: '1 – 2 giorni lavorativi per il rifacimento del cielo auto',
    warrantyNote: 'Riconsegna dell’abitacolo pulito e privo di odori di solvente, con tenuta garantita nel tempo'
  },
  {
    id: 'nautica-arredo',
    category: 'nautica-arredo',
    categoryLabel: 'Nautica, Avio & Arredo',
    title: 'Cuscineria Nautica, Aeronautica e Tappezzeria d’Arredo',
    subtitle: 'Poltrone storiche, divani in pelle e rivestimenti tecnici per imbarcazioni',
    description:
      'Fedele alle proprie radici di laboratorio di tappezzeria tradizionale bolognese, Tappezzeria Serra realizza e restaura anche poltrone di design, divani in pelle, sedie d’epoca, oltre a cuscinerie prendisole per imbarcazioni (anti-muffa e resistenti alla salsedine) e interni leggeri ignifughi per aviazione generale.',
    image: 'images/interni-epoca.jpg',
    badge: 'Sartoria su Misura',
    highlights: [
      'Rifacimento poltrone classiche, lavorazioni capitonné e divani in vera pelle o tessuti d’arredo pregiati',
      'Cuscineria nautica esterna ed interna con spugne a cellula aperta drenanti e skai marino anti-UV',
      'Sedute e pannellature per piccoli velivoli, ultraleggeri, camper e veicoli speciali d’epoca',
      'Riparazioni artigianali di cuciture, cerniere lampo ad alta tenuta e teli di copertura su misura'
    ],
    materials: ['Skai Marino Certificato UV', 'Pelle Fiore d’Arredo', 'Velluti & Tessuti Classici', 'Spugne Drenanti Dryfeel'],
    estimatedTime: 'Su preventivo personalizzato previa visione in laboratorio',
    warrantyNote: 'Sopralluogo e consulenza diretta con Claudio e Alessandro Sindoni in Via Emilia Ponente'
  }
];

export const MATERIAL_SWATCHES: MaterialSwatch[] = [
  {
    id: 'pelle-cognac',
    category: 'pelle',
    name: 'Cuoio Toscano & Nappa Pieno Fiore Cognac',
    origin: 'Concerie Italiane (Arzignano / Santa Croce)',
    colorHex: '#A85626',
    secondaryHex: '#7A3B16',
    textureType: 'grain',
    description:
      'Pelle bovina pieno fiore conciata per il settore automobilistico storico. Mano morbida, profumo autentico di selleria e resistenza superiore all’abrasione e ai raggi solari.',
    bestFor: ['Alfa Romeo & Lancia d’Epoca', 'Ferrari / Maserati Storiche', 'Poltrone di Pregio'],
    specs: {
      spessore: '1.2 – 1.4 mm',
      resistenzaUV: 'Trattamento protettivo anti-sbiadimento ISO 105',
      autenticita: 'Conforme specifiche storiche ASI / FIVA'
    }
  },
  {
    id: 'pelle-bordeaux',
    category: 'pelle',
    name: 'Pelle Storica Rosso Bordeaux (Stile Connolly)',
    origin: 'Selezione Gran Turismo Storico',
    colorHex: '#691C21',
    secondaryHex: '#471014',
    textureType: 'grain',
    description:
      'La tonalità iconica delle spider e coupé degli anni ’50 e ’60. Finitura semilucida naturale che acquista una straordinaria patina nel corso dei decenni.',
    bestFor: ['Spider Anni ’60', 'Jaguar & Roadster Inglesi', 'Interni Gran Turismo'],
    specs: {
      spessore: '1.3 mm pieno fiore',
      resistenzaUV: 'Elevata per vetture scoperte (Cabriolet)',
      autenticita: 'Grana naturale storica'
    }
  },
  {
    id: 'sonnenland-nero',
    category: 'cappotte',
    name: 'Tela Cappotta Sonnenland® Classic A5 Nero',
    origin: 'Germania – Primo Equipaggiamento OEM Cabrio',
    colorHex: '#1C1B1A',
    secondaryHex: '#33302E',
    textureType: 'canvas',
    description:
      'Il tessuto a triplo strato di riferimento mondiale per cappotte cabriolet: strato esterno in acrilico tinto in massa, membrana centrale in gomma butilica impermeabile al 100% e sottotetto interno in cotone/poliestere.',
    bestFor: ['Cappotte Spider Storiche', 'Cabriolet Tedesche e Italiane', 'Tonneau Cover'],
    specs: {
      spessore: 'Triplo strato 1.5 mm',
      resistenzaUV: 'Massima (tinto in massa, imputrescibile)',
      autenticita: 'Specifica OEM Porsche, Mercedes, Alfa Romeo'
    }
  },
  {
    id: 'sonnenland-blu',
    category: 'cappotte',
    name: 'Tela Cappotta Sonnenland® / Mohair Blu Notte',
    origin: 'Specifica Cabriolet Classiche & Moderne',
    colorHex: '#1B2838',
    secondaryHex: '#2C3E55',
    textureType: 'canvas',
    description:
      'Intensa trama intrecciata Blu Notte per vetture scoperte eleganti. Garantisce un isolamento acustico e termico nettamente superiore al vinile tradizionale.',
    bestFor: ['Spider Pininfarina', 'Cabriolet Eleganti', 'Restauri Personalizzati'],
    specs: {
      spessore: 'Triplo strato fonoassorbente',
      resistenzaUV: 'Grado 7-8 (scala blu europea)',
      autenticita: 'Idrorepellenza certificata'
    }
  },
  {
    id: 'panno-lancia',
    category: 'tessuti',
    name: 'Panno Lancia Storico & Tessuti Cielo Accoppiati',
    origin: 'Manifattura Laniera Italiana (Biella / Prato)',
    colorHex: '#4C535A',
    secondaryHex: '#687078',
    textureType: 'suede',
    description:
      'Panno in pura lana vergine riprodotto sugli antichi telai per restauri di berline e coupé Lancia, Fiat e Alfa Romeo anni ’50-’70, affiancato ai moderni tessuti accoppiati con spugna da 3mm per il rifacimento dei cieli auto.',
    bestFor: ['Lancia Aurelia, Appia, Fulvia', 'Cieli Auto (Imperiali)', 'Sedute Storiche'],
    specs: {
      spessore: '3.0 mm (con supporto spugna HD)',
      resistenzaUV: 'Stabilità termica fino a 110°C',
      autenticita: 'Trama fedele ai campionari d’epoca'
    }
  },
  {
    id: 'cucitura-diamante',
    category: 'cuciture',
    name: 'Trapuntatura a Diamante & Doppio Ago Ribattuto',
    origin: 'Esecuzione Sartoriale Famiglia Sindoni',
    colorHex: '#3A281E',
    secondaryHex: '#C9A66B',
    textureType: 'stitch-diamond',
    description:
      'Le cuciture sono la firma del maestro sellaio. Eseguiamo ribattiture a doppio ago parallelo, trapuntature a losanga/diamante per selle Café Racer e profili (piping) rivestiti a mano.',
    bestFor: ['Selle Moto Custom & Guzzi', 'Inserti Sedili Sportivi', 'Pannelli Porta su Misura'],
    specs: {
      spessore: 'Filato Serafil titolo 20 / 30',
      resistenzaUV: 'Poliestere continuo anti-strappo',
      autenticita: 'Tracciatura e cucitura eseguita a mano in bottega'
    }
  }
];

export const RESTORATION_PROJECTS: RestorationProject[] = [
  {
    id: 'proj-spider-cappotta',
    title: 'Cappotta Completa in Tela Sonnenland & Interni',
    vehicle: 'Alfa Romeo Duetto / Spider Storico',
    year: '1969',
    category: 'cappotte',
    categoryLabel: 'Cappotte & Spider',
    image: 'images/cappotte-cabrio.jpg',
    beforeSummary: 'Cappotta in vinile irrigidita dal tempo con tagli laterali, lunotto ingiallito opaco e infiltrazioni d’acqua.',
    afterSummary: 'Nuova cappotta in tela Sonnenland nera perfettamente tesa sul telaio registrato, lunotto cristallino nuovo e tenuta stagna totale.',
    materialsUsed: 'Tela Sonnenland® A5 Nera + Cristallo Flessibile 1mm + Filato Idrorepellente',
    hoursWorked: '28 ore di lavorazione artigianale',
    stitchingType: 'Doppia cucitura stagna con termonastratura interna',
    clientLocation: 'Collezionista privato – Bologna Colli'
  },
  {
    id: 'proj-epoca-sedili',
    title: 'Restauro Conservativo e Rifacimento Selleria in Pelle',
    vehicle: 'Coupé Gran Turismo Italiana d’Epoca',
    year: '1966',
    category: 'epoca',
    categoryLabel: 'Macchine d’Epoca',
    image: 'images/interni-epoca.jpg',
    beforeSummary: 'Sedili sfondati con crine polverizzato, pelle secca e strappata sulle sedute, cielo macchiato e moquette logora.',
    afterSummary: 'Ricostruzione anatomica delle sedute su molle originali, rivestimento in pelle pieno fiore Bordeaux con cadenino (piping) crema fedele all’originale.',
    materialsUsed: 'Vera Pelle Pieno Fiore Bordeaux + Cadenino Crema + Moquette Lana',
    hoursWorked: '65 ore (abitacolo completo)',
    stitchingType: 'Cannelloni orizzontali cuciti su spugna ad alta densità',
    clientLocation: 'Restauro Targa Oro ASI – Bologna'
  },
  {
    id: 'proj-sella-guzzi',
    title: 'Sella Moto Su Misura con Inserto Comfort Gel',
    vehicle: 'Moto Guzzi Storica & Custom Touring',
    year: '1978 / 2021',
    category: 'moto',
    categoryLabel: 'Selle Moto & Scooter',
    image: 'images/selle-moto.jpg',
    beforeSummary: 'Spugna originale ceduta che causava dolore dopo 40 km di guida, rivestimento scivoloso e scucito.',
    afterSummary: 'Rimodellazione ergonomica con lastra in Gel medicale e Memory Foam, rivestimento in pelle/skai tecnico bicolore con trapuntatura a diamante.',
    materialsUsed: 'Skai Bielastico Impermeabile + Inserto Gel 15mm + Memory Foam',
    hoursWorked: '9 ore di lavorazione sellaia',
    stitchingType: 'Losanga a diamante con filato cognac ad alta tenacità',
    clientLocation: 'Club Guzzisti Emiliani – Bologna'
  },
  {
    id: 'proj-cielo-audi',
    title: 'Rifacimento Cielo Auto Scollato e Fianchetto Sedile',
    vehicle: 'Berlina / Avant Tedesca (Audi / BMW)',
    year: '2015',
    category: 'moderne',
    categoryLabel: 'Cieli & Auto Moderne',
    image: 'images/hero-workshop.jpg',
    beforeSummary: 'Tessuto del tetto interno completamente staccato e cadente sulla testa dei passeggeri; fianchetto sedile guida abraso.',
    afterSummary: 'Smontaggio imperiale, rimozione spugna deteriorata, incollaggio ad alta temperatura di nuovo tessuto accoppiato originale. Risultato «pari al nuovo».',
    materialsUsed: 'Tessuto Imperiale OEM Grigio Luce + Collante Termico 110°C',
    hoursWorked: '12 ore (consegna in giornata/48h)',
    stitchingType: 'Finitura a scomparsa OEM e cucitura certificata lato Airbag',
    clientLocation: 'Cliente Via Emilia Ponente – Bologna'
  }
];

export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Marco R.',
    vehicleOrWork: 'Rifacimento Cielo Auto Audi',
    rating: 5,
    quote: 'Hanno tappezzato il cielo scollato della mia Audi ed è tornato pari al nuovo! Lavoro pulito, preciso e riconsegna nei tempi concordati.',
    highlightTag: '«Tornato pari al nuovo!»',
    source: 'Recensione Cliente Verificata – Bologna',
    verifiedWork: 'Cielo Auto (Imperiale)'
  },
  {
    id: 'rev-2',
    author: 'Stefano G.',
    vehicleOrWork: 'Selleria e Interni Auto',
    rating: 5,
    quote: 'Il top a Bologna. Cortesi, pazienti e preparati. Puntuali. Lavoro stupendo, consigliato a chiunque cerchi veri artigiani.',
    highlightTag: '«Il top a Bologna»',
    source: 'Recensione Cliente Verificata – Bologna',
    verifiedWork: 'Tappezzeria Completa'
  },
  {
    id: 'rev-3',
    author: 'Andrea M. – Guzzisti Emiliani',
    vehicleOrWork: 'Sella Moto Guzzi & Modifica Comfort',
    rating: 5,
    quote: 'Una vera bottega artigiana di una volta in Via Emilia Ponente. Claudio e il figlio lavorano le selle moto con una maestria unica: pelle perfetta, cuciture dritte al millimetro e seduta comodissima.',
    highlightTag: '«Maestria artigiana unica»',
    source: 'Comunità Motociclisti Bologna',
    verifiedWork: 'Selleria Moto'
  },
  {
    id: 'rev-4',
    author: 'Ing. Vittorio L.',
    vehicleOrWork: 'Cappotta e Sedili Spider d’Epoca',
    rating: 5,
    quote: 'Ho affidato alla Tappezzeria Serra la cappotta e i sedili in pelle del mio spider degli anni ’60. Hanno rispettato ogni dettaglio originale dell’epoca. Professionalità d’altri tempi.',
    highlightTag: '«Fedeltà assoluta all’originale»',
    source: 'Collezionista Auto Storiche – Bologna',
    verifiedWork: 'Cappotta & Auto d’Epoca'
  }
];
