import { readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITEMAP_CHUNK = /^sitemap-\d+\.xml$/;

/**
 * Expose Astro's single generated sitemap chunk at the conventional
 * `/sitemap.xml` URL while keeping its sitemap index backwards-compatible.
 */
export function singleSitemap() {
	return {
		name: 'single-sitemap',
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				const outputDir = fileURLToPath(dir);
				const chunkFiles = (await readdir(outputDir)).filter((file) => SITEMAP_CHUNK.test(file));

				if (chunkFiles.length !== 1 || chunkFiles[0] !== 'sitemap-0.xml') {
					throw new Error(
						`Expected one Astro sitemap chunk, but found: ${chunkFiles.join(', ') || 'none'}`,
					);
				}

				const generatedPath = path.join(outputDir, 'sitemap-0.xml');
				const sitemapPath = path.join(outputDir, 'sitemap.xml');
				const indexPath = path.join(outputDir, 'sitemap-index.xml');

				await rm(sitemapPath, { force: true });
				await rename(generatedPath, sitemapPath);

				const index = await readFile(indexPath, 'utf8');
				const updatedIndex = index.replaceAll('sitemap-0.xml', 'sitemap.xml');
				if (updatedIndex === index) {
					throw new Error('Astro sitemap index did not reference sitemap-0.xml');
				}
				await writeFile(indexPath, updatedIndex);

				logger.info('`sitemap.xml` created');
			},
		},
	};
}
