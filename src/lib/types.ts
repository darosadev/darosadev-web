export type ActivityType = 'Blog' | 'Project' | 'Goodreads' | 'Micro';

export interface Activity {
	id: string;
	slug: string;
	title: string;
	type: ActivityType;
	date: string;
	excerpt: string;
	content?: string;
	image?: string;
	url?: string;
	tags?: string[];
	meta?: string;
}

export interface StoryblokActivity {
	uuid: string;
	content: {
		slug: string;
		title: string;
		type: ActivityType;
		date: string;
		excerpt: string;
		content?: string;
		image?: string;
		url?: string;
		tags?: string[];
		meta?: string;
	};
}
