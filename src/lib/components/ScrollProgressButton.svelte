<script lang="ts">
	import { onMount } from 'svelte';

	let progress = $state(0);
	let visible = $state(false);

	const circumference = 2 * Math.PI * 18;
	const strokeDashoffset = $derived(circumference - (progress / 100) * circumference);

	onMount(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY || document.documentElement.scrollTop;
			const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
			const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

			progress = Math.min(100, Math.max(0, pct));
			visible = scrollTop > 200;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();

		return () => window.removeEventListener('scroll', handleScroll);
	});

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

{#if visible}
	<button
		type="button"
		onclick={scrollToTop}
		class="fixed bottom-6 right-6 z-[60] w-11 h-11 rounded-full bg-ctp-crust/90 backdrop-blur-md border border-ctp-surface0/60 flex items-center justify-center shadow-lg hover:border-ctp-surface1 transition-all duration-200 group"
		aria-label="Scroll to top"
	>
		<svg class="w-11 h-11 -rotate-90" viewBox="0 0 40 40">
			<circle
				cx="20"
				cy="20"
				r="18"
				fill="none"
				stroke="rgba(69, 71, 90, 0.6)"
				stroke-width="2"
			/>
			<circle
				cx="20"
				cy="20"
				r="18"
				fill="none"
				stroke="#94e2d5"
				stroke-width="2"
				stroke-linecap="round"
				stroke-dasharray={circumference}
				style="stroke-dashoffset: {strokeDashoffset}; transition: stroke-dashoffset 0.1s linear;"
			/>
		</svg>
		<span class="absolute text-ctp-subtext0 group-hover:text-ctp-text transition-colors duration-200 text-xs">↑</span>
	</button>
{/if}
