import { useEffect, useRef, useState } from 'react'
import Section from './Section.jsx'
import { unlock, tone } from '../lib/audio.js'

const GRID = 17
const CANVAS = 340
const CELL = CANVAS / GRID
const START_TICK = 160
const TICK_SHRINK = 4
const TICK_FLOOR = 70
const BEST_KEY = 'arcade-trail-best'

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}
const KEYMAP = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
}

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

export default function Trail() {
  const canvasRef = useRef(null)
  const gen = useRef(0)
  const game = useRef(null)
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(readBest)
  const [dead, setDead] = useState(false)

  useEffect(() => {
    drawFrame(freshGame())
    return () => gen.current++
  }, [])

  useEffect(() => {
    if (!running) return
    const onKey = (e) => {
      const dir = KEYMAP[e.key]
      if (!dir) return
      e.preventDefault()
      steer(dir)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [running])

  function freshGame() {
    const mid = Math.floor(GRID / 2)
    const st = {
      trail: [
        { x: mid - 2, y: mid },
        { x: mid - 1, y: mid },
        { x: mid, y: mid },
      ],
      dir: 'right',
      nextDir: 'right',
      score: 0,
      pickup: null,
    }
    st.pickup = placePickup(st)
    return st
  }

  function placePickup(st) {
    while (true) {
      const p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }
      if (!st.trail.some((c) => c.x === p.x && c.y === p.y)) return p
    }
  }

  function steer(dir) {
    const st = game.current
    if (!st) return
    const cur = DIRS[st.dir]
    const next = DIRS[dir]
    if (cur.x + next.x === 0 && cur.y + next.y === 0) return // no reversing
    st.nextDir = dir
  }

  function start() {
    unlock()
    const g = ++gen.current
    const st = freshGame()
    game.current = st
    setScore(0)
    setDead(false)
    setRunning(true)
    drawFrame(st)
    const tick = () => {
      if (gen.current !== g) return
      step(st)
      if (gen.current !== g) return
      drawFrame(st)
      setTimeout(tick, Math.max(TICK_FLOOR, START_TICK - TICK_SHRINK * st.score))
    }
    setTimeout(tick, START_TICK)
  }

  function die(st) {
    gen.current++
    tone(70, 0.5, 'sawtooth', 0.14)
    setRunning(false)
    setDead(true)
    setBest((prev) => {
      if (st.score <= prev) return prev
      try {
        localStorage.setItem(BEST_KEY, String(st.score))
      } catch {
        // best just won't persist
      }
      return st.score
    })
  }

  function step(st) {
    st.dir = st.nextDir
    const d = DIRS[st.dir]
    const head = st.trail[st.trail.length - 1]
    const nx = head.x + d.x
    const ny = head.y + d.y

    if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) return die(st)

    const eats = st.pickup && nx === st.pickup.x && ny === st.pickup.y
    const body = eats ? st.trail : st.trail.slice(1)
    if (body.some((c) => c.x === nx && c.y === ny)) return die(st)

    st.trail.push({ x: nx, y: ny })
    if (eats) {
      st.score++
      setScore(st.score)
      tone(392 + st.score * 16, 0.09)
      st.pickup = placePickup(st)
    } else {
      st.trail.shift()
    }
  }

  function drawFrame(st) {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    c.fillStyle = '#06110a'
    c.fillRect(0, 0, CANVAS, CANVAS)

    c.strokeStyle = 'rgba(127,240,160,0.08)'
    c.lineWidth = 1
    for (let i = 1; i < GRID; i++) {
      c.beginPath()
      c.moveTo(i * CELL + 0.5, 0)
      c.lineTo(i * CELL + 0.5, CANVAS)
      c.stroke()
      c.beginPath()
      c.moveTo(0, i * CELL + 0.5)
      c.lineTo(CANVAS, i * CELL + 0.5)
      c.stroke()
    }

    c.fillStyle = '#7ff0a0'
    for (const cell of st.trail) {
      c.fillRect(cell.x * CELL + 2, cell.y * CELL + 2, CELL - 4, CELL - 4)
    }
    if (st.pickup) {
      c.fillStyle = '#c9ffdb'
      c.fillRect(st.pickup.x * CELL + 4, st.pickup.y * CELL + 4, CELL - 8, CELL - 8)
    }

    c.fillStyle = 'rgba(201,255,219,0.8)'
    c.font = '600 12px ui-monospace, Menlo, monospace'
    c.textAlign = 'left'
    c.fillText(`SCORE ${String(st.score).padStart(3, '0')}`, 8, 16)
  }

  const note = dead
    ? `the trail ends · ${score} — press start`
    : `best · ${best} — walls are fatal`

  return (
    <Section num="04" name="Trail" heading="Don't cross your own line">
      <div className="machine-stage">
        <div className="phosphor-cabinet">
          <div className="phosphor-screen">
            <canvas
              ref={canvasRef}
              width={CANVAS}
              height={CANVAS}
              className="trail-canvas"
              aria-label="Trail grid. Steer with the arrow keys, W A S D, or the direction pad below."
            />
            <div className="scanlines" aria-hidden="true" />
          </div>
          <div className="dpad" role="group" aria-label="Direction pad">
            <span />
            <button type="button" className="dpad-btn" aria-label="Steer up" onClick={() => steer('up')}>
              ▲
            </button>
            <span />
            <button type="button" className="dpad-btn" aria-label="Steer left" onClick={() => steer('left')}>
              ◀
            </button>
            <button type="button" className="dpad-btn dpad-start" onClick={start}>
              {running ? 'reset' : 'start'}
            </button>
            <button type="button" className="dpad-btn" aria-label="Steer right" onClick={() => steer('right')}>
              ▶
            </button>
            <span />
            <button type="button" className="dpad-btn" aria-label="Steer down" onClick={() => steer('down')}>
              ▼
            </button>
            <span />
          </div>
        </div>
      </div>
      <p className="machine-note" role="status">
        {note}
      </p>
    </Section>
  )
}
