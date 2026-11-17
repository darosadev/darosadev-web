<script lang="ts">
	import { onMount } from 'svelte';
	import type { SiteContent } from '$lib/types';

	interface Props {
		site: SiteContent | null;
	}

	let { site }: Props = $props();

	onMount(async () => {
		if (typeof window !== 'undefined') {
			const gsap = await import('gsap');
			const { ScrollTrigger } = await import('gsap/ScrollTrigger');
			gsap.gsap.registerPlugin(ScrollTrigger);

			gsap.gsap.fromTo(
				'#about-content',
				{ opacity: 0, y: 30 },
				{
					opacity: 1,
					y: 0,
					duration: 0.7,
					ease: 'power2.out',
					scrollTrigger: {
						trigger: '#about',
						start: 'top 75%'
					}
				}
			);
		}
	});
</script>

<section id="about" class="relative z-10 py-16 sm:py-24 px-4 sm:px-6">
	<div class="max-w-3xl mx-auto">
		<div class="flex items-center gap-3 mb-10">
			<span class="text-xs font-medium text-ctp-text uppercase tracking-widest">
				<span class="text-ctp-overlay0">&lt;</span>about<span class="text-ctp-overlay0">/&gt;</span>
			</span>
			<div class="h-px flex-1 bg-ctp-surface0"></div>
		</div>

		<div id="about-content" class="rounded-lg border border-ctp-surface0 bg-ctp-mantle overflow-hidden">
			<!-- Fake terminal header -->
			<div class="flex items-center gap-2 px-4 py-2.5 border-b border-ctp-surface0 bg-ctp-crust/50">
				<span class="text-[10px] text-ctp-overlay0 font-medium">joaquim@darosa.dev</span>
				<span class="text-ctp-surface1">:</span>
				<span class="text-[10px] text-ctp-blue font-medium">~</span>
				<span class="text-ctp-surface1">$</span>
				<span class="text-[10px] text-ctp-text font-medium ml-1">whoami</span>
			</div>

			<div class="p-6 font-mono text-xs leading-relaxed space-y-4">
				<div class="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-2">
					<span class="text-ctp-blue font-semibold">name</span>
					<span class="text-ctp-text">{site?.aboutName ?? 'Joaquim Rosa'}</span>

					<span class="text-ctp-blue font-semibold">role</span>
					<span class="text-ctp-text">{site?.aboutRole ?? 'Full-stack developer'}</span>

					<span class="text-ctp-blue font-semibold">location</span>
					<span class="text-ctp-text">{site?.aboutLocation ?? 'Lisbon, Portugal'}</span>

					<span class="text-ctp-blue font-semibold">stack</span>
					<span class="text-ctp-text">{site?.aboutStack ?? 'TypeScript, Svelte, Rust, Go, Node.js'}</span>

					<span class="text-ctp-blue font-semibold">editor</span>
					<span class="text-ctp-text">{site?.aboutEditor ?? 'Neovim (of course)'}</span>

					<span class="text-ctp-blue font-semibold">os</span>
					<span class="text-ctp-text">{site?.aboutOs ?? 'macOS / NixOS'}</span>
				</div>

				<div class="pt-2 text-ctp-subtext0 about-bio">
					{@html site?.aboutBioHtml ?? '<p>I care about building software that is fast, reliable, and pleasant to use. Most of my work lives at the intersection of web platforms and developer tooling.</p><p>When not coding, I am probably reading, running, or configuring my dotfiles for the hundredth time.</p>'}
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.about-bio :global(p + p) {
		margin-top: 0.5rem;
	}
</style>
