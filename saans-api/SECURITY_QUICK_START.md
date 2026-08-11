# Security Quick Start Guide

## For Backend (API)

### Already Implemented ✓
Everything is built into the API. No changes needed. Just:

1. **Set Environment Variables**
   ```bash
   NODE_ENV=production
   JWT_SECRET=<change-from-default>
   CORS_ORIGIN=https://your-frontend.com
   FRONTEND_URL=https://your-frontend.com
   TRUST_PROXY=true  # If behind reverse proxy
   ```

2. **Start API**
   ```bash
   npm run build
   npm start
   ```

3. **Security Validation**
   - API validates JWT_SECRET on startup
   - Fails if using development defaults in production
   - All security headers automatically added to responses

---

## For Frontend (React/Vue/Angular)

### 1. Install HTTP Client (if not using fetch)
```bash
npm install axios  # or keep using fetch API
```

### 2. Create CSRF Token Manager

**React Example:**
```typescript
// utils/csrfToken.ts
export class CSRFTokenManager {
  private static tokenKey = 'csrfToken';

  static async initializeToken() {
    try {
      const response = await fetch('http://api.example.com/api/appointments', {
        method: 'GET',
        credentials: 'include'
      });
      const token = response.headers.get('X-CSRF-Token');
      if (token) {
        localStorage.setItem(this.tokenKey, token);
      }
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }

  static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  static clearToken() {
    localStorage.removeItem(this.tokenKey);
  }
}
```

### 3. Initialize Token on App Load

**React App Component:**
```typescript
import { useEffect } from 'react';
import { CSRFTokenManager } from './utils/csrfToken';

function App() {
  useEffect(() => {
    CSRFTokenManager.initializeToken();
  }, []);

  return <YourApp />;
}
```

### 4. Use in API Calls

**Fetch API:**
```typescript
const response = await fetch('http://api.example.com/api/appointments', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': CSRFTokenManager.getToken() || ''
  },
  body: JSON.stringify({
    therapistId: '123',
    date: '2024-12-20'
  })
});

if (response.status === 403) {
  // Token expired or invalid - re-initialize
  CSRFTokenManager.initializeToken();
}
```

**Axios:**
```typescript
import axios from 'axios';
import { CSRFTokenManager } from './utils/csrfToken';

const apiClient = axios.create({
  baseURL: 'http://api.example.com',
  withCredentials: true
});

// Add CSRF token to all requests
apiClient.interceptors.request.use((config) => {
  const token = CSRFTokenManager.getToken();
  if (token && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
    config.headers['X-CSRF-Token'] = token;
  }
  return config;
});

// Handle token expiry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 && error.response?.data?.code === 'CSRF_TOKEN_INVALID') {
      // Re-initialize token and retry
      CSRFTokenManager.initializeToken();
    }
    throw error;
  }
);

export default apiClient;
```

### 5. Handle Rate Limiting

**Rate Limit Error Handler:**
```typescript
async function handleRateLimit(response: Response) {
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
    console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
    
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return fetch(response.url, response); // Retry original request
  }
  return response;
}
```

### 6. Display Security-Related Messages

```typescript
const errorMessages = {
  CSRF_TOKEN_MISSING: 'Session expired. Please refresh the page.',
  CSRF_TOKEN_INVALID: 'Security verification failed. Please try again.',
  INVALID_INPUT: 'Invalid data submitted. Please check your input.',
  TOO_MANY_REQUESTS: 'Too many requests. Please wait before trying again.'
};

function showError(response: Response) {
  const data = response.json();
  const code = data.code || 'UNKNOWN_ERROR';
  const message = errorMessages[code] || 'An error occurred. Please try again.';
  
  // Show to user (toast, alert, etc.)
  notificationService.error(message);
}
```

---

## Common Workflows

### Login Flow
```typescript
async function login(email: string, password: string) {
  // No CSRF token needed for login (public endpoint)
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (response.ok) {
    const { token } = await response.json();
    localStorage.setItem('authToken', token);
    
    // Initialize CSRF token
    CSRFTokenManager.initializeToken();
  }
}
```

### Create Appointment
```typescript
async function createAppointment(therapistId: string, date: string) {
  const response = await fetch('/api/appointments', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': CSRFTokenManager.getToken() || '',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({ therapistId, date })
  });

  if (response.status === 403) {
    // Re-initialize CSRF token on failure
    CSRFTokenManager.initializeToken();
    throw new Error('Security verification failed');
  }

  return response.json();
}
```

