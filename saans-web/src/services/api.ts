/**
 * API Service
 * Centralized API client for all HTTP requests
 */

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseData?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  statusCode?: number;
  timestamp?: string;
}

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const options: RequestInit = {
      method,
      headers: {
        ...this.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(data && { 'Content-Type': 'application/json' }),
      },
      ...(data && { body: JSON.stringify(data) }),
      signal: controller.signal,
    };

    try {
      let response = await fetch(url, options);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401) {
        const isRefreshed = await this.refreshToken();
        if (isRefreshed) {
          // Retry with new token
          const newToken = this.getAuthToken();
          options.headers = {
            ...options.headers,
            ...(newToken && { Authorization: `Bearer ${newToken}` }),
          };
          response = await fetch(url, options);
        } else {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || response.statusText,
          response.status,
          errorData
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as unknown as T;
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error(`API request timeout: ${method} ${endpoint}`);
        throw new Error('Request timeout - server not responding');
      }
      console.error(`API request failed: ${method} ${endpoint}`, error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      if (!token) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) return false;

      const data = await response.json();
      localStorage.setItem('accessToken', data.token);
      return true;
    } catch (error) {
      console.error('Token refresh failed', error);
      return false;
    }
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<ApiResponse<T>>('GET', endpoint);
  }

  async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<ApiResponse<T>>('POST', endpoint, data);
  }

  async put<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<ApiResponse<T>>('PUT', endpoint, data);
  }

  async patch<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<ApiResponse<T>>('PATCH', endpoint, data);
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<ApiResponse<T>>('DELETE', endpoint);
  }
}

export const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
