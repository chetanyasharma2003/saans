import React from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Icon Library Mapping
 * Maps semantic icon names to lucide-react icons
 */
type IconName =
  | 'dashboard' | 'therapist' | 'ai-counselor' | 'crisis' | 'mood' | 'community'
  | 'settings' | 'profile' | 'logout' | 'menu' | 'close' | 'back' | 'forward'
  | 'home' | 'search' | 'heart' | 'star' | 'calendar' | 'clock' | 'phone'
  | 'email' | 'location' | 'user' | 'users' | 'bell' | 'check' | 'x'
  | 'alert' | 'info' | 'warning' | 'error' | 'success' | 'loading' | 'brain'
  | 'trending-up' | 'bar-chart' | 'message-circle' | 'file' | 'download'
  | 'more' | 'edit' | 'delete' | 'save' | 'add' | 'minus' | 'expand' | 'minimize';

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface IconProps {
  name: IconName;
  size?: IconSize;
  color?: string;
  className?: string;
  onClick?: () => void;
}

// Lucide React Icon imports (lazy load in real implementation)
const iconMap: Record<IconName, React.ComponentType<any>> = {
  // Navigation
  dashboard: () => <span>📊</span>, // Replace with lucide
  therapist: () => <span>👨‍⚕️</span>,
  'ai-counselor': () => <span>🤖</span>,
  crisis: () => <span>🆘</span>,
  mood: () => <span>😊</span>,
  community: () => <span>👥</span>,
  settings: () => <span>⚙️</span>,
  profile: () => <span>👤</span>,
  logout: () => <span>🚪</span>,
  menu: () => <span>☰</span>,
  close: () => <span>✕</span>,
  back: () => <span>←</span>,
  forward: () => <span>→</span>,
  home: () => <span>🏠</span>,
  search: () => <span>🔍</span>,
  heart: () => <span>❤️</span>,
  star: () => <span>⭐</span>,
  calendar: () => <span>📅</span>,
  clock: () => <span>🕐</span>,
  phone: () => <span>📞</span>,
  email: () => <span>✉️</span>,
  location: () => <span>📍</span>,
  user: () => <span>👤</span>,
  users: () => <span>👥</span>,
  bell: () => <span>🔔</span>,
  check: () => <span>✓</span>,
  x: () => <span>✕</span>,
  alert: () => <span>⚠️</span>,
  info: () => <span>ℹ️</span>,
  warning: () => <span>⚠️</span>,
  error: () => <span>❌</span>,
  success: () => <span>✓</span>,
  loading: () => <span>⏳</span>,
  brain: () => <span>🧠</span>,
  'trending-up': () => <span>📈</span>,
  'bar-chart': () => <span>📊</span>,
  'message-circle': () => <span>💬</span>,
  file: () => <span>📄</span>,
  download: () => <span>⬇️</span>,
  more: () => <span>⋯</span>,
  edit: () => <span>✏️</span>,
  delete: () => <span>🗑️</span>,
  save: () => <span>💾</span>,
  add: () => <span>+</span>,
  minus: () => <span>−</span>,
  expand: () => <span>⤢</span>,
  minimize: () => <span>⤡</span>,
};

const sizeMap: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
};

/**
 * Icon Component
 * Replaces emoji icons with proper icon system
 *
 * Note: Currently using fallback emojis
 * To implement proper icons, install lucide-react:
 * npm install lucide-react
 *
 * Then update iconMap with actual lucide imports:
 * import { Home, Settings, Users } from 'lucide-react';
 * const iconMap = {
 *   home: Home,
 *   settings: Settings,
 *   users: Users,
 *   ...
 * };
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = 'currentColor',
  className = '',
  onClick,
}) => {
  const IconComponent = iconMap[name] || (() => <span>?</span>);
  const sizePixels = sizeMap[size];

  return (
    <span
      role="img"
      aria-label={name}
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: sizePixels, height: sizePixels, color }}
      onClick={onClick}
    >
      <IconComponent />
    </span>
  );
};

/**
 * Get icon size class for Tailwind
 */
export function getIconSizeClass(size: IconSize): string {
  const classMap: Record<IconSize, string> = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
    '2xl': 'w-12 h-12',
  };
  return classMap[size];
}

/**
 * Common icon combinations
 */
export const Icons = {
  // Navigation
  Dashboard: (props?: Partial<IconProps>) => (
    <Icon name="dashboard" {...props} />
  ),
  Therapist: (props?: Partial<IconProps>) => (
    <Icon name="therapist" {...props} />
  ),
  AiCounselor: (props?: Partial<IconProps>) => (
    <Icon name="ai-counselor" {...props} />
  ),
  Crisis: (props?: Partial<IconProps>) => (
    <Icon name="crisis" {...props} />
  ),
  Settings: (props?: Partial<IconProps>) => (
    <Icon name="settings" {...props} />
  ),
  Close: (props?: Partial<IconProps>) => (
    <Icon name="close" {...props} />
  ),
  Menu: (props?: Partial<IconProps>) => (
    <Icon name="menu" {...props} />
  ),
  Search: (props?: Partial<IconProps>) => (
    <Icon name="search" {...props} />
  ),
  Check: (props?: Partial<IconProps>) => (
    <Icon name="check" {...props} />
  ),
  Error: (props?: Partial<IconProps>) => (
    <Icon name="error" {...props} />
  ),
  Loading: (props?: Partial<IconProps>) => (
    <Icon name="loading" {...props} />
  ),
};
