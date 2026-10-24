<script lang="ts">
	import { onMount } from 'svelte';
	import type { SiteContent } from '$lib/types';

	interface Props {
		site: SiteContent | null;
	}

	let { site }: Props = $props();
	const prompt = 'joaquim@darosa.dev:~$ cat welcome.md';

	let lines = $derived([
		{ text: `# ${site?.heroFileName ?? 'welcome.md'}`, class: 'text-ctp-mauve font-bold' },
		{ text: '', class: '' },
		{ text: `> ${site?.heroGreeting ?? "hey, i'm joaquim."}`, class: 'text-ctp-green' },
		{ text: `> ${site?.heroDescription ?? 'i build things for the web.'}`, class: 'text-ctp-green' },
		{ text: '', class: '' },
		{
			text: '> currently tinkering with ',
			class: 'text-ctp-subtext0',
			suffix: {
				text: site?.heroInterests ?? '[svelte], [rust], and [neovim].',
				class: 'text-ctp-yellow'
			}
		},
		{ text: '', class: '' },
		{ text: '---', class: 'text-ctp-overlay0' },
		{ text: '', class: '' },
		{
			text: 'find me on: ',
			class: 'text-ctp-subtext0',
			suffix: { text: 'github  x  linkedin', class: 'text-ctp-sapphire underline underline-offset-4' }
		}
	]);

	let promptVisible = $state('');
	let currentLineIndex = $state(-1);
	let currentLineText = $state('');
	let showCursor = $state(true);
	let typingComplete = $state(false);

	onMount(() => {
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const typeSpeed = prefersReducedMotion ? 0 : (site?.heroTypeSpeed ?? 35);

		// Type prompt
		let promptIndex = 0;
		const typePrompt = () => {
			if (promptIndex <= prompt.length) {
				promptVisible = prompt.slice(0, promptIndex);
				promptIndex++;
				setTimeout(typePrompt, typeSpeed);
			} else {
				setTimeout(() => {
					currentLineIndex = 0;
					typeLine(0, 0);
				}, 400);
			}
		};

		const typeLine = (lineIdx: number, charIdx: number) => {
			if (lineIdx >= lines.length) {
				typingComplete = true;
				return;
			}

			const line = lines[lineIdx];
			const fullText = line.text;

			if (charIdx <= fullText.length) {
				currentLineText = fullText.slice(0, charIdx);
				setTimeout(() => typeLine(lineIdx, charIdx + 1), typeSpeed);
			} else {
				currentLineIndex = lineIdx + 1;
				currentLineText = '';
				setTimeout(() => typeLine(lineIdx + 1, 0), typeSpeed * 2);
			}
		};

		setTimeout(typePrompt, 500);

		// Blinking cursor
		const cursorInterval = setInterval(() => {
			showCursor = !showCursor;
		}, 530);

		return () => clearInterval(cursorInterval);
	});
</script>

<section class="min-h-[90vh] flex items-center justify-center px-6 pt-14">
	<div class="w-full max-w-2xl">
		<!-- Window chrome -->
		<div class="rounded-xl overflow-hidden border border-ctp-surface0 bg-ctp-mantle shadow-2xl shadow-ctp-crust/50 backdrop-blur-sm">
			<!-- Title bar -->
			<div class="flex items-center gap-2 px-3 sm:px-4 py-3 border-b border-ctp-surface0 bg-ctp-crust">
				<div class="flex items-center gap-1.5 shrink-0">
					<div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-ctp-red"></div>
					<div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-ctp-yellow"></div>
					<div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-ctp-green"></div>
				</div>
				<div class="flex-1 text-center min-w-0">
					<span class="text-[10px] text-ctp-overlay0 font-medium tracking-wide truncate block">welcome.md — darosa.dev</span>
				</div>
				<div class="w-10 sm:w-16 shrink-0"></div>
			</div>

			<!-- Terminal content -->
			<div class="p-4 sm:p-8 font-mono text-xs sm:text-sm leading-relaxed min-h-[280px] sm:min-h-[320px]">
				<div class="text-ctp-subtext0 mb-4">
					<span>{promptVisible}</span>{#if !typingComplete}<span class="inline-block w-2 h-4 bg-ctp-text align-middle ml-0.5" class:opacity-0={!showCursor}></span>{/if}
				</div>

				{#each lines as line, i}
					{#if i < currentLineIndex}
						<div class={line.class}>
							{line.text}
							{#if line.suffix}
								<span class={line.suffix.class}>{line.suffix.text}</span>
							{/if}
						</div>
					{:else if i === currentLineIndex}
						<div class={line.class}>
							{currentLineText}<span class="inline-block w-2 h-4 bg-ctp-text align-middle ml-0.5" class:opacity-0={!showCursor}></span>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</section>
