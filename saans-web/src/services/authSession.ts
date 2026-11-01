import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type AuthError = {
  code?: string;
  error?: string;
};

let refreshRequest: Promise<string | null> | null = null;
const retriedRequests = new WeakSet<InternalAxiosRequestConfig>();

const isAuthRequest = (url = '') =>
  /\/api\/auth\/(login|register|refresh)(?:$|[?#])/.test(url);

const clearSessionAndRedirect = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.assign('/login?session=expired');
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) return null;

  refreshRequest ??= axios
    .post(
      `${API_URL}/api/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    .then(({ data }) => {
      if (typeof data.token !== 'string' || data.token.length === 0) {
        throw new Error('Token refresh response did not contain a token');
      }

      localStorage.setItem('accessToken', data.token);
      return data.token;
    })
    .catch(() => {
      console.warn('Session refresh failed; signing out.');
      return null;
    })
    .finally(() => {
      refreshRequest = null;
    });

  return refreshRequest;
};

axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<AuthError>) => {
    const config = error.config as InternalAxiosRequestConfig | undefined;
    const responseData = error.response?.data;
    const isExpiredToken = error.response?.status === 401 && responseData?.code === 'TOKEN_EXPIRED';
    const isInvalidSession =
      (error.response?.status === 401 && responseData?.error === 'No token provided') ||
      (error.response?.status === 403 && responseData?.error === 'Invalid token');

    if (!config || isAuthRequest(config.url) || retriedRequests.has(config)) {
      return Promise.reject(error);
    }

    if (isExpiredToken) {
      retriedRequests.add(config);
      const newToken = await refreshAccessToken();
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        return axios(config);
      }

      clearSessionAndRedirect();
    } else if (isInvalidSession) {
      clearSessionAndRedirect();
    }

    return Promise.reject(error);
  }
);
