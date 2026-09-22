import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonType = 'button' | 'submit' | 'reset';

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-neutral-300',
  secondary:
    'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-400 disabled:bg-neutral-200',
  tertiary:
    'bg-transparent text-primary-600 hover:bg-primary-50 active:bg-primary-100 disabled:text-neutral-400',
  ghost:
    'bg-transparent text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 disabled:text-neutral-400',
  danger:
    'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 disabled:bg-neutral-300',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm h-8 rounded-md',
  md: 'px-4 py-2 text-base h-10 rounded-lg',
  lg: 'px-6 py-3 text-base h-12 rounded-lg',
};

/**
 * Button Component
 * Primary interactive element
 */
export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  type = 'button',
  children,
  className = '',
  disabled,
  onClick,
  ...props
}, ref) => {
  const finalDisabled = isDisabled || disabled || isLoading;

  const combinedClass = [
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && 'w-full',
    finalDisabled && 'opacity-50 cursor-not-allowed',
    !finalDisabled && 'transition-colors duration-200 cursor-pointer',
    'font-medium inline-flex items-center justify-center gap-2',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconElement = isLoading ? (
    <span className="animate-spin">⏳</span>
  ) : icon ? (
    icon
  ) : null;

  return (
    <button
      ref={ref}
      type={type}
      disabled={finalDisabled}
      className={combinedClass}
      onClick={onClick}
      {...props}
    >
      {iconElement && iconPosition === 'left' && iconElement}
      <span>{children}</span>
      {iconElement && iconPosition === 'right' && iconElement}
    </button>
  );
});

Button.displayName = 'Button';

/**
 * IconButton Component
 * Button with only icon
 */
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'children'> & {
    icon: React.ReactNode;
    label?: string;
  }
>(({
  variant = 'ghost',
  size = 'md',
  icon,
  label,
  ...props
}, ref) => (
  <button
    ref={ref}
    className={[
      'inline-flex items-center justify-center',
      size === 'sm' && 'w-8 h-8 rounded-md',
      size === 'md' && 'w-10 h-10 rounded-lg',
      size === 'lg' && 'w-12 h-12 rounded-lg',
      variant === 'ghost' && 'hover:bg-neutral-100 text-neutral-600',
      variant === 'primary' && 'hover:bg-primary-100 text-primary-600',
      variant === 'danger' && 'hover:bg-error-100 text-error-600',
      'transition-colors duration-200',
    ]
      .filter(Boolean)
      .join(' ')}
    title={label}
    {...props}
  >
    {icon}
  </button>
));

IconButton.displayName = 'IconButton';
