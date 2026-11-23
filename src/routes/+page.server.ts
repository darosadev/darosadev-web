import { getActivities } from '$lib/server/storyblok';

export async function load({ fetch, setHeaders }) {
	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
	});

	return { activities: await getActivities(fetch) };
}
