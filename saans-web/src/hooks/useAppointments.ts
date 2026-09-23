import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';

export interface Appointment {
  _id?: string;
  id?: string;
  therapistId: string;
  date: string;
  time: string;
  status: string;
  type: string;
  duration?: number;
  price?: number;
  notes?: string;
}

export const appointmentKeys = {
  all: ['appointments'] as const,
  list: () => [...appointmentKeys.all, 'list'] as const,
};

export function useAppointments() {
  return useQuery({
    queryKey: appointmentKeys.list(),
    queryFn: async () => {
      const response = await apiClient.get<Appointment[]>('/appointments');
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useNextAppointment() {
  return useQuery({
    queryKey: [...appointmentKeys.all, 'next'],
    queryFn: async () => {
      const response = await apiClient.get<Appointment>('/appointments/next');
      return response.data || null;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: [...appointmentKeys.all, id],
    queryFn: async () => {
      const response = await apiClient.get<Appointment>(`/appointments/${id}`);
      return response.data || null;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiClient.put<Appointment>(`/appointments/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: [...appointmentKeys.all, 'upcoming'],
    queryFn: async () => {
      const response = await apiClient.get<Appointment[]>('/appointments/upcoming');
      return response.data || [];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<Appointment>('/appointments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<Appointment>(`/appointments/${id}/cancel`, {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, scheduledAt }: any) => {
      const response = await apiClient.post<Appointment>(`/appointments/${id}/reschedule`, { scheduledAt });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}
