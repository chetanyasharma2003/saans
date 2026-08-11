import { apiClient } from './apiClient';

/**
 * Therapist API Service
 * Handles all API calls related to therapists and marketplace
 */

export interface TherapistFilters {
  specialty?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  language?: string;
  availability?: boolean;
  page?: number;
  limit?: number;
}

export interface TherapistData {
  id: string;
  name: string;
  specialty: string[];
  rating: number;
  reviews: number;
  price: number;
  languages: string[];
  availability: string[];
  image?: string;
  bio: string;
  experience: number;
  certifications: string[];
  reviews_list: ReviewData[];
  averageRating: number;
  totalReviews: number;
  hourlyRate: number;
  specialization: string[];
}

export interface ReviewData {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface GetTherapistsResponse {
  data: TherapistData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AvailableSlotsResponse {
  date: string;
  dayOfWeek: number;
  slots: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isBooked: boolean;
  }>;
  totalSlots: number;
  availableCount: number;
}

export interface ReviewsResponse {
  therapistId: string;
  reviews: ReviewData[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class TherapistApiService {
  private baseUrl = '/api/therapists';

  /**
   * Get all therapists with filtering and pagination
   */
  async getAllTherapists(filters: TherapistFilters = {}): Promise<GetTherapistsResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.specialty) params.append('specialty', filters.specialty);
      if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
      if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
      if (filters.minRating !== undefined) params.append('minRating', String(filters.minRating));
      if (filters.availability !== undefined) params.append('availability', String(filters.availability));
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));

      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      return await apiClient.get<GetTherapistsResponse>(url);
    } catch (error: any) {
      throw new Error(`Failed to fetch therapists: ${error.message}`);
    }
  }

  /**
   * Get single therapist by ID
   */
  async getTherapistById(therapistId: string): Promise<TherapistData> {
    try {
      if (!therapistId) {
        throw new Error('Therapist ID is required');
      }

      return await apiClient.get<TherapistData>(`${this.baseUrl}/${therapistId}`);
    } catch (error: any) {
      throw new Error(`Failed to fetch therapist: ${error.message}`);
    }
  }

  /**
   * Get available slots for a therapist on a specific date
   */
  async getAvailableSlots(therapistId: string, date: string): Promise<AvailableSlotsResponse> {
    try {
      if (!therapistId) {
        throw new Error('Therapist ID is required');
      }

      if (!date) {
        throw new Error('Date is required (YYYY-MM-DD)');
      }

      return await apiClient.get<AvailableSlotsResponse>(
        `${this.baseUrl}/availability/${therapistId}?date=${date}`
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch available slots: ${error.message}`);
    }
  }

  /**
   * Get reviews for a therapist
   */
  async getTherapistReviews(
    therapistId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewsResponse> {
    try {
      if (!therapistId) {
        throw new Error('Therapist ID is required');
      }

      return await apiClient.get<ReviewsResponse>(
        `${this.baseUrl}/reviews/${therapistId}?page=${page}&limit=${limit}`
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }
  }

  /**
   * Get therapist statistics
   */
  async getTherapistStats(therapistId: string): Promise<any> {
    try {
      if (!therapistId) {
        throw new Error('Therapist ID is required');
      }

      return await apiClient.get<any>(`${this.baseUrl}/stats/${therapistId}`);
    } catch (error: any) {
      throw new Error(`Failed to fetch therapist stats: ${error.message}`);
    }
  }

  /**
   * Search therapists by name or specialization
   */
  async searchTherapists(query: string, limit: number = 10): Promise<TherapistData[]> {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Search query is required');
      }

      const response = await apiClient.get<{ query: string; results: TherapistData[]; count: number }>(
        `${this.baseUrl}/search/${query}?limit=${limit}`
      );

      return response.results || [];
    } catch (error: any) {
      throw new Error(`Failed to search therapists: ${error.message}`);
    }
  }

  /**
   * Book a therapy session (integrated with appointments)
   */
  async bookSession(therapistId: string, bookingData: {
    date: string;
    time: string;
    notes?: string;
  }): Promise<any> {
    try {
      if (!therapistId) {
        throw new Error('Therapist ID is required');
      }

      return await apiClient.post('/appointments/book', {
        therapistId,
        ...bookingData,
      });
    } catch (error: any) {
      throw new Error(`Failed to book session: ${error.message}`);
    }
  }
}

export const therapistApi = new TherapistApiService();

export default therapistApi;
