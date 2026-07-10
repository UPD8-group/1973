# Studio 1973 — 1973.ai

The studio site. A single-theme dark "darkroom" world: giant striped 1973 mark,
self-demonstrating case-study cards, a scripted front-desk chat, a darkroom that
develops prints on hover, and a 1973 wood-grain CRT television for a contact form.

The spec lives in `upd8-group/hear.is` under `studio-1973/` — `BRIEF.md` is the
brief, `concept-mockup.html` is the approved visual concept this build ports.

## Stack

Vite + React on Netlify. **Fully self-contained** — no APIs, no external
requests, no keys to manage, nothing to hijack.

- **Build**: `npm run build` → `dist/`
- **Front-desk chat**: a curated Q&A file, `src/data/front-desk.json`, bundled
  at build time. Keyword matching picks the best answer; anything unmatched gets
  a friendly "one for the team" reply that links down to the contact television.
  This is the reusable pattern for client sites (Santa's Secret next).
- **Contact form**: Netlify Forms, posted from the CRT screen (channel 3).
- **Fonts**: system stacks only (Iowan Old Style / Palatino / Georgia +
  ui-monospace) — strict same-origin CSP.

## Editing the front desk

Open `src/data/front-desk.json`. Each entry is:

```json
{
  "id": "pricing",
  "keys": ["price", "cost", "how much"],
  "a": "The answer, in the studio voice.",
  "cta": { "href": "#contact", "label": "Tune in on channel 3 ↓" }
}
```

- Single-word `keys` match whole words; multi-word phrases match anywhere and
  score double. The highest-scoring entry answers.
- `cta` is optional — it renders as a link under the reply (use it whenever the
  right next step is the contact form).
- The `fallback` entry answers everything that doesn't match. Keep it warm; it
  is the lead-capture path.

House rules for answers: speak as "the studio"/"we", never mention team size or
the tools behind the scenes, never quote prices — steer pricing to the form.

## Development

```
npm install
npm run dev
```

## Deploy

Push to `main`. Netlify builds and deploys to https://1973.ai. No environment
variables required.

**Contact form notifications**: Netlify dashboard → Forms → contact →
Form notifications → email to the studio inbox. Confirm the hello@1973.ai
mailbox exists before relying on it.

## The design rule that matters most

Every case-study card demonstrates its own product:

- **hear.is** — pointer-reactive waveform (`Waveform.jsx`)
- **Listing Lens** — slow amber scan-beam (CSS, `.case.lens::after`)
- **Santa's Secret** — real falling snow (`SnowCanvas.jsx`, IntersectionObserver-gated)

Any future case study must ship with its own self-demonstrating interaction.
All motion respects `prefers-reduced-motion`.

## Layout

```
index.html                     Vite entry + hidden Netlify Forms detection form
src/
  main.jsx                     entry
  App.jsx                      section order
  styles.css                   the whole design system (ported from the concept)
  lib/util.js                  seeded PRNG + reduced-motion hook
  data/front-desk.json         the chat's entire brain — edit answers here
  components/
    Header.jsx  Hero.jsx  FactsStrip.jsx
    Work.jsx  Waveform.jsx  SnowCanvas.jsx
    Assistant.jsx              front-desk chat (matching + typewriter only)
    Darkroom.jsx               generated placeholder frames — swap for real photos
    Studio.jsx                 about-the-studio section
    Badge.jsx                  "made in 1973" badge + embed snippet
    ContactTV.jsx              the Chroma 73 television (channels, knobs, form)
    Footer.jsx
public/                        favicon, robots.txt
netlify.toml                   build, headers/CSP
```

## Roadmap (from the brief)

1. ~~Scaffold repo + deploy pipeline; port the mockup into components~~ ✅
2. ~~Front-desk chat~~ ✅ self-contained Q&A (extend `front-desk.json` as questions come in)
3. ~~Wire the CRT contact form~~ ✅ via Netlify Forms (confirm hello@1973.ai)
4. Replace darkroom placeholders with real photography
5. Ship the badge embed from 1973.ai; add the badge to hear.is + santasecret
6. Later: saygday.ai and Listing Lens sites / case-study pages as they mature
