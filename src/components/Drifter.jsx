import { useEffect, useRef, useState } from 'react'
import Section from './Section.jsx'
import { unlock, tone } from '../lib/audio.js'

const W = 520
const H = 560
const SHIP_R = 12
const TURN = 0.075
const THRUST = 0.13
const FRICTION = 0.99
const MAX_SPEED = 6
const BULLET_SPEED = 7
const BULLET_LIFE = 46
const MAX_BULLETS = 4
const LIVES = 3
const SIZES = { 3: 34, 2: 20, 1: 12 }
const SCORE = { 3: 20, 2: 50, 1: 100 }
const HIT_TONE = { 3: 196, 2: 294, 1: 392 }
const BEST_KEY = 'arcade-drifter-best'

const wrap = (v, max) => (v < 0 ? v + max : v >= max ? v - max : v)

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

function makeRock(x, y, size) {
  const r = SIZES[size]
  const n = 9 + Math.floor(Math.random() * 4)
  const verts = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const jitter = 0.65 + Math.random() * 0.5
    verts.push({ a, r: r * jitter })
  }
  const speed = (4 - size) * 0.5 + Math.random() * 0.6
  const dir = Math.random() * Math.PI * 2
  return {
    x,
    y,
    vx: Math.cos(dir) * speed,
    vy: Math.sin(dir) * speed,
    size,
    radius: r,
    verts,
    spin: (Math.random() - 0.5) * 0.04,
    rot: Math.random() * Math.PI * 2,
  }
}

