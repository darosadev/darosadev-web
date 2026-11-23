<script lang="ts">
	import TerminalHero from '$lib/components/TerminalHero.svelte';
	import ActivityFeed from '$lib/components/ActivityFeed.svelte';
	import AboutSection from '$lib/components/AboutSection.svelte';
	import ContactSection from '$lib/components/ContactSection.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

{#if data.site?.heroEnabled ?? true}
	<TerminalHero site={data.site} />
{/if}
<ActivityFeed activities={data.activities} />
<AboutSection site={data.site} />
<ContactSection site={data.site} />
<Footer />
