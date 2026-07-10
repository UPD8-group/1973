import { useEffect, useRef } from "react";
import { mulberry, usePrefersReducedMotion } from "../lib/util.js";

// The Santa's Secret card demonstrates its own product: real falling snow,
// animated only while the card is on screen.
export default function SnowCanvas() {
  const canvasRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const fctx = canvas.getContext("2d");
    let flakes = [];
    let active = false;
    let raf = null;
    const rnd = mulberry(1973);

    function size() {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * devicePixelRatio;
      canvas.height = r.height * devicePixelRatio;
      fctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      flakes = [];
      const count = Math.min(80, Math.floor(r.width / 12));
      for (let i = 0; i < count; i++) {
        flakes.push({
          x: rnd() * r.width,
          y: rnd() * r.height,
          rr: 0.8 + rnd() * 1.8,
          vy: 0.25 + rnd() * 0.6,
          drift: rnd() * Math.PI * 2,
          dv: 0.004 + rnd() * 0.01,
        });
      }
    }

    function draw() {
      const w = canvas.width / devicePixelRatio;
      const h = canvas.height / devicePixelRatio;
      fctx.clearRect(0, 0, w, h);
      fctx.fillStyle = "rgba(242, 231, 212, 0.85)";
      for (const f of flakes) {
        fctx.globalAlpha = 0.35 + ((f.rr - 0.8) / 1.8) * 0.55;
        fctx.beginPath();
        fctx.arc(f.x, f.y, f.rr, 0, Math.PI * 2);
        fctx.fill();
        f.drift += f.dv;
        f.x += Math.sin(f.drift) * 0.4;
        f.y += f.vy;
        if (f.y > h + 3) { f.y = -3; f.x = rnd() * w; }
        if (f.x < -3) f.x = w + 3;
        if (f.x > w + 3) f.x = -3;
      }
      fctx.globalAlpha = 1;
      if (active && !reduced) raf = requestAnimationFrame(draw);
    }

    size();
    const onResize = () => size();
    addEventListener("resize", onResize);

    let observer = null;
    if (reduced) {
      draw();
    } else if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        active = entries[0].isIntersecting;
        if (active && !raf) {
          raf = requestAnimationFrame(draw);
        } else if (!active && raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      });
      observer.observe(canvas.parentElement);
    } else {
      active = true;
      draw();
    }

    return () => {
      removeEventListener("resize", onResize);
      if (observer) observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return <canvas className="snow-layer" ref={canvasRef} aria-hidden="true" />;
}
