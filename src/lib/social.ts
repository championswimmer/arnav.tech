import social from '../data/social.yaml';

/** Known social platforms and how to present them. */
export type Platform =
	| 'twitter'
	| 'github'
	| 'linkedin'
	| 'instagram'
	| 'youtube'
	| 'substack';

interface PlatformDef {
	/** Human-readable name. */
	label: string;
	/** Iconify icon name (from @iconify-json/simple-icons). */
	icon: string;
	/** Builds the profile URL from the stored handle. */
	url: (handle: string) => string;
}

// Structural config (labels, icons, URL shapes). The data — i.e. the handles —
// lives in src/data/social.yaml. To add a platform: add a def here, then list
// it in the YAML.
const PLATFORMS: Record<Platform, PlatformDef> = {
	twitter: {
		label: 'Twitter',
		icon: 'simple-icons:x',
		url: (h) => `https://x.com/${h}`,
	},
	github: {
		label: 'GitHub',
		icon: 'simple-icons:github',
		url: (h) => `https://github.com/${h}`,
	},
	linkedin: {
		label: 'LinkedIn',
		icon: 'simple-icons:linkedin',
		url: (h) => `https://www.linkedin.com/in/${h}`,
	},
	instagram: {
		label: 'Instagram',
		icon: 'simple-icons:instagram',
		url: (h) => `https://instagram.com/${h}`,
	},
	youtube: {
		label: 'YouTube',
		icon: 'simple-icons:youtube',
		// Handles already include the leading "@".
		url: (h) => `https://www.youtube.com/${h}`,
	},
	substack: {
		label: 'Substack',
		icon: 'simple-icons:substack',
		url: (h) => `https://${h}.substack.com`,
	},
};

interface RawProfile {
	platform: Platform;
	handle: string;
	primary?: boolean;
}

export interface SocialLink {
	platform: Platform;
	label: string;
	icon: string;
	handle: string;
	url: string;
	primary: boolean;
}

const raw = (social.profiles ?? []) as RawProfile[];

/** All social links, in the order declared in social.yaml. */
export const socialLinks: SocialLink[] = raw
	.filter((p) => {
		if (!PLATFORMS[p.platform]) {
			console.warn(`[social] unknown platform "${p.platform}" — skipping`);
			return false;
		}
		return true;
	})
	.map((p) => {
		const def = PLATFORMS[p.platform];
		return {
			platform: p.platform,
			label: def.label,
			icon: def.icon,
			handle: p.handle,
			url: def.url(p.handle),
			primary: p.primary ?? false,
		};
	});

/** The subset flagged `primary: true` (e.g. for the header). */
export const primarySocialLinks: SocialLink[] = socialLinks.filter((l) => l.primary);
