/**
 * Appointments Hooks
 * React Query hooks for appointment API endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { MOCK_APPOINTMENTS } from '../data/mockData';

// Types
export interface Appointment {
  id: string;
  therapistId: string;
  therapistName: string;
  specialty: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'scheduled' | 'completed' | 'cancelled';
  consultationType: 'video' | 'audio' | 'chat';
  notes?: string;
}

export interface AppointmentResponse {
  success: boolean;
  data: Appointment[];
  message?: string;
}

// Query Keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters?: any) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  upcoming: () => [...appointmentKeys.all, 'upcoming'] as const,
  next: () => [...appointmentKeys.all, 'next'] as const,
};

/**
 * Get all appointments for current user
 */
export function useAppointments(filters?: { status?: string; month?: string }) {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: async () => {
      const response = await apiClient.get<AppointmentResponse>(
        '/appointments',
        { params: filters }
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch appointments');
      }
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Get next upcoming appointment
 */
export function useNextAppointment() {
  return useQuery({
    queryKey: appointmentKeys.next(),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Appointment | null }>(
        '/appointments/next'
      );
      if (!response.data.success) {
        throw new Error('Failed to fetch next appointment');
      }
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get upcoming appointments (limited)
 */
export function useUpcomingAppointments(limit: number = 3) {
  return useQuery({
    queryKey: appointmentKeys.upcoming(),
    queryFn: async () => {
      const response = await apiClient.get<AppointmentResponse>(
        '/appointments/upcoming',
        { params: { limit } }
      );
      if (!response.data.success) {
        throw new Error('Failed to fetch upcoming appointments');
      }
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get single appointment by ID
 */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Appointment }>(
        `/appointments/${id}`
      );
      if (!response.data.success) {
        throw new Error('Failed to fetch appointment');
      }
      return response.data.data;
    },
    enabled: !!id,
  });
}

/**
 * Create appointment mutation
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Appointment>) => {
      const response = await apiClient.post<{ success: boolean; data: Appointment }>(
        '/appointments',
        data
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create appointment');
      }
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate all appointment queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

/**
 * Update appointment mutation
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Appointment> & { id: string }) => {
      const response = await apiClient.put<{ success: boolean; data: Appointment }>(
        `/appointments/${id}`,
        data
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update appointment');
      }
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.setQueryData(appointmentKeys.detail(data.id), data);
    },
  });
}

/**
 * Cancel appointment mutation
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await apiClient.post<{ success: boolean }>(
        `/appointments/${appointmentId}/cancel`
      );
      if (!response.data.success) {
        throw new Error('Failed to cancel appointment');
      }
      return appointmentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

/**
 * Reschedule appointment mutation
 */
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      newDate,
      newTime,
    }: {
      appointmentId: string;
      newDate: string;
      newTime: string;
    }) => {
      const response = await apiClient.post<{ success: boolean; data: Appointment }>(
        `/appointments/${appointmentId}/reschedule`,
        { date: newDate, time: newTime }
      );
      if (!response.data.success) {
        throw new Error('Failed to reschedule appointment');
      }
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}
