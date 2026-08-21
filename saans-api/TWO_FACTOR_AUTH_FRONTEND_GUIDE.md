# 2FA Frontend Integration Guide

## Overview

This guide helps frontend developers integrate the 2FA system into the SAANS web application. The 2FA flow consists of two main scenarios: login and account management.

## Login Flow

### Standard Login (No 2FA)

```javascript
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!data.requiresTwoFactor) {
    // User doesn't have 2FA enabled
    localStorage.setItem('accessToken', data.accessToken);
    navigateTo('/dashboard');
  }
}
```

### Login with 2FA Required

```javascript
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.requiresTwoFactor) {
    // Store temporary session data
    sessionStorage.setItem('2faSessionToken', data.sessionToken);
    sessionStorage.setItem('2faUserId', data.user.id);
    sessionStorage.setItem('2faUserEmail', data.user.email);

    // Redirect to 2FA verification page
    navigateTo('/verify-2fa');
  } else {
    // Standard login flow
    localStorage.setItem('accessToken', data.accessToken);
    navigateTo('/dashboard');
  }
}
```

### 2FA Verification Page

```javascript
// verify-2fa.component.tsx or verify-2fa.jsx
import { useState } from 'react';

export function Verify2FA() {
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sessionToken = sessionStorage.getItem('2faSessionToken');
  const userId = sessionStorage.getItem('2faUserId');
  const userEmail = sessionStorage.getItem('2faUserEmail');

  async function handleVerify() {
    if (!sessionToken || !userId) {
      setError('Session expired. Please login again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const code = useBackupCode ? backupCode : totpCode;

      const response = await fetch('/api/auth/2fa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionToken,
          totpCode: code,
          useBackupCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid 2FA code');
        return;
      }

      // Login successful
      localStorage.setItem('accessToken', data.accessToken);
      sessionStorage.removeItem('2faSessionToken');
      sessionStorage.removeItem('2faUserId');
      sessionStorage.removeItem('2faUserEmail');

      navigateTo('/dashboard');
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="verify-2fa-container">
      <h1>Two-Factor Authentication</h1>
      <p>Please enter the code from your authenticator app</p>

      {error && <div className="error-message">{error}</div>}

      <div className="input-group">
        {!useBackupCode ? (
          <input
            type="text"
            placeholder="000000"
            maxLength="6"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
            disabled={loading}
            pattern="\d{6}"
            autoFocus
          />
        ) : (
          <input
            type="text"
            placeholder="XXXX-XXXX"
            value={backupCode}
            onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
            disabled={loading}
            autoFocus
          />
        )}
      </div>

      <button onClick={handleVerify} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify'}
      </button>

      <button
        onClick={() => {
          setUseBackupCode(!useBackupCode);
          setError('');
        }}
        className="secondary"
      >
        {useBackupCode ? 'Use Authenticator Code' : 'Use Backup Code'}
      </button>

      <p className="help-text">
        {useBackupCode
          ? 'Enter one of your backup codes (format: XXXX-XXXX)'
          : 'Enter the 6-digit code from your authenticator app'}
      </p>

      <a href="/login" className="back-link">← Back to Login</a>
    </div>
  );
}
```

## Setup Flow

### 2FA Setup Page

