import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { cleanSlug } from './slug';

export const AI_USAGE_TAGS = ['ai-free', 'ai-assisted', 'ai-generated'] as const;
export type AiUsageTag = (typeof AI_USAGE_TAGS)[number];

const AI_USAGE_TAG_SET: ReadonlySet<string> = new Set(AI_USAGE_TAGS);

export function isAiUsageTag(tag: string): tag is AiUsageTag {
	return AI_USAGE_TAG_SET.has(tag);
}

export function isTopicalTag(tag: string): boolean {
	return !isAiUsageTag(tag);
}

/**
 * Normalize a tag for use in URLs: lowercase, trim, collapse
 * whitespace and slashes to a single hyphen.
 */
export function tagSlug(tag: string): string {
	return tag.trim().toLowerCase().replace(/[\s/]+/g, '-');
}

export interface TaggedEntry {
	href: string;
	title: string;
	description: string;
	pubDate: Date;
	heroImage?: ImageMetadata;
	collection: 'essays' | 'posts' | 'projects';
	tags: string[];
}

export interface TagBucket {
	slug: string;
	label: string;
	count: number;
	entries: TaggedEntry[];
}

function toEntry(
	collection: TaggedEntry['collection'],
	id: string,
	data: {
		title: string;
		description: string;
		pubDate: Date;
		heroImage?: ImageMetadata;
		tags: string[];
	},
): TaggedEntry {
	return {
		href: `/${collection}/${cleanSlug(id)}/`,
		title: data.title,
		description: data.description,
		pubDate: data.pubDate,
		heroImage: data.heroImage,
		collection,
		tags: data.tags,
	};
}

export async function getTaggedEntries(): Promise<TaggedEntry[]> {
	const [essays, posts, projects] = await Promise.all([
		getCollection('essays', ({ data }) => !data.draft),
		getCollection('posts', ({ data }) => !data.draft),
		getCollection('projects', ({ data }) => !data.draft),
	]);

	return [
		...essays.map((e) => toEntry('essays', e.id, e.data)),
		...posts.map((p) => toEntry('posts', p.id, p.data)),
		...projects.map((p) => toEntry('projects', p.id, p.data)),
	].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}

/**
 * Topical tags only (AI-usage tags are excluded). Keyed by `tagSlug`.
 */
export async function getAllTags(): Promise<Map<string, TagBucket>> {
	const entries = await getTaggedEntries();
	const tags = new Map<string, TagBucket>();

	for (const entry of entries) {
		for (const tag of entry.tags) {
			if (!isTopicalTag(tag)) continue;
			const slug = tagSlug(tag);
			const existing = tags.get(slug);
			if (existing) {
				existing.count += 1;
				existing.entries.push(entry);
			} else {
				tags.set(slug, { slug, label: tag, count: 1, entries: [entry] });
			}
		}
	}

	return tags;
}
