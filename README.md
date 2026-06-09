# 1973

An independent agency. Small, useful things on the open web.

## Stack

Vanilla HTML, CSS, and JavaScript. No framework, no build step. One page.

- **Fonts**: Fraunces (serif) + JetBrains Mono, loaded from Google Fonts
- **Forms**: Netlify Forms (no backend required)
- **Deploy**: Netlify, auto-deploy from `main`

## Deploy

Push to `main`. Netlify picks it up automatically and deploys to `https://1973.ai`.

That's it. No build command, no `npm install`.

## Adding a project to the grid

Open `index.html` and find the `<!-- ── PROJECT CARD TEMPLATE ──` comment inside `.work-grid`. Copy the template block and fill in your details:

```html
<article class="card" role="listitem">
  <a class="card-inner card-link" href="https://yourproject.com" target="_blank" rel="noopener noreferrer" aria-label="Project Name — visit yourproject.com">
    <h3 class="card-name">Project Name</h3>
    <p class="card-desc">One-line description of what it does.</p>
    <div class="card-status">
      <span class="status-dot status-live" aria-hidden="true"></span>
      <span class="status-word">Live</span>
      <span class="status-domain">yourproject.com</span>
    </div>
  </a>
</article>
```

**Status options** (change both the dot class and the word):

| Status   | Dot class        | Colour     |
|----------|-----------------|------------|
| Live     | `status-live`    | Vermillion |
| Beta     | `status-beta`    | Amber      |
| Concept  | `status-concept` | Muted grey |
| Dormant  | `status-dormant` | Ink at 30% |

If the project has no URL yet, use a `<div class="card-inner">` instead of `<a>` and set the domain to `—`.

## Contact form

Form submissions go to Netlify Forms automatically. Set up email notifications in the Netlify dashboard under **Forms → contact → Form notifications**, pointing to `j@1973.ai`.

## Files

```
index.html     — single page
styles.css     — all styles
script.js      — minimal form validation (site works without JS)
favicon.svg    — "73" in accent colour
netlify.toml   — headers, CSP, SPA redirect fallback
robots.txt     — open to all crawlers
README.md      — this file
```
