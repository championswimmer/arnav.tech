---
status: complete # planned | in-progress | complete
---

# Make AiUsage a static Astro component

`AiUsage` is a Vue island hydrated with `client:load` in `EssayLayout` and
`PostLayout`, but the component is entirely static — no state, events, or
interactivity. Astro already server-renders it to HTML at build time, so the
`client:load` only ships the Vue runtime + component JS to re-mount a banner
that's already there. Convert it to a plain `.astro` component so it renders as
static HTML with **zero** client JS.

- [x] Port `src/components/vue/AiUsage.vue` → `src/components/AiUsage.astro`
- [x] Update the imports + usages in `EssayLayout.astro` and `PostLayout.astro` (drop `client:load`)
- [x] Delete `src/components/vue/AiUsage.vue`
- [x] Verify with `bun run build` (banner HTML present, no Vue chunk emitted for it)

## Context

Usages (from grep) — only two, both in layouts:

- `src/layouts/EssayLayout.astro:7` import, `:77` `<AiUsage type={aiUsage} client:load />`
- `src/layouts/PostLayout.astro:7` import, `:72` `<AiUsage type={aiUsage} client:load />`

Nothing else references it. `Counter.vue` and `SocialLinks.vue` remain in
`src/components/vue/` and genuinely need Vue, so the `@astrojs/vue` integration
stays.

## Notes

**1. `src/components/AiUsage.astro` (new)**

Mechanical port of the `.vue` file:

- Frontmatter (`---`): keep the same `AiUsageType` union and the `icons` / `config`
  record maps verbatim. Read the prop with
  `const { type } = Astro.props;` typed as `{ type: AiUsageType }`.
- Template: the same `<aside class={...} role="note">` markup. Two substitutions:
  - Vue `:class="['ai-usage', ...]"` → Astro `class={`ai-usage ai-usage--${type}`}`.
  - Vue `v-html="icon"` on the `<svg>` → Astro `<svg ...><Fragment set:html={icon} /></svg>`
    (or interpolate the icon string with `set:html`). The icon bodies are trusted
    literals from the source, so `set:html` is safe here.
- Styles: paste the existing `<style scoped>` block as a plain Astro `<style>`
  (Astro scopes component styles by default, so the selectors and the two
  dark-mode strategies carry over unchanged). Drop the `scoped` keyword.

**2. Update the layouts**

In both `EssayLayout.astro` and `PostLayout.astro`:

- Change the import to `import AiUsage from '../components/AiUsage.astro';`
- Change the usage to `{aiUsage && <AiUsage type={aiUsage} />}` — **remove**
  `client:load`.

**3. Remove the Vue version**

Delete `src/components/vue/AiUsage.vue`.

**4. Verification**

- `bun run build` succeeds; the banner HTML still renders in built essay/post
  pages, in the same styling, light + dark. No hydration script is emitted for
  the banner (it's now server-only). This also removes a small JS payload from
  every essay/post page.

## Relation to the other plan

`2026-08-30-original-source-banner.md` adds a new **`OriginalSource.astro`**
static banner in the same visual family. This plan brings `AiUsage` down to the
same zero-JS bar so both provenance banners are consistent static components.
Either plan can go first; they touch the same two layout files, so whichever
lands second should re-check the banner block above `<slot />`.
