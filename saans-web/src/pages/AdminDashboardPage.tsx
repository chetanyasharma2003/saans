import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, BookOpen, Heart, MessageCircle, Eye, Settings, MoreVertical, Loader, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [pendingStories, setPendingStories] = useState([]);
  const [communityStats, setCommunityStats] = useState(null);
  const [appointmentStats, setAppointmentStats] = useState(null);
  const [resourceStats, setResourceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, storiesRes, communityRes, appointmentRes, resourceRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/dashboard/stats`, { headers }),
        axios.get(`${API_URL}/api/admin/moderation/stories`, { headers }),
        axios.get(`${API_URL}/api/admin/community/stats`, { headers }),
        axios.get(`${API_URL}/api/admin/appointments/stats`, { headers }),
        axios.get(`${API_URL}/api/admin/resources/stats`, { headers })
      ]);

      setStats(statsRes.data.data);
      setPendingStories(storiesRes.data.data || []);
      setCommunityStats(communityRes.data.data);
      setAppointmentStats(appointmentRes.data.data);
      setResourceStats(resourceRes.data.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStory = async (storyId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/api/admin/moderation/stories/${storyId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingStories(pendingStories.filter(s => s._id !== storyId));
      alert('Story approved!');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to approve story');
    }
  };

  const handleRejectStory = async (storyId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/api/admin/moderation/stories/${storyId}/reject`,
        { reason: 'Content policy violation' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingStories(pendingStories.filter(s => s._id !== storyId));
      alert('Story rejected!');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to reject story');
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
      <div className="relative z-10">
        <DashboardHeader title="Admin Dashboard" showBackButton={false} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-green-400 mt-1">+{stats?.monthlyNewUsers || 0} this month</p>
                </div>
                <Users className="w-10 h-10 text-purple-400 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Therapists</p>
                  <p className="text-3xl font-bold text-white">{stats?.totalTherapists || 0}</p>
                  <p className="text-xs text-blue-400 mt-1">Active</p>
                </div>
                <Heart className="w-10 h-10 text-pink-400 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Appointments</p>
                  <p className="text-3xl font-bold text-white">{stats?.totalAppointments || 0}</p>
                  <p className="text-xs text-green-400 mt-1">{stats?.appointmentCompletionRate}% complete</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-400 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Revenue (₹)</p>
                  <p className="text-3xl font-bold text-white">{(stats?.estimatedRevenue / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-yellow-400 mt-1">Estimated</p>
                </div>
                <TrendingUp className="w-10 h-10 text-yellow-400 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Stories</p>
                  <p className="text-3xl font-bold text-white">{stats?.community?.totalStories || 0}</p>
                  <p className="text-xs text-orange-400 mt-1">{stats?.community?.pendingStories || 0} pending</p>
                </div>
                <BookOpen className="w-10 h-10 text-orange-400 opacity-50" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-purple-500/20">
            {['overview', 'moderation', 'community', 'appointments', 'resources'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium transition-all ${
                  activeTab === tab
                    ? 'border-b-2 border-purple-500 text-purple-300'
                    : 'text-gray-400 hover:text-purple-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Moderation Tab */}
          {activeTab === 'moderation' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Story Moderation ({pendingStories?.length || 0} pending)</h2>

              {pendingStories?.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-50" />
                  <p className="text-gray-400">All stories approved! ✨</p>
                </div>
              ) : (
                pendingStories?.map((story) => (
                  <div
                    key={story?._id}
                    className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{story?.title}</h3>
                        <p className="text-sm text-purple-300">By {story?.userId?.firstName} • {story?.category}</p>
                      </div>
                      <span className="text-xs bg-yellow-600/30 text-yellow-300 px-3 py-1 rounded-full">
                        🔔 Pending
                      </span>
                    </div>

                    <p className="text-gray-300 mb-4 line-clamp-2">{story?.content}</p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveStory(story?._id)}
                        className="flex-1 px-4 py-2 bg-green-600/30 text-green-300 border border-green-600/50 rounded-lg hover:bg-green-600/40 transition flex items-center justify-center gap-2 font-bold"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectStory(story?._id)}
                        className="flex-1 px-4 py-2 bg-red-600/30 text-red-300 border border-red-600/50 rounded-lg hover:bg-red-600/40 transition flex items-center justify-center gap-2 font-bold"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Community Stats Tab */}
          {activeTab === 'community' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Stories by Status</h3>
                <div className="space-y-3">
                  {communityStats?.stories?.byStatus?.map((item) => (
                    <div key={item?._id} className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize">{item?._id}</span>
                      <span className="font-bold text-white">{item?.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Groups</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Groups</span>
                    <span className="font-bold text-white">{communityStats?.groups?.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Active Groups</span>
                    <span className="font-bold text-white">{communityStats?.groups?.activeGroups}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Appointments by Status</h3>
              <div className="space-y-3">
                {appointmentStats?.byStatus?.map((item) => (
                  <div key={item?._id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <span className="text-gray-300 capitalize">{item?._id}</span>
                    <span className="font-bold text-white">{item?.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-5 h-5 text-blue-400" />
                    <p className="text-gray-400">Total Views</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{resourceStats?.totalViews?.toLocaleString() || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    <p className="text-gray-400">Resources</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{resourceStats?.resourceCount || 0}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Top Resources</h3>
                <div className="space-y-3">
                  {resourceStats?.topResources?.map((resource, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <span className="text-gray-300">{resource?.condition?.name}</span>
                      <div className="flex gap-4">
                        <span className="text-xs text-blue-300">{resource?.views} views</span>
                        <span className="text-xs text-purple-300">{resource?.saves} saved</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">🎯 Key Metrics</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>Users: <span className="font-bold text-white">{stats?.totalUsers}</span></p>
                  <p>Active Therapists: <span className="font-bold text-white">{stats?.totalTherapists}</span></p>
                  <p>Appointments: <span className="font-bold text-white">{stats?.totalAppointments}</span></p>
                  <p>Completion Rate: <span className="font-bold text-white">{stats?.appointmentCompletionRate}%</span></p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">📚 Community</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>Stories: <span className="font-bold text-white">{stats?.community?.totalStories}</span></p>
                  <p>Groups: <span className="font-bold text-white">{stats?.community?.totalGroups}</span></p>
                  <p>Pending: <span className="font-bold text-orange-400">{stats?.community?.pendingStories}</span></p>
                  <p>Approved: <span className="font-bold text-green-400">{stats?.community?.approvedStories}</span></p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">💰 Revenue</h3>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-yellow-400">₹{(stats?.estimatedRevenue || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-300">From {stats?.completedAppointments} completed appointments</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
