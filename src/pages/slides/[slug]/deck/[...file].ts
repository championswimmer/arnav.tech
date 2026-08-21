import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute } from 'astro';

const MIME_TYPES: Record<string, string> = {
	'.css': 'text/css; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.mjs': 'application/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.gif': 'image/gif',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.otf': 'font/otf',
	'.txt': 'text/plain; charset=utf-8',
	'.xml': 'text/xml; charset=utf-8',
};

function getMimeType(filePath: string): string {
	const ext = path.extname(filePath).toLowerCase();
	return MIME_TYPES[ext] || 'application/octet-stream';
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = [], baseDir: string = dirPath): string[] {
	if (!fs.existsSync(dirPath)) return [];
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);
		if (entry.isDirectory()) {
			getAllFiles(fullPath, arrayOfFiles, baseDir);
		} else {
			if (entry.name !== 'index.html' && !entry.name.endsWith('.md') && !entry.name.endsWith('.markdown')) {
				arrayOfFiles.push(path.relative(baseDir, fullPath));
			}
		}
	}
	return arrayOfFiles;
}

export async function getStaticPaths() {
	const slidesDir = path.join(process.cwd(), 'src/data/slides');
	if (!fs.existsSync(slidesDir)) return [];

	const slideFolders = fs
		.readdirSync(slidesDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	const paths: Array<{
		params: { slug: string; file: string };
		props: { relativeFilePath: string; slug: string };
	}> = [];

	for (const slug of slideFolders) {
		const deckDir = path.join(slidesDir, slug);
		const files = getAllFiles(deckDir);

		for (const relFile of files) {
			paths.push({
				params: { slug, file: relFile },
				props: { relativeFilePath: relFile, slug },
			});
		}
	}

	return paths;
}

export const GET: APIRoute = async ({ props }) => {
	const { slug, relativeFilePath } = props;
	const fullPath = path.join(process.cwd(), 'src/data/slides', slug, relativeFilePath);

	if (!fs.existsSync(fullPath)) {
		return new Response('Not found', { status: 404 });
	}

	const content = fs.readFileSync(fullPath);
	const mimeType = getMimeType(fullPath);

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': mimeType,
		},
	});
};
