import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout, setUser } from '../redux/slices/authSlice';
import { RootState } from '../redux/store';
import PaymentModal from '../components/PaymentModal';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileForm from '../components/Profile/ProfileForm';
import SubscriptionCard from '../components/Profile/SubscriptionCard';
import SubscriptionPlans from '../components/Profile/SubscriptionPlans';
import ChangePasswordForm from '../components/Profile/ChangePasswordForm';
import SettingsMenu from '../components/Profile/SettingsMenu';

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
              <ProfileHeader
                name={formData.name}
                email={formData.email}
                avatarColor={avatarColor}
                avatarColors={avatarColors}
                onEditClick={() => setEditMode(!editMode)}
                onAvatarColorChange={setAvatarColor}
              />

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
              editMode ? (
                <ProfileForm
                  formData={formData}
                  loading={loading}
                  onFieldChange={handleChange}
                  onSave={handleSaveProfile}
                  onCancel={() => setEditMode(false)}
                />
              ) : (
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-indigo-400/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
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
                </div>
              )
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <SettingsMenu
                activeSettingsTab={activeSettingsTab}
                onTabChange={setActiveSettingsTab}
                profileSettings={profileSettings}
                twoFAEnabled={twoFAEnabled}
                emailNotifications={emailNotifications}
                pushNotifications={pushNotifications}
                onPasswordChange={() => setShowPasswordModal(true)}
                on2FAChange={() => setShow2FAModal(true)}
                onProfileSettingsChange={handleProfileSettingsChange}
                onEmailNotificationsChange={setEmailNotifications}
                onPushNotificationsChange={setPushNotifications}
                onDeleteAccount={() => setShowDeleteModal(true)}
              />
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-8">
                {/* Current Subscription Status */}
                <SubscriptionCard
                  isActive={subscriptionStatus?.isActive || false}
                  subscriptionType={subscriptionStatus?.subscription?.type}
                  daysRemaining={subscriptionStatus?.daysRemaining}
                  price={subscriptionPlans.find(p => p.id === subscriptionStatus?.subscription?.type)?.price || 0}
                  features={subscriptionStatus?.subscription?.features}
                  onViewActivity={() => setActiveTab('activity')}
                />

                {/* Available Plans Section */}
                <SubscriptionPlans
                  plans={subscriptionPlans}
                  currentPlanId={subscriptionStatus?.subscription?.type}
                  onPlanSelect={handlePlanSelect}
                />

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
      <ChangePasswordForm
        isOpen={showPasswordModal}
        passwordForm={passwordForm}
        loading={loading}
        onPasswordChange={handlePasswordChange}
        onSubmit={handleChangePassword}
        onClose={() => setShowPasswordModal(false)}
      />

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
