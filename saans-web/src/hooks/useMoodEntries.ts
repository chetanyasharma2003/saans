import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';

export interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  notes?: string;
  activities?: string[];
  tags?: string[];
}

export interface MoodStats {
  average: number;
  streak: number;
  thisWeekAverage: number;
}

export const moodKeys = {
  all: ['mood'] as const,
  list: () => [...moodKeys.all, 'list'] as const,
  stats: () => [...moodKeys.all, 'stats'] as const,
};

export function useMoodEntries() {
  return useQuery({
    queryKey: moodKeys.list(),
    queryFn: async () => {
      const response = await apiClient.get('/mood');
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useMoodStats() {
  return useQuery({
    queryKey: moodKeys.stats(),
    queryFn: async () => {
      const response = await apiClient.get('/mood/stats');
      return response.data || {};
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecentMood() {
  return useQuery({
    queryKey: [...moodKeys.all, 'recent'],
    queryFn: async () => {
      const response = await apiClient.get('/mood/recent');
      return response.data || null;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useMoodEntry(id: string) {
  return useQuery({
    queryKey: [...moodKeys.all, id],
    queryFn: async () => {
      const response = await apiClient.get(`/mood/${id}`);
      return response.data || null;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useLogMood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/mood', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodKeys.all });
    },
  });
}

export function useUpdateMood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiClient.put(`/mood/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodKeys.all });
    },
  });
}

export function useDeleteMood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/mood/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodKeys.all });
    },
  });
}

export function useMoodRange() {
  return useQuery({
    queryKey: [...moodKeys.all, 'range'],
    queryFn: async () => {
      const response = await apiClient.get('/mood');
      return response.data.data || [];
    },
  });
}

export function useMoodTrend() {
  return useQuery({
    queryKey: [...moodKeys.all, 'trend'],
    queryFn: async () => {
      const response = await apiClient.get('/mood');
      return response.data.data || [];
    },
  });
}
