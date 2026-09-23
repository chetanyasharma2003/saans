import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';

export interface Therapist {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  specialty?: string;
  rating?: number;
  languages?: string[];
  experience?: number;
  price?: number;
}

export const therapistKeys = {
  all: ['therapists'] as const,
  list: () => [...therapistKeys.all, 'list'] as const,
};

export function useTherapists(filters?: any) {
  return useQuery({
    queryKey: [...therapistKeys.list(), filters],
    queryFn: async () => {
      const response = await apiClient.get('/therapists', { params: filters });
      return response.data.data || [];
    },
  });
}

export function useTherapist(id: string) {
  return useQuery({
    queryKey: [...therapistKeys.all, id],
    queryFn: async () => {
      const response = await apiClient.get(`/therapists/${id}`);
      return response.data.data || null;
    },
  });
}

export function useRecommendedTherapists() {
  return useQuery({
    queryKey: [...therapistKeys.all, 'recommended'],
    queryFn: async () => {
      const response = await apiClient.get('/therapists').catch(() => ({ data: { data: [] } }));
      return response.data.data || [];
    },
  });
}

export function useNearbyTherapists() {
  return useQuery({
    queryKey: [...therapistKeys.all, 'nearby'],
    queryFn: async () => {
      const response = await apiClient.get('/therapists').catch(() => ({ data: { data: [] } }));
      return response.data.data || [];
    },
  });
}

export function useTherapistsBySpecialty() {
  return useQuery({
    queryKey: [...therapistKeys.all, 'specialty'],
    queryFn: async () => {
      const response = await apiClient.get('/therapists').catch(() => ({ data: { data: [] } }));
      return response.data.data || [];
    },
  });
}

export function useTherapistReviews() {
  return useQuery({
    queryKey: [...therapistKeys.all, 'reviews'],
    queryFn: async () => ({ data: [] }),
  });
}

export function useTherapistAvailability() {
  return useQuery({
    queryKey: [...therapistKeys.all, 'availability'],
    queryFn: async () => ({}),
  });
}

export function useSpecialties() {
  return useQuery({
    queryKey: [...therapistKeys.all, 'specialties'],
    queryFn: async () => {
      const response = await apiClient.get('/therapists/options/specialties');
      return response.data.data || [];
    },
  });
}

export function useTherapistSpecialties() {
  return useSpecialties();
}

export function useLanguages() {
  return useQuery({
    queryKey: [...therapistKeys.all, 'languages'],
    queryFn: async () => {
      const response = await apiClient.get('/therapists/options/languages');
      return response.data.data || [];
    },
  });
}
