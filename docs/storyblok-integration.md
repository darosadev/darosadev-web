# Storyblok CMS integration

## Scope

This document covers the work introduced on `build/storyblok` relative to `feat/redesign` (`2fcc811`). The branch replaces the client-side, mock-backed Storyblok implementation with server-rendered Storyblok content and changes the application from a static build to a Node server.

## Overview

- Load the home story, posts, and projects from Storyblok on the server.
- Keep the Storyblok Delivery API token private instead of exposing it through a `VITE_` browser variable.
- Render Storyblok rich text as sanitized HTML.
- Replace query-string detail pages with dynamic post and project routes.
- Add route-level caching, canonical URLs, and social/SEO metadata.
- Make the hero, about section, contact details, and activity feed CMS-driven while retaining local presentation fallbacks.
- Continue loading Goodreads and Micro activity in the browser and merge it with CMS activity.
- Serve the application with SvelteKit's Node adapter rather than prerendering it as a static site.

## Server-side Storyblok integration

The former `src/lib/storyblok.ts` browser module and its mock activities were removed. The new `src/lib/server/storyblok.ts` module:

- Reads `STORYBLOK_DELIVERY_API_TOKEN` from SvelteKit's private dynamic environment.
- Uses SvelteKit's provided `fetch` implementation to call `https://api.storyblok.com/v2/cdn`.
- Requests only the `published` content version and sends an `Accept: application/json` header.
- Throws a clear configuration error when the token is missing.
- Returns `null` for Storyblok 404 responses and throws for other unsuccessful responses.
- Converts Storyblok stories into the shared `Activity`, `ContentEntry`, and `SiteContent` types.

### Content requests

| Data | Storyblok request |
| --- | --- |
| Site settings | `GET /stories/home` |
| Posts | `GET /stories?starts_with=posts/&sort_by=first_published_at:desc` |
| Projects | `GET /stories?starts_with=projects/&sort_by=first_published_at:desc` |
| Single post | `GET /stories/posts/{slug}` |
| Single project | `GET /stories/projects/{slug}` |

The home page loads site settings and activities concurrently. Post and project lists are combined and sorted by date, newest first.

For each post or project:

- A story whose content component is `project` becomes a `Project`; other components become `Blog`.
- The title falls back to the story slug.
- The date uses `published_at`, then `date`, then `first_published_at`, then an empty string.
- Tags default to an empty list and missing excerpts default to an empty string.
- `cover_image.filename` supplies the image.
- `external_url` accepts either a string or a Storyblok link object.
- `reading_time` supplies the activity metadata.

## Storyblok content contract

### Home story

The story at `home` supports the following fields. Every homepage field is optional in the application.

| Storyblok field | Application behavior |
| --- | --- |
| `hero_enabled` | Shows or hides the hero; missing values default to visible. |
| `hero_type_speed` | Sets typing delay in milliseconds. Numeric strings are accepted; negative and non-finite values are ignored. Reduced-motion preferences still force a delay of zero. |
| `hero_file_name` | Sets the filename shown in the hero. |
| `hero_greeting` | Sets the greeting line. |
| `hero_description` | Sets the description line. |
| `hero_interests` | Sets the highlighted interests line. |
| `github_url`, `x_url`, `linkedin_url` | Set contact/social links; strings and Storyblok link objects are supported. |
| `about_name`, `about_role`, `about_location` | Populate the about panel. |
| `about_stack`, `about_editor`, `about_os` | Populate the remaining about metadata. |
| `about_bio` | Supplies rich-text biography content. |
| `contact_text` | Sets the contact introduction. |
| `contact_email` | Sets both the email link and the displayed terminal email. |

The previous local content remains as the fallback for missing home fields. If the `home` story does not exist, the site content is `null` and those fallbacks are used. The previous mock post/project activity is not retained.

### Post and project stories

Posts live below `posts/`; projects live below `projects/`. Their slugs form the public URLs. Supported fields are:

- `title`
- `excerpt`
- `published_at` or `date`
- `tags`
- `reading_time`
- `cover_image`
- `external_url`
- `body` (Storyblok rich text)
- `seo_title`
- `seo_description`

## Homepage changes

### Server loading and caching

`src/routes/+page.server.ts` now supplies the page with `site` and `activities` data. Homepage responses use:

```text
cache-control: public, max-age=60, s-maxage=300, stale-while-revalidate=600
```

### Hero

`TerminalHero.svelte` receives the site content as a prop. The filename, greeting, description, interests, and typing speed can now come from Storyblok. The homepage respects `hero_enabled` and renders the hero by default when the setting is absent.

### Activity feed

`ActivityFeed.svelte` now receives Storyblok activities from the server instead of fetching them in the browser. Goodreads and Micro are still fetched client-side on mount, in parallel. CMS and external activities are merged and sorted newest first.

Internal activity links now use `/posts/{slug}` and `/projects/{slug}`. External activity URLs continue to be used when present.

### About and contact sections

`AboutSection.svelte` and `ContactSection.svelte` accept the site content as props. Their previous values remain as fallbacks. The about biography supports sanitized rich-text paragraphs, and contact links/text/email are CMS-driven.

