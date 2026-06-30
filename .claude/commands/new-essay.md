---
description: Scaffold a new Markdown essay in src/content/essays/
---

Create a new essay for arnav.tech from the title: **$ARGUMENTS**

Steps:
1. Slugify the title (kebab-case) for the filename.
2. Create `src/content/essays/<slug>.md` with this frontmatter, filling
   `title` from the argument, `description` with a one-line summary you draft,
   and `pubDate` with today's date (YYYY-MM-DD):

   ```md
   ---
   title: <title>
   description: <one-line summary>
   pubDate: <YYYY-MM-DD>
   draft: true
   ---
   ```

3. Add a short opening paragraph placeholder below the frontmatter.
4. Essays render with the serif `.reading-essay` treatment — write prose, no
   code blocks. Leave `draft: true` until ready to publish.
5. Report the path and the URL it will publish at (`/essays/<slug>/`).
