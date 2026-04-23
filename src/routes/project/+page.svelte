<script lang="ts">
	import { page } from '$app/stores';
	import { getProjectBySlug } from '$lib/storyblok';
	import type { Activity } from '$lib/types';
	import ContentView from '$lib/components/ContentView.svelte';

	let post = $state<Activity | null>(null);
	let notFound = $state(false);

	$effect(() => {
		const slug = $page.url.searchParams.get('slug');

		if (!slug) {
			post = null;
			notFound = true;
			return;
		}

		const found = getProjectBySlug(slug);
		if (found) {
			post = found;
			notFound = false;
		} else {
			post = null;
			notFound = true;
		}
	});
</script>

<svelte:head>
	{#if post}
		<title>{post.title} — darosa.dev</title>
		<meta name="description" content={post.excerpt} />
	{:else}
		<title>Project — darosa.dev</title>
	{/if}
</svelte:head>

<ContentView
	{post}
	{notFound}
	contentType="Project"
	loadingLabel="loading project..."
	notFoundLabel="project not found"
	fileExtension="project"
/>
