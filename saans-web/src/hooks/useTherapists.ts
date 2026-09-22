/**
 * Therapists Hooks
 * React Query hooks for therapist discovery API
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';

// Types
export interface Therapist {
  id: string;
  name: string;
  title: string;
  specialty: string[];
  bio: string;
  qualifications: string[];
  experience: number;
  languages: string[];
  rating: number;
  reviews: number;
  price: number;
  availability: string;
  consultationType: ('video' | 'audio' | 'chat')[];
  location?: {
    city: string;
    state: string;
    coordinates?: [number, number];
  };
  insuranceAccepted: string[];
  verified: boolean;
  responseTime: string;
  avatar?: string;
  distance?: number; // For location-based search
}

export interface TherapistFilters {
  specialty?: string;
  language?: string;
  minRating?: number;
  maxPrice?: number;
  location?: string;
  consultationType?: 'video' | 'audio' | 'chat';
  availability?: string;
  insurance?: string;
}

export interface TherapistResponse {
  success: boolean;
  data: Therapist[];
  total?: number;
  message?: string;
}

// Query Keys
export const therapistKeys = {
  all: ['therapists'] as const,
  lists: () => [...therapistKeys.all, 'list'] as const,
  list: (filters?: TherapistFilters) => [...therapistKeys.lists(), filters] as const,
  details: () => [...therapistKeys.all, 'detail'] as const,
  detail: (id: string) => [...therapistKeys.details(), id] as const,
  recommended: () => [...therapistKeys.all, 'recommended'] as const,
  nearby: (location?: string) => [...therapistKeys.all, 'nearby', location] as const,
};

/**
 * Get all therapists with optional filters
 */
export function useTherapists(filters?: TherapistFilters) {
  return useQuery({
    queryKey: therapistKeys.list(filters),
    queryFn: async () => {
      const response = await apiClient.get<TherapistResponse>(
        '/therapists',
        { params: filters }
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch therapists');
      }
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Get single therapist by ID
 */
export function useTherapist(id: string) {
  return useQuery({
    queryKey: therapistKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: Therapist;
      }>(`/therapists/${id}`);
      if (!response.data.success) {
        throw new Error('Failed to fetch therapist');
      }
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get recommended therapists for current user
 */
export function useRecommendedTherapists() {
  return useQuery({
    queryKey: therapistKeys.recommended(),
    queryFn: async () => {
      const response = await apiClient.get<TherapistResponse>(
        '/therapists/recommended'
      );
      if (!response.data.success) {
        throw new Error('Failed to fetch recommended therapists');
      }
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get nearby therapists (geolocation-based)
 */
export function useNearbyTherapists(location: string, radius: number = 50) {
  return useQuery({
    queryKey: therapistKeys.nearby(location),
    queryFn: async () => {
      const response = await apiClient.get<TherapistResponse>(
        '/therapists/nearby',
        { params: { location, radius } }
      );
      if (!response.data.success) {
        throw new Error('Failed to fetch nearby therapists');
      }
      return response.data.data;
    },
    enabled: !!location,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Search therapists by specialty
 */
export function useTherapistsBySpecialty(specialty: string) {
  return useQuery({
    queryKey: therapistKeys.list({ specialty }),
    queryFn: async () => {
      const response = await apiClient.get<TherapistResponse>(
        '/therapists/specialty',
        { params: { specialty } }
      );
      if (!response.data.success) {
        throw new Error('Failed to fetch therapists');
      }
      return response.data.data;
    },
    enabled: !!specialty,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get therapist reviews
 */
export function useTherapistReviews(therapistId: string) {
  return useQuery({
    queryKey: [...therapistKeys.detail(therapistId), 'reviews'],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: Array<{
          id: string;
          rating: number;
          comment: string;
          author: string;
          date: string;
        }>;
      }>(`/therapists/${therapistId}/reviews`);
      if (!response.data.success) {
        throw new Error('Failed to fetch reviews');
      }
      return response.data.data;
    },
    enabled: !!therapistId,
  });
}

/**
 * Get therapist availability
 */
export function useTherapistAvailability(therapistId: string) {
  return useQuery({
    queryKey: [...therapistKeys.detail(therapistId), 'availability'],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: Array<{ date: string; slots: string[] }>;
      }>(`/therapists/${therapistId}/availability`);
      if (!response.data.success) {
        throw new Error('Failed to fetch availability');
      }
      return response.data.data;
    },
    enabled: !!therapistId,
    staleTime: 5 * 60 * 1000, // 5 minutes - refreshed more often
  });
}

/**
 * Get specialties for filtering
 */
export function useSpecialties() {
  return useQuery({
    queryKey: [...therapistKeys.all, 'specialties'],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: Array<{ id: string; name: string; count: number }>;
      }>('/therapists/specialties');
      if (!response.data.success) {
        throw new Error('Failed to fetch specialties');
      }
      return response.data.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Get languages for filtering
 */
export function useLanguages() {
  return useQuery({
    queryKey: [...therapistKeys.all, 'languages'],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: string[];
      }>('/therapists/languages');
      if (!response.data.success) {
        throw new Error('Failed to fetch languages');
      }
      return response.data.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
