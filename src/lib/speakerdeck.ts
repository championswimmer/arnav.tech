// Fetches the SpeakerDeck presentations for a user at build time.
//
// The site is fully static, so this runs during `bun run build` (and in dev).
// Every build re-scrapes the public profile page, so newly published decks are
// picked up automatically with no manual import step. If SpeakerDeck is
// unreachable, we fail soft and return an empty list rather than break the build.

const SPEAKERDECK_USER = 'championswimmer';
const PROFILE_URL = `https://speakerdeck.com/${SPEAKERDECK_USER}`;

export interface Slide {
	/** Full URL to the deck on SpeakerDeck. */
	url: string;
	/** Talk title. */
	title: string;
	/** Cover-slide preview image (hosted on files.speakerdeck.com). */
	cover: string;
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

export async function getSlides(): Promise<Slide[]> {
	const all: Slide[] = [];
	const seen = new Set<string>();

	try {
		// Walk paginated profile pages until one yields no new decks.
		for (let page = 1; page <= 20; page++) {
			const res = await fetch(page === 1 ? PROFILE_URL : `${PROFILE_URL}?page=${page}`, {
				headers: { 'User-Agent': 'arnav.tech build (+https://arnav.tech)' },
			});
			if (!res.ok) break;
			const decks = parseDecks(await res.text());
			const fresh = decks.filter((d) => !seen.has(d.url));
			if (fresh.length === 0) break;
			for (const d of fresh) {
				seen.add(d.url);
				all.push(d);
			}
		}
	} catch (err) {
		console.warn('[speakerdeck] could not fetch decks:', err);
	}

	return all;
}
