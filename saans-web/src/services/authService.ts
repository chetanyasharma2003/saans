import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Token refresh interval (refresh 5 minutes before expiry)
let refreshInterval: NodeJS.Timeout | null = null;
const TOKEN_REFRESH_INTERVAL = 6 * 60 * 1000; // 6 minutes

// Store token in localStorage
const setTokens = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  // Set auth header
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

  // Start auto-refresh
  startAutoRefresh();
};

// Get tokens from localStorage
const getTokens = () => ({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken')
});

// Clear tokens
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  delete apiClient.defaults.headers.common['Authorization'];
  stopAutoRefresh();
};

// Refresh access token
const refreshAccessToken = async () => {
  try {
    const { refreshToken } = getTokens();

    if (!refreshToken) {
      return false;
    }

    const response = await axios.post(`${API_URL}/api/auth/refresh`,
      { refreshToken },
      { withCredentials: true }
    );

    if (response.data.token) {
      setTokens(response.data.token);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearTokens();
    return false;
  }
};

// Auto-refresh token before expiry
const startAutoRefresh = () => {
  stopAutoRefresh(); // Clear any existing interval

  refreshInterval = setInterval(async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      await refreshAccessToken();
    }
  }, TOKEN_REFRESH_INTERVAL);
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken');
};

// Initialize auth from stored tokens
const initializeAuth = () => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    startAutoRefresh();
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const token = localStorage.getItem('accessToken');
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } else {
        clearTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  setTokens,
  getTokens,
  clearTokens,
  refreshAccessToken,
  isAuthenticated,
  initializeAuth,
  apiClient
};
