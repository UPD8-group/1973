# 1973.ai — the memory console

A one-page arcade of 1970s-style games, presented as a den of period
"appliances" you scroll through and play. Warm, dark, wood-and-bakelite
seventies world: square-wave bleeps, phosphor glow, and a television you
tune to write to the studio.

Every game uses era **mechanics** only — all the expression (names,
palette, tones, trade dress) is original to this site.

## The machines

| # | Machine | What it is |
|---|---------|------------|
| 01 | **The memory handset** | Repeat a growing tone-and-light sequence on four burnt-palette squares (ember · teal · olive · plum). One wrong square ends the run; best score is remembered. |
| 02 | **Television tennis** | Rally against the machine on a wood-grain TV. Drag anywhere on the screen to move your paddle. First to seven. |
| 03 | **Brickfield** | Knock down a six-row spectrum wall with three balls. Higher rows score more; each row has its own tone. |
| 04 | **Trail** | A green-phosphor grid snake. Steer with arrow keys, WASD, or the on-screen d-pad. Walls — and your own trail — are fatal. |
| 05 | **Cave hunt** | A teletype text hunt: twelve caves in a ring, one beast, two chasms, three arrows. Listen for warnings, shoot when you're sure. |
| 06 | **Contact** | A 1973 television set. CH·01 static, CH·02 test card, CH·03 an amber-phosphor contact form that transmits to the studio. |

All games are fully touch-playable, only animate after you press start,
respect `prefers-reduced-motion`, and share one master sound switch in
the header (persisted, like the best scores, in `localStorage`).

## Stack & structure

Vite + React (JavaScript), single page, no router.

```
index.html                    entry — title, meta, inline SVG favicon
netlify.toml                  build npm run build · publish dist · functions dir
netlify/functions/contact.mjs the one serverless function (POST /api/contact)
src/
  main.jsx                    React root
  App.jsx                     page assembly, top to bottom
  styles.css                  the whole design system (umber-dark, single theme)
  lib/audio.js                one AudioContext: unlock(), tone(), sound switch
  components/
    Header.jsx  Hero.jsx  FactsStrip.jsx  Section.jsx  Footer.jsx
    MemoryHandset.jsx  TvTennis.jsx  Brickfield.jsx  Trail.jsx
    CaveHunt.jsx  TvContact.jsx
```

## Develop

```sh
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # serve the production build
```

## Contact form delivery (optional)

`netlify/functions/contact.mjs` validates every submission (405 on
non-POST, 400 on bad input, length caps). Delivery is optional:

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend API key. **Unset:** submissions are logged and the form still succeeds (`{ ok: true, delivered: false }`). |
| `CONTACT_TO` | Destination inbox. Defaults to `hello@1973.ai`. |
| `CONTACT_FROM` | Verified Resend sender, e.g. `1973.ai <hello@1973.ai>`. |

See `.env.example`.
