# One Hundred Little Artworks — for Himena

A gallery of **100 artworks, drawn by code**, each one made for Himena
("Mena"). Part of the **Love for Mena** collection.

**Live:** https://menaammarpro.github.io/love-art/

## What it is

There are no image files here. Every piece is generated live on a `<canvas>`
from three things — a **style**, a **palette**, and a **seed**:

- **10 styles** — `bloom`, `constellation`, `meadow`, `petals`, `ripples`,
  `mountain`, `weave`, `mosaic`, `orbit`, `rain`
- **12 palettes** — all white-forward (white is Himena's favourite colour),
  with soft nods to nature, Romania, Pakistan, and warm pizza tones
- **100 seeds** — each artwork is deterministic, so "our" pieces never change

Browse the grid, filter by theme (nature, pizza, art, Romania, Pakistan,
Free Fire, distance…), open any piece to see it large, and **save it as a PNG**.

## Make it ours

- `js/collection-data.js` — the 100 titles, and the style/palette/seed for each
- `js/palettes.js` — the colours (every palette starts from white)
- `js/art-engine.js` — the drawing styles themselves (add a new one and it
  joins `window.MenaArt.styles`)

## Files

- `index.html` — the page
- `css/theme.css` / `css/app.css` — shared theme + this page's styles
- `js/palettes.js`, `js/art-engine.js`, `js/collection-data.js`, `js/app.js`
- `manifest.webmanifest`, `sw.js` — PWA
- `assets/` — favicon and icons

## Run locally

```powershell
py -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy

Static site, deployed with GitHub Pages from `main`.

## License

Creative Commons BY-NC-ND 4.0 — see [`LICENSE`](LICENSE).
© 2026 Ammar (MenaAmmarPro). Made with care for Himena.
