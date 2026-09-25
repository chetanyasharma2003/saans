import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Zap, Activity, BarChart3, PieChart, LineChart, AlertCircle, Loader, Check, X } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AdminDashboardNew() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [therapists, setTherapists] = useState(null);
  const [subscriptions, setSubscriptions] = useState(null);
  const [appointments, setAppointments] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [overviewRes, revenueRes, engagementRes, therapistsRes, subscriptionsRes, appointmentsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/analytics/overview`, { headers }),
        axios.get(`${API_URL}/api/admin/analytics/revenue`, { headers }),
        axios.get(`${API_URL}/api/admin/analytics/engagement`, { headers }),
        axios.get(`${API_URL}/api/admin/analytics/therapist-performance`, { headers }),
        axios.get(`${API_URL}/api/admin/analytics/subscriptions`, { headers }),
        axios.get(`${API_URL}/api/admin/analytics/appointments`, { headers })
      ]);

      setOverview(overviewRes.data.data);
      setRevenue(revenueRes.data.data);
      setEngagement(engagementRes.data.data);
      setTherapists(therapistsRes.data.data);
      setSubscriptions(subscriptionsRes.data.data);
      setAppointments(appointmentsRes.data.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

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
        <DashboardHeader title="Admin Analytics" showBackButton={false} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {error && (
            <div className="mb-8 bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Key Metrics - 5 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {/* Total Users */}
            <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 border border-blue-500/30 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-green-400">+{overview?.users?.thisMonthSignups || 0}</span>
              </div>
              <p className="text-gray-400 text-xs mb-1">Total Users</p>
              <p className="text-white text-2xl font-bold">{overview?.users?.total || 0}</p>
              <p className="text-xs text-blue-300 mt-2">{overview?.users?.active || 0} active</p>
            </div>

            {/* Revenue */}
            <div className="bg-gradient-to-br from-green-900/40 to-slate-900/40 border border-green-500/30 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-gray-400 text-xs mb-1">Total Revenue</p>
              <p className="text-white text-2xl font-bold">₹{(overview?.revenue?.total || 0).toLocaleString()}</p>
              <p className="text-xs text-green-300 mt-2">This month: ₹{(overview?.revenue?.thisMonth || 0).toLocaleString()}</p>
            </div>

            {/* Appointments */}
            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-gray-400 text-xs mb-1">Appointments</p>
              <p className="text-white text-2xl font-bold">{overview?.appointments?.total || 0}</p>
              <p className="text-xs text-purple-300 mt-2">{overview?.appointments?.completionRate} completed</p>
            </div>

            {/* Active Therapists */}
            <div className="bg-gradient-to-br from-pink-900/40 to-slate-900/40 border border-pink-500/30 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-pink-400" />
              </div>
              <p className="text-gray-400 text-xs mb-1">Therapists</p>
              <p className="text-white text-2xl font-bold">{overview?.therapists?.active || 0}</p>
              <p className="text-xs text-pink-300 mt-2">{overview?.therapists?.verificationRate} verified</p>
            </div>

            {/* MRR */}
            <div className="bg-gradient-to-br from-yellow-900/40 to-slate-900/40 border border-yellow-500/30 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-gray-400 text-xs mb-1">MRR</p>
              <p className="text-white text-2xl font-bold">₹{(overview?.subscriptions?.monthlyRecurringRevenue || 0).toLocaleString()}</p>
              <p className="text-xs text-yellow-300 mt-2">{overview?.subscriptions?.active || 0} active</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {['overview', 'revenue', 'engagement', 'therapists', 'subscriptions', 'appointments'].map((tab) => (
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
                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" /> User Growth
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-300">Total Users</span>
                        <span className="text-sm font-bold text-white">{overview?.users?.total || 0}</span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-300">Active This Month</span>
                        <span className="text-sm font-bold text-white">{overview?.users?.active || 0}</span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-300">New Signups This Month</span>
                        <span className="text-sm font-bold text-white">{overview?.users?.thisMonthSignups || 0}</span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5" /> Appointment Health
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-300">Total Appointments</span>
                        <span className="text-sm font-bold text-white">{overview?.appointments?.total || 0}</span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-300">Completed Sessions</span>
                        <span className="text-sm font-bold text-white">{overview?.appointments?.completed || 0}</span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${parseInt(overview?.appointments?.completionRate || 0)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-300">This Month Bookings</span>
                        <span className="text-sm font-bold text-white">{overview?.appointments?.thisMonth || 0}</span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '52%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && revenue && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Revenue Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800/30 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm mb-2">Total Revenue</p>
                      <p className="text-white text-3xl font-bold">₹{revenue.summary?.totalRevenue?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-slate-800/30 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm mb-2">Daily Average</p>
                      <p className="text-white text-3xl font-bold">₹{parseInt(revenue.summary?.avgDailyRevenue || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-800/30 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm mb-2">Total Transactions</p>
                      <p className="text-white text-3xl font-bold">{revenue.summary?.totalTransactions || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Revenue by Plan</h3>
                  <div className="space-y-3">
                    {revenue.revenueByPlan?.map((plan, idx) => (
                      <div key={idx} className="bg-slate-800/30 p-4 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold capitalize">{plan._id} Plan</p>
                          <p className="text-xs text-gray-400">{plan.count} subscriptions</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">₹{plan.totalMonthly?.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">{plan.active} active</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Engagement Tab */}
            {activeTab === 'engagement' && engagement && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Event Distribution</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {engagement.eventStats?.map((event, idx) => (
                      <div key={idx} className="bg-slate-800/30 p-3 rounded-lg flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{event._id}</span>
                        <span className="text-white font-bold">{event.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Feature Adoption</h3>
                  <div className="space-y-3">
                    {engagement.featureAdoption?.slice(0, 5).map((feature, idx) => (
                      <div key={idx} className="bg-slate-800/30 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-white font-medium">{feature._id}</span>
                          <span className="text-purple-300 text-sm">{feature.uniqueUserCount} users</span>
                        </div>
                        <div className="w-full bg-slate-700/30 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${(feature.uniqueUserCount / 9) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Therapists Tab */}
            {activeTab === 'therapists' && therapists && (
              <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Therapist Performance Ranking</h3>
                <div className="space-y-3">
                  {therapists?.map((therapist, idx) => (
                    <div key={idx} className="bg-slate-800/30 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-white font-semibold text-lg">#{idx + 1}</span>
                          <div>
                            <p className="text-white font-medium">{therapist.therapistName}</p>
                            <p className="text-xs text-gray-400">{therapist.sessions} sessions completed</p>
                          </div>
                        </div>
                        <div className="w-48 bg-slate-700/30 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${(therapist.sessions / 25) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">₹{therapist.totalEarnings?.toLocaleString()}</p>
                        <p className="text-yellow-300 font-semibold">{therapist.avgRating} ⭐</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && subscriptions && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Subscriptions by Plan</h3>
                  <div className="space-y-3">
                    {subscriptions.byPlan?.map((plan, idx) => (
                      <div key={idx} className="bg-slate-800/30 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-white font-semibold capitalize">{plan._id} Plan</span>
                          <span className="text-purple-300">{plan.count} subscribers</span>
                        </div>
                        <p className="text-xs text-gray-400">₹{plan.avgPrice?.toLocaleString()} avg • {plan.active} active</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Churn Metrics</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-800/30 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm mb-2">Cancelled (30 days)</p>
                      <p className="text-white text-3xl font-bold">{subscriptions.churnMetrics?.cancelledLast30Days || 0}</p>
                    </div>
                    <div className="bg-slate-800/30 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm mb-2">Started (30 days)</p>
                      <p className="text-white text-3xl font-bold">{subscriptions.churnMetrics?.startedLast30Days || 0}</p>
                    </div>
                    <div className="bg-red-600/20 border border-red-500/30 p-4 rounded-lg">
                      <p className="text-gray-300 text-sm mb-2">Churn Rate</p>
                      <p className="text-red-300 text-3xl font-bold">{subscriptions.churnMetrics?.churnRate}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && appointments && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Appointment Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {appointments.appointmentStats?.map((stat, idx) => (
                      <div key={idx} className="bg-slate-800/30 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm mb-2 capitalize">{stat._id}</p>
                        <p className="text-white text-3xl font-bold">{stat.count}</p>
                        <p className="text-xs text-gray-400 mt-2">Avg: ₹{parseInt(stat.avgPrice || 0).toLocaleString()}</p>
                        {stat.avgRating && <p className="text-xs text-yellow-300 mt-1">{stat.avgRating} ⭐</p>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Quality Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm mb-2">No-Show Rate</p>
                      <p className="text-white text-3xl font-bold">{(appointments.noShowMetrics?.noShowPercentage || 0).toFixed(2)}%</p>
                    </div>
                    <div className="bg-slate-800/30 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm mb-2">Total Bookings (30d)</p>
                      <p className="text-white text-3xl font-bold">{appointments.bookingTrend?.length || 0}</p>
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

export default AdminDashboardNew;
