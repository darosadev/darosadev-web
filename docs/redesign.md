# Terminal-inspired website redesign

## Scope

This document covers the work introduced on `feat/redesign` for the PR into `develop`: the initial SvelteKit application, the terminal-inspired homepage and content pages, the interactive background and animation work, the external content integrations, the static production server, and the supporting configuration changes.

## Git history reconciliation

`feat/redesign` and `develop` originally had unrelated Git histories and no common ancestor. Merge commit `4adc607` (`chore: connect redesign with develop history`) records `develop` as a parent using the `ours` strategy and `--allow-unrelated-histories`. This makes the PR possible without rewriting the redesign commits. The merge did not change any files from the redesign tree (`2fcc811`); consequently, the PR proposes replacing the current `develop` tree with the redesigned application described below.

## Implementation details

### Application shell and visual system

- Replaced the original single static `index.html` page with a SvelteKit and TypeScript application using Svelte 5 runes.
- Added Tailwind CSS 4 through its Vite plugin and defined the complete Catppuccin Mocha color palette as theme tokens in `src/routes/layout.css`.
- Applied JetBrains Mono globally, with Google Fonts preconnect/stylesheet links, antialiased text, custom selection colors, and styled WebKit scrollbars.
- Added global smooth scrolling while temporarily disabling it during route transitions so router-driven scroll restoration remains immediate.
- Added global title, description, Open Graph, Twitter card, and theme-color metadata.
- Added a shared responsive footer with a dynamic year and a translucent fixed header.

### Header and navigation

- Added desktop anchor navigation for Projects, Blog, About, and Contact; Projects and Blog both target the activity feed.
- Added a responsive mobile hamburger button with animated open/close states.
- Added a full-screen mobile menu with staggered link transitions, an explicit close button, link-click dismissal, and Escape-key dismissal.
- Added appropriate labels and `aria-expanded` state to the mobile navigation controls.

### Homepage sections

| Component | Behavior |
| --- | --- |
| `TerminalHero` | Renders a terminal-style `welcome.md` window and progressively types the shell prompt and introduction, with syntax-inspired colors and a blinking cursor. The typing delay becomes zero when reduced motion is requested. |
| `ActivityFeed` | Loads all activity sources on mount, combines and date-sorts them, shows a loading state, and renders responsive cards with type badges, icons, excerpts, dates, metadata, and tags. |
| `AboutSection` | Renders a `whoami` terminal panel containing profile details, stack/editor/OS information, and biography text. |
| `ContactSection` | Renders an `ssh contact` panel with collaboration text, GitHub, X, LinkedIn, and email links, plus a terminal-style email line. External links use `noopener noreferrer`. |
| `Footer` | Provides the shared homepage/detail-page footer and current-year copyright. |

The activity, about, and contact sections dynamically import GSAP and ScrollTrigger in the browser and use staggered or single-element scroll-reveal animations.

### Animated grid background

`GridBackground.svelte` adds a fixed, device-pixel-ratio-aware canvas behind the site. Its final implementation:

- Draws a 40-pixel grid of faint lines and vertices.
- Eases scroll position and offsets the grid vertically for a parallax effect.
- Uses three independent spotlights with a 180-pixel influence radius to increase vertex size and opacity.
- Relocates a random spotlight every five seconds and eases it to its new position over four seconds using smoothstep interpolation.
- Caps overlapping spotlight intensity to avoid excessive brightness.
- Disables automatic spotlight relocation when reduced motion is requested.
- Handles window resizing and cleans up animation frames and event listeners on component destruction.

Commit `a5e53cf` first added pointer/mouse-hover illumination; commit `6a4a25e` subsequently replaced that interaction with the autonomous spotlight system described above.

### Activity data and content fallbacks

The shared `Activity` model supports Blog, Project, Goodreads, and Micro entries, including slug, title, date, excerpt, optional body content, image, URL, tags, and metadata.

#### Storyblok

`src/lib/storyblok.ts` uses `VITE_STORYBLOK_TOKEN` and browser `fetch` to request published stories below `activities/`, sorted by first publication date. It maps Storyblok stories into activities and provides a `slugify` helper for title-based fallback slugs.

- Missing credentials return the bundled mock activities.
- Request errors are logged and also return the bundled mock activities.
- Eight mock entries provide two blogs, two projects, two Goodreads items, and two Micro items, including full body content for the blog/project entries.
- `getPostBySlug` and `getProjectBySlug` deliberately look up detail content in the mock collection; these detail lookups are not live Storyblok queries in this branch.

#### Goodreads and Micro placeholders

`src/lib/goodreads.ts` checks `VITE_GOODREADS_USER_ID` and `VITE_GOODREADS_API_KEY`, then provides the Goodreads read-shelf RSS request structure. XML parsing and activity mapping remain placeholders, and the function currently returns an empty array after a successful request as well as when configuration is absent or a request fails.

`src/lib/micro.ts` checks `VITE_MICRO_API_URL` and `VITE_MICRO_HANDLE`, fetches the configured JSON URL, and leaves response-to-activity mapping as a placeholder. It likewise currently returns an empty array after a successful request or when configuration is absent or a request fails.

