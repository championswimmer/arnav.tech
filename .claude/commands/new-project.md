---
description: Scaffold a new MDX project page in src/content/projects/
---

Create a new project showcase for arnav.tech from the title: **$ARGUMENTS**

Steps:
1. Slugify the title (kebab-case) for the filename.
2. Create `src/content/projects/<slug>.mdx` with this frontmatter (projects are
   always MDX so they can embed Vue islands):

   ```mdx
   ---
   title: <title>
   description: <one-line summary>
   pubDate: <YYYY-MM-DD>
   tags: []
   stack: []
   repo: <github url, optional>
   url: <live url, optional>
   status: active   # active | wip | archived
   featured: false
   order: 0         # higher sorts first
   draft: true
   ---
   ```

3. To embed a live Vue component, import from `../../components/vue/` and
   hydrate with a `client:*` directive, e.g.:

   ```mdx
   import Counter from '../../components/vue/Counter.vue';

   <Counter client:visible />
   ```

4. Report the path and the URL (`/projects/<slug>/`).
