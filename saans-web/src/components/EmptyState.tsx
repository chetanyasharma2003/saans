import React from 'react';
import {
  Calendar,
  MessageCircle,
  TrendingUp,
  Users,
  Plus,
  ArrowRight,
} from 'lucide-react';

/**
 * Empty state components for various sections of the SAANS platform
 * Display when there is no data to show and provide guidance to users
 */

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel?: string;
  onActionClick?: () => void;
  actionLabel2?: string;
  onActionClick2?: () => void;
  isDark?: boolean;
}

/**
 * Generic Empty State component
 */
export const EmptyState = ({
  title,
  description,
  icon,
  actionLabel,
  onActionClick,
  actionLabel2,
  onActionClick2,
  isDark = true,
}: EmptyStateProps) => (
  <div
    className={`flex flex-col items-center justify-center py-16 px-4 rounded-xl ${
      isDark
        ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50'
        : 'bg-gradient-to-br from-slate-100/50 to-slate-200/50'
    } border ${isDark ? 'border-white/10' : 'border-black/10'} backdrop-blur-sm`}
  >
    {/* Icon */}
    <div
      className={`mb-4 p-4 rounded-full ${
        isDark
          ? 'bg-teal-500/20 text-teal-400'
          : 'bg-teal-100 text-teal-600'
      }`}
    >
      <div className="w-12 h-12 flex items-center justify-center">{icon}</div>
    </div>

    {/* Title */}
    <h3
      className={`text-xl font-bold mb-2 ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}
    >
      {title}
    </h3>

    {/* Description */}
    <p
      className={`text-sm text-center mb-6 max-w-sm ${
        isDark ? 'text-slate-400' : 'text-slate-600'
      }`}
    >
      {description}
    </p>

    {/* Actions */}
    {(actionLabel || actionLabel2) && (
      <div className="flex gap-3 flex-wrap justify-center">
        {actionLabel && (
          <button
            onClick={onActionClick}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/30"
          >
            <Plus size={18} />
            {actionLabel}
          </button>
        )}
        {actionLabel2 && (
          <button
            onClick={onActionClick2}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              isDark
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
            }`}
          >
            {actionLabel2}
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    )}
  </div>
);

/**
 * No Appointments Empty State
 */
export const NoAppointmentsEmptyState = ({
  onScheduleClick,
  onFindTherapistClick,
}: {
  onScheduleClick?: () => void;
  onFindTherapistClick?: () => void;
}) => (
  <EmptyState
    icon={<Calendar size={24} />}
    title="No Appointments Scheduled"
    description="You don't have any upcoming appointments yet. Schedule a session with a therapist or counselor to get started on your mental health journey."
    actionLabel="Schedule Appointment"
    onActionClick={onScheduleClick}
    actionLabel2="Find Therapist"
    onActionClick2={onFindTherapistClick}
  />
);

/**
 * No Messages Empty State
 */
export const NoMessagesEmptyState = ({
  onStartChatClick,
  onInviteFriendsClick,
}: {
  onStartChatClick?: () => void;
  onInviteFriendsClick?: () => void;
}) => (
  <EmptyState
    icon={<MessageCircle size={24} />}
    title="No Messages Yet"
    description="You haven't started any conversations yet. Start chatting with friends or connect with our AI counselor for support."
    actionLabel="Start Chat"
    onActionClick={onStartChatClick}
    actionLabel2="Invite Friends"
    onActionClick2={onInviteFriendsClick}
  />
);

/**
 * No Mood Entries Empty State
 */
export const NoMoodEntriesEmptyState = ({
  onTrackMoodClick,
  onViewGuideClick,
}: {
  onTrackMoodClick?: () => void;
  onViewGuideClick?: () => void;
}) => (
  <EmptyState
    icon={<TrendingUp size={24} />}
    title="No Mood Entries Yet"
    description="Start tracking your mood to understand your emotional patterns and get personalized insights. Track your feelings regularly for better mental wellness."
    actionLabel="Track My Mood"
    onActionClick={onTrackMoodClick}
    actionLabel2="View Guide"
    onActionClick2={onViewGuideClick}
  />
);

/**
 * No Community Posts Empty State
 */
