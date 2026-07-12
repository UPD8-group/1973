import { useEffect, useRef, useState } from 'react'
import Section from './Section.jsx'
import { unlock, tone } from '../lib/audio.js'

const CAVES = 12
const PRINT_MS = 240

const adjacentTo = (i) => [(i + 1) % CAVES, (i + CAVES - 1) % CAVES, (i + 6) % CAVES]

const OPENING = [
  'CAVE HUNT · MCMLXXIII',
  'twelve caves. one beast. two chasms. three arrows.',
  'press BEGIN to descend.',
]

export default function CaveHunt() {
  const [lines, setLines] = useState([])
  const [playing, setPlaying] = useState(false)
  const [mode, setMode] = useState('move')
  const [printing, setPrinting] = useState(false)
  const [view, setView] = useState({ cave: 0, exits: [], arrows: 3 })
  const world = useRef(null)
  const queue = useRef([])
  const printerBusy = useRef(false)
  const gen = useRef(0)
  const logRef = useRef(null)

  useEffect(() => {
    print(OPENING)
    return () => {
      gen.current++
      queue.current = []
      printerBusy.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  function print(newLines) {
    queue.current.push(...newLines)
    if (printerBusy.current) return
    printerBusy.current = true
    setPrinting(true)
    const g = gen.current
    const emit = () => {
      if (gen.current !== g) return
      const line = queue.current.shift()
      if (line === undefined) {
        printerBusy.current = false
        setPrinting(false)
        return
      }
      tone(1200, 0.03, 'square', 0.03)
      setLines((prev) => [...prev, line])
      setTimeout(emit, PRINT_MS)
    }
    setTimeout(emit, PRINT_MS)
  }

  function begin() {
    unlock()
    gen.current++
    queue.current = []
    printerBusy.current = false
    setLines([])
    setPrinting(false)

    const others = []
    for (let i = 1; i < CAVES; i++) others.push(i)
    others.sort(() => Math.random() - 0.5)
    const w = {
      player: 0,
      beast: others[0],
      chasms: [others[1], others[2]],
      arrows: 3,
      over: false,
    }
    world.current = w
    setPlaying(true)
    setMode('move')
    syncView(w)
    print(describeRoom(w))
  }

  function syncView(w) {
    setView({ cave: w.player, exits: adjacentTo(w.player), arrows: w.arrows })
  }

  function describeRoom(w) {
    const exits = adjacentTo(w.player)
    const out = [`you are in cave ${w.player}. tunnels lead to ${exits[0]}, ${exits[1]}, ${exits[2]}.`]
    if (exits.includes(w.beast)) out.push('something breathes in the dark.')
    if (exits.some((c) => w.chasms.includes(c))) out.push('a cold draft rises from somewhere near.')
    out.push(`arrows: ${w.arrows}.`)
    return out
  }

  function finish(w, finalLines, winTone) {
    w.over = true
    setPlaying(false)
    if (winTone) tone(659, 0.4)
    else tone(70, 0.5, 'sawtooth', 0.13)
    print([...finalLines, 'press BEGIN to descend again.'])
  }

  function act(target) {
    const w = world.current
    if (!w || w.over || printing) return
    unlock()

    if (mode === 'move') {
      if (target === w.beast) {
        return finish(w, [`you crawl into cave ${target}.`, 'the beast was waiting. it is over.'])
      }
      if (w.chasms.includes(target)) {
        return finish(w, [`you crawl into cave ${target}.`, 'the floor is not there. you fall, and fall.'])
      }
      w.player = target
      tone(262, 0.06)
      syncView(w)
      print(describeRoom(w))
      return
    }

    // shoot
    w.arrows--
    syncView(w)
    tone(880, 0.08)
    if (target === w.beast) {
      return finish(w, [`your arrow whistles into cave ${target}.`, 'a roar — then silence. THE BEAST IS SLAIN.'], true)
    }

    const out = [`your arrow whistles into cave ${target}. nothing.`]
    if (Math.random() < 0.75) {
      const moves = adjacentTo(w.beast)
      w.beast = moves[Math.floor(Math.random() * moves.length)]
      out.push('something shifts in the dark.')
      if (w.beast === w.player) {
        return finish(w, [...out, 'it shifts into your cave. it is over.'])
      }
    }
    if (w.arrows === 0) {
      return finish(w, [...out, "that was your last arrow. defenceless, you won't see morning."])
    }
    print([...out, ...describeRoom(w)])
  }

  return (
    <Section num="05" name="Cave hunt" heading="Three arrows, one beast">
      <div className="machine-stage">
        <div className="teletype">
          <p className="teletype-header">STATION 73 · TELETYPE</p>
          <div className="teletype-log" ref={logRef} role="log" aria-live="polite">
            {lines.map((l, i) => (
              <p key={i} className="teletype-line">
                {l}
              </p>
            ))}
          </div>
          <div className="teletype-controls">
            {playing ? (
              <>
                <div className="teletype-modes" role="group" aria-label="Action mode">
                  <button
                    type="button"
                    className={`tt-btn${mode === 'move' ? ' tt-active' : ''}`}
                    aria-pressed={mode === 'move'}
                    onClick={() => setMode('move')}
                  >
                    MOVE
                  </button>
                  <button
                    type="button"
                    className={`tt-btn${mode === 'shoot' ? ' tt-active' : ''}`}
                    aria-pressed={mode === 'shoot'}
                    onClick={() => setMode('shoot')}
                  >
                    SHOOT
                  </button>
                </div>
                <div className="teletype-exits" role="group" aria-label="Adjacent caves">
                  {view.exits.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="tt-btn"
                      aria-label={`${mode} — cave ${c}`}
                      onClick={() => act(c)}
                    >
                      CAVE {c}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <button type="button" className="tt-btn tt-begin" onClick={begin}>
                BEGIN ▶
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="machine-note">
        move between caves, listen for warnings, and loose an arrow when you&rsquo;re sure
      </p>
    </Section>
  )
}
