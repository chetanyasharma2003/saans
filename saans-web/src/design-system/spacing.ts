/**
 * SAANS Spacing System
 * Consistent spacing scale based on 4px base unit
 */

export const spacing = {
  // Base units (4px scale)
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
};

/**
 * Semantic spacing tokens
 * Use these for consistent layouts
 */
export const semanticSpacing = {
  // Padding (internal space within components)
  padding: {
    xs: spacing[2], // 8px
    sm: spacing[3], // 12px
    md: spacing[4], // 16px
    lg: spacing[6], // 24px
    xl: spacing[8], // 32px
    '2xl': spacing[10], // 40px
  },

  // Margin (external space between components)
  margin: {
    xs: spacing[2], // 8px
    sm: spacing[3], // 12px
    md: spacing[4], // 16px
    lg: spacing[6], // 24px
    xl: spacing[8], // 32px
    '2xl': spacing[10], // 40px
    '3xl': spacing[12], // 48px
  },

  // Gap (space between items in grids/flex)
  gap: {
    xs: spacing[2], // 8px
    sm: spacing[3], // 12px
    md: spacing[4], // 16px
    lg: spacing[6], // 24px
    xl: spacing[8], // 32px
    '2xl': spacing[10], // 40px
  },

  // Radius (border-radius)
  radius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
};

/**
 * Component-specific spacing
 * Common patterns for buttons, cards, inputs, etc
 */
export const componentSpacing = {
  // Button
  button: {
    sm: {
      padding: `${spacing[2]} ${spacing[3]}`, // 8px 12px
      height: '32px',
    },
    md: {
      padding: `${spacing[3]} ${spacing[4]}`, // 12px 16px
      height: '40px',
    },
    lg: {
      padding: `${spacing[4]} ${spacing[6]}`, // 16px 24px
      height: '48px',
    },
  },

  // Input field
  input: {
    padding: `${spacing[3]} ${spacing[4]}`, // 12px 16px
    height: '40px',
    borderRadius: semanticSpacing.radius.md,
  },

  // Card
  card: {
    padding: {
      sm: spacing[4], // 16px
      md: spacing[6], // 24px
      lg: spacing[8], // 32px
    },
    borderRadius: semanticSpacing.radius.lg,
    gap: spacing[4], // 16px between items
  },

  // Modal
  modal: {
    padding: spacing[6], // 24px
    borderRadius: semanticSpacing.radius.xl,
    gap: spacing[4], // 16px between sections
  },

  // Sidebar
  sidebar: {
    padding: spacing[4], // 16px
    gap: spacing[3], // 12px between items
  },

  // Page/Section
  page: {
    maxWidth: '1200px',
    padding: {
      desktop: spacing[8], // 32px
      tablet: spacing[6], // 24px
      mobile: spacing[4], // 16px
    },
  },
};

/**
 * Layout patterns
 * Common spacing combinations
 */
export const layoutPatterns = {
  // Grid gaps
  grid: {
    compact: spacing[2], // 8px
    normal: spacing[4], // 16px
    loose: spacing[6], // 24px
  },

  // Section spacing
  section: {
    compact: spacing[6], // 24px
    normal: spacing[8], // 32px
    loose: spacing[12], // 48px
  },

  // List spacing
  list: {
    compact: spacing[2], // 8px
    normal: spacing[4], // 16px
    loose: spacing[6], // 24px
  },

  // Text spacing
  text: {
    tight: '1',
    normal: '1.5',
    loose: '1.75',
  },
};

/**
 * Responsive spacing
 * Mobile-first breakpoints
 */
export const responsiveSpacing = {
  page: {
    mobile: spacing[4], // 16px
    tablet: spacing[6], // 24px
    desktop: spacing[8], // 32px
  },

  section: {
    mobile: spacing[4], // 16px
    tablet: spacing[6], // 24px
    desktop: spacing[8], // 32px
  },

  component: {
    mobile: spacing[3], // 12px
    tablet: spacing[4], // 16px
    desktop: spacing[6], // 24px
  },
};
