# arnav.tech

The personal website of **Arnav Gupta** — a sepia, "written" personal site for
essays, technical writing, and project showcases. Built with Astro.

> `CLAUDE.md` is a symlink to this file; edit `AGENTS.md` to update both.

## Design language

A warm, paper-like sepia theme. The site speaks in three typographic voices,
defined as CSS variables in `src/styles/global.css` and loaded via Astro's
font API in `astro.config.mjs`:

| Voice           | CSS var        | Font           | Used for                          |
| --------------- | -------------- | -------------- | --------------------------------- |
| Editorial serif | `--font-essay` | Newsreader     | Essays — inky, written, drop-caps |
| Geometric sans  | `--font-sans`  | Space Grotesk  | Tech posts & all UI chrome        |
| Monospace       | `--font-mono`  | JetBrains Mono | Code snippets, chips, diagrams    |

Layouts apply a reading treatment via a class on `<article>`:
`.reading-essay` (serif, drop-cap) or `.reading-tech` (geometric sans body,
mono code). Keep new pages on the sepia palette — use the `--paper*`, `--ink*`,
`--rule`, and `--accent` variables rather than hard-coded colors.

## Content model

Content collections defined in `src/content.config.ts`:

| Collection | Format    | Location                | Layout                | Notes                            |
| ---------- | --------- | ----------------------- | --------------------- | -------------------------------- |
| `essays`   | MD or MDX | `src/content/essays/`   | `EssayLayout.astro`   | Long-form writing, serif         |
| `posts`    | MD or MDX | `src/content/posts/`    | `PostLayout.astro`    | Tech articles; code/math/mermaid |
| `projects` | MDX       | `src/content/projects/` | `ProjectLayout.astro` | Showcases; embed Vue islands     |
| `slides`   | JSON      | `src/data/slides.json`  | `SlideLayout.astro`   | Talk decks (SpeakerDeck / Reveal.js) |

- **Essays and posts** are the written word — prefer Markdown. Switch a piece to
  `.mdx` only when it needs to embed a component; Markdown cannot import one.
- **Projects** are MDX so they can embed live interactive components.
- **Slides** support two types in `src/data/slides.json`:
  - `speakerdeck`: presentations hosted on SpeakerDeck. Requires `url` and `cover` in `src/data/slides.json`. Embedded via `<SpeakerDeckEmbed />`.
  - `revealjs`: self-contained HTML presentations stored in `src/data/slides/[slug]/` containing `index.html`, `styles.css`, and `assets/` (exclude `.md` notes). Served statically at `/slides/[slug]/deck/` and embedded on talk pages via `<RevealSlides slug={slug} title={title} />` (`<reveal-slides>` iframe container with fullscreen launcher).
- All schemas support `draft: true`, which excludes an entry from listings,
  routes, and RSS. Routes are generated in `src/pages/<collection>/[...slug].astro`.

## Rich content support

Configured globally in `astro.config.mjs` so it works in every md/mdx file:

- **Syntax highlighting** — Shiki, `rose-pine-dawn` theme (warm on sepia).
- **Math** — `remark-math` + `rehype-katex`. Inline `$...$`, block `$$...$$`.
  KaTeX CSS is imported in `src/components/BaseHead.astro`.
- **Mermaid** — fenced ` ```mermaid ` blocks. A custom remark plugin
  (`src/plugins/remark-mermaid.mjs`) rewrites them to `<pre class="mermaid">`
  before highlighting; `src/components/Mermaid.astro` renders them client-side,
  themed to the palette. Layouts that may contain diagrams include `<Mermaid />`.

Note: remark/rehype plugins are passed through `markdown.processor = unified({...})`
(the Astro v7 API), **not** the deprecated `markdown.remarkPlugins`.

## Interactive components

Live web components are **Vue** (`@astrojs/vue`), kept in `src/components/vue/`.
Embed them in `.mdx` project pages and hydrate with a `client:*` directive,
e.g. `<Counter client:visible />`. See `src/content/projects/this-website.mdx`.

## Figures

Hand-drawn SVG illustrations for a piece of writing live in
`src/components/figures/` as `.astro` components — never as raw `<svg>` in the
content file. Keep the SVG unitless and style it with the palette variables in a
scoped `<style>` so it follows light and dark mode; take the caption as a
`<slot />` so the prose stays in the article. See
`src/components/figures/GrowthSlopes.astro`.

## Development

The package manager is **bun**. All commands run from the project root:

| Command           | Action                                        |
| ------------------ | ---------------------------------------------- |
| `bun install`       | Install dependencies                          |
| `bun run dev`       | Start local dev server at `localhost:4321`    |
| `bun run build`     | Build the production site to `./dist/`        |
| `bun run preview`   | Preview the build locally before deploying    |

When starting the dev server yourself (not the user), use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and
`astro dev logs`.

## Deployment

`.github/workflows/deploy.yml` builds with `bun run build` and publishes
`./dist` to GitHub Pages (custom domain `arnav.tech`) on every push to
`main`. There's no manual deploy step — commit and push after every change
(see the Git workflow note above) and CI handles the rest.

## Authoring new content

Write website copy for external visitors, not for the coding agent or project maintainers.
Do not put implementation instructions, prompt text, task descriptions, or other
meta commentary about what the agent was asked to build into site content unless
the user explicitly wants that surfaced on the public site.

Slash commands scaffold front-matter-correct files:

- `/new-essay <title>` — a Markdown essay in `src/content/essays/`
- `/new-post <title>` — a tech post in `src/content/posts/`
- `/new-project <title>` — an MDX project page in `src/content/projects/`

## Plans

Implementation plans live in `.claude/plans/`. Each plan file:

- Is named with a `yyyy-mm-dd-` date prefix followed by a kebab-case slug,
  e.g. `2026-08-30-add-search.md`.
- Opens with a Markdown checklist of the plan's steps, right below the title.
- Carries a `status` field in its YAML frontmatter (`planned`, `in-progress`,
  or `complete`). Mark a plan `complete` when all its steps are done.
- When you start a new plan, first delete every older plan already marked
  `complete` — run `.claude/skills/planning/scripts/clean-plans.sh`.

See the `planning` skill for the full workflow and a plan template to copy.

## Git workflow

Always commit and push after making changes — don't leave work uncommitted
on `main`. Do this by default without waiting to be asked, unless the change
looks incomplete or half-finished; in that case hold off and confirm first.

## Documentation

Full Astro documentation: https://docs.astro.build

- [Routing & dynamic routes](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Framework components (Vue)](https://docs.astro.build/en/guides/framework-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Styling](https://docs.astro.build/en/guides/styling/)
- [Fonts](https://docs.astro.build/en/guides/fonts/)
