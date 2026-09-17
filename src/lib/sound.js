// Piccoli chime generati via Web Audio API — niente file audio da scaricare
// o pesare nel bundle. Due note ascendenti quando si torna a studiare, due
// discendenti e più morbide quando inizia la pausa: bastano a capire il
// cambio senza guardare lo schermo.

let ctx = null

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(c, freq, start, duration, peak = 0.18) {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, c.currentTime + start)
  gain.gain.linearRampToValueAtTime(peak, c.currentTime + start + 0.04)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(c.currentTime + start)
  osc.stop(c.currentTime + start + duration + 0.05)
}

// Chiamare una volta durante un gesto dell'utente (es. tap su "Inizia
// sessione") — i browser bloccano l'audio finché non c'è un'interazione.
export function primeAudio() {
  try { getCtx() } catch { /* pazienza, niente audio */ }
}

export function playWorkChime() {
  try {
    const c = getCtx()
    if (!c) return
    tone(c, 523.25, 0, 0.22)    // C5
    tone(c, 783.99, 0.14, 0.3) // G5
  } catch { /* audio non disponibile */ }
}

export function playBreakChime() {
  try {
    const c = getCtx()
    if (!c) return
    tone(c, 659.25, 0, 0.22)    // E5
    tone(c, 440.0, 0.14, 0.34) // A4
  } catch { /* audio non disponibile */ }
}
