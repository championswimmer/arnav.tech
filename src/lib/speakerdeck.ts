// Fetches the SpeakerDeck presentations for a user at build time.
//
// The site is fully static, so this runs during `bun run build` (and in dev).
// Every build re-checks the public profile page so newly published decks are
// picked up automatically with no manual import step.
//
// Imported decks are cached to `src/data/slides.json` (committed to the repo).
// New talks only ever appear at the *top* of the SpeakerDeck profile, so the
// common case is cheap: we fetch only page 1 and prepend anything not already
// cached. We fall back to walking every page only when the cache is empty
// (e.g. a fresh checkout or the cache got blanked and needs a full re-import).
// If SpeakerDeck is unreachable we fail soft and return the cache as-is.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SPEAKERDECK_USER = 'championswimmer';
const PROFILE_URL = `https://speakerdeck.com/${SPEAKERDECK_USER}`;
// Anchor to the repo root (build cwd), not the bundled module location, so the
// committed cache is read and updated in `src/`, not inside `dist/`.
const CACHE_PATH = join(process.cwd(), 'src/data/slides.json');
const FETCH_HEADERS = { 'User-Agent': 'arnav.tech build (+https://arnav.tech)' };
const embedCache = new Map<string, SpeakerDeckEmbed | null>();

export interface Slide {
	/** Full URL to the deck on SpeakerDeck. */
	url: string;
	/** Talk title. */
	title: string;
	/** Cover-slide preview image (hosted on files.speakerdeck.com). */
	cover: string;
	/** Publish date (ISO `YYYY-MM-DD`), scraped from the deck page. */
	date?: string;
}

export interface SpeakerDeckEmbed {
	/** Canonical deck URL on SpeakerDeck. */
	url: string;
	/** Deck id used by SpeakerDeck's official embeds/player. */
	id: string;
	/** Aspect ratio exposed on the deck page's official embed snippet. */
	ratio: number;
	/** Human-readable deck name from the page embed markup. */
	title?: string;
	/** Direct iframe/player source. */
	src: string;
}

/** Parse the `<div class="card deck-preview" …>` blocks out of a profile page. */
function parseDecks(html: string): Slide[] {
	const slides: Slide[] = [];
	// Each deck is a card carrying its cover image, wrapping an anchor that holds
	// the canonical href and title.
	const cardRe =
		/<div class="card deck-preview"[^>]*\bdata-cover-image="([^"]+)"[\s\S]*?<a class="deck-preview-link" href="([^"]+)" title="([^"]*)"/g;
	let m: RegExpExecArray | null;
	while ((m = cardRe.exec(html)) !== null) {
		const [, cover, href, title] = m;
		slides.push({
			cover: decodeHtml(cover),
			url: new URL(href, 'https://speakerdeck.com').href,
			title: decodeHtml(title),
		});
	}
	return slides;
}

