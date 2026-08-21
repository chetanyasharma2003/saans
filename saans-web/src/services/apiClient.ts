import axios, { AxiosInstance, AxiosError } from 'axios';
import ErrorHandler, { MappedError } from './errorHandler';

/**
 * API Client with integrated error handling
 * Provides a configured axios instance with error mapping and logging
 */
class ApiClient {
  private instance: AxiosInstance;

  constructor(baseURL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000') {
    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Setup request interceptor
    this.setupRequestInterceptor();

    // Setup response interceptor
    this.setupResponseInterceptor();
  }

  /**
   * Setup request interceptor to add auth token and track API calls
   */
  private setupRequestInterceptor() {
    this.instance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Setup response interceptor for error handling and tracking
   */
  private setupResponseInterceptor() {
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        const mappedError = ErrorHandler.mapApiError(error);

        // Handle specific error cases
        if (mappedError.status === 401) {
          // Clear auth token and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }

        // Log error for debugging and Sentry
        ErrorHandler.logToService(mappedError, {
          url: error.config?.url,
          method: error.config?.method,
          timestamp: new Date().toISOString(),
        });

        return Promise.reject(mappedError);
      }
    );
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.instance.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw ErrorHandler.mapApiError(error);
    }
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.instance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw ErrorHandler.mapApiError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.instance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw ErrorHandler.mapApiError(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.instance.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw ErrorHandler.mapApiError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.instance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw ErrorHandler.mapApiError(error);
    }
  }

  /**
   * Get the underlying axios instance for direct use
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

export default ApiClient;
