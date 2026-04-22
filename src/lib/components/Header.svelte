<script lang="ts">
	const navItems = [
		{ label: 'Projects', href: '#feed' },
		{ label: 'Blog', href: '#feed' },
		{ label: 'About', href: '#about' },
		{ label: 'Contact', href: '#contact' }
	];
</script>

<header class="fixed top-0 left-0 right-0 z-50 border-b border-ctp-surface0/60 backdrop-blur-md">
	<div class="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
		<a
			href="#top"
			class="text-sm font-medium text-ctp-text hover:text-ctp-lavender transition-colors duration-200"
		>
			<span class="text-ctp-overlay0">&lt;</span>darosa.dev<span class="text-ctp-overlay0">/&gt;</span>
		</a>

		<nav class="hidden sm:flex items-center gap-1">
			{#each navItems as item}
				<a
					href={item.href}
					class="px-3 py-1.5 text-xs font-medium text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/50 rounded-md transition-all duration-200"
				>
					{item.label}
				</a>
			{/each}
		</nav>
	</div>
</header>
