import React from 'react';
import { CheckCircle, AlertCircle, Shield, Briefcase } from 'lucide-react';

export interface TrustBadgeProps {
  badge: string;
  verified?: boolean;
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
}

const badgeIcons: Record<string, React.ReactNode> = {
  'Licensed': <CheckCircle className="w-4 h-4" />,
  'Board Certified': <Shield className="w-4 h-4" />,
  'Background Checked': <CheckCircle className="w-4 h-4" />,
  'Malpractice Insured': <Briefcase className="w-4 h-4" />,
};

const badgeColors: Record<string, { bg: string; text: string }> = {
  'Licensed': {
    bg: 'var(--color-accent-lighter)',
    text: 'var(--color-primary)',
  },
  'Board Certified': {
    bg: 'var(--color-accent-lighter)',
    text: 'var(--color-primary)',
  },
  'Background Checked': {
    bg: 'var(--color-accent-lighter)',
    text: 'var(--color-primary)',
  },
  'Malpractice Insured': {
    bg: 'var(--color-accent-lighter)',
    text: 'var(--color-primary)',
  },
};

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  badge,
  verified = true,
  tooltip,
  size = 'md',
}) => {
  const colors = badgeColors[badge] || {
    bg: 'var(--color-gray-200)',
    text: 'var(--color-text-primary)',
  };

  const sizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full font-semibold ${sizeClass} transition-all`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
      title={tooltip || badge}
    >
      {verified && badgeIcons[badge]}
      <span>{badge}</span>
    </div>
  );
};

export const TrustBadgesCluster: React.FC<{ badges: string[] }> = ({
  badges,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <TrustBadge key={badge} badge={badge} verified={true} />
      ))}
    </div>
  );
};
