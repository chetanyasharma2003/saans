/**
 * Mood Entries Hooks
 * React Query hooks for mood tracking API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { MOCK_MOOD_ENTRIES, MOCK_MOOD_STATS } from '../data/mockData';

// Types
  id: string;
  date: string;
  time: string;
  mood: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  moodLabel: string;
  intensity: 'low' | 'medium' | 'high';
  activities: string[];
  notes?: string;
  triggers?: string[];
  therapyNotes?: string;
  timestamp: string;
}

export interface MoodStats {
  average: number;
  trend: 'improving' | 'stable' | 'declining';
  streak: number;
  thisWeekAverage: number;
  thisMonthAverage: number;
}

export interface MoodResponse {
  success: boolean;
  data: MoodEntry[];
  stats?: MoodStats;
  message?: string;
}

// Query Keys
export const moodKeys = {
  all: ['mood-entries'] as const,
  lists: () => [...moodKeys.all, 'list'] as const,
  list: (filters?: any) => [...moodKeys.lists(), filters] as const,
  details: () => [...moodKeys.all, 'detail'] as const,
  detail: (id: string) => [...moodKeys.details(), id] as const,
  recent: () => [...moodKeys.all, 'recent'] as const,
  stats: () => [...moodKeys.all, 'stats'] as const,
};

/**
 * Get all mood entries with optional filters
 */
export function useMoodEntries(filters?: {
  days?: number;
  month?: string;
  year?: number;
}) {
  return useQuery({
    queryKey: moodKeys.list(filters),
    queryFn: async () => {
        const response = await apiClient.get<MoodResponse>('/mood', {
          params: filters,
        });
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch mood entries');
        }
        return response.data.data;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get recent mood entry (today or latest)
 */
export function useRecentMood() {
  return useQuery({
    queryKey: moodKeys.recent(),
    queryFn: async () => {
        const response = await apiClient.get<{
          success: boolean;
          data: MoodEntry | null;
        }>('/mood/recent');
        if (!response.data.success) {
          throw new Error('Failed to fetch recent mood');
        }
        return response.data.data;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get mood statistics
 */
export function useMoodStats(days: number = 30) {
  return useQuery({
    queryKey: moodKeys.stats(),
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: MoodStats;
      }>('/mood/stats', { params: { days } });
      if (!response.data.success) {
        throw new Error('Failed to fetch mood statistics');
      }
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get single mood entry
 */
export function useMoodEntry(id: string) {
  return useQuery({
    queryKey: moodKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: MoodEntry;
      }>(`/mood/${id}`);
      if (!response.data.success) {
        throw new Error('Failed to fetch mood entry');
      }
      return response.data.data;
    },
    enabled: !!id,
  });
}

/**
 * Create/log mood entry
 */
export function useLogMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<MoodEntry, 'id' | 'timestamp'>) => {
      const response = await apiClient.post<{
        success: boolean;
        data: MoodEntry;
      }>('/mood', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to log mood');
      }
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: moodKeys.all });
      queryClient.invalidateQueries({ queryKey: moodKeys.stats() });
    },
  });
}

/**
 * Update mood entry
 */
export function useUpdateMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<MoodEntry> & { id: string }) => {
      const response = await apiClient.put<{
        success: boolean;
        data: MoodEntry;
      }>(`/mood/${id}`, data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update mood');
      }
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: moodKeys.all });
      queryClient.setQueryData(moodKeys.detail(data.id), data);
    },
  });
}

/**
 * Delete mood entry
 */
export function useDeleteMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moodId: string) => {
      const response = await apiClient.delete<{ success: boolean }>(
        `/mood/${moodId}`
      );
      if (!response.data.success) {
        throw new Error('Failed to delete mood entry');
      }
      return moodId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodKeys.all });
      queryClient.invalidateQueries({ queryKey: moodKeys.stats() });
    },
  });
}

/**
 * Get mood entries for specific date range
 */
export function useMoodRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: moodKeys.list({ startDate, endDate }),
    queryFn: async () => {
      const response = await apiClient.get<MoodResponse>(
        '/mood/range',
        { params: { startDate, endDate } }
      );
      if (!response.data.success) {
        throw new Error('Failed to fetch mood range');
      }
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get mood trend data
 */
export function useMoodTrend(days: number = 30) {
  return useQuery({
    queryKey: [...moodKeys.all, 'trend', days],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: Array<{ date: string; mood: number }>;
      }>('/mood/trend', { params: { days } });
      if (!response.data.success) {
        throw new Error('Failed to fetch mood trend');
      }
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}
