"use strict";

/*
 * MenaArt — a tiny generative art engine.
 *
 * Every piece is drawn live on a <canvas> from a seed, a style, and a
 * palette. No image files: the same seed always makes the same artwork, so
 * "our" pieces stay exactly as they are, but a new seed makes a brand new
 * one. Edit js/collection-data.js to add or change pieces.
 *
 * window.MenaArt.render(canvas, work, size) -> draws `work` at size×size.
 * window.MenaArt.styles -> the list of available style names.
 */
(function () {
  "use strict";

  function mulberry32(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rr = (r, a, b) => a + r() * (b - a);
  const ri = (r, a, b) => Math.floor(a + r() * (b - a + 1));
  const pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length];

  function fillBackground(ctx, w, h, pal) {
    ctx.fillStyle = pal.background;
    ctx.fillRect(0, 0, w, h);
  }

  /* ------------------------------ styles ------------------------------ */

  function bloom(ctx, w, h, r, pal) {
    const n = ri(r, 4, 7);
    for (let i = 0; i < n; i += 1) {
      const cx = rr(r, w * 0.15, w * 0.85);
      const cy = rr(r, h * 0.15, h * 0.85);
      const R = rr(r, Math.min(w, h) * 0.08, Math.min(w, h) * 0.24);
      const col = pick(r, pal.colors);
      const petals = ri(r, 5, 9);
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = col;
      for (let p = 0; p < petals; p += 1) {
        const a = (p / petals) * Math.PI * 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.ellipse(0, -R * 0.55, R * 0.34, R * 0.66, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = pick(r, pal.colors);
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function meadow(ctx, w, h, r, pal) {
    const sun = rr(r, w * 0.2, w * 0.8);
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = pick(r, pal.colors);
    ctx.beginPath();
    ctx.arc(sun, h * 0.22, Math.min(w, h) * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const blades = ri(r, 45, 90);
    for (let i = 0; i < blades; i += 1) {
      const x = rr(r, 0, w);
      const bh = rr(r, h * 0.14, h * 0.5);
      const lean = rr(r, -w * 0.06, w * 0.06);
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = pick(r, pal.colors);
      ctx.lineWidth = rr(r, 1, 2.6);
      ctx.beginPath();
      ctx.moveTo(x, h);
      ctx.quadraticCurveTo(x + lean * 0.5, h - bh * 0.6, x + lean, h - bh);
      ctx.stroke();
    }

    const flowers = ri(r, 6, 12);
    for (let i = 0; i < flowers; i += 1) {
      const x = rr(r, w * 0.05, w * 0.95);
      const y = rr(r, h * 0.55, h * 0.95);
      const s = rr(r, 3, 7);
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = pick(r, pal.colors);
      for (let k = 0; k < 5; k += 1) {
        const a = (k / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * s * 0.7, y + Math.sin(a) * s * 0.7, s * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = pick(r, pal.colors);
      ctx.beginPath();
      ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function ripples(ctx, w, h, r, pal) {
    const centers = ri(r, 1, 3);
    for (let c = 0; c < centers; c += 1) {
      const cx = rr(r, w * 0.25, w * 0.75);
      const cy = rr(r, h * 0.25, h * 0.75);
      const rings = ri(r, 9, 18);
      const maxR = Math.max(w, h) * rr(r, 0.35, 0.6);
      const col = pick(r, pal.colors);
      for (let i = 0; i < rings; i += 1) {
        ctx.globalAlpha = 0.22;
        ctx.strokeStyle = col;
        ctx.lineWidth = rr(r, 0.6, 2.2);
        ctx.beginPath();
        ctx.arc(cx, cy, ((i + 1) / rings) * maxR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  function constellation(ctx, w, h, r, pal) {
    const n = ri(r, 14, 24);
    const pts = [];
    for (let i = 0; i < n; i += 1) {
      pts.push({ x: rr(r, w * 0.08, w * 0.92), y: rr(r, h * 0.08, h * 0.92) });
    }
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    ctx.lineWidth = 1;
    pts.forEach((p) => {
      const near = pts
        .filter((q) => q !== p)
        .sort((a, b) => dist(a, p) - dist(b, p))
        .slice(0, 2);
      near.forEach((q) => {
        ctx.globalAlpha = 0.22;
        ctx.strokeStyle = pick(r, pal.colors);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      });
    });
    pts.forEach((p, i) => {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = i === 0 ? pick(r, pal.colors) : pick(r, pal.colors);
      ctx.beginPath();
      ctx.arc(p.x, p.y, i === 0 ? rr(r, 3, 5) : rr(r, 1.4, 3), 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function petals(ctx, w, h, r, pal) {
    const n = ri(r, 26, 52);
    for (let i = 0; i < n; i += 1) {
      const x = rr(r, 0, w);
      const y = rr(r, 0, h);
      const s = rr(r, 6, 22);
      const a = rr(r, 0, Math.PI * 2);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = pick(r, pal.colors);
      ctx.beginPath();
      ctx.ellipse(0, 0, s, s * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function mountain(ctx, w, h, r, pal) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = pick(r, pal.colors);
    ctx.beginPath();
    ctx.arc(w * rr(r, 0.2, 0.8), h * 0.24, Math.min(w, h) * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const layers = 3;
    for (let l = 0; l < layers; l += 1) {
      const base = h * (0.42 + 0.16 * l);
      ctx.globalAlpha = 0.5 + 0.16 * l;
      ctx.fillStyle = pick(r, pal.colors);
      ctx.beginPath();
      ctx.moveTo(0, base);
      let x = 0;
      while (x < w) {
        const nx = x + rr(r, w * 0.08, w * 0.22);
        const peak = base - rr(r, h * 0.06, h * 0.26);
        ctx.quadraticCurveTo((x + nx) / 2, peak, nx, base - rr(r, -8, 8));
        x = nx;
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
    }
  }

  function weave(ctx, w, h, r, pal) {
    const c1 = pick(r, pal.colors);
    const c2 = pick(r, pal.colors);
    const cols = ri(r, 6, 10);
    const cw = w / cols;
    const ch = h / cols;
    ctx.lineWidth = rr(r, 2, 5);
    for (let i = 0; i < cols; i += 1) {
      for (let j = 0; j < cols; j += 1) {
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = (i + j) % 2 ? c1 : c2;
        const x = i * cw;
        const y = j * ch;
        ctx.beginPath();
        if ((i + j) % 2) {
          ctx.arc(x + cw / 2, y + ch, ch / 2, Math.PI, 0);
        } else {
          ctx.arc(x, y + ch / 2, cw / 2, -Math.PI / 2, Math.PI / 2);
        }
        ctx.stroke();
      }
    }
  }

  function mosaic(ctx, w, h, r, pal) {
    const n = ri(r, 6, 10);
    const cw = w / n;
    const ch = h / n;
    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n; j += 1) {
        const x = i * cw;
        const y = j * ch;
        const col = pick(r, pal.colors);
        const mode = ri(r, 0, 3);
        ctx.globalAlpha = rr(r, 0.5, 0.95);
        ctx.fillStyle = col;
        ctx.beginPath();
        if (mode === 0) {
          ctx.rect(x + 1, y + 1, cw - 2, ch - 2);
          ctx.fill();
        } else if (mode === 1) {
          ctx.moveTo(x + 1, y + 1);
          ctx.lineTo(x + cw - 1, y + 1);
          ctx.lineTo(x + 1, y + ch - 1);
          ctx.closePath();
          ctx.fill();
        } else if (mode === 2) {
          ctx.arc(x + cw / 2, y + ch / 2, Math.min(cw, ch) / 2 - 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.moveTo(x + cw / 2, y + ch / 2);
          ctx.arc(x + cw / 2, y + ch / 2, Math.min(cw, ch) / 2 - 2, 0, Math.PI / 2);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }

  function orbit(ctx, w, h, r, pal) {
    const cx = w / 2;
    const cy = h / 2;
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = pick(r, pal.colors);
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(w, h) * 0.06, 0, Math.PI * 2);
    ctx.fill();

    const orbits = ri(r, 3, 6);
    for (let i = 0; i < orbits; i += 1) {
      const a = rr(r, Math.min(w, h) * 0.12, Math.min(w, h) * 0.44);
      const b = a * rr(r, 0.4, 0.8);
      const rot = rr(r, 0, Math.PI);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(rot);
      ctx.globalAlpha = 0.33;
      ctx.strokeStyle = pick(r, pal.colors);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, a, b, 0, 0, Math.PI * 2);
      ctx.stroke();
      const t = rr(r, 0, Math.PI * 2);
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = pick(r, pal.colors);
      ctx.beginPath();
      ctx.arc(a * Math.cos(t), b * Math.sin(t), rr(r, 3, 8), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function rain(ctx, w, h, r, pal) {
    const n = ri(r, 60, 140);
    for (let i = 0; i < n; i += 1) {
      const x = rr(r, -w * 0.2, w);
      const y = rr(r, 0, h);
      const len = rr(r, h * 0.05, h * 0.18);
      ctx.globalAlpha = rr(r, 0.08, 0.26);
      ctx.strokeStyle = pick(r, pal.colors);
      ctx.lineWidth = rr(r, 0.6, 1.6);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len * 0.35, y + len);
      ctx.stroke();
    }
    const puddles = ri(r, 2, 5);
    for (let i = 0; i < puddles; i += 1) {
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = pick(r, pal.colors);
      ctx.beginPath();
      ctx.ellipse(rr(r, w * 0.15, w * 0.85), h * rr(r, 0.82, 0.95), rr(r, w * 0.06, w * 0.2), rr(r, h * 0.012, h * 0.03), 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const styles = {
    bloom: bloom,
    meadow: meadow,
    ripples: ripples,
    constellation: constellation,
    petals: petals,
    mountain: mountain,
    weave: weave,
    mosaic: mosaic,
    orbit: orbit,
    rain: rain
  };

  const styleNames = Object.keys(styles);

  function render(canvas, work, size) {
    const px = Math.max(64, Math.round(size || 512));
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    const pal =
      (window.MENA_PALETTES && window.MENA_PALETTES[work.palette]) ||
      { background: "#ffffff", colors: ["#cccccc", "#999999"] };
    const rng = mulberry32((work.seed || 1) * 2654435761);

    ctx.clearRect(0, 0, px, px);
    fillBackground(ctx, px, px, pal);
    const fn = styles[work.style] || styles.bloom;
    ctx.save();
    fn(ctx, px, px, rng, pal, work);
    ctx.restore();
    return canvas;
  }

  window.MenaArt = {
    render: render,
    styles: styleNames,
    mulberry32: mulberry32
  };
})();
