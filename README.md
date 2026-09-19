# ✦ Alia

**Alia** è una web app per studenti universitari che trasforma il percorso di laurea in una storia da vivere: ogni esame superato diventa una stella nel proprio cielo personale.

## Concept

L'idea centrale è dare un senso visivo e motivazionale al percorso di studi. Invece di una semplice lista di esami, Alia mostra una costellazione che cresce man mano che si superano gli esami, insieme a strumenti pratici per organizzare lo studio quotidiano e gestire l'ansia da esame.

## Funzionalità principali

- **Il Cielo (Home)** — Canvas animato che disegna una costellazione basata sugli esami superati (voto e CFU influenzano dimensione e luminosità della stella). Include punteggio giornaliero, streak di costanza e uno storico settimanale consultabile giorno per giorno.
- **Sessioni di studio** — Timer con modalità libera o Pomodoro (25/5 o 50/10), collegato a un esame specifico; ogni sessione alimenta le statistiche.
- **Quest Zone** — Quest giornaliere e goal settimanali, organizzabili per materia, con barra di avanzamento.
- **Panic Room** — Spazio dedicato alla gestione dell'ansia pre-esame: respirazione guidata 4-7-8, uno "scarico" per scrivere pensieri (non salvato), e una routine pre-esame in 5 step.
- **Profilo** — Gestione dati personali, elenco esami da sostenere/superati, statistiche aggregate (CFU totali, media) e logout.
- **Onboarding** — Flusso guidato alla prima apertura per impostare profilo e piano di studi.

## Stack tecnico

- **React** (con Hooks, Context API per lo stato globale)
- **Vite** come build tool
- **Firebase Authentication** — login/registrazione via email e password
- **Firebase Firestore** — sincronizzazione dei dati utente sul cloud tra dispositivi
- **Canvas 2D** — per l'animazione del cielo stellato
- CSS-in-JS (stili inline) con un design system centralizzato in `theme.js`

## Struttura del progetto

```
src/
├── App.jsx              # Shell dell'app, routing tra le schermate principali
├── main.jsx             # Entry point
├── lib/
│   ├── AppContext.jsx   # Stato globale (auth, dati utente, azioni)
│   ├── firebase.js      # Configurazione Firebase
│   ├── theme.js         # Palette colori, stili globali, keyframes
│   └── stats.js         # Calcolo statistiche giornaliere/settimanali
├── pages/
│   ├── Auth.jsx         # Login / registrazione
│   ├── Onboarding.jsx   # Setup iniziale profilo + piano di studi
│   ├── Home.jsx         # Cielo, punteggio, streak, statistiche
│   ├── QuestZone.jsx    # Quest giornaliere e goal settimanali
│   ├── PanicRoom.jsx    # Respirazione, journaling, routine pre-esame
│   └── Profile.jsx      # Profilo utente e gestione esami
└── components/
    ├── StarCanvas.jsx   # Rendering della costellazione
    ├── StudyTimer.jsx   # Timer di studio / Pomodoro
    ├── BottomNav.jsx    # Barra di navigazione inferiore
    └── UI.jsx           # Componenti UI riutilizzabili (Button, Input, Card...)
```

## Modello dati

I dati sono salvati su Firestore sotto `users/{uid}` e includono:

- `profile` — nome, università, corso, anno di inizio
- `exams` — elenco esami con CFU, stato (superato/da superare), voto
- `sessions` — sessioni di studio registrate (durata, esame collegato, data)
- `quests` / `goals` — attività giornaliere e settimanali
- `streak` — conteggio giorni consecutivi di attività

Le statistiche (punteggio giornaliero, minuti di studio, quest completate) **non sono salvate direttamente**, ma calcolate al volo da `sessions` e `quests` tramite `stats.js`.

## Lingua

L'interfaccia è interamente in italiano, pensata per studenti delle università italiane ma è in programma una completa traduzione all'inglese per renderla più accessibile.
