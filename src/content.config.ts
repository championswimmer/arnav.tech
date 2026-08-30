import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

/**
 * Essays — long-form, "written" pieces, rendered with the sepia/serif essay
 * treatment. Markdown by default; MDX when a piece needs to embed a figure
 * or other component.
 */
const essays = defineCollection({
	loader: glob({ base: './src/content/essays', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			tags: z.array(z.string()).default([]),
			originalUrl: z.string().url().optional(),
			draft: z.boolean().default(false),
		}),
});

/**
 * Posts — technical articles. Markdown or MDX, rendered with the monospace
 * tech treatment. Supports code blocks, mermaid, and math.
 */
const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			tags: z.array(z.string()).default([]),
			originalUrl: z.string().url().optional(),
			draft: z.boolean().default(false),
		}),
});

/**
 * Projects — showcase pages. MDX so they can embed live Vue components.
 */
const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.mdx' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			tags: z.array(z.string()).default([]),
			stack: z.array(z.string()).default([]),
			repo: z.string().url().optional(),
			url: z.string().url().optional(),
			status: z.enum(['active', 'archived', 'wip']).default('active'),
			featured: z.boolean().default(false),
			order: z.number().default(0),
			draft: z.boolean().default(false),
		}),
});

/**
 * Slides — presentations (SpeakerDeck embeds or local Reveal.js decks).
 */
const slides = defineCollection({
	loader: file('src/data/slides.json'),
	schema: () =>
		z.object({
			id: z.string(),
			slug: z.string(),
			type: z.enum(['speakerdeck', 'revealjs']),
			title: z.string(),
			description: z.string().default(''),
			date: z.string(),
			url: z.string().url().optional(),
			cover: z.string().optional(),
			draft: z.boolean().default(false),
		}),
});

export const collections = { essays, posts, projects, slides };
