---
status: planned # planned | in-progress | complete
---

# Original-source banner

Add an `originalUrl` field to essays and posts. When present, it marks the piece
as **originally published elsewhere** (my newsletter, another of my sites, or a
publication I wrote for) and renders a banner at the top of the article — styled
to match the existing AI-usage banners — that links out to the original.

- [ ] Add `originalUrl` (optional URL) to the `essays` and `posts` schemas in `src/content.config.ts`
- [ ] Build a new static `OriginalSource.astro` banner component in `src/components/`
- [ ] Render the banner in `EssayLayout.astro` and `PostLayout.astro`, above the `<slot />` alongside the AI banner
- [ ] Optionally add `<link rel="canonical">` pointing at the original URL in `BaseHead.astro`
- [ ] Verify with `bun run build` and a spot-check on a piece carrying the field

## Context

**How the AI banners work today** (the styling to mirror): the three AI-usage
states are reserved *tags* (`ai-free` / `ai-assisted` / `ai-generated`, defined
in `src/lib/tags.ts`). `EssayLayout` and `PostLayout` pick the one present via
`tags.find(isAiUsageTag)` and render `src/components/vue/AiUsage.vue` as a
`client:load` island above the article body. The visual treatment lives in that
component's scoped `<style>`: a flex `<aside role="note">` with an icon, an
uppercase label, and body text, using CSS custom props (`--usage-bg`,
`--usage-border`, `--usage-fg`) set per-variant, with light + dark palettes
following the two-selector strategy from `global.css`
(`@media (prefers-color-scheme: dark) :root:not([data-theme='light'])` **and**
`:root[data-theme='dark']`).

**Why a schema field, not a tag** — unlike the AI states (a fixed enum), the
original source is a free-form URL that also needs to be rendered as a live
hyperlink and (optionally) drive a canonical link. Tags can't carry a value, so
this belongs in the collection schema.

**Why a new Astro component, not extending `AiUsage.vue`** — the AI banner is a
Vue island purely by legacy; this banner is fully static (it just shows a URL),
so an `.astro` component needs no hydration, renders a real `<a>`, and can use
`astro-icon`'s `<Icon>` like `ProjectLayout` already does. It will reuse the
exact `.ai-usage` visual language with a fourth hue so the two banners read as a
family.

**Scope: essays and posts only.** These are "the written word" and are where the
AI banner already appears. Projects (`ProjectLayout`) are showcase pages with no
AI banner and already carry a `url` field for the live project — leave them out
unless the user asks. Slides are out of scope.

## Notes

**1. Schema — `src/content.config.ts`**

Add to both `essays` and `posts` schemas (keep them symmetric):

```ts
originalUrl: z.string().url().optional(),
```

Naming decision: the request said `original_url`, but the codebase is
consistently camelCase in frontmatter (`pubDate`, `heroImage`, `updatedDate`),
and the Zod key *is* the frontmatter key. Recommend **`originalUrl`** for
consistency. (If snake_case in the `.md` frontmatter is preferred, use
`original_url` as the key instead — it's a one-word swap. Flag before building.)

**2. New component — `src/components/OriginalSource.astro`**

- Props: `{ url: string }`. Derive a friendly source label from the host:
  `new URL(url).hostname.replace(/^www\./, '')` → e.g. `newsletter.arnav.tech`.
- Markup mirrors `AiUsage.vue`: `<aside class="original-source" role="note">`
  with an `<Icon name="tabler:external-link" />` (or `tabler:news`), an uppercase
  label ("Originally Published"), and a body line ending in a link:
  *"This article first appeared on [hostname] →"* with
  `<a href={url} target="_blank" rel="noopener">`.
- Copy the `.ai-usage` scoped styles (flex row, `border-left: 4px`, radius,
  `--font-sans`, the `--usage-*` custom props) so spacing/typography match.
  Give it a **fourth hue** distinct from the AI banners — a warm amber/sepia
  accent fits the paper theme and reads as "provenance" rather than "AI", e.g.
  light `--usage-bg:#f5efe2; --usage-border:#a9762f; --usage-fg:#5c3f14`, with a
  darkened dark-mode set (`#2b2416 / #c79a4e / #e6d4a8`). Include both dark-mode
  selectors (`@media prefers-color-scheme: dark :root:not([data-theme='light'])`
  and `:root[data-theme='dark']`), matching `AiUsage.vue`.
- Style the inner `<a>` to inherit the banner `--usage-fg` with an underline so
  it's clearly the actionable element.

**3. Render in the layouts**

In both `EssayLayout.astro` and `PostLayout.astro`:

- Import `OriginalSource` and destructure `originalUrl` from `Astro.props`.
- Render inside the reading `<div>` above `<slot />`, next to the AI banner:

  ```astro
  <div class="reading-essay"> {/* or reading-tech */}
    {originalUrl && <OriginalSource url={originalUrl} />}
    {aiUsage && <AiUsage type={aiUsage} client:load />}
    <slot />
  </div>
  ```

  Order: original-source banner first, AI banner second (provenance before
  process). Both can appear together; their `margin: 0 0 2em` stacks cleanly.

**4. Canonical link (optional but recommended for SEO)**

When a piece is syndicated from elsewhere, search engines should credit the
original. In `src/components/BaseHead.astro`, if an `originalUrl` prop is threaded
through `BaseLayout`, emit `<link rel="canonical" href={originalUrl}>` instead of
the self-canonical. This is a small extra wiring step (add the prop to
`BaseLayout` → `BaseHead`); can be deferred to a follow-up if we only want the
visible banner now. Note the JSON-LD `BlogPosting` could likewise gain a
`sameAs`/`isBasedOn` — optional, low priority.

**5. Verification**

- `bun run build` — confirm no schema/type errors and both layouts compile.
- Temporarily add `originalUrl: https://...` to one essay and one post; run
  `bun run dev` and confirm the banner renders, links out, matches the AI-banner
  styling in both light and dark mode, and stacks correctly when an AI-usage tag
  is also present. Remove the temporary frontmatter (or leave it if a real piece
  qualifies).
