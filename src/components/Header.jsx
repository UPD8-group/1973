import { useState } from 'react'
import { soundOn, setSound, unlock, tone } from '../lib/audio.js'

export default function Header() {
  const [on, setOn] = useState(soundOn)

  function toggle() {
    const next = !on
    unlock()
    setSound(next)
    setOn(next)
    if (next) tone(523, 0.1)
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="wordmark" href="#top" aria-label="1973.ai — back to top">
          <span className="wordmark-year">1973</span>
          <span className="wordmark-ai">.ai</span>
        </a>
        <nav className="site-nav" aria-label="Site">
          <a href="#play">play</a>
          <a href="#year">the year</a>
          <a href="#contact">contact</a>
          <button
            type="button"
            className="sound-pill"
            aria-pressed={on}
            aria-label={`Sound ${on ? 'on' : 'off'} — toggle`}
            onClick={toggle}
          >
            sound {on ? 'on' : 'off'}
          </button>
        </nav>
      </div>
    </header>
  )
}
