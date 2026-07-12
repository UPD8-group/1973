export default function Hero() {
  return (
    <section className="hero" id="top">
      <p className="eyebrow hero-rise" style={{ '--rise': 0 }}>
        1973.AI · THE ARCADE
      </p>
      <h1 className="hero-title hero-rise" style={{ '--rise': 1 }}>
        1973
      </h1>
      <p className="hero-subhead hero-rise" style={{ '--rise': 2 }}>
        The games of the seventies.{' '}
        <span className="hero-subhead-faint">One long scroll.</span>
      </p>
      <p className="hero-lede hero-rise" style={{ '--rise': 3 }}>
        Memory squares, television tennis, brick walls, phosphor trails, and a
        text-mode hunt in the dark — the great games of the 1970s, rebuilt for
        the browser in period style, square-wave bleeps and all. Scroll down,
        pick a machine, and play. More cabinets arrive as they&rsquo;re built.
      </p>
      <div className="hero-ctas hero-rise" style={{ '--rise': 4 }}>
        <a className="btn btn-solid" href="#play">
          ▶ Start playing
        </a>
        <a className="btn btn-outline" href="#year">
          Why 1973?
        </a>
      </div>
    </section>
  )
}
