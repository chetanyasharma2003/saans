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
      const response = await apiClient.get('/appointments');
      return response.data.data || [];
    },
  });
}

export function useNextAppointment() {
  return useQuery({
    queryKey: [...appointmentKeys.all, 'next'],
    queryFn: async () => {
      const response = await apiClient.get('/appointments/next');
      return response.data.data || null;
    },
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: [...appointmentKeys.all, id],
    queryFn: async () => {
      const response = await apiClient.get(`/appointments/${id}`);
      return response.data.data || null;
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiClient.put(`/appointments/${id}`, data);
      return response.data.data;
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
      const response = await apiClient.get('/appointments/upcoming');
      return response.data.data || [];
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/appointments', data);
      return response.data.data;
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
      const response = await apiClient.post(`/appointments/${id}/cancel`, {});
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, date, time }: any) => {
      const response = await apiClient.post(`/appointments/${id}/reschedule`, { date, time });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}
