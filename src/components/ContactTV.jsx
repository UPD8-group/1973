import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../lib/util.js";

const TESTCARD_BARS = ["#f2e7d4", "#e3cb6e", "#41798c", "#7fa05a", "#b03a5b", "#d4592a", "#e9a23b"];

export default function ContactTV() {
  const [tvOn, setTvOn] = useState(true);
  const [channel, setChannel] = useState(0);
  const [tuning, setTuning] = useState(false);
  const [knobRot, setKnobRot] = useState(0);
  const [sendState, setSendState] = useState("idle"); // idle | sending | ok | error
  const [sentName, setSentName] = useState("");
  const draft = useRef({ name: "", email: "", message: "" }); // survives a failed transmit
  const staticRef = useRef(null);
  const tuneTimer = useRef(null);
  const reduced = usePrefersReducedMotion();

  // Static burst: on CH·01, or between channels while tuning
  const snowVisible = tvOn && (tuning || channel === 0);

  useEffect(() => {
    const canvas = staticRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 140;
    canvas.height = 105;
    let raf = null;

    function drawFrame() {
      const img = ctx.createImageData(140, 105);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = v;
        d[i + 1] = (v * 0.96) | 0;
        d[i + 2] = (v * 0.86) | 0;
        d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    }

    function loop() {
      drawFrame();
      if (!reduced) raf = requestAnimationFrame(loop);
    }

    if (snowVisible) loop();
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [snowVisible, reduced]);

  useEffect(() => () => clearTimeout(tuneTimer.current), []);

  function tune() {
    if (!tvOn) return;
    const next = (channel + 1) % 3;
    setKnobRot((r) => r + 120);
    if (reduced) {
      setChannel(next);
      return;
    }
    setTuning(true);
    clearTimeout(tuneTimer.current);
    tuneTimer.current = setTimeout(() => {
      setChannel(next);
      setTuning(false);
    }, 340);
  }

  function togglePower() {
    setTvOn((on) => !on);
  }

  async function transmit(e) {
    e.preventDefault();
    const form = e.target;
    if (form.elements["bot-field"].value) return; // honeypot
    setSendState("sending");
    setSentName(form.elements.name.value.trim() || "friend");
    draft.current = {
      name: form.elements.name.value,
      email: form.elements.email.value,
      message: form.elements.message.value,
    };
    const data = new URLSearchParams({ "form-name": "contact", ...draft.current });
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data.toString(),
      });
      setSendState(res.ok ? "ok" : "error");
    } catch {
      setSendState("error");
    }
  }

  const showLayer = (i) => tvOn && !tuning && channel === i;

  return (
    <section className="block wrap" id="contact">
      <div className="block-head">
        <span className="eyebrow">06 · Contact</span>
        <h2>Tune in to get in touch</h2>
        <p>
          The contact form is a 1973 television set. Turn the channel knob until you find
          the studio — it&rsquo;s broadcasting on channel three.
        </p>
      </div>

      <div className="tv">
        <div className="tv-screen-shell">
          <div className={`tv-screen${tvOn ? "" : " off"}`}>
            <canvas
              ref={staticRef}
              aria-hidden="true"
              style={{ display: snowVisible ? "block" : "none" }}
            />

            <div className={`tv-layer${showLayer(0) ? " on" : ""}`}>
              <div className="no-signal">NO SIGNAL</div>
            </div>

            <div className={`tv-layer${showLayer(1) ? " on" : ""}`}>
              <div className="testcard" aria-hidden="true">
                {TESTCARD_BARS.map((c) => (
                  <div className="bar" style={{ background: c }} key={c} />
                ))}
              </div>
              <div className="testcard-medal">
                <span><i>studio</i><b>1973</b><i>test card</i></span>
              </div>
            </div>

            <div className={`tv-layer${showLayer(2) ? " on" : ""}`}>
              <div className="crt">
                {sendState === "ok" ? (
                  <div className="crt-done">
                    <div className="big-ok">▮ SIGNAL RECEIVED</div>
                    <div className="sub">
                      Thanks, {sentName}. Your message is with the studio — it will write back soon.
                    </div>
                  </div>
                ) : sendState === "error" ? (
                  <div className="crt-done err">
                    <div className="big-ok">▮ TRANSMISSION FAILED</div>
                    <div className="sub">
                      The signal didn&rsquo;t get through — atmospheric interference, most likely.
                      Your message is saved; give it another go.
                    </div>
                    <button type="button" onClick={() => setSendState("idle")}>
                      TRY AGAIN ▶
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="crt-title">▮ STUDIO 1973 — WRITE TO THE STUDIO</p>
                    <form name="contact" onSubmit={transmit}>
                      <p className="honeypot-field" aria-hidden="true">
                        <label>
                          Don&rsquo;t fill this out:{" "}
                          <input name="bot-field" tabIndex={-1} autoComplete="off" />
                        </label>
                      </p>
                      <label htmlFor="crtName">► NAME</label>
                      <input id="crtName" name="name" type="text" autoComplete="name" defaultValue={draft.current.name} required />
                      <label htmlFor="crtEmail">► EMAIL</label>
                      <input id="crtEmail" name="email" type="email" autoComplete="email" defaultValue={draft.current.email} required />
                      <label htmlFor="crtMsg">► MESSAGE</label>
                      <textarea id="crtMsg" name="message" rows={2} defaultValue={draft.current.message} required />
                      <button type="submit" disabled={sendState === "sending"}>
                        {sendState === "sending" ? "TRANSMITTING…" : "TRANSMIT ▶"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {tvOn && <div className="tv-osd">CH·0{channel + 1}</div>}
            <div className="tv-scanlines" />
            <div className="tv-glare" />
          </div>
          <div className="tv-brand">Chroma 73 · solid state</div>
        </div>

        <div className="tv-panel">
          <div className="tv-speaker" />
          <button className="knob big" type="button" aria-label="Change channel" onClick={tune}>
            <span className="knob-face" style={{ transform: `rotate(${knobRot}deg)` }}>
              <span className="knob-line" />
            </span>
          </button>
          <div className="knob-label">Channel</div>
          <button
            className="knob small"
            type="button"
            aria-label="Power"
            aria-pressed={tvOn}
            onClick={togglePower}
          >
            <span className="knob-face" style={{ transform: `rotate(${tvOn ? 0 : -60}deg)` }}>
              <span className="knob-line" />
            </span>
          </button>
          <div className="knob-label">Power</div>
        </div>
      </div>
      <p className="tv-hint">CH·01 no signal · CH·02 test card · CH·03 the form</p>
    </section>
  );
}
