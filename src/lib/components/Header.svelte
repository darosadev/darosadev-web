<script lang="ts">
	import { onMount } from 'svelte';
	import type { NavigationItem } from '$lib/types';

	const defaultNavItems: NavigationItem[] = [
		{ label: 'Projects', href: '#feed' },
		{ label: 'Blog', href: '#feed' },
		{ label: 'About', href: '#about' },
		{ label: 'Contact', href: '#contact' }
	];

	interface Props {
		navItems?: NavigationItem[];
	}

	let { navItems }: Props = $props();
	let items = $derived(navItems?.length ? navItems : defaultNavItems);
	let menuOpen = $state(false);
	let menuMounted = $state(false);

	function openMenu() {
		menuMounted = true;
		// Small delay to allow DOM mount before adding open class for transition
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				menuOpen = true;
			});
		});
	}

	function closeMenu() {
		menuOpen = false;
		setTimeout(() => {
			menuMounted = false;
		}, 350);
	}

	function toggleMenu() {
		if (menuOpen) {
			closeMenu();
		} else {
			openMenu();
		}
	}

	onMount(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && menuOpen) {
				closeMenu();
			}
		};
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	});
</script>

<header class="fixed top-0 left-0 right-0 z-50 border-b border-ctp-surface0/60 bg-ctp-crust/60 backdrop-blur-md">
	<div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
		<a
			href="#top"
			class="text-sm font-medium text-ctp-text hover:text-ctp-lavender transition-colors duration-200 shrink-0"
		>
			<span class="text-ctp-overlay0">&lt;</span>darosa.dev<span class="text-ctp-overlay0">/&gt;</span>
		</a>

		<!-- Desktop nav -->
		<nav class="hidden sm:flex items-center gap-1">
			{#each items as item}
				<a
					href={item.href}
					class="px-3 py-1.5 text-xs font-medium text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/50 rounded-md transition-all duration-200"
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<!-- Mobile hamburger button -->
		<button
			type="button"
			class="sm:hidden relative z-[60] w-10 h-10 flex items-center justify-center rounded-md text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/50 transition-all duration-200"
			aria-label="Toggle navigation menu"
			aria-expanded={menuOpen}
			onclick={toggleMenu}
		>
			<div class="relative w-5 h-5">
				<span
					class="absolute left-0 block w-5 h-0.5 bg-current transition-all duration-300 ease-out"
					class:top-1={!menuOpen}
					class:top-2={menuOpen}
					class:rotate-0={!menuOpen}
					class:rotate-45={menuOpen}
				></span>
				<span
					class="absolute left-0 top-2 block w-5 h-0.5 bg-current transition-all duration-300 ease-out"
					class:opacity-100={!menuOpen}
					class:opacity-0={menuOpen}
					class:scale-x-100={!menuOpen}
					class:scale-x-0={menuOpen}
				></span>
				<span
					class="absolute left-0 block w-5 h-0.5 bg-current transition-all duration-300 ease-out"
					class:top-3={!menuOpen}
					class:top-2={menuOpen}
					class:rotate-0={!menuOpen}
					class:-rotate-45={menuOpen}
				></span>
			</div>
		</button>
	</div>
</header>

<!-- Full-screen mobile menu -->
{#if menuMounted}
	<div
		class="fixed inset-0 z-[55] bg-ctp-crust/98 backdrop-blur-xl flex flex-col transition-opacity duration-300 ease-out"
		class:opacity-0={!menuOpen}
		class:opacity-100={menuOpen}
		class:pointer-events-none={!menuOpen}
	>
		<!-- Close button -->
		<div class="flex justify-end px-4 pt-3 h-14 items-center shrink-0">
			<button
				type="button"
				class="w-10 h-10 flex items-center justify-center rounded-md text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/50 transition-all duration-200"
				aria-label="Close navigation menu"
				onclick={closeMenu}
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>

		<!-- Menu links -->
		<nav class="flex flex-col items-center justify-center gap-2 flex-1 px-6 pb-14">
			{#each items as item, i}
				<a
					href={item.href}
					class="w-full max-w-xs text-center px-6 py-4 text-2xl font-medium text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/30 rounded-xl transition-all duration-300 ease-out"
					class:opacity-0={!menuOpen}
					class:opacity-100={menuOpen}
					class:translate-y-6={!menuOpen}
					class:translate-y-0={menuOpen}
					style="transition-delay: {menuOpen ? 0.1 + i * 0.06 : 0}s;"
					onclick={closeMenu}
				>
					{item.label}
				</a>
			{/each}
		</nav>
	</div>
{/if}