### Update Profile
```typescript
async function updateProfile(data: ProfileData) {
  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': CSRFTokenManager.getToken() || '',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(data)
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    throw new Error(`Please wait ${retryAfter} seconds before trying again`);
  }

  return response.json();
}
```

---

## Security Headers (Automatic)

These are automatically sent by the API. No action needed on frontend:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
X-DNS-Prefetch-Control: off
Cache-Control: no-store, no-cache, must-revalidate
Content-Security-Policy: ...
Strict-Transport-Security: ... (production only)
Permissions-Policy: ...
X-Request-ID: <unique-id>
```

---

## Testing Security

### Test CSRF Protection
```bash
# Get token from GET request
curl -i http://localhost:3000/api/appointments

# Note X-CSRF-Token header value

# Use token in POST
curl -X POST http://localhost:3000/api/appointments \
  -H "X-CSRF-Token: <token>" \
  -H "Content-Type: application/json" \
  -d '{"therapistId":"123"}'
```

### Test Rate Limiting
```bash
# Send 150 requests quickly
for i in {1..150}; do
  curl http://localhost:3000/health
done

# Should get 429 after 100 requests
```

### Test Security Headers
```bash
curl -i http://localhost:3000/health
```

Check for:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy: ...`

---

## Troubleshooting

### "CSRF token missing" (403)
**Solution:** Call GET endpoint first to get token
```typescript
await fetch('/api/appointments', { method: 'GET' });
// Token is now in response headers
```

### "CSRF token invalid or expired" (403)
**Solution:** Re-initialize token
```typescript
CSRFTokenManager.clearToken();
CSRFTokenManager.initializeToken();
```

### "Too many requests" (429)
**Solution:** Wait for `Retry-After` seconds
```typescript
const retryAfter = response.headers.get('Retry-After');
// Wait retryAfter seconds before retrying
```

### CORS Error in Browser
**Solution:** Check if domain is in `CORS_ORIGIN` env var
```bash
# On backend, verify CORS_ORIGIN includes your frontend domain
echo $CORS_ORIGIN
# Should show: https://frontend-domain.com
```

---

## Best Practices

1. **Always Include Credentials**
   ```typescript
   credentials: 'include'  // Required for CSRF to work
   ```

2. **Handle Token Expiry**
   ```typescript
   if (response.status === 403 && response.data.code === 'CSRF_TOKEN_INVALID') {
     CSRFTokenManager.initializeToken();
     // Retry request
   }
   ```

3. **Implement Exponential Backoff for Rate Limits**
   ```typescript
   let retries = 0;
   const maxRetries = 3;
   const backoff = (attempt) => Math.pow(2, attempt) * 1000;
   ```

4. **Log Security Events**
   ```typescript
   if (response.status === 403 || response.status === 429) {
     console.warn('[SECURITY]', response.status, response.data);
   }
   ```

5. **Never Log Tokens**
   ```typescript
   // BAD
   console.log('Token:', token);
   
   // GOOD
   console.log('Token initialized');
   ```

---

## Environment Setup

### Development
```env
VITE_API_URL=http://localhost:3000
```

### Production
```env
VITE_API_URL=https://api.example.com
```

### Use in Code
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const response = await fetch(`${apiUrl}/api/appointments`);
```

---

## Complete Example Component

```typescript
import { useEffect, useState } from 'react';
import { CSRFTokenManager } from './utils/csrfToken';

function AppointmentForm() {
  const [therapistId, setTherapistId] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    CSRFTokenManager.initializeToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = CSRFTokenManager.getToken();
      if (!token) {
        throw new Error('Security token not available. Please refresh the page.');
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ therapistId, date })
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(`Too many requests. Please wait ${retryAfter} seconds.`);
      }

      if (response.status === 403) {
        CSRFTokenManager.initializeToken();
        throw new Error('Security verification failed. Please try again.');
      }

      if (!response.ok) {
        throw new Error('Failed to create appointment');
      }

      const data = await response.json();
      console.log('Appointment created:', data);
      setTherapistId('');
      setDate('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        value={therapistId}
        onChange={(e) => setTherapistId(e.target.value)}
        placeholder="Therapist ID"
        disabled={loading}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Appointment'}
      </button>
    </form>
  );
}

export default AppointmentForm;
```

---

## Summary

✓ Backend: All security features automatic
✓ Frontend: Add CSRF token manager + include token in requests
✓ Environment: Set security variables
✓ Test: Verify CSRF and rate limiting work

Done! Your API is production-ready with enterprise-grade security.
