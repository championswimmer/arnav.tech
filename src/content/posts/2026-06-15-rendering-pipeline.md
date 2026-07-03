---
title: The Content Rendering Pipeline
description: How code, diagrams, and math flow from Markdown to the page on this site.
pubDate: 2026-06-15
heroImage: ../../assets/covers/rendering-pipeline.png
tags: ['astro', 'markdown', 'tooling']
draft: false
---

This post exists to exercise every rendering feature the site supports. Tech
writing is set in **Space Grotesk** — a chunky geometric sans — with code in
**JetBrains Mono**.

## Syntax-highlighted code

Code blocks are highlighted at build time with Shiki, using the warm
`rose-pine-dawn` theme so they sit naturally on the sepia page.

```ts
type Pipeline<T> = (input: T) => T;

const compose =
	<T,>(...fns: Pipeline<T>[]): Pipeline<T> =>
	(input) =>
		fns.reduce((acc, fn) => fn(acc), input);
```

Inline code like `remarkMath` and `rehypeKatex` is supported too.

## Diagrams with Mermaid

Fenced ` ```mermaid ` blocks are converted to client-rendered diagrams, themed
to match the palette:

```mermaid
flowchart LR
    MD[Markdown] --> R[remark plugins]
    R --> H[rehype plugins]
    H --> HTML[HTML]
    HTML --> Page[Rendered page]
```

## Math with KaTeX

Inline math such as $e^{i\pi} + 1 = 0$ renders via `remark-math` +
`rehype-katex`. Display math works as well:

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

That's the whole pipeline — Markdown in, highlighted code, diagrams, and
typeset math out.
