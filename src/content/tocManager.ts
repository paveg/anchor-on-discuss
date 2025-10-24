import type { HeadingWithAnchor } from '../types/index.d.ts';

/**
 * Table of Contents Manager
 * Creates and manages a fixed sidebar TOC for GitHub Discussions
 */

interface TOCItem {
  id: string;
  text: string;
  level: number;
  element: HTMLHeadingElement;
}

export class TOCManager {
  private container: HTMLElement | null = null;
  private tocList: HTMLElement | null = null;
  private items: TOCItem[] = [];
  private activeItem: HTMLElement | null = null;
  private observer: IntersectionObserver | null = null;

  /**
   * Initialize TOC
   */
  init(headings: HeadingWithAnchor[]): void {
    console.log('[TOC] Initializing with', headings.length, 'headings');

    if (headings.length === 0) {
      console.log('[TOC] No headings found, skipping TOC creation');
      return;
    }

    this.items = headings.map((heading) => ({
      id: heading.id,
      text: heading.element.textContent?.trim() || '',
      level: parseInt(heading.level.charAt(1)),
      element: heading.element,
    }));

    console.log('[TOC] Creating TOC with', this.items.length, 'items');
    this.createTOC();
    this.setupIntersectionObserver();
  }

  /**
   * Create TOC container and items
   */
  private createTOC(): void {
    // Remove existing TOC if any
    this.destroy();

    // Create container
    this.container = document.createElement('aside');
    this.container.className = 'github-discuss-toc';
    this.container.setAttribute('aria-label', 'Table of Contents');

    // Create header
    const header = document.createElement('div');
    header.className = 'toc-header';
    header.innerHTML = `
      <h2 class="toc-title">Table of Contents</h2>
    `;

    // Create list container
    this.tocList = document.createElement('nav');
    this.tocList.className = 'toc-list';

    // Create TOC items
    const minLevel = Math.min(...this.items.map((item) => item.level));

    this.items.forEach((item) => {
      const tocItem = this.createTOCItem(item, minLevel);
      this.tocList!.appendChild(tocItem);
    });

    this.container.appendChild(header);
    this.container.appendChild(this.tocList);
    document.body.appendChild(this.container);

    console.log('[TOC] TOC container added to body');

    // Adjust main content width to make room for TOC
    this.adjustContentWidth();
  }

  /**
   * Create individual TOC item
   */
  private createTOCItem(item: TOCItem, minLevel: number): HTMLElement {
    const tocItem = document.createElement('a');
    tocItem.className = 'toc-item';
    tocItem.href = `#${item.id}`;
    tocItem.textContent = item.text;
    tocItem.setAttribute('data-id', item.id);
    tocItem.setAttribute('data-level', item.level.toString());

    // Calculate indent level (normalize to start from 0)
    const indentLevel = item.level - minLevel;
    tocItem.style.paddingLeft = `${8 + indentLevel * 16}px`;

    // Click handler
    tocItem.addEventListener('click', (e) => {
      e.preventDefault();
      this.scrollToHeading(item.id);
    });

    return tocItem;
  }

  /**
   * Scroll to heading
   */
  private scrollToHeading(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Update URL
      window.history.pushState(null, '', `#${id}`);

      // Update active state
      this.setActiveItem(id);
    }
  }

  /**
   * Setup intersection observer for scroll spy
   */
  private setupIntersectionObserver(): void {
    const options = {
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id) {
            this.setActiveItem(id);
          }
        }
      });
    }, options);

    // Observe all headings
    this.items.forEach((item) => {
      this.observer!.observe(item.element);
    });
  }

  /**
   * Set active item in TOC
   */
  private setActiveItem(id: string): void {
    // Remove previous active state
    if (this.activeItem) {
      this.activeItem.classList.remove('active');
    }

    // Set new active state
    const newActiveItem = this.tocList?.querySelector(
      `[data-id="${id}"]`
    ) as HTMLElement;

    if (newActiveItem) {
      newActiveItem.classList.add('active');
      this.activeItem = newActiveItem;

      // Scroll TOC to show active item
      newActiveItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }

  /**
   * Adjust main content width to accommodate TOC
   */
  private adjustContentWidth(): void {
    const mainContent = document.querySelector(
      '.Layout-main, .Layout-sidebar'
    ) as HTMLElement;

    if (mainContent) {
      mainContent.style.marginRight = '280px';
    }
  }

  /**
   * Update TOC when headings change
   */
  update(headings: HeadingWithAnchor[]): void {
    this.init(headings);
  }

  /**
   * Destroy TOC
   */
  destroy(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Reset content width
    const mainContent = document.querySelector(
      '.Layout-main, .Layout-sidebar'
    ) as HTMLElement;

    if (mainContent) {
      mainContent.style.marginRight = '';
    }

    this.items = [];
    this.activeItem = null;
  }

  /**
   * Check if TOC is visible
   */
  isVisible(): boolean {
    return this.container !== null && document.body.contains(this.container);
  }
}

// Export singleton instance
export const tocManager = new TOCManager();
