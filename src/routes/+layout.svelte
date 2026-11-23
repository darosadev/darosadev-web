<script lang="ts">
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import './layout.css';
	import GridBackground from '$lib/components/GridBackground.svelte';
	import Header from '$lib/components/Header.svelte';
	import ScrollProgressButton from '$lib/components/ScrollProgressButton.svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	let isDetailPage = $state(false);

	$effect(() => {
		const path = typeof window !== 'undefined' ? window.location.pathname : '';
		isDetailPage = path.startsWith('/posts/') || path.startsWith('/projects/');
	});

	beforeNavigate(() => {
		// Disable smooth scroll during route transitions so the router's
		// scroll-to-top happens instantly instead of animating.
		document.documentElement.style.scrollBehavior = 'auto';
	});

	afterNavigate(() => {
		// Re-enable smooth scroll for anchor links and manual scrollToTop.
		// Also update the detail-page flag so the progress button shows/hides correctly.
		const path = window.location.pathname;
		isDetailPage = path.startsWith('/posts/') || path.startsWith('/projects/');
		document.documentElement.style.scrollBehavior = 'smooth';
	});
</script>

<svelte:head>
	<title>darosa.dev — Joaquim Rosa</title>
	<meta name="description" content="Joaquim Rosa — developer homepage. Building things for the web." />
	<meta property="og:title" content="darosa.dev — Joaquim Rosa" />
	<meta property="og:description" content="Joaquim Rosa — developer homepage. Building things for the web." />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary" />
</svelte:head>

<GridBackground />
<Header navItems={data.site?.navItems} />

<main class="relative z-10">
	{@render children()}
</main>

{#if isDetailPage}
	<ScrollProgressButton />
{/if}
