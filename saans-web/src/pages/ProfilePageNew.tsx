import { DashboardHeader } from '../components/DashboardHeader';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Settings, LogOut, Edit2, Shield, ChevronRight, Lock, Bell, CreditCard, X, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function ProfilePageNew() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'none' | 'security' | 'notifications' | 'subscription'>('none');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyDigest: true
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      setMessage({ type: 'error', text: 'All fields required' });
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordData.new.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${API_URL}/api/users/change-password`,
        { currentPassword: passwordData.current, newPassword: passwordData.new },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ current: '', new: '', confirm: '' });
      setTimeout(() => setActiveModal('none'), 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to change password' });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`${API_URL}/api/users/me`,
        { preferences: notificationPrefs },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Notification preferences updated!' });
      setTimeout(() => setActiveModal('none'), 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to update preferences' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="relative z-10">
        <DashboardHeader title="My Profile" showBackButton={false} />

        <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 max-w-3xl mx-auto">
          {/* Profile Header Card */}
          <div className="bg-gradient-to-br from-purple-900/60 to-slate-900/60 border border-purple-500/30 rounded-2xl p-8 sm:p-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl">
                {user?.profileImage ? <img src={user.profileImage} alt="" className="w-full h-full rounded-full object-cover" /> : '👤'}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-1">{user?.firstName} {user?.lastName}</h2>
                <p className="text-purple-300 text-sm mb-3">{user?.email}</p>
                <p className="text-gray-400 text-xs">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => navigate('/complete-profile')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><User className="w-5 h-5 text-purple-400" /> Account Information</h3>
            <div className="grid gap-4">
              <div className="bg-slate-800/30 border border-purple-500/20 rounded-lg p-5 flex items-center gap-4">
                <Mail className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Email Address</p>
                  <p className="text-white font-semibold">{user?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="bg-slate-800/30 border border-purple-500/20 rounded-lg p-5 flex items-center gap-4">
                <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-semibold">{user?.city || 'Not specified'}</p>
                </div>
              </div>
              <div className="bg-slate-800/30 border border-purple-500/20 rounded-lg p-5 flex items-center gap-4">
                <Shield className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Account Status</p>
                  <p className="text-white font-semibold">{user?.status === 'active' ? '✓ Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5 text-purple-400" /> Settings</h3>
            <button
              onClick={() => { setActiveModal('security'); setMessage(null); }}
              className="w-full bg-slate-800/30 border border-purple-500/20 hover:border-purple-500/60 hover:bg-slate-800/50 rounded-lg p-5 transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                <div>
                  <p className="text-white font-semibold text-sm">Security & 2FA</p>
                  <p className="text-gray-400 text-xs">Manage authentication</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
            </button>

            <button
              onClick={() => { setActiveModal('notifications'); setMessage(null); }}
              className="w-full bg-slate-800/30 border border-purple-500/20 hover:border-purple-500/60 hover:bg-slate-800/50 rounded-lg p-5 transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                <div>
                  <p className="text-white font-semibold text-sm">Notifications</p>
                  <p className="text-gray-400 text-xs">Customize alerts</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
            </button>

            <button
              onClick={() => { setActiveModal('subscription'); setMessage(null); }}
              className="w-full bg-slate-800/30 border border-purple-500/20 hover:border-purple-500/60 hover:bg-slate-800/50 rounded-lg p-5 transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                <div>
                  <p className="text-white font-semibold text-sm">Subscription</p>
                  <p className="text-gray-400 text-xs">Manage your plan</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full px-6 py-4 bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </main>
      </div>

      {/* MODALS */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

            {/* SECURITY & 2FA MODAL */}
            {activeModal === 'security' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Lock className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white">Security & Authentication</h2>
                  </div>
                  <button onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {message && (
                  <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 font-semibold">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all"
                        placeholder="Enter current password"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-300">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 font-semibold">New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all"
                      placeholder="Enter new password (min 8 characters)"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 font-semibold">Confirm New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {/* 2FA Section */}
                  <div className="bg-slate-800/30 border border-purple-500/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-white font-semibold">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-400">Add extra security to your account</p>
                      </div>
                      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all text-sm font-semibold">
                        Enable 2FA
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleChangePassword}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all">
                      Update Password
                    </button>
                    <button
                      onClick={() => setActiveModal('none')}
                      className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold rounded-lg transition-all border border-slate-700">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS MODAL */}
            {activeModal === 'notifications' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Bell className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
                  </div>
                  <button onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {message && (
                  <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                  </div>
                )}

                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get browser push alerts' },
                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive important alerts via SMS' },
                    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Get a summary of your activities' }
                  ].map((pref: any) => (
                    <div key={pref.key} className="bg-slate-800/30 border border-purple-500/20 rounded-lg p-5 flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{pref.label}</p>
                        <p className="text-sm text-gray-400">{pref.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotificationPrefs({ ...notificationPrefs, [pref.key]: !notificationPrefs[pref.key as keyof typeof notificationPrefs] })}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                          notificationPrefs[pref.key as keyof typeof notificationPrefs]
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-700 text-gray-400'
                        }`}>
                        {notificationPrefs[pref.key as keyof typeof notificationPrefs] ? 'On' : 'Off'}
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-3 pt-6">
                    <button
                      onClick={handleSaveNotifications}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all">
                      Save Preferences
                    </button>
                    <button
                      onClick={() => setActiveModal('none')}
                      className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold rounded-lg transition-all border border-slate-700">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUBSCRIPTION MODAL */}
            {activeModal === 'subscription' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white">Subscription & Billing</h2>
                  </div>
                  <button onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Current Plan */}
                  <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-lg p-6">
                    <p className="text-gray-400 text-sm mb-2">Current Plan</p>
                    <h3 className="text-3xl font-bold text-white mb-4">Free Plan</h3>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-400" /> Limited access to therapists
                      </li>
                      <li className="flex items-center gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-400" /> Community features
                      </li>
                      <li className="flex items-center gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-400" /> Access to resources
                      </li>
                    </ul>
                  </div>

                  {/* Available Plans */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 border border-purple-500/20 rounded-lg p-5">
                      <p className="text-white font-bold mb-2">Pro Plan</p>
                      <p className="text-2xl font-bold text-purple-400 mb-4">₹499<span className="text-sm text-gray-400">/month</span></p>
                      <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all text-sm">
                        Upgrade
                      </button>
                    </div>
                    <div className="bg-slate-800/30 border border-purple-500/20 rounded-lg p-5">
                      <p className="text-white font-bold mb-2">Premium Plan</p>
                      <p className="text-2xl font-bold text-pink-400 mb-4">₹999<span className="text-sm text-gray-400">/month</span></p>
                      <button className="w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition-all text-sm">
                        Upgrade
                      </button>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div>
                    <h4 className="text-white font-semibold mb-4">Billing History</h4>
                    <div className="bg-slate-800/30 border border-purple-500/20 rounded-lg p-4 text-center">
                      <p className="text-gray-400">No billing history yet</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModal('none')}
                    className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold rounded-lg transition-all border border-slate-700">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePageNew;
