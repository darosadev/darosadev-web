<script lang="ts">
	import { onMount } from 'svelte';

	const links = [
		{ label: 'github', href: 'https://github.com/darosadev' },
		{ label: 'x', href: 'https://x.com/darosadev' },
		{ label: 'linkedin', href: 'https://www.linkedin.com/in/joaquimacrosa/' },
		{ label: 'email', href: 'mailto:joaquim@darosa.dev' }
	];

	onMount(async () => {
		if (typeof window !== 'undefined') {
			const gsap = await import('gsap');
			const { ScrollTrigger } = await import('gsap/ScrollTrigger');
			gsap.gsap.registerPlugin(ScrollTrigger);

			gsap.gsap.fromTo(
				'#contact-content',
				{ opacity: 0, y: 30 },
				{
					opacity: 1,
					y: 0,
					duration: 0.7,
					ease: 'power2.out',
					scrollTrigger: {
						trigger: '#contact',
						start: 'top 75%'
					}
				}
			);
		}
	});
</script>

<section id="contact" class="relative z-10 py-16 sm:py-24 px-4 sm:px-6">
	<div class="max-w-3xl mx-auto">
		<div class="flex items-center gap-3 mb-10">
			<span class="text-xs font-medium text-ctp-text uppercase tracking-widest">
				<span class="text-ctp-overlay0">&lt;</span>contact<span class="text-ctp-overlay0">/&gt;</span>
			</span>
			<div class="h-px flex-1 bg-ctp-surface0"></div>
		</div>

		<div id="contact-content" class="rounded-lg border border-ctp-surface0 bg-ctp-mantle overflow-hidden">
			<div class="flex items-center gap-2 px-4 py-2.5 border-b border-ctp-surface0 bg-ctp-crust/50">
				<span class="text-[10px] text-ctp-overlay0 font-medium">joaquim@darosa.dev</span>
				<span class="text-ctp-surface1">:</span>
				<span class="text-[10px] text-ctp-blue font-medium">~</span>
				<span class="text-ctp-surface1">$</span>
				<span class="text-[10px] text-ctp-text font-medium ml-1">ssh contact</span>
			</div>

			<div class="p-6 font-mono text-xs leading-relaxed">
				<p class="text-ctp-subtext0 mb-6">
					Open to collaborations, interesting projects, or just a chat about tech.
					Reach out through any of the channels below.
				</p>

				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{#each links as link}
						<a
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							class="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-md border border-ctp-surface0/40 bg-ctp-surface0/20 hover:bg-ctp-surface0/40 hover:border-ctp-surface1/60 transition-all duration-200 group"
						>
							<span class="text-sm sm:text-lg text-ctp-subtext0 group-hover:text-ctp-lavender transition-colors font-mono truncate max-w-full">~/{link.label}</span>
							<span class="text-[10px] text-ctp-overlay0 group-hover:text-ctp-text transition-colors">{link.label}</span>
						</a>
					{/each}
				</div>

				<div class="mt-6 pt-4 border-t border-ctp-surface0/40">
					<span class="text-ctp-overlay0">$</span>
					<span class="text-ctp-green ml-1">echo</span>
					<span class="text-ctp-peach ml-1">"joaquim@darosa.dev"</span>
				</div>
			</div>
		</div>
	</div>
</section>
