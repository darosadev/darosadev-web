import { error } from '@sveltejs/kit';
import { getContentEntry } from '$lib/server/storyblok';

export async function load({ fetch, params, setHeaders, url }) {
	const post = await getContentEntry('posts', params.slug, fetch);
	if (!post) error(404, 'Post not found');

	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
	});

	return { post, canonicalUrl: new URL(url.pathname, 'https://darosa.dev').href };
}
