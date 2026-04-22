import type { Activity } from './types';

const STORYBLOK_TOKEN = import.meta.env.VITE_STORYBLOK_TOKEN || '';

export async function fetchActivities(): Promise<Activity[]> {
	if (!STORYBLOK_TOKEN) {
		console.warn('No Storyblok token found. Using mock data.');
		return mockActivities;
	}

	try {
		const response = await fetch(
			`https://api.storyblok.com/v2/cdn/stories?token=${STORYBLOK_TOKEN}&version=published&starts_with=activities/&sort_by=first_published_at:desc`
		);

		if (!response.ok) {
			throw new Error(`Storyblok API error: ${response.status}`);
		}

		const data = await response.json();

		return data.stories.map((story: any) => ({
			id: story.uuid,
			title: story.content.title,
			type: story.content.type,
			date: story.content.date || story.first_published_at,
			excerpt: story.content.excerpt,
			url: story.content.url,
			tags: story.content.tags || [],
			meta: story.content.meta
		}));
	} catch (error) {
		console.error('Failed to fetch from Storyblok:', error);
		return mockActivities;
	}
}

export const mockActivities: Activity[] = [
	{
		id: '1',
		title: 'Building a Real-Time Sync Engine with Rust',
		type: 'Blog',
		date: '2025-03-15',
		excerpt:
			'An exploration of operational transformation and CRDTs for collaborative editing. How we built a conflict-free sync layer that handles offline-first gracefully.',
		url: '#',
		tags: ['rust', 'distributed-systems'],
		meta: '12 min read'
	},
	{
		id: '2',
		title: 'dotfiles',
		type: 'Project',
		date: '2025-02-28',
		excerpt:
			'My personal Neovim, tmux, and shell configuration. A declarative setup managed with GNU Stow and a custom install script.',
		url: 'https://github.com/darosadev/dotfiles',
		tags: ['neovim', 'tmux', 'shell'],
		meta: 'Lua / Bash'
	},
	{
		id: '3',
		title: 'The Pragmatic Programmer',
		type: 'Goodreads',
		date: '2025-02-10',
		excerpt:
			'Revisited this classic after five years. The chapters on tracer bullets and prototype-driven development resonate even more now.',
		url: '#',
		meta: 'Andy Hunt & Dave Thomas'
	},
	{
		id: '4',
		title: 'Refactored the deployment pipeline to use Nix flakes',
		type: 'Micro',
		date: '2025-01-22',
		excerpt:
			'Reproducible builds are no longer a fantasy. The flake locks every dependency — from node_modules to system libraries.',
		meta: '2 replies'
	},
	{
		id: '5',
		title: 'Understanding Svelte 5 Runes',
		type: 'Blog',
		date: '2025-01-08',
		excerpt:
			'A deep dive into $state, $derived, and $effect. How the new reactivity model changes the way we think about component state.',
		url: '#',
		tags: ['svelte', 'frontend'],
		meta: '8 min read'
	},
	{
		id: '6',
		title: 'darosa.dev',
		type: 'Project',
		date: '2024-12-20',
		excerpt:
			'This very site. A terminal-inspired developer homepage built with SvelteKit, Tailwind, and Storyblok.',
		url: 'https://github.com/darosadev/darosadev-web',
		tags: ['svelte', 'tailwind', 'design'],
		meta: 'TypeScript / Svelte'
	},
	{
		id: '7',
		title: 'Working Effectively with Legacy Code',
		type: 'Goodreads',
		date: '2024-11-15',
		excerpt:
			"Michael Feathers' techniques for safely changing untested code. The seam concept alone is worth the price of admission.",
		url: '#',
		meta: 'Michael Feathers'
	},
	{
		id: '8',
		title: 'Shipped v2 of the internal CLI tool',
		type: 'Micro',
		date: '2024-10-30',
		excerpt:
			'Added interactive prompts with inquirer, auto-completion with fig, and a plugin architecture. Feels like a real product now.',
		meta: '5 replies'
	}
];
