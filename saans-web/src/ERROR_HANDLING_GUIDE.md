# Error Handling Guide

This guide explains how to use the error handling components and services in the Saans Mental Health Platform.

## Overview

The error handling system consists of three main components:

1. **ErrorBoundary** - Catches React component errors
2. **Toast** - Display notifications (success, error, warning, info)
3. **ErrorHandler** - Global error handler for API and network errors

## 1. ErrorBoundary Component

The ErrorBoundary catches all React errors in child components and displays a user-friendly error page.

### Setup

The ErrorBoundary is already wrapped around the entire app in `App.tsx`:

```tsx
<ErrorBoundary>
  <Provider store={store}>
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  </Provider>
</ErrorBoundary>
```

### Features

- Catches React component errors
- Displays user-friendly error UI
- Shows error details in development mode
- Provides "Try Again" and "Go Home" buttons
- Logs errors to console for debugging
- Automatic page reload on retry

### Wrapping Specific Sections

You can also wrap specific sections with ErrorBoundary:

```tsx
import ErrorBoundary from './components/ErrorBoundary';

export default function MyPage() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

With custom reset handler:

```tsx
<ErrorBoundary onReset={() => {
  // Reset state or refetch data
  console.log('Error boundary reset');
}}>
  <YourComponent />
</ErrorBoundary>
```

## 2. Toast Notifications

Toast notifications display temporary messages to users. The ToastProvider is already wrapped around the app.

### Using Toast

Import and use the `useToast` hook in any component:

```tsx
import { useToast } from './components/Toast';

