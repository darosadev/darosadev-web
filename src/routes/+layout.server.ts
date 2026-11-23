import { getSite } from '$lib/server/storyblok';

export async function load({ fetch }) {
	return { site: await getSite(fetch) };
}