## Dynamic content routes

The old client-only pages were removed:

- `/post?slug={slug}`
- `/project?slug={slug}`

They were replaced with server-loaded routes:

| Route | Purpose | Missing content |
| --- | --- | --- |
| `/posts/[slug]` | Displays a Storyblok post. | Returns an HTTP 404 with `Post not found`. |
| `/projects/[slug]` | Displays a Storyblok project. | Returns an HTTP 404 with `Project not found`. |

Both route types use the same cache policy as the homepage. Their page metadata includes:

- A title using `seo_title`, falling back to the story title.
- A description using `seo_description`, falling back to the excerpt.
- A canonical URL built from the current pathname on `https://darosa.dev`.
- Open Graph title, description, URL, and optional image.
- `og:type` set to `article` for posts and `website` for projects.
- A Twitter `summary_large_image` card when an image exists, otherwise `summary`.

`src/routes/+layout.svelte` now recognizes both dynamic route prefixes when deciding whether to show detail-page UI such as scroll progress.

## Rich-text rendering and sanitization

Storyblok rich text is rendered with `renderRichText` from `@storyblok/js`, then sanitized with `sanitize-html` before being passed to Svelte's `{@html ...}` block.

Sanitization applies to both entry bodies and the home biography:

- The default allowed tags are retained and `img` is added.
- Links allow `href`, `target`, and `rel`.
- Images allow `src`, `alt`, `title`, `width`, and `height`.
- URL attributes are limited to `http`, `https`, and `mailto` schemes.

`ContentView.svelte` now renders `bodyHtml`, falls back to the excerpt when no body exists, and no longer needs the old client-loading state. Styling was added for rich-text headings, paragraphs, lists, links, and code blocks. `ContentEntry` adds `bodyHtml`, `seoTitle`, and `seoDescription`; `SiteContent` defines the CMS-backed home fields.

## Runtime and dependency changes

- Replaced `@sveltejs/adapter-static` with `@sveltejs/adapter-node`.
- Removed global prerendering and static prerender entries/configuration.
- Removed the custom static-file `server.js`.
- Changed `npm start` from `node server.js` to `node build`.
- Replaced `storyblok-js-client` with `@storyblok/js` for rich-text rendering.
- Added `sanitize-html` and `@types/sanitize-html`.
- Updated `package-lock.json` for the new dependency tree and package metadata.
- Replaced the public `VITE_STORYBLOK_TOKEN` example with private `STORYBLOK_DELIVERY_API_TOKEN`.

The application now requires a Node runtime and a configured Storyblok token for server-rendered CMS requests. It is no longer a fully static/prerendered deployment.

## Changed-file inventory

| File(s) | Change |
| --- | --- |
| `.env.example` | Renamed the Storyblok token variable and made it server-only. |
| `package.json`, `package-lock.json` | Updated runtime adapter, Storyblok/sanitization dependencies, start command, and lock data. |
| `server.js` | Removed the custom static server. |
| `svelte.config.js` | Switched to the Node adapter and removed static prerender settings. |
| `src/lib/server/storyblok.ts` | Added typed server requests, normalization, rich-text rendering, and sanitization. |
| `src/lib/storyblok.ts` | Removed browser API access and mock content. |
| `src/lib/types.ts` | Added `ContentEntry` and `SiteContent`. |
| `src/routes/+page.server.ts` | Added home/activity server loading and cache headers. |
| `src/routes/+page.svelte` | Connected CMS data to homepage sections and conditional hero rendering. |
| `src/routes/+layout.ts` | Removed global prerendering. |
| `src/routes/+layout.svelte` | Updated detail-route detection. |
| `src/lib/components/TerminalHero.svelte` | Added configurable hero content and typing speed. |
| `src/lib/components/ActivityFeed.svelte` | Added server-provided CMS activity, external activity merging, and new links. |
| `src/lib/components/AboutSection.svelte` | Added CMS fields, rich-text biography, and fallbacks. |
| `src/lib/components/ContactSection.svelte` | Added CMS contact text, links, and email with fallbacks. |
| `src/lib/components/ContentView.svelte` | Added sanitized rich-text output/styles and removed the loading branch. |
| `src/routes/post/+page.svelte`, `src/routes/project/+page.svelte` | Removed query-string, mock-backed detail pages. |
| `src/routes/posts/[slug]/*` | Added server-loaded post pages with errors, caching, and metadata. |
| `src/routes/projects/[slug]/*` | Added server-loaded project pages with errors, caching, and metadata. |

## Configuration and verification

1. Set `STORYBLOK_DELIVERY_API_TOKEN` in the server environment; use `.env.example` as the variable reference.
2. Create or verify the `home`, `posts/`, and `projects/` content in Storyblok using the fields above.
3. Install dependencies with `npm install`.
4. Run `npm run check` and `npm run build`.
5. Start the production Node server with `npm start` after building.

Validation completed for this branch:

- `npm run check` — passed with 0 errors and 0 warnings.
- `npm run build` — passed and generated the Node adapter build.
