const FACTS = [
  { yr: "1973 · MAR", what: "Xerox Alto boots — the first computer with a graphical interface" },
  { yr: "1973 · APR", what: "Motorola places the first handheld mobile phone call" },
  { yr: "1973 · MAY", what: "Ethernet is sketched at Xerox PARC — the network begins" },
  { yr: "1973 · MAR", what: "Pink Floyd releases The Dark Side of the Moon" },
  { yr: "1973", what: "One more notable launch: the founder of this studio" },
];

export default function FactsStrip() {
  return (
    <div className="strip" role="list" aria-label="What happened in 1973">
      <div className="strip-inner">
        {FACTS.map((f) => (
          <div className="fact" role="listitem" key={f.yr + f.what}>
            <span className="yr">{f.yr}</span>
            <span className="what">{f.what}</span>
          </div>
        ))}
        <div className="fact now" role="listitem">
          <span className="yr">TODAY</span>
          <span className="what">The tools changed. The impulse didn&rsquo;t.</span>
        </div>
      </div>
    </div>
  );
}