export default function Drifter() {
  const canvasRef = useRef(null)
  const gen = useRef(0)
  const game = useRef(null)
  const keys = useRef({ left: false, right: false, thrust: false })
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(readBest)
  const [message, setMessage] = useState('thrust, turn, and shoot the drift — three ships')

  useEffect(() => {
    drawFrame(freshGame())
    return () => gen.current++
  }, [])

  useEffect(() => {
    if (!running) return
    const down = (e) => {
      const k = e.key
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') (keys.current.left = true), e.preventDefault()
      else if (k === 'ArrowRight' || k === 'd' || k === 'D')
        (keys.current.right = true), e.preventDefault()
      else if (k === 'ArrowUp' || k === 'w' || k === 'W')
        (keys.current.thrust = true), e.preventDefault()
      else if (k === ' ') (fire(), e.preventDefault())
    }
    const up = (e) => {
      const k = e.key
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.current.left = false
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.current.right = false
      else if (k === 'ArrowUp' || k === 'w' || k === 'W') keys.current.thrust = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      keys.current = { left: false, right: false, thrust: false }
    }
  }, [running])

  function freshGame() {
    const stars = []
    for (let i = 0; i < 60; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() < 0.2 ? 1.6 : 1 })
    }
    const st = {
      ship: { x: W / 2, y: H / 2, angle: -Math.PI / 2, vx: 0, vy: 0 },
      bullets: [],
      rocks: [],
      score: 0,
      lives: LIVES,
      wave: 1,
      invuln: 0,
      stars,
    }
    spawnWave(st)
    return st
  }

  function spawnWave(st) {
    const count = 3 + st.wave
    for (let i = 0; i < count; i++) {
      // keep new rocks away from the ship
      let x, y
      do {
        x = Math.random() * W
        y = Math.random() * H
      } while (Math.hypot(x - st.ship.x, y - st.ship.y) < 120)
      st.rocks.push(makeRock(x, y, 3))
    }
  }

  function fire() {
    const st = game.current
    if (!st || st.bullets.length >= MAX_BULLETS) return
    const s = st.ship
    st.bullets.push({
      x: s.x + Math.cos(s.angle) * (SHIP_R + 4),
      y: s.y + Math.sin(s.angle) * (SHIP_R + 4),
      vx: Math.cos(s.angle) * BULLET_SPEED + s.vx,
      vy: Math.sin(s.angle) * BULLET_SPEED + s.vy,
      life: BULLET_LIFE,
    })
    tone(660, 0.05, 'square', 0.06)
  }

  function start() {
    unlock()
    const g = ++gen.current
    const st = freshGame()
    game.current = st
    setScore(0)
    setMessage('thrust, turn, and shoot the drift — three ships')
    setRunning(true)
    requestAnimationFrame(function frame() {
      if (gen.current !== g) return
      step(st)
      drawFrame(st)
      requestAnimationFrame(frame)
    })
  }

  function stop() {
    gen.current++
    game.current = null
    setRunning(false)
    setScore(0)
    setMessage('thrust, turn, and shoot the drift — three ships')
    drawFrame(freshGame())
  }

  function saveBest(n) {
    setBest((prev) => {
      if (n <= prev) return prev
      try {
        localStorage.setItem(BEST_KEY, String(n))
      } catch {
        /* best won't persist */
      }
      return n
    })
  }

  function end(st) {
    gen.current++
    saveBest(st.score)
    setRunning(false)
    setMessage(`adrift · ${st.score} points — press start`)
  }

  function loseLife(st) {
    st.lives--
    tone(70, 0.4, 'sawtooth', 0.13)
    if (st.lives <= 0) return end(st)
    st.ship = { x: W / 2, y: H / 2, angle: -Math.PI / 2, vx: 0, vy: 0 }
    st.invuln = 120
  }

  function step(st) {
    const s = st.ship
    if (keys.current.left) s.angle -= TURN
    if (keys.current.right) s.angle += TURN
    if (keys.current.thrust) {
      s.vx += Math.cos(s.angle) * THRUST
      s.vy += Math.sin(s.angle) * THRUST
      if (Math.random() < 0.5) tone(120, 0.03, 'sawtooth', 0.03)
    }
    const sp = Math.hypot(s.vx, s.vy)
    if (sp > MAX_SPEED) {
      s.vx = (s.vx / sp) * MAX_SPEED
      s.vy = (s.vy / sp) * MAX_SPEED
    }
    s.vx *= FRICTION
    s.vy *= FRICTION
    s.x = wrap(s.x + s.vx, W)
    s.y = wrap(s.y + s.vy, H)
    if (st.invuln > 0) st.invuln--

    for (const b of st.bullets) {
      b.x = wrap(b.x + b.vx, W)
      b.y = wrap(b.y + b.vy, H)
      b.life--
    }
    st.bullets = st.bullets.filter((b) => b.life > 0)

    for (const r of st.rocks) {
      r.x = wrap(r.x + r.vx, W)
      r.y = wrap(r.y + r.vy, H)
      r.rot += r.spin
    }

    // bullet → rock
    for (let ri = st.rocks.length - 1; ri >= 0; ri--) {
      const r = st.rocks[ri]
      for (let bi = st.bullets.length - 1; bi >= 0; bi--) {
        const b = st.bullets[bi]
        if (Math.hypot(b.x - r.x, b.y - r.y) <= r.radius) {
          st.bullets.splice(bi, 1)
          st.rocks.splice(ri, 1)
          st.score += SCORE[r.size]
          setScore(st.score)
          tone(HIT_TONE[r.size], 0.08)
          if (r.size > 1) {
            st.rocks.push(makeRock(r.x, r.y, r.size - 1), makeRock(r.x, r.y, r.size - 1))
          }
          break
        }
      }
    }

    // rock → ship
    if (st.invuln === 0) {
      for (const r of st.rocks) {
        if (Math.hypot(s.x - r.x, s.y - r.y) <= r.radius + SHIP_R) {
          loseLife(st)
          break
        }
      }
    }

    if (st.rocks.length === 0) {
      st.wave++
      tone(523, 0.25)
      spawnWave(st)
    }
  }

  function drawFrame(st) {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    c.fillStyle = '#080316'
    c.fillRect(0, 0, W, H)
    c.fillStyle = 'rgba(247,240,255,0.5)'
    for (const p of st.stars) c.fillRect(p.x, p.y, p.r, p.r)

    // hud
    c.textAlign = 'left'
    c.fillStyle = '#05d9e8'
    c.font = '700 24px ui-monospace, Menlo, monospace'
    c.fillText(String(st.score).padStart(5, '0'), 16, 38)
    c.textAlign = 'right'
    c.fillStyle = '#ff2e97'
    c.font = '700 18px ui-monospace, Menlo, monospace'
    c.fillText('▲'.repeat(Math.max(0, st.lives)), W - 16, 36)

    c.lineWidth = 2
    c.lineJoin = 'round'

    // rocks
    c.strokeStyle = '#05d9e8'
    c.shadowColor = '#05d9e8'
    c.shadowBlur = 8
    for (const r of st.rocks) {
      c.beginPath()
      r.verts.forEach((v, i) => {
        const px = r.x + Math.cos(v.a + r.rot) * v.r
        const py = r.y + Math.sin(v.a + r.rot) * v.r
        i ? c.lineTo(px, py) : c.moveTo(px, py)
      })
      c.closePath()
      c.stroke()
    }

    // bullets
    c.fillStyle = '#fee440'
    c.shadowColor = '#fee440'
    for (const b of st.bullets) {
      c.beginPath()
      c.arc(b.x, b.y, 2.4, 0, Math.PI * 2)
      c.fill()
    }

    // ship (blink while invulnerable)
    if (!(st.invuln > 0 && Math.floor(st.invuln / 6) % 2)) {
      const s = st.ship
      c.strokeStyle = '#ff2e97'
      c.shadowColor = '#ff2e97'
      c.beginPath()
      const nose = { x: s.x + Math.cos(s.angle) * (SHIP_R + 4), y: s.y + Math.sin(s.angle) * (SHIP_R + 4) }
      const l = { x: s.x + Math.cos(s.angle + 2.5) * SHIP_R, y: s.y + Math.sin(s.angle + 2.5) * SHIP_R }
      const r = { x: s.x + Math.cos(s.angle - 2.5) * SHIP_R, y: s.y + Math.sin(s.angle - 2.5) * SHIP_R }
      c.moveTo(nose.x, nose.y)
      c.lineTo(l.x, l.y)
      c.lineTo(s.x - Math.cos(s.angle) * SHIP_R * 0.5, s.y - Math.sin(s.angle) * SHIP_R * 0.5)
      c.lineTo(r.x, r.y)
      c.closePath()
      c.stroke()
    }
    c.shadowBlur = 0
  }

  // hold-to-repeat touch controls
  const hold = (k, v) => () => {
    unlock()
    keys.current[k] = v
  }

  return (
    <Section id="e-play" num="01" name="Drifter" heading="Thrust through the drift">
      <div className="machine-stage">
        <div className="neon-cabinet drifter-cabinet">
          <div className="neon-screen">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="neon-canvas"
              aria-label="Drifter — a ship among drifting rocks. Turn, thrust, and fire with the controls below or the arrow keys and space."
            />
            <div className="neon-scan" aria-hidden="true" />
          </div>
          <div className="drifter-pad" role="group" aria-label="Ship controls">
            <button
              type="button"
              className="neon-btn"
              aria-label="Rotate left"
              onPointerDown={hold('left', true)}
              onPointerUp={hold('left', false)}
              onPointerLeave={hold('left', false)}
              onPointerCancel={hold('left', false)}
            >
              ⟲
            </button>
            <button
              type="button"
              className="neon-btn"
              aria-label="Thrust"
              onPointerDown={hold('thrust', true)}
              onPointerUp={hold('thrust', false)}
              onPointerLeave={hold('thrust', false)}
              onPointerCancel={hold('thrust', false)}
            >
              ▲
            </button>
            <button
              type="button"
              className="neon-btn"
              aria-label="Rotate right"
              onPointerDown={hold('right', true)}
              onPointerUp={hold('right', false)}
              onPointerLeave={hold('right', false)}
              onPointerCancel={hold('right', false)}
            >
              ⟳
            </button>
            <button
              type="button"
              className="neon-btn neon-btn-fire"
              aria-label="Fire"
              onPointerDown={(e) => {
                e.preventDefault()
                unlock()
                fire()
              }}
            >
              ● fire
            </button>
          </div>
        </div>
      </div>
      <p className="machine-note" role="status">
        {message}
      </p>
      <p className="sr-only" data-testid="drifter-score">
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
