/**
 * SAANS Typography System
 * Clean, professional, accessible text styles
 */

export interface TypographyStyle {
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing: string;
}

export const typography = {
  // Display: Large headlines
  display: {
    lg: {
      fontSize: '3.5rem', // 56px
      fontWeight: 700,
      lineHeight: '1.2', // 67px
      letterSpacing: '-0.02em',
    } as TypographyStyle,

    md: {
      fontSize: '2.8rem', // 45px
      fontWeight: 700,
      lineHeight: '1.2', // 54px
      letterSpacing: '-0.02em',
    } as TypographyStyle,

    sm: {
      fontSize: '2.25rem', // 36px
      fontWeight: 700,
      lineHeight: '1.2', // 43px
      letterSpacing: '-0.01em',
    } as TypographyStyle,
  },

  // Heading: Page & section titles
  heading: {
    h1: {
      fontSize: '2rem', // 32px
      fontWeight: 700,
      lineHeight: '1.25', // 40px
      letterSpacing: '-0.01em',
    } as TypographyStyle,

    h2: {
      fontSize: '1.75rem', // 28px
      fontWeight: 700,
      lineHeight: '1.3', // 36px
      letterSpacing: '-0.01em',
    } as TypographyStyle,

    h3: {
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: '1.33', // 32px
      letterSpacing: '0',
    } as TypographyStyle,

    h4: {
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: '1.4', // 28px
      letterSpacing: '0',
    } as TypographyStyle,

    h5: {
      fontSize: '1.125rem', // 18px
      fontWeight: 600,
      lineHeight: '1.44', // 26px
      letterSpacing: '0',
    } as TypographyStyle,

    h6: {
      fontSize: '1rem', // 16px
      fontWeight: 600,
      lineHeight: '1.5', // 24px
      letterSpacing: '0',
    } as TypographyStyle,
  },

  // Body: Content text
  body: {
    lg: {
      fontSize: '1.125rem', // 18px
      fontWeight: 400,
      lineHeight: '1.55', // 28px
      letterSpacing: '0',
    } as TypographyStyle,

    md: {
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: '1.5', // 24px
      letterSpacing: '0',
    } as TypographyStyle,

    sm: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: '1.43', // 20px
      letterSpacing: '0',
    } as TypographyStyle,

    xs: {
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: '1.33', // 16px
      letterSpacing: '0',
    } as TypographyStyle,
  },

  // Label: Form labels, captions
  label: {
    lg: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: '1.5', // 24px
      letterSpacing: '0',
    } as TypographyStyle,

    md: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: '1.43', // 20px
      letterSpacing: '0',
    } as TypographyStyle,

    sm: {
      fontSize: '0.75rem', // 12px
      fontWeight: 500,
      lineHeight: '1.33', // 16px
      letterSpacing: '0.05em',
    } as TypographyStyle,
  },

  // Code: Monospace
  code: {
    lg: {
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: '1.5', // 24px
      letterSpacing: '0',
      fontFamily: "'Fira Code', 'Courier New', monospace",
    } as TypographyStyle & { fontFamily: string },

    md: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: '1.43', // 20px
      letterSpacing: '0',
      fontFamily: "'Fira Code', 'Courier New', monospace",
    } as TypographyStyle & { fontFamily: string },

    sm: {
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: '1.33', // 16px
      letterSpacing: '0',
      fontFamily: "'Fira Code', 'Courier New', monospace",
    } as TypographyStyle & { fontFamily: string },
  },
};

/**
 * Get CSS classes for typography styles
 * Usage: Use in Tailwind @apply directives
 */
export const typographyClasses = {
  displayLg: 'text-[3.5rem] font-bold leading-[1.2] tracking-[-0.02em]',
  displayMd: 'text-[2.8rem] font-bold leading-[1.2] tracking-[-0.02em]',
  displaySm: 'text-[2.25rem] font-bold leading-[1.2] tracking-[-0.01em]',

  h1: 'text-[2rem] font-bold leading-[1.25] tracking-[-0.01em]',
  h2: 'text-[1.75rem] font-bold leading-[1.3] tracking-[-0.01em]',
  h3: 'text-[1.5rem] font-semibold leading-[1.33]',
  h4: 'text-[1.25rem] font-semibold leading-[1.4]',
  h5: 'text-[1.125rem] font-semibold leading-[1.44]',
  h6: 'text-base font-semibold leading-[1.5]',

  bodyLg: 'text-[1.125rem] font-normal leading-[1.55]',
  bodyMd: 'text-base font-normal leading-[1.5]',
  bodySm: 'text-sm font-normal leading-[1.43]',
  bodyXs: 'text-xs font-normal leading-[1.33]',

  labelLg: 'text-base font-medium leading-[1.5]',
  labelMd: 'text-sm font-medium leading-[1.43]',
  labelSm: 'text-xs font-medium leading-[1.33] tracking-[0.05em]',

  codeLg: 'font-mono text-base font-normal leading-[1.5]',
  codeMd: 'font-mono text-sm font-normal leading-[1.43]',
  codeSm: 'font-mono text-xs font-normal leading-[1.33]',
};

/**
 * Font families
 */
export const fontFamily = {
  sans: "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', sans-serif",
  mono: "'Fira Code', 'Courier New', monospace",
  heading: "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
};
