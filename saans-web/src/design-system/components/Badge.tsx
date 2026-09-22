import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
  info: 'bg-info-100 text-info-700',
  neutral: 'bg-neutral-100 text-neutral-700',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-xs font-medium rounded',
  md: 'px-3 py-1 text-sm font-medium rounded-md',
  lg: 'px-4 py-2 text-base font-medium rounded-lg',
};

/**
 * Badge Component
 * Small label for status/tags
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
}) => {
  const combinedClass = [
    variantStyles[variant],
    sizeStyles[size],
    'inline-flex items-center whitespace-nowrap',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={combinedClass}>{children}</span>;
};

/**
 * CountBadge Component
 * Small badge with number
 */
export const CountBadge: React.FC<{
  count: number;
  max?: number;
  variant?: BadgeVariant;
  className?: string;
}> = ({ count, max = 99, variant = 'error', className = '' }) => {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <span
      className={[
        'inline-flex items-center justify-center',
        'w-6 h-6 rounded-full text-xs font-bold',
        variant === 'error' && 'bg-error-500 text-white',
        variant === 'warning' && 'bg-warning-500 text-white',
        variant === 'info' && 'bg-info-500 text-white',
        variant === 'primary' && 'bg-primary-500 text-white',
        variant === 'success' && 'bg-success-500 text-white',
        variant === 'neutral' && 'bg-neutral-500 text-white',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {displayCount}
    </span>
  );
};

/**
 * Status Badge Component
 * For showing status/states
 */
export const StatusBadge: React.FC<{
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'error';
  children?: React.ReactNode;
}> = ({ status, children }) => {
  const statusConfig = {
    active: { variant: 'success' as const, label: 'Active' },
    inactive: { variant: 'neutral' as const, label: 'Inactive' },
    pending: { variant: 'warning' as const, label: 'Pending' },
    completed: { variant: 'success' as const, label: 'Completed' },
    error: { variant: 'error' as const, label: 'Error' },
  }[status];

  return (
    <Badge variant={statusConfig.variant} size="sm">
      <span className="inline-block w-2 h-2 rounded-full mr-2 bg-current opacity-70" />
      {children || statusConfig.label}
    </Badge>
  );
};
