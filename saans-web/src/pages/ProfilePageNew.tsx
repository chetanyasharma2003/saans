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
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
            <div className="relative bg-gradient-to-br from-purple-900/60 to-slate-900/60 border border-purple-500/30 group-hover:border-purple-500/60 rounded-2xl p-8 sm:p-10 transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center text-5xl shadow-lg">
                  {user?.profileImage ? <img src={user.profileImage} alt="" className="w-full h-full rounded-full object-cover" /> : '👤'}
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-2">{user?.firstName} {user?.lastName}</h2>
                  <p className="text-purple-300 text-sm mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    {user?.email}
                  </p>
                  <p className="text-gray-400 text-xs">📅 Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => navigate('/complete-profile')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-purple-500/50">
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><User className="w-5 h-5 text-purple-400" /> Account Information</h3>
            <div className="grid gap-4">
              <div className="group bg-gradient-to-br from-slate-800/30 to-slate-800/10 border border-purple-500/20 hover:border-blue-500/60 hover:from-blue-900/20 hover:to-slate-800/20 rounded-xl p-5 flex items-center gap-4 transition-all duration-300 cursor-pointer">
                <div className="p-3 bg-blue-500/20 group-hover:bg-blue-500/40 rounded-lg transition-all">
                  <Mail className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Email Address</p>
                  <p className="text-white font-semibold group-hover:text-blue-300 transition-colors">{user?.email || 'N/A'}</p>
                </div>
                <div className="text-blue-500/0 group-hover:text-blue-400 transition-colors">→</div>
              </div>
              <div className="group bg-gradient-to-br from-slate-800/30 to-slate-800/10 border border-purple-500/20 hover:border-pink-500/60 hover:from-pink-900/20 hover:to-slate-800/20 rounded-xl p-5 flex items-center gap-4 transition-all duration-300 cursor-pointer">
                <div className="p-3 bg-pink-500/20 group-hover:bg-pink-500/40 rounded-lg transition-all">
                  <MapPin className="w-5 h-5 text-pink-400 group-hover:text-pink-300 transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-semibold group-hover:text-pink-300 transition-colors">{user?.city || 'Not specified'}</p>
                </div>
                <div className="text-pink-500/0 group-hover:text-pink-400 transition-colors">→</div>
              </div>
              <div className="group bg-gradient-to-br from-slate-800/30 to-slate-800/10 border border-purple-500/20 hover:border-emerald-500/60 hover:from-emerald-900/20 hover:to-slate-800/20 rounded-xl p-5 flex items-center gap-4 transition-all duration-300 cursor-pointer">
                <div className="p-3 bg-emerald-500/20 group-hover:bg-emerald-500/40 rounded-lg transition-all">
                  <Shield className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Account Status</p>
                  <p className="text-white font-semibold group-hover:text-emerald-300 transition-colors">{user?.status === 'active' ? '✓ Active' : 'Inactive'}</p>
                </div>
                <div className="text-emerald-500/0 group-hover:text-emerald-400 transition-colors">→</div>
              </div>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5 text-purple-400" /> Settings</h3>
            <button
              onClick={() => { setActiveModal('security'); setMessage(null); }}
              className="w-full bg-gradient-to-br from-slate-800/30 to-slate-800/10 border border-purple-500/20 hover:border-indigo-500/60 hover:from-indigo-900/20 hover:to-slate-800/20 rounded-xl p-5 transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 group-hover:bg-indigo-500/40 rounded-lg transition-all">
                  <Lock className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Security & 2FA</p>
                  <p className="text-gray-400 text-xs">Manage authentication</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => { setActiveModal('notifications'); setMessage(null); }}
              className="w-full bg-gradient-to-br from-slate-800/30 to-slate-800/10 border border-purple-500/20 hover:border-cyan-500/60 hover:from-cyan-900/20 hover:to-slate-800/20 rounded-xl p-5 transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 group-hover:bg-cyan-500/40 rounded-lg transition-all">
                  <Bell className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Notifications</p>
                  <p className="text-gray-400 text-xs">Customize alerts</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => { setActiveModal('subscription'); setMessage(null); }}
              className="w-full bg-gradient-to-br from-slate-800/30 to-slate-800/10 border border-purple-500/20 hover:border-violet-500/60 hover:from-violet-900/20 hover:to-slate-800/20 rounded-xl p-5 transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/20 group-hover:bg-violet-500/40 rounded-lg transition-all">
                  <CreditCard className="w-5 h-5 text-violet-400 group-hover:text-violet-300" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Subscription</p>
                  <p className="text-gray-400 text-xs">Manage your plan</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-400 transition-colors transform group-hover:translate-x-1" />
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
              <div className="overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 p-8 sticky top-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Security & Authentication</h2>
                    </div>
                    <button onClick={() => setActiveModal('none')} className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="p-8">

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
                  <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900/20 border border-indigo-500/30 rounded-xl p-6 hover:border-indigo-500/60 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-semibold">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-400">Add extra security to your account</p>
                      </div>
                      <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all text-sm font-semibold shadow-lg hover:shadow-indigo-500/50">
                        Enable 2FA
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-8">
                    <button
                      onClick={handleChangePassword}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-indigo-500/50">
                      Update Password
                    </button>
                    <button
                      onClick={() => setActiveModal('none')}
                      className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 font-semibold rounded-lg transition-all border border-slate-600">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS MODAL */}
            {activeModal === 'notifications' && (
              <div className="overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 p-8 sticky top-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
                    </div>
                    <button onClick={() => setActiveModal('none')} className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="p-8">

                {message && (
                  <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                  </div>
                )}

                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email', color: 'from-blue-600 to-blue-400' },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get browser push alerts', color: 'from-cyan-600 to-cyan-400' },
                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive important alerts via SMS', color: 'from-teal-600 to-teal-400' },
                    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Get a summary of your activities', color: 'from-emerald-600 to-emerald-400' }
                  ].map((pref: any, idx: number) => (
                    <div key={pref.key} className="bg-gradient-to-br from-slate-800/40 to-slate-800/20 border border-slate-700/50 hover:border-slate-600/80 rounded-xl p-5 flex items-center justify-between transition-all group">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${pref.color}`}></div>
                          <p className="text-white font-semibold">{pref.label}</p>
                        </div>
                        <p className="text-sm text-gray-400">{pref.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotificationPrefs({ ...notificationPrefs, [pref.key]: !notificationPrefs[pref.key as keyof typeof notificationPrefs] })}
                        className={`ml-4 px-6 py-2 rounded-lg font-semibold transition-all text-sm ${
                          notificationPrefs[pref.key as keyof typeof notificationPrefs]
                            ? `bg-gradient-to-r ${pref.color} text-white shadow-lg`
                            : 'bg-slate-700/50 text-gray-400 border border-slate-600'
                        }`}>
                        {notificationPrefs[pref.key as keyof typeof notificationPrefs] ? '✓ On' : 'Off'}
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-3 pt-8">
                    <button
                      onClick={handleSaveNotifications}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-cyan-500/50">
                      Save Preferences
                    </button>
                    <button
                      onClick={() => setActiveModal('none')}
                      className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 font-semibold rounded-lg transition-all border border-slate-600">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUBSCRIPTION MODAL */}
            {activeModal === 'subscription' && (
              <div className="overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 p-8 sticky top-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Subscription & Billing</h2>
                    </div>
                    <button onClick={() => setActiveModal('none')} className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="p-8">

                <div className="space-y-6">
                  {/* Current Plan */}
                  <div className="bg-gradient-to-br from-violet-900/30 via-purple-900/20 to-slate-900/30 border-2 border-violet-500/40 rounded-xl p-6 hover:border-violet-500/60 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Your Current Plan</p>
                        <h3 className="text-3xl font-bold text-white">Free Plan</h3>
                      </div>
                      <div className="px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-lg">
                        <p className="text-green-400 text-sm font-semibold">Active</p>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-400" /> <span>Limited access to therapists</span>
                      </li>
                      <li className="flex items-center gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-400" /> <span>Community features</span>
                      </li>
                      <li className="flex items-center gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-400" /> <span>Access to resources</span>
                      </li>
                    </ul>
                  </div>

                  {/* Available Plans */}
                  <div>
                    <h4 className="text-white font-bold mb-4">Upgrade Your Plan</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 hover:border-purple-500/60 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-purple-500/20">
                        <div className="mb-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-600/30 flex items-center justify-center mb-2">
                            <span className="text-xl">👑</span>
                          </div>
                          <p className="text-white font-bold text-lg">Pro Plan</p>
                        </div>
                        <p className="text-3xl font-bold text-purple-400 mb-4">₹499<span className="text-sm text-gray-400 font-normal">/month</span></p>
                        <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-lg font-semibold transition-all text-sm shadow-lg">
                          Upgrade Now
                        </button>
                      </div>
                      <div className="group bg-gradient-to-br from-pink-900/40 to-slate-900/40 border border-pink-500/30 hover:border-pink-500/60 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-pink-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-bold rounded-bl-lg">
                          POPULAR
                        </div>
                        <div className="mb-3">
                          <div className="w-10 h-10 rounded-lg bg-pink-600/30 flex items-center justify-center mb-2">
                            <span className="text-xl">💎</span>
                          </div>
                          <p className="text-white font-bold text-lg">Premium Plan</p>
                        </div>
                        <p className="text-3xl font-bold text-pink-400 mb-4">₹999<span className="text-sm text-gray-400 font-normal">/month</span></p>
                        <button className="w-full px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg font-semibold transition-all text-sm shadow-lg">
                          Upgrade Now
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div>
                    <h4 className="text-white font-bold mb-4">Billing History</h4>
                    <div className="bg-gradient-to-br from-slate-800/30 to-slate-800/10 border border-slate-700/50 rounded-xl p-6 text-center">
                      <div className="text-gray-400 text-sm">📋 No billing history yet</div>
                      <p className="text-gray-500 text-xs mt-2">Upgrade to a paid plan to start billing</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModal('none')}
                    className="w-full px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 font-semibold rounded-lg transition-all border border-slate-600">
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
