// One AudioContext for the whole page. Square-wave bleeps, one master switch.

const STORAGE_KEY = 'arcade-sound'

let ctx = null
let sound = readPref()

function readPref() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

// Create/resume the context. Must be called from a user gesture.
export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
}

export function soundOn() {
  return sound
}

export function setSound(v) {
  sound = !!v
  try {
    localStorage.setItem(STORAGE_KEY, sound ? 'on' : 'off')
  } catch {
    // preference just won't persist
  }
}

export function tone(freq, dur = 0.25, type = 'square', vol = 0.11) {
  if (!sound || !ctx || ctx.state !== 'running') return
  const t0 = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
  osc.onended = () => {
    osc.disconnect()
    gain.disconnect()
  }
}
