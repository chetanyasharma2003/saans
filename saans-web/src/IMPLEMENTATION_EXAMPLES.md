# Error Handling Implementation Examples

This document provides practical examples of how to use the error handling system in the SAANS Mental Health Platform.

## Quick Start

The error handling system is already set up globally in `App.tsx`. You can start using it immediately:

```tsx
import { useToast } from './components';
```

## Example 1: API Call with Error Handling

### Using the apiClient Helper

```tsx
import { useToast } from './components';
import { apiClient } from './services/apiClient';
import ErrorHandler from './services/errorHandler';
import { useState, useEffect } from 'react';

export default function TherapistList() {
  const toast = useToast();
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      // apiClient automatically handles errors and maps them
      const data = await apiClient.get('/api/therapists');
      setTherapists(data);
      toast.success('Therapists loaded successfully!', 2000);
    } catch (error) {
      // error is already a MappedError from apiClient
      const mappedError = error as any;
      toast.error(mappedError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchTherapists} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh'}
      </button>
      {/* Display therapists */}
    </div>
  );
}
```

## Example 2: Form Submission with Validation

```tsx
import { useToast } from './components';
import { apiClient } from './services/apiClient';
import ErrorHandler from './services/errorHandler';
import { useState } from 'react';

export default function LoginForm() {
  const toast = useToast();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Optimistic update - reset errors first
      const response = await apiClient.post('/api/auth/login', formData);

      // Success
      toast.success('Login successful!');
      localStorage.setItem('accessToken', response.token);
      // Navigate to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      // Catch validation errors
      const mappedError = error as any;

      if (mappedError.details) {
        // Has field-specific validation errors
        const fieldErrors = ErrorHandler.handleValidationError(mappedError.details);
        setErrors(fieldErrors);
        toast.warning('Please check the highlighted fields');
      } else {
        // General error
        toast.error(mappedError.userMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      {errors.email && <span className="text-red-400">{errors.email}</span>}

      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      {errors.password && <span className="text-red-400">{errors.password}</span>}

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## Example 3: Data Fetch with Retry Logic

```tsx
import { useToast } from './components';
import ErrorHandler from './services/errorHandler';
import { apiClient } from './services/apiClient';
import { useState } from 'react';

export default function MoodTracker() {
  const toast = useToast();
  const [moodData, setMoodData] = useState(null);

  const fetchMoodDataWithRetry = async () => {
    try {
      // Retry with exponential backoff (max 3 attempts)
      const data = await ErrorHandler.retryWithBackoff(
        () => apiClient.get('/api/mood/entries'),
        3, // max retries
        1000 // initial delay in ms
      );
      setMoodData(data);
      toast.success('Mood data loaded!', 2000);
    } catch (error) {
      const mappedError = error as any;
      toast.error(mappedError.userMessage);
    }
  };

  return (
    <button onClick={fetchMoodDataWithRetry}>
      Load Mood Data
    </button>
  );
}
```

## Example 4: Wrapping Critical Sections with Error Boundary

```tsx
import { ErrorBoundary } from './components';
import { useToast } from './components';

export default function CriticalFeature() {
  const toast = useToast();

  return (
    <ErrorBoundary
      onReset={() => {
        toast.info('Resetting component...');
        // Any cleanup logic
      }}
    >
      <YourCriticalComponent />
    </ErrorBoundary>
  );
}
```

## Example 5: Toast Notifications Patterns

```tsx
import { useToast } from './components';

export default function NotificationExamples() {
  const toast = useToast();

  return (
    <div>
      {/* Success */}
      <button onClick={() => toast.success('Profile updated successfully!')}>
        Show Success
      </button>

      {/* Error with custom duration */}
      <button onClick={() => toast.error('Failed to update profile', 5000)}>
        Show Error (5s)
      </button>

      {/* Warning */}
      <button onClick={() => toast.warning('You have unsaved changes')}>
        Show Warning
      </button>

      {/* Info */}
      <button onClick={() => toast.info('New message from therapist')}>
        Show Info
      </button>

      {/* No auto-dismiss (0 duration) */}
      <button onClick={() => toast.error('Critical error - manual dismiss only', 0)}>
        Show Critical Error
      </button>
    </div>
  );
}
```

## Example 6: Async Data Mutation with Toast

```tsx
import { useToast } from './components';
import { apiClient } from './services/apiClient';
import ErrorHandler from './services/errorHandler';
import { useState } from 'react';

