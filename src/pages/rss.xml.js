import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const essays = await getCollection('essays', ({ data }) => !data.draft);
	const posts = await getCollection('posts', ({ data }) => !data.draft);

	const items = [
		...essays.map((e) => ({ ...e.data, link: `/essays/${e.id}/` })),
		...posts.map((p) => ({ ...p.data, link: `/posts/${p.id}/` })),
	].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items,
	});
}
