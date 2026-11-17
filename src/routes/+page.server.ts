import { getActivities, getSite } from '$lib/server/storyblok';

export async function load({ fetch, setHeaders }) {
	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
	});

	const [site, activities] = await Promise.all([getSite(fetch), getActivities(fetch)]);
	return { site, activities };
}
