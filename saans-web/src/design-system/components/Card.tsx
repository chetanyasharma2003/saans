import React from 'react';
import { componentSpacing, semanticSpacing } from '../spacing';
import { semanticShadows } from '../shadows';

type CardVariant = 'flat' | 'outlined' | 'elevated' | 'filled';
type CardPadding = 'sm' | 'md' | 'lg' | 'none';

export interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  rounded?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
}

const variantStyles: Record<CardVariant, string> = {
  flat: 'bg-neutral-50 border border-neutral-200',
  outlined: 'bg-white border border-neutral-200',
  elevated: 'bg-white shadow-md',
  filled: 'bg-neutral-100 border-0',
};

const paddingStyles: Record<CardPadding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  none: 'p-0',
};

/**
 * Card Component
 * Base container for grouped content
 */
export const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({
  variant = 'outlined',
  padding = 'md',
  rounded = true,
  hoverable = false,
  clickable = false,
  children,
  className = '',
  onClick,
  onHover,
}, ref) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const hoverClass = (hoverable || clickable)
    ? 'transition-all duration-200 ease-in-out cursor-pointer hover:shadow-lg'
    : '';

  const combinedClass = [
    variantStyles[variant],
    paddingStyles[padding],
    rounded && 'rounded-lg',
    hoverClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={combinedClass}
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover?.(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onHover?.(false);
      }}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

/**
 * Card.Header Component
 * Top section of card
 */
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string }
>(({ children, className = '' }, ref) => (
  <div ref={ref} className={`pb-4 border-b border-neutral-200 ${className}`}>
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

/**
 * Card.Body Component
 * Main content section
 */
export const CardBody = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string }
>(({ children, className = '' }, ref) => (
  <div ref={ref} className={`py-4 ${className}`}>
    {children}
  </div>
));

CardBody.displayName = 'CardBody';

/**
 * Card.Footer Component
 * Bottom section of card
 */
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string }
>(({ children, className = '' }, ref) => (
  <div ref={ref} className={`pt-4 border-t border-neutral-200 ${className}`}>
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

/**
 * Compose Card with nested components
 */
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
