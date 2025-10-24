import type { AnchorConfig, HeadingLevel, HeadingWithAnchor } from '../types/index.d.ts';

/**
 * Default configuration for anchor links
 */
const DEFAULT_CONFIG: AnchorConfig = {
  headingLevels: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  iconContent: '#',
  showToast: true,
};

/**
 * Generates a URL-safe ID from heading text
 */
function generateId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Ensures heading has a unique ID
 */
function ensureHeadingId(heading: HTMLHeadingElement): string {
  if (heading.id) {
    return heading.id;
  }

  const baseId = generateId(heading.textContent || 'heading');
  let id = baseId;
  let counter = 1;

  // Ensure uniqueness
  while (document.getElementById(id)) {
    id = `${baseId}-${counter}`;
    counter++;
  }

  heading.id = id;
  return id;
}

/**
 * Creates anchor link element
 */
function createAnchorLink(id: string, config: AnchorConfig): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.className = 'anchor-link';
  anchor.href = `#${id}`;
  anchor.setAttribute('aria-label', 'Anchor link');
  anchor.textContent = config.iconContent;

  // Prevent default anchor behavior (we'll handle it manually)
  anchor.addEventListener('click', async (e) => {
    e.preventDefault();
    await handleAnchorClick(id, config.showToast);
  });

  return anchor;
}

/**
 * Handles anchor link click: update URL and copy to clipboard
 */
async function handleAnchorClick(id: string, showToast: boolean): Promise<void> {
  const url = `${window.location.origin}${window.location.pathname}#${id}`;

  // Update URL without page reload
  window.history.pushState(null, '', `#${id}`);

  // Copy to clipboard
  try {
    await navigator.clipboard.writeText(url);
    if (showToast) {
      showCopyToast();
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }

  // Smooth scroll to element
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Shows a toast notification
 */
function showCopyToast(): void {
  const toast = document.createElement('div');
  toast.className = 'anchor-toast';
  toast.textContent = 'Link copied to clipboard!';
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove after animation
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/**
 * Adds anchor link to a heading element
 */
function addAnchorToHeading(
  heading: HTMLHeadingElement,
  config: AnchorConfig
): HeadingWithAnchor {
  // Skip if already has anchor
  if (heading.querySelector('.anchor-link')) {
    const id = ensureHeadingId(heading);
    return {
      element: heading,
      id,
      level: heading.tagName.toLowerCase() as HeadingLevel,
    };
  }

  const id = ensureHeadingId(heading);
  const anchor = createAnchorLink(id, config);

  // Wrap heading content in a container for better positioning
  const wrapper = document.createElement('span');
  wrapper.className = 'anchor-wrapper';

  // Move heading content to wrapper
  while (heading.firstChild) {
    wrapper.appendChild(heading.firstChild);
  }

  heading.appendChild(wrapper);
  heading.appendChild(anchor);

  return {
    element: heading,
    id,
    level: heading.tagName.toLowerCase() as HeadingLevel,
  };
}

/**
 * Finds all headings in the document
 */
function findHeadings(config: AnchorConfig): HTMLHeadingElement[] {
  const selector = config.headingLevels.join(', ');
  const headings = document.querySelectorAll<HTMLHeadingElement>(selector);

  // Filter to only include headings within GitHub Discussion content
  return Array.from(headings).filter((heading) => {
    // Target headings in discussion body and comments
    // Use broader selectors to catch all content areas
    return heading.closest('.markdown-body, .comment-body, [class*="Discussion"], article, main');
  });
}

/**
 * Processes all headings and adds anchor links
 */
export function processHeadings(
  customConfig?: Partial<AnchorConfig>
): HeadingWithAnchor[] {
  const config = { ...DEFAULT_CONFIG, ...customConfig };
  const headings = findHeadings(config);
  console.log('[Anchor] Found', headings.length, 'headings to process');
  const result = headings.map((heading) => addAnchorToHeading(heading, config));
  console.log('[Anchor] Processed', result.length, 'headings');
  return result;
}

/**
 * Handles URL hash on page load
 */
export function handleInitialHash(): void {
  if (window.location.hash) {
    const id = window.location.hash.slice(1);
    const element = document.getElementById(id);

    if (element) {
      // Delay scroll to ensure page is fully loaded
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }
}

/**
 * Sets up hash change listener
 */
export function setupHashChangeListener(): void {
  window.addEventListener('hashchange', () => {
    const id = window.location.hash.slice(1);
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}
