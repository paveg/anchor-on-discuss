/**
 * Heading element types that will have anchor links
 */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/**
 * Configuration for anchor link behavior
 */
export interface AnchorConfig {
  /** Heading levels to target */
  headingLevels: HeadingLevel[];
  /** Icon to display on hover */
  iconContent: string;
  /** Whether to show toast notification on copy */
  showToast: boolean;
}

/**
 * Represents a heading element with anchor link
 */
export interface HeadingWithAnchor {
  element: HTMLHeadingElement;
  id: string;
  level: HeadingLevel;
}
