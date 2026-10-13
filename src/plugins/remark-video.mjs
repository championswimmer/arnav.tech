import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { visit } from 'unist-util-visit';

/**
 * Lets Markdown embed videos with plain image syntax:
 *
 *     ![Caption shown under the video](./images/demo.mp4)
 *
 * A paragraph holding only a video "image" becomes a captioned
 * `<figure class="media"><video>`. If an image with the same basename sits
 * next to the video (`demo.jpg`, `demo.png`, `demo.webp`), it is used as the
 * poster frame.
 *
 * Astro's asset pipeline only handles images, so videos are not imported.
 * Instead a video at `src/content/<path>` is served at `/media/<path>`:
 * the `contentMedia()` integration below serves those files in dev and copies
 * them into `dist/` at build time.
 */

const CONTENT_DIR = path.resolve('src/content');
const MEDIA_BASE = '/media/';
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;
const POSTER_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const MIME = {
	'.mp4': 'video/mp4',
	'.m4v': 'video/mp4',
	'.webm': 'video/webm',
	'.mov': 'video/quicktime',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
};

const escapeAttr = (s) =>
	s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const toMediaUrl = (absPath) =>
	MEDIA_BASE + encodeURI(path.relative(CONTENT_DIR, absPath).split(path.sep).join('/'));

function findPoster(videoPath) {
	const stem = videoPath.replace(VIDEO_EXT, '');
	return POSTER_EXTS.map((ext) => stem + ext).find((p) => existsSync(p));
}

function sourceFilePath(file) {
	const p = file.path ?? file.history?.[0];
	if (!p) return undefined;
	return p.startsWith('file:') ? fileURLToPath(p) : path.resolve(p);
}

export function remarkVideo() {
	return (tree, file) => {
		const sourcePath = sourceFilePath(file);

		visit(tree, 'paragraph', (node, index, parent) => {
			if (!parent || index === null) return;
			const content = node.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
			const [image] = content;
			if (content.length !== 1 || image.type !== 'image') return;

			const url = image.url.split(/[?#]/)[0];
			if (!VIDEO_EXT.test(url)) return;

			let src = image.url;
			let poster;
			if (!/^(\/|[a-z]+:)/i.test(url)) {
				if (!sourcePath) throw new Error(`remark-video: cannot resolve ${image.url} without a source path`);
				const videoPath = path.resolve(path.dirname(sourcePath), decodeURI(url));
				if (!videoPath.startsWith(CONTENT_DIR + path.sep) || !existsSync(videoPath)) {
					throw new Error(`remark-video: ${image.url} not found (from ${sourcePath})`);
				}
				src = toMediaUrl(videoPath);
				const posterPath = findPoster(videoPath);
				if (posterPath) poster = toMediaUrl(posterPath);
			}

			const caption = image.alt?.trim();
			const type = MIME[path.extname(url).toLowerCase()];
			parent.children[index] = {
				type: 'html',
				value: [
					'<figure class="media">',
					`<video controls playsinline preload="metadata"${poster ? ` poster="${escapeAttr(poster)}"` : ''}${caption ? ` aria-label="${escapeAttr(caption)}"` : ''}>`,
					`<source src="${escapeAttr(src)}"${type ? ` type="${type}"` : ''} />`,
					'</video>',
					caption ? `<figcaption>${escapeAttr(caption)}</figcaption>` : '',
					'</figure>',
				].join(''),
			};
		});
	};
}

/** Every video under src/content, plus its poster frame if it has one. */
function contentMediaFiles(dir = CONTENT_DIR) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const p = path.join(dir, entry.name);
		if (entry.isDirectory()) return contentMediaFiles(p);
		if (!VIDEO_EXT.test(entry.name)) return [];
		const poster = findPoster(p);
		return poster ? [p, poster] : [p];
	});
}

/** Serves (dev) and emits (build) the files that `remarkVideo` links to. */
export function contentMedia() {
	return {
		name: 'content-media',
		hooks: {
			'astro:server:setup': ({ server }) => {
				server.middlewares.use((req, res, next) => {
					if (!req.url?.startsWith(MEDIA_BASE)) return next();
					const rel = decodeURI(req.url.slice(MEDIA_BASE.length).split('?')[0]);
					const filePath = path.resolve(CONTENT_DIR, rel);
					const ext = path.extname(filePath).toLowerCase();
					if (!filePath.startsWith(CONTENT_DIR + path.sep) || !MIME[ext] || !existsSync(filePath)) {
						return next();
					}

					// Browsers seek video with Range requests, so honour them.
					const size = statSync(filePath).size;
					const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '');
					res.setHeader('Content-Type', MIME[ext]);
					res.setHeader('Accept-Ranges', 'bytes');
					if (range) {
						const start = range[1] ? Number(range[1]) : size - Number(range[2]);
						const end = range[1] && range[2] ? Number(range[2]) : size - 1;
						res.statusCode = 206;
						res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
						res.setHeader('Content-Length', end - start + 1);
						createReadStream(filePath, { start, end }).pipe(res);
					} else {
						res.setHeader('Content-Length', size);
						createReadStream(filePath).pipe(res);
					}
				});
			},
			'astro:build:done': async ({ dir }) => {
				const outDir = fileURLToPath(dir);
				for (const file of contentMediaFiles()) {
					const dest = path.join(outDir, MEDIA_BASE, path.relative(CONTENT_DIR, file));
					await mkdir(path.dirname(dest), { recursive: true });
					await cp(file, dest);
				}
			},
		},
	};
}

export default remarkVideo;
