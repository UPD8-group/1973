import { useEffect, useRef, useState } from 'react'
import Section from './Section.jsx'
import { unlock, tone } from '../lib/audio.js'

const CELL = 24
const COLS = 15
const ROWS = 15
const W = COLS * CELL // 360
const H = ROWS * CELL // 360
const TUNNEL_ROW = 7
const LIVES = 3
const FRIGHT_FRAMES = 420
const PLAYER_SPEED = 2
const HUNTER_SPEED = 1.5
const FRIGHT_SPEED = 1
const HUNTER_STARTS = [
  { r: 7, c: 6 },
  { r: 7, c: 7 },
  { r: 7, c: 8 },
]
const PLAYER_START = { r: 13, c: 7 }
const POWER_CELLS = [
  { r: 1, c: 1 },
  { r: 1, c: 13 },
  { r: 13, c: 1 },
  { r: 13, c: 13 },
]
const HUNTER_COLORS = ['#05d9e8', '#05ffa1', '#ff5f6d']
const DIRS = [
  { dx: 0, dy: -1 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
]
const BEST_KEY = 'arcade-prowl-best'

const key = (r, c) => `${r},${c}`
const center = (i) => i * CELL + CELL / 2

function buildWalls() {
  const wall = []
  for (let r = 0; r < ROWS; r++) {
    const row = []
    for (let c = 0; c < COLS; c++) {
      const border = r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1
      row.push(border || (r % 2 === 0 && c % 2 === 0))
    }
    wall.push(row)
  }
  // central chamber
  wall[6][6] = wall[6][8] = wall[8][6] = wall[8][8] = false
  // side tunnel
  wall[TUNNEL_ROW][0] = wall[TUNNEL_ROW][COLS - 1] = false
  return wall
}

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

export default function Prowl() {
  const canvasRef = useRef(null)
  const gen = useRef(0)
  const game = useRef(null)
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(readBest)
  const [message, setMessage] = useState('clear the maze — power dots turn the sentries')

  useEffect(() => {
    drawFrame(freshGame())
    return () => gen.current++
  }, [])

  useEffect(() => {
    if (!running) return
    const map = {
      ArrowUp: 0, ArrowDown: 1, ArrowLeft: 2, ArrowRight: 3,
      w: 0, s: 1, a: 2, d: 3, W: 0, S: 1, A: 2, D: 3,
    }
    const onKey = (e) => {
      const i = map[e.key]
      if (i === undefined) return
      e.preventDefault()
      setWant(DIRS[i])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [running])

  function buildMazeCanvas(wall) {
    const mc = document.createElement('canvas')
    mc.width = W
    mc.height = H
    const c = mc.getContext('2d')
    c.fillStyle = '#0a0616'
    c.fillRect(0, 0, W, H)
    c.strokeStyle = '#7a5cff'
    c.lineWidth = 2
    c.shadowColor = '#7a5cff'
    c.shadowBlur = 6
    c.fillStyle = '#160c36'
    for (let r = 0; r < ROWS; r++) {
      for (let col = 0; col < COLS; col++) {
        if (!wall[r][col]) continue
        const x = col * CELL + 3
        const y = r * CELL + 3
        c.beginPath()
        c.roundRect(x, y, CELL - 6, CELL - 6, 5)
        c.fill()
        c.stroke()
      }
    }
    c.shadowBlur = 0
    return mc
  }

  function freshGame() {
    const wall = buildWalls()
    const pellets = new Set()
    const power = new Set(POWER_CELLS.map((p) => key(p.r, p.c)))
    const exclude = new Set([
      key(PLAYER_START.r, PLAYER_START.c),
      ...HUNTER_STARTS.map((h) => key(h.r, h.c)),
      ...power,
    ])
    for (let r = 1; r < ROWS - 1; r++) {
      for (let c = 1; c < COLS - 1; c++) {
        if (wall[r][c]) continue
        if (exclude.has(key(r, c))) continue
        pellets.add(key(r, c))
      }
    }
    return {
      wall,
      mazeCanvas: buildMazeCanvas(wall),
      pellets,
      power,
      player: { x: center(PLAYER_START.c), y: center(PLAYER_START.r), dir: null, want: null },
      hunters: HUNTER_STARTS.map((h, i) => ({
        x: center(h.c),
        y: center(h.r),
        dir: DIRS[0],
        mode: 'chase',
        color: HUNTER_COLORS[i],
      })),
      score: 0,
      lives: LIVES,
      level: 1,
      fright: 0,
      pause: 40,
      pulse: 0,
    }
  }

  function wallAt(st, r, c) {
    if (r === TUNNEL_ROW && (c < 0 || c >= COLS)) return false
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return true
    return st.wall[r][c]
  }

  function setWant(dir) {
    const st = game.current
    if (st) st.player.want = dir
  }

  function start() {
    unlock()
    const g = ++gen.current
    const st = freshGame()
    game.current = st
    setScore(0)
    setMessage('clear the maze — power dots turn the sentries')
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
    setMessage('clear the maze — power dots turn the sentries')
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

  function end(st, text) {
    gen.current++
    saveBest(st.score)
    setRunning(false)
    setMessage(text)
  }

  function resetPositions(st) {
    st.player = { x: center(PLAYER_START.c), y: center(PLAYER_START.r), dir: null, want: null }
    st.hunters.forEach((h, i) => {
      h.x = center(HUNTER_STARTS[i].c)
      h.y = center(HUNTER_STARTS[i].r)
      h.dir = DIRS[0]
      h.mode = 'chase'
    })
    st.fright = 0
    st.pause = 40
  }

  function moveEntity(st, ent, speed, decide) {
    const c = Math.round((ent.x - CELL / 2) / CELL)
    const r = Math.round((ent.y - CELL / 2) / CELL)
    const cx = center(c)
    const cy = center(r)
    if (Math.abs(ent.x - cx) < speed && Math.abs(ent.y - cy) < speed) {
      ent.x = cx
      ent.y = cy
      decide(ent, r, c)
    }
    if (ent.dir) {
      ent.x += ent.dir.dx * speed
      ent.y += ent.dir.dy * speed
      if (r === TUNNEL_ROW) {
        if (ent.x < -CELL / 2) ent.x = W + CELL / 2
        else if (ent.x > W + CELL / 2) ent.x = -CELL / 2
      }
    }
  }

  function step(st) {
    st.pulse++
    if (st.pause > 0) {
      st.pause--
      return
    }
    if (st.fright > 0) {
      st.fright--
      if (st.fright === 0) st.hunters.forEach((h) => (h.mode = 'chase'))
    }

    // player
    moveEntity(st, st.player, PLAYER_SPEED, (ent, r, c) => {
      if (ent.want && !wallAt(st, r + ent.want.dy, c + ent.want.dx)) ent.dir = ent.want
      if (ent.dir && wallAt(st, r + ent.dir.dy, c + ent.dir.dx)) ent.dir = null
      const k = key(r, c)
      if (st.pellets.has(k)) {
        st.pellets.delete(k)
        st.score += 10
        setScore(st.score)
        tone(660 + (st.pulse % 6) * 40, 0.03, 'square', 0.05)
      }
      if (st.power.has(k)) {
        st.power.delete(k)
        st.score += 50
        setScore(st.score)
        st.fright = FRIGHT_FRAMES
        st.hunters.forEach((h) => (h.mode = 'fright'))
        tone(196, 0.2, 'square', 0.08)
      }
    })

    // hunters
    for (const h of st.hunters) {
      const speed = h.mode === 'fright' ? FRIGHT_SPEED : HUNTER_SPEED
      moveEntity(st, h, speed, (ent, r, c) => {
        const opts = DIRS.filter(
          (d) =>
            !wallAt(st, r + d.dy, c + d.dx) &&
            !(ent.dir && d.dx === -ent.dir.dx && d.dy === -ent.dir.dy),
        )
        const choices = opts.length ? opts : DIRS.filter((d) => !wallAt(st, r + d.dy, c + d.dx))
        if (!choices.length) return
        if (ent.mode === 'fright') {
          ent.dir = choices[Math.floor(pseudo(st) * choices.length)]
        } else {
          let best = choices[0]
          let bestD = Infinity
          for (const d of choices) {
            const nx = center(c + d.dx)
            const ny = center(r + d.dy)
            const dist = (nx - st.player.x) ** 2 + (ny - st.player.y) ** 2
            if (dist < bestD) {
              bestD = dist
              best = d
            }
          }
          ent.dir = best
        }
      })
    }

    // collisions
    for (const h of st.hunters) {
      if (Math.hypot(h.x - st.player.x, h.y - st.player.y) < CELL * 0.7) {
        if (h.mode === 'fright') {
          h.mode = 'chase'
          const start = HUNTER_STARTS[st.hunters.indexOf(h)]
          h.x = center(start.c)
          h.y = center(start.r)
          h.dir = DIRS[0]
          st.score += 200
          setScore(st.score)
          tone(880, 0.12)
        } else {
          st.lives--
          tone(70, 0.45, 'sawtooth', 0.14)
          if (st.lives <= 0) return end(st, `caught · ${st.score} points — press start`)
          resetPositions(st)
          return
        }
      }
    }

    if (st.pellets.size === 0 && st.power.size === 0) {
      st.level++
      tone(659, 0.35)
      const fresh = freshGame()
      st.pellets = fresh.pellets
      st.power = fresh.power
      resetPositions(st)
      setMessage(`level ${st.level} — the sentries are quicker now`)
    }
  }

  // deterministic-ish wander that still varies per hunter/frame
  function pseudo(st) {
    st.seed = ((st.seed || 1) * 1103515245 + 12345) & 0x7fffffff
    return st.seed / 0x7fffffff
  }

  function drawFrame(st) {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    c.fillStyle = '#0a0616'
    c.fillRect(0, 0, W, H)
    if (st.mazeCanvas) c.drawImage(st.mazeCanvas, 0, 0)

    // pellets
    c.fillStyle = '#fee440'
    c.shadowColor = '#fee440'
    c.shadowBlur = 5
    for (const k of st.pellets) {
      const [r, col] = k.split(',').map(Number)
      c.beginPath()
      c.arc(center(col), center(r), 2.2, 0, Math.PI * 2)
      c.fill()
    }
    // power dots
    const pr = 4 + Math.sin(st.pulse * 0.2) * 1.5
    c.fillStyle = '#05ffa1'
    c.shadowColor = '#05ffa1'
    c.shadowBlur = 10
    for (const k of st.power) {
      const [r, col] = k.split(',').map(Number)
      c.beginPath()
      c.arc(center(col), center(r), pr, 0, Math.PI * 2)
      c.fill()
    }

    // player orb
    c.fillStyle = '#ff2e97'
    c.shadowColor = '#ff2e97'
    c.shadowBlur = 14
    c.beginPath()
    c.arc(st.player.x, st.player.y, CELL * 0.38, 0, Math.PI * 2)
    c.fill()

    // hunters — abstract neon sentries (diamond with an inner slit)
    for (const h of st.hunters) {
      const frightened = h.mode === 'fright'
      const flash = frightened && st.fright < 120 && Math.floor(st.fright / 12) % 2
      const col = frightened ? (flash ? '#f7f0ff' : '#3a5cff') : h.color
      c.fillStyle = col
      c.shadowColor = col
      c.shadowBlur = 12
      const s = CELL * 0.4
      c.beginPath()
      c.moveTo(h.x, h.y - s)
      c.lineTo(h.x + s, h.y)
      c.lineTo(h.x, h.y + s)
      c.lineTo(h.x - s, h.y)
      c.closePath()
      c.fill()
      c.fillStyle = '#0a0616'
      c.shadowBlur = 0
      c.fillRect(h.x - s * 0.5, h.y - 1.5, s, 3)
    }
    c.shadowBlur = 0

    // hud
    c.textAlign = 'left'
    c.fillStyle = '#05d9e8'
    c.font = '700 15px ui-monospace, Menlo, monospace'
    c.fillText(String(st.score).padStart(5, '0'), 8, H - 8)
    c.textAlign = 'right'
    c.fillStyle = '#ff2e97'
    c.fillText('◆'.repeat(Math.max(0, st.lives)), W - 8, H - 8)
  }

  const tap = (i) => (e) => {
    e.preventDefault()
    unlock()
    setWant(DIRS[i])
  }

  return (
    <Section num="03" name="Prowl" heading="Clear the maze before they corner you">
      <div className="machine-stage">
        <div className="neon-cabinet prowl-cabinet">
          <div className="neon-screen prowl-screen">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="neon-canvas"
              aria-label="Prowl — a glowing maze. Steer with the pad below or the arrow keys; eat the dots and avoid the sentries."
            />
            <div className="neon-scan" aria-hidden="true" />
          </div>
          <div className="prowl-pad" role="group" aria-label="Direction pad">
            <span />
            <button type="button" className="neon-btn" aria-label="Up" onPointerDown={tap(0)}>
              ▲
            </button>
            <span />
            <button type="button" className="neon-btn" aria-label="Left" onPointerDown={tap(2)}>
              ◀
            </button>
            <button type="button" className="neon-btn" aria-label="Down" onPointerDown={tap(1)}>
              ▼
            </button>
            <button type="button" className="neon-btn" aria-label="Right" onPointerDown={tap(3)}>
              ▶
            </button>
          </div>
        </div>
      </div>
      <p className="machine-note" role="status">
        {message}
      </p>
      <p className="sr-only" data-testid="prowl-score">
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
