import { useEffect, useRef, useState } from 'react'
import Section from './Section.jsx'
import { unlock, tone } from '../lib/audio.js'

const W = 520
const H = 560
const ROWS = 5
const COLS = 8
const PX = 4
// two twinkle frames for the falling stars — 7×5 block glyphs
const STAR_A = ['...X...', '..XXX..', '.XXXXX.', '..XXX..', '...X...']
const STAR_B = ['X..X..X', '..XXX..', '.XXXXX.', '..XXX..', 'X..X..X']
const CANNON = ['...X...', '..XXX..', 'XXXXXXX', 'XXXXXXX']
const STAR_W = 7 * PX
const STAR_H = 5 * PX
const CANNON_W = 7 * PX
const CANNON_H = 4 * PX
const COL_GAP = 50
const ROW_GAP = 40
const FLEET_W = (COLS - 1) * COL_GAP + STAR_W
const SIDE = 16
const PLAYER_Y = H - 44
const BOLT_SPEED = 9
const BOMB_SPEED = 3.4
const LIVES = 3
// cool at the top, hot as they descend
const ROW_COLORS = ['#41798c', '#7fa05a', '#e3cb6e', '#e9a23b', '#d4592a']
const HIT_TONES = [523, 466, 415, 370, 330]
const BEST_KEY = 'arcade-starfall-best'

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

