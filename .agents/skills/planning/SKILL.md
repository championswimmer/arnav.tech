---
name: planning
description: >-
  Author, track, and maintain implementation plans for arnav.tech. Use when
  starting a new plan, updating a plan's progress, marking a plan complete, or
  cleaning out old finished plans. Plans live in `.claude/plans/` as dated
  Markdown files with a checklist and a status frontmatter field.
---

# Planning Skill

This skill governs how implementation plans are written, tracked, and cleaned up
in `arnav.tech`. Plans live in `.claude/plans/`.

---

## 1. Plan file anatomy

Every plan is a single Markdown file with three required parts:

1. **Filename** — a `yyyy-mm-dd-` date prefix (the day the plan was created)
   followed by a kebab-case slug, e.g. `2026-08-30-add-search.md`.
2. **YAML frontmatter** — carries a `status` field, one of:
   - `planned` — written but not started.
   - `in-progress` — actively being worked on.
   - `complete` — every step is done.
3. **Markdown checklist** — the plan's steps as a task list (`- [ ]` / `- [x]`),
   placed immediately below the `# Title`. Check items off as you complete them.

Copy [`templates/plan-template.md`](./templates/plan-template.md) as the
starting point for any new plan.

## 2. Workflow

**Starting a new plan**

1. Run the cleanup script first to remove old finished plans:
   ```
   .claude/skills/planning/scripts/clean-plans.sh
   ```
   It deletes every plan file whose frontmatter `status` is `complete`.
2. Copy the template to `.claude/plans/<today>-<slug>.md` (use today's date).
3. Fill in the title, checklist steps, and any detail sections. Set
   `status: planned` (or `in-progress` if you're starting immediately).

**Working a plan**

- Set `status: in-progress` once work begins.
- Check off (`- [x]`) each step as it lands.

**Finishing a plan**

- When all steps are checked, set `status: complete`.
- The completed file stays until the *next* new plan triggers cleanup, so it
  remains a record of what was just done.

## 3. Cleanup

`scripts/clean-plans.sh` scans `.claude/plans/` and deletes any `*.md` whose
frontmatter contains `status: complete`. Run it whenever you start a new plan,
or on its own to tidy up. It leaves `planned` and `in-progress` plans untouched.
