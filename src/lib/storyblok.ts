import type { Activity } from './types';

const STORYBLOK_TOKEN = import.meta.env.VITE_STORYBLOK_TOKEN || '';

export function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

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
			slug: story.content.slug || story.slug || slugify(story.content.title),
			title: story.content.title,
			type: story.content.type,
			date: story.content.date || story.first_published_at,
			excerpt: story.content.excerpt,
			content: story.content.content,
			image: story.content.image,
			url: story.content.url,
			tags: story.content.tags || [],
			meta: story.content.meta
		}));
	} catch (error) {
		console.error('Failed to fetch from Storyblok:', error);
		return mockActivities;
	}
}

export function getPostBySlug(slug: string): Activity | undefined {
	return mockActivities.find((a) => a.type === 'Blog' && a.slug === slug);
}

export function getProjectBySlug(slug: string): Activity | undefined {
	return mockActivities.find((a) => a.type === 'Project' && a.slug === slug);
}

export const mockActivities: Activity[] = [
	{
		id: '1',
		slug: 'building-a-real-time-sync-engine-with-rust',
		title: 'Building a Real-Time Sync Engine with Rust',
		type: 'Blog',
		date: '2025-03-15',
		excerpt:
			'An exploration of operational transformation and CRDTs for collaborative editing. How we built a conflict-free sync layer that handles offline-first gracefully.',
		content: `Collaborative editing is hard. When multiple users edit the same document simultaneously, you need a strategy for resolving conflicts that feels natural rather than destructive.

In this post I want to share how we approached building a real-time sync engine for a collaborative notes application, and why we ended up choosing a hybrid OT + CRDT approach.

## The Problem

Traditional locking strategies don't work for real-time collaboration. If User A and User B both type at the same time, you can't simply lock the document and force one to wait. The experience needs to feel instantaneous.

## Operational Transformation

OT has been the standard approach since Google Docs popularized it. The core idea: every operation is transformed against concurrent operations so that all clients converge to the same state.

The catch? OT requires a central server to serialize operations. If the server goes down, or if a client goes offline, you have a problem.

## CRDTs

Conflict-free Replicated Data Types take a different approach. Instead of transforming operations, CRDTs use data structures that are mathematically guaranteed to converge regardless of the order in which updates are applied.

The trade-off is memory overhead and complexity in the data model. But for offline-first applications, CRDTs are a natural fit.

## Our Hybrid Approach

We use a per-character CRDT for the document body, which gives us offline-first guarantees. On top of that, we layer an OT-like transformation for cursor positions and selection ranges, which don't need the same durability guarantees.

The result: sub-50ms sync latency on a good connection, and full offline support when connectivity drops.`,
		image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop',
		url: '#',
		tags: ['rust', 'distributed-systems'],
		meta: '12 min read'
	},
	{
		id: '2',
		slug: 'dotfiles',
		title: 'dotfiles',
		type: 'Project',
		date: '2025-02-28',
		excerpt:
			'My personal Neovim, tmux, and shell configuration. A declarative setup managed with GNU Stow and a custom install script.',
		content: `My dotfiles are the result of years of incremental refinement. Every shortcut, alias, and plugin has been chosen for a reason.

## What's Inside

- **Neovim** configured in Lua with LSP, Treesitter, Telescope, and a custom statusline
- **tmux** with sensible keybindings, a catppuccin theme, and session restoration via resurrect
- **zsh** with completions, syntax highlighting, and a minimal prompt
- **Git** aliases that save keystrokes every day

## Installation

\`git clone https://github.com/darosadev/dotfiles.git && cd dotfiles && ./install\`

The install script uses GNU Stow to symlink everything into place. It is idempotent — run it as many times as you want.

## Philosophy

I believe configuration should be transparent. Every file is commented. Nothing is hidden behind a plugin manager abstraction. If something breaks, I want to know exactly where to look.`,
		image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&h=600&fit=crop',
		url: 'https://github.com/darosadev/dotfiles',
		tags: ['neovim', 'tmux', 'shell'],
		meta: 'Lua / Bash'
	},
	{
		id: '3',
		slug: 'the-pragmatic-programmer',
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
		slug: 'refactored-deployment-pipeline-nix-flakes',
		title: 'Refactored the deployment pipeline to use Nix flakes',
		type: 'Micro',
		date: '2025-01-22',
		excerpt:
			'Reproducible builds are no longer a fantasy. The flake locks every dependency — from node_modules to system libraries.',
		meta: '2 replies'
	},
	{
		id: '5',
		slug: 'understanding-svelte-5-runes',
		title: 'Understanding Svelte 5 Runes',
		type: 'Blog',
		date: '2025-01-08',
		excerpt:
			'A deep dive into $state, $derived, and $effect. How the new reactivity model changes the way we think about component state.',
		content: `Svelte 5 introduces a new reactivity model based on runes. After building a few projects with it, I have thoughts.

## What are Runes?

Runes are explicit reactive primitives. Instead of the compiler magically making variables reactive, you now declare reactivity with functions like $state, $derived, and $effect.

## $state

\`$state\` declares reactive state. Any mutation to a $state variable triggers updates in derived values and effects that depend on it.

## $derived

\`$derived\` creates a computed value that automatically updates when its dependencies change. It's similar to computed properties in Vue or useMemo in React, but without the manual dependency array.

## $effect

\`$effect\` replaces the old \`$:\` reactive statements. It runs side effects whenever its dependencies change. The key difference: effects are now explicit and scoped.

## My Take

I was skeptical at first. Svelte's magic was what made it appealing. But after using runes for a while, I appreciate the clarity. Debugging reactivity is now straightforward because you can see exactly what's reactive and what isn't.

The migration from Svelte 4 is not trivial, but the benefits are real.`,
		image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop',
		url: '#',
		tags: ['svelte', 'frontend'],
		meta: '8 min read'
	},
	{
		id: '6',
		slug: 'darosa-dev',
		title: 'darosa.dev',
		type: 'Project',
		date: '2024-12-20',
		excerpt:
			'This very site. A terminal-inspired developer homepage built with SvelteKit, Tailwind, and Storyblok.',
		content: `This site is my personal corner of the internet. I wanted something that felt like a terminal — minimal, fast, and developer-native.

## Stack

- **SvelteKit** for the framework
- **Tailwind CSS** for styling with a custom Catppuccin Mocha theme
- **Storyblok** as the CMS (with mock data fallback)
- **GSAP** for scroll-triggered animations
- **Canvas API** for the interactive grid background

## Design Decisions

Every section is styled like a terminal window. The hero section mimics a shell session. The activity feed uses tag badges that feel like labels in an issue tracker. Even the separators use code-tag syntax.

The grid background responds to mouse movement — vertices near the cursor light up with teal squares. It is subtle enough to not distract, but adds a layer of depth that makes the page feel alive.

## Performance

The site is statically generated and served from a lightweight Node server on Fly.io. Total JS bundle is under 150KB gzipped. First Contentful Paint is well under 1s on a good connection.`,
		image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop',
		url: 'https://github.com/darosadev/darosadev-web',
		tags: ['svelte', 'tailwind', 'design'],
		meta: 'TypeScript / Svelte'
	},
	{
		id: '7',
		slug: 'working-effectively-with-legacy-code',
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
		slug: 'shipped-v2-internal-cli-tool',
		title: 'Shipped v2 of the internal CLI tool',
		type: 'Micro',
		date: '2024-10-30',
		excerpt:
			'Added interactive prompts with inquirer, auto-completion with fig, and a plugin architecture. Feels like a real product now.',
		meta: '5 replies'
	}
];
