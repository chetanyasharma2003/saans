/**
 * SAANS Color System
 * Professional medical app color palette
 * Based on mental health & wellness theme
 */

export const colors = {
  // Primary: Teal - Trust, Healing, Calm
  primary: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6', // Primary
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // Success: Green - Progress, Recovery
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBEF63',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Success
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#145231',
  },

  // Warning: Amber - Attention, Caution
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Error: Red - Alert, Crisis
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Info: Blue - Information
  info: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9', // Info
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },

  // Neutral: Gray - Backgrounds, Text, Borders
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },

  // Extended: Purple - Spirituality, Wellness
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
  },

  // Extended: Pink - Empathy, Support
  pink: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F8B4D8',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },
};

/**
 * Semantic Color Aliases
 * Use these for consistent theming
 */
export const semanticColors = {
  // Backgrounds
  background: {
    primary: colors.neutral[0],
    secondary: colors.neutral[50],
    tertiary: colors.neutral[100],
    inverse: colors.neutral[950],
  },

  // Surfaces (Cards, Panels)
  surface: {
    default: colors.neutral[0],
    hover: colors.neutral[50],
    active: colors.neutral[100],
    disabled: colors.neutral[100],
  },

  // Text
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[500],
    disabled: colors.neutral[400],
    inverse: colors.neutral[0],
  },

  // Interactive
  interactive: {
    primary: colors.primary[500],
    hover: colors.primary[600],
    active: colors.primary[700],
    disabled: colors.neutral[300],
  },

  // State colors
  state: {
    success: colors.success[500],
    error: colors.error[500],
    warning: colors.warning[500],
    info: colors.info[500],
  },

  // Borders
  border: {
    light: colors.neutral[200],
    default: colors.neutral[300],
    dark: colors.neutral[400],
  },

  // Overlay
  overlay: {
    dark: 'rgba(0, 0, 0, 0.5)',
    light: 'rgba(255, 255, 255, 0.8)',
  },
};

/**
 * Dark Mode Colors
 * Override for dark theme
 */
export const darkColors = {
  background: {
    primary: colors.neutral[950],
    secondary: colors.neutral[900],
    tertiary: colors.neutral[800],
    inverse: colors.neutral[0],
  },

  surface: {
    default: colors.neutral[900],
    hover: colors.neutral[800],
    active: colors.neutral[700],
    disabled: colors.neutral[800],
  },

  text: {
    primary: colors.neutral[0],
    secondary: colors.neutral[300],
    tertiary: colors.neutral[400],
    disabled: colors.neutral[600],
    inverse: colors.neutral[900],
  },

  interactive: {
    primary: colors.primary[400],
    hover: colors.primary[300],
    active: colors.primary[200],
    disabled: colors.neutral[700],
  },

  border: {
    light: colors.neutral[700],
    default: colors.neutral[600],
    dark: colors.neutral[500],
  },
};

/**
 * Export single function to get color by path
 * Useful for dynamic theming
 */
export function getColor(
  colorName: keyof typeof colors,
  shade: string = '500'
): string {
  return (colors[colorName] as Record<string, string>)[shade] || '#000000';
}
