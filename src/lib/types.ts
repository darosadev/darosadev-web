export type ActivityType = 'Blog' | 'Project' | 'Goodreads' | 'Micro';

export interface Activity {
	id: string;
	title: string;
	type: ActivityType;
	date: string;
	excerpt: string;
	url?: string;
	tags?: string[];
	meta?: string;
}

export interface StoryblokActivity {
	uuid: string;
	content: {
		title: string;
		type: ActivityType;
		date: string;
		excerpt: string;
		url?: string;
		tags?: string[];
		meta?: string;
	};
}
