import type { Activity } from './types';

const MICRO_API_URL = import.meta.env.VITE_MICRO_API_URL || '';
const MICRO_HANDLE = import.meta.env.VITE_MICRO_HANDLE || '';

export async function fetchMicro(): Promise<Activity[]> {
	if (!MICRO_API_URL || !MICRO_HANDLE) {
		console.warn('Micro feed credentials not configured. Skipping.');
		return [];
	}

	// Placeholder: integrate with Mastodon / Bluesky / Twitter API
	// Example Mastodon: https://{instance}/api/v1/accounts/{id}/statuses
	try {
		const response = await fetch(`${MICRO_API_URL}`);

		if (!response.ok) {
			throw new Error(`Micro API error: ${response.status}`);
		}

		const data = await response.json();

		// Map to Activity[] based on your API response shape
		return [];
	} catch (error) {
		console.error('Failed to fetch Micro feed:', error);
		return [];
	}
}