/** Minimal HTML-entity decode for the handful that show up in titles. */
function decodeHtml(s: string): string {
	return s
		.replace(/&amp;/g, '&')
		.replace(/&#39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

function readAttr(tag: string, name: string): string | undefined {
	const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return tag.match(new RegExp(`${escaped}="([^"]+)"`))?.[1];
}

function parseEmbedTag(html: string): Omit<SpeakerDeckEmbed, 'url'> | null {
	const tag =
		html.match(/<div class="speakerdeck-embed"[^>]*>/)?.[0] ??
		html.match(/<script[^>]*class="speakerdeck-embed"[^>]*><\/script>/)?.[0];
	if (!tag) return null;

	const id = readAttr(tag, 'data-id');
	const ratio = Number(readAttr(tag, 'data-ratio'));
	if (!id || !Number.isFinite(ratio)) return null;

	return {
		id,
		ratio,
		title: decodeHtml(readAttr(tag, 'data-name') ?? ''),
		src: `https://speakerdeck.com/player/${id}`,
	};
}

async function fetchPage(page: number): Promise<Slide[]> {
	const res = await fetch(page === 1 ? PROFILE_URL : `${PROFILE_URL}?page=${page}`, {
		headers: FETCH_HEADERS,
	});
	if (!res.ok) throw new Error(`SpeakerDeck page ${page} returned ${res.status}`);
	return parseDecks(await res.text());
}

/** Scrape a deck's publish date (ISO). Dates live on the deck page, not the
 *  profile listing, so this costs one request per deck — only paid for decks
 *  not already in the cache. */
async function fetchDate(url: string): Promise<string | undefined> {
	try {
		const res = await fetch(url, { headers: FETCH_HEADERS });
		if (!res.ok) return undefined;
		const m = (await res.text()).match(/"datePublished":"([^"]+)"/);
		return m?.[1];
	} catch {
		return undefined;
	}
}

/** Attach publish dates to freshly imported decks (parallel requests). */
async function withDates(decks: Slide[]): Promise<Slide[]> {
	return Promise.all(decks.map(async (d) => ({ ...d, date: await fetchDate(d.url) })));
}

/** Read the committed cache; an empty/missing/corrupt file yields []. */
function readCache(): Slide[] {
	try {
		const data = JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
		return Array.isArray(data) ? data : [];
	} catch {
		return [];
	}
}

/** Persist the cache, but only when it actually changed (avoids dev HMR loops). */
function writeCache(slides: Slide[], previous: Slide[]): void {
	if (JSON.stringify(slides) === JSON.stringify(previous)) return;
	try {
		writeFileSync(CACHE_PATH, JSON.stringify(slides, null, 2) + '\n');
	} catch (err) {
		console.warn('[speakerdeck] could not write cache:', err);
	}
}

export function normalizeSpeakerDeckUrl(url: string): string {
	const parsed = new URL(url);
	const pathname = parsed.pathname.replace(/\/+$/, '');
	return new URL(pathname, 'https://speakerdeck.com').href;
}

export function getCachedSlide(url: string): Slide | undefined {
	const normalized = normalizeSpeakerDeckUrl(url);
	return readCache().find((slide) => normalizeSpeakerDeckUrl(slide.url) === normalized);
}

export async function getSpeakerDeckEmbed(url: string): Promise<SpeakerDeckEmbed | null> {
	const normalized = normalizeSpeakerDeckUrl(url);
	if (embedCache.has(normalized)) return embedCache.get(normalized) ?? null;

	try {
		const res = await fetch(normalized, { headers: FETCH_HEADERS });
		if (!res.ok) throw new Error(`SpeakerDeck deck returned ${res.status}`);
		const embed = parseEmbedTag(await res.text());
		if (!embed) throw new Error('SpeakerDeck embed markup not found');

		const resolved = { ...embed, url: normalized };
		embedCache.set(normalized, resolved);
		return resolved;
	} catch (err) {
		console.warn(`[speakerdeck] could not load embed for ${normalized}:`, err);
		embedCache.set(normalized, null);
		return null;
	}
}

export async function getSlides(): Promise<Slide[]> {
	const cache = readCache();

	try {
		// Empty cache → full re-import: walk every page until one yields no decks.
		if (cache.length === 0) {
			const all: Slide[] = [];
			const seen = new Set<string>();
			for (let page = 1; page <= 20; page++) {
				const fresh = (await fetchPage(page)).filter((d) => !seen.has(d.url));
				if (fresh.length === 0) break;
				for (const d of fresh) {
					seen.add(d.url);
					all.push(d);
				}
			}
			const dated = await withDates(all);
			writeCache(dated, cache);
			return dated;
		}

		// Warm cache → only new decks (at the top) can be missing. Fetch page 1;
		// if its first deck already matches the cache head, nothing is new.
		const page1 = await fetchPage(1);
		if (page1.length === 0 || page1[0].url === cache[0].url) return cache;

		const cachedUrls = new Set(cache.map((d) => d.url));
		const additions = page1.filter((d) => !cachedUrls.has(d.url));
		if (additions.length === 0) return cache;

		const merged = [...(await withDates(additions)), ...cache];
		writeCache(merged, cache);
		return merged;
	} catch (err) {
		console.warn('[speakerdeck] could not refresh decks, using cache:', err);
		return cache;
	}
}
