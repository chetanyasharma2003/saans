import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, Bell, LogOut, Smartphone } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkTwoFAStatus();
  }, []);

  const checkTwoFAStatus = async () => {
    try {
      const res = await axios.get('/api/2fa/status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTwoFAEnabled(res.data.data?.twoFAEnabled || false);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const enable2FA = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/2fa/generate-secret', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setQrCode(res.data.data.qrCode);
      setShowQR(true);
    } catch (error) {
      console.error('Error generating 2FA:', error);
      alert('Failed to generate 2FA');
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        '/api/2fa/enable',
        { verificationCode },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setBackupCodes(res.data.data.backupCodes);
      setTwoFAEnabled(true);
      setShowQR(false);
      alert('2FA enabled successfully!');
    } catch (error) {
      console.error('Verification error:', error);
      alert('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!window.confirm('Disable 2FA? Your account will be less secure.')) return;
    try {
      await axios.post(
        '/api/2fa/disable', {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTwoFAEnabled(false);
      alert('2FA disabled');
    } catch (error) {
      console.error('Disable error:', error);
    }
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', 'backup-codes.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        {/* 2FA Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Lock className="text-blue-500 mr-3" size={24} />
              <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              twoFAEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {twoFAEnabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>

          <p className="text-gray-600 mb-4">
            Two-factor authentication adds an extra layer of security to your account.
          </p>

          {!twoFAEnabled ? (
            <>
              {!showQR ? (
                <button
                  onClick={enable2FA}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition"
                >
                  {loading ? 'Loading...' : 'Enable 2FA'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-blue-200 p-4 rounded bg-gray-50">
                    <p className="text-sm font-bold mb-4">Scan with authenticator app:</p>
                    <div className="bg-white p-4 rounded inline-block">
                      {qrCode && <img src={qrCode} alt="QR Code" width={200} />}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Enter 6-digit code from your authenticator:
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                      maxLength={6}
                      className="border-2 border-gray-300 px-4 py-2 rounded w-full text-center text-2xl tracking-widest"
                      placeholder="000000"
                    />
                  </div>

                  <button
                    onClick={verify2FA}
                    disabled={loading || verificationCode.length !== 6}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded transition disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="bg-green-50 border-2 border-green-200 p-4 rounded mb-4">
                <p className="text-green-700 font-bold">✓ Two-factor authentication is active</p>
              </div>

              {backupCodes.length > 0 && (
                <div className="mb-4">
                  <p className="font-bold mb-2">Backup Codes (Save these in a safe place):</p>
                  <div className="bg-gray-100 p-4 rounded font-mono text-sm space-y-1 max-h-40 overflow-y-auto">
                    {backupCodes.map((code, idx) => (
                      <div key={idx}>{code}</div>
                    ))}
                  </div>
                  <button
                    onClick={downloadBackupCodes}
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                  >
                    Download Backup Codes
                  </button>
                </div>
              )}

              <button
                onClick={disable2FA}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded transition"
              >
                Disable 2FA
              </button>
            </>
          )}
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="text-purple-500 mr-3" size={24} />
              <h2 className="text-2xl font-bold">Notifications</h2>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="ml-2 text-sm font-bold">
                {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
          <p className="text-gray-600 mt-4">
            Receive notifications for appointments, messages, and community updates.
          </p>
        </div>

        {/* Logout Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <LogOut className="text-red-500 mr-3" size={24} />
            <h2 className="text-2xl font-bold">Logout</h2>
          </div>
          <p className="text-gray-600 mt-4 mb-4">
            Sign out from all devices and sessions.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
