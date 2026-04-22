import type { Activity } from './types';

const GOODREADS_USER_ID = import.meta.env.VITE_GOODREADS_USER_ID || '';
const GOODREADS_API_KEY = import.meta.env.VITE_GOODREADS_API_KEY || '';

export async function fetchGoodreads(): Promise<Activity[]> {
	if (!GOODREADS_USER_ID || !GOODREADS_API_KEY) {
		console.warn('Goodreads credentials not configured. Skipping.');
		return [];
	}

	// Placeholder: integrate with Goodreads API or RSS feed
	// Example RSS: https://www.goodreads.com/review/list/{USER_ID}.xml?key={API_KEY}&v=2&shelf=read
	try {
		const response = await fetch(
			`https://www.goodreads.com/review/list/${GOODREADS_USER_ID}.xml?key=${GOODREADS_API_KEY}&v=2&shelf=read&sort=date_read&order=d`
		);

		if (!response.ok) {
			throw new Error(`Goodreads API error: ${response.status}`);
		}

		// Parse XML and map to Activity[]
		// This is a placeholder — implement XML parsing when ready
		return [];
	} catch (error) {
		console.error('Failed to fetch Goodreads:', error);
		return [];
	}
}
