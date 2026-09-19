import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { lastNDays, computeDayStats } from './stats'

const AppContext = createContext(null)

const QUOTES = [
  "La costanza è il segreto di ogni grande impresa.",
  "Ogni stella nel tuo cielo è una prova superata.",
  "Non serve sapere tutto. Serve mostrare quello che sai.",
  "Il genio è 1% ispirazione e 99% sudore.",
  "Studia non per l'esame, ma per la persona che diventerai.",
  "Ogni giorno è un mattone. Stai costruendo qualcosa di grande.",
  "La mente che si apre a una nuova idea non torna mai alla dimensione precedente.",
  "Hai già superato cose più difficili di questa.",
]

const DEFAULTS = {
  onboarded: false,
  privacyAccepted: false,
  profile: { name: '', university: '', course: '', startYear: new Date().getFullYear() },
  exams: [],
  sessions: [],
  quests: [],
  goals: [],
  dailyCards: [],
  streak: { count: 0, lastDate: null },
  lastRecapShown: null, // "YYYY-MM" dell'ultimo recap mensile già visto
  exploreIntroSeen: false, // ha già visto la presentazione di "Explore your sky"
  starTapHintSeen: false,  // ha già visto il suggerimento "tocca una stella"
  savedRituals: [],        // affermazioni salvate dalla Panic Room
  lastMood: null,          // { id, label, date } — ultimo check-in umore
  gratitudeEntries: [],    // "cose belle di oggi" — { id, text, createdAt }
}

function mapAuthError(code) {
  switch (code) {
    case 'auth/email-already-in-use': return 'Questa email è già registrata.'
    case 'auth/invalid-email': return 'Email non valida.'
    case 'auth/weak-password': return 'La password deve avere almeno 6 caratteri.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Email o password non corretti.'
    case 'auth/too-many-requests': return 'Troppi tentativi. Riprova più tardi.'
    default: return 'Si è verificato un errore. Riprova.'
  }
}

