import React from 'react';

/**
 * Loading skeleton components for smooth data loading states
 * Used to display placeholder UI while data is being fetched
 */

/**
 * Animated skeleton pulse
 */
const SkeletonPulse = ({ className = '' }: { className?: string }) => (
  <div
    className={`bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 animate-pulse ${className}`}
  />
);

/**
 * List Skeleton - shows multiple item skeletons
 * Ideal for loading lists of appointments, messages, or entries
 */
export const ListSkeleton = ({
  count = 3,
  isCompact = false,
}: {
  count?: number;
  isCompact?: boolean;
}) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="p-4 bg-slate-800/50 rounded-lg border border-white/5 backdrop-blur-sm"
      >
        <div className="flex gap-4">
          {/* Avatar skeleton */}
          <SkeletonPulse className="w-10 h-10 rounded-full flex-shrink-0" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-4 w-48 rounded" />
            {!isCompact && <SkeletonPulse className="h-3 w-full rounded" />}
            <SkeletonPulse className="h-3 w-32 rounded" />
          </div>

          {/* Action skeleton */}
          {!isCompact && (
            <SkeletonPulse className="w-8 h-8 rounded flex-shrink-0" />
          )}
        </div>
      </div>
    ))}
  </div>
);

/**
 * Card Skeleton - shows a larger card skeleton
 * Ideal for loading detail cards, therapy sessions, or mood entries
 */
export const CardSkeleton = ({
  count = 2,
  hasBadge = true,
}: {
  count?: number;
  hasBadge?: boolean;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 backdrop-blur-sm"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-5 w-32 rounded" />
            <SkeletonPulse className="h-3 w-48 rounded" />
          </div>
          {hasBadge && (
            <SkeletonPulse className="w-16 h-6 rounded-full flex-shrink-0 ml-2" />
          )}
        </div>

        {/* Content */}
        <div className="space-y-3 mb-4">
          <SkeletonPulse className="h-3 w-full rounded" />
          <SkeletonPulse className="h-3 w-5/6 rounded" />
          <SkeletonPulse className="h-3 w-4/5 rounded" />
        </div>

        {/* Footer */}
        <div className="flex gap-2">
          <SkeletonPulse className="h-8 w-20 rounded-lg flex-1" />
          <SkeletonPulse className="h-8 w-20 rounded-lg flex-1" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Profile Skeleton - shows a profile card skeleton
 * Ideal for loading user profile, therapist cards, or community members
 */
export const ProfileSkeleton = () => (
  <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 backdrop-blur-sm max-w-sm">
    {/* Avatar */}
    <div className="flex justify-center mb-4">
      <SkeletonPulse className="w-24 h-24 rounded-full" />
    </div>

    {/* Name and Title */}
    <div className="text-center space-y-2 mb-4">
      <SkeletonPulse className="h-5 w-32 rounded mx-auto" />
      <SkeletonPulse className="h-3 w-40 rounded mx-auto" />
    </div>

    {/* Bio/Description */}
    <div className="space-y-2 mb-6">
      <SkeletonPulse className="h-3 w-full rounded" />
      <SkeletonPulse className="h-3 w-5/6 rounded" />
      <SkeletonPulse className="h-3 w-4/5 rounded" />
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-2 mb-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="text-center space-y-2">
          <SkeletonPulse className="h-6 w-12 rounded mx-auto" />
          <SkeletonPulse className="h-2 w-16 rounded mx-auto" />
        </div>
      ))}
    </div>

    {/* Action Button */}
    <SkeletonPulse className="h-10 w-full rounded-lg" />
  </div>
);

/**
 * Chat Skeleton - shows a conversation-like skeleton
 * Ideal for loading chat messages, AI counselor responses, or community discussions
 */
export const ChatSkeleton = ({ messageCount = 4 }: { messageCount?: number }) => (
  <div className="space-y-4">
    {/* Chat header */}
    <div className="p-4 bg-slate-800/50 rounded-lg border border-white/5 backdrop-blur-sm mb-4">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-4 w-32 rounded" />
          <SkeletonPulse className="h-3 w-20 rounded" />
        </div>
      </div>
    </div>

    {/* Messages */}
    <div className="space-y-3 flex-1">
      {Array.from({ length: messageCount }).map((_, i) => {
        const isOwnMessage = i % 2 === 0;
        return (
          <div
            key={i}
            className={`flex ${
              isOwnMessage ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs space-y-2 ${
                isOwnMessage ? 'items-end' : 'items-start'
              }`}
            >
              {isOwnMessage ? (
                <>
                  <SkeletonPulse className="h-10 w-40 rounded-2xl rounded-tr-sm" />
                  <SkeletonPulse className="h-2 w-16 rounded" />
                </>
              ) : (
                <>
                  <SkeletonPulse className="h-10 w-48 rounded-2xl rounded-tl-sm" />
                  <SkeletonPulse className="h-2 w-20 rounded" />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>

    {/* Input area */}
    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-white/5 backdrop-blur-sm">
      <div className="flex gap-2">
        <SkeletonPulse className="flex-1 h-10 rounded-lg" />
        <SkeletonPulse className="w-10 h-10 rounded-lg flex-shrink-0" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton Wrapper - combines all skeleton components
 * Can be used to create custom skeleton layouts
 */
export const SkeletonLoader = ({
  type = 'list',
  count = 3,
}: {
  type?: 'list' | 'card' | 'profile' | 'chat';
  count?: number;
}) => {
  switch (type) {
    case 'card':
      return <CardSkeleton count={count} />;
    case 'profile':
      return <ProfileSkeleton />;
    case 'chat':
      return <ChatSkeleton messageCount={count} />;
    case 'list':
    default:
      return <ListSkeleton count={count} />;
  }
};

export default {
  ListSkeleton,
  CardSkeleton,
  ProfileSkeleton,
  ChatSkeleton,
  SkeletonLoader,
};
