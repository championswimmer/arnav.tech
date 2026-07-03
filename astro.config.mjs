// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import icon from 'astro-icon';
import { defineConfig, fontProviders } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import yaml from '@rollup/plugin-yaml';
import { readdirSync } from 'node:fs';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkMermaid } from './src/plugins/remark-mermaid.mjs';

// The old arnav.tech (Hashnode) served every article flat at the root
// (`/<slug>`), whereas this site namespaces them under their collection
// (`/posts/<slug>`, `/essays/<slug>`, `/projects/<slug>`). To keep every
// existing inbound link and search result alive, emit a 301 from each flat
// legacy URL to its new home. Built from the content dirs so it stays in
// sync as content is added — mirrors `cleanSlug` in src/lib/slug.ts.
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;
const legacyRedirects = Object.fromEntries(
	['essays', 'posts', 'projects'].flatMap((collection) =>
		readdirSync(`./src/content/${collection}`).map((entry) => {
			const base = entry.replace(/\.(md|mdx)$/, '');
			const slug = base.replace(DATE_PREFIX, '');
			return [`/${slug}`, `/${collection}/${slug}`];
		}),
	),
);

// https://astro.build/config
export default defineConfig({
	site: 'https://arnav.tech',
	integrations: [mdx(), sitemap(), vue(), icon()],
	redirects: legacyRedirects,

	// Lets us `import ... from '*.yaml'` (e.g. src/data/social.yaml).
	vite: {
		plugins: [yaml()],
	},

	markdown: {
		// Custom unified processor (Astro v7 way of adding remark/rehype plugins).
		// Mermaid must run before highlighting so Shiki skips those blocks.
		processor: unified({
			remarkPlugins: [remarkMermaid, remarkMath],
			rehypePlugins: [rehypeKatex],
		}),
		shikiConfig: {
			// Warm, inky light theme that sits well on the sepia page.
			theme: 'rose-pine-dawn',
			wrap: false,
		},
	},

	fonts: [
		// Essays — an editorial, "written/printy" serif with characterful italics.
		{
			provider: fontProviders.google(),
			name: 'Newsreader',
			cssVariable: '--font-essay',
			weights: [400, 500, 600, 700],
			styles: ['normal', 'italic'],
			fallbacks: ['Georgia', 'serif'],
		},
		// Tech posts & UI chrome — a chunky geometric sans.
		{
			provider: fontProviders.google(),
			name: 'Space Grotesk',
			cssVariable: '--font-sans',
			weights: [400, 500, 600, 700],
			styles: ['normal'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
		// Tech articles & code — monospace.
		{
			provider: fontProviders.google(),
			name: 'JetBrains Mono',
			cssVariable: '--font-mono',
			weights: [400, 500, 700],
			styles: ['normal', 'italic'],
			fallbacks: ['ui-monospace', 'monospace'],
		},
	],
});
