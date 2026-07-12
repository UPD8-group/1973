import { useEffect, useRef, useState } from 'react'
import Section from './Section.jsx'
import { unlock, tone } from '../lib/audio.js'

const W = 640
const H = 440
const PADDLE_W = 10
const PADDLE_H = 72
const BALL = 10
const MARGIN = 26
const MACHINE_SPEED = 3.6
const WIN_SCORE = 7
const SERVE_SPEED = 5

export default function TvTennis() {
  const canvasRef = useRef(null)
  const gen = useRef(0)
  const game = useRef(null)
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState({ machine: 0, you: 0 })
  const [message, setMessage] = useState('first to seven — drag on the screen to move')

  useEffect(() => {
    drawFrame(freshGame())
    return () => gen.current++
  }, [])

  function freshGame() {
    return {
      leftY: H / 2,
      rightY: H / 2,
      targetY: H / 2,
      ball: { x: W / 2, y: H / 2, vx: 0, vy: 0 },
      machine: 0,
      you: 0,
      serveAt: 0,
      serveDir: Math.random() < 0.5 ? -1 : 1,
    }
  }

  function serve(g, now) {
    g.ball.x = W / 2
    g.ball.y = H * (0.3 + Math.random() * 0.4)
    const angle = (Math.random() * 0.6 - 0.3) * Math.PI
    g.ball.vx = Math.cos(angle) * SERVE_SPEED * g.serveDir
    g.ball.vy = Math.sin(angle) * SERVE_SPEED
    g.serveAt = 0
  }

  function start() {
    unlock()
    const g = ++gen.current
    const st = freshGame()
    st.serveAt = performance.now() + 700
    game.current = st
    setScore({ machine: 0, you: 0 })
    setMessage('first to seven — drag on the screen to move')
    setRunning(true)
    requestAnimationFrame(function frame(now) {
      if (gen.current !== g) return
      step(st, now, g)
      drawFrame(st)
      requestAnimationFrame(frame)
    })
  }

  function endMatch(st) {
    gen.current++
    setRunning(false)
    setMessage(
      st.you > st.machine
        ? 'you win the channel — press start to defend it'
        : 'the machine takes it — press start for a rematch',
    )
  }

  function step(st, now, g) {
    // waiting to serve
    if (st.serveAt) {
      if (now >= st.serveAt) serve(st, now)
    } else {
      const b = st.ball
      b.x += b.vx
      b.y += b.vy

      // walls
      if (b.y <= BALL / 2) {
        b.y = BALL / 2
        b.vy = Math.abs(b.vy)
        tone(220, 0.06)
      } else if (b.y >= H - BALL / 2) {
        b.y = H - BALL / 2
        b.vy = -Math.abs(b.vy)
        tone(220, 0.06)
      }

      // machine paddle (left)
      const lx = MARGIN + PADDLE_W
      if (b.vx < 0 && b.x - BALL / 2 <= lx && b.x - BALL / 2 >= lx - Math.abs(b.vx) - 2) {
        if (Math.abs(b.y - st.leftY) <= PADDLE_H / 2 + BALL / 2) {
          deflect(st, b, st.leftY, 1)
          tone(330, 0.07)
        }
      }
      // your paddle (right)
      const rx = W - MARGIN - PADDLE_W
      if (b.vx > 0 && b.x + BALL / 2 >= rx && b.x + BALL / 2 <= rx + Math.abs(b.vx) + 2) {
        if (Math.abs(b.y - st.rightY) <= PADDLE_H / 2 + BALL / 2) {
          deflect(st, b, st.rightY, -1)
          tone(392, 0.07)
        }
      }

      // points
      if (b.x < -BALL) {
        st.you++
        tone(523, 0.22)
        setScore({ machine: st.machine, you: st.you })
        if (st.you >= WIN_SCORE) return endMatch(st)
        st.serveDir = -1
        st.serveAt = now + 900
      } else if (b.x > W + BALL) {
        st.machine++
        tone(98, 0.3, 'sawtooth', 0.13)
        setScore({ machine: st.machine, you: st.you })
        if (st.machine >= WIN_SCORE) return endMatch(st)
        st.serveDir = 1
        st.serveAt = now + 900
      }
    }

    // machine tracks the ball with capped speed
    const want = st.serveAt ? H / 2 : st.ball.y
    const dy = want - st.leftY
    st.leftY += Math.max(-MACHINE_SPEED, Math.min(MACHINE_SPEED, dy))
    st.leftY = clampPaddle(st.leftY)

    // your paddle eases to the drag target
    st.rightY = clampPaddle(st.targetY)
  }

  function deflect(st, b, paddleY, dir) {
    const speed = Math.hypot(b.vx, b.vy) * 1.04
    const rel = Math.max(-1, Math.min(1, (b.y - paddleY) / (PADDLE_H / 2)))
    const angle = rel * (Math.PI / 3.4)
    b.vx = Math.cos(angle) * speed * dir
    b.vy = Math.sin(angle) * speed
  }

  function clampPaddle(y) {
    return Math.max(PADDLE_H / 2, Math.min(H - PADDLE_H / 2, y))
  }

  function drawFrame(st) {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    c.fillStyle = '#0a0a08'
    c.fillRect(0, 0, W, H)

    // centre net
    c.strokeStyle = 'rgba(242,231,212,0.35)'
    c.lineWidth = 3
    c.setLineDash([10, 14])
    c.beginPath()
    c.moveTo(W / 2, 8)
    c.lineTo(W / 2, H - 8)
    c.stroke()
    c.setLineDash([])

    // labels + scores
    c.textAlign = 'center'
    c.fillStyle = 'rgba(242,231,212,0.4)'
    c.font = '600 13px ui-monospace, Menlo, monospace'
    c.fillText('MACHINE', W * 0.28, 40)
    c.fillText('YOU', W * 0.72, 40)
    c.fillStyle = 'rgba(242,231,212,0.85)'
    c.font = '700 52px ui-monospace, Menlo, monospace'
    c.fillText(String(st.machine), W * 0.28, 92)
    c.fillText(String(st.you), W * 0.72, 92)

    // paddles + ball
    c.fillStyle = '#f2e7d4'
    c.fillRect(MARGIN, st.leftY - PADDLE_H / 2, PADDLE_W, PADDLE_H)
    c.fillRect(W - MARGIN - PADDLE_W, st.rightY - PADDLE_H / 2, PADDLE_W, PADDLE_H)
    if (!st.serveAt) {
      c.fillRect(st.ball.x - BALL / 2, st.ball.y - BALL / 2, BALL, BALL)
    }
  }

  function onPointer(e) {
    const st = game.current
    if (!st) return
    const rect = canvasRef.current.getBoundingClientRect()
    st.targetY = ((e.clientY - rect.top) / rect.height) * H
  }

  return (
    <Section num="02" name="Television tennis" heading="Rally against the machine">
      <div className="machine-stage">
        <div className="tv-cabinet tennis-cabinet">
          <div className="tv-screen">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="tennis-canvas"
              aria-label="Television tennis court. Drag anywhere on the screen to move your paddle."
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
      <p className="sr-only" data-testid="tennis-score">
        machine {score.machine} · you {score.you}
      </p>
      <div className="machine-controls">
        <button type="button" className="btn btn-solid" onClick={start}>
          {running ? 'Restart' : '▶ Start'}
        </button>
      </div>
    </Section>
  )
}
