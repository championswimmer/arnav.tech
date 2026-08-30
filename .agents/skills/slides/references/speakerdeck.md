# SpeakerDeck Presentations Guide

This reference explains how SpeakerDeck-hosted presentations are integrated into `arnav.tech`.

---

## 1. Data Model & Configuration

SpeakerDeck presentations are hosted externally on [SpeakerDeck](https://speakerdeck.com). In `src/data/slides.json`, each entry is defined as:

```json
{
  "id": "startups-monoliths-and-microservices",
  "slug": "startups-monoliths-and-microservices",
  "type": "speakerdeck",
  "title": "Startups, Monoliths and Microservices",
  "description": "Reflections on architecture trade-offs between monoliths and microservices in growing teams.",
  "date": "2022-08-10",
  "url": "https://speakerdeck.com/championswimmer/startups-monoliths-and-microservices",
  "cover": "https://files.speakerdeck.com/presentations/0e8d191e447a4d11875dcf87a501f513/preview_slide_0.jpg?22319277"
}
```

### Required Properties for SpeakerDeck Slides:
- `id` / `slug`: Unique identifier for URL route (`/slides/<slug>/`).
- `type`: Must be `"speakerdeck"`.
- `title`: Title of the presentation.
- `description`: Short summary/abstract of the talk.
- `date`: Presentation date in `YYYY-MM-DD` format.
- `url`: Canonical SpeakerDeck URL (`https://speakerdeck.com/<user>/<deck>`).
- `cover`: Preview image URL from SpeakerDeck CDN (`preview_slide_0.jpg`).

---

## 2. Rendering & Embedding

- **Page Layout**: `SlideLayout.astro` renders `<SpeakerDeckEmbed url={url} title={title} />`.
- **Embed Mechanism**: `<SpeakerDeckEmbed />` uses the official SpeakerDeck responsive `data-id` or iframe embed script.
- **Listing View**: `src/pages/slides.astro` uses the `cover` URL directly to render the presentation preview card with a `SPEAKERDECK` badge.
