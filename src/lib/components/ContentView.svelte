<script lang="ts">
	import type { Activity, ActivityType } from '$lib/types';
	import Footer from './Footer.svelte';

	interface Props {
		post: Activity | null;
		notFound: boolean;
		contentType: ActivityType;
		loadingLabel?: string;
		notFoundLabel?: string;
		fileExtension?: string;
	}

	let {
		post,
		notFound,
		contentType,
		loadingLabel = 'loading...',
		notFoundLabel = 'content not found',
		fileExtension = 'md'
	}: Props = $props();

	const tagColorMap: Record<ActivityType, string> = {
		Blog: 'border-ctp-blue text-ctp-blue',
		Project: 'border-ctp-green text-ctp-green',
		Goodreads: 'border-ctp-peach text-ctp-peach',
		Micro: 'border-ctp-mauve text-ctp-mauve'
	};

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		return d.toISOString().split('T')[0];
	}
</script>

<section class="min-h-screen pt-14 pb-8 px-4 sm:px-6">
	<div class="max-w-3xl mx-auto">
		<!-- Back link -->
		<div class="py-6">
			<a
				href="/"
				class="inline-flex items-center gap-2 text-xs font-medium text-ctp-subtext0 hover:text-ctp-text transition-colors duration-200"
			>
				<span class="text-ctp-overlay0">←</span>
				<span>cd ~</span>
			</a>
		</div>

		{#if notFound}
			<div class="rounded-lg border border-ctp-surface0 bg-ctp-mantle overflow-hidden">
				<div class="flex items-center gap-2 px-4 py-2.5 border-b border-ctp-surface0 bg-ctp-crust">
					<span class="text-[10px] text-ctp-overlay0 font-medium">joaquim@darosa.dev</span>
					<span class="text-ctp-surface1">:</span>
					<span class="text-[10px] text-ctp-blue font-medium">~</span>
					<span class="text-ctp-surface1">$</span>
					<span class="text-[10px] text-ctp-red font-medium ml-1">cat: {notFoundLabel}</span>
				</div>
				<div class="p-6 font-mono text-xs text-ctp-subtext0">
					<p>The {contentType.toLowerCase()} you are looking for does not exist.</p>
					<p class="mt-2">
						<a href="/" class="text-ctp-blue hover:text-ctp-lavender transition-colors underline underline-offset-4">
							← go back home
						</a>
					</p>
				</div>
			</div>
		{:else if post}
			<!-- Terminal window -->
			<div class="rounded-xl overflow-hidden border border-ctp-surface0 bg-ctp-mantle shadow-2xl shadow-ctp-crust/50">
				<!-- Title bar -->
				<div class="flex items-center gap-2 px-3 sm:px-4 py-3 border-b border-ctp-surface0 bg-ctp-crust">
					<div class="flex items-center gap-1.5 shrink-0">
						<div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-ctp-red"></div>
						<div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-ctp-yellow"></div>
						<div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-ctp-green"></div>
					</div>
					<div class="flex-1 text-center min-w-0">
						<span class="text-[10px] text-ctp-overlay0 font-medium tracking-wide truncate block">
							{post.slug}.{fileExtension} — darosa.dev
						</span>
					</div>
					<div class="w-10 sm:w-16 shrink-0"></div>
				</div>

				<!-- Image -->
				{#if post.image}
					<div class="border-b border-ctp-surface0">
						<img
							src={post.image}
							alt={post.title}
							class="w-full h-48 sm:h-64 object-cover"
							loading="eager"
						/>
					</div>
				{/if}

				<!-- Content -->
				<div class="p-5 sm:p-8">
					<!-- Meta header -->
					<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ctp-overlay0 mb-4 font-mono">
						<span class="px-2 py-0.5 rounded-full border bg-ctp-surface0 font-semibold uppercase tracking-wider {tagColorMap[contentType]}">
							{contentType}
						</span>
						<time datetime={post.date}>{formatDate(post.date)}</time>
						{#if post.meta}
							<span class="text-ctp-surface1">·</span>
							<span>{post.meta}</span>
						{/if}
						{#if post.tags && post.tags.length > 0}
							<span class="text-ctp-surface1">·</span>
							<div class="flex flex-wrap gap-1.5">
								{#each post.tags as tag}
									<span class="text-ctp-overlay1">#{tag}</span>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Title -->
					<h1 class="text-lg sm:text-xl font-bold text-ctp-text mb-6 leading-snug">
						{post.title}
					</h1>

					<!-- Body -->
					<div class="font-mono text-xs sm:text-sm text-ctp-subtext1 leading-relaxed space-y-4">
						{#if post.content}
							{#each post.content.split('\n\n') as paragraph}
								{#if paragraph.startsWith('## ')}
									<h2 class="text-sm font-semibold text-ctp-text mt-6 mb-2">
										<span class="text-ctp-mauve">##</span>
										<span class="ml-1">{paragraph.replace('## ', '')}</span>
									</h2>
								{:else if paragraph.startsWith('`') && paragraph.endsWith('`')}
									<code class="block bg-ctp-surface0 rounded-md px-3 py-2 text-ctp-text font-mono text-xs overflow-x-auto">
										{paragraph.slice(1, -1)}
									</code>
								{:else}
									<p class="text-ctp-subtext0">{paragraph}</p>
								{/if}
							{/each}
						{:else}
							<p class="text-ctp-subtext0 italic">{post.excerpt}</p>
						{/if}
					</div>
				</div>
			</div>
		{:else}
			<!-- Loading -->
			<div class="flex items-center justify-center py-20">
				<div class="text-sm text-ctp-overlay0 animate-pulse font-mono">{loadingLabel}</div>
			</div>
		{/if}
	</div>
</section>

<Footer />
