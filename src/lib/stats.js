// Utility per calcolare le statistiche giornaliere a partire dai dati reali
// (sessioni di studio + quest completate), invece di tenere uno stato
// "dailyCards" separato che nessuno aggiornava mai.

export function dateKey(d) {
  return new Date(d).toDateString()
}

export function isSameDay(d, ref = new Date()) {
  return dateKey(d) === dateKey(ref)
}

// Lunedì 00:00 della settimana di riferimento (convenzione italiana/europea).
export function startOfWeek(ref = new Date()) {
  const date = new Date(ref)
  const day = date.getDay() // 0 = domenica, 1 = lunedì, ...
  const diffToMonday = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diffToMonday)
  date.setHours(0, 0, 0, 0)
  return date
}

export function isSameWeek(d, ref = new Date()) {
  const start = startOfWeek(ref)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  const t = new Date(d).getTime()
  return t >= start.getTime() && t < end.getTime()
}

export function lastNDays(n) {
  const today = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (n - 1 - i))
    return d
  })
}

export function monthKey(d = new Date()) {
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}

// Il mese precedente rispetto alla data di riferimento — usato per il
// recap mensile, che racconta sempre il mese appena concluso.
export function previousMonthDate(ref = new Date()) {
  const d = new Date(ref)
  d.setDate(1) // evita salti di mese quando il giorno non esiste nel mese precedente
  d.setMonth(d.getMonth() - 1)
  return d
}

// Punteggio giornaliero: premia sia il tempo di studio che la costanza nel
// completare le quest. Non è una scienza esatta — è pensato per dare un
// numero unico e leggibile su cui vedere i progressi giorno per giorno.
// - fino a 90 punti per 3 ore di studio (oltre non si guadagna di più,
//   per non incentivare maratone infinite)
// - 12 punti per ogni quest completata
export function computeScore({ studyMins, questsDone }) {
  const studyPart = Math.min(studyMins, 180) * 0.5
  const questPart = questsDone * 12
  return Math.round(studyPart + questPart)
}

export function computeDayStats(day, { sessions, quests, exams }) {
  const key = dateKey(day)

  const daySessions = sessions.filter(s => dateKey(s.date) === key)
  const studySecs = daySessions.reduce((a, s) => a + (s.duration || 0), 0)
  const studyMins = Math.floor(studySecs / 60)

  const dayQuests = quests.filter(q => q.completedAt && dateKey(q.completedAt) === key)
  const questsDone = dayQuests.length

  // Minuti di studio per materia (in base all'esame collegato alla sessione)
  const bySubject = {}
  daySessions.forEach(s => {
    const exam = exams.find(e => e.id === s.examId)
    const name = exam?.name || 'Altro'
    bySubject[name] = (bySubject[name] || 0) + Math.floor((s.duration || 0) / 60)
  })

  return {
    date: new Date(day),
    key,
    studyMins,
    questsDone,
    dayQuests,
    bySubject,
    score: computeScore({ studyMins, questsDone }),
  }
}

// Statistiche del mese per il recap "wrapped". Nota onesta: non includo
// "streak migliore" o "livello" perché l'app non conserva uno storico degli
// streak passati né ha un sistema di livelli — userei numeri inventati.
// Al loro posto: giorni attivi e materia più studiata, entrambi calcolabili
// per davvero dai dati che abbiamo.
export function computeMonthStats(monthDate, { sessions, quests, exams }) {
  const key = monthKey(monthDate)
  const inMonth = (d) => monthKey(d) === key

  const monthSessions = sessions.filter(s => inMonth(s.date))
  const studyMins = Math.floor(monthSessions.reduce((a, s) => a + (s.duration || 0), 0) / 60)

  const monthQuests = quests.filter(q => q.completedAt && inMonth(q.completedAt))
  const questsDone = monthQuests.length

  const newStars = exams.filter(e => e.passed && e.passedAt && inMonth(e.passedAt))

  const activeDays = new Set([
    ...monthSessions.map(s => dateKey(s.date)),
    ...monthQuests.map(q => dateKey(q.completedAt)),
  ]).size

  const bySubject = {}
  monthSessions.forEach(s => {
    const exam = exams.find(e => e.id === s.examId)
    const name = exam?.name || 'Altro'
    bySubject[name] = (bySubject[name] || 0) + Math.floor((s.duration || 0) / 60)
  })
  const topSubjectEntry = Object.entries(bySubject).sort((a, b) => b[1] - a[1])[0] || null

  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const totalScore = Array.from({ length: daysInMonth }, (_, i) => {
    const day = new Date(monthDate.getFullYear(), monthDate.getMonth(), i + 1)
    return computeDayStats(day, { sessions, quests, exams }).score
  }).reduce((a, b) => a + b, 0)

  return {
    key,
    monthLabel: monthDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
    studyMins,
    questsDone,
    newStars,
    activeDays,
    topSubject: topSubjectEntry?.[0] || null,
    topSubjectMins: topSubjectEntry?.[1] || 0,
    totalScore,
    hasActivity: studyMins > 0 || questsDone > 0 || newStars.length > 0,
  }
}