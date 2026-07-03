const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;

/**
 * Content files/folders are named `yyyy-mm-dd-slug` so they sort
 * chronologically on disk, but that date shouldn't leak into the URL.
 */
export function cleanSlug(id: string): string {
	return id.replace(DATE_PREFIX, '');
}
