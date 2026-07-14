import { useEffect, useRef, useState } from 'react'
import Section from './Section.jsx'
import { unlock, tone } from '../lib/audio.js'

const COLS = 10
const ROWS = 18
const CELL = 24
const W = COLS * CELL // 240
const H = ROWS * CELL // 432
const BEST_KEY = 'arcade-cascade-best'

// original neon colour mapping for the seven shapes
const COLORS = {
  I: '#05d9e8',
  O: '#fee440',
  T: '#ff2e97',
  S: '#05ffa1',
  Z: '#ff5f6d',
  J: '#7a5cff',
  L: '#ff7a2c',
}

// [col,row] cells per rotation, within a 4-wide box
const SHAPES = {
  I: [
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
  ],
  O: [[[1, 0], [2, 0], [1, 1], [2, 1]]],
  T: [
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [1, 2]],
    [[1, 0], [0, 1], [1, 1], [1, 2]],
  ],
  S: [
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
  ],
  Z: [
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[2, 0], [1, 1], [2, 1], [1, 2]],
  ],
  J: [
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [1, 1], [0, 2], [1, 2]],
  ],
  L: [
    [[2, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 1], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2]],
  ],
}
const TYPES = Object.keys(SHAPES)

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

export default function Cascade() {
  const canvasRef = useRef(null)
  const gen = useRef(0)
  const game = useRef(null)
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [best, setBest] = useState(readBest)
  const [message, setMessage] = useState('fit the falling blocks — full rows clear')

  useEffect(() => {
    drawFrame(freshGame())
    return () => gen.current++
  }, [])

  useEffect(() => {
    if (!running) return
    const onKey = (e) => {
      const k = e.key
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') move(-1), e.preventDefault()
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') move(1), e.preventDefault()
      else if (k === 'ArrowUp' || k === 'w' || k === 'W') rotate(), e.preventDefault()
      else if (k === 'ArrowDown' || k === 's' || k === 'S') soft(), e.preventDefault()
      else if (k === ' ') hard(), e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [running])

  function bag() {
    const b = [...TYPES]
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[b[i], b[j]] = [b[j], b[i]]
    }
    return b
  }

  function freshGame() {
    const board = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
    const st = {
      board,
      queue: bag(),
      piece: null,
      score: 0,
      lines: 0,
      level: 1,
      drops: 0,
      lastDrop: 0,
      over: false,
    }
    return st
  }

  function spawn(st) {
    if (!st.queue.length) st.queue = bag()
    const type = st.queue.shift()
    st.piece = { type, rot: 0, x: 3, y: -1 }
    if (collides(st, st.piece)) {
      st.over = true
    }
  }

  function cellsOf(piece) {
    return SHAPES[piece.type][piece.rot].map(([c, r]) => [piece.x + c, piece.y + r])
  }

  function collides(st, piece) {
    return cellsOf(piece).some(
      ([c, r]) => c < 0 || c >= COLS || r >= ROWS || (r >= 0 && st.board[r][c]),
    )
  }

  function move(dx) {
    const st = game.current
    if (!st || st.over || !st.piece) return
    const p = { ...st.piece, x: st.piece.x + dx }
    if (!collides(st, p)) {
      st.piece = p
      tone(300, 0.02, 'square', 0.03)
    }
  }

  function rotate() {
    const st = game.current
    if (!st || st.over || !st.piece) return
    const states = SHAPES[st.piece.type].length
    const rot = (st.piece.rot + 1) % states
    for (const kick of [0, -1, 1, -2, 2]) {
      const p = { ...st.piece, rot, x: st.piece.x + kick }
      if (!collides(st, p)) {
        st.piece = p
        tone(440, 0.03, 'square', 0.04)
        return
      }
    }
  }

  function soft() {
    const st = game.current
    if (!st || st.over || !st.piece) return
    const p = { ...st.piece, y: st.piece.y + 1 }
    if (!collides(st, p)) {
      st.piece = p
      st.lastDrop = performance.now()
    } else {
      lock(st)
    }
  }

  function hard() {
    const st = game.current
    if (!st || st.over || !st.piece) return
    let p = st.piece
    while (!collides(st, { ...p, y: p.y + 1 })) p = { ...p, y: p.y + 1 }
    st.piece = p
    tone(180, 0.05, 'square', 0.05)
    lock(st)
  }

  function lock(st) {
    for (const [c, r] of cellsOf(st.piece)) {
      if (r >= 0) st.board[r][c] = COLORS[st.piece.type]
    }
    st.drops++
    // clear full lines
    let cleared = 0
    for (let r = ROWS - 1; r >= 0; r--) {
      if (st.board[r].every((cell) => cell)) {
        st.board.splice(r, 1)
        st.board.unshift(Array(COLS).fill(null))
        cleared++
        r++
      }
    }
    if (cleared) {
      const pts = [0, 100, 300, 500, 800][cleared] * st.level
      st.score += pts
      st.lines += cleared
      st.level = 1 + Math.floor(st.lines / 10)
      setScore(st.score)
      setLines(st.lines)
      tone(cleared >= 4 ? 659 : 523, 0.2)
    } else {
      tone(220, 0.04, 'square', 0.04)
    }
    st.piece = null
    spawn(st)
    if (st.over) {
      gen.current++
      saveBest(st.score)
      setRunning(false)
      setMessage(`stacked out · ${st.score} points — press start`)
    }
  }

  function interval(st) {
    return Math.max(120, 720 - (st.level - 1) * 70)
  }

  function start() {
    unlock()
    const g = ++gen.current
    const st = freshGame()
    spawn(st)
    st.lastDrop = performance.now()
    game.current = st
    setScore(0)
    setLines(0)
    setMessage('fit the falling blocks — full rows clear')
    setRunning(true)
    requestAnimationFrame(function frame(now) {
      if (gen.current !== g) return
      if (!st.over && now - st.lastDrop >= interval(st)) {
        st.lastDrop = now
        const p = { ...st.piece, y: st.piece.y + 1 }
        if (!collides(st, p)) st.piece = p
        else lock(st)
      }
      drawFrame(st)
      if (!st.over) requestAnimationFrame(frame)
    })
  }

  function stop() {
    gen.current++
    game.current = null
    setRunning(false)
    setScore(0)
    setLines(0)
    setMessage('fit the falling blocks — full rows clear')
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

  function block(c, x, y, color) {
    c.fillStyle = color
    c.shadowColor = color
    c.shadowBlur = 8
    c.beginPath()
    c.roundRect(x + 1.5, y + 1.5, CELL - 3, CELL - 3, 4)
    c.fill()
    c.shadowBlur = 0
  }

  function drawFrame(st) {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    c.fillStyle = '#0a0616'
    c.fillRect(0, 0, W, H)

    // faint grid
    c.strokeStyle = 'rgba(122,92,255,0.10)'
    c.lineWidth = 1
    for (let i = 1; i < COLS; i++) {
      c.beginPath()
      c.moveTo(i * CELL + 0.5, 0)
      c.lineTo(i * CELL + 0.5, H)
      c.stroke()
    }
    for (let i = 1; i < ROWS; i++) {
      c.beginPath()
      c.moveTo(0, i * CELL + 0.5)
      c.lineTo(W, i * CELL + 0.5)
      c.stroke()
    }

    for (let r = 0; r < ROWS; r++) {
      for (let col = 0; col < COLS; col++) {
        if (st.board[r][col]) block(c, col * CELL, r * CELL, st.board[r][col])
      }
    }

    if (st.piece) {
      // ghost
      let g = st.piece
      while (!collides(st, { ...g, y: g.y + 1 })) g = { ...g, y: g.y + 1 }
      c.globalAlpha = 0.22
      for (const [col, r] of cellsOf(g)) if (r >= 0) block(c, col * CELL, r * CELL, COLORS[st.piece.type])
      c.globalAlpha = 1
      for (const [col, r] of cellsOf(st.piece))
        if (r >= 0) block(c, col * CELL, r * CELL, COLORS[st.piece.type])
    }

    // hud
    c.textAlign = 'left'
    c.fillStyle = '#05d9e8'
    c.font = '700 14px ui-monospace, Menlo, monospace'
    c.fillText(String(st.score).padStart(5, '0'), 6, 16)
    c.textAlign = 'right'
    c.fillStyle = '#ff2e97'
    c.fillText(`L${st.level}`, W - 6, 16)
  }

  return (
    <Section num="04" name="Cascade" heading="Fit the falling blocks">
      <div className="machine-stage">
        <div className="neon-cabinet cascade-cabinet">
          <div className="neon-screen cascade-screen">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="neon-canvas"
              aria-label="Cascade — falling blocks. Move and rotate with the buttons below or the arrow keys; space to drop."
            />
            <div className="neon-scan" aria-hidden="true" />
          </div>
          <div className="cascade-pad" role="group" aria-label="Piece controls">
            <button type="button" className="neon-btn" aria-label="Move left" onPointerDown={(e) => (e.preventDefault(), unlock(), move(-1))}>
              ◀
            </button>
            <button type="button" className="neon-btn" aria-label="Rotate" onPointerDown={(e) => (e.preventDefault(), unlock(), rotate())}>
              ⟳
            </button>
            <button type="button" className="neon-btn" aria-label="Move right" onPointerDown={(e) => (e.preventDefault(), unlock(), move(1))}>
              ▶
            </button>
            <button type="button" className="neon-btn" aria-label="Soft drop" onPointerDown={(e) => (e.preventDefault(), unlock(), soft())}>
              ▼
            </button>
            <button type="button" className="neon-btn neon-btn-fire" aria-label="Hard drop" onPointerDown={(e) => (e.preventDefault(), unlock(), hard())}>
              ⤓ drop
            </button>
          </div>
        </div>
      </div>
      <p className="machine-note" role="status">
        {message}
      </p>
      <p className="sr-only" data-testid="cascade-score">
        score {score} · lines {lines} · best {best}
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
