<script lang="ts">
	import ContentView from '$lib/components/ContentView.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const description = $derived(data.post.seoDescription ?? data.post.excerpt);
	const title = $derived(data.post.seoTitle ?? data.post.title);
</script>

<svelte:head>
	<title>{title} | darosa.dev</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={data.canonicalUrl} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={data.canonicalUrl} />
	{#if data.post.image}<meta property="og:image" content={data.post.image} />{/if}
	<meta name="twitter:card" content={data.post.image ? 'summary_large_image' : 'summary'} />
</svelte:head>

<ContentView post={data.post} contentType="Blog" fileExtension="md" />
