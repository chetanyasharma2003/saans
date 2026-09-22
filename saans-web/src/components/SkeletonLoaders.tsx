/**
 * Skeleton Loaders
 * Loading placeholders for different content types
 */

import React from 'react';

export const AppointmentSkeleton: React.FC = () => (
  <div className="p-6 bg-white rounded-lg border border-neutral-200 animate-pulse">
    <div className="h-6 bg-neutral-200 rounded mb-4 w-1/2" />
    <div className="h-4 bg-neutral-200 rounded mb-2" />
    <div className="h-4 bg-neutral-200 rounded mb-4 w-3/4" />
    <div className="flex gap-2">
      <div className="h-10 bg-neutral-200 rounded flex-1" />
      <div className="h-10 bg-neutral-200 rounded flex-1" />
    </div>
  </div>
);

export const TherapistCardSkeleton: React.FC = () => (
  <div className="p-4 bg-white rounded-lg border border-neutral-200 animate-pulse">
    <div className="flex gap-3 mb-4">
      <div className="w-12 h-12 bg-neutral-200 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-neutral-200 rounded mb-2 w-3/4" />
        <div className="h-3 bg-neutral-200 rounded w-1/2" />
      </div>
    </div>
    <div className="h-3 bg-neutral-200 rounded mb-2" />
    <div className="h-3 bg-neutral-200 rounded mb-4 w-2/3" />
    <div className="h-10 bg-neutral-200 rounded" />
  </div>
);

export const MoodEntrySkeleton: React.FC = () => (
  <div className="p-4 bg-white rounded-lg border border-neutral-200 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-16 h-16 bg-neutral-200 rounded-lg" />
      <div className="flex-1">
        <div className="h-5 bg-neutral-200 rounded mb-2 w-1/2" />
        <div className="h-3 bg-neutral-200 rounded w-1/3" />
      </div>
    </div>
    <div className="h-10 bg-neutral-200 rounded" />
  </div>
);

export const CommunityPostSkeleton: React.FC = () => (
  <div className="p-4 bg-white rounded-lg border border-neutral-200 animate-pulse">
    <div className="flex gap-3 mb-4">
      <div className="w-10 h-10 bg-neutral-200 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-neutral-200 rounded mb-2 w-2/3" />
        <div className="h-3 bg-neutral-200 rounded w-1/3" />
      </div>
    </div>
    <div className="h-4 bg-neutral-200 rounded mb-2" />
    <div className="h-4 bg-neutral-200 rounded mb-4 w-4/5" />
    <div className="flex gap-4">
      <div className="h-8 bg-neutral-200 rounded w-12" />
      <div className="h-8 bg-neutral-200 rounded w-12" />
      <div className="h-8 bg-neutral-200 rounded w-12" />
    </div>
  </div>
);

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <TherapistCardSkeleton key={i} />
    ))}
  </div>
);

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <AppointmentSkeleton key={i} />
    ))}
  </div>
);
