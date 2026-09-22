/**
 * SAANS Shadow System
 * Elevation system for depth and hierarchy
 */

export const shadows = {
  // No shadow
  none: 'none',

  // Elevation 0 - Subtle, minimal depth
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',

  // Elevation 1 - Cards, subtle components
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',

  // Elevation 2 - Default elevation
  base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',

  // Elevation 3 - Medium components
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',

  // Elevation 4 - Elevated cards, modals
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',

  // Elevation 5 - Popover, dropdown
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Elevation 6 - Modal, top-level
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Focus ring
  focus: '0 0 0 3px rgb(20 184 166 / 0.1)',
  focusPrimary: '0 0 0 3px rgba(20, 184, 166, 0.1)',

  // Inset shadow (for recessed elements)
  inset: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

/**
 * Semantic shadow tokens
 * Use for consistent component elevation
 */
export const semanticShadows = {
  // Component shadows
  component: {
    default: shadows.sm, // Card, button
    hover: shadows.md, // Interactive hover state
    active: shadows.base, // Pressed state
    disabled: shadows.none, // Disabled state
  },

  // Elevated content
  elevated: {
    default: shadows.lg, // Modal, overlay
    hover: shadows.xl, // Popover, dropdown
  },

  // Inset/Recessed
  inset: shadows.inset,

  // Focus indicator
  focus: shadows.focus,
};

/**
 * Transition timing for shadow changes
 */
export const shadowTransition = {
  duration: '200ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  css: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
};

/**
 * Hover shadow patterns
 * Common elevation patterns for interactions
 */
export const hoverShadows = {
  // Card hover
  card: {
    default: shadows.sm,
    hover: shadows.md,
    transition: shadowTransition.css,
  },

  // Button hover
  button: {
    default: shadows.xs,
    hover: shadows.sm,
    active: shadows.none,
    transition: shadowTransition.css,
  },

  // Interactive element
  interactive: {
    default: shadows.xs,
    hover: shadows.md,
    transition: shadowTransition.css,
  },
};

/**
 * Tailwind shadow classes
 */
export const shadowClasses = {
  none: 'shadow-none',
  xs: 'shadow-xs',
  sm: 'shadow-sm',
  base: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  focus: 'ring-2 ring-primary-500 ring-offset-2',
};
