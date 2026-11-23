<script lang="ts">
	import ContentView from '$lib/components/ContentView.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const description = $derived(data.project.seoDescription ?? data.project.excerpt);
	const title = $derived(data.project.seoTitle ?? data.project.title);
</script>

<svelte:head>
	<title>{title} | darosa.dev</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={data.canonicalUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={data.canonicalUrl} />
	{#if data.project.image}<meta property="og:image" content={data.project.image} />{/if}
	<meta name="twitter:card" content={data.project.image ? 'summary_large_image' : 'summary'} />
</svelte:head>

<ContentView post={data.project} contentType="Project" fileExtension="project" />
