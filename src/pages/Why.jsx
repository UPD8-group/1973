const THEN_NOW = [
  { then: 'A computer that filled a room', now: 'A faster one that fits in your pocket' },
  { then: 'A telephone bolted to the wall', now: 'A phone that knows where you’re standing' },
  { then: 'A screen of glowing green text', now: 'A screen of everything, everywhere' },
  { then: 'Programs fed in on paper tape', now: 'An arcade that loads in a tab, instantly' },
]

export default function Why() {
  return (
    <>
      <section className="section why-hero" id="top">
        <p className="eyebrow">Why 1973?</p>
        <h1 className="why-title">The year the future was prototyped</h1>
        <p className="why-lede">
          Because it&rsquo;s the year I was born — and, as it turns out, the year a
          surprising amount of the world you&rsquo;re holding got its start.
        </p>
      </section>

      <section className="section why-body">
        <h2 className="section-heading">A quiet, extraordinary year</h2>
        <p className="prose">
          In the spring of 1973, three things happened within weeks of each other,
          none of them front-page news. At Xerox&rsquo;s research lab in Palo Alto, a
          machine called the Alto booted up — the first computer built around a
          screen you&rsquo;d recognise: a bitmapped display, a mouse, and windows. A
          short memo away, a researcher there sketched a way to make computers talk
          to one another over a shared wire, and called it Ethernet. And on a New
          York pavement, an engineer named Martin Cooper lifted a handset the size
          of a brick and placed the first call from a mobile phone — to a rival, just
          to say he&rsquo;d done it first.
        </p>
        <p className="prose">
          None of it shipped that year. The Alto was never sold. The mobile call ran
          on a prototype. Ethernet was a diagram on a page. But every screen,
          network, and pocket phone you&rsquo;ve ever used traces a line back to that
          twelve-month window. 1973 isn&rsquo;t when the future arrived — it&rsquo;s when it
          was quietly prototyped.
        </p>
      </section>

      <section className="section why-body">
        <h2 className="section-heading">Then, and now</h2>
        <div className="then-now">
          {THEN_NOW.map((row) => (
            <div className="then-now-row" key={row.then}>
              <span className="tn-then">{row.then}</span>
              <span className="tn-arrow" aria-hidden="true">
                →
              </span>
              <span className="tn-now">{row.now}</span>
            </div>
          ))}
        </div>
        <p className="prose">
          I&rsquo;ve spent my whole life alongside that arc — near enough the same age
          as the first mobile call, give or take a spring. Everything that came
          after has been astonishing. This site is a small thank-you to the machines
          that started it: the bleeps, the phosphor, the wood-grain cabinets. Half a
          century of change, and it all began blinking to life in 1973.
        </p>
      </section>

      <section className="section why-cta">
        <div className="machine-controls">
          {/* leaving #/why switches back to the 70s arcade, then the anchor
              effect scrolls to the target section */}
          <a className="btn btn-solid" href="#play">
            ▶ Play the arcade
          </a>
          <a className="btn btn-outline" href="#year">
            The year in six facts
          </a>
        </div>
      </section>
    </>
  )
}
