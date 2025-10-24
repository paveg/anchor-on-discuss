# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension (Manifest V3) that enhances GitHub Discussions by adding:
- Anchor links to headings (h1-h6) with hover-to-reveal icons
- Fixed sidebar TOC (Table of Contents) with scroll spy and click-to-navigate

Built with TypeScript + Vite. Uses pnpm as package manager.

## Development Commands

```bash
# Install dependencies
pnpm install

# Generate placeholder icons (required before first build)
pnpm run generate-icons

# Development mode (watch + auto-rebuild)
pnpm run dev

# Production build
pnpm run build

# Type check only (no emit)
pnpm run type-check
```

After building, load `dist/` as an unpacked extension in Chrome (`chrome://extensions/` → Developer mode → Load unpacked).

In dev mode, changes require:
1. Auto-rebuild happens via watch
2. Manual click "Reload" on `chrome://extensions/` for the extension
3. Hard refresh (Cmd/Ctrl + Shift + R) on GitHub Discussion pages

## Architecture

### Entry Point & Initialization (src/content/index.ts)

The content script runs on GitHub Discussion pages (`https://github.com/*/discussions/*`). Key initialization flow:

1. **Delayed initialization (500ms)**: GitHub uses SPA (Turbo/PJAX), so content may not be immediately ready. The delay ensures DOM is stable.
2. **processAndUpdateTOC()**: Orchestrates both anchor and TOC creation
3. **MutationObserver**: Watches for dynamically added headings (debounced 300ms)
4. **SPA listeners**: `popstate` and `turbo:load` re-trigger processing on navigation

### Two-Manager Pattern

**anchorManager.ts** - Stateless functions:
- `processHeadings()`: Finds headings, generates IDs, injects anchor links, returns `HeadingWithAnchor[]`
- `handleInitialHash()`: Scrolls to hash target on page load
- Heading selector is intentionally broad: `.markdown-body, .comment-body, [class*="Discussion"], article, main`

**tocManager.ts** - Singleton class (`TOCManager`):
- `init(headings)`: Creates fixed sidebar, sets up IntersectionObserver for scroll spy
- `update(headings)`: Destroys old TOC and recreates (simple but effective)
- IntersectionObserver tracks which heading is visible with `rootMargin: '-80px 0px -80% 0px'`
- Sidebar at `position: fixed; right: 24px;` with responsive hiding at `<1280px`

### Data Flow

```
index.ts: processAndUpdateTOC()
  ↓
anchorManager.ts: processHeadings()
  → Finds headings via broad selectors
  → Adds IDs (slug from text, ensures uniqueness)
  → Injects anchor links (right side of text)
  → Returns HeadingWithAnchor[]
  ↓
tocManager.ts: update(headings)
  → Creates TOC sidebar DOM
  → Sets up IntersectionObserver for active highlighting
```

## Key Implementation Details

### Heading Detection Timing

GitHub Discussions render content asynchronously. The 500ms delay in `init()` is critical:
- Too early: headings not in DOM yet
- Too late: user sees content pop in

MutationObserver provides safety net for late-arriving content.

### Anchor Link Positioning

Anchors appear on the **right side** of heading text (changed from left):
- Uses `margin-left: 0.5em` with `display: inline-block`
- Previous approach used `position: absolute; left: -1.5em` (now deprecated)

### TOC Visibility

TOC uses IntersectionObserver with specific `rootMargin` to account for:
- GitHub's sticky header (80px)
- Bottom padding to trigger earlier (80% from bottom)

Active item tracking updates on scroll, auto-scrolls TOC to keep active item visible.

### Build Process (vite.config.ts)

Vite bundles TypeScript to `dist/content/content.js`. Custom plugin:
1. Copies `src/manifest.json` to `dist/manifest.json`
2. Copies `public/icons/*` to `dist/icons/`
3. CSS bundled as `content/content.css` (not `styles.css` - manifest references `content.css`)

Note: `tsconfig.json` has `noEmit: true` because Vite handles compilation. TypeScript only for type checking.

## Debugging

Console logs use prefixes:
- `[Anchor on Discuss]` - Main initialization
- `[Main]` - processAndUpdateTOC orchestration
- `[Anchor]` - Heading detection/processing
- `[TOC]` - TOC creation/updates

Check console for heading count to diagnose TOC not appearing:
```
[Anchor] Found X headings to process
[TOC] Initializing with X headings
```

If X = 0, heading selectors may need adjustment for GitHub's DOM structure changes.

## Manifest V3 Specifics

- **Permissions**: `activeTab`, `scripting` (clipboard access uses Clipboard API, no permission needed)
- **Host permissions**: `https://github.com/*/discussions/*` only
- **Content scripts**: Single JS + CSS injected at `document_end`
- Icons: SVG placeholders in `public/icons/` (generated via `generate-icons.js`)

## Customization Points

**Heading levels** (`src/content/anchorManager.ts`):
```typescript
const DEFAULT_CONFIG: AnchorConfig = {
  headingLevels: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], // Modify here
  iconContent: '#',
  showToast: true,
};
```

**TOC breakpoint** (`src/content/styles.css`):
```css
@media (max-width: 1280px) {
  .github-discuss-toc { display: none; }
}
```

**Scroll spy sensitivity** (`src/content/tocManager.ts`):
```typescript
const options = {
  rootMargin: '-80px 0px -80% 0px', // Adjust thresholds
  threshold: 0,
};
```
