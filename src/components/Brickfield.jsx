import { useEffect, useRef, useState } from 'react'
import Section from './Section.jsx'
import { unlock, tone } from '../lib/audio.js'

const W = 520
const H = 560
const ROWS = 6
const COLS = 10
const ROW_COLORS = ['#d4592a', '#e9a23b', '#e3cb6e', '#7fa05a', '#41798c', '#b03a5b']
const ROW_TONES = [523, 494, 440, 392, 349, 330]
const WALL_TOP = 72
const BRICK_H = 20
const BRICK_GAP = 4
const SIDE = 14
const BRICK_W = (W - SIDE * 2 - BRICK_GAP * (COLS - 1)) / COLS
const PADDLE_W = 84
const PADDLE_H = 12
const PADDLE_Y = H - 34
const BALL = 9
const START_SPEED = 4.6
const SPEED_UP = 1.012
const MAX_SPEED = 8.8
const BALLS = 3

export default function Brickfield() {
  const canvasRef = useRef(null)
  const gen = useRef(0)
  const game = useRef(null)
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('three balls — higher rows score more')

  useEffect(() => {
    drawFrame(freshGame())
    return () => gen.current++
  }, [])

  function freshGame() {
    return {
      bricks: Array.from({ length: ROWS * COLS }, () => true),
      left: ROWS * COLS,
      paddleX: W / 2,
      targetX: W / 2,
      ball: { x: W / 2, y: PADDLE_Y - 30, vx: 0, vy: 0 },
      score: 0,
      balls: BALLS,
      serveAt: 0,
    }
  }

  function serve(st) {
    st.ball.x = st.paddleX
    st.ball.y = PADDLE_Y - 26
    const angle = -Math.PI / 2 + (Math.random() * 0.5 - 0.25)
    st.ball.vx = Math.cos(angle) * START_SPEED
    st.ball.vy = Math.sin(angle) * START_SPEED
    st.serveAt = 0
  }

  function start() {
    unlock()
    const g = ++gen.current
    const st = freshGame()
    st.serveAt = performance.now() + 600
    game.current = st
    setScore(0)
    setMessage('three balls — higher rows score more')
    setRunning(true)
    requestAnimationFrame(function frame(now) {
      if (gen.current !== g) return
      step(st, now)
      drawFrame(st)
      requestAnimationFrame(frame)
    })
  }

  function end(st, text) {
    gen.current++
    setRunning(false)
    setMessage(text)
  }

  function stop() {
    gen.current++
    game.current = null
    setRunning(false)
    setScore(0)
    setMessage('three balls — higher rows score more')
    drawFrame(freshGame())
  }

  function step(st, now) {
    st.paddleX = Math.max(PADDLE_W / 2 + 4, Math.min(W - PADDLE_W / 2 - 4, st.targetX))

    if (st.serveAt) {
      if (now >= st.serveAt) serve(st)
      return
    }

    const b = st.ball
    b.x += b.vx
    b.y += b.vy

    // side + top walls
    if (b.x <= BALL / 2 + 2) {
      b.x = BALL / 2 + 2
      b.vx = Math.abs(b.vx)
      tone(220, 0.05)
    } else if (b.x >= W - BALL / 2 - 2) {
      b.x = W - BALL / 2 - 2
      b.vx = -Math.abs(b.vx)
      tone(220, 0.05)
    }
    if (b.y <= BALL / 2 + 2) {
      b.y = BALL / 2 + 2
      b.vy = Math.abs(b.vy)
      tone(220, 0.05)
    }

    // paddle
    if (
      b.vy > 0 &&
      b.y + BALL / 2 >= PADDLE_Y &&
      b.y + BALL / 2 <= PADDLE_Y + PADDLE_H + Math.abs(b.vy) &&
      Math.abs(b.x - st.paddleX) <= PADDLE_W / 2 + BALL / 2
    ) {
      const speed = Math.hypot(b.vx, b.vy)
      const rel = Math.max(-1, Math.min(1, (b.x - st.paddleX) / (PADDLE_W / 2)))
      const angle = -Math.PI / 2 + rel * (Math.PI / 3.2)
      b.vx = Math.cos(angle) * speed
      b.vy = Math.sin(angle) * speed
      b.y = PADDLE_Y - BALL / 2
      tone(392, 0.06)
    }

    // bricks
    for (let r = 0; r < ROWS; r++) {
      for (let col = 0; col < COLS; col++) {
        const i = r * COLS + col
        if (!st.bricks[i]) continue
        const bx = SIDE + col * (BRICK_W + BRICK_GAP)
        const by = WALL_TOP + r * (BRICK_H + BRICK_GAP)
        if (
          b.x + BALL / 2 > bx &&
          b.x - BALL / 2 < bx + BRICK_W &&
          b.y + BALL / 2 > by &&
          b.y - BALL / 2 < by + BRICK_H
        ) {
          st.bricks[i] = false
          st.left--
          st.score += (ROWS - r) * 10
          setScore(st.score)
          tone(ROW_TONES[r], 0.08)

          // bounce off the shallower axis of penetration
          const overlapX = Math.min(b.x + BALL / 2 - bx, bx + BRICK_W - (b.x - BALL / 2))
          const overlapY = Math.min(b.y + BALL / 2 - by, by + BRICK_H - (b.y - BALL / 2))
          if (overlapX < overlapY) b.vx = -b.vx
          else b.vy = -b.vy

          const speed = Math.min(MAX_SPEED, Math.hypot(b.vx, b.vy) * SPEED_UP)
          const scale = speed / Math.hypot(b.vx, b.vy)
          b.vx *= scale
          b.vy *= scale

          if (st.left === 0) {
            tone(659, 0.35)
            return end(st, `field cleared · ${st.score} points — press start to rebuild it`)
          }
          return
        }
      }
    }

    // lost ball
    if (b.y > H + BALL) {
      st.balls--
      tone(82, 0.4, 'sawtooth', 0.13)
      if (st.balls === 0) {
        return end(st, `out of balls · ${st.score} points — press start`)
      }
      st.serveAt = now + 800
    }
  }

  function drawFrame(st) {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    c.fillStyle = '#0d0a06'
    c.fillRect(0, 0, W, H)

    // score + remaining balls
    c.textAlign = 'left'
    c.fillStyle = 'rgba(242,231,212,0.85)'
    c.font = '700 26px ui-monospace, Menlo, monospace'
    c.fillText(String(st.score).padStart(4, '0'), SIDE, 42)
    c.textAlign = 'right'
    c.fillStyle = 'rgba(242,231,212,0.6)'
    c.fillText('●'.repeat(Math.max(0, st.balls)), W - SIDE, 42)

    // bricks
    for (let r = 0; r < ROWS; r++) {
      c.fillStyle = ROW_COLORS[r]
      for (let col = 0; col < COLS; col++) {
        if (!st.bricks[r * COLS + col]) continue
        c.fillRect(
          SIDE + col * (BRICK_W + BRICK_GAP),
          WALL_TOP + r * (BRICK_H + BRICK_GAP),
          BRICK_W,
          BRICK_H,
        )
      }
    }

    // paddle + ball
    c.fillStyle = '#f2e7d4'
    c.fillRect(st.paddleX - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H)
    if (!st.serveAt) {
      c.fillRect(st.ball.x - BALL / 2, st.ball.y - BALL / 2, BALL, BALL)
    }
  }

  function onPointer(e) {
    const st = game.current
    if (!st) return
    const rect = canvasRef.current.getBoundingClientRect()
    st.targetX = ((e.clientX - rect.left) / rect.width) * W
  }

  return (
    <Section num="03" name="Brickfield" heading="Take down the wall">
      <div className="machine-stage">
        <div className="bakelite-cabinet">
          <div className="bakelite-screen">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="brickfield-canvas"
              aria-label="Brickfield wall. Move your pointer across the screen to steer the paddle."
              onPointerDown={(e) => {
                unlock()
                onPointer(e)
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
      <p className="sr-only" data-testid="brickfield-score">
        score {score}
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