```javascript
// setup-2fa.component.tsx or setup-2fa.jsx
import { useState } from 'react';
import QRCode from 'qrcode.react';

export function Setup2FA() {
  const [step, setStep] = useState('initiate'); // initiate, confirm, complete
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [manualEntryKey, setManualEntryKey] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const accessToken = localStorage.getItem('accessToken');

  async function initiate2FA() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to setup 2FA');
        return;
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setManualEntryKey(data.manualEntryKey);
      setBackupCodes(data.backupCodes);
      setStep('confirm');
    } catch (err) {
      setError('Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function verify2FA() {
    if (!totpCode || totpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ totpCode })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed');
        return;
      }

      setStep('complete');
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="setup-2fa-container">
      <h1>Enable Two-Factor Authentication</h1>

      {step === 'initiate' && (
        <div className="step-initiate">
          <p>Add an extra layer of security to your account using two-factor authentication.</p>
          <button onClick={initiate2FA} disabled={loading}>
            {loading ? 'Loading...' : 'Get Started'}
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="step-confirm">
          <h2>Step 1: Scan QR Code</h2>
          <p>Scan this QR code with your authenticator app:</p>

          <div className="qr-code-container">
            <img src={qrCode} alt="2FA QR Code" width={200} height={200} />
          </div>

          <details>
            <summary>Can't scan? Enter manually</summary>
            <div className="manual-entry">
              <label>Manually enter this key:</label>
              <div className="key-display">
                <code>{manualEntryKey}</code>
                <button
                  onClick={() => copyToClipboard(manualEntryKey)}
                  className="copy-btn"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </details>

          <h2>Step 2: Save Backup Codes</h2>
          <p>Save these backup codes in a safe place. You can use them if you lose access to your authenticator:</p>

          <div className="backup-codes">
            {backupCodes.map((code, idx) => (
              <div key={idx} className="backup-code">
                {code}
              </div>
            ))}
          </div>

          <button
            onClick={() => copyToClipboard(backupCodes.join('\n'))}
            className="secondary"
          >
            Copy All Codes
          </button>

          <div className="divider"></div>

          <h2>Step 3: Verify Setup</h2>
          <p>Enter the 6-digit code from your authenticator app:</p>

          {error && <div className="error-message">{error}</div>}

          <input
            type="text"
            placeholder="000000"
            maxLength="6"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
            disabled={loading}
            pattern="\d{6}"
            autoFocus
          />

          <button onClick={verify2FA} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
          </button>
        </div>
      )}

      {step === 'complete' && (
        <div className="step-complete">
          <div className="success-icon">✓</div>
          <h2>2FA Enabled Successfully!</h2>
          <p>Your account is now protected with two-factor authentication.</p>
          <p>You'll be asked to enter a code from your authenticator app each time you login.</p>

          <button onClick={() => navigateTo('/settings')} className="primary">
            Go to Settings
          </button>
        </div>
      )}
    </div>
  );
}
```

## Settings/Account Management

### 2FA Status Component

```javascript
// 2fa-settings.component.tsx or 2fa-settings.jsx
import { useState, useEffect } from 'react';

export function TwoFactorSettings() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    fetch2FAStatus();
  }, []);

  async function fetch2FAStatus() {
    try {
      const response = await fetch('/api/auth/2fa/status', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data);
      } else {
        setError(data.error || 'Failed to fetch 2FA status');
      }
    } catch (err) {
      setError('Failed to fetch 2FA status');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="settings-section">
      <h2>Two-Factor Authentication</h2>

      {loading && <p>Loading...</p>}
      {error && <div className="error-message">{error}</div>}

      {status && (
        <>
          <div className="status-card">
            <div className="status-info">
              <p className="status-label">Status</p>
              <p className={`status-value ${status.enabled ? 'enabled' : 'disabled'}`}>
                {status.enabled ? '✓ Enabled' : '✗ Disabled'}
              </p>
            </div>

            {status.enabled && (
              <div className="status-info">
                <p className="status-label">Backup Codes Remaining</p>
                <p className="status-value">{status.remainingBackupCodes}/10</p>
              </div>
            )}
          </div>

          <div className="action-buttons">
            {status.enabled ? (
              <>
                <RegenerateBackupCodesButton accessToken={accessToken} />
                <DisableTwoFactorButton accessToken={accessToken} />
              </>
            ) : (
              <EnableTwoFactorButton accessToken={accessToken} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function RegenerateBackupCodesButton({ accessToken }) {
  const [loading, setLoading] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  const [codes, setCodes] = useState([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleRegenerate() {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/regenerate-backup-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to regenerate codes');
        return;
      }

      setCodes(data.backupCodes);
      setShowCodes(true);
      setPassword('');
    } catch (err) {
      setError('Failed to regenerate codes');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="action-item">
      <button
        onClick={() => setShowCodes(!showCodes)}
        className="secondary"
      >
        Regenerate Backup Codes
      </button>

      {showCodes && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Regenerate Backup Codes</h3>
            <p>Enter your password to regenerate new backup codes.</p>

            {error && <div className="error-message">{error}</div>}

            {codes.length === 0 ? (
              <>
                <input
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />

                <div className="modal-buttons">
                  <button
                    onClick={handleRegenerate}
                    disabled={loading}
                    className="primary"
                  >
                    {loading ? 'Processing...' : 'Regenerate'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCodes(false);
                      setPassword('');
                      setError('');
                    }}
                    className="secondary"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>Your new backup codes:</p>
                <div className="backup-codes">
                  {codes.map((code, idx) => (
                    <div key={idx} className="backup-code">{code}</div>
                  ))}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(codes.join('\n'))}
                  className="secondary"
                >
                  Copy All Codes
                </button>
                <button
                  onClick={() => setShowCodes(false)}
                  className="primary"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DisableTwoFactorButton({ accessToken }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleDisable() {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to disable 2FA');
        return;
      }

      alert('2FA has been disabled');
      window.location.reload();
    } catch (err) {
      setError('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="action-item">
      <button
        onClick={() => setShowConfirm(true)}
        className="danger"
      >
        Disable Two-Factor Authentication
      </button>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal warning">
            <h3>Disable 2FA?</h3>
            <p>Are you sure you want to disable two-factor authentication?</p>
            <p className="warning-text">
              Your account will be less secure without 2FA enabled.
            </p>

            {error && <div className="error-message">{error}</div>}

            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <div className="modal-buttons">
              <button
                onClick={handleDisable}
                disabled={loading}
                className="danger"
              >
                {loading ? 'Disabling...' : 'Yes, Disable 2FA'}
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setPassword('');
                  setError('');
                }}
                className="secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EnableTwoFactorButton({ accessToken }) {
  function handleEnable() {
    navigateTo('/settings/2fa-setup');
  }

  return (
    <div className="action-item">
      <button
        onClick={handleEnable}
        className="primary"
      >
        Enable Two-Factor Authentication
      </button>
    </div>
  );
}
```

