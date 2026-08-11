/**
 * Mood Tracker API Service
 * Handles all mood-related API calls
 */

const API_BASE = '/api/moods';

interface MoodEntry {
  id: string;
  userId: string;
  moodScore: number;
  moodCategory: string;
  symptoms?: string[];
  triggers?: string[];
  notes?: string;
  location?: string;
  weather?: string;
  createdAt: string;
}

interface TrackMoodInput {
  moodScore: number;
  moodCategory: string;
  symptoms?: string[];
  triggers?: string[];
  notes?: string;
  location?: string;
  weather?: string;
}

interface MoodAnalytics {
  totalEntries: number;
  averageScore: number;
  mostFrequentMood: string;
  recentTrend: number[];
  streakDays: number;
  last7DaysAverage: number;
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

export const moodService = {
  /**
   * Track a new mood entry
   */
  async trackMood(input: TrackMoodInput) {
    const response = await fetch(`${API_BASE}/track`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error('Failed to track mood');
    }

    return response.json();
  },

  /**
   * Get user's mood history
   */
  async getMoodHistory(limit: number = 30, skip: number = 0) {
    const response = await fetch(`${API_BASE}/my-moods?limit=${limit}&skip=${skip}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch mood history');
    }

    return response.json();
  },

  /**
   * Get mood analytics
   */
  async getAnalytics() {
    const response = await fetch(`${API_BASE}/analytics`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }

    return response.json();
  },

  /**
   * Get moods for a date range
   */
  async getMoodsByDateRange(startDate: string, endDate: string) {
    const response = await fetch(
      `${API_BASE}/date-range?startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch moods for date range');
    }

    return response.json();
  },

  /**
   * Update a mood entry
   */
  async updateMood(id: string, input: Partial<TrackMoodInput>) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error('Failed to update mood');
    }

    return response.json();
  },

  /**
   * Delete a mood entry
   */
  async deleteMood(id: string) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete mood');
    }

    return response.json();
  },
};