export default function Starfall() {
  const canvasRef = useRef(null)
  const gen = useRef(0)
  const game = useRef(null)
  const keys = useRef({ left: false, right: false })
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(readBest)
  const [message, setMessage] = useState('one bolt in the air — drag to aim, tap or space to fire')

  useEffect(() => {
    drawFrame(freshGame())
    return () => gen.current++
  }, [])

  useEffect(() => {
    if (!running) return
    const down = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.current.left = true
        e.preventDefault()
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.current.right = true
        e.preventDefault()
      } else if (e.key === ' ') {
        fire()
        e.preventDefault()
      }
    }
    const up = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = false
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      keys.current.left = false
      keys.current.right = false
    }
  }, [running])

  function freshGame() {
    const sky = []
    for (let i = 0; i < 46; i++) {
      // fixed pinprick backdrop, seeded per game
      sky.push({ x: Math.random() * W, y: Math.random() * (H - 120) })
    }
    return {
      alive: Array.from({ length: ROWS * COLS }, () => true),
      left: ROWS * COLS,
      fleetX: (W - FLEET_W) / 2,
      fleetY: 64,
      dir: 1,
      stepAcc: 0,
      stepFlip: false,
      bombAcc: 0,
      playerX: W / 2,
      targetX: W / 2,
      bolt: null,
      bombs: [],
      score: 0,
      lives: LIVES,
      wave: 1,
      pausedUntil: 0,
      last: 0,
      sky,
    }
  }

  function start() {
    unlock()
    const g = ++gen.current
    const st = freshGame()
    game.current = st
    setScore(0)
    setMessage('one bolt in the air — drag to aim, tap or space to fire')
    setRunning(true)
    requestAnimationFrame(function frame(now) {
      if (gen.current !== g) return
      step(st, now)
      drawFrame(st)
      requestAnimationFrame(frame)
    })
  }

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

  function end(st, text) {
    gen.current++
    saveBest(st.score)
    setRunning(false)
    setMessage(text)
  }

  function stop() {
    gen.current++
    game.current = null
    setRunning(false)
    setScore(0)
    setMessage('one bolt in the air — drag to aim, tap or space to fire')
    drawFrame(freshGame())
  }

  function fire() {
    const st = game.current
    if (!st || st.bolt) return
    st.bolt = { x: st.playerX, y: PLAYER_Y - 6 }
    tone(740, 0.06, 'square', 0.08)
  }

  function stepMs(st) {
    return Math.max(70, 90 + 430 * (st.left / (ROWS * COLS)) - (st.wave - 1) * 25)
  }

  function starAt(st, i) {
    const r = Math.floor(i / COLS)
    const c = i % COLS
    return { x: st.fleetX + c * COL_GAP, y: st.fleetY + r * ROW_GAP, r }
  }

  function respawnFleet(st) {
    st.alive = Array.from({ length: ROWS * COLS }, () => true)
    st.left = ROWS * COLS
    st.fleetX = (W - FLEET_W) / 2
    st.fleetY = 64 + Math.min((st.wave - 1) * 14, 56)
    st.dir = 1
    st.bombs = []
    st.bolt = null
  }

  function step(st, now) {
    const dt = st.last ? Math.min(50, now - st.last) : 16
    st.last = now

    // cannon follows drag target, keys nudge it
    if (keys.current.left) st.targetX -= 0.4 * dt
    if (keys.current.right) st.targetX += 0.4 * dt
    st.targetX = Math.max(SIDE + CANNON_W / 2, Math.min(W - SIDE - CANNON_W / 2, st.targetX))
    st.playerX = st.targetX

    if (now < st.pausedUntil) return

    // fleet marches
    st.stepAcc += dt
    if (st.stepAcc >= stepMs(st)) {
      st.stepAcc = 0
      st.stepFlip = !st.stepFlip
      tone(st.stepFlip ? 92 : 74, 0.045, 'square', 0.05)
      let minX = Infinity
      let maxX = -Infinity
      for (let i = 0; i < ROWS * COLS; i++) {
        if (!st.alive[i]) continue
        const { x } = starAt(st, i)
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x + STAR_W)
      }
      if (
        (st.dir > 0 && maxX + 12 > W - SIDE) ||
        (st.dir < 0 && minX - 12 < SIDE)
      ) {
        st.dir = -st.dir
        st.fleetY += 16
      } else {
        st.fleetX += st.dir * 12
      }
      // the fleet lands — the line is broken
      for (let i = 0; i < ROWS * COLS; i++) {
        if (!st.alive[i]) continue
        if (starAt(st, i).y + STAR_H >= PLAYER_Y) {
          tone(62, 0.55, 'sawtooth', 0.14)
          return end(st, `the line is broken · ${st.score} points — press start`)
        }
      }
    }

    // a bottom-most star drops a bomb now and then
    st.bombAcc += dt
    const bombEvery = Math.max(420, 1000 - (st.wave - 1) * 90)
    if (st.bombAcc >= bombEvery && st.bombs.length < 3) {
      st.bombAcc = 0
      const bottoms = []
      for (let c = 0; c < COLS; c++) {
        for (let r = ROWS - 1; r >= 0; r--) {
          if (st.alive[r * COLS + c]) {
            bottoms.push(r * COLS + c)
            break
          }
        }
      }
      if (bottoms.length) {
        const from = starAt(st, bottoms[Math.floor(Math.random() * bottoms.length)])
        st.bombs.push({ x: from.x + STAR_W / 2, y: from.y + STAR_H })
      }
    }

    // bolt
    if (st.bolt) {
      st.bolt.y -= BOLT_SPEED
      if (st.bolt.y < -12) st.bolt = null
    }
    if (st.bolt) {
      for (let i = 0; i < ROWS * COLS; i++) {
        if (!st.alive[i]) continue
        const s = starAt(st, i)
        if (
          st.bolt.x >= s.x &&
          st.bolt.x <= s.x + STAR_W &&
          st.bolt.y >= s.y &&
          st.bolt.y <= s.y + STAR_H
        ) {
          st.alive[i] = false
          st.left--
          st.score += (ROWS - s.r) * 10
          setScore(st.score)
          tone(HIT_TONES[s.r], 0.07)
          st.bolt = null
          if (st.left === 0) {
            st.wave++
            tone(659, 0.35)
            respawnFleet(st)
            st.pausedUntil = now + 900
          }
          break
        }
      }
    }

    // bombs fall
    for (const b of st.bombs) b.y += BOMB_SPEED
    st.bombs = st.bombs.filter((b) => b.y < H + 10)
    const px = st.playerX - CANNON_W / 2
    for (const b of st.bombs) {
      if (b.y >= PLAYER_Y && b.y <= PLAYER_Y + CANNON_H && b.x >= px && b.x <= px + CANNON_W) {
        st.lives--
        st.bombs = []
        st.bolt = null
        if (st.lives <= 0) {
          tone(62, 0.55, 'sawtooth', 0.14)
          return end(st, `the line is broken · ${st.score} points — press start`)
        }
        tone(70, 0.4, 'sawtooth', 0.12)
        st.pausedUntil = now + 700
        break
      }
    }
  }

  function drawGlyph(c, rows, x, y, color) {
    c.fillStyle = color
    for (let r = 0; r < rows.length; r++) {
      for (let col = 0; col < rows[r].length; col++) {
        if (rows[r][col] === 'X') c.fillRect(x + col * PX, y + r * PX, PX, PX)
      }
    }
  }

  function drawFrame(st) {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    c.fillStyle = '#070a12'
    c.fillRect(0, 0, W, H)

    // pinprick backdrop
    c.fillStyle = 'rgba(242,231,212,0.14)'
    for (const p of st.sky) c.fillRect(p.x, p.y, 2, 2)

    // hud
    c.textAlign = 'left'
    c.fillStyle = 'rgba(242,231,212,0.85)'
    c.font = '700 26px ui-monospace, Menlo, monospace'
    c.fillText(String(st.score).padStart(4, '0'), SIDE, 40)
    c.textAlign = 'right'
    c.fillStyle = 'rgba(242,231,212,0.6)'
    c.font = '700 18px ui-monospace, Menlo, monospace'
    c.fillText('▲'.repeat(Math.max(0, st.lives)), W - SIDE, 38)

    // the fleet
    const glyph = st.stepFlip ? STAR_B : STAR_A
    for (let i = 0; i < ROWS * COLS; i++) {
      if (!st.alive[i]) continue
      const s = starAt(st, i)
      drawGlyph(c, glyph, s.x, s.y, ROW_COLORS[s.r])
    }

    // bolt + bombs
    c.fillStyle = '#f2e7d4'
    if (st.bolt) c.fillRect(st.bolt.x - 2, st.bolt.y - 10, 4, 12)
    c.fillStyle = '#d4592a'
    for (const b of st.bombs) c.fillRect(b.x - 2, b.y, 4, 10)

    // the cannon
    drawGlyph(c, CANNON, st.playerX - CANNON_W / 2, PLAYER_Y, '#f2e7d4')
  }

  function onPointer(e) {
    const st = game.current
    if (!st) return
    const rect = canvasRef.current.getBoundingClientRect()
    st.targetX = ((e.clientX - rect.left) / rect.width) * W
  }

  return (
    <Section num="05" name="Starfall" heading="Hold the last line">
      <div className="machine-stage">
        <div className="starfall-cabinet">
          <div className="starfall-screen">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="starfall-canvas"
              aria-label="Starfall battlefield. Drag or use the arrow keys to move the cannon; tap the screen or press space to fire."
              onPointerDown={(e) => {
                unlock()
                onPointer(e)
                fire()
              }}
              onPointerMove={onPointer}
            />
            <div className="scanlines" aria-hidden="true" />
          </div>
        </div>
      </div>
      <p className="machine-note" role="status">
        {message}
      </p>
      <p className="sr-only" data-testid="starfall-score">
        score {score} · best {best}
      </p>
      <div className="machine-controls">
        <button type="button" className="btn btn-solid" onClick={start}>
          {running ? 'Restart' : '▶ Start'}
        </button>
        <button type="button" className="btn btn-outline" onClick={stop} disabled={!running}>
          ■ Stop
        </button>
      </div>
    </Section>
  )
}