## Error Handling

### Handle Common Errors

```javascript
function get2FAErrorMessage(error) {
  const errorMap = {
    'Invalid 2FA verification code': 'The code you entered is incorrect.',
    '2FA session expired': 'Your session has expired. Please login again.',
    'Too many 2FA verification attempts': 'Too many failed attempts. Please try again later.',
    '2FA not enabled for this user': 'Two-factor authentication is not set up for this account.',
    'Invalid password': 'The password you entered is incorrect.'
  };

  return errorMap[error] || error || 'An error occurred. Please try again.';
}
```

## Best Practices

1. **Store Session Data Securely**
   - Use `sessionStorage` for temporary 2FA session data
   - Clear data after successful verification
   - Don't store sensitive data in `localStorage`

2. **User Experience**
   - Show clear instructions for each step
   - Provide option to use backup codes
   - Display remaining backup codes count
   - Allow easy navigation back to login

3. **Security**
   - Require password confirmation for sensitive operations
   - Don't log access tokens or session tokens
   - Use HTTPS only
   - Implement proper error messages (don't leak user existence)

4. **Accessibility**
   - Use proper labels for inputs
   - Support keyboard navigation
   - Provide text alternatives to QR codes
   - Clear error messages

## Testing

```javascript
// Test 2FA flow with mock data
describe('2FA Flow', () => {
  it('should handle login without 2FA', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', password: 'password' })
    });

    expect(response.ok).toBe(true);
    expect(response.data.requiresTwoFactor).toBe(false);
  });

  it('should require 2FA for users with it enabled', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: '2fa-user@example.com', password: 'password' })
    });

    expect(response.ok).toBe(true);
    expect(response.data.requiresTwoFactor).toBe(true);
    expect(response.data.sessionToken).toBeDefined();
  });
});
```

## Troubleshooting

**Q: QR code not displaying**
- A: Ensure the QR code is being rendered as an image with the data URL

**Q: TOTP codes not working**
- A: Verify user's device time is synced. TOTP is time-based and requires accurate system time.

**Q: Backup codes already used**
- A: Each backup code can only be used once. Show user the remaining count.

**Q: Session token expired**
- A: Sessions expire after 10 minutes. User must login again.

For more details, see `TWO_FACTOR_AUTH_IMPLEMENTATION.md`.
