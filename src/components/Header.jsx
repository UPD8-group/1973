import { useState } from 'react'
import { soundOn, setSound, unlock, tone } from '../lib/audio.js'
import { scrollToId } from '../lib/route.js'

export default function Header({ decade }) {
  const [on, setOn] = useState(soundOn)

  function toggle() {
    const next = !on
    unlock()
    setSound(next)
    setOn(next)
    if (next) tone(523, 0.1)
  }

  // 80s section jumps scroll programmatically so they don't change the route.
  function jump(e, id) {
    e.preventDefault()
    scrollToId(id)
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a
          className="wordmark"
          href={decade === 'eighties' ? '#/eighties' : '#top'}
          aria-label="1973.ai — back to top"
        >
          <span className="wordmark-year">1973</span>
          <span className="wordmark-ai">.ai</span>
        </a>

        <div className="decade-switch" role="group" aria-label="Choose a decade">
          <a href="#/" aria-current={decade === 'seventies' ? 'page' : undefined}>
            1973
          </a>
          <a href="#/eighties" aria-current={decade === 'eighties' ? 'page' : undefined}>
            1983
          </a>
        </div>

        <nav className="site-nav" aria-label="Site">
          {decade === 'eighties' ? (
            <>
              <a href="#e-play" onClick={(e) => jump(e, 'e-play')}>
                play
              </a>
              <a href="#contact">contact</a>
            </>
          ) : (
            <>
              <a href="#play">play</a>
              <a href="#year">the year</a>
              <a href="#contact">contact</a>
            </>
          )}
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
