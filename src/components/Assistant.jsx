import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../lib/util.js";
import KB from "../data/front-desk.json";

// Entirely self-contained: every answer comes from src/data/front-desk.json,
// bundled at build time. No network calls, nothing to hijack — anything the
// file can't answer gets steered to the contact television.

const SUGGESTIONS = [
  "What can you build?",
  "How much does it cost?",
  "Where are you based?",
  "What is hear.is?",
  "Can you build me a chatbot?",
  "Why 1973?",
];

// Single-word keys match whole words; multi-word (or dotted) keys match as
// phrases and score double. Best-scoring entry wins; no match → fallback.
function findAnswer(question) {
  const lower = question.toLowerCase();
  const words = new Set(lower.split(/[^a-z0-9'’.@-]+/).filter(Boolean));
  let best = null;
  let bestScore = 0;
  for (const entry of KB.entries) {
    let score = 0;
    for (const key of entry.keys) {
      if (key.includes(" ") || key.includes(".")) {
        if (lower.includes(key)) score += 2;
      } else if (words.has(key)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  return best ?? KB.fallback;
}

let nextId = 0;

export default function Assistant() {
  const [messages, setMessages] = useState(() => [
    { id: nextId++, role: "bot", text: KB.greeting },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);
  const timerRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  });

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      clearTimeout(timerRef.current);
    },
    []
  );

  function reveal(id, answer) {
    if (reduced) {
      setMessages((ms) =>
        ms.map((m) => (m.id === id ? { ...m, text: answer.a, cta: answer.cta, typing: false } : m))
      );
      setBusy(false);
      return;
    }
    let i = 0;
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, text: "", typing: false } : m)));
    timerRef.current = setInterval(() => {
      i += 3;
      const slice = answer.a.slice(0, i);
      const done = i >= answer.a.length;
      setMessages((ms) =>
        ms.map((m) =>
          m.id === id ? { ...m, text: done ? answer.a : slice, cta: done ? answer.cta : undefined } : m
        )
      );
      if (done) {
        clearInterval(timerRef.current);
        setBusy(false);
      }
    }, 18);
  }

  function ask(q) {
    const question = q.trim();
    if (!question || busy) return;
    setBusy(true);
    setInput("");
    const botId = nextId++;
    setMessages((ms) => [
      ...ms,
      { id: nextId++, role: "you", text: question },
      { id: botId, role: "bot", text: "· · ·", typing: true },
    ]);
    const answer = findAnswer(question);
    timerRef.current = setTimeout(() => reveal(botId, answer), reduced ? 150 : 700);
  }

  return (
    <section className="block wrap" id="assistant">
      <div className="block-head">
        <span className="eyebrow">02 · AI assistants</span>
        <h2>Chatbots that actually know the business</h2>
        <p>
          Assistants grounded in your own content and wired into your stack. This one runs
          the studio&rsquo;s front desk — try it. Client assistants ship on{" "}
          <a href="https://saygday.ai" rel="noopener">saygday.ai</a>, the studio&rsquo;s own
          platform, already greeting visitors at Santa&rsquo;s Secret.
        </p>
      </div>

      <div className="chat">
        <div className="chat-bar"><span className="dot" /> studio front desk</div>
        <div className="chat-log" ref={logRef} aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`msg ${m.role}${m.typing ? " typing" : ""}`}>
              {m.text}
              {m.cta && (
                <a className="msg-cta" href={m.cta.href}>{m.cta.label}</a>
              )}
            </div>
          ))}
        </div>
        <div className="chat-suggest">
          {SUGGESTIONS.map((s) => (
            <button type="button" key={s} onClick={() => ask(s)}>{s}</button>
          ))}
        </div>
        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the studio anything…"
            autoComplete="off"
            aria-label="Ask the studio a question"
          />
          <button type="submit" disabled={busy}>Send</button>
        </form>
      </div>
    </section>
  );
}
