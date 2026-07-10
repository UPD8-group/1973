import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../lib/util.js";

const SUGGESTIONS = [
  "What can you build?",
  "What is hear.is?",
  "Who are your clients?",
  "What's saygday.ai?",
  "What is Listing Lens?",
  "Why 1973?",
];

// Offline safety net: if the serverless function is unreachable (local dev
// without a key, network hiccup, rate limit), answer from the same script
// the approved concept shipped with.
const SCRIPTED = [
  { keys: ["santa", "bungendore", "client", "snow", "kim", "shop", "store", "christmas"], text: "The studio's latest client build is Santa's Secret — Kim's bricks-and-mortar Christmas shop in Bungendore, NSW, half an hour from Canberra. Handcrafted ornaments, custom trees, 'an unconventional Christmas' — so the site got a custom hand-coded snow engine (look for the snowy card in the work section) and an AI assistant on saygday.ai. Live at santasecret.com.au." },
  { keys: ["gday", "g'day", "saygday", "platform"], text: "saygday.ai is the studio's own chatbot platform — friendly AI assistants for real businesses, built with an Australian accent. Its first shop floor is Santa's Secret in Bungendore, and there's more coming. Watch this space." },
  { keys: ["listing", "lens", "car", "vehicle"], text: "Listing Lens (listinglens.app) is a studio platform in the workshop: screenshot any online vehicle listing and it builds a full report — recalls, known faults, owner experiences, the genuine positives — then arms you with the questions to ask the seller before any money moves." },
  { keys: ["build", "make", "do", "services", "can you"], text: "Interactive websites, AI assistants like me, and full platforms — designed, built, and shipped under one roof. Plus photography, which sneaks into everything." },
  { keys: ["hear", "sound", "acoustic", "map"], text: "hear.is is an acoustic accessibility map — you record 15 seconds of a place and it describes what it sounds like, for blind, low-vision and sensory-sensitive visitors. The raw audio never leaves your phone; the description is written from abstract descriptors only." },
  { keys: ["1973", "why", "name", "year"], text: "1973 is the founder's birth year — and the year the Xerox Alto, Ethernet, and the first mobile phone call all arrived. A good vintage for someone who builds on the web, hence Studio 1973. Every project ships with a 'made in 1973' mark in its footer." },
  { keys: ["photo", "camera", "picture"], text: "Photography is the studio's oldest habit. Scroll to the darkroom section — hold your pointer on a frame and it develops, just like a print under the enlarger." },
  { keys: ["contact", "hire", "email", "price", "cost", "work with"], text: "Scroll down to the television set and tune it to channel 3 — the contact form is broadcasting there. Or write directly to hello@1973.ai. Small studio, short queue, honest answers." },
];
const FALLBACK =
  "Good question — I couldn't reach the studio's brain just now, so my range is limited. Try asking what the studio builds, why it's called 1973, or write directly to hello@1973.ai.";

function scriptedReply(q) {
  const lower = q.toLowerCase();
  for (const a of SCRIPTED) {
    if (a.keys.some((k) => lower.includes(k))) return a.text;
  }
  return FALLBACK;
}

async function askClaude(history) {
  const res = await fetch("/.netlify/functions/front-desk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history }),
  });
  if (!res.ok) throw new Error(`front desk unavailable (${res.status})`);
  const data = await res.json();
  if (typeof data.reply !== "string" || !data.reply.trim()) {
    throw new Error("empty reply");
  }
  return data.reply.trim();
}

let nextId = 0;

export default function Assistant() {
  const [messages, setMessages] = useState(() => [
    {
      id: nextId++,
      role: "bot",
      text: "Hi — I'm the front desk at Studio 1973. Ask me what the studio makes, who it's built for, or why it's called 1973.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const historyRef = useRef([]); // Claude-shaped {role, content} history
  const logRef = useRef(null);
  const timerRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  });

  useEffect(() => () => clearInterval(timerRef.current), []);

  function typeOut(id, text) {
    if (reduced) {
      setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, text, typing: false } : m)));
      return;
    }
    let i = 0;
    clearInterval(timerRef.current);
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, text: "", typing: false } : m)));
    timerRef.current = setInterval(() => {
      i += 3;
      const slice = text.slice(0, i);
      setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, text: slice } : m)));
      if (i >= text.length) clearInterval(timerRef.current);
    }, 18);
  }

  async function ask(q) {
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
    historyRef.current = [...historyRef.current, { role: "user", content: question }].slice(-20);

    let reply;
    try {
      reply = await askClaude(historyRef.current);
    } catch {
      reply = scriptedReply(question);
    }
    historyRef.current = [...historyRef.current, { role: "assistant", content: reply }];
    typeOut(botId, reply);
    setBusy(false);
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
