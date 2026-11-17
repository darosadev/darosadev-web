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

export interface ContentEntry extends Activity {
	bodyHtml: string;
	seoTitle?: string;
	seoDescription?: string;
}

export interface SiteContent {
	heroEnabled?: boolean;
	heroTypeSpeed?: number;
	heroFileName?: string;
	heroGreeting?: string;
	heroDescription?: string;
	heroInterests?: string;
	githubUrl?: string;
	xUrl?: string;
	linkedinUrl?: string;
	aboutName?: string;
	aboutRole?: string;
	aboutLocation?: string;
	aboutStack?: string;
	aboutEditor?: string;
	aboutOs?: string;
	aboutBioHtml?: string;
	contactText?: string;
	contactEmail?: string;
}
