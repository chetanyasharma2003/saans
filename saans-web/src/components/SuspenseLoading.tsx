import React from 'react';

interface SuspenseLoadingProps {
  message?: string;
}

/**
 * SuspenseLoading component shows a smooth loading animation while pages are loading
 * Used as fallback in React.Suspense boundaries
 */
export function SuspenseLoading({ message = 'Loading...' }: SuspenseLoadingProps) {
  return (
    <div className="suspense-loading">
      <div className="text-center">
        <div className="suspense-spinner mb-4" />
        <p className="text-white/70 animate-fade-in">{message}</p>
      </div>
    </div>
  );
}

export default SuspenseLoading;
