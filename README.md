# Studio 1973 — 1973.ai

The studio site. A single-theme dark "darkroom" world: giant striped 1973 mark,
self-demonstrating case-study cards, a Claude-powered front desk, a darkroom that
develops prints on hover, and a 1973 wood-grain CRT television for a contact form.

The spec lives in `upd8-group/hear.is` under `studio-1973/` — `BRIEF.md` is the
brief, `concept-mockup.html` is the approved visual concept this build ports.

## Stack

Vite + React on Netlify, matching hear.is.

- **Build**: `npm run build` → `dist/`
- **Front-desk chat**: Netlify Function (`netlify/functions/front-desk.js`) calling
  the Claude API via `@anthropic-ai/sdk`. The client falls back to scripted answers
  if the function is unreachable.
- **Contact form**: Netlify Forms, posted from the CRT screen (channel 3).
- **Fonts**: system stacks only (Iowan Old Style / Palatino / Georgia + ui-monospace) —
  no external requests, strict CSP.

## Development

```
npm install
npm run dev          # site only — chat falls back to scripted answers
netlify dev          # site + functions, if you have the Netlify CLI
```

## Deploy

Push to `main`. Netlify builds and deploys to https://1973.ai.

**Required environment variable** (Netlify dashboard → Site configuration →
Environment variables):

- `ANTHROPIC_API_KEY` — server-side only, used by the front-desk function.
  Without it the function returns an error and the chat quietly falls back to
  its scripted answers, so the site never breaks.

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
  components/
    Header.jsx  Hero.jsx  FactsStrip.jsx
    Work.jsx  Waveform.jsx  SnowCanvas.jsx
    Assistant.jsx              front-desk chat (Claude + scripted fallback)
    Darkroom.jsx               generated placeholder frames — swap for real photos
    Studio.jsx                 about-the-studio section
    Badge.jsx                  "made in 1973" badge + embed snippet
    ContactTV.jsx              the Chroma 73 television (channels, knobs, form)
    Footer.jsx
netlify/functions/front-desk.js   Claude-powered chat endpoint
public/                        favicon, robots.txt
netlify.toml                   build, functions, headers/CSP
```

## Roadmap (from the brief)

1. ~~Scaffold repo + deploy pipeline; port the mockup into components~~ ✅
2. ~~Wire the front-desk chat to Claude~~ ✅ (set `ANTHROPIC_API_KEY`)
3. ~~Wire the CRT contact form~~ ✅ via Netlify Forms (confirm hello@1973.ai)
4. Replace darkroom placeholders with real photography
5. Ship the badge embed from 1973.ai; add the badge to hear.is + santasecret
6. Later: saygday.ai and Listing Lens sites / case-study pages as they mature
