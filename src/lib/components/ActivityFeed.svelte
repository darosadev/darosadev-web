<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchActivities } from '$lib/storyblok';
	import { fetchGoodreads } from '$lib/goodreads';
	import { fetchMicro } from '$lib/micro';
	import type { Activity, ActivityType } from '$lib/types';

	let activities = $state<Activity[]>([]);
	let loading = $state(true);

	const tagColors: Record<ActivityType, string> = {
		Blog: 'bg-ctp-surface0 text-ctp-blue border-ctp-blue',
		Project: 'bg-ctp-surface0 text-ctp-green border-ctp-green',
		Goodreads: 'bg-ctp-surface0 text-ctp-peach border-ctp-peach',
		Micro: 'bg-ctp-surface0 text-ctp-mauve border-ctp-mauve'
	};

	const typeIcons: Record<ActivityType, string> = {
		Blog: '📝',
		Project: '⚡',
		Goodreads: '📚',
		Micro: '💬'
	};

	onMount(async () => {
		const [storyblokData, goodreadsData, microData] = await Promise.all([
			fetchActivities(),
			fetchGoodreads(),
			fetchMicro()
		]);

		const all = [...storyblokData, ...goodreadsData, ...microData];
		all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

		activities = all;
		loading = false;

		// GSAP entrance animations
		if (typeof window !== 'undefined') {
			const gsap = await import('gsap');
			const { ScrollTrigger } = await import('gsap/ScrollTrigger');
			gsap.gsap.registerPlugin(ScrollTrigger);

			const cards = document.querySelectorAll('.activity-card');
			gsap.gsap.fromTo(
				cards,
				{ opacity: 0, y: 30 },
				{
					opacity: 1,
					y: 0,
					duration: 0.6,
					stagger: 0.1,
					ease: 'power2.out',
					scrollTrigger: {
						trigger: '#feed',
						start: 'top 80%'
					}
				}
			);
		}
	});

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		return d.toISOString().split('T')[0];
	}
</script>

<section id="feed" class="relative z-10 py-16 sm:py-24 px-4 sm:px-6">
	<div class="max-w-3xl mx-auto">
		<div class="flex items-center gap-3 mb-10">
			<span class="text-xs font-medium text-ctp-text uppercase tracking-widest">
				<span class="text-ctp-overlay0">&lt;</span>latest_activity<span class="text-ctp-overlay0">/&gt;</span>
			</span>
			<div class="h-px flex-1 bg-ctp-surface0"></div>
		</div>

		{#if loading}
			<div class="flex items-center justify-center py-20">
				<div class="text-sm text-ctp-overlay0 animate-pulse">loading feed...</div>
			</div>
		{:else}
			<div class="flex flex-col gap-5">
				{#each activities as activity}
					<article class="activity-card group relative rounded-lg border border-ctp-surface0 bg-ctp-mantle hover:border-ctp-surface1 hover:bg-ctp-surface0/40 transition-all duration-300">
						<!-- Tag badge -->
						<div class="absolute -top-2.5 left-4">
							<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border {tagColors[activity.type]}">
								<span class="text-[10px]">{typeIcons[activity.type]}</span>
								{activity.type}
							</span>
						</div>

						<div class="p-5 pt-6">
							<div class="flex items-baseline justify-between gap-4 mb-2">
								{#if activity.url}
									<a
										href={activity.url}
										target="_blank"
										rel="noopener noreferrer"
										class="text-sm font-semibold text-ctp-text hover:text-ctp-lavender transition-colors duration-200"
									>
										{activity.title}
									</a>
								{:else}
									<h3 class="text-sm font-semibold text-ctp-text">{activity.title}</h3>
								{/if}
							</div>

							<p class="text-xs text-ctp-subtext0 leading-relaxed mb-3">{activity.excerpt}</p>

							<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ctp-overlay0">
								<time datetime={activity.date}>{formatDate(activity.date)}</time>
								{#if activity.meta}
									<span class="text-ctp-surface1">·</span>
									<span>{activity.meta}</span>
								{/if}
								{#if activity.tags && activity.tags.length > 0}
									<span class="text-ctp-surface1">·</span>
									<div class="flex flex-wrap gap-1.5">
										{#each activity.tags as tag}
											<span class="text-ctp-overlay1">#{tag}</span>
										{/each}
									</div>
								{/if}
							</div>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</section>
