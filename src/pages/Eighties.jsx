import EightiesHero from '../components/EightiesHero.jsx'
import Drifter from '../components/Drifter.jsx'
import Rush from '../components/Rush.jsx'
import Prowl from '../components/Prowl.jsx'
import Cascade from '../components/Cascade.jsx'

export default function Eighties() {
  return (
    <>
      <EightiesHero />
      <Drifter />
      <Rush />
      <Prowl />
      <Cascade />
      <section className="section neon-signoff">
        <p className="eyebrow">Closing time</p>
        <h2 className="section-heading">The floor goes dark</h2>
        <p className="neon-signoff-lede">
          That&rsquo;s the neon floor. The contact set is back in the &rsquo;73
          room — tune the television to channel three and write to the studio.
        </p>
        <div className="machine-controls">
          <a className="btn btn-solid" href="#contact">
            ▶ To the contact set
          </a>
          <a className="btn btn-outline" href="#/">
            Back to &rsquo;73
          </a>
        </div>
      </section>
    </>
  )
}
