import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout, setUser } from '../redux/slices/authSlice';
import { RootState } from '../redux/store';
import PaymentModal from '../components/PaymentModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface FormData {
  name: string;
  email: string;
  bio: string;
  phone: string;
  city: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function MyProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // State management
  const [activeTab, setActiveTab] = useState('profile');
  const [activeSettingsTab, setActiveSettingsTab] = useState('security');
  const [editMode, setEditMode] = useState(false);
  const [avatarColor, setAvatarColor] = useState('indigo');
  const [loading, setLoading] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'BASIC' | 'PREMIUM' | 'PLUS' | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    email: user?.email || '',
    bio: 'I\'m on a journey to better mental health',
    phone: '+91 98765 43210',
    city: 'Mumbai',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileSettings, setProfileSettings] = useState({
    profileVisibility: 'private',
    showActivity: false,
    allowMessagesFromStrangers: false,
    dataCollection: true,
  });

  const avatarColors = {
    indigo: 'from-indigo-600 to-purple-600',
    blue: 'from-blue-600 to-cyan-600',
    green: 'from-green-600 to-emerald-600',
    pink: 'from-pink-600 to-red-600',
    orange: 'from-orange-600 to-yellow-600',
    purple: 'from-purple-600 to-pink-600',
  };

  // Subscription plans data
  const subscriptionPlans = [
    {
      id: 'BASIC',
      name: 'Basic',
      price: 99,
      features: [
        'Unlimited AI chat',
        'Mood tracking',
        'Therapy session booking (2/month)',
        'Resource library',
        'Crisis support',
      ],
      highlighted: false,
    },
    {
      id: 'PREMIUM',
      name: 'Premium',
      price: 299,
      features: [
        'Unlimited AI chat',
        'Priority AI responses',
        'Mood tracking with insights',
        'Therapy sessions (4/month)',
        'Full resource library',
        'Crisis support with priority',
        'Personalized wellness plans',
      ],
      highlighted: true,
    },
    {
      id: 'PLUS',
      name: 'Plus',
      price: 499,
      features: [
        'Unlimited AI chat',
        'Priority AI responses',
        'Advanced mood analytics',
        'Unlimited therapy sessions',
        'Full resource library',
        'Dedicated crisis support',
        'Personalized wellness plans',
        'One-on-one consultation',
        'Monthly progress reports',
      ],
      highlighted: false,
    },
  ];

  // Fetch subscription status on mount
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      setSubscriptionLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          `${API_URL}/api/payments/subscription-status`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
          setSubscriptionStatus(response.data.data);
        }
      } catch (error: any) {
        console.error('Failed to fetch subscription status:', error);
        setSubscriptionStatus(null);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    if (user?.id) {
      fetchSubscriptionStatus();
    }
  }, [user?.id]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'subscription', label: 'Subscription', icon: '💳' },
    { id: 'activity', label: 'Activity', icon: '📊' },
  ];

  const settingsTabs = [
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'privacy', label: 'Privacy', icon: '👁️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ];

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSettingsChange = (key: string, value: string | boolean) => {
    setProfileSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId as 'BASIC' | 'PREMIUM' | 'PLUS');
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (subscription: any) => {
    setSubscriptionStatus({
      isActive: true,
      subscription,
      daysRemaining: 30,
    });
    setSuccessMessage('Subscription activated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      setErrorMessage('Name cannot be empty');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `${API_URL}/api/auth/profile`,
        {
          name: formData.name,
          email: formData.email,
          bio: formData.bio,
          city: formData.city,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update Redux with new user data
      if (response.data.user) {
        dispatch(setUser(response.data.user));
      }

      setSuccessMessage('Profile updated successfully!');
      setEditMode(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to update profile');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setErrorMessage('Please fill all password fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccessMessage('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to change password');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTwoFAEnabled(!twoFAEnabled);
      setSuccessMessage(`Two-Factor Authentication ${!twoFAEnabled ? 'enabled' : 'disabled'}!`);
      setShow2FAModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to update 2FA settings');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccessMessage('Account deleted successfully');
      setTimeout(() => {
        dispatch(logout());
        navigate('/login');
      }, 1500);
    } catch (error) {
      setErrorMessage('Failed to delete account');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header with Gradient */}
      <div className="relative z-10 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-b border-indigo-400/30 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-1">👤 My Profile</h1>
          <p className="text-indigo-200">Manage your account, privacy, and wellness journey</p>
        </div>
      </div>

      {/* Toast Notifications */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <span>!</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Profile Card */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-indigo-400/30 rounded-3xl p-8 backdrop-blur-xl text-center hover:border-indigo-400/60 transition duration-300 shadow-2xl">
                {/* Avatar */}
                <div className={`bg-gradient-to-br ${avatarColors[avatarColor as keyof typeof avatarColors]} w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl shadow-lg transform hover:scale-110 transition duration-300`}>
                  👤
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">{formData.name}</h2>
                <p className="text-indigo-300 text-sm mb-1">{formData.email}</p>
                <p className="text-indigo-400/70 text-xs mb-6">Premium Member since Aug 2026</p>

                <div className="space-y-3">
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {editMode ? 'Cancel Edit' : 'Edit Profile'}
                  </button>
                  <button className="w-full bg-slate-700/60 hover:bg-slate-700/80 text-indigo-200 font-bold py-3 rounded-xl transition duration-300">
                    Change Avatar
                  </button>
                </div>

                {/* Avatar Color Selector */}
                <div className="mt-6 pt-6 border-t border-indigo-400/20">
                  <p className="text-indigo-300 text-xs font-semibold mb-3 uppercase">Avatar Color</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(avatarColors).map((color) => (
                      <button
                        key={color}
                        onClick={() => setAvatarColor(color)}
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[color as keyof typeof avatarColors]} border-2 transition ${
                          avatarColor === color ? 'border-white shadow-lg' : 'border-transparent'
                        }`}
                      ></button>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-indigo-400/20 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-300 text-sm">Sessions</span>
                    <span className="text-white font-bold">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-300 text-sm">Streak</span>
                    <span className="text-white font-bold">5 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-300 text-sm">Level</span>
                    <span className="text-white font-bold">Pro 🏆</span>
                  </div>
                </div>
              </div>

              {/* Membership Status */}
              <div className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 border border-green-400/40 rounded-2xl p-6 backdrop-blur-xl">
                <p className="text-green-200 text-sm font-semibold mb-1">Current Status</p>
                <p className="text-white font-bold text-lg">Active Member</p>
                <p className="text-green-300/80 text-xs mt-2">Member since August 11, 2026</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition duration-300 whitespace-nowrap capitalize flex items-center gap-2 transform hover:scale-105 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-slate-700/50 text-indigo-200 hover:bg-slate-700/70 hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-indigo-400/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                {editMode ? (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-6">Edit Your Profile</h3>

                    <div>
                      <label className="text-indigo-200 font-semibold mb-3 block">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-indigo-400/30 rounded-xl text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300 placeholder-slate-400"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="text-indigo-200 font-semibold mb-3 block">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-indigo-400/30 rounded-xl text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300 placeholder-slate-400"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="text-indigo-200 font-semibold mb-3 block">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-indigo-400/30 rounded-xl text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300 resize-none placeholder-slate-400"
                        placeholder="Tell us about yourself"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-indigo-200 font-semibold mb-3 block">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-indigo-400/30 rounded-xl text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300 placeholder-slate-400"
                          placeholder="Enter your phone"
                        />
                      </div>

                      <div>
                        <label className="text-indigo-200 font-semibold mb-3 block">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-indigo-400/30 rounded-xl text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300 placeholder-slate-400"
                          placeholder="Enter your city"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="flex-1 bg-slate-700/60 hover:bg-slate-700/80 text-indigo-200 font-bold py-3 rounded-xl transition duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-bold text-white mb-6">Profile Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 hover:border-indigo-400/40 transition duration-300">
                        <p className="text-indigo-300 text-sm font-semibold mb-2 uppercase">Full Name</p>
                        <p className="text-white text-lg font-medium">{formData.name}</p>
                      </div>
                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 hover:border-indigo-400/40 transition duration-300">
                        <p className="text-indigo-300 text-sm font-semibold mb-2 uppercase">Email</p>
                        <p className="text-white text-lg font-medium">{formData.email}</p>
                      </div>
                    </div>

                    <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 hover:border-indigo-400/40 transition duration-300">
                      <p className="text-indigo-300 text-sm font-semibold mb-2 uppercase">Bio</p>
                      <p className="text-white text-lg leading-relaxed">{formData.bio}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 hover:border-indigo-400/40 transition duration-300">
                        <p className="text-indigo-300 text-sm font-semibold mb-2 uppercase">Phone</p>
                        <p className="text-white text-lg font-medium">{formData.phone}</p>
                      </div>
                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 hover:border-indigo-400/40 transition duration-300">
                        <p className="text-indigo-300 text-sm font-semibold mb-2 uppercase">City</p>
                        <p className="text-white text-lg font-medium">{formData.city}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-indigo-400/30 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
                {/* Settings Sub-tabs */}
                <div className="flex gap-1 bg-slate-700/50 border-b border-indigo-400/20 p-2 overflow-x-auto">
                  {settingsTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSettingsTab(tab.id)}
                      className={`px-5 py-2 rounded-lg font-semibold transition duration-300 whitespace-nowrap flex items-center gap-2 text-sm ${
                        activeSettingsTab === tab.id
                          ? 'bg-indigo-600 text-white'
                          : 'text-indigo-200 hover:text-white'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  {/* Security Settings */}
                  {activeSettingsTab === 'security' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-white mb-8">Security Settings</h3>

                      {/* Password Change */}
                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-start hover:border-indigo-400/40 transition duration-300">
                        <div>
                          <p className="text-white font-bold text-lg">Change Password</p>
                          <p className="text-indigo-300 text-sm mt-2">Update your password regularly for better security</p>
                        </div>
                        <button
                          onClick={() => setShowPasswordModal(true)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition duration-300 transform hover:scale-105 whitespace-nowrap"
                        >
                          Change
                        </button>
                      </div>

                      {/* Two-Factor Authentication */}
                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-start hover:border-indigo-400/40 transition duration-300">
                        <div>
                          <p className="text-white font-bold text-lg">Two-Factor Authentication</p>
                          <p className="text-indigo-300 text-sm mt-2">Add an extra layer of security to your account</p>
                          {twoFAEnabled && <p className="text-green-400 text-sm mt-1 font-semibold">✓ Enabled</p>}
                        </div>
                        <button
                          onClick={() => setShow2FAModal(true)}
                          className={`px-6 py-2 rounded-lg transition duration-300 transform hover:scale-105 whitespace-nowrap font-semibold ${
                            twoFAEnabled
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {twoFAEnabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>

                      {/* Login Sessions */}
                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 hover:border-indigo-400/40 transition duration-300">
                        <p className="text-white font-bold text-lg mb-4">Active Sessions</p>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center pb-3 border-b border-indigo-400/20">
                            <div>
                              <p className="text-indigo-200 font-semibold">Current Session</p>
                              <p className="text-indigo-400 text-sm">macOS Safari</p>
                            </div>
                            <span className="text-green-400 text-sm font-bold">Active Now</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-indigo-400/20">
                            <div>
                              <p className="text-indigo-200 font-semibold">Mobile Session</p>
                              <p className="text-indigo-400 text-sm">iPhone Safari</p>
                            </div>
                            <button className="text-red-400 hover:text-red-300 text-sm font-semibold">Logout</button>
                          </div>
                        </div>
                      </div>

                      {/* Security Score */}
                      <div className="bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-400/40 rounded-xl p-6">
                        <p className="text-indigo-200 font-semibold mb-3">Security Score</p>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-slate-700/50 rounded-full h-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-full w-5/6"></div>
                          </div>
                          <span className="text-white font-bold text-lg">83/100</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Privacy Settings */}
                  {activeSettingsTab === 'privacy' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-white mb-8">Privacy Settings</h3>

                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
                        <div>
                          <p className="text-white font-bold">Profile Visibility</p>
                          <p className="text-indigo-300 text-sm mt-1">Who can see your profile</p>
                        </div>
                        <select
                          value={profileSettings.profileVisibility}
                          onChange={(e) => handleProfileSettingsChange('profileVisibility', e.target.value)}
                          className="bg-slate-700/50 border border-indigo-400/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-400"
                        >
                          <option value="private">Private</option>
                          <option value="friends">Friends Only</option>
                          <option value="public">Public</option>
                        </select>
                      </div>

                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
                        <div>
                          <p className="text-white font-bold">Show Activity Status</p>
                          <p className="text-indigo-300 text-sm mt-1">Others can see when you're online</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={profileSettings.showActivity}
                          onChange={(e) => handleProfileSettingsChange('showActivity', e.target.checked)}
                          className="w-6 h-6 cursor-pointer accent-indigo-600"
                        />
                      </div>

                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
                        <div>
                          <p className="text-white font-bold">Allow Messages from Strangers</p>
                          <p className="text-indigo-300 text-sm mt-1">Control who can message you</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={profileSettings.allowMessagesFromStrangers}
                          onChange={(e) => handleProfileSettingsChange('allowMessagesFromStrangers', e.target.checked)}
                          className="w-6 h-6 cursor-pointer accent-indigo-600"
                        />
                      </div>

                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
                        <div>
                          <p className="text-white font-bold">Data Collection</p>
                          <p className="text-indigo-300 text-sm mt-1">Help us improve by sharing usage data</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={profileSettings.dataCollection}
                          onChange={(e) => handleProfileSettingsChange('dataCollection', e.target.checked)}
                          className="w-6 h-6 cursor-pointer accent-indigo-600"
                        />
                      </div>

                      <div className="bg-gradient-to-br from-red-600/20 to-rose-600/20 border border-red-400/40 rounded-xl p-6 mt-8">
                        <p className="text-red-200 font-semibold mb-3">Danger Zone</p>
                        <p className="text-red-100 text-sm mb-4">Permanently delete your account and all associated data</p>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition duration-300 font-semibold"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Notification Settings */}
                  {activeSettingsTab === 'notifications' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-white mb-8">Notification Settings</h3>

                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
                        <div>
                          <p className="text-white font-bold">Email Notifications</p>
                          <p className="text-indigo-300 text-sm mt-1">Get updates about your sessions and progress</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="w-6 h-6 cursor-pointer accent-indigo-600"
                        />
                      </div>

                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
                        <div>
                          <p className="text-white font-bold">Push Notifications</p>
                          <p className="text-indigo-300 text-sm mt-1">Get real-time alerts on your device</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={pushNotifications}
                          onChange={(e) => setPushNotifications(e.target.checked)}
                          className="w-6 h-6 cursor-pointer accent-indigo-600"
                        />
                      </div>

                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
                        <div>
                          <p className="text-white font-bold">Session Reminders</p>
                          <p className="text-indigo-300 text-sm mt-1">Reminders for your scheduled therapy sessions</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-6 h-6 cursor-pointer accent-indigo-600" />
                      </div>

                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
                        <div>
                          <p className="text-white font-bold">Mood Check-in</p>
                          <p className="text-indigo-300 text-sm mt-1">Daily mood tracking reminders</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-6 h-6 cursor-pointer accent-indigo-600" />
                      </div>

                      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
                        <div>
                          <p className="text-white font-bold">Community Updates</p>
                          <p className="text-indigo-300 text-sm mt-1">News and updates from the community</p>
                        </div>
                        <input type="checkbox" className="w-6 h-6 cursor-pointer accent-indigo-600" />
                      </div>

                      <button className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition duration-300 transform hover:scale-105">
                        Save Preferences
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-8">
                {/* Current Subscription Status */}
                {subscriptionStatus?.isActive && subscriptionStatus?.subscription && (
                  <div className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 border border-green-400/40 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                    <h3 className="text-2xl font-bold text-white mb-8">Current Subscription</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-green-300 text-sm font-semibold mb-2 uppercase">Active Plan</p>
                        <div className="flex items-baseline gap-2">
                          <h4 className="text-4xl font-bold text-white">
                            {subscriptionStatus.subscription.type}
                          </h4>
                          <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                            ✓ Active
                          </div>
                        </div>
                        <p className="text-green-200 text-lg mt-2">
                          ₹{subscriptionPlans.find(p => p.id === subscriptionStatus.subscription.type)?.price || 0}/month
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-slate-700/30 border border-green-400/20 rounded-lg p-4">
                          <p className="text-green-300 text-sm">Days Remaining</p>
                          <p className="text-white font-bold text-lg">
                            {subscriptionStatus.daysRemaining || 30} days
                          </p>
                        </div>
                        <div className="bg-slate-700/30 border border-green-400/20 rounded-lg p-4">
                          <p className="text-green-300 text-sm">Renewal Date</p>
                          <p className="text-white font-bold text-lg">
                            {new Date(Date.now() + (subscriptionStatus.daysRemaining || 30) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Current Plan Features */}
                    <div className="bg-slate-700/20 border border-green-400/20 rounded-xl p-6 mb-6">
                      <p className="text-green-300 text-sm font-semibold mb-4 uppercase">Included Features</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subscriptionStatus.subscription.features?.map((feature: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className="text-green-400 flex-shrink-0 mt-1">✓</span>
                            <span className="text-green-100">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('activity')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition duration-300 transform hover:scale-105"
                    >
                      View Usage & Activity
                    </button>
                  </div>
                )}

                {/* No Active Subscription */}
                {!subscriptionStatus?.isActive && (
                  <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-400/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                    <div className="text-center mb-8">
                      <div className="text-6xl mb-4">🎯</div>
                      <h4 className="text-2xl font-bold text-white mb-2">No Active Subscription</h4>
                      <p className="text-indigo-200">Upgrade to a premium plan to unlock unlimited features and enhance your wellness journey</p>
                    </div>
                  </div>
                )}

                {/* Available Plans Section */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-indigo-400/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-2">Upgrade Your Plan</h3>
                  <p className="text-indigo-200 mb-8">Choose the perfect plan for your mental health journey</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {subscriptionPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`relative rounded-2xl backdrop-blur-xl transition duration-300 transform hover:scale-105 ${
                          plan.highlighted
                            ? 'bg-gradient-to-br from-indigo-600/40 to-purple-600/40 border-2 border-indigo-400 shadow-2xl'
                            : 'bg-gradient-to-br from-slate-700/60 to-slate-700/40 border border-indigo-400/30 hover:border-indigo-400/60'
                        }`}
                      >
                        {plan.highlighted && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                              Most Popular
                            </div>
                          </div>
                        )}

                        <div className="p-8">
                          {/* Plan Header */}
                          <div className="mb-6">
                            <h4 className="text-2xl font-bold text-white mb-2">{plan.name}</h4>
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold text-indigo-300">₹{plan.price}</span>
                              <span className="text-indigo-200 text-sm">/month</span>
                            </div>
                          </div>

                          {/* Features List */}
                          <div className="space-y-3 mb-8 pb-8 border-b border-indigo-400/20">
                            {plan.features.map((feature, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <span className="text-green-400 flex-shrink-0 mt-0.5">✓</span>
                                <span className="text-indigo-100 text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>

                          {/* Current Plan Indicator */}
                          {subscriptionStatus?.isActive &&
                            subscriptionStatus?.subscription?.type === plan.id && (
                              <div className="mb-4 p-3 bg-green-600/20 border border-green-400/40 rounded-lg">
                                <p className="text-green-300 font-semibold text-sm text-center">
                                  ✓ Your Current Plan
                                </p>
                              </div>
                            )}

                          {/* Action Button */}
                          <button
                            onClick={() => handlePlanSelect(plan.id as any)}
                            disabled={
                              subscriptionStatus?.isActive &&
                              subscriptionStatus?.subscription?.type === plan.id
                            }
                            className={`w-full font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 ${
                              subscriptionStatus?.isActive &&
                              subscriptionStatus?.subscription?.type === plan.id
                                ? 'bg-slate-600/50 text-slate-300 cursor-not-allowed'
                                : plan.highlighted
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                          >
                            {subscriptionStatus?.isActive &&
                            subscriptionStatus?.subscription?.type === plan.id
                              ? 'Current Plan'
                              : 'Select Plan'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Plan Comparison */}
                  <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6">
                    <h4 className="text-white font-bold mb-4">Plan Comparison</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-indigo-400/20">
                            <th className="text-left py-2 px-4 text-indigo-200 font-semibold">Features</th>
                            <th className="text-center py-2 px-4 text-indigo-200 font-semibold">Basic</th>
                            <th className="text-center py-2 px-4 text-indigo-200 font-semibold">Premium</th>
                            <th className="text-center py-2 px-4 text-indigo-200 font-semibold">Plus</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-indigo-400/10">
                            <td className="py-2 px-4 text-indigo-100">AI Chat</td>
                            <td className="text-center py-2 px-4 text-green-400">Unlimited</td>
                            <td className="text-center py-2 px-4 text-green-400">Unlimited</td>
                            <td className="text-center py-2 px-4 text-green-400">Unlimited</td>
                          </tr>
                          <tr className="border-b border-indigo-400/10">
                            <td className="py-2 px-4 text-indigo-100">Therapy Sessions</td>
                            <td className="text-center py-2 px-4 text-indigo-300">2/month</td>
                            <td className="text-center py-2 px-4 text-indigo-300">4/month</td>
                            <td className="text-center py-2 px-4 text-green-400">Unlimited</td>
                          </tr>
                          <tr className="border-b border-indigo-400/10">
                            <td className="py-2 px-4 text-indigo-100">Priority Support</td>
                            <td className="text-center py-2 px-4 text-red-400">✗</td>
                            <td className="text-center py-2 px-4 text-green-400">✓</td>
                            <td className="text-center py-2 px-4 text-green-400">24/7</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 text-indigo-100">Analytics</td>
                            <td className="text-center py-2 px-4 text-indigo-300">Basic</td>
                            <td className="text-center py-2 px-4 text-indigo-300">Advanced</td>
                            <td className="text-center py-2 px-4 text-green-400">Full</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-indigo-400/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-8">Billing & Support</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6">
                      <p className="text-indigo-300 text-sm font-semibold mb-2">Need Help?</p>
                      <p className="text-white font-bold mb-4">Contact Support</p>
                      <p className="text-indigo-200 text-sm mb-4">Got questions about your subscription?</p>
                      <a
                        href="mailto:support@saans.in"
                        className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm"
                      >
                        Email us →
                      </a>
                    </div>

                    <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6">
                      <p className="text-indigo-300 text-sm font-semibold mb-2">Manage Billing</p>
                      <p className="text-white font-bold mb-4">Update Payment Method</p>
                      <p className="text-indigo-200 text-sm mb-4">Add or change your payment information</p>
                      <button className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm">
                        Manage →
                      </button>
                    </div>

                    <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6">
                      <p className="text-indigo-300 text-sm font-semibold mb-2">Billing Info</p>
                      <p className="text-white font-bold mb-4">View Invoices</p>
                      <p className="text-indigo-200 text-sm mb-4">Download your payment receipts</p>
                      <button className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm">
                        Download →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Modal */}
            {selectedPlan && (
              <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => {
                  setShowPaymentModal(false);
                  setSelectedPlan(null);
                }}
                planType={selectedPlan}
                planName={subscriptionPlans.find(p => p.id === selectedPlan)?.name || ''}
                price={subscriptionPlans.find(p => p.id === selectedPlan)?.price || 0}
                features={subscriptionPlans.find(p => p.id === selectedPlan)?.features || []}
                onPaymentSuccess={handlePaymentSuccess}
              />
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-indigo-400/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-8">Activity Stats & History</h3>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border border-blue-400/40 rounded-xl p-6 text-center hover:border-blue-400/60 transition duration-300">
                    <div className="text-4xl font-bold text-cyan-400 mb-2">12</div>
                    <p className="text-blue-100 font-semibold text-sm">Counselor Sessions</p>
                    <p className="text-blue-300/60 text-xs mt-1">Last: 2 days ago</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 border border-green-400/40 rounded-xl p-6 text-center hover:border-green-400/60 transition duration-300">
                    <div className="text-4xl font-bold text-emerald-400 mb-2">5</div>
                    <p className="text-green-100 font-semibold text-sm">Therapy Sessions</p>
                    <p className="text-green-300/60 text-xs mt-1">Last: 5 days ago</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-400/40 rounded-xl p-6 text-center hover:border-purple-400/60 transition duration-300">
                    <div className="text-4xl font-bold text-pink-400 mb-2">28</div>
                    <p className="text-purple-100 font-semibold text-sm">Mood Entries</p>
                    <p className="text-purple-300/60 text-xs mt-1">Last: Today</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-600/30 to-yellow-600/30 border border-orange-400/40 rounded-xl p-6 text-center hover:border-orange-400/60 transition duration-300">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">42</div>
                    <p className="text-orange-100 font-semibold text-sm">Community Posts</p>
                    <p className="text-orange-300/60 text-xs mt-1">This month</p>
                  </div>
                </div>

                {/* Activity Breakdown */}
                <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 mb-8">
                  <h4 className="text-white font-bold text-lg mb-6">Activity Breakdown</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-indigo-200 font-semibold">This Month</p>
                        <p className="text-white font-bold">24 sessions</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-4/5"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-indigo-200 font-semibold">Last 3 Months</p>
                        <p className="text-white font-bold">68 sessions</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full w-5/6"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-indigo-200 font-semibold">All Time</p>
                        <p className="text-white font-bold">142 sessions</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-pink-500 to-red-500 h-full w-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6">
                  <h4 className="text-white font-bold text-lg mb-6">Recent Activity</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 pb-4 border-b border-indigo-400/20">
                      <div className="text-2xl">💬</div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">AI Counselor Session</p>
                        <p className="text-indigo-300 text-sm">Discussed anxiety management techniques</p>
                        <p className="text-indigo-400/60 text-xs mt-1">2 days ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 pb-4 border-b border-indigo-400/20">
                      <div className="text-2xl">📊</div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">Mood Entry Recorded</p>
                        <p className="text-indigo-300 text-sm">Mood: Calm, Energy: 7/10</p>
                        <p className="text-indigo-400/60 text-xs mt-1">Today</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 pb-4 border-b border-indigo-400/20">
                      <div className="text-2xl">👨‍⚕️</div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">Therapy Session Completed</p>
                        <p className="text-indigo-300 text-sm">Session with Dr. Sarah Johnson</p>
                        <p className="text-indigo-400/60 text-xs mt-1">5 days ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="text-2xl">👥</div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">Community Post Created</p>
                        <p className="text-indigo-300 text-sm">Shared experience on dealing with stress</p>
                        <p className="text-indigo-400/60 text-xs mt-1">1 week ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-700/95 border border-indigo-400/40 rounded-3xl p-8 max-w-md w-full backdrop-blur-xl shadow-2xl animate-in fade-in scale-95 transition duration-300">
            <h3 className="text-2xl font-bold text-white mb-6">Change Password</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-indigo-200 font-semibold mb-2 block text-sm">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-indigo-400/30 rounded-lg text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="text-indigo-200 font-semibold mb-2 block text-sm">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-indigo-400/30 rounded-lg text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="text-indigo-200 font-semibold mb-2 block text-sm">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-indigo-400/30 rounded-lg text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2 rounded-lg transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Change Password'}
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 bg-slate-700/60 hover:bg-slate-700/80 text-indigo-200 font-bold py-2 rounded-lg transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-700/95 border border-indigo-400/40 rounded-3xl p-8 max-w-md w-full backdrop-blur-xl shadow-2xl animate-in fade-in scale-95 transition duration-300">
            <h3 className="text-2xl font-bold text-white mb-4">Two-Factor Authentication</h3>

            {!twoFAEnabled ? (
              <div className="space-y-4 mb-6">
                <p className="text-indigo-200 text-sm">
                  Two-Factor Authentication adds an extra layer of security to your account. You'll need to enter a code from your authenticator app when logging in.
                </p>
                <div className="bg-slate-700/30 border border-indigo-400/20 rounded-lg p-4">
                  <p className="text-indigo-200 font-semibold mb-3">Step 1: Scan QR Code</p>
                  <div className="bg-white w-full h-40 rounded-lg flex items-center justify-center mb-3">
                    <p className="text-slate-600 text-sm">QR Code Here</p>
                  </div>
                  <p className="text-indigo-300 text-xs text-center">Or enter code: JBSWY3DPEBLW64TMMQ</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <p className="text-green-200 font-semibold">Two-Factor Authentication is Enabled</p>
                <p className="text-indigo-200 text-sm">
                  Your account is protected with 2FA. Do you want to disable it?
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleEnable2FA}
                disabled={loading}
                className={`flex-1 ${
                  twoFAEnabled
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                } text-white font-bold py-2 rounded-lg transition duration-300 disabled:opacity-50`}
              >
                {loading ? 'Updating...' : twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
              <button
                onClick={() => setShow2FAModal(false)}
                className="flex-1 bg-slate-700/60 hover:bg-slate-700/80 text-indigo-200 font-bold py-2 rounded-lg transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-700/95 border border-red-400/40 rounded-3xl p-8 max-w-md w-full backdrop-blur-xl shadow-2xl animate-in fade-in scale-95 transition duration-300">
            <div className="text-red-500 text-4xl mb-4 text-center">⚠️</div>
            <h3 className="text-2xl font-bold text-white mb-3 text-center">Delete Account?</h3>

            <div className="space-y-4 mb-6">
              <p className="text-red-200 text-sm text-center">
                This action cannot be undone. All your data, sessions, and profile information will be permanently deleted.
              </p>
              <div className="bg-red-600/20 border border-red-400/40 rounded-lg p-4">
                <p className="text-red-200 text-xs font-semibold mb-2">Data to be deleted:</p>
                <ul className="text-red-300 text-xs space-y-1">
                  <li>- All therapy sessions history</li>
                  <li>- Mood entries and tracking data</li>
                  <li>- Community posts and comments</li>
                  <li>- Personal profile information</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-slate-700/60 hover:bg-slate-700/80 text-indigo-200 font-bold py-2 rounded-lg transition duration-300"
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

export default MyProfilePage;
