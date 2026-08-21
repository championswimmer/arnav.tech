import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute } from 'astro';

export async function getStaticPaths() {
	const slidesDir = path.join(process.cwd(), 'src/data/slides');
	if (!fs.existsSync(slidesDir)) return [];

	const slideFolders = fs
		.readdirSync(slidesDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	return slideFolders.map((slug) => ({
		params: { slug },
		props: { slug },
	}));
}

export const GET: APIRoute = async ({ props }) => {
	const { slug } = props;
	const fullPath = path.join(process.cwd(), 'src/data/slides', slug, 'index.html');

	if (!fs.existsSync(fullPath)) {
		return new Response('Not found', { status: 404 });
	}

	const content = fs.readFileSync(fullPath);
	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
		},
	});
};
