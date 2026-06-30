---
description: Scaffold a new technical post in src/content/posts/
---

Create a new tech post for arnav.tech from the title: **$ARGUMENTS**

Steps:
1. Slugify the title (kebab-case) for the filename.
2. Create `src/content/posts/<slug>.md` (use `.mdx` only if it needs Vue
   components) with this frontmatter:

   ```md
   ---
   title: <title>
   description: <one-line summary>
   pubDate: <YYYY-MM-DD>
   tags: []
   draft: true
   ---
   ```

3. Posts support fenced code blocks (Shiki), ` ```mermaid ` diagrams, and
   KaTeX math (`$...$`, `$$...$$`). Add a brief intro paragraph.
4. Posts render with the `.reading-tech` treatment (Space Grotesk body,
   JetBrains Mono code). Leave `draft: true` until ready.
5. Report the path and the URL (`/posts/<slug>/`).
