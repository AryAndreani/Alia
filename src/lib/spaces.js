// src/lib/spaces.js
//
// Qui costruisci le "collezioni" di sfondi video per il timer di studio.
// Ogni collezione è una categoria (Natura, Caffetteria, Study With Me...)
// e appare come filtro nel selettore sfondi su schermi larghi.
//
// COME AGGIUNGERE UN VIDEO
//   1. Apri il video su YouTube.
//   2. Prendi l'ID dal link: in youtu.be/XXXXXXXXXXX o
//      youtube.com/watch?v=XXXXXXXXXXX, l'ID è la parte XXXXXXXXXXX
//      (11 caratteri, lettere/numeri/trattini).
//   3. Copia il TITOLO ESATTO e il NOME DEL CANALE così come appaiono su
//      YouTube (sotto al titolo del video). Non un titolo "che fa capire
//      il video" scritto a mano — il nome vero, per dare credito corretto
//      a chi l'ha creato ed evitare problemi.
//   4. Aggiungi una riga nell'array "videos" della collezione giusta,
//      o creane una nuova copiando la forma di quelle esistenti.
//
// Nota: non sono riuscito a recuperare titolo/canale in automatico per i
// link che mi hai mandato — YouTube blocca lo scraping delle sue pagine,
// e comunque mi avevi chiesto di non cercare online ogni video uno per
// uno. Ho estratto gli ID e li ho smistati come meglio potevo dal poco
// che si vedeva (es. "Study With Me" nel titolo), ma vanno completati a
// mano — sono segnati con TODO qui sotto.

export const SPACE_COLLECTIONS = [
  {
    id: 'study',
    label: 'Study With Me',
    icon: '🎓',
    videos: [
      {
        videoId: 'UHGYNJzuTJU',
        title: 'Study with Me / Panama City Sunrise 🌅 ',
        channel: '@SeanStudy',
      },
      {
        videoId: '_jTAxbAhBXc',
        title: 'Study with Hermione in the Gryffindor Common Room',
        channel: '@CozyAmbienceLetters',
      },
    ],
  },
  {
    id: 'nature',
    label: 'Nature',
    icon: '🌿',
    videos: [
      {
        videoId: 'BHACKCNDMW8',
        title: '3 Hours of Amazing Nature Scenery & Relaxing Music',
        channel: '@cattrumpet',
      },
      {
        videoId: 'lu-P1q_4MfQ',
        title: 'Lake at Sunrise | 🦆',
        channel: '@celinestudy',
      },
    ],
  },
  {
    id: 'library',
    label: 'Library',
    icon: '📚',
    videos: [
      {
        videoId: 'ZbyxjGE885I',
        title: 'Jazz at the Library 📚',
        channel: '@ChillCrossingHour',
      },
      {
        videoId: 'CHFif_y2TyM',
        title: 'Royal library',
        channel: '@NewBliss',
      },
    ],
  },
  {
    id: 'rain',
    label: 'Rain',
    icon: '🌧️',
    videos: [
      {
        videoId: 'pmR04sf6FkA',
        title: 'London Big Ben View Rain Study Ambience',
        channel: '@COSMICRESORT',
      },
      {
        videoId: 'Mfo-6vXX84c',
        title: 'New York City Study Room Ambience – Rain, Traffic & Thunder Sounds',
        channel: '@COSMICRESORT',
      },
      {
        videoId: 'EHNdBT08eVQ',
        title: 'Relaxing Evening Fall Rain In New York City🍂🌧️',
        channel: '@CalmElegance',
      },
    ],
  },
  {
    id: 'city',
    label: 'City',
    icon: '🏙️',
    videos: [
      {
        videoId: 'sXJLT3kYdhk',
        title: "London's City Ambience: ASMR Traffic Soundscape & 4K HDR Video",
        channel: '@ExperiencingLondon',
      },
      {
        videoId: '3oWtQLRN_Zc',
        title: "NYC Traffic Sounds at Night | 3 Hours of City Ambience with Sirens & Cars |",
        channel: '@FootstepsToNowhere',
      },
      {
        videoId: 'ObHHw_o9iGU',
        title: "Paris Balcony Jazz at Night ",
        channel: '@SweetJazzMusic888',
      },
      {
        videoId: 'ySmjheVxYc4',
        title: "London Colorful Sunrise 🌅",
        channel: '@SeanStudy',
      },
    ],
  },
  {
    id: 'fantasy',
    label: 'Fantasy',
    icon: '🧙',
    videos: [
      {
        videoId: 'rIJnibg41R8',
        title: 'fourth wing reading ambience',
        channel: '@throughthepagesambience',
      },
      {
        videoId: 'QLrlWJwtzbA',
        title: 'Winter at Hogwarts Ambience ✧˖°',
        channel: '@INNERACADEMIA',
      },
      {
        videoId: 'XmoB1gxv2_A',
        title: 'Study In Gryffindor Common Room✨',
        channel: '@RainRiderAmbience',
      },
      {
        videoId: 'wra4tQS3fXk',
        title: 'Hogwarts Library | Rainy Study Ambience 🌧️🔥',
        channel: '@EspritAura',
      },
    ],
  },
  {
    id: 'space',
    label: 'Space',
    icon: '🪐',
    videos: [
      {
        videoId: '-YUYLbjl7Sk',
        title: '✨ Space Ambient Music. Space Deep Relaxation',
        channel: '@RelaxationMeditationMusic',
      },
      {
        videoId: 'gCWaRhNUvfc',
        title: 'Space Ambient Music ★ Pure Cosmic Relaxation',
        channel: '@RelaxationMeditationMusic',
      },
    ],
  },
  /*
  {
    // Collezione "di appoggio" — qui ci sono i video che mi hai mandato e
    // che non sono riuscito a identificare in automatico. Aprili uno per
    // uno, copia titolo/canale reali, e spostali nella collezione giusta
    // (o lasciali qui se preferisci tenerli in una categoria unica).
    id: 'todo',
    label: 'Da sistemare',
    icon: '🗂️',
    videos: [
      //{ videoId: 'pmR04sf6FkA', title: 'TODO: incolla qui il titolo esatto da YouTube', channel: 'TODO: incolla qui il canale' },
    
    ],
  },
  */
]