export const NoCommunityPostsEmptyState = ({
  onCreatePostClick,
  onExploreClick,
}: {
  onCreatePostClick?: () => void;
  onExploreClick?: () => void;
}) => (
  <EmptyState
    icon={<Users size={24} />}
    title="No Community Posts"
    description="Be the first to share your thoughts! Create a post to start meaningful conversations with our supportive community."
    actionLabel="Create Post"
    onActionClick={onCreatePostClick}
    actionLabel2="Explore Community"
    onActionClick2={onExploreClick}
  />
);

/**
 * Generic Empty State with Custom Icon
 */
export const CustomEmptyState = ({
  title,
  description,
  iconType,
  actionLabel,
  onActionClick,
  actionLabel2,
  onActionClick2,
}: {
  title: string;
  description: string;
  iconType: 'calendar' | 'message' | 'mood' | 'community' | 'custom';
  actionLabel?: string;
  onActionClick?: () => void;
  actionLabel2?: string;
  onActionClick2?: () => void;
}) => {
  const iconMap: Record<string, React.ReactNode> = {
    calendar: <Calendar size={24} />,
    message: <MessageCircle size={24} />,
    mood: <TrendingUp size={24} />,
    community: <Users size={24} />,
    custom: <Users size={24} />,
  };

  return (
    <EmptyState
      icon={iconMap[iconType]}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onActionClick={onActionClick}
      actionLabel2={actionLabel2}
      onActionClick2={onActionClick2}
    />
  );
};

/**
 * Empty Search Results State
 */
export const EmptySearchState = ({
  query,
  onClearSearch,
}: {
  query: string;
  onClearSearch?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 backdrop-blur-sm">
    <div className="mb-4 p-4 rounded-full bg-yellow-500/20 text-yellow-400">
      <div className="w-12 h-12 flex items-center justify-center">🔍</div>
    </div>

    <h3 className="text-xl font-bold mb-2 text-white">No Results Found</h3>

    <p className="text-sm text-center mb-6 max-w-sm text-slate-400">
      We couldn't find anything matching "<span className="font-semibold text-teal-400">{query}</span>
      ". Try adjusting your search terms or browse our suggestions.
    </p>

    {onClearSearch && (
      <button
        onClick={onClearSearch}
        className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200"
      >
        Clear Search
        <ArrowRight size={18} />
      </button>
    )}
  </div>
);

/**
 * Error State
 */
export const ErrorState = ({
  title = 'Something Went Wrong',
  description = 'An error occurred while loading your data. Please try again later.',
  onRetryClick,
}: {
  title?: string;
  description?: string;
  onRetryClick?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl bg-gradient-to-br from-red-900/20 to-slate-900/50 border border-red-500/20 backdrop-blur-sm">
    <div className="mb-4 p-4 rounded-full bg-red-500/20 text-red-400">
      <div className="w-12 h-12 flex items-center justify-center text-2xl">⚠️</div>
    </div>

    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>

    <p className="text-sm text-center mb-6 max-w-sm text-slate-400">
      {description}
    </p>

    {onRetryClick && (
      <button
        onClick={onRetryClick}
        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-500/30"
      >
        Try Again
      </button>
    )}
  </div>
);

/**
 * Success State
 */
export const SuccessState = ({
  title = 'Success!',
  description = 'Your action was completed successfully.',
  actionLabel = 'Continue',
  onActionClick,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl bg-gradient-to-br from-green-900/20 to-slate-900/50 border border-green-500/20 backdrop-blur-sm">
    <div className="mb-4 p-4 rounded-full bg-green-500/20 text-green-400">
      <div className="w-12 h-12 flex items-center justify-center text-2xl">✓</div>
    </div>

    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>

    <p className="text-sm text-center mb-6 max-w-sm text-slate-400">
      {description}
    </p>

    {onActionClick && (
      <button
        onClick={onActionClick}
        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30"
      >
        {actionLabel}
        <ArrowRight size={18} />
      </button>
    )}
  </div>
);

export default {
  EmptyState,
  NoAppointmentsEmptyState,
  NoMessagesEmptyState,
  NoMoodEntriesEmptyState,
  NoCommunityPostsEmptyState,
  CustomEmptyState,
  EmptySearchState,
  ErrorState,
  SuccessState,
};
