import { error } from '@sveltejs/kit';
import { getContentEntry } from '$lib/server/storyblok';

export async function load({ fetch, params, setHeaders, url }) {
	const project = await getContentEntry('projects', params.slug, fetch);
	if (!project) error(404, 'Project not found');

	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
	});

	return { project, canonicalUrl: new URL(url.pathname, 'https://darosa.dev').href };
}
