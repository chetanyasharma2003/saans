import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Heart, Zap, CreditCard, TrendingUp, Clock, CheckCircle, AlertCircle, Loader, Sparkles, Target, Flame, Award, BookOpen, MessageSquare } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function DashboardPageNew() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [moodData, setMoodData] = useState(null);
  const [moodEntries, setMoodEntries] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [insights, setInsights] = useState([]);

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
        const entriesRes = await axios.get(`${API_URL}/api/mood?days=30&limit=30`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const entries = entriesRes.data.data || [];
        const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));
        const chartData = sortedEntries.map(e => ({
          date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          mood: e.mood || 0,
          stress: e.stress || 0,
          anxiety: e.anxiety || 0,
          energy: e.energy || 0,
          fullDate: new Date(e.date)
        }));
        setMoodEntries(chartData);

        // Calculate wellness score (0-100)
        if (entries.length > 0) {
          const avgMood = entries.reduce((sum, e) => sum + (e.mood || 0), 0) / entries.length;
          const avgStress = entries.reduce((sum, e) => sum + (e.stress || 0), 0) / entries.length;
          const avgAnxiety = entries.reduce((sum, e) => sum + (e.anxiety || 0), 0) / entries.length;
          const avgEnergy = entries.reduce((sum, e) => sum + (e.energy || 0), 0) / entries.length;

          // Better wellness score calculation
          const moodScore = (avgMood / 5) * 40;
          const energyScore = (avgEnergy / 5) * 30;
          const stressReduction = ((5 - avgStress) / 5) * 20;
          const anxietyReduction = ((5 - avgAnxiety) / 5) * 10;
          const score = moodScore + energyScore + stressReduction + anxietyReduction;
          setWellnessScore(Math.max(0, Math.min(100, Math.round(score))));

          // Calculate streak
          let currentStreak = 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const hasEntry = entries.some(e => {
              const eDate = new Date(e.date);
              eDate.setHours(0, 0, 0, 0);
              return eDate.getTime() === checkDate.getTime();
            });
            if (hasEntry) currentStreak++;
            else break;
          }
          setStreak(currentStreak);

          // Generate insights
          const newInsights = [];
          if (avgMood >= 4) newInsights.push({ icon: '😊', text: 'Amazing mood! You\'re crushing it!' });
          else if (avgMood >= 3) newInsights.push({ icon: '😌', text: 'Mood is stable. Keep it balanced!' });
          else newInsights.push({ icon: '💔', text: 'Mood is low. Reach out for support.' });

          if (avgStress > 3.5) newInsights.push({ icon: '😰', text: 'Stress high? Try breathing exercises.' });
          if (avgAnxiety > 3.5) newInsights.push({ icon: '😟', text: 'Anxiety elevated. Practice mindfulness.' });
          if (avgEnergy < 2.5) newInsights.push({ icon: '⚡', text: 'Energy low. Get more rest!' });
          if (currentStreak >= 7) newInsights.push({ icon: '🔥', text: `${currentStreak}-day streak! Amazing!` });

          setInsights(newInsights.length > 0 ? newInsights : [{ icon: '✨', text: 'Keep tracking for insights!' }]);
        } else {
          // Default state when no data
          setWellnessScore(0);
          setStreak(0);
          setInsights([{ icon: '📊', text: 'Start logging mood to see insights!' }]);
        }
      } catch (e) {
        console.error('Mood entries error:', e);
      }

      try {
        const subRes = await axios.get(`${API_URL}/api/subscriptions/active`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubscription(subRes.data.data);
      } catch (e) {
        console.error('Subscription error:', e);
        // Set default subscription data if endpoint fails
        setSubscription({ status: 'active', plan: 'free', features: {} });
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
  const avgMood = moodData?.averageMood ? `${moodData.averageMood}/5` : '0/5';

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
          {/* Hero Welcome Section */}
          <div className="mb-12 bg-gradient-to-br from-purple-600/30 via-pink-600/20 to-blue-600/30 border border-purple-400/30 rounded-3xl backdrop-blur-xl p-8 md:p-12 transform transition-all hover:border-purple-400/50">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                    Welcome back, {userData?.firstName || 'Friend'}! 👋
                  </h1>
                </div>
                <p className="text-lg text-purple-200 mb-6">Track your mental wellness and celebrate your progress every single day</p>

                {/* Quick Insights */}
                <div className="space-y-2">
                  {insights.map((insight, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-purple-100">
                      <span className="text-lg">{insight.icon}</span>
                      <span>{insight.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wellness Score Card */}
              <div className="bg-gradient-to-br from-purple-900/60 to-slate-900/60 border border-purple-400/40 rounded-2xl p-6 backdrop-blur-xl w-full md:w-64">
                <div className="text-center">
                  <p className="text-sm text-purple-300 mb-3 font-medium uppercase tracking-wide">YOUR WELLNESS SCORE</p>
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#334155" strokeWidth="8" opacity="0.3" />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth="8"
                        strokeDasharray={`${Math.max(0, (wellnessScore / 100) * 339.29)} 339.29`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.6s ease-out' }}
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white">{Math.round(wellnessScore)}</div>
                        <div className="text-xs text-purple-300">/ 100</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-purple-300 font-medium">
                    {moodEntries.length > 0 ? 'Calculated from your mood' : 'Log mood to calculate'}
                  </p>
                </div>
              </div>
            </div>

            {/* Streak Badge */}
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/40 rounded-xl px-4 py-3 flex items-center gap-3">
                <Flame className="w-6 h-6 text-orange-400" />
                <div>
                  <p className="text-sm text-orange-300 font-medium">Current Streak</p>
                  <p className="text-2xl font-bold text-orange-400">{streak} days</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/40 rounded-xl px-4 py-3 flex items-center gap-3">
                <Target className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-sm text-green-300 font-medium">Tracked This Month</p>
                  <p className="text-2xl font-bold text-green-400">{moodData?.totalEntries || 0} entries</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/40 rounded-xl px-4 py-3 flex items-center gap-3">
                <Award className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-sm text-blue-300 font-medium">Consistency</p>
                  <p className="text-2xl font-bold text-blue-400">{Math.round((moodData?.totalEntries || 0) / 30 * 100)}%</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-8 bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Subscription Card */}
            <div className="group bg-gradient-to-br from-purple-900/50 to-slate-900/40 border border-purple-400/30 rounded-2xl backdrop-blur-xl p-6 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <CreditCard className="w-6 h-6 text-purple-400" />
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  subscription?.status === 'active'
                    ? 'bg-green-500/30 text-green-300 border border-green-400/30'
                    : 'bg-gray-500/30 text-gray-300 border border-gray-400/30'
                }`}>
                  {subscription?.plan?.toUpperCase() || 'FREE'}
                </span>
              </div>
              <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Plan</p>
              <p className="text-white text-3xl font-bold mb-2">
                ₹{subscription?.price ? subscription.price.toLocaleString() : '0'}
              </p>
              <p className="text-xs text-purple-300">
                {subscription?.renewalDate ? `Renews ${new Date(subscription.renewalDate).toLocaleDateString()}` : 'Always free'}
              </p>
            </div>

            {/* Sessions Card */}
            <div className="group bg-gradient-to-br from-blue-900/50 to-slate-900/40 border border-blue-400/30 rounded-2xl backdrop-blur-xl p-6 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xs text-blue-300 font-semibold">This Month</span>
              </div>
              <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Sessions</p>
              <p className="text-white text-3xl font-bold mb-2">{completedAppointments.length}</p>
              <p className="text-xs text-blue-300">Completed</p>
            </div>

            {/* Mood Card */}
            <div className="group bg-gradient-to-br from-pink-900/50 to-slate-900/40 border border-pink-400/30 rounded-2xl backdrop-blur-xl p-6 hover:border-pink-400/60 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-pink-500/20 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-400" />
                </div>
                <span className="text-xs text-pink-300 font-semibold">Trending</span>
              </div>
              <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Mood</p>
              <p className="text-white text-3xl font-bold mb-2">{avgMood}/5</p>
              <p className="text-xs text-pink-300">30-day average</p>
            </div>

            {/* Investment Card */}
            <div className="group bg-gradient-to-br from-green-900/50 to-slate-900/40 border border-green-400/30 rounded-2xl backdrop-blur-xl p-6 hover:border-green-400/60 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-xs text-green-300 font-semibold">Growth</span>
              </div>
              <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Invested</p>
              <p className="text-white text-3xl font-bold mb-2">₹{totalSpent.toLocaleString()}</p>
              <p className="text-xs text-green-300">In wellness</p>
            </div>
          </div>

          {/* Premium Tabs */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-4 border-b border-purple-500/20">
            {[
              { id: 'overview', label: 'Overview', icon: Sparkles },
              { id: 'appointments', label: 'Sessions', icon: Calendar },
              { id: 'mood', label: 'Mood Insights', icon: Heart },
              { id: 'billing', label: 'Billing', icon: CreditCard }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-6 py-3 rounded-lg whitespace-nowrap transition-all font-medium flex items-center gap-2 border ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/60 shadow-lg shadow-purple-500/30'
                    : 'bg-slate-800/30 text-gray-400 hover:text-purple-300 hover:border-purple-400/30 border-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Wellness Metrics */}
                <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/40 border border-purple-400/30 rounded-2xl backdrop-blur-xl p-8 hover:border-purple-400/50 transition-all">
                  <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    Your Wellness Progress
                  </h3>
                  <div className="space-y-6">
                    {/* Therapy Engagement */}
                    <div className="group">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-300 font-medium">Therapy Engagement</span>
                        <span className="text-sm font-bold bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                          {Math.round((completedAppointments.length / 12) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-3 overflow-hidden border border-slate-600/30">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-400 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(completedAppointments.length / 12) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Mood Improvement */}
                    <div className="group">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-300 font-medium">Mood Consistency</span>
                        <span className="text-sm font-bold bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full">
                          {Math.max(0, Math.round((moodData?.totalEntries || 0) / 30 * 100))}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-3 overflow-hidden border border-slate-600/30">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-pink-400 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(0, Math.round((moodData?.totalEntries || 0) / 30 * 100))}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stress Management */}
                    <div className="group">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-300 font-medium">Stress Control</span>
                        <span className="text-sm font-bold bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">
                          {Math.round(Math.max(0, (5 - (moodData?.averageStress || 0)) / 5 * 100))}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-3 overflow-hidden border border-slate-600/30">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.round(Math.max(0, (5 - (moodData?.averageStress || 0)) / 5 * 100))}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Energy Level */}
                    <div className="group">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-300 font-medium">Energy Level</span>
                        <span className="text-sm font-bold bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">
                          {Math.round((moodData?.averageEnergy || 0) / 5 * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-3 overflow-hidden border border-slate-600/30">
                        <div
                          className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.round((moodData?.averageEnergy || 0) / 5 * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary CTA */}
                  <button
                    onClick={() => navigate('/mood')}
                    className="group bg-gradient-to-br from-pink-600/80 to-purple-600/80 border border-pink-400/60 rounded-2xl backdrop-blur-xl p-8 hover:border-pink-400/80 hover:shadow-lg hover:shadow-pink-500/30 transition-all transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all">
                        <Heart className="w-6 h-6 text-pink-200" />
                      </div>
                      <Sparkles className="w-5 h-5 text-pink-200 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2 text-left">Log Today's Mood</h4>
                    <p className="text-sm text-pink-100 text-left">Track your emotional wellbeing and see your progress</p>
                  </button>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/appointments')}
                      className="w-full p-4 bg-gradient-to-br from-blue-900/50 to-slate-900/40 border border-blue-400/30 hover:border-blue-400/60 rounded-xl transition-all text-left flex items-center justify-between group hover:shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="text-white font-medium">Book a Session</p>
                          <p className="text-xs text-gray-400">Connect with therapist</p>
                        </div>
                      </div>
                      <TrendingUp className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                    <button
                      onClick={() => navigate('/community')}
                      className="w-full p-4 bg-gradient-to-br from-green-900/50 to-slate-900/40 border border-green-400/30 hover:border-green-400/60 rounded-xl transition-all text-left flex items-center justify-between group hover:shadow-lg hover:shadow-green-500/20 transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="text-white font-medium">Join Community</p>
                          <p className="text-xs text-gray-400">Share & support others</p>
                        </div>
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-400 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                    <button
                      onClick={() => navigate('/resources')}
                      className="w-full p-4 bg-gradient-to-br from-indigo-900/50 to-slate-900/40 border border-indigo-400/30 hover:border-indigo-400/60 rounded-xl transition-all text-left flex items-center justify-between group hover:shadow-lg hover:shadow-indigo-500/20 transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="text-white font-medium">Explore Resources</p>
                          <p className="text-xs text-gray-400">Learn & grow</p>
                        </div>
                      </div>
                      <TrendingUp className="w-5 h-5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
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
                        <div key={apt.id} className="bg-slate-800/30 p-4 rounded-lg flex items-start justify-between">
                          <div>
                            <p className="text-white font-semibold mb-1">
                              Session with Therapist
                            </p>
                            <div className="flex gap-4 text-sm text-gray-400">
                              <span>📅 {new Date(apt.scheduledAt).toLocaleDateString()}</span>
                              <span>🕐 {new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span>⏱️ {apt.duration} min</span>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                            {apt.status?.charAt(0).toUpperCase() + apt.status?.slice(1)}
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
                      <div key={apt.id} className="bg-slate-800/30 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">
                            {new Date(apt.scheduledAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">Rating: {apt.feedbackRating || 'N/A'} ⭐</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mood Tab - Premium */}
            {activeTab === 'mood' && (
              <div className="space-y-8">
                {/* Main Mood Chart */}
                <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/40 border border-purple-400/30 rounded-2xl backdrop-blur-xl p-8 hover:border-purple-400/50 transition-all">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-purple-400" />
                        30-Day Mood Trend
                      </h3>
                      <p className="text-sm text-gray-400 mt-2">Visual track of your emotional wellness</p>
                    </div>
                  </div>

                  {moodEntries.length > 0 ? (
                    <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={moodEntries} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                          <XAxis
                            dataKey="date"
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            tickLine={{ stroke: '#475569' }}
                          />
                          <YAxis
                            domain={[0, 5]}
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            tickLine={{ stroke: '#475569' }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1e293b',
                              border: '2px solid #a855f7',
                              borderRadius: '12px',
                              boxShadow: '0 4px 6px rgba(168, 85, 247, 0.1)'
                            }}
                            labelStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}
                            formatter={(value, name) => {
                              const labels = { mood: 'Mood', stress: 'Stress', anxiety: 'Anxiety', energy: 'Energy' };
                              return [value.toFixed(1), labels[name] || name];
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="mood"
                            stroke="#a855f7"
                            fillOpacity={1}
                            fill="url(#moodGradient)"
                            strokeWidth={3}
                            name="mood"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="bg-slate-800/30 p-12 rounded-xl text-center border border-slate-700/50">
                      <Heart className="w-12 h-12 text-purple-400/40 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No mood entries yet</p>
                      <button
                        onClick={() => navigate('/mood')}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-all"
                      >
                        Start Tracking
                      </button>
                    </div>
                  )}
                </div>

                {/* Wellness Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="group bg-gradient-to-br from-pink-900/50 to-slate-900/40 border border-pink-400/30 rounded-xl backdrop-blur-xl p-6 hover:border-pink-400/60 hover:shadow-lg hover:shadow-pink-500/20 transition-all transform hover:-translate-y-1">
                    <p className="text-xs text-pink-300 font-semibold mb-2 uppercase tracking-wide">Avg Mood</p>
                    <p className="text-4xl font-bold text-pink-300">{moodData?.averageMood?.toFixed(1) || 0}</p>
                    <p className="text-xs text-pink-400/60 mt-1">out of 5</p>
                    <div className="mt-3 flex gap-1">
                      {[...Array(Math.round(moodData?.averageMood || 0))].map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-pink-400 rounded-full"></div>
                      ))}
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-orange-900/50 to-slate-900/40 border border-orange-400/30 rounded-xl backdrop-blur-xl p-6 hover:border-orange-400/60 hover:shadow-lg hover:shadow-orange-500/20 transition-all transform hover:-translate-y-1">
                    <p className="text-xs text-orange-300 font-semibold mb-2 uppercase tracking-wide">Stress Level</p>
                    <p className="text-4xl font-bold text-orange-300">{moodData?.averageStress?.toFixed(1) || 0}</p>
                    <p className="text-xs text-orange-400/60 mt-1">out of 5</p>
                    <div className="mt-3 h-2 bg-slate-700/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                        style={{ width: `${(moodData?.averageStress || 0) / 5 * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-red-900/50 to-slate-900/40 border border-red-400/30 rounded-xl backdrop-blur-xl p-6 hover:border-red-400/60 hover:shadow-lg hover:shadow-red-500/20 transition-all transform hover:-translate-y-1">
                    <p className="text-xs text-red-300 font-semibold mb-2 uppercase tracking-wide">Anxiety Level</p>
                    <p className="text-4xl font-bold text-red-300">{moodData?.averageAnxiety?.toFixed(1) || 0}</p>
                    <p className="text-xs text-red-400/60 mt-1">out of 5</p>
                    <div className="mt-3 h-2 bg-slate-700/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                        style={{ width: `${(moodData?.averageAnxiety || 0) / 5 * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-yellow-900/50 to-slate-900/40 border border-yellow-400/30 rounded-xl backdrop-blur-xl p-6 hover:border-yellow-400/60 hover:shadow-lg hover:shadow-yellow-500/20 transition-all transform hover:-translate-y-1">
                    <p className="text-xs text-yellow-300 font-semibold mb-2 uppercase tracking-wide">Energy Level</p>
                    <p className="text-4xl font-bold text-yellow-300">{moodData?.averageEnergy?.toFixed(1) || 0}</p>
                    <p className="text-xs text-yellow-400/60 mt-1">out of 5</p>
                    <div className="mt-3 h-2 bg-slate-700/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-full"
                        style={{ width: `${(moodData?.averageEnergy || 0) / 5 * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Mood Breakdown */}
                <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900/40 border border-indigo-400/30 rounded-2xl backdrop-blur-xl p-8 hover:border-indigo-400/50 transition-all">
                  <h3 className="text-xl font-bold text-white mb-6">Mood Breakdown</h3>
                  <div className="grid grid-cols-5 gap-4 text-center">
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                      <p className="text-4xl mb-2">😢</p>
                      <p className="text-xs text-gray-400">Very Bad</p>
                      <p className="text-2xl font-bold text-red-400 mt-2">{moodData?.moodBreakdown?.veryBad || 0}</p>
                    </div>
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                      <p className="text-4xl mb-2">😕</p>
                      <p className="text-xs text-gray-400">Bad</p>
                      <p className="text-2xl font-bold text-orange-400 mt-2">{moodData?.moodBreakdown?.bad || 0}</p>
                    </div>
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 ring-2 ring-purple-400/50">
                      <p className="text-4xl mb-2">😐</p>
                      <p className="text-xs text-gray-400">Neutral</p>
                      <p className="text-2xl font-bold text-yellow-400 mt-2">{moodData?.moodBreakdown?.neutral || 0}</p>
                    </div>
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                      <p className="text-4xl mb-2">😊</p>
                      <p className="text-xs text-gray-400">Good</p>
                      <p className="text-2xl font-bold text-green-400 mt-2">{moodData?.moodBreakdown?.good || 0}</p>
                    </div>
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                      <p className="text-4xl mb-2">😄</p>
                      <p className="text-xs text-gray-400">Excellent</p>
                      <p className="text-2xl font-bold text-emerald-400 mt-2">{moodData?.moodBreakdown?.excellent || 0}</p>
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
