import { useEffect, useRef, useState } from 'react'
import Section from './Section.jsx'
import { unlock, tone } from '../lib/audio.js'

const TILES = [
  { id: 'ember', freq: 392 },
  { id: 'teal', freq: 330 },
  { id: 'olive', freq: 262 },
  { id: 'plum', freq: 196 },
]

const BEST_KEY = 'arcade-handset-best'
const START_STEP = 620
const STEP_SHRINK = 18
const STEP_FLOOR = 220

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

export default function MemoryHandset() {
  const [phase, setPhase] = useState('idle') // idle | watch | turn | over
  const [lit, setLit] = useState(-1)
  const [round, setRound] = useState(0)
  const [best, setBest] = useState(readBest)
  const seq = useRef([])
  const pos = useRef(0)
  const gen = useRef(0)

  useEffect(() => () => gen.current++, [])

  function saveBest(n) {
    setBest((prev) => {
      if (n <= prev) return prev
      try {
        localStorage.setItem(BEST_KEY, String(n))
      } catch {
        // best just won't persist
      }
      return n
    })
  }

  function stepTime() {
    return Math.max(STEP_FLOOR, START_STEP - STEP_SHRINK * (seq.current.length - 1))
  }

  async function playRound(g) {
    seq.current.push(Math.floor(Math.random() * 4))
    setRound(seq.current.length)
    pos.current = 0
    setPhase('watch')
    const step = stepTime()
    await sleep(480)
    for (const i of seq.current) {
      if (gen.current !== g) return
      setLit(i)
      tone(TILES[i].freq, (step * 0.62) / 1000)
      await sleep(step * 0.62)
      if (gen.current !== g) return
      setLit(-1)
      await sleep(step * 0.38)
    }
    if (gen.current !== g) return
    setPhase('turn')
  }

  function start() {
    unlock()
    const g = ++gen.current
    seq.current = []
    playRound(g)
  }

  function stop() {
    gen.current++
    seq.current = []
    setLit(-1)
    setRound(0)
    setPhase('idle')
  }

  async function press(i) {
    if (phase !== 'turn') return
    unlock()
    const g = gen.current

    if (i !== seq.current[pos.current]) {
      const completed = seq.current.length - 1
      gen.current++
      tone(62, 0.5, 'sawtooth', 0.14)
      setLit(-1)
      setRound(completed)
      saveBest(completed)
      setPhase('over')
      return
    }

    tone(TILES[i].freq, 0.18)
    setLit(i)
    pos.current++
    await sleep(180)
    if (gen.current !== g) return
    setLit(-1)

    if (pos.current === seq.current.length) {
      saveBest(seq.current.length)
      setPhase('watch')
      await sleep(520)
      if (gen.current !== g) return
      playRound(g)
    }
  }

  const status =
    phase === 'idle'
      ? 'press start'
      : phase === 'watch'
        ? 'watch…'
        : phase === 'turn'
          ? 'your turn'
          : `game over · ${round} round${round === 1 ? '' : 's'}`

  return (
    <Section id="play" num="01" name="The memory handset" heading="Repeat after the machine">
      <div className="machine-stage">
        <div className="handset">
          <div className="handset-speaker" aria-hidden="true" />
          <div className="handset-display">
            <div className="led-row">
              <span className="led-readout">{String(round).padStart(2, '0')}</span>
              <span className="led-best">BEST {String(best).padStart(2, '0')}</span>
            </div>
            <p className="handset-status" role="status">
              {status}
            </p>
          </div>
          <div className="handset-grid">
            {TILES.map((t, i) => (
              <button
                key={t.id}
                type="button"
                className={`handset-tile tile-${t.id}${lit === i ? ' lit' : ''}`}
                aria-label={`${t.id} square`}
                onPointerDown={() => press(i)}
              />
            ))}
          </div>
          <div className="handset-buttons">
            <button type="button" className="btn btn-solid" onClick={start}>
              {phase === 'idle' ? '▶ Start' : phase === 'over' ? '▶ Restart' : 'Restart'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={stop}
              disabled={phase === 'idle' || phase === 'over'}
            >
              ■ Stop
            </button>
          </div>
          <p className="handset-etch">memory handset · model mcmlxxiii</p>
        </div>
      </div>
      <p className="machine-note">ember · teal · olive · plum — one wrong square ends the run</p>
    </Section>
  )
}
