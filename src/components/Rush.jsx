import { useEffect, useRef, useState } from 'react'
import Section from './Section.jsx'
import { unlock, tone } from '../lib/audio.js'

const CELL = 40
const COLS = 13
const ROWS = 14
const W = COLS * CELL // 520
const H = ROWS * CELL // 560
const LIVES = 3
const BEST_KEY = 'arcade-rush-best'

// row 0 home · 1-5 river · 6 safe · 7-11 road · 12 safe · 13 start
const RIVER_ROWS = [1, 2, 3, 4, 5]
const ROAD_ROWS = [7, 8, 9, 10, 11]
const CAR_COLORS = ['#ff2e97', '#fee440', '#05ffa1', '#ff5f6d', '#05d9e8']
const LOG_COLOR = '#7a5cff'

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

export default function Rush() {
  const canvasRef = useRef(null)
  const gen = useRef(0)
  const game = useRef(null)
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(readBest)
  const [message, setMessage] = useState('reach the top — mind the traffic and ride the logs')

  useEffect(() => {
    drawFrame(freshGame())
    return () => gen.current++
  }, [])

  useEffect(() => {
    if (!running) return
    const onKey = (e) => {
      const map = {
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
      const dir = map[e.key]
      if (!dir) return
      e.preventDefault()
      hop(dir)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [running])

  function makeLane(row, type, index) {
    const dir = index % 2 === 0 ? 1 : -1
    const len = type === 'river' ? (2 + (index % 2)) * CELL : (index % 2 ? 2 : 1.6) * CELL
    const count = type === 'river' ? 3 : 2 + (index % 2)
    const speed = (type === 'river' ? 0.7 : 0.9) + index * 0.18
    const spacing = (W + len) / count
    const entities = []
    for (let i = 0; i < count; i++) {
      entities.push({ x: i * spacing + Math.random() * 40 })
    }
    return {
      row,
      type,
      dir,
      len,
      speed,
      entities,
      color: type === 'river' ? LOG_COLOR : CAR_COLORS[(row + index) % CAR_COLORS.length],
    }
  }

  function freshGame() {
    const lanes = []
    RIVER_ROWS.forEach((row, i) => lanes.push(makeLane(row, 'river', i)))
    ROAD_ROWS.forEach((row, i) => lanes.push(makeLane(row, 'road', i)))
    return {
      lanes,
      player: { x: W / 2, row: ROWS - 1 },
      score: 0,
      lives: LIVES,
      boost: 1,
      dead: false,
    }
  }

  function laneAt(st, row) {
    return st.lanes.find((l) => l.row === row)
  }

  function start() {
    unlock()
    const g = ++gen.current
    const st = freshGame()
    game.current = st
    setScore(0)
    setMessage('reach the top — mind the traffic and ride the logs')
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
    setMessage('reach the top — mind the traffic and ride the logs')
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
    setMessage(`clipped · ${st.score} across — press start`)
  }

  function die(st) {
    st.lives--
    tone(70, 0.4, 'sawtooth', 0.13)
    if (st.lives <= 0) return end(st)
    st.player = { x: W / 2, row: ROWS - 1 }
  }

  function hop(dir) {
    const st = game.current
    if (!st || st.dead) return
    unlock()
    const p = st.player
    if (dir === 'left') p.x = Math.max(CELL / 2, p.x - CELL)
    else if (dir === 'right') p.x = Math.min(W - CELL / 2, p.x + CELL)
    else if (dir === 'up') p.row = Math.max(0, p.row - 1)
    else if (dir === 'down') p.row = Math.min(ROWS - 1, p.row + 1)
    tone(dir === 'up' ? 523 : 392, 0.05)

    if (p.row === 0) {
      st.score++
      setScore(st.score)
      st.boost = 1 + st.score * 0.06
      tone(659, 0.2)
      st.player = { x: W / 2, row: ROWS - 1 }
    }
  }

  function step(st) {
    for (const lane of st.lanes) {
      const v = lane.dir * lane.speed * st.boost
      for (const e of lane.entities) {
        e.x += v
        if (lane.dir > 0 && e.x > W) e.x = -lane.len
        else if (lane.dir < 0 && e.x < -lane.len) e.x = W
      }
    }

    const p = st.player
    const lane = laneAt(st, p.row)
    if (lane) {
      if (lane.type === 'road') {
        for (const e of lane.entities) {
          if (p.x + 14 > e.x && p.x - 14 < e.x + lane.len) return die(st)
        }
      } else {
        // river: must ride a log
        let onLog = false
        for (const e of lane.entities) {
          if (p.x > e.x && p.x < e.x + lane.len) {
            onLog = true
            p.x += lane.dir * lane.speed * st.boost
            break
          }
        }
        if (!onLog || p.x < CELL / 2 || p.x > W - CELL / 2) return die(st)
      }
    }
  }

  function drawFrame(st) {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')

    // row backgrounds
    for (let row = 0; row < ROWS; row++) {
      const y = row * CELL
      if (row === 0) {
        const grad = c.createLinearGradient(0, y, W, y)
        grad.addColorStop(0, '#ff2e97')
        grad.addColorStop(1, '#05d9e8')
        c.fillStyle = grad
      } else if (RIVER_ROWS.includes(row)) c.fillStyle = '#071a2e'
      else if (ROAD_ROWS.includes(row)) c.fillStyle = '#0a0a14'
      else c.fillStyle = '#122036'
      c.fillRect(0, y, W, CELL)
      if (ROAD_ROWS.includes(row)) {
        c.strokeStyle = 'rgba(247,240,255,0.18)'
        c.lineWidth = 2
        c.setLineDash([12, 12])
        c.beginPath()
        c.moveTo(0, y + CELL / 2)
        c.lineTo(W, y + CELL / 2)
        c.stroke()
        c.setLineDash([])
      }
    }

    // entities
    for (const lane of st.lanes) {
      const y = lane.row * CELL
      c.shadowBlur = 10
      if (lane.type === 'river') {
        c.fillStyle = LOG_COLOR
        c.shadowColor = LOG_COLOR
        for (const e of lane.entities) roundRect(c, e.x, y + 8, lane.len, CELL - 16, 8, true)
      } else {
        c.fillStyle = lane.color
        c.shadowColor = lane.color
        for (const e of lane.entities) roundRect(c, e.x, y + 7, lane.len, CELL - 14, 6, true)
      }
    }
    c.shadowBlur = 0

    // player
    const p = st.player
    const cx = p.x
    const cy = p.row * CELL + CELL / 2
    c.fillStyle = '#05ffa1'
    c.shadowColor = '#05ffa1'
    c.shadowBlur = 14
    c.beginPath()
    c.moveTo(cx, cy - 13)
    c.lineTo(cx + 13, cy)
    c.lineTo(cx, cy + 13)
    c.lineTo(cx - 13, cy)
    c.closePath()
    c.fill()
    c.shadowBlur = 0

    // hud
    c.textAlign = 'left'
    c.fillStyle = '#0a0616'
    c.font = '700 18px ui-monospace, Menlo, monospace'
    c.fillText(`ACROSS ${String(st.score).padStart(2, '0')}`, 12, 26)
    c.textAlign = 'right'
    c.fillText('◆'.repeat(Math.max(0, st.lives)), W - 12, 26)
  }

  function roundRect(c, x, y, w, h, r, fill) {
    c.beginPath()
    c.moveTo(x + r, y)
    c.arcTo(x + w, y, x + w, y + h, r)
    c.arcTo(x + w, y + h, x, y + h, r)
    c.arcTo(x, y + h, x, y, r)
    c.arcTo(x, y, x + w, y, r)
    c.closePath()
    if (fill) c.fill()
  }

  const tap = (dir) => (e) => {
    e.preventDefault()
    hop(dir)
  }

  return (
    <Section num="02" name="Rush" heading="Cross before it clips you">
      <div className="machine-stage">
        <div className="neon-cabinet rush-cabinet">
          <div className="neon-screen">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="neon-canvas"
              aria-label="Rush — cross the lanes of traffic and the river. Hop with the pad below or the arrow keys."
              onPointerDown={(e) => {
                e.preventDefault()
                unlock()
                hop('up')
              }}
            />
            <div className="neon-scan" aria-hidden="true" />
          </div>
          <div className="rush-pad" role="group" aria-label="Direction pad">
            <span />
            <button type="button" className="neon-btn" aria-label="Hop up" onPointerDown={tap('up')}>
              ▲
            </button>
            <span />
            <button type="button" className="neon-btn" aria-label="Hop left" onPointerDown={tap('left')}>
              ◀
            </button>
            <button type="button" className="neon-btn" aria-label="Hop down" onPointerDown={tap('down')}>
              ▼
            </button>
            <button type="button" className="neon-btn" aria-label="Hop right" onPointerDown={tap('right')}>
              ▶
            </button>
          </div>
        </div>
      </div>
      <p className="machine-note" role="status">
        {message}
      </p>
      <p className="sr-only" data-testid="rush-score">
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
