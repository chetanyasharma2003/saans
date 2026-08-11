/**
 * Component Barrel Exports
 * Import all components from a single place for cleaner imports
 */

// Error Handling
export { default as ErrorBoundary } from './ErrorBoundary';
export {
  default as ToastProvider,
  useToast,
  type ToastType,
  type ToastMessage,
} from './Toast';

// Loading Skeletons
export {
  ListSkeleton,
  CardSkeleton,
  ProfileSkeleton,
  ChatSkeleton,
  SkeletonLoader,
} from './LoadingSkeleton';

// Empty States
export {
  EmptyState,
  NoAppointmentsEmptyState,
  NoMessagesEmptyState,
  NoMoodEntriesEmptyState,
  NoCommunityPostsEmptyState,
  CustomEmptyState,
  EmptySearchState,
  ErrorState,
  SuccessState,
} from './EmptyState';

// Other Components
export { Navbar } from './Navbar';
export { PageTransition } from './PageTransition';
export { SuspenseLoading } from './SuspenseLoading';

// Showcase (development only)
export { SkeletonShowcase } from './SkeletonShowcase';
