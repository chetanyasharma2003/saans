import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Heart, Zap, CreditCard, TrendingUp, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function DashboardPageNew() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [moodData, setMoodData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      // Fetch each endpoint separately to handle partial failures
      try {
        const userRes = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(userRes.data.data);
      } catch (e) {
        console.error('User profile error:', e);
      }

      try {
        const appointmentsRes = await axios.get(`${API_URL}/api/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(appointmentsRes.data.data || []);
      } catch (e) {
        console.error('Appointments error:', e);
      }

      try {
        const moodRes = await axios.get(`${API_URL}/api/mood/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMoodData(moodRes.data.data);
      } catch (e) {
        console.error('Mood stats error:', e);
      }

      try {
        const subRes = await axios.get(`${API_URL}/api/payments/subscription`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubscription(subRes.data.data);
      } catch (e) {
        console.error('Subscription error:', e);
        // Set default subscription data if endpoint fails
        setSubscription({ status: 'inactive', plan: null });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Some dashboard data could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(a =>
    a.status === 'confirmed' && new Date(a.scheduledAt) > new Date()
  ).slice(0, 3);

  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const totalSpent = appointments.reduce((sum, a) => sum + (a.price || 0), 0);
  const avgMood = moodData?.average || '0/5';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

      <div className="relative z-10">
        <DashboardHeader title="Dashboard" showBackButton={false} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Banner */}
          <div className="mb-12 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {userData?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-purple-300">Track your mental health journey and manage your wellness plan</p>
          </div>

          {error && (
            <div className="mb-8 bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Subscription Status */}
            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <CreditCard className="w-6 h-6 text-purple-400" />
                <span className={`text-xs px-3 py-1 rounded-full ${
                  subscription?.status === 'active'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {subscription?.plan?.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-2">Subscription</p>
              <p className="text-white text-2xl font-bold mb-2">
                ₹{subscription?.planDetails?.price?.toLocaleString()}
              </p>
              <p className="text-xs text-purple-300">
                Renews: {subscription?.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            {/* Appointments */}
            <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 border border-blue-500/30 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-gray-400 text-sm mb-2">This Month</p>
              <p className="text-white text-2xl font-bold mb-2">{completedAppointments.length}</p>
              <p className="text-xs text-blue-300">Sessions Completed</p>
            </div>

            {/* Mood Tracking */}
            <div className="bg-gradient-to-br from-pink-900/40 to-slate-900/40 border border-pink-500/30 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Heart className="w-6 h-6 text-pink-400" />
              </div>
              <p className="text-gray-400 text-sm mb-2">Average Mood</p>
              <p className="text-white text-2xl font-bold mb-2">{avgMood}/5</p>
              <p className="text-xs text-pink-300">30-day average</p>
            </div>

            {/* Total Investment */}
            <div className="bg-gradient-to-br from-green-900/40 to-slate-900/40 border border-green-500/30 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-gray-400 text-sm mb-2">Total Invested</p>
              <p className="text-white text-2xl font-bold mb-2">₹{totalSpent.toLocaleString()}</p>
              <p className="text-xs text-green-300">In your wellness</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {['overview', 'appointments', 'mood', 'billing'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg whitespace-nowrap transition-all font-medium ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/50 text-purple-300 hover:bg-slate-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Progress Chart */}
                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Your Wellness Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-300">Therapy Engagement</span>
                        <span className="text-sm font-bold text-purple-300">{Math.round((completedAppointments.length / 12) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(completedAppointments.length / 12) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-300">Mood Improvement</span>
                        <span className="text-sm font-bold text-pink-300">+35%</span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div className="bg-pink-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-300">Sleep Quality</span>
                        <span className="text-sm font-bold text-blue-300">+45%</span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/appointments')}
                      className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all text-left flex items-center justify-between group"
                    >
                      <span className="text-white font-medium">Book Session</span>
                      <Calendar className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => navigate('/mood')}
                      className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all text-left flex items-center justify-between group"
                    >
                      <span className="text-white font-medium">Track Mood</span>
                      <Heart className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => navigate('/resources')}
                      className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all text-left flex items-center justify-between group"
                    >
                      <span className="text-white font-medium">Explore Resources</span>
                      <Zap className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => navigate('/community')}
                      className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all text-left flex items-center justify-between group"
                    >
                      <span className="text-white font-medium">Join Community</span>
                      <Heart className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Upcoming Sessions</h3>
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.map((apt) => (
                        <div key={apt._id} className="bg-slate-800/30 p-4 rounded-lg flex items-start justify-between">
                          <div>
                            <p className="text-white font-semibold mb-1">
                              Session with {apt.therapistId?.name || 'Therapist'}
                            </p>
                            <div className="flex gap-4 text-sm text-gray-400">
                              <span>📅 {new Date(apt.startTime).toLocaleDateString()}</span>
                              <span>🕐 {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span>⏱️ {apt.sessionDuration} min</span>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                            Confirmed
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No upcoming sessions. Book your first therapy session!</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Recent Sessions ({completedAppointments.length})</h3>
                  <div className="space-y-3">
                    {completedAppointments.slice(0, 5).map((apt) => (
                      <div key={apt._id} className="bg-slate-800/30 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">
                            {new Date(apt.startTime).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">Rating: {apt.rating || 'N/A'} ⭐</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mood Tab */}
            {activeTab === 'mood' && (
              <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Mood Progress</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-300 mb-4">30-Day Mood Trend</p>
                    <div className="flex items-end gap-2 h-40 bg-slate-800/30 p-4 rounded-lg">
                      {/* Simple mood bar chart */}
                      {[3, 4, 2, 3, 5, 4, 3, 4].map((mood, i) => (
                        <div key={i} className="flex-1 bg-purple-500/30 rounded-t" style={{ height: `${(mood/5)*100}%`, opacity: 0.5 + (i/16) }}></div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">Best Mood</p>
                      <p className="text-white text-2xl font-bold">5.0</p>
                      <p className="text-xs text-gray-400 mt-1">Excellent</p>
                    </div>
                    <div className="bg-slate-800/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">Current Streak</p>
                      <p className="text-white text-2xl font-bold">8</p>
                      <p className="text-xs text-gray-400 mt-1">Days tracked</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Billing Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-purple-500/20">
                      <span className="text-gray-300">Current Plan</span>
                      <span className="text-white font-semibold capitalize">{subscription?.plan}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-purple-500/20">
                      <span className="text-gray-300">Monthly Cost</span>
                      <span className="text-white font-semibold">₹{subscription?.planDetails?.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-purple-500/20">
                      <span className="text-gray-300">Billing Cycle</span>
                      <span className="text-white font-semibold capitalize">{subscription?.planDetails?.billingCycle}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-300">Renewal Date</span>
                      <span className="text-white font-semibold">
                        {subscription?.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Payment Methods</h3>
                  <div className="space-y-3">
                    <div className="bg-slate-800/30 p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Stripe Card</p>
                        <p className="text-xs text-gray-400">•••• •••• •••• 4242</p>
                      </div>
                      <span className="text-xs px-3 py-1 bg-green-500/20 text-green-300 rounded">Default</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardPageNew;
