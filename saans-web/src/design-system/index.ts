/**
 * SAANS Design System
 * Complete design system export
 */

// Colors
export { colors, semanticColors, darkColors, getColor } from './colors';

// Typography
export {
  typography,
  typographyClasses,
  fontFamily,
  type TypographyStyle,
} from './typography';

// Spacing
export {
  spacing,
  semanticSpacing,
  componentSpacing,
  layoutPatterns,
  responsiveSpacing,
} from './spacing';

// Shadows
export {
  shadows,
  semanticShadows,
  shadowTransition,
  hoverShadows,
  shadowClasses,
} from './shadows';

// Components
export {
  Button,
  IconButton,
  type ButtonProps,
} from './components/Button';

export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  type CardProps,
} from './components/Card';

export {
  Typography,
  H1,
  H2,
  H3,
  H4,
  Body,
  Label,
  Caption,
  Code,
  type TypographyProps,
} from './components/Typography';

export {
  Icon,
  Icons,
  getIconSizeClass,
  type IconName,
} from './components/Icon';

export {
  Badge,
  CountBadge,
  StatusBadge,
  type BadgeProps,
} from './components/Badge';

/**
 * Design System Configuration
 * Export commonly used combinations
 */
export const DesignSystem = {
  colors: { ...semanticColors },
  spacing: { ...semanticSpacing },
  shadows: { ...semanticShadows },
  typography: { ...typography },
};
