/**
 * React Query Hooks - Central Export
 * All API-related hooks in one place
 */

// Appointments
export {
  useAppointments,
  useNextAppointment,
  useUpcomingAppointments,
  useAppointment,
  useCreateAppointment,
  useUpdateAppointment,
  useCancelAppointment,
  useRescheduleAppointment,
  appointmentKeys,
  type Appointment,
  type AppointmentResponse,
} from './useAppointments';

// Mood Entries
export {
  useMoodEntries,
  useRecentMood,
  useMoodStats,
  useMoodEntry,
  useLogMood,
  useUpdateMood,
  useDeleteMood,
  useMoodRange,
  useMoodTrend,
  moodKeys,
  type MoodEntry,
  type MoodStats,
  type MoodResponse,
} from './useMoodEntries';

// Therapists
export {
  useTherapists,
  useTherapist,
  useRecommendedTherapists,
  useNearbyTherapists,
  useTherapistsBySpecialty,
  useTherapistReviews,
  useTherapistAvailability,
  useSpecialties,
  useLanguages,
  therapistKeys,
  type Therapist,
  type TherapistFilters,
  type TherapistResponse,
} from './useTherapists';

// Community
export {
  useCommunityPosts,
  useCommunityPost,
  useCreatePost,
  useLikePost,
  useSupportGroups,
  useSupportGroup,
  useJoinGroup,
  useLeaveGroup,
  useActivityFeed,
  useRecentActivity,
  communityKeys,
  type CommunityPost,
  type SupportGroup,
  type ActivityFeed,
} from './useCommunity';

/**
 * Hook usage guide:
 *
 * // Fetch data
 * const { data, isLoading, error } = useAppointments();
 *
 * // Mutate data
 * const { mutate, isPending } = useCreateAppointment();
 *
 * // Handle loading/error states
 * if (isLoading) return <LoadingSkeleton />;
 * if (error) return <ErrorComponent error={error} />;
 *
 * // Render data
 * return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;
 */
