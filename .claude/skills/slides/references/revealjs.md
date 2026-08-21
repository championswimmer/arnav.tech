# Reveal.js Presentations Guide

This reference explains how Reveal.js presentations are structured, served, embedded, and maintained in `arnav.tech`.

---

## 1. Directory Structure

Reveal.js decks are self-contained HTML/CSS presentations stored in `src/data/slides/[slug]/`:

```text
src/data/slides/<slug>/
├── index.html          # Main Reveal.js presentation markup
├── styles.css          # Custom styling & presentation theme
├── cover.png           # Generated first-slide thumbnail (1280x720)
└── assets/             # Presentation image assets & diagrams
    ├── diagram-1.png
    └── diagram-2.png
```

### What to Copy vs. What to Exclude
When copying/importing Reveal.js decks from external Obsidian vaults or repo sources:
- **INCLUDE**: `index.html`, `styles.css`, `assets/` (images, SVGs, charts referenced by the deck).
- **EXCLUDE**: `.md` files (`draft.md`, `sources.md`, `presenter-guide.md`), `.pdf` files, `.DS_Store`, and scratch folders (e.g. `screenshots/`).

---

## 2. Dynamic Serving Architecture

Reveal.js presentations are served statically by Astro endpoints:
- `src/pages/slides/[slug]/deck/index.html.ts` — serves `index.html` with `text/html; charset=utf-8`.
- `src/pages/slides/[slug]/deck/[...file].ts` — serves all supporting files (`styles.css`, `cover.png`, `assets/*`) matching their content types.

This allows decks to be accessed directly at `/slides/<slug>/deck/` for fullscreen presentation mode without requiring separate build steps per deck.

---

## 3. Embedding on Slide Pages

The Astro page for the talk (`src/pages/slides/[...slug].astro`) uses `SlideLayout.astro`:
- For `type: "revealjs"`, it renders `<RevealSlides slug={slug} title={title} />`.
- `<RevealSlides />` creates an interactive 16:9 `<reveal-slides>` container embedding `/slides/${slug}/deck/` in an `<iframe>` with:
  - An inline "Present Fullscreen ↗" button opening the deck in a dedicated window.
  - Keyboard navigation pass-through and focus handling.

---

## 4. Thumbnail & Cover Generation

Slide listing cards in `/slides` display a cover thumbnail when available.

To generate a crisp, optimized cover image for Reveal.js slides:
1. Run the thumbnail generator script:
   ```bash
   bun run .agents/skills/slides/scripts/generate-thumbnail.ts <slug>
   ```
2. The script:
   - Launches Headless Chrome at 1280x720 with `--allow-file-access-from-files`.
   - Renders the presentation's title slide.
   - Resizes and compresses the screenshot using `sharp` to `src/data/slides/<slug>/cover.png` (~20KB).
   - Automatically updates `cover: "/slides/<slug>/deck/cover.png"` in `src/data/slides.json`.
