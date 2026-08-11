import React, { useState } from 'react';
import {
  ListSkeleton,
  CardSkeleton,
  ProfileSkeleton,
  ChatSkeleton,
} from './LoadingSkeleton';
import {
  NoAppointmentsEmptyState,
  NoMessagesEmptyState,
  NoMoodEntriesEmptyState,
  NoCommunityPostsEmptyState,
  EmptySearchState,
  ErrorState,
  SuccessState,
} from './EmptyState';

/**
 * Showcase component for all loading skeletons and empty states
 * Use this to preview and test components during development
 * Route: /dev/skeletons (development only)
 */

export function SkeletonShowcase() {
  const [activeTab, setActiveTab] = useState<
    'skeletons' | 'empty-states' | 'states'
  >('skeletons');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-2 text-teal-400">
          🎨 Skeleton & Empty State Showcase
        </h1>
        <p className="text-slate-400">
          Preview all loading and empty states used in SAANS
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex gap-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('skeletons')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'skeletons'
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Loading Skeletons
          </button>
          <button
            onClick={() => setActiveTab('empty-states')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'empty-states'
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Empty States
          </button>
          <button
            onClick={() => setActiveTab('states')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'states'
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Other States
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'skeletons' && <SkeletonsSection />}
        {activeTab === 'empty-states' && <EmptyStatesSection />}
        {activeTab === 'states' && <OtherStatesSection />}
      </div>

      {/* Footer Note */}
      <div className="max-w-7xl mx-auto mt-16 p-6 bg-blue-900/20 border border-blue-500/20 rounded-lg">
        <p className="text-blue-300 text-sm">
          📌 <span className="font-semibold">Development Only:</span> This
          showcase component is for development purposes only. Remove the route
          before production deployment.
        </p>
      </div>
    </div>
  );
}

/**
 * Loading Skeletons Section
 */
