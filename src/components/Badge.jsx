import { useRef, useState } from "react";

const SNIPPET = '<a class="made-in-1973" href="https://1973.ai">made in 1973</a>';

export default function Badge() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  function copy() {
    const done = () => {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(SNIPPET).then(done, done);
    } else {
      done();
    }
  }

  return (
    <section className="block wrap" id="badge">
      <div className="block-head">
        <span className="eyebrow">05 · The signature</span>
        <h2>Everything ships with the mark</h2>
        <p>
          Every site and platform the studio builds carries one small line in its footer —
          a quiet, consistent signature that links back home to 1973.ai.
        </p>
      </div>

      <div className="badge-stage">
        <div className="stage on-dark">
          <a className="made-badge" href="#badge">made in <span className="y">1973</span> ↗</a>
        </div>
        <div className="stage on-light">
          <a className="made-badge" href="#badge">made in <span className="y">1973</span> ↗</a>
        </div>
      </div>

      <div className="snippet">
        <button className="copy-btn" type="button" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
        <pre>
          &lt;<span className="tag">a</span> <span className="attr">class</span>=<span className="val">"made-in-1973"</span>{" "}
          <span className="attr">href</span>=<span className="val">"https://1973.ai"</span>&gt;made in 1973&lt;/<span className="tag">a</span>&gt;
        </pre>
      </div>
    </section>
  );
}
