import Waveform from "./Waveform.jsx";
import SnowCanvas from "./SnowCanvas.jsx";

// Design rule: every case-study card demonstrates its own product.
// hear.is → pointer-reactive waveform; Listing Lens → scan beam (CSS);
// Santa's Secret → falling snow.
export default function Work() {
  return (
    <section className="block wrap" id="work">
      <div className="block-head">
        <span className="eyebrow">01 · Shipped work</span>
        <h2>Software with a reason to exist</h2>
        <p>Not demos — live products and client sites with real users, real constraints, and opinions about privacy.</p>
      </div>

      <Waveform />
      <p className="wave-hint">↑ run your pointer across the sound</p>

      <article className="case">
        <div>
          <h3>hear.is — an acoustic accessibility map</h3>
          <p>
            Capture what a place <em>sounds like</em> in fifteen seconds. Built for blind and
            low-vision visitors, sensory-sensitive people, and anyone choosing where to go.
          </p>
          <p>
            The microphone audio never leaves the phone — analysis happens on-device, and only
            abstract descriptors travel onward, where they become a plain-language description
            of the room&rsquo;s sound.
          </p>
          <div className="chips">
            <span className="chip">15-second captures</span>
            <span className="chip">On-device sound analysis</span>
            <span className="chip">Privacy first</span>
            <span className="chip">Works on any phone</span>
          </div>
        </div>
        <aside>
          <dl>
            <dt>Role</dt><dd>Design, build, ship — everything</dd>
            <dt>Privacy stance</dt><dd>Raw audio is never uploaded, never stored</dd>
            <dt>Status</dt><dd>Live · <a href="https://hear.is" rel="noopener">hear.is</a></dd>
          </dl>
        </aside>
      </article>

      <article className="case lens">
        <div>
          <h3>Listing Lens — know the car before you call</h3>
          <p>
            In the workshop right now. Buying a car online means trusting a stranger&rsquo;s
            listing — so screenshot it, drop it into Listing Lens, and get a comprehensive
            report on that exact vehicle: recalls, known faults, real owner experiences,
            and the genuine positives.
          </p>
          <p>
            Then it makes you the educated one in the conversation — what this model is
            like to live with, and the exact questions to ask the seller before any money
            moves.
          </p>
          <div className="chips">
            <span className="chip">Screenshot → report</span>
            <span className="chip">Recalls &amp; known faults</span>
            <span className="chip">Owner experiences</span>
            <span className="chip">Questions for the seller</span>
          </div>
        </div>
        <aside>
          <dl>
            <dt>Role</dt><dd>Design, build, ship — everything</dd>
            <dt>The idea</dt><dd>A second opinion in your pocket</dd>
            <dt>Status</dt><dd>In the workshop · listinglens.app</dd>
          </dl>
        </aside>
      </article>

      <article className="case">
        <div>
          <h3>Santa&rsquo;s Secret — Bungendore, NSW</h3>
          <p>
            Kim&rsquo;s bricks-and-mortar shop on Malbon Street, half an hour out of Canberra:
            handcrafted ornaments, custom trees, and bespoke decorations —{" "}
            <em>&ldquo;an unconventional Christmas.&rdquo;</em> Unconventional needs its own weather,
            so the site got a custom snow engine, hand-built rather than a plugin.
            It&rsquo;s snowing on this card right now.
          </p>
          <p>
            Front of house, visitors are greeted by an AI assistant running on{" "}
            <a href="https://saygday.ai" rel="noopener">saygday.ai</a> — the studio&rsquo;s
            own chatbot platform, making its debut on a real shop floor.
          </p>
          <div className="chips">
            <span className="chip">Custom snow engine</span>
            <span className="chip">saygday.ai assistant</span>
            <span className="chip">Bricks &amp; mortar client</span>
          </div>
        </div>
        <aside>
          <dl>
            <dt>Client</dt><dd>Kim — owner &amp; artisan</dd>
            <dt>Role</dt><dd>Design, build, ship — everything</dd>
            <dt>Signature feature</dt><dd>Snow, coded from scratch</dd>
            <dt>Status</dt><dd>Live · <a href="https://santasecret.com.au" rel="noopener">santasecret.com.au</a></dd>
          </dl>
        </aside>
        <SnowCanvas />
      </article>
    </section>
  );
}