export default function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };

  const handleError = () => {
    toast.error('Something went wrong. Please try again.');
  };

  const handleWarning = () => {
    toast.warning('This action cannot be undone.');
  };

  const handleInfo = () => {
    toast.info('Here is some useful information.');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

### Toast Methods

- `toast.success(message, duration?)` - Show success notification
- `toast.error(message, duration?)` - Show error notification
- `toast.warning(message, duration?)` - Show warning notification
- `toast.info(message, duration?)` - Show info notification
- `toast.addToast(message, type, duration?)` - Generic add toast
- `toast.removeToast(id)` - Remove a specific toast

### Parameters

- `message` (string) - The notification message
- `duration` (number, optional) - Duration in milliseconds before auto-dismiss (default: 3000)
  - Set to 0 to disable auto-dismiss

### Examples

```tsx
// Show success with 2 second duration
toast.success('Profile updated!', 2000);

// Show error that doesn't auto-dismiss
toast.error('Failed to save. Please try again.', 0);

// Show warning with default duration
toast.warning('You have unsaved changes');
```

## 3. ErrorHandler Service

The ErrorHandler service maps API errors to user-friendly messages and handles error logging.

### Basic Usage

```tsx
import ErrorHandler, { MappedError } from './services/errorHandler';

// Map an error
const mappedError = ErrorHandler.mapApiError(error);
console.log(mappedError.userMessage); // User-friendly message
console.log(mappedError.status); // HTTP status code
```

### With API Calls

```tsx
import { useToast } from './components/Toast';
import ErrorHandler from './services/errorHandler';
import axios from 'axios';

export default function MyComponent() {
  const toast = useToast();

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/data');
      toast.success('Data loaded successfully!');
      return response.data;
    } catch (error) {
      const mappedError = ErrorHandler.mapApiError(error);
      toast.error(mappedError.userMessage);
    }
  };

  return <button onClick={fetchData}>Load Data</button>;
}
```

### Setup Axios Interceptor

Setup global error handling for all axios requests:

```tsx
import axios from 'axios';
import ErrorHandler from './services/errorHandler';
import { useToast } from './components/Toast';

// In your API setup file
export const setupApiErrorHandling = (toast: ReturnType<typeof useToast>) => {
  ErrorHandler.setupInterceptor(axios, (error) => {
    // Handle error globally
    toast.error(error.userMessage);

    // Log to error tracking service
    ErrorHandler.logToService(error, {
      url: error.originalError?.message,
      timestamp: new Date().toISOString(),
    });
  });
};
```

### Handle Validation Errors

```tsx
try {
  await submitForm(data);
} catch (error) {
  const mappedError = ErrorHandler.mapApiError(error);

  if (mappedError.details) {
    const fieldErrors = ErrorHandler.handleValidationError(mappedError.details);
    // fieldErrors = { email: 'Email already exists', name: 'Name is required' }
    setFieldErrors(fieldErrors);
  }

  toast.error(mappedError.userMessage);
}
```

### Get Field-Specific Error

```tsx
const emailError = ErrorHandler.getFieldError(
  mappedError.details,
  'email'
);

if (emailError) {
  // Display field error
}
```

### Retry with Exponential Backoff

```tsx
const fetchWithRetry = async () => {
  try {
    const data = await ErrorHandler.retryWithBackoff(
      () => axios.get('/api/data'),
      3, // max retries
      1000 // initial delay in ms
    );
    toast.success('Data loaded successfully!');
    return data;
  } catch (error) {
    const mappedError = ErrorHandler.mapApiError(error);
    toast.error(mappedError.userMessage);
  }
};
```

### Log to Error Tracking Service

```tsx
// Implement custom logging in ErrorHandler.logToService()
ErrorHandler.logToService(mappedError, {
  userId: currentUser.id,
  page: 'DashboardPage',
  action: 'fetchDashboard',
});
```

## Error Type Mapping

The ErrorHandler maps HTTP status codes to user-friendly messages:

| Status | User Message |
|--------|-------------|
| 400 | Invalid request. Please check your input and try again. |
| 401 | Your session has expired. Please log in again. |
| 403 | You do not have permission to perform this action. |
| 404 | The requested resource was not found. |
| 409 | This action conflicts with existing data. Please try again. |
| 422 | The data you provided is invalid. Please check and try again. |
| 429 | Too many requests. Please wait a moment and try again. |
| 500+ | Server error. Please try again later. |

## Common Patterns

### Pattern 1: Form Submission with Validation

```tsx
import { useToast } from './components/Toast';
import ErrorHandler from './services/errorHandler';

export default function LoginForm() {
  const toast = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (formData) => {
    try {
      const response = await axios.post('/api/auth/login', formData);
      toast.success('Login successful!');
      // Navigate to dashboard
    } catch (error) {
      const mappedError = ErrorHandler.mapApiError(error);

      if (mappedError.details) {
        setErrors(ErrorHandler.handleValidationError(mappedError.details));
      } else {
        toast.error(mappedError.userMessage);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with error display */}
    </form>
  );
}
```

### Pattern 2: Data Fetching with Error Handling

```tsx
import { useToast } from './components/Toast';
import ErrorHandler from './services/errorHandler';

export default function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/data');
      setData(response.data);
      toast.success('Data loaded!', 2000);
    } catch (error) {
      const mappedError = ErrorHandler.mapApiError(error);
      toast.error(mappedError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Load Data'}
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

### Pattern 3: Global Error Boundary with Toast

```tsx
import ErrorBoundary from './components/ErrorBoundary';
import { useToast } from './components/Toast';

// Wrap critical sections
export default function CriticalFeature() {
  const toast = useToast();

  return (
    <ErrorBoundary onReset={() => {
      toast.info('Resetting component...');
    }}>
      <YourCriticalComponent />
    </ErrorBoundary>
  );
}
```

## Best Practices

1. **Always show user-friendly messages** - Use the mapped error messages from ErrorHandler
2. **Log errors for debugging** - Log to console in development, to service in production
3. **Provide context** - Include relevant information in error logs
4. **Validate on frontend** - Prevent unnecessary API calls with form validation
5. **Handle 401 errors** - Automatically redirect to login on authentication failures
6. **Retry on network errors** - Use exponential backoff for transient failures
7. **Show appropriate toast types** - Use success, error, warning, and info appropriately
8. **Never expose sensitive data** - Keep user-friendly messages generic for security
9. **Test error scenarios** - Always test error handling in development
10. **Keep error messages concise** - Long messages are harder to read on mobile

## Development vs Production

In **development mode**, the ErrorBoundary shows:
- Full error message
- Component stack trace
- Error details

In **production mode**, the ErrorBoundary shows:
- Generic error message
- Support contact info
- Recovery options only

## Customization

### Custom Error Messages

Extend `ErrorHandler.getUserMessage()` to add custom mappings:

```tsx
private static getUserMessage(status: number, apiMessage: string): string {
  const customMessages: Record<number, string> = {
    600: 'Custom business error message',
    ...
  };

  return customMessages[status] || 'An unexpected error occurred.';
}
```

### Custom Toast Styling

Modify toast styles in `Toast.tsx` component:

```tsx
// Update getStyles() method with your custom colors
const getStyles = () => {
  switch (toast.type) {
    case 'success':
      return {
        bg: 'bg-green-500/20', // Your custom color
        border: 'border-green-500/30',
        // ...
      };
  }
};
```

### Custom Error Boundary UI

Modify the ErrorBoundary render method in `ErrorBoundary.tsx` to customize the error display UI.

## Troubleshooting

### Toast not showing?
- Ensure `ToastProvider` wraps your components in `App.tsx`
- Check if toast is being dismissed too quickly (adjust duration)
- Verify `useToast` is called within a component wrapped by `ToastProvider`

### ErrorBoundary not catching errors?
- ErrorBoundary only catches errors in render/lifecycle methods
- It doesn't catch event handler errors (use try-catch)
- It doesn't catch async errors (use Promise.catch or try-catch in async functions)

### Not seeing error details in development?
- Check browser console for logged errors
- Verify `NODE_ENV === 'development'` is true
- Look for error boundary component stack trace

## File Locations

- **ErrorBoundary**: `/src/components/ErrorBoundary.tsx`
- **Toast**: `/src/components/Toast.tsx`
- **ErrorHandler**: `/src/services/errorHandler.ts`
- **App Setup**: `/src/App.tsx`
