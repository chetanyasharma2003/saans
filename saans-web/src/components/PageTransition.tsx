import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageTransition component wraps page content to provide smooth fade-in animations
 * Automatically applies page-enter animation to child components
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div className={`page-enter ${className}`}>
      {children}
    </div>
  );
}

export default PageTransition;
