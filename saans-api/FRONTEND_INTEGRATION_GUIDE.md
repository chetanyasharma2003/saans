# Frontend Integration Guide - Password Reset & Email Verification

This guide shows how to integrate the new password reset and email verification endpoints in your React frontend.

---

## 📋 Table of Contents

1. [Registration Flow](#registration-flow)
2. [Email Verification Flow](#email-verification-flow)
3. [Password Reset Flow](#password-reset-flow)
4. [Error Handling](#error-handling)
5. [React Components (Examples)](#react-components-examples)
6. [Redux Integration](#redux-integration)
7. [Best Practices](#best-practices)

---

## Registration Flow

### Overview
1. User signs up with email/password
2. Backend sends verification email automatically
3. User clicks link in email
4. Email is marked as verified

### Implementation

```typescript
// authApi.ts or similar
export const registerUser = async (data: RegisterData) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};

// Usage in component
const handleRegister = async (email, password, name) => {
  try {
    const result = await registerUser({ email, password, name });
    
    // Save auth tokens
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    
    // Show verification message
    setMessage('Check your email to verify your account');
    
    // Redirect to verification page or dashboard
    navigate('/verify-email');
  } catch (error) {
    setError(error.message);
  }
};
```

### Frontend Changes
- Show "Check your email" message after registration
- Don't immediately redirect to dashboard
- Offer option to resend verification email
- Show verification status in user profile

---

## Email Verification Flow

### Overview
1. User receives verification email with link
2. Link includes token and email: `/verify-email?token=XXX&email=YYY`
3. Frontend extracts query params and calls verify endpoint
4. Backend marks email as verified
5. User can now access restricted features

### Implementation

```typescript
// verifyEmail.ts
export const verifyEmail = async (token: string, email: string) => {
  const response = await fetch(
    `${API_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};

// VerifyEmailPage.tsx
export const VerifyEmailPage = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token, email);
        setStatus('success');
        setMessage('Email verified successfully!');
        
        // Redirect to login or dashboard after 2 seconds
        setTimeout(() => navigate('/login'), 2000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to verify email');
      }
    };

    verify();
  }, [token, email, navigate]);

  return (
    <div className="verify-email-page">
      {status === 'loading' && <div>Verifying your email...</div>}
      {status === 'success' && <div className="success">{message}</div>}
      {status === 'error' && (
        <div className="error">
          <p>{message}</p>
          <ResendVerificationForm email={email} />
        </div>
      )}
    </div>
  );
};
```

### Resend Verification Email

```typescript
export const resendVerificationEmail = async (email: string) => {
  const response = await fetch(
    `${API_URL}/api/auth/resend-verification`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};

// ResendVerificationForm.tsx
export const ResendVerificationForm = ({ email }: { email: string }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleResend = async () => {
    try {
      setLoading(true);
      await resendVerificationEmail(email);
      setMessage('Verification email resent. Check your inbox.');
      
      // Cooldown: disable resend button for 60 seconds
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) clearInterval(interval);
          return c - 1;
        });
      }, 1000);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleResend}
        disabled={loading || countdown > 0}
      >
        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};