export function AppProvider({ children }) {
  // --- Auth state ---
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // --- App data (sincronizzato su Firestore) ---
  const [onboarded, setOnboarded] = useState(DEFAULTS.onboarded)
  const [privacyAccepted, setPrivacyAccepted] = useState(DEFAULTS.privacyAccepted)
  const [profile, setProfile] = useState(DEFAULTS.profile)
  const [exams, setExams] = useState(DEFAULTS.exams)
  const [sessions, setSessions] = useState(DEFAULTS.sessions)
  const [quests, setQuests] = useState(DEFAULTS.quests)
  const [goals, setGoals] = useState(DEFAULTS.goals)
  const [dailyCards, setDailyCards] = useState(DEFAULTS.dailyCards)
  const [streak, setStreak] = useState(DEFAULTS.streak)
  const [lastRecapShown, setLastRecapShown] = useState(DEFAULTS.lastRecapShown)
  const [exploreIntroSeen, setExploreIntroSeen] = useState(DEFAULTS.exploreIntroSeen)
  const [starTapHintSeen, setStarTapHintSeen] = useState(DEFAULTS.starTapHintSeen)
  const [savedRituals, setSavedRituals] = useState(DEFAULTS.savedRituals)
  const [lastMood, setLastMood] = useState(DEFAULTS.lastMood)
  const [gratitudeEntries, setGratitudeEntries] = useState(DEFAULTS.gratitudeEntries)

  const hydrated = useRef(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      hydrated.current = false
      setUser(fbUser)
      setAuthLoading(false)

      if (!fbUser) {
        setOnboarded(DEFAULTS.onboarded)
        setPrivacyAccepted(DEFAULTS.privacyAccepted)
        setProfile(DEFAULTS.profile)
        setExams(DEFAULTS.exams)
        setSessions(DEFAULTS.sessions)
        setQuests(DEFAULTS.quests)
        setGoals(DEFAULTS.goals)
        setDailyCards(DEFAULTS.dailyCards)
        setStreak(DEFAULTS.streak)
        setLastRecapShown(DEFAULTS.lastRecapShown)
        setExploreIntroSeen(DEFAULTS.exploreIntroSeen)
        setStarTapHintSeen(DEFAULTS.starTapHintSeen)
        setSavedRituals(DEFAULTS.savedRituals)
        setLastMood(DEFAULTS.lastMood)
        setGratitudeEntries(DEFAULTS.gratitudeEntries)
        return
      }

      setDataLoading(true)
      try {
        const ref = doc(db, 'users', fbUser.uid)
        const snap = await getDoc(ref)

        if (snap.exists()) {
          const data = snap.data()
          setOnboarded(data.onboarded ?? DEFAULTS.onboarded)
          setPrivacyAccepted(data.privacyAccepted ?? DEFAULTS.privacyAccepted)
          setProfile(data.profile ?? DEFAULTS.profile)
          setExams(data.exams ?? DEFAULTS.exams)
          setSessions(data.sessions ?? DEFAULTS.sessions)
          setQuests(data.quests ?? DEFAULTS.quests)
          setGoals(data.goals ?? DEFAULTS.goals)
          setDailyCards(data.dailyCards ?? DEFAULTS.dailyCards)
          setStreak(data.streak ?? DEFAULTS.streak)
          setLastRecapShown(data.lastRecapShown ?? DEFAULTS.lastRecapShown)
          setExploreIntroSeen(data.exploreIntroSeen ?? DEFAULTS.exploreIntroSeen)
          setStarTapHintSeen(data.starTapHintSeen ?? DEFAULTS.starTapHintSeen)
          setSavedRituals(data.savedRituals ?? DEFAULTS.savedRituals)
          setLastMood(data.lastMood ?? DEFAULTS.lastMood)
          setGratitudeEntries(data.gratitudeEntries ?? DEFAULTS.gratitudeEntries)
        } else {
          await setDoc(ref, DEFAULTS)
          setOnboarded(DEFAULTS.onboarded)
          setPrivacyAccepted(DEFAULTS.privacyAccepted)
          setProfile(DEFAULTS.profile)
          setExams(DEFAULTS.exams)
          setSessions(DEFAULTS.sessions)
          setQuests(DEFAULTS.quests)
          setGoals(DEFAULTS.goals)
          setDailyCards(DEFAULTS.dailyCards)
          setStreak(DEFAULTS.streak)
          setLastRecapShown(DEFAULTS.lastRecapShown)
          setExploreIntroSeen(DEFAULTS.exploreIntroSeen)
          setStarTapHintSeen(DEFAULTS.starTapHintSeen)
          setSavedRituals(DEFAULTS.savedRituals)
          setLastMood(DEFAULTS.lastMood)
          setGratitudeEntries(DEFAULTS.gratitudeEntries)
        }
      } catch (err) {
        console.error('Errore nel caricamento dati da Firestore:', err)
      } finally {
        hydrated.current = true
        setDataLoading(false)
      }
    })
    return unsub
  }, [])

  const syncField = useCallback((field, value) => {
    if (!user || !hydrated.current) return
    setDoc(doc(db, 'users', user.uid), { [field]: value }, { merge: true }).catch(err => {
      console.error(`Errore nel salvataggio di "${field}":`, err)
    })
  }, [user])

  useEffect(() => { syncField('onboarded', onboarded) }, [onboarded, syncField])
  useEffect(() => { syncField('privacyAccepted', privacyAccepted) }, [privacyAccepted, syncField])
  useEffect(() => { syncField('profile', profile) }, [profile, syncField])
  useEffect(() => { syncField('exams', exams) }, [exams, syncField])
  useEffect(() => { syncField('sessions', sessions) }, [sessions, syncField])
  useEffect(() => { syncField('quests', quests) }, [quests, syncField])
  useEffect(() => { syncField('goals', goals) }, [goals, syncField])
  useEffect(() => { syncField('dailyCards', dailyCards) }, [dailyCards, syncField])
  useEffect(() => { syncField('streak', streak) }, [streak, syncField])
  useEffect(() => { syncField('lastRecapShown', lastRecapShown) }, [lastRecapShown, syncField])
  useEffect(() => { syncField('savedRituals', savedRituals) }, [savedRituals, syncField])
  useEffect(() => { syncField('lastMood', lastMood) }, [lastMood, syncField])
  useEffect(() => { syncField('gratitudeEntries', gratitudeEntries) }, [gratitudeEntries, syncField])
  useEffect(() => { syncField('exploreIntroSeen', exploreIntroSeen) }, [exploreIntroSeen, syncField])
  useEffect(() => { syncField('starTapHintSeen', starTapHintSeen) }, [starTapHintSeen, syncField])

  // --- Azioni di autenticazione ---
  const signUp = useCallback(async (email, password) => {
    setAuthError('')
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setAuthError(mapAuthError(err.code))
      throw err
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    setAuthError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setAuthError(mapAuthError(err.code))
      throw err
    }
  }, [])

  const logOut = useCallback(async () => {
    await signOut(auth)
  }, [])

  // Update streak on new session
  const addSession = useCallback((examId, durationSeconds) => {
    const now = new Date()
    const today = now.toDateString()
    setSessions(s => [...s, { id: crypto.randomUUID(), examId, duration: durationSeconds, date: now.toISOString() }])
    setStreak(prev => {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      if (prev.lastDate === today) return prev
      if (prev.lastDate === yesterday.toDateString()) return { count: prev.count + 1, lastDate: today }
      return { count: 1, lastDate: today }
    })
  }, [])

  const passExam = useCallback((examId, grade, passedAt = new Date().toISOString()) => {
    setExams(prev => prev.map(e => e.id === examId ? { ...e, passed: true, grade, passedAt } : e))
  }, [])

  // Per correggere voto o data di un esame già registrato come passato.
  const updateExam = useCallback((examId, patch) => {
    setExams(prev => prev.map(e => e.id === examId ? { ...e, ...patch } : e))
  }, [])

  const addExam = useCallback((exam) => {
    setExams(prev => [...prev, { id: crypto.randomUUID(), passed: false, grade: null, passedAt: null, ...exam }])
  }, [])

  // --- Quest giornaliere, con materia collegata e data di completamento.
  // La pulizia automatica scarta solo quelle GIÀ COMPLETATE più vecchie
  // della soglia — una quest non fatta non viene mai eliminata da sola,
  // deve restare finché l'utente non la completa (o la cancella a mano).
  // Serve solo a non far crescere il documento Firestore all'infinito con
  // il tempo (le statistiche degli ultimi 7 giorni restano comunque intatte).
  const QUEST_RETENTION_MS = 30 * 24 * 60 * 60 * 1000
  const GOAL_RETENTION_MS = 60 * 24 * 60 * 60 * 1000

  const addQuest = useCallback((text, subject = 'Generale') => {
    setQuests(prev => [
      ...prev.filter(q => !q.done || Date.now() - new Date(q.completedAt).getTime() < QUEST_RETENTION_MS),
      {
        id: crypto.randomUUID(),
        text,
        subject,
        done: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ])
  }, [])

  const toggleQuest = useCallback((id) => {
    setQuests(prev => prev.map(q => {
      if (q.id !== id) return q
      const done = !q.done
      return { ...q, done, completedAt: done ? new Date().toISOString() : null }
    }))
  }, [])

  const deleteQuest = useCallback((id) => {
    setQuests(prev => prev.filter(q => q.id !== id))
  }, [])

  // --- Goal settimanali — stessa logica delle quest, ma con orizzonte di
  // conservazione più lungo dato che il reset è settimanale, non giornaliero.
  const addGoal = useCallback((text, subject = 'Generale') => {
    setGoals(prev => [
      ...prev.filter(g => !g.done || Date.now() - new Date(g.completedAt).getTime() < GOAL_RETENTION_MS),
      {
        id: crypto.randomUUID(),
        text,
        subject,
        done: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ])
  }, [])

  const toggleGoal = useCallback((id) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== id) return g
      const done = !g.done
      return { ...g, done, completedAt: done ? new Date().toISOString() : null }
    }))
  }, [])

  const deleteGoal = useCallback((id) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }, [])

  // --- Benessere: rituali salvati, umore del giorno, cose belle di oggi ---
  const toggleSavedRitual = useCallback((text) => {
    setSavedRituals(prev => {
      const exists = prev.some(r => r.text === text)
      if (exists) return prev.filter(r => r.text !== text)
      return [...prev, { id: crypto.randomUUID(), text, savedAt: new Date().toISOString() }]
    })
  }, [])

  const setMoodToday = useCallback((id, label) => {
    setLastMood({ id, label, date: new Date().toISOString() })
  }, [])

  const addGratitude = useCallback((text) => {
    if (!text.trim()) return
    setGratitudeEntries(prev => [
      ...prev,
      { id: crypto.randomUUID(), text: text.trim(), createdAt: new Date().toISOString() },
    ])
  }, [])

  const todayQuote = QUOTES[new Date().getDay() % QUOTES.length]

  const passedExams = exams.filter(e => e.passed)
  const totalCfu = passedExams.reduce((s, e) => s + (e.cfu || 0), 0)
  const avgGrade = passedExams.length
    ? (passedExams.reduce((s, e) => s + e.grade, 0) / passedExams.length).toFixed(1)
    : null
  const totalStudySeconds = sessions.reduce((s, s2) => s + (s2.duration || 0), 0)

  // --- Statistiche giornaliere/settimanali derivate da sessioni + quest ---
  const weekStats = lastNDays(7).map(d => computeDayStats(d, { sessions, quests, exams }))
  const todayStats = weekStats[weekStats.length - 1]

  return (
    <AppContext.Provider value={{
      user, authLoading, dataLoading, authError,
      signUp, signIn, logOut,
      onboarded, setOnboarded,
      privacyAccepted, setPrivacyAccepted,
      profile, setProfile,
      exams, addExam, passExam, updateExam, setExams,
      sessions, addSession,
      quests, addQuest, toggleQuest, deleteQuest, setQuests,
      goals, addGoal, toggleGoal, deleteGoal, setGoals,
      dailyCards, setDailyCards,
      streak,
      lastRecapShown, setLastRecapShown,
      exploreIntroSeen, setExploreIntroSeen,
      starTapHintSeen, setStarTapHintSeen,
      savedRituals, toggleSavedRitual,
      lastMood, setMoodToday,
      gratitudeEntries, addGratitude,
      todayQuote,
      passedExams, totalCfu, avgGrade, totalStudySeconds,
      weekStats, todayStats,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)