All three sources are requested concurrently by the activity feed. Blog/project cards link internally; external cards open in a new tab with `noopener noreferrer`, and entries without a usable URL render as non-link articles.

### Post and project detail pages

The branch adds two prerenderable query-string routes:

| Route | Content type | Filename extension |
| --- | --- | --- |
| `/post?slug={slug}` | Blog post | `.md` |
| `/project?slug={slug}` | Project | `.project` |

Both pages react to the URL's `slug` parameter, set page title/description metadata when an entry is found, and use the shared `ContentView` component. `ContentView` provides:

- Home/back navigation and distinct loading and in-app not-found states.
- A terminal window with traffic-light chrome, slug-based filename, optional cover image, type badge, date, metadata, and tags.
- Responsive title/body typography.
- Lightweight body formatting for blank-line-separated paragraphs, `##` headings, and paragraphs wrapped in backticks as code blocks.
- An excerpt fallback when full content is unavailable and the shared footer.

The layout shows `ScrollProgressButton` only on these detail routes. The button appears after 200 pixels of scrolling, displays an SVG circular percentage indicator, and smoothly returns to the top when activated.

### Static build and production serving

- Enabled prerendering globally and configured `@sveltejs/adapter-static` with `strict: true` and `precompress: false`.
- Declared `/`, `/post`, and `/project` as prerender entries, using `https://darosa.dev` as the origin and ignoring missing anchor IDs.
- Replaced the initial CommonJS single-file server with an ES-module static server rooted at `build/`.
- Added MIME handling for HTML, JavaScript, CSS, JSON, common image/font formats, and source maps.
- Added one-year immutable caching for generated assets below `/immutable/`.
- Added `.html` lookup for extensionless routes, an `index.html` fallback path, 404 responses for unresolved files, and a directory-traversal guard.
- Kept the server listening on `0.0.0.0:3000` and exposed `npm start` as `node server.js`.

### Docker and Fly.io

The branch adds/retains a multi-stage Docker build based on Node `20.11.1-slim`:

- The build stage installs native build tooling, runs `npm install --legacy-peer-deps`, copies the source, and runs the production build.
- The runtime stage installs curl and copies the static build, package metadata, dependencies, and `server.js`.
- The container exposes port 3000 and starts `node server.js`.
- `.dockerignore` excludes Git metadata, dependencies, local environment files, and deployment-specific files from the build context.

`fly.toml` defines the `darosadev-web` app in Madrid (`mad`), HTTPS enforcement, port 3000, automatic machine start/stop with zero minimum machines, and one shared 1 GB VM. `.npmrc` enables `engine-strict`.

### Environment variables

`.env.example` documents the browser-side integration variables introduced by this branch:

| Variable | Purpose |
| --- | --- |
| `VITE_STORYBLOK_TOKEN` | Published Storyblok activity requests. |
| `VITE_GOODREADS_USER_ID`, `VITE_GOODREADS_API_KEY` | Goodreads read-shelf request placeholder. |
| `VITE_MICRO_API_URL`, `VITE_MICRO_HANDLE` | Micro-feed request placeholder. |

Because these use the `VITE_` prefix, they are intended for client-side access in this implementation.

## Commit-by-commit breakdown

| Commit | Changes |
| --- | --- |
| `3c9efef` — `first commit` | Added the initial repository README. |
| `a8f1fc7` — `feat: adds package.json` | Added initial package metadata, repository/homepage information, and npm scripts. |
| `b8a91e6` — `feat: adds content` | Added the original standalone `index.html` website content. |
| `050025a` — `feat: adds server.js` | Added the first Node HTTP server for the standalone page and the `npm start` command. |
| `3351571` — `fix: changes host` | Bound the server to `0.0.0.0` and added Docker, Docker ignore, and Fly.io deployment configuration. |
| `0478345` — `feat: adds new design to website` | Migrated the standalone page to SvelteKit; added the terminal/Catppuccin design, homepage sections, canvas background, content integrations/types, static adapter, SEO/font setup, environment template, and expanded static server. |
| `f03b73b` — `feat: visual tweaks and adds responsiveness` | Refined section spacing/typography and added the responsive animated mobile navigation and other small-screen adjustments. |
| `a5e53cf` — `feat: adds a background hover effect` | Added mouse-following illumination to the canvas grid. |
| `d8d32e0` — `feat: adds post and project pages` | Added query-string post/project readers, full mock content, internal activity links, richer cards, shared content rendering, scroll progress, route-aware layout behavior, and static-server route handling. |
| `6a4a25e` — `feat: tweaks background animation` | Replaced pointer-driven illumination with eased autonomous spotlights and refined grid/scroll animation and reduced-motion behavior. |
| `2fcc811` — `chore: adds files and folders to gitignore` | Ignored local agent, skill, and VS Code tooling files/directories. |
| `4adc607` — `chore: connect redesign with develop history` | Connected the unrelated branch histories without changing the redesign tree, enabling this PR. |

## Impact relative to `develop`

Because the branches began with unrelated histories, some files that only existed in the `develop` scaffold appear as deletions in this PR. In addition to adding the redesigned site, merging this PR will:

- Replace the previous Node-adapter setup with a static SvelteKit build and the included `server.js` static server.
- Remove the scaffold's Prettier and ESLint configuration (`.prettierignore`, `.prettierrc`, and `eslint.config.js`) and their associated dependencies and scripts.
- Remove the scaffold's Vitest setup, sample tests, Testing Library dependencies, and test scripts (`vitest-setup-client.ts`, `src/demo.spec.ts`, and `src/routes/page.svelte.test.ts`).
- Remove the old root `index.html`, `src/app.css`, and `static/favicon.png` scaffold files.
- Upgrade the SvelteKit, Svelte, Vite, Tailwind CSS, and TypeScript dependency versions and move the package version from `0.0.1` to `1.0.0`.
- Add the runtime dependencies `gsap`, `lucide-svelte`, and `storyblok-js-client`.
- Add `.env.example`, `static/robots.txt`, and ignore rules for `.agents`, `.skills`, `skills-lock.json`, and `.vscode`.

## Changed-file inventory relative to `develop`

| File(s) | Change |
| --- | --- |
| `.env.example` | Added Storyblok, Goodreads, and Micro environment variable examples. |
| `.gitignore` | Added local agent, skill, and VS Code tooling paths. |
| `.prettierignore`, `.prettierrc`, `eslint.config.js` | Removed the previous formatter/linter configuration. |
| `Dockerfile` | Builds the static site and packages it with the custom Node static server and curl. |
| `README.md` | Updated the scaffold recreation command and shell formatting. |
| `index.html`, `src/app.css` | Removed superseded scaffold files. |
| `package.json`, `package-lock.json` | Updated application scripts, package metadata, framework versions, and runtime/development dependencies. |
| `server.js` | Added the static-file server with MIME types, immutable asset caching, extension/SPA fallbacks, and traversal protection. |
| `src/app.html` | Added site description, theme color, and JetBrains Mono font loading; removed the old PNG favicon reference. |
| `src/demo.spec.ts`, `src/routes/page.svelte.test.ts`, `vitest-setup-client.ts` | Removed the scaffold tests and browser test setup. |
| `src/lib/assets/favicon.svg` | Added the Svelte favicon asset. |
| `src/lib/components/TerminalHero.svelte` | Added the animated terminal welcome section. |
| `src/lib/components/ActivityFeed.svelte` | Added the merged, sorted activity feed and content links. |
| `src/lib/components/AboutSection.svelte` | Added the animated personal/profile terminal panel. |
| `src/lib/components/ContactSection.svelte` | Added contact text and social/email links. |
| `src/lib/components/ContentView.svelte` | Added the shared post/project reader, metadata, content states, and footer. |
| `src/lib/components/Header.svelte` | Added desktop navigation and the animated, keyboard-dismissible full-screen mobile menu. |
| `src/lib/components/Footer.svelte` | Added the shared footer. |
| `src/lib/components/GridBackground.svelte` | Added the canvas grid, scroll parallax, and autonomous spotlight animation. |
| `src/lib/components/ScrollProgressButton.svelte` | Added detail-page scroll progress and back-to-top behavior. |
| `src/lib/storyblok.ts` | Added Storyblok activity loading, slug helpers, detail lookup, and mock fallback content. |
| `src/lib/goodreads.ts`, `src/lib/micro.ts` | Added configurable browser-side request placeholders and empty-array fallbacks. |
| `src/lib/types.ts` | Added activity and Storyblok content types. |
| `src/routes/+layout.svelte` | Added the global background, header, navigation/scroll behavior, and detail-page progress UI. |
| `src/routes/+layout.ts` | Enabled prerendering. |
| `src/routes/+page.svelte` | Composed the homepage sections. |
| `src/routes/layout.css` | Added Tailwind, the Catppuccin theme, global typography, selection, scrollbar, and motion styles. |
| `src/routes/post/+page.svelte` | Added query-string post detail rendering and metadata. |
| `src/routes/project/+page.svelte` | Added query-string project detail rendering and metadata. |
| `static/favicon.png` | Removed the old favicon. |
| `static/robots.txt` | Allowed all crawlers to access the site. |
| `svelte.config.js` | Configured runes, the static adapter, and prerendered routes/origin. |
| `tsconfig.json` | Enabled relative import extension rewriting and updated generated-config guidance. |
| `vite.config.ts` | Simplified to Tailwind CSS and SvelteKit plugins; removed the Vitest workspace. |
| `docs/redesign.md` | Added this branch and PR documentation. |

## Validation

Validation completed on the redesign tree:

- `npm ci` — completed successfully. npm reported 13 dependency vulnerabilities: 1 low, 2 moderate, and 10 high.
- `npm run check` — passed with 0 errors and 0 warnings.
- `npm run build` — passed and generated the static adapter build.
- Production-server smoke test — `node server.js` started successfully and `/`, `/post`, `/project`, and `/robots.txt` each returned HTTP 200.
- `git diff --check origin/develop..HEAD` — passed.
- `git diff 2fcc811..4adc607` — empty, confirming that connecting the histories did not alter the redesign files.
