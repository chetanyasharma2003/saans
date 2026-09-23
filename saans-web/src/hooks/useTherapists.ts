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
      const response = await apiClient.get<Therapist[]>('/therapists', { params: filters });
      return response.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useTherapist(id: string) {
  return useQuery({
    queryKey: [...therapistKeys.all, id],
    queryFn: async () => {
      const response = await apiClient.get<Therapist>(`/therapists/${id}`);
      return response.data || null;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useRecommendedTherapists() {
  return useQuery({
    queryKey: [...therapistKeys.all, 'recommended'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<Therapist[]>('/therapists');
        return response.data || [];
      } catch (error) {
        console.error('Failed to fetch recommended therapists:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useNearbyTherapists() {
  return useQuery({
    queryKey: [...therapistKeys.all, 'nearby'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<Therapist[]>('/therapists');
        return response.data || [];
      } catch (error) {
        console.error('Failed to fetch nearby therapists:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useTherapistsBySpecialty() {
  return useQuery({
    queryKey: [...therapistKeys.all, 'specialty'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<Therapist[]>('/therapists');
        return response.data || [];
      } catch (error) {
        console.error('Failed to fetch therapists by specialty:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
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
      return response.data || [];
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
      return response.data || [];
    },
  });
}
