import { useEffect, useState } from 'react';
import { authService } from '../services/authService';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth from stored tokens
    authService.initializeAuth();
    setIsAuthenticated(authService.isAuthenticated());
    setIsLoading(false);
  }, []);

  const logout = () => {
    authService.clearTokens();
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
    authService
  };
}
