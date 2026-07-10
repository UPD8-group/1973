import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../lib/util.js";

const BANDS = ["#d4592a", "#e9a23b", "#e3cb6e", "#7fa05a", "#41798c"];

export default function Waveform() {
  const canvasRef = useRef(null);
  const pointer = useRef({ x: -1, energy: 0 });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const wave = canvasRef.current;
    const wctx = wave.getContext("2d");
    let t = reduced ? 40 : 0;
    let raf = null;

    function sizeWave() {
      const r = wave.getBoundingClientRect();
      wave.width = r.width * devicePixelRatio;
      wave.height = 120 * devicePixelRatio;
      wctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }
    sizeWave();

    function drawWave() {
      const w = wave.getBoundingClientRect().width;
      const h = 120;
      const mid = h / 2;
      wctx.clearRect(0, 0, w, h);
      const barW = 5;
      const gap = 4;
      const n = Math.floor(w / (barW + gap));
      for (let i = 0; i < n; i++) {
        const x = i * (barW + gap);
        const base = Math.sin(i * 0.35 + t * 0.03) * 8 + Math.sin(i * 0.11 - t * 0.017) * 12;
        let boost = 0;
        if (pointer.current.x >= 0) {
          const d = Math.abs(x - pointer.current.x);
          boost = Math.max(0, 1 - d / 140) * 42 * (0.6 + 0.4 * Math.sin(i * 1.7 + t * 0.2));
        }
        const amp = Math.max(2.5, Math.abs(base) * (0.5 + pointer.current.energy * 0.5) + boost);
        wctx.fillStyle = BANDS[i % BANDS.length];
        wctx.globalAlpha = 0.4 + Math.min(0.6, amp / 55);
        wctx.fillRect(x, mid - amp, barW, amp * 2);
      }
      wctx.globalAlpha = 1;
      pointer.current.energy *= 0.97;
      t++;
      if (!reduced) raf = requestAnimationFrame(drawWave);
    }

    const onResize = () => sizeWave();
    addEventListener("resize", onResize);
    if (reduced) {
      drawWave();
    } else {
      raf = requestAnimationFrame(drawWave);
    }
    return () => {
      removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <canvas
      id="wave"
      ref={canvasRef}
      aria-label="Decorative sound waveform — move your pointer across it"
      onPointerMove={(e) => {
        pointer.current.x = e.nativeEvent.offsetX;
        pointer.current.energy = Math.min(1, pointer.current.energy + 0.15);
      }}
      onPointerLeave={() => {
        pointer.current.x = -1;
      }}
    />
  );
}
