/**
 * API Service
 * Centralized API client for all HTTP requests
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiClientConfig {
  baseURL: string;
  headers: Record<string, string>;
}

class ApiClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.headers = config.headers;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const options: RequestInit = {
      method,
      headers: {
        ...this.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(data && { 'Content-Type': 'application/json' }),
      },
      ...(data && { body: JSON.stringify(data) }),
    };

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`API request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.makeRequest<T>('POST', endpoint, data);
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.makeRequest<T>('PUT', endpoint, data);
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.makeRequest<T>('PATCH', endpoint, data);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>('DELETE', endpoint);
  }
}

export const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
