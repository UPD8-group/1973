# 1973.ai — the memory console

An arcade of period games, presented as two rooms you walk between: the
warm, wood-and-bakelite **1973** floor and the black-and-neon **1983**
floor. A decade switcher in the header moves between them; the site is a
single page with a tiny hash router (`#/` and `#/eighties`).

Every game uses era **mechanics** only — all the expression (names,
palette, tones, trade dress) is original to this site.

## The 1973 floor — `#/`

| # | Machine | What it is |
|---|---------|------------|
| 01 | **The memory handset** | Repeat a growing tone-and-light sequence on four burnt-palette squares (ember · teal · olive · plum). One wrong square ends the run; best score is remembered. |
| 02 | **Television tennis** | Rally against the machine on a wood-grain TV. Drag anywhere on the screen to move your paddle. First to seven. |
| 03 | **Brickfield** | Knock down a six-row spectrum wall with three balls. Higher rows score more; each row has its own tone. |
| 04 | **Trail** | A green-phosphor grid snake. Steer with arrow keys, WASD, or the on-screen d-pad. Walls — and your own trail — are fatal. |
| 05 | **Starfall** | A fixed-shooter last stand: a fleet of twinkling star-glyphs marches down the night sky. One bolt in the air at a time — drag to aim, tap or space to fire. |
| 06 | **Contact** | A 1973 television set. CH·01 static, CH·02 test card, CH·03 an amber-phosphor contact form that transmits to the studio. The contact set always closes the &rsquo;73 floor. |

## The 1983 floor — `#/eighties`

A black-and-neon outrun room (indigo ground, hot magenta + cyan, glowing
grid). Reached from the header switcher; it closes with a neon sign-off
that walks you back to the contact television in the &rsquo;73 room.

| # | Machine | What it is |
|---|---------|------------|
| 01 | **Drifter** | A vector rock-shooter. Thrust, turn, and wrap around the edges; shoot drifting rocks that split as they break. Three ships. |
| 02 | **Rush** | Cross lanes of traffic and a river of drifting logs to reach the top. Hop with the pad or the arrow keys. |
| 03 | **Prowl** | Clear a glowing maze of dots while abstract sentries hunt you; power dots turn the tables briefly. |
| 04 | **Cascade** | Fit falling blocks into a well; full rows clear and the drop quickens as you go. |

All games (both floors) are fully touch-playable, only animate after you
press start, have a Start **and** Stop control, respect
`prefers-reduced-motion`, and share one master sound switch in the header
(persisted, like the best scores, in `localStorage`).

## Stack & structure

Vite + React (JavaScript), single page, hash-routed by decade.

```
index.html                    entry — title, meta, inline SVG favicon
netlify.toml                  build npm run build · publish dist · functions dir
netlify/functions/contact.mjs the one serverless function (POST /api/contact)
src/
  main.jsx                    React root
  App.jsx                     hash router → the two decade pages
  styles.css                  the design system (umber-dark) + scoped 80s neon theme
  lib/audio.js                one AudioContext: unlock(), tone(), sound switch
  lib/route.js                hash route hook + section scrolling
  pages/
    Seventies.jsx             the '73 floor, top to bottom
    Eighties.jsx              the '83 floor, top to bottom
  components/
    Header.jsx  Footer.jsx  Section.jsx
    Hero.jsx  FactsStrip.jsx                          — '73 furniture
    MemoryHandset.jsx  TvTennis.jsx  Brickfield.jsx
    Trail.jsx  Starfall.jsx  TvContact.jsx            — '73 machines
    EightiesHero.jsx                                  — '83 furniture
    Drifter.jsx  Rush.jsx  Prowl.jsx  Cascade.jsx     — '83 machines
```

The 80s theme is a scoped override: `[data-decade='eighties']` remaps the
shared design tokens, so the common components (buttons, eyebrows,
headings, header, footer) re-skin to neon automatically while the '73
machines — which only ever render on the '73 floor — stay untouched.

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