function SkeletonsSection() {
  return (
    <div className="space-y-12">
      {/* List Skeleton */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-teal-400 mb-1">
            List Skeleton
          </h2>
          <p className="text-slate-400">
            Use for lists of appointments, messages, or mood entries
          </p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-lg">
          <ListSkeleton count={3} />
        </div>
      </div>

      {/* Compact List Skeleton */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-teal-400 mb-1">
            Compact List Skeleton
          </h2>
          <p className="text-slate-400">
            Use for compact/condensed list views
          </p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-lg">
          <ListSkeleton count={4} isCompact={true} />
        </div>
      </div>

      {/* Card Skeleton */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-teal-400 mb-1">
            Card Skeleton
          </h2>
          <p className="text-slate-400">
            Use for grid layouts, therapist profiles, or community posts
          </p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-lg">
          <CardSkeleton count={2} hasBadge={true} />
        </div>
      </div>

      {/* Card Skeleton Without Badge */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-teal-400 mb-1">
            Card Skeleton (No Badge)
          </h2>
          <p className="text-slate-400">
            Use for simpler card layouts
          </p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-lg">
          <CardSkeleton count={3} hasBadge={false} />
        </div>
      </div>

      {/* Profile Skeleton */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-teal-400 mb-1">
            Profile Skeleton
          </h2>
          <p className="text-slate-400">
            Use for user profiles, therapist profiles, or community members
          </p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-lg flex justify-center">
          <div className="w-full max-w-sm">
            <ProfileSkeleton />
          </div>
        </div>
      </div>

      {/* Chat Skeleton */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-teal-400 mb-1">
            Chat Skeleton
          </h2>
          <p className="text-slate-400">
            Use for chat conversations and messaging interfaces
          </p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-lg">
          <ChatSkeleton messageCount={4} />
        </div>
      </div>
    </div>
  );
}

/**
 * Empty States Section
 */
function EmptyStatesSection() {
  return (
    <div className="space-y-12">
      {/* No Appointments */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-teal-400 mb-1">
            No Appointments
          </h2>
          <p className="text-slate-400">
            When user has no scheduled appointments
          </p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-lg">
          <NoAppointmentsEmptyState
            onScheduleClick={() =>
              console.log('Schedule appointment clicked')
            }
            onFindTherapistClick={() => console.log('Find therapist clicked')}
          />
        </div>
      </div>

      {/* No Messages */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-teal-400 mb-1">
            No Messages
          </h2>
          <p className="text-slate-400">
            When user has no conversations or messages
          </p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-lg">
          <NoMessagesEmptyState
            onStartChatClick={() => console.log('Start chat clicked')}
            onInviteFriendsClick={() => console.log('Invite friends clicked')}
          />
        </div>
      </div>

      {/* No Mood Entries */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-teal-400 mb-1">
            No Mood Entries
          </h2>
          <p className="text-slate-400">
            When user has no mood tracking entries
          </p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-lg">
          <NoMoodEntriesEmptyState
            onTrackMoodClick={() => console.log('Track mood clicked')}
            onViewGuideClick={() => console.log('View guide clicked')}
          />
        </div>
      </div>

      {/* No Community Posts */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-teal-400 mb-1">
            No Community Posts
          </h2>
          <p className="text-slate-400">
            When community section is empty
          </p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-lg">
          <NoCommunityPostsEmptyState
            onCreatePostClick={() => console.log('Create post clicked')}
            onExploreClick={() => console.log('Explore clicked')}
          />
        </div>
      </div>

      {/* Empty Search */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-teal-400 mb-1">
            Empty Search Results
          </h2>
          <p className="text-slate-400">
            When search returns no results
          </p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-lg">
          <EmptySearchState
            query="cognitive behavioral therapy"
            onClearSearch={() => console.log('Clear search clicked')}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Other States Section (Error, Success)
 */
function OtherStatesSection() {
  return (
    <div className="space-y-12">
      {/* Error State */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-teal-400 mb-1">Error State</h2>
          <p className="text-slate-400">
            When an error occurs during data loading
          </p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-lg">
          <ErrorState
            title="Failed to Load Appointments"
            description="There was an error retrieving your appointments. Please try again or contact support if the problem persists."
            onRetryClick={() => console.log('Retry clicked')}
          />
        </div>
      </div>

      {/* Success State */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-teal-400 mb-1">
            Success State
          </h2>
          <p className="text-slate-400">
            When an action completes successfully
          </p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-lg">
          <SuccessState
            title="Appointment Scheduled!"
            description="Your appointment with Dr. Sarah has been scheduled for tomorrow at 2:00 PM."
            actionLabel="View Details"
            onActionClick={() => console.log('View details clicked')}
          />
        </div>
      </div>

      {/* Custom Error Examples */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-teal-400 mb-1">
            Error Variations
          </h2>
          <p className="text-slate-400">
            Different error scenarios
          </p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-lg space-y-6">
          <ErrorState
            title="Network Error"
            description="Unable to connect to the server. Check your internet connection and try again."
            onRetryClick={() => console.log('Retry clicked')}
          />
          <ErrorState
            title="Unauthorized Access"
            description="You don't have permission to access this resource. Please contact an administrator."
            onRetryClick={() => console.log('Retry clicked')}
          />
        </div>
      </div>

      {/* Custom Success Examples */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-teal-400 mb-1">
            Success Variations
          </h2>
          <p className="text-slate-400">
            Different success scenarios
          </p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-lg space-y-6">
          <SuccessState
            title="Profile Updated"
            description="Your profile information has been saved successfully."
            actionLabel="Continue"
            onActionClick={() => console.log('Continue clicked')}
          />
          <SuccessState
            title="Mood Entry Saved"
            description="Your mood entry has been recorded and will help us provide better insights."
            actionLabel="View Analytics"
            onActionClick={() => console.log('View analytics clicked')}
          />
        </div>
      </div>
    </div>
  );
}

export default SkeletonShowcase;
