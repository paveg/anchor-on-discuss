import {
  processHeadings,
  handleInitialHash,
  setupHashChangeListener,
} from './anchorManager';
import { tocManager } from './tocManager';
import './styles.css';

/**
 * Debounce helper for performance
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Process headings and update TOC
 */
function processAndUpdateTOC(): void {
  console.log('[Main] Processing headings and updating TOC...');
  const headings = processHeadings();
  console.log('[Main] Updating TOC with', headings.length, 'headings');
  tocManager.update(headings);
}

/**
 * Observes DOM changes to detect new headings
 */
function setupMutationObserver(): MutationObserver {
  const debouncedProcess = debounce(() => {
    processAndUpdateTOC();
  }, 300);

  const observer = new MutationObserver((mutations) => {
    // Check if any mutations added heading elements
    const hasNewHeadings = mutations.some((mutation) => {
      if (mutation.type === 'childList') {
        return Array.from(mutation.addedNodes).some((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Check if it's a heading or contains headings
            return (
              /^H[1-6]$/.test(element.tagName) ||
              element.querySelector('h1, h2, h3, h4, h5, h6')
            );
          }
          return false;
        });
      }
      return false;
    });

    if (hasNewHeadings) {
      debouncedProcess();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
}

/**
 * Initializes the extension
 */
function init(): void {
  console.log('[Anchor on Discuss] Initializing...');

  // Delay initial processing to ensure content is loaded
  setTimeout(() => {
    console.log('[Anchor on Discuss] Running delayed initialization...');
    // Process existing headings and create TOC
    processAndUpdateTOC();

    // Handle initial URL hash
    handleInitialHash();
  }, 500);

  // Setup hash change listener
  setupHashChangeListener();

  // Setup mutation observer for dynamic content
  setupMutationObserver();

  console.log('[Anchor on Discuss] Initialized successfully');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM is already ready
  init();
}

// Handle SPA navigation (GitHub uses Turbo/PJAX)
// Re-process headings when navigating within GitHub
window.addEventListener('popstate', () => {
  setTimeout(() => {
    processAndUpdateTOC();
    handleInitialHash();
  }, 100);
});

// Additional listener for Turbo Drive (if present)
document.addEventListener('turbo:load', () => {
  processAndUpdateTOC();
  handleInitialHash();
});
