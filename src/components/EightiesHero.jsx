import { scrollToId } from '../lib/route.js'

export default function EightiesHero() {
  return (
    <section className="hero neon-hero" id="top">
      <p className="eyebrow hero-rise" style={{ '--rise': 0 }}>
        THE NEON FLOOR
      </p>
      <h1 className="hero-title neon-title hero-rise" style={{ '--rise': 1 }} data-text="1983">
        1983
      </h1>
      <p className="hero-subhead hero-rise" style={{ '--rise': 2 }}>
        The games got faster.{' '}
        <span className="hero-subhead-faint">So did the lights.</span>
      </p>
      <p className="hero-lede hero-rise" style={{ '--rise': 3 }}>
        Vector rocks in the dark, a dash through traffic, a hunt through a
        glowing maze, and a well of falling blocks — the arcade of the early
        eighties, rebuilt in neon and chrome. Same rule as the room next door:
        the mechanics are the era&rsquo;s, the names and colours are ours.
      </p>
      <div className="hero-ctas hero-rise" style={{ '--rise': 4 }}>
        <a
          className="btn btn-solid"
          href="#e-play"
          onClick={(e) => {
            e.preventDefault()
            scrollToId('e-play')
          }}
        >
          ▶ Start playing
        </a>
        <a className="btn btn-outline" href="#/">
          Back to &rsquo;73
        </a>
      </div>
    </section>
  )
}
