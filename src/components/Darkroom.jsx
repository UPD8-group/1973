import { useEffect, useRef } from "react";
import { mulberry } from "../lib/util.js";

// Placeholder frames generated in-canvas, exactly as in the approved concept.
// Swap for real photographs from the archive (build roadmap step 4).
const FRAMES = [
  { seed: 11, cap: "frame 01 · dusk" },
  { seed: 29, cap: "frame 02 · harbour" },
  { seed: 47, cap: "frame 03 · neon" },
  { seed: 83, cap: "frame 04 · field" },
];
const PALETTES = [
  ["#d4592a", "#e9a23b", "#2a1608"],
  ["#41798c", "#e3cb6e", "#0d1a1f"],
  ["#b03a5b", "#e9a23b", "#1a0d14"],
  ["#7fa05a", "#e3cb6e", "#131a0c"],
];

function paint(canvas, seed, pal) {
  const g = canvas.getContext("2d");
  const rnd = mulberry(seed);
  g.fillStyle = pal[2];
  g.fillRect(0, 0, 320, 400);
  for (let b = 0; b < 6; b++) {
    const cx = rnd() * 320;
    const cy = rnd() * 400;
    const r = 60 + rnd() * 180;
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, pal[b % 2]);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.globalAlpha = 0.35 + rnd() * 0.3;
    g.fillStyle = grad;
    g.fillRect(0, 0, 320, 400);
  }
  g.globalAlpha = 1;
  const img = g.getImageData(0, 0, 320, 400);
  const d = img.data;
  for (let p = 0; p < d.length; p += 4) {
    const nz = (rnd() - 0.5) * 26;
    d[p] += nz;
    d[p + 1] += nz;
    d[p + 2] += nz;
  }
  g.putImageData(img, 0, 0);
}

export default function Darkroom() {
  const refs = useRef([]);

  useEffect(() => {
    FRAMES.forEach((f, i) => {
      const canvas = refs.current[i];
      if (canvas) paint(canvas, f.seed, PALETTES[i % PALETTES.length]);
    });
  }, []);

  return (
    <section className="block wrap" id="photo">
      <div className="block-head">
        <span className="eyebrow">03 · Photography</span>
        <h2>The darkroom</h2>
        <p>
          Photography is the studio&rsquo;s oldest habit — older than the web. Prints develop when you
          hold the light on them.
        </p>
      </div>
      <div className="darkroom">
        {FRAMES.map((f, i) => (
          <figure className="neg" key={f.seed} tabIndex={0}>
            <canvas
              width={320}
              height={400}
              ref={(el) => { refs.current[i] = el; }}
            />
            <figcaption>{f.cap}</figcaption>
          </figure>
        ))}
      </div>
      <p className="darkroom-hint">Hover a frame to develop it</p>
    </section>
  );
}
