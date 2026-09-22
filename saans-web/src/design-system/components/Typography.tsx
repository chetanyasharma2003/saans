import React from 'react';
import { typography, typographyClasses } from '../typography';
import { semanticColors } from '../colors';

type TypographyVariant =
  | 'displayLg' | 'displayMd' | 'displaySm'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'bodyLg' | 'bodyMd' | 'bodySm' | 'bodyXs'
  | 'labelLg' | 'labelMd' | 'labelSm'
  | 'codeLg' | 'codeMd' | 'codeSm';

type ColorVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'error' | 'warning' | 'info';

export interface TypographyProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label' | 'code';
  variant?: TypographyVariant;
  color?: ColorVariant | 'inherit';
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  truncate?: boolean;
  noWrap?: boolean;
  lineHeight?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const colorMap: Record<ColorVariant, string> = {
  primary: 'text-primary-600',
  secondary: 'text-neutral-600',
  tertiary: 'text-neutral-500',
  success: 'text-success-600',
  error: 'text-error-600',
  warning: 'text-warning-600',
  info: 'text-info-600',
};

const variantClasses: Record<TypographyVariant, string> = {
  displayLg: typographyClasses.displayLg,
  displayMd: typographyClasses.displayMd,
  displaySm: typographyClasses.displaySm,
  h1: typographyClasses.h1,
  h2: typographyClasses.h2,
  h3: typographyClasses.h3,
  h4: typographyClasses.h4,
  h5: typographyClasses.h5,
  h6: typographyClasses.h6,
  bodyLg: typographyClasses.bodyLg,
  bodyMd: typographyClasses.bodyMd,
  bodySm: typographyClasses.bodySm,
  bodyXs: typographyClasses.bodyXs,
  labelLg: typographyClasses.labelLg,
  labelMd: typographyClasses.labelMd,
  labelSm: typographyClasses.labelSm,
  codeLg: typographyClasses.codeLg,
  codeMd: typographyClasses.codeMd,
  codeSm: typographyClasses.codeSm,
};

/**
 * Universal Typography Component
 * Handles all text styles in SAANS
 */
export const Typography = React.forwardRef<
  HTMLElement,
  TypographyProps
>(({
  as = 'p',
  variant = 'bodyMd',
  color = 'primary',
  align = 'left',
  truncate = false,
  noWrap = false,
  weight,
  lineHeight,
  children,
  className = '',
  onClick,
}, ref) => {
  const Component = as as React.ElementType;

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  }[align];

  const weightClass = weight
    ? {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      }[weight]
    : '';

  const colorClass = color === 'inherit' ? '' : colorMap[color as ColorVariant] || colorMap.primary;

  const combinedClass = [
    variantClasses[variant],
    alignClass,
    colorClass,
    weightClass,
    truncate && 'truncate',
    noWrap && 'whitespace-nowrap',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style = lineHeight ? { lineHeight } : undefined;

  return (
    <Component
      ref={ref}
      className={combinedClass}
      style={style}
      onClick={onClick}
    >
      {children}
    </Component>
  );
});

Typography.displayName = 'Typography';

/**
 * Shorthand typography components
 */
export const H1 = (props: Omit<TypographyProps, 'as' | 'variant'>) => (
  <Typography as="h1" variant="h1" {...props} />
);

export const H2 = (props: Omit<TypographyProps, 'as' | 'variant'>) => (
  <Typography as="h2" variant="h2" {...props} />
);

export const H3 = (props: Omit<TypographyProps, 'as' | 'variant'>) => (
  <Typography as="h3" variant="h3" {...props} />
);

export const H4 = (props: Omit<TypographyProps, 'as' | 'variant'>) => (
  <Typography as="h4" variant="h4" {...props} />
);

export const Body = (props: Omit<TypographyProps, 'as' | 'variant'>) => (
  <Typography as="p" variant="bodyMd" {...props} />
);

export const Label = (props: Omit<TypographyProps, 'as' | 'variant'>) => (
  <Typography as="label" variant="labelMd" {...props} />
);

export const Caption = (props: Omit<TypographyProps, 'as' | 'variant'>) => (
  <Typography as="span" variant="bodySm" {...props} />
);

export const Code = (props: Omit<TypographyProps, 'as' | 'variant'>) => (
  <Typography as="code" variant="codeMd" {...props} />
);
