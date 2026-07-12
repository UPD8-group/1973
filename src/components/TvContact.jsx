import { useEffect, useRef, useState } from 'react'
import Section from './Section.jsx'
import { unlock, tone } from '../lib/audio.js'

const CHANNELS = 3
const STATIC_MS = 340
const STATIC_W = 140
const STATIC_H = 105
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const TEST_BARS = ['#f2e7d4', '#e3cb6e', '#41798c', '#7fa05a', '#b03a5b', '#d4592a', '#e9a23b']

function drawStatic(canvas) {
  const c = canvas.getContext('2d')
  const img = c.createImageData(STATIC_W, STATIC_H)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.random() * 255
    d[i] = v
    d[i + 1] = v * 0.93
    d[i + 2] = v * 0.78
    d[i + 3] = 255
  }
  c.putImageData(img, 0, 0)
}

export default function TvContact() {
  const [power, setPower] = useState(true)
  const [channel, setChannel] = useState(1)
  const [knobTurns, setKnobTurns] = useState(0)
  const [powerTurns, setPowerTurns] = useState(0)
  const [bursting, setBursting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [formError, setFormError] = useState('')
  const [sending, setSending] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const staticRef = useRef(null)
  const gen = useRef(0)
  const burstTimer = useRef(0)

  const staticVisible = power && (channel === 1 || bursting)

  // animate the noise while static is on screen
  useEffect(() => {
    if (!staticVisible) return
    const g = ++gen.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const frame = () => {
      if (gen.current !== g) return
      if (staticRef.current) drawStatic(staticRef.current)
      if (!reduced) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
    return () => {
      if (gen.current === g) gen.current++
    }
  }, [staticVisible])

  useEffect(() => () => clearTimeout(burstTimer.current), [])

  function turnChannel() {
    if (!power || bursting) return
    unlock()
    tone(180, 0.05, 'square', 0.06)
    setKnobTurns((t) => t + 1)
    setBursting(true)
    clearTimeout(burstTimer.current)
    burstTimer.current = setTimeout(() => {
      setChannel((ch) => (ch % CHANNELS) + 1)
      setBursting(false)
    }, STATIC_MS)
  }

  function togglePower() {
    unlock()
    tone(140, 0.06, 'square', 0.06)
    setPowerTurns((t) => t + 1)
    setBursting(false)
    clearTimeout(burstTimer.current)
    setPower((p) => !p)
  }

  async function submit(e) {
    e.preventDefault()
    const name = form.name.trim()
    const email = form.email.trim()
    const message = form.message.trim()
    if (!name || !email || !message) {
      setFormError('▲ FILL EVERY FIELD BEFORE TRANSMITTING')
      return
    }
    if (!EMAIL_RE.test(email)) {
      setFormError('▲ THAT EMAIL WON’T TUNE — CHECK IT AND TRY AGAIN')
      return
    }
    setFormError('')
    setSending(true)
    unlock()
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.ok) throw new Error('transmission failed')
      tone(659, 0.3)
      setSentTo(name)
    } catch {
      tone(98, 0.3, 'sawtooth', 0.1)
      setFormError('▲ TRANSMISSION FAILED — TRY AGAIN, OR WRITE TO HELLO@1973.AI')
    } finally {
      setSending(false)
    }
  }

  const osd = `CH·${String(channel).padStart(2, '0')}`

  return (
    <Section id="contact" num="06" name="Contact" heading="Tune in to get in touch">
      <div className="machine-stage">
        <div className="tv-cabinet contact-tv">
          <div className="contact-tv-body">
            <div className="tv-screen contact-screen" data-channel={power ? channel : 'off'}>
              {power ? (
                <>
                  {channel === 1 && !bursting && (
                    <p className="no-signal" aria-hidden="true">
                      NO SIGNAL
                    </p>
                  )}
                  {channel === 2 && !bursting && (
                    <div className="test-card" aria-label="Channel 2 — test card">
                      <div className="test-bars" aria-hidden="true">
                        {TEST_BARS.map((color) => (
                          <span key={color} style={{ background: color }} />
                        ))}
                      </div>
                      <div className="test-medallion">
                        1973
                        <small>· test card ·</small>
                      </div>
                    </div>
                  )}
                  {channel === 3 && !bursting && (
                    <div className="phosphor-form">
                      {sentTo ? (
                        <div className="phosphor-received" role="status">
                          <p className="phosphor-title">▮ SIGNAL RECEIVED</p>
                          <p>
                            Thanks, {sentTo}. The studio will write back — or reach it directly at
                            hello@1973.ai
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={submit} noValidate>
                          <p className="phosphor-title">▮ 1973.AI — WRITE TO THE STUDIO</p>
                          <label className="phosphor-field">
                            <span>► NAME</span>
                            <input
                              type="text"
                              name="name"
                              autoComplete="name"
                              maxLength={120}
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                          </label>
                          <label className="phosphor-field">
                            <span>► EMAIL</span>
                            <input
                              type="email"
                              name="email"
                              autoComplete="email"
                              maxLength={200}
                              value={form.email}
                              onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                          </label>
                          <label className="phosphor-field">
                            <span>► MESSAGE</span>
                            <textarea
                              name="message"
                              rows={4}
                              maxLength={5000}
                              value={form.message}
                              onChange={(e) => setForm({ ...form, message: e.target.value })}
                            />
                          </label>
                          {formError && (
                            <p className="phosphor-error" role="status">
                              {formError}
                            </p>
                          )}
                          <button type="submit" className="phosphor-submit" disabled={sending}>
                            {sending ? 'TRANSMITTING…' : 'TRANSMIT ▶'}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                  <canvas
                    ref={staticRef}
                    width={STATIC_W}
                    height={STATIC_H}
                    className={`tv-static${staticVisible ? '' : ' tv-static-hidden'}`}
                    aria-hidden="true"
                  />
                  <p className="tv-osd" aria-hidden="true">
                    {osd}
                  </p>
                </>
              ) : (
                <p className="sr-only">The television is powered off.</p>
              )}
              <div className="scanlines" aria-hidden="true" />
              <div className="tv-glare" aria-hidden="true" />
            </div>
            <div className="tv-side">
              <div className="tv-grille" aria-hidden="true">
                {Array.from({ length: 7 }, (_, i) => (
                  <span key={i} />
                ))}
              </div>
              <div className="tv-knob-block">
                <button
                  type="button"
                  className="tv-knob tv-knob-big"
                  aria-label={`Channel knob — now on channel ${channel} of 3. Turn to change channel.`}
                  onClick={turnChannel}
                >
                  <span
                    className="tv-knob-pointer"
                    style={{ transform: `rotate(${knobTurns * 120}deg)` }}
                  />
                </button>
                <p className="tv-knob-label">CHANNEL</p>
              </div>
              <div className="tv-knob-block">
                <button
                  type="button"
                  className="tv-knob tv-knob-small"
                  aria-pressed={power}
                  aria-label={`Power — ${power ? 'on' : 'off'}`}
                  onClick={togglePower}
                >
                  <span
                    className="tv-knob-pointer"
                    style={{ transform: `rotate(${powerTurns * 90}deg)` }}
                  />
                </button>
                <p className="tv-knob-label">POWER</p>
              </div>
            </div>
          </div>
          <p className="tv-fascia">Chroma 73 · solid state</p>
        </div>
      </div>
      <p className="machine-note">CH·01 no signal · CH·02 test card · CH·03 the form</p>
    </Section>
  )
}
