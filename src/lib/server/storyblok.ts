import { env } from '$env/dynamic/private';
import { renderRichText } from '@storyblok/js';
import sanitizeHtml from 'sanitize-html';
import type { Activity, ContentEntry, SiteContent } from '$lib/types';

const API_URL = 'https://api.storyblok.com/v2/cdn';

interface StoryblokAsset {
	filename?: string;
}

interface StoryblokContent {
	component: string;
	hero_enabled?: boolean;
	hero_type_speed?: string | number;
	title?: string;
	excerpt?: string;
	published_at?: string;
	date?: string;
	tags?: string[];
	reading_time?: string;
	cover_image?: StoryblokAsset;
	external_url?: { url?: string } | string;
	body?: Parameters<typeof renderRichText>[0];
	seo_title?: string;
	seo_description?: string;
	hero_file_name?: string;
	hero_greeting?: string;
	hero_description?: string;
	hero_interests?: string;
	github_url?: { url?: string } | string;
	x_url?: { url?: string } | string;
	linkedin_url?: { url?: string } | string;
	about_name?: string;
	about_role?: string;
	about_location?: string;
	about_stack?: string;
	about_editor?: string;
	about_os?: string;
	about_bio?: Parameters<typeof renderRichText>[0];
	contact_text?: string;
	contact_email?: string;
}

interface StoryblokStory {
	uuid: string;
	slug: string;
	full_slug: string;
	first_published_at?: string;
	content: StoryblokContent;
}

interface StoriesResponse {
	stories: StoryblokStory[];
}

interface StoryResponse {
	story: StoryblokStory;
}

function getUrl(value: { url?: string } | string | undefined): string | undefined {
	if (typeof value === 'string') return value || undefined;
	return value?.url || undefined;
}

function parseTypeSpeed(value: string | number | undefined): number | undefined {
	if (value === undefined || value === null || value === '') return undefined;
	const n = Number(value);
	return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function getToken(): string {
	const token = env.STORYBLOK_DELIVERY_API_TOKEN;
	if (!token) throw new Error('STORYBLOK_DELIVERY_API_TOKEN is not configured');
	return token;
}

async function request<T>(path: string, fetcher: typeof fetch): Promise<T | null> {
	const token = getToken();
	const url = new URL(`${API_URL}${path}`);
	url.searchParams.set('token', token);
	url.searchParams.set('version', 'published');

	const response = await fetcher(url, {
		headers: { Accept: 'application/json' }
	});

	if (response.status === 404) return null;
	if (!response.ok) throw new Error(`Storyblok request failed: ${response.status}`);

	return response.json() as Promise<T>;
}

function renderStoryblokRichText(document: Parameters<typeof renderRichText>[0]): string {
	return sanitizeHtml(renderRichText(document), {
		allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
		allowedAttributes: {
			a: ['href', 'target', 'rel'],
			img: ['src', 'alt', 'title', 'width', 'height']
		},
		allowedSchemes: ['http', 'https', 'mailto'],
		allowedSchemesAppliedToAttributes: ['href', 'src']
	});
}

function toActivity(story: StoryblokStory): Activity {
	const contentType = story.content.component === 'project' ? 'Project' : 'Blog';
	return {
		id: story.uuid,
		slug: story.slug,
		title: story.content.title ?? story.slug,
		type: contentType,
		date: story.content.published_at ?? story.content.date ?? story.first_published_at ?? '',
		excerpt: story.content.excerpt ?? '',
		image: story.content.cover_image?.filename,
		url: getUrl(story.content.external_url),
		tags: story.content.tags ?? [],
		meta: story.content.reading_time
	};
}

function toContentEntry(story: StoryblokStory): ContentEntry {
	return {
		...toActivity(story),
		bodyHtml: story.content.body ? renderStoryblokRichText(story.content.body) : '',
		seoTitle: story.content.seo_title,
		seoDescription: story.content.seo_description
	};
}

export async function getSite(fetcher: typeof fetch): Promise<SiteContent | null> {
	const response = await request<StoryResponse>('/stories/home', fetcher);
	if (!response) return null;

	const content = response.story.content;
	return {
		heroEnabled: content.hero_enabled,
		heroTypeSpeed: parseTypeSpeed(content.hero_type_speed),
		heroFileName: content.hero_file_name,
		heroGreeting: content.hero_greeting,
		heroDescription: content.hero_description,
		heroInterests: content.hero_interests,
		githubUrl: getUrl(content.github_url),
		xUrl: getUrl(content.x_url),
		linkedinUrl: getUrl(content.linkedin_url),
		aboutName: content.about_name,
		aboutRole: content.about_role,
		aboutLocation: content.about_location,
		aboutStack: content.about_stack,
		aboutEditor: content.about_editor,
		aboutOs: content.about_os,
		aboutBioHtml: content.about_bio ? renderStoryblokRichText(content.about_bio) : undefined,
		contactText: content.contact_text,
		contactEmail: content.contact_email
	};
}

export async function getActivities(fetcher: typeof fetch): Promise<Activity[]> {
	const response = await request<StoriesResponse>('/stories?starts_with=posts/&sort_by=first_published_at:desc', fetcher);
	const projectResponse = await request<StoriesResponse>(
		'/stories?starts_with=projects/&sort_by=first_published_at:desc',
		fetcher
	);

	return [...(response?.stories ?? []), ...(projectResponse?.stories ?? [])]
		.map(toActivity)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getContentEntry(
	contentType: 'posts' | 'projects',
	slug: string,
	fetcher: typeof fetch
): Promise<ContentEntry | null> {
	const response = await request<StoryResponse>(`/stories/${contentType}/${slug}`, fetcher);
	return response ? toContentEntry(response.story) : null;
}
