// Global site data. Import from anywhere with the `import` keyword.

export const SITE_TITLE = 'Arnav Gupta';
export const SITE_DESCRIPTION =
	'The personal website of Arnav Gupta — essays, tech writing, and projects.';
export const SITE_AUTHOR = 'Arnav Gupta';

export const NAV_LINKS = [
	{ href: '/', label: 'Home' },
	{ href: '/essays', label: 'Essays' },
	{ href: '/posts', label: 'Writing' },
	{ href: '/projects', label: 'Projects' },
	{ href: '/about', label: 'About' },
] as const;

export const SOCIAL_LINKS = {
	github: 'https://github.com/championswimmer',
	twitter: 'https://twitter.com/championswimmer',
} as const;
