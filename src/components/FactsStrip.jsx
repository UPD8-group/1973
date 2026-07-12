const FACTS = [
  {
    when: '1973·MAR',
    what: 'Xerox Alto boots — the first computer with a graphical interface',
  },
  {
    when: '1973·APR',
    what: 'Motorola places the first handheld mobile phone call',
  },
  {
    when: '1973·MAY',
    what: 'Ethernet is sketched at Xerox PARC — the network begins',
  },
  {
    when: '1973·MAR',
    what: 'Pink Floyd releases The Dark Side of the Moon',
  },
  {
    when: 'SOON AFTER',
    what: 'The arcades fill with blinking lights — and games that test your memory',
  },
  {
    when: 'TODAY',
    what: 'The lights still blink. Your move.',
    today: true,
  },
]

export default function FactsStrip() {
  return (
    <section className="facts" id="year" aria-label="The year 1973">
      <div className="facts-track">
        {FACTS.map((f) => (
          <div className={`facts-cell${f.today ? ' facts-cell-today' : ''}`} key={f.when + f.what}>
            <span className="facts-when">{f.when}</span>
            <span className="facts-what">{f.what}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
