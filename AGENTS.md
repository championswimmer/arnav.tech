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

Three content collections, defined in `src/content.config.ts`:

| Collection | Format    | Location                | Layout                | Notes                            |
| ---------- | --------- | ----------------------- | --------------------- | -------------------------------- |
| `essays`   | Markdown  | `src/content/essays/`   | `EssayLayout.astro`   | Long-form writing, serif         |
| `posts`    | MD or MDX | `src/content/posts/`    | `PostLayout.astro`    | Tech articles; code/math/mermaid |
| `projects` | MDX       | `src/content/projects/` | `ProjectLayout.astro` | Showcases; embed Vue islands     |

- **Essays and posts** are the written word — prefer Markdown.
- **Projects** are MDX so they can embed live interactive components.
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

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and
`astro dev logs`. Build with `bun run build`; the package manager is **bun**.

## Authoring new content

Slash commands scaffold front-matter-correct files:

- `/new-essay <title>` — a Markdown essay in `src/content/essays/`
- `/new-post <title>` — a tech post in `src/content/posts/`
- `/new-project <title>` — an MDX project page in `src/content/projects/`

## Documentation

Full Astro documentation: https://docs.astro.build

- [Routing & dynamic routes](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Framework components (Vue)](https://docs.astro.build/en/guides/framework-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Styling](https://docs.astro.build/en/guides/styling/)
- [Fonts](https://docs.astro.build/en/guides/fonts/)
