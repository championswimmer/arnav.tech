---
name: slides
description: >-
  Manage, import, configure, and generate thumbnails for presentations (Reveal.js and SpeakerDeck)
  on arnav.tech. Use when adding new slide decks, importing Reveal.js presentations from Obsidian/external folders,
  generating slide thumbnails/covers via headless Chrome, or updating slide metadata.
---

# Slides Management Skill

This skill guides adding, importing, maintaining, and generating thumbnails for presentations in `arnav.tech`.

---

## 1. Slide Types: Reveal.js vs. SpeakerDeck

The site supports two distinct presentation types in `src/data/slides.json`:

| Property | Reveal.js Decks (`type: "revealjs"`) | SpeakerDeck Presentations (`type: "speakerdeck"`) |
| :--- | :--- | :--- |
| **Location** | Self-contained folder in `src/data/slides/[slug]/` | Hosted externally on `speakerdeck.com` |
| **Required Files** | `index.html`, `styles.css`, `assets/`, `cover.png` | None in repository |
| **Excluded Files** | `.md` notes, `.pdf` exports, `screenshots/` | N/A |
| **Embed Component** | `<RevealSlides slug={slug} title={title} />` | `<SpeakerDeckEmbed url={url} title={title} />` |
| **Direct Deck URL** | `/slides/[slug]/deck/` | `https://speakerdeck.com/...` |
| **Cover Thumbnail** | Generated `/slides/[slug]/deck/cover.png` | External CDN image (`preview_slide_0.jpg`) |

Detailed references:
- [Reveal.js Architecture & Setup](./references/revealjs.md)
- [SpeakerDeck Integration Guide](./references/speakerdeck.md)

---

## 2. Importing a Reveal.js Slide Deck

When importing a Reveal.js presentation from an external directory (e.g. Obsidian course vault):

### Step 1: Copy only presentation runtime files
Copy `index.html`, `styles.css`, and the `assets/` subfolder. **Never** copy markdown drafts/notes, PDF exports, or scratch files.

```bash
mkdir -p src/data/slides/<slug>/assets
cp /path/to/source/index.html src/data/slides/<slug>/
cp /path/to/source/styles.css src/data/slides/<slug>/
cp -R /path/to/source/assets/ src/data/slides/<slug>/assets/
```

### Step 2: Register entry in `src/data/slides.json`
Add the deck metadata at the top of the array in reverse-chronological order:

```json
{
  "id": "<slug>",
  "slug": "<slug>",
  "type": "revealjs",
  "title": "<Presentation Title>",
  "description": "<One-sentence subtitle or abstract>",
  "date": "YYYY-MM-DD",
  "cover": "/slides/<slug>/deck/cover.png"
}
```

---

## 3. Generating Slide Thumbnails (Headless Screenshot)

To generate a crisp 16:9 thumbnail from the presentation's title slide using Headless Chrome and `sharp`:

### Generate for a single deck:
```bash
bun run .agents/skills/slides/scripts/generate-thumbnail.ts <slug>
```

### Generate for all Reveal.js decks:
```bash
bun run .agents/skills/slides/scripts/generate-thumbnail.ts --all
```

### Options:
- `<slug>`: Slug of the slide deck under `src/data/slides/`.
- `--all`: Process all slide directories containing `index.html`.
- `--path <dir>`: Target an arbitrary deck directory.
- `--output <path>`: Custom output image path.
- `--width <px>` & `--height <px>`: Target dimensions (defaults to `1280x720`).
- `--update-json` (default `true`): Automatically updates `cover` in `src/data/slides.json`.

---

## 4. Verification & Deployment

1. **Test Build**:
   ```bash
   bun run build
   ```
2. **Preview Locally**:
   ```bash
   bun run preview
   ```
3. **Commit and Push**:
   ```bash
   git add src/data/slides.json src/data/slides/
   git commit -m "Add <slide-name> presentation deck and thumbnail"
   git push origin main
   ```
