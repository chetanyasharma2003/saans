import axios, { AxiosError } from 'axios';

/**
 * Error response structure from API
 */
interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * Mapped error object for UI consumption
 */
export interface MappedError {
  status: number;
  message: string;
  userMessage: string;
  details?: Record<string, string[]>;
  originalError?: Error;
}

/**
 * Global error handler service
 * Maps API errors to user-friendly messages
 * Logs errors for debugging
 */
class ErrorHandler {
  /**
   * Map API error responses to user-friendly messages
   */
  static mapApiError(error: unknown): MappedError {
    console.error('API Error:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const status = axiosError.response?.status || 500;
      const data = axiosError.response?.data;

      // Extract error message from response
      const apiMessage = data?.message || data?.error || 'An unexpected error occurred';

      // Get user-friendly message based on status code
      const userMessage = this.getUserMessage(status, apiMessage);

      return {
        status,
        message: apiMessage,
        userMessage,
        details: data?.errors,
        originalError: error,
      };
    }

    if (error instanceof Error) {
      return {
        status: 0,
        message: error.message,
        userMessage: 'An unexpected error occurred. Please try again.',
        originalError: error,
      };
    }

    return {
      status: 0,
      message: 'Unknown error',
      userMessage: 'An unexpected error occurred. Please try again.',
      originalError: new Error(String(error)),
    };
  }

  /**
   * Get user-friendly error message based on status code
   */
  private static getUserMessage(status: number, apiMessage: string): string {
    const userMessages: Record<number, string> = {
      400: 'Invalid request. Please check your input and try again.',
      401: 'Your session has expired. Please log in again.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      409: 'This action conflicts with existing data. Please try again.',
      422: 'The data you provided is invalid. Please check and try again.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Server error. Please try again later.',
      502: 'Service temporarily unavailable. Please try again later.',
      503: 'Service is under maintenance. Please try again later.',
      504: 'Gateway timeout. Please try again later.',
    };

    return userMessages[status] || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Handle network/connectivity errors
   */
  static handleNetworkError(): MappedError {
    const message = 'Network connection failed. Please check your internet connection.';
    console.error('Network Error:', message);

    return {
      status: 0,
      message,
      userMessage: message,
      originalError: new Error(message),
    };
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(
    errors: Record<string, string[]>
  ): Record<string, string> {
    const mappedErrors: Record<string, string> = {};

    Object.entries(errors).forEach(([field, messages]) => {
      mappedErrors[field] = messages[0] || 'Invalid field';
    });

    return mappedErrors;
  }

  /**
   * Setup global error interceptor for axios
   */
  static setupInterceptor(
    axiosInstance: any,
    onError?: (error: MappedError) => void
  ): void {
    axiosInstance.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        const mappedError = this.mapApiError(error);

        // Call error handler if provided
        if (onError) {
          onError(mappedError);
        }

        // Special handling for 401 - redirect to login
        if (mappedError.status === 401) {
          // Dispatch logout action or redirect
          console.warn('Authentication failed - user should be logged out');
          // window.location.href = '/login';
        }

        return Promise.reject(mappedError);
      }
    );
  }

  /**
   * Log error to external service (Sentry, LogRocket, etc.)
   */
  static logToService(error: MappedError, context?: Record<string, any>): void {
    if (import.meta.env.DEV) {
      console.group('Error Log');
      console.error('Status:', error.status);
      console.error('Message:', error.message);
      console.error('User Message:', error.userMessage);
      if (context) {
        console.error('Context:', context);
      }
      console.groupEnd();
    }
  }

  /**
   * Get field-specific error message
   */
  static getFieldError(
    details: Record<string, string[]> | undefined,
    fieldName: string
  ): string | undefined {
    if (!details || !details[fieldName]) {
      return undefined;
    }

    return details[fieldName][0];
  }

  /**
   * Retry failed request with exponential backoff
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on client errors (4xx)
        if (
          axios.isAxiosError(error) &&
          error.response?.status &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          throw error;
        }

        // Wait before retrying
        if (i < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, i);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }
}

export default ErrorHandler;
