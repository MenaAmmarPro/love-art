"use strict";

/*
 * love-art — the gallery.
 *
 * Renders all one hundred works in js/collection-data.js using the engine in
 * js/art-engine.js, filters them by theme, opens any piece large, and lets
 * you save it as a PNG.
 */
(function () {
  const WORKS = Array.isArray(window.MENA_ART) ? window.MENA_ART : [];
  const engine = window.MenaArt;

  const els = {
    gallery: document.getElementById("gallery-grid"),
    chips: document.getElementById("chips"),
    count: document.getElementById("gallery-count"),
    empty: document.getElementById("gallery-empty"),
    surprise: document.getElementById("surprise"),
    lightbox: document.getElementById("lightbox"),
    canvas: document.getElementById("lightbox-canvas"),
    close: document.getElementById("lightbox-close"),
    title: document.getElementById("lightbox-title"),
    num: document.getElementById("lightbox-num"),
    meta: document.getElementById("lightbox-meta"),
    download: document.getElementById("lightbox-download"),
    prev: document.getElementById("lightbox-prev"),
    next: document.getElementById("lightbox-next")
  };

  let filter = "all";
  let visible = WORKS.slice();
  let currentIndex = 0;

  function slug(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function labelFor(tag) {
    const labels = {
      all: "All 100",
      nature: "Nature",
      pizza: "Pizza",
      art: "Art",
      romania: "Romania",
      pakistan: "Pakistan",
      freefire: "Free Fire",
      distance: "Distance",
      always: "Always"
    };
    return labels[tag] || tag.charAt(0).toUpperCase() + tag.slice(1);
  }

  function metaFor(work) {
    const tags = (work.tags || []).map(labelFor);
    return work.style + " \u00b7 " + work.palette + (tags.length ? " \u00b7 " + tags.join(", ") : "");
  }

  /* ---------- grid ---------- */
  function makeCard(work, observer) {
    const card = document.createElement("figure");
    card.className = "art-card";
    card.dataset.id = String(work.id);
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Open artwork " + work.id + ": " + work.title);

    const canvas = document.createElement("canvas");
    canvas.className = "art-thumb";
    canvas.width = 240;
    canvas.height = 240;

    const caption = document.createElement("figcaption");
    caption.className = "art-caption";
    const num = document.createElement("span");
    num.className = "art-num";
    num.textContent = String(work.id).padStart(3, "0");
    const title = document.createElement("span");
    title.className = "art-title";
    title.textContent = work.title;
    caption.appendChild(num);
    caption.appendChild(title);

    card.appendChild(canvas);
    card.appendChild(caption);

    function open() { openLightbox(work); }
    card.addEventListener("click", open);
    card.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        open();
      }
    });

    if (observer) {
      observer.observe(canvas);
    } else if (engine) {
      engine.render(canvas, work, 240);
    }
    return card;
  }

  function renderGrid() {
    if (!els.gallery) return;
    els.gallery.textContent = "";

    let observer = null;
    if (typeof window.IntersectionObserver === "function") {
      observer = new window.IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const canvas = entry.target;
          const work = WORKS.find(function (wk) { return String(wk.id) === canvas.parentNode.dataset.id; });
          if (work && engine) engine.render(canvas, work, 240);
          observer.unobserve(canvas);
        });
      }, { rootMargin: "200px" });
    }

    visible.forEach(function (work) {
      els.gallery.appendChild(makeCard(work, observer));
    });

    if (els.count) {
      els.count.textContent = visible.length + (visible.length === 1 ? " piece" : " pieces");
    }
    if (els.empty) {
      els.empty.hidden = visible.length !== 0;
    }
  }

  /* ---------- filters ---------- */
  function buildChips() {
    if (!els.chips) return;
    const tags = [];
    WORKS.forEach(function (work) {
      (work.tags || []).forEach(function (tag) {
        if (tags.indexOf(tag) === -1) tags.push(tag);
      });
    });
    tags.sort();

    const options = [{ id: "all", label: "All 100" }].concat(
      tags.map(function (tag) { return { id: tag, label: labelFor(tag) }; })
    );

    els.chips.textContent = "";
    options.forEach(function (opt) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (opt.id === filter ? " is-active" : "");
      btn.dataset.filter = opt.id;
      btn.textContent = opt.label;
      btn.addEventListener("click", function () { setFilter(opt.id); });
      els.chips.appendChild(btn);
    });
  }

  function setFilter(next) {
    filter = next;
    visible = filter === "all"
      ? WORKS.slice()
      : WORKS.filter(function (w) { return (w.tags || []).indexOf(filter) !== -1; });
    if (els.chips) {
      Array.prototype.forEach.call(els.chips.children, function (btn) {
        btn.classList.toggle("is-active", btn.dataset.filter === filter);
      });
    }
    renderGrid();
  }

  /* ---------- lightbox ---------- */
  function setLightbox(work) {
    if (els.canvas && engine) engine.render(els.canvas, work, 768);
    if (els.num) els.num.textContent = String(work.id).padStart(3, "0");
    if (els.title) els.title.textContent = work.title;
    if (els.meta) els.meta.textContent = metaFor(work);
    if (els.lightbox) els.lightbox.dataset.open = "true";
  }

  function openLightbox(work) {
    const idx = visible.indexOf(work);
    currentIndex = idx >= 0 ? idx : 0;
    setLightbox(work);
  }

  function step(delta) {
    if (!visible.length) return;
    currentIndex = (currentIndex + delta + visible.length) % visible.length;
    setLightbox(visible[currentIndex]);
  }

  function closeLightbox() {
    if (els.lightbox) els.lightbox.dataset.open = "false";
  }

  function download() {
    const work = visible[currentIndex];
    if (!work || !els.canvas || typeof els.canvas.toDataURL !== "function") return;
    let url;
    try {
      url = els.canvas.toDataURL("image/png");
    } catch (err) {
      return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = "himena-" + String(work.id).padStart(3, "0") + "-" + slug(work.title) + ".png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function surprise() {
    const pool = visible.length ? visible : WORKS;
    if (!pool.length) return;
    const work = pool[Math.floor(Math.random() * pool.length)];
    openLightbox(work);
  }

  /* ---------- init ---------- */
  function init() {
    buildChips();
    renderGrid();
    if (els.surprise) els.surprise.addEventListener("click", surprise);
    if (els.close) els.close.addEventListener("click", closeLightbox);
    if (els.download) els.download.addEventListener("click", download);
    if (els.prev) els.prev.addEventListener("click", function () { step(-1); });
    if (els.next) els.next.addEventListener("click", function () { step(1); });
    if (els.lightbox) {
      els.lightbox.addEventListener("click", function (ev) {
        if (ev.target === els.lightbox) closeLightbox();
      });
    }
    document.addEventListener("keydown", function (ev) {
      if (!els.lightbox || els.lightbox.dataset.open !== "true") return;
      if (ev.key === "Escape") closeLightbox();
      else if (ev.key === "ArrowLeft") step(-1);
      else if (ev.key === "ArrowRight") step(1);
    });

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").catch(function () {});
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
