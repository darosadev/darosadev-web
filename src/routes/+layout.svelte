<script lang="ts">
	import './layout.css';
	import GridBackground from '$lib/components/GridBackground.svelte';
	import Header from '$lib/components/Header.svelte';

	let { children } = $props();
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
<Header />

<main class="relative z-10">
	{@render children()}
</main>
