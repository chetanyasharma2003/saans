import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  setUser,
  setToken,
  setLoading,
  setError,
  logout,
  clearError,
} from '../redux/slices/authSlice';
import { store } from '../redux/store';
import { TEST_USER, setupLocalStorage } from '../test/setup';

describe('Redux Utilities', () => {
  beforeEach(() => {
    setupLocalStorage();
    vi.clearAllMocks();
  });

  describe('Auth Slice', () => {
    it('should set user in auth state', () => {
      const initialState = store.getState().auth;

      store.dispatch(setUser(TEST_USER));
      const updatedState = store.getState().auth;

      expect(updatedState.user).toEqual(TEST_USER);
      expect(updatedState.isAuthenticated).toBe(true);
    });

    it('should set token in auth state', () => {
      const token = 'mock-token-xyz';

      store.dispatch(setToken(token));
      const state = store.getState().auth;

      expect(state.token).toBe(token);
      expect(localStorage.getItem('accessToken')).toBe(token);
    });

    it('should set loading state', () => {
      store.dispatch(setLoading(true));
      let state = store.getState().auth;

      expect(state.isLoading).toBe(true);

      store.dispatch(setLoading(false));
      state = store.getState().auth;

      expect(state.isLoading).toBe(false);
    });

    it('should set error message', () => {
      const errorMessage = 'Authentication failed';

      store.dispatch(setError(errorMessage));
      const state = store.getState().auth;

      expect(state.error).toBe(errorMessage);
    });

    it('should clear error message', () => {
      store.dispatch(setError('Some error'));
      expect(store.getState().auth.error).toBe('Some error');

      store.dispatch(clearError());
      expect(store.getState().auth.error).toBeNull();
    });

    it('should logout and clear auth state', () => {
      // First, set user and token
      store.dispatch(setUser(TEST_USER));
      store.dispatch(setToken('test-token'));

      expect(store.getState().auth.isAuthenticated).toBe(true);

      // Then logout
      store.dispatch(logout());
      const state = store.getState().auth;

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('should preserve other state properties when updating user', () => {
      store.dispatch(setUser(TEST_USER));
      store.dispatch(setError('Test error'));

      const state = store.getState().auth;

      expect(state.user).toEqual(TEST_USER);
      expect(state.error).toBe('Test error');
    });
  });

  describe('Validation Utilities', () => {
    it('should validate email format', () => {
      const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      };

      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@domain.co.uk')).toBe(true);
    });

    it('should validate password strength', () => {
      const validatePassword = (password: string) => {
        return password.length >= 6;
      };

      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('123456')).toBe(true);
    });

    it('should validate city selection', () => {
      const indianCities = [
        'Delhi',
        'Mumbai',
        'Bangalore',
        'Hyderabad',
        'Chennai',
      ];

      const validateCity = (city: string) => {
        return indianCities.includes(city);
      };

      expect(validateCity('Delhi')).toBe(true);
      expect(validateCity('Mumbai')).toBe(true);
      expect(validateCity('London')).toBe(false);
    });

    it('should validate phone number format', () => {
      const validatePhone = (phone: string) => {
        const re = /^[\d\s\-\+()]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
      };

      expect(validatePhone('+91-9876543210')).toBe(true);
      expect(validatePhone('9876543210')).toBe(true);
      expect(validatePhone('123')).toBe(false);
    });
  });

  describe('Date/Time Formatting Utilities', () => {
    it('should format date to readable format', () => {
      const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(date);
      };

      const testDate = new Date('2024-01-15');
      const formatted = formatDate(testDate);

      expect(formatted).toContain('2024');
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
    });

    it('should format time to readable format', () => {
      const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);
      };

      const testDate = new Date('2024-01-15T14:30:00');
      const formatted = formatTime(testDate);

      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('should calculate relative time', () => {
      const getRelativeTime = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return 'long ago';
      };

      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

      expect(getRelativeTime(fiveMinutesAgo)).toContain('5 minute');
    });

    it('should format time duration', () => {
      const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0) parts.push(`${secs}s`);

        return parts.join(' ');
      };

      expect(formatDuration(3661)).toBe('1h 1m 1s');
      expect(formatDuration(300)).toBe('5m');
      expect(formatDuration(45)).toBe('45s');
    });
  });

  describe('Data Transformation Utilities', () => {
    it('should transform therapist list response', () => {
      const transformTherapistResponse = (data: any) => {
        return data.therapists.map((therapist: any) => ({
          id: therapist.id,
          name: therapist.name,
          specialization: therapist.specialization,
          imageUrl: therapist.image,
          location: therapist.city,
          rating: therapist.rating,
          reviewCount: therapist.reviews,
          pricePerHour: therapist.hourlyRate,
          isAvailable: therapist.availability,
        }));
      };

      const mockResponse = {
        therapists: [
          {
            id: '101',
            name: 'Dr. John',
            specialization: 'Anxiety',
            image: 'https://example.com/john.jpg',
            city: 'Delhi',
            rating: 4.8,
            reviews: 45,
            hourlyRate: 500,
            availability: true,
          },
        ],
      };

      const transformed = transformTherapistResponse(mockResponse);

      expect(transformed[0].id).toBe('101');
      expect(transformed[0].name).toBe('Dr. John');
      expect(transformed[0].imageUrl).toBe('https://example.com/john.jpg');
    });

    it('should transform mood entry response', () => {
      const transformMoodResponse = (data: any) => {
        return {
          id: data.id,
          mood: data.mood,
          intensity: data.intensity,
          date: new Date(data.date),
          notes: data.notes,
        };
      };

      const mockResponse = {
        id: '1',
        mood: 'happy',
        intensity: 8,
        date: '2024-01-15T10:00:00Z',
        notes: 'Had a great day',
      };

      const transformed = transformMoodResponse(mockResponse);

      expect(transformed.mood).toBe('happy');
      expect(transformed.intensity).toBe(8);
      expect(transformed.date instanceof Date).toBe(true);
    });

    it('should transform appointment response', () => {
      const transformAppointmentResponse = (data: any) => {
        return {
          id: data.id,
          therapistId: data.therapistId,
          userId: data.userId,
          appointmentDate: new Date(data.date),
          appointmentTime: data.time,
          status: data.status,
          notes: data.notes,
        };
      };

      const mockResponse = {
        id: '1',
        therapistId: '101',
        userId: '1',
        date: '2024-01-15',
        time: '10:00',
        status: 'confirmed',
        notes: 'First session',
      };

      const transformed = transformAppointmentResponse(mockResponse);

      expect(transformed.id).toBe('1');
      expect(transformed.status).toBe('confirmed');
      expect(transformed.appointmentDate instanceof Date).toBe(true);
    });
  });

  describe('String Utilities', () => {
    it('should capitalize first letter', () => {
      const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
      };

      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('WORLD');
    });

    it('should truncate long strings', () => {
      const truncate = (str: string, length: number) => {
        return str.length > length ? str.slice(0, length) + '...' : str;
      };

      const longText = 'This is a very long text that should be truncated';
      expect(truncate(longText, 20)).toBe('This is a very long ...');
      expect(truncate('short', 20)).toBe('short');
    });

    it('should join array as readable list', () => {
      const formatList = (items: string[]) => {
        if (items.length === 0) return '';
        if (items.length === 1) return items[0];
        return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
      };

      expect(formatList(['apple'])).toBe('apple');
      expect(formatList(['apple', 'banana'])).toBe('apple and banana');
      expect(formatList(['apple', 'banana', 'cherry'])).toBe('apple, banana and cherry');
    });
  });

  describe('Number Utilities', () => {
    it('should format currency', () => {
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);
      };

      expect(formatCurrency(500)).toContain('500');
      expect(formatCurrency(1000)).toContain('1,000');
    });

    it('should format rating', () => {
      const formatRating = (rating: number) => {
        return Math.round(rating * 10) / 10;
      };

      expect(formatRating(4.85)).toBe(4.9);
      expect(formatRating(4.84)).toBe(4.8);
    });

    it('should calculate average', () => {
      const calculateAverage = (numbers: number[]) => {
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
      };

      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
      expect(calculateAverage([10, 20])).toBe(15);
    });
  });

  describe('Array Utilities', () => {
    it('should remove duplicates', () => {
      const removeDuplicates = (arr: string[]) => {
        return [...new Set(arr)];
      };

      expect(removeDuplicates(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
      expect(removeDuplicates(['x', 'y', 'z'])).toEqual(['x', 'y', 'z']);
    });

    it('should chunk array', () => {
      const chunkArray = (arr: any[], size: number) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
          chunks.push(arr.slice(i, i + size));
        }
        return chunks;
      };

      expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunkArray(['a', 'b', 'c'], 2)).toEqual([['a', 'b'], ['c']]);
    });

    it('should flatten nested array', () => {
      const flattenArray = (arr: any[]): any[] => {
        return arr.reduce((flat, item) => {
          return flat.concat(Array.isArray(item) ? flattenArray(item) : item);
        }, []);
      };

      expect(flattenArray([1, [2, 3, [4, 5]]])).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('Object Utilities', () => {
    it('should merge objects', () => {
      const mergeObjects = (obj1: any, obj2: any) => {
        return { ...obj1, ...obj2 };
      };

      const result = mergeObjects({ a: 1, b: 2 }, { b: 3, c: 4 });
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should deep clone object', () => {
      const deepClone = (obj: any) => {
        return JSON.parse(JSON.stringify(obj));
      };

      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
    });

    it('should pick specific properties from object', () => {
      const pickProperties = (obj: any, keys: string[]) => {
        return keys.reduce((result, key) => {
          if (key in obj) {
            result[key] = obj[key];
          }
          return result;
        }, {} as any);
      };

      const obj = { a: 1, b: 2, c: 3, d: 4 };
      expect(pickProperties(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('Error Handling Utilities', () => {
    it('should extract error message from response', () => {
      const getErrorMessage = (error: any) => {
        if (typeof error === 'string') return error;
        if (error.response?.data?.message) return error.response.data.message;
        if (error.response?.data?.error) return error.response.data.error;
        if (error.message) return error.message;
        return 'An unknown error occurred';
      };

      const apiError = {
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      };

      expect(getErrorMessage(apiError)).toBe('Invalid credentials');
      expect(getErrorMessage('Simple error')).toBe('Simple error');
      expect(getErrorMessage({})).toBe('An unknown error occurred');
    });

    it('should check if error is network error', () => {
      const isNetworkError = (error: any) => {
        return !error.response;
      };

      expect(isNetworkError({})).toBe(true);
      expect(isNetworkError({ response: {} })).toBe(false);
    });

    it('should check if error is server error', () => {
      const isServerError = (error: any) => {
        return error.response?.status >= 500;
      };

      expect(isServerError({ response: { status: 500 } })).toBe(true);
      expect(isServerError({ response: { status: 400 } })).toBe(false);
    });
  });
});