export default function ProfileForm() {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (profileData: any) => {
    setIsSaving(true);

    try {
      const updated = await apiClient.patch('/api/profile', profileData);

      // Show success with optimistic UI update
      toast.success('Profile saved successfully!', 2000);

      // Update local state with server response
      return updated;
    } catch (error) {
      const mappedError = error as any;

      // Determine toast type based on error
      if (mappedError.status === 429) {
        // Rate limited
        toast.warning(mappedError.userMessage);
      } else if (mappedError.status >= 500) {
        // Server error
        toast.error('Server error. Please try again later.');
      } else {
        // Other errors
        toast.error(mappedError.userMessage);
      }

      // Log error for debugging
      ErrorHandler.logToService(mappedError, {
        action: 'saveProfile',
        profileData,
        timestamp: new Date().toISOString(),
      });

      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button onClick={() => handleSaveProfile({})} disabled={isSaving}>
      {isSaving ? 'Saving...' : 'Save Profile'}
    </button>
  );
}
```

## Example 7: Batch Operations with Error Handling

```tsx
import { useToast } from './components';
import { apiClient } from './services/apiClient';
import ErrorHandler from './services/errorHandler';

export default function BulkMoodEntry() {
  const toast = useToast();

  const submitBulkMoodEntries = async (entries: any[]) => {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const entry of entries) {
      try {
        await apiClient.post('/api/mood/entries', entry);
        results.successful++;
      } catch (error) {
        const mappedError = error as any;
        results.failed++;
        results.errors.push(mappedError.userMessage);
      }
    }

    // Show summary
    if (results.failed === 0) {
      toast.success(`All ${results.successful} entries saved!`);
    } else if (results.successful > 0) {
      toast.warning(
        `${results.successful} saved, ${results.failed} failed`
      );
    } else {
      toast.error(`Failed to save entries: ${results.errors[0]}`);
    }

    return results;
  };

  return <button onClick={() => submitBulkMoodEntries([])}>Submit</button>;
}
```

## Example 8: API Error Type Checking

```tsx
import { useToast } from './components';
import { apiClient } from './services/apiClient';
import ErrorHandler, { MappedError } from './services/errorHandler';

export default function AuthenticatedRequest() {
  const toast = useToast();

  const handleRequest = async () => {
    try {
      const data = await apiClient.get('/api/protected-resource');
      console.log('Success:', data);
    } catch (error) {
      const mappedError = error as MappedError;

      // Handle specific error types
      if (mappedError.status === 401) {
        // Authentication expired
        toast.error('Your session has expired. Please log in again.');
        window.location.href = '/login';
      } else if (mappedError.status === 403) {
        // Permission denied
        toast.error('You do not have permission to access this resource.');
      } else if (mappedError.status === 404) {
        // Not found
        toast.warning('The requested resource was not found.');
      } else if (mappedError.status >= 500) {
        // Server error
        toast.error('Server error. Please try again later.');
      } else {
        // Generic error
        toast.error(mappedError.userMessage);
      }
    }
  };

  return <button onClick={handleRequest}>Make Request</button>;
}
```

## Example 9: Custom Error Handler Hook

```tsx
import { useToast } from './components';
import ErrorHandler, { MappedError } from './services/errorHandler';
import { useCallback } from 'react';

/**
 * Custom hook for handling errors with logging
 */
export function useErrorHandler() {
  const toast = useToast();

  const handleError = useCallback(
    (error: unknown, context: string = 'Unknown') => {
      const mappedError = ErrorHandler.mapApiError(error);

      // Show user-friendly message
      toast.error(mappedError.userMessage);

      // Log for debugging
      ErrorHandler.logToService(mappedError, {
        context,
        timestamp: new Date().toISOString(),
      });

      return mappedError;
    },
    [toast]
  );

  return { handleError };
}

// Usage
export default function MyComponent() {
  const { handleError } = useErrorHandler();

  const fetchData = async () => {
    try {
      // ... fetch data
    } catch (error) {
      handleError(error, 'fetchData');
    }
  };

  return <button onClick={fetchData}>Load Data</button>;
}
```

## Example 10: Network Status Handling

```tsx
import { useToast } from './components';
import { apiClient } from './services/apiClient';
import ErrorHandler from './services/errorHandler';
import { useEffect, useState } from 'react';

export default function NetworkAwareComponent() {
  const toast = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online!', 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('No internet connection');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleRequest = async () => {
    if (!isOnline) {
      toast.error(ErrorHandler.handleNetworkError().userMessage);
      return;
    }

    try {
      const data = await apiClient.get('/api/data');
      toast.success('Data loaded!');
    } catch (error) {
      const mappedError = error as any;
      toast.error(mappedError.userMessage);
    }
  };

  return (
    <button onClick={handleRequest} disabled={!isOnline}>
      {isOnline ? 'Load Data' : 'No Connection'}
    </button>
  );
}
```

## Best Practices Summary

1. **Always use apiClient** - It automatically handles errors and auth tokens
2. **Show toast messages** - Provide user feedback for all operations
3. **Handle validation errors** - Map field errors for form feedback
4. **Use ErrorBoundary** - Wrap critical sections to catch render errors
5. **Log errors** - Use ErrorHandler.logToService for debugging
6. **Check error status** - Handle 401, 403, 404, 429 differently
7. **Retry on failure** - Use exponential backoff for network errors
8. **Be descriptive** - Log context information with errors
9. **Never expose sensitive data** - Keep error messages generic
10. **Test error flows** - Always test error scenarios in development