```

---

## Password Reset Flow

### Overview
1. User clicks "Forgot Password" on login page
2. User enters email
3. Backend sends reset email with link
4. User clicks link: `/reset-password?token=XXX&email=YYY`
5. Frontend shows password reset form
6. User submits new password
7. Backend validates token and updates password
8. User redirected to login

### Implementation

```typescript
// resetPasswordApi.ts
export const requestPasswordReset = async (email: string) => {
  const response = await fetch(
    `${API_URL}/api/auth/forgot-password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};

export const resetPassword = async (data: {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response = await fetch(
    `${API_URL}/api/auth/reset-password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};
```

### Forgot Password Page

```typescript
// ForgotPasswordPage.tsx
export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      await requestPasswordReset(email);
      setMessage(
        'Check your email for password reset instructions. ' +
        'The link will expire in 24 hours.'
      );
      
      // Show link to resend after some time
      setTimeout(() => {
        setMessage(m => m + ' (Did not receive it? Check spam folder)');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="forgot-password-form">
      <h2>Forgot Password?</h2>
      <p>Enter your email to receive a password reset link</p>

      <input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={loading}
        required
      />

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <button type="submit" disabled={loading || !!message}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>

      <a href="/login">Back to Login</a>
    </form>
  );
};
```

### Reset Password Page

```typescript
// ResetPasswordPage.tsx
export const ResetPasswordPage = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  if (!token || !email) {
    return (
      <div className="reset-password-page">
        <div className="error-message">
          Invalid reset link. Please request a new password reset.
        </div>
        <a href="/forgot-password">Request New Link</a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await resetPassword({
        token,
        email,
        newPassword,
        confirmPassword,
      });

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      if (error.message.includes('expired')) {
        setError('Reset link has expired. Please request a new one.');
      } else {
        setError(error.message || 'Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="reset-password-form">
      <h2>Reset Your Password</h2>

      {success ? (
        <div className="success-message">
          <p>Password reset successfully!</p>
          <p>Redirecting to login...</p>
        </div>
      ) : (
        <>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={loading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </>
      )}
    </form>
  );
};
```

---

## Error Handling

### Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | Success | Proceed |
| 400 | Invalid input | Show error message |
| 410 | Token expired | Offer to resend/retry |
| 429 | Rate limited | Show "try again later" |

### Error Handling Utility

```typescript
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  details?: any;
}

export const getErrorMessage = (error: ApiError | any): string => {
  if (error instanceof TypeError) {
    return 'Network error. Please check your connection.';
  }

  if (error.statusCode === 400) {
    return error.details?.required
      ? `Missing: ${error.details.required.join(', ')}`
      : error.message;
  }

  if (error.statusCode === 410) {
    return 'Link expired. Please request a new one.';
  }

  if (error.statusCode === 429) {
    return 'Too many requests. Please wait before trying again.';
  }

  return error.message || 'An unexpected error occurred';
};

// Usage
try {
  await verifyEmail(token, email);
} catch (error) {
  const message = getErrorMessage(error);
  setError(message);
}
```

---

## React Components (Examples)

### Complete Auth Context

```typescript
// authContext.ts
import React, { createContext, useState, useCallback } from 'react';

interface AuthContextType {
  user: any;
  accessToken: string | null;
  emailVerified: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  verifyEmail: (token: string, email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (data: ResetData) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  );
  const [emailVerified, setEmailVerified] = useState(false);

  const register = useCallback(async (data: RegisterData) => {
    const result = await registerUser(data);
    setUser(result.user);
    setAccessToken(result.accessToken);
    setEmailVerified(result.user.emailVerified);
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
  }, []);

  const verifyEmail = useCallback(
    async (token: string, email: string) => {
      await verifyEmailAPI(token, email);
      setEmailVerified(true);
    },
    []
  );

  const resetPassword = useCallback(
    async (data: ResetData) => {
      await resetPasswordAPI(data);
      // Password reset successful, user can now login
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setEmailVerified(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        emailVerified,
        register,
        verifyEmail,
        resetPassword,
        logout,
        // ... other methods
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Redux Integration

### Redux Slice (with Redux Toolkit)

```typescript
// authSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface AuthState {
  user: any;
  accessToken: string | null;
  emailVerified: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  emailVerified: false,
  loading: false,
  error: null,
};

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: RegisterData) => {
    const response = await registerUser(data);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response;
  }
);

export const verifyEmailThunk = createAsyncThunk(
  'auth/verifyEmail',
  async ({ token, email }: { token: string; email: string }) => {
    return await verifyEmail(token, email);
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (data: ResetData) => {
    return await resetPassword(data);
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.emailVerified = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.emailVerified = action.payload.user.emailVerified;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      });

    // ... similar for other thunks
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

---

## Best Practices

### 1. Security
```typescript
// ✅ DO: Store tokens securely
localStorage.setItem('accessToken', token); // OK for demo
sessionStorage.setItem('accessToken', token); // More secure

// ❌ DON'T: Store in Redux (persisted to localStorage)
// ❌ DON'T: Log tokens to console
console.log(token); // ❌ Never do this

// ✅ DO: Use secure headers
const headers = new Headers({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});
```

### 2. User Experience
```typescript
// ✅ DO: Show helpful messages
'Check your email to verify your account'
'Reset link has expired. Please request a new one.'

// ❌ DON'T: Show cryptic errors
'Validation failed'
'Invalid token'

// ✅ DO: Implement cooldowns
// Don't allow resend button until 60 seconds have passed

// ✅ DO: Show password strength
const getPasswordStrength = (password: string) => {
  if (password.length < 6) return 'weak';
  if (!/[A-Z]/.test(password)) return 'weak';
  if (!/[0-9]/.test(password)) return 'weak';
  return 'strong';
};
```

### 3. Form Validation
```typescript
// ✅ DO: Validate on submit AND onChange
const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Must be at least 6 characters';
  if (!/[A-Z]/.test(password)) return 'Must include uppercase letter';
  if (!/[0-9]/.test(password)) return 'Must include a number';
  return null;
};

// ✅ DO: Show real-time feedback
<input
  type="password"
  onChange={(e) => {
    setPassword(e.target.value);
    setError(validatePassword(e.target.value));
  }}
/>
{error && <span className="error">{error}</span>}
```

### 4. Accessibility
```typescript
// ✅ DO: Use proper labels and ARIA
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-describedby="email-help"
  required
/>
<p id="email-help">We'll send a verification link to this email</p>

// ✅ DO: Show error messages accessibly
<div role="alert" className="error-message">
  {error}
</div>
```

### 5. Error Recovery
```typescript
// ✅ DO: Provide recovery options
if (error === 'Reset link expired') {
  return (
    <>
      <p>Link expired</p>
      <button onClick={() => navigate('/forgot-password')}>
        Request New Link
      </button>
    </>
  );
}

// ✅ DO: Log errors for debugging
console.error('Reset password failed:', {
  statusCode: error.statusCode,
  message: error.message,
  timestamp: new Date().toISOString(),
});
```

---

## URL Routing

### Recommended Routes

```typescript
// react-router configuration
const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
    // Handles: /verify-email?token=XXX&email=YYY
  },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
    // Handles: /reset-password?token=XXX&email=YYY
  },
  { path: '/dashboard', element: <Dashboard />, loader: requireAuth },
]);
```

---

## Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=SAANS
VITE_SUPPORT_EMAIL=support@saans.app
```

---

## Testing

```typescript
// __tests__/auth.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterPage } from '../pages/RegisterPage';

describe('Registration and Email Verification', () => {
  test('should show verification message after registration', async () => {
    render(<RegisterPage />);
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.click(screen.getByText(/register/i));
    
    await waitFor(() => {
      expect(
        screen.getByText(/check your email/i)
      ).toBeInTheDocument();
    });
  });
});
```

---

## Summary

This guide provides everything needed to integrate password reset and email verification into your React frontend. Follow the best practices and your implementation will be secure, user-friendly, and production-ready.

For API details, refer to: [PASSWORD_RESET_EMAIL_VERIFICATION.md](./src/docs/PASSWORD_RESET_EMAIL_VERIFICATION.md)
