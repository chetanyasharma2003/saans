import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store';
import { SidebarNav } from '../components/SidebarNav';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Mock data for upcoming appointments
  const upcomingAppointments = [
    {
      id: 1,
      therapist: 'Dr. Sarah Johnson',
      specialty: 'Anxiety & Stress Management',
      date: 'Today',
      time: '3:00 PM',
      avatar: '👩‍⚕️',
      status: 'Confirmed',
    },
    {
      id: 2,
      therapist: 'Dr. Michael Chen',
      specialty: 'Depression Support',
      date: 'Tomorrow',
      time: '2:30 PM',
      avatar: '👨‍⚕️',
      status: 'Scheduled',
    },
    {
      id: 3,
      therapist: 'Dr. Priya Patel',
      specialty: 'Cognitive Behavioral Therapy',
      date: 'Aug 15',
      time: '4:00 PM',
      avatar: '👩‍⚕️',
      status: 'Scheduled',
    },
  ];

  // Mock data for recommended therapists
  const recommendedTherapists = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Anxiety & Stress',
      rating: 4.9,
      reviews: 128,
      price: '₹299',
      availability: 'Today',
      avatar: '👩‍⚕️',
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Depression Support',
      rating: 4.8,
      reviews: 95,
      price: '₹249',
      availability: 'Tomorrow',
      avatar: '👨‍⚕️',
    },
    {
      id: 3,
      name: 'Dr. Priya Patel',
      specialty: 'CBT Specialist',
      rating: 4.9,
      reviews: 156,
      price: '₹349',
      availability: 'Aug 15',
      avatar: '👩‍⚕️',
    },
  ];

  // Mock data for recent activity
  const recentActivity = [
    {
      id: 1,
      type: 'mood',
      message: 'You logged your mood: Happy 😊',
      timestamp: '2 hours ago',
      icon: '📊',
    },
    {
      id: 2,
      type: 'chat',
      message: 'Completed AI Counselor session',
      timestamp: '5 hours ago',
      icon: '💬',
    },
    {
      id: 3,
      type: 'community',
      message: 'Posted in Mental Wellness group',
      timestamp: '1 day ago',
      icon: '👥',
    },
    {
      id: 4,
      type: 'milestone',
      message: 'Reached 7-day activity streak!',
      timestamp: '1 day ago',
      icon: '🎯',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Sidebar Navigation - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block">
        <SidebarNav />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border-b border-white/10 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-teal-100 text-lg">
                  Your mental health journey continues. Here's what's happening today.
                </p>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-white/70 text-sm">Today is</p>
                <p className="text-white font-semibold">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="group bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 hover:border-blue-400/60 rounded-xl p-6 backdrop-blur-sm transition hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-2">Chat Sessions</p>
                  <div className="text-4xl font-bold text-cyan-400">5</div>
                  <p className="text-blue-200/50 text-xs mt-2">This month</p>
                </div>
                <span className="text-3xl transform group-hover:scale-110 transition duration-300">💬</span>
              </div>
              <div className="mt-4 h-1 bg-blue-400/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 w-5/12 rounded-full"></div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 hover:border-green-400/60 rounded-xl p-6 backdrop-blur-sm transition hover:shadow-2xl hover:shadow-green-500/10 cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-2">Therapy Sessions</p>
                  <div className="text-4xl font-bold text-emerald-400">3</div>
                  <p className="text-green-200/50 text-xs mt-2">Completed</p>
                </div>
                <span className="text-3xl transform group-hover:scale-110 transition duration-300">🎯</span>
              </div>
              <div className="mt-4 h-1 bg-green-400/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 w-3/12 rounded-full"></div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 hover:border-purple-400/60 rounded-xl p-6 backdrop-blur-sm transition hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-2">Mood Entries</p>
                  <div className="text-4xl font-bold text-pink-400">12</div>
                  <p className="text-purple-200/50 text-xs mt-2">This week</p>
                </div>
                <span className="text-3xl transform group-hover:scale-110 transition duration-300">📊</span>
              </div>
              <div className="mt-4 h-1 bg-purple-400/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 w-8/12 rounded-full"></div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 hover:border-orange-400/60 rounded-xl p-6 backdrop-blur-sm transition hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-2">Days Active</p>
                  <div className="text-4xl font-bold text-orange-400">15</div>
                  <p className="text-orange-200/50 text-xs mt-2">Streak 🔥</p>
                </div>
                <span className="text-3xl transform group-hover:scale-110 transition duration-300">⚡</span>
              </div>
              <div className="mt-4 h-1 bg-orange-400/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-red-400 w-11/12 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Upcoming Appointments */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Upcoming Appointments</h2>
                    <p className="text-white/50 text-sm mt-1">{upcomingAppointments.length} scheduled</p>
                  </div>
                  <button
                    onClick={() => navigate('/therapist')}
                    className="text-teal-400 hover:text-teal-300 text-sm font-semibold transition hover:bg-teal-400/10 px-3 py-1.5 rounded-lg"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="group bg-gradient-to-r from-white/5 to-white/0 hover:from-white/10 hover:to-white/5 border border-white/10 hover:border-teal-400/30 rounded-xl p-4 transition cursor-pointer hover:shadow-lg hover:shadow-teal-500/10"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl flex-shrink-0 transform group-hover:scale-110 transition duration-300">{appointment.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold group-hover:text-teal-300 transition">{appointment.therapist}</h3>
                          <p className="text-white/60 text-sm">{appointment.specialty}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            <span className="text-teal-400 text-xs font-semibold px-2.5 py-1 bg-teal-400/10 rounded-lg flex items-center gap-1">📅 {appointment.date}</span>
                            <span className="text-blue-400 text-xs font-semibold px-2.5 py-1 bg-blue-400/10 rounded-lg flex items-center gap-1">🕒 {appointment.time}</span>
                            <span className="bg-green-500/20 text-green-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                              ✓ {appointment.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button className="text-white/60 hover:text-white text-xl hover:bg-white/10 p-2 rounded-lg transition transform hover:scale-110">📞</button>
                          <button className="text-white/60 hover:text-teal-300 text-xl hover:bg-teal-400/10 p-2 rounded-lg transition transform hover:scale-110">→</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity Sidebar */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                <p className="text-white/50 text-sm mt-1">Your latest interactions</p>
              </div>
              <div className="space-y-1">
                {recentActivity.map((activity, idx) => (
                  <div
                    key={activity.id}
                    className="group flex items-start gap-3 pb-3 px-2 py-2 rounded-lg hover:bg-white/5 transition cursor-pointer"
                  >
                    <div className="text-2xl flex-shrink-0 transform group-hover:scale-110 transition duration-300">{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium group-hover:text-teal-300 transition line-clamp-2">{activity.message}</p>
                      <p className="text-white/50 text-xs mt-0.5">{activity.timestamp}</p>
                    </div>
                    {idx === 0 && <span className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full font-bold flex-shrink-0">NEW</span>}
                  </div>
                ))}
              </div>
              <button className="w-full text-teal-400 hover:text-teal-300 text-sm font-semibold mt-4 py-2 transition hover:bg-teal-400/10 rounded-lg">
                View All Activity →
              </button>
            </div>
          </div>

          {/* Recommended Therapists */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Recommended Therapists</h2>
                <p className="text-white/50 text-sm mt-1">Handpicked professionals for you</p>
              </div>
              <button
                onClick={() => navigate('/therapist')}
                className="text-teal-400 hover:text-teal-300 text-sm font-semibold transition hover:bg-teal-400/10 px-3 py-1.5 rounded-lg"
              >
                Browse All →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedTherapists.map((therapist) => (
                <div
                  key={therapist.id}
                  className="group bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-white/10 hover:border-teal-400/40 rounded-2xl p-6 backdrop-blur-xl transition cursor-pointer hover:shadow-2xl hover:shadow-teal-500/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl transform group-hover:scale-110 transition duration-300">{therapist.avatar}</div>
                    <div className="text-right bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-lg px-3 py-2">
                      <div className="text-2xl font-bold text-yellow-400">⭐</div>
                      <p className="text-white font-bold text-sm">{therapist.rating}</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-teal-300 transition">{therapist.name}</h3>
                  <p className="text-teal-300/80 text-sm mb-4 font-medium">{therapist.specialty}</p>

                  <div className="bg-gradient-to-r from-white/5 to-white/0 border border-white/10 rounded-lg p-3 mb-4">
                    <p className="text-white/60 text-xs mb-2 flex items-center gap-1">⭐ Rating & Reviews</p>
                    <p className="text-white font-semibold text-sm">{therapist.rating} <span className="text-white/60 text-xs font-normal">({therapist.reviews} reviews)</span></p>
                  </div>

                  <div className="space-y-2 mb-4 pb-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-teal-400 font-bold text-xl">{therapist.price}</span>
                      <span className="text-white/60 text-xs bg-white/5 px-2 py-1 rounded-full">/session</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70 text-xs">
                      <span>📅</span>
                      <span>Available {therapist.availability}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('/therapist')}
                      className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-2.5 rounded-lg transition transform hover:scale-105 group-hover:shadow-lg group-hover:shadow-teal-500/20"
                    >
                      Book Session
                    </button>
                    <button className="px-4 py-2.5 border border-white/10 hover:border-teal-400/40 text-white/70 hover:text-teal-300 rounded-lg transition hover:bg-white/5">
                      ❤️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Explore Features</h2>
              <p className="text-white/50 text-sm mt-1">Access powerful tools for your mental wellness</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* AI Counselor */}
              <div className="group cursor-pointer h-full">
                <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-400/30 hover:border-purple-400/60 rounded-2xl p-6 transition h-full backdrop-blur-xl hover:shadow-2xl hover:shadow-purple-500/20 flex flex-col">
                  <div className="text-6xl mb-4 transform group-hover:scale-120 transition duration-300 origin-left">🤖</div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition">AI Counselor</h3>
                  <p className="text-purple-100 mb-4 text-sm leading-relaxed flex-1">
                    Chat with our advanced AI counselor 24/7 for immediate support and guidance.
                  </p>
                  <div className="space-y-2">
                    <div className="text-xs text-purple-300 flex items-center gap-2">
                      <span>✓</span> <span>Instant responses</span>
                    </div>
                    <div className="text-xs text-purple-300 flex items-center gap-2">
                      <span>✓</span> <span>Always available</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/ai-counselor')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2.5 rounded-lg transition text-sm mt-4 transform hover:scale-105"
                  >
                    Start Chat →
                  </button>
                </div>
              </div>

              {/* Mood Tracker */}
              <div className="group cursor-pointer h-full">
                <div className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 border border-green-400/30 hover:border-green-400/60 rounded-2xl p-6 transition h-full backdrop-blur-xl hover:shadow-2xl hover:shadow-green-500/20 flex flex-col">
                  <div className="text-6xl mb-4 transform group-hover:scale-120 transition duration-300 origin-left">📊</div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-300 transition">Mood Tracker</h3>
                  <p className="text-green-100 mb-4 text-sm leading-relaxed flex-1">
                    Track your emotions and visualize your mental health progress over time.
                  </p>
                  <div className="space-y-2">
                    <div className="text-xs text-green-300 flex items-center gap-2">
                      <span>✓</span> <span>Daily insights</span>
                    </div>
                    <div className="text-xs text-green-300 flex items-center gap-2">
                      <span>✓</span> <span>Trend analysis</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/mood-tracker')}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2.5 rounded-lg transition text-sm mt-4 transform hover:scale-105"
                  >
                    Track Now →
                  </button>
                </div>
              </div>

              {/* Community */}
              <div className="group cursor-pointer h-full">
                <div className="bg-gradient-to-br from-yellow-600/30 to-orange-600/30 border border-yellow-400/30 hover:border-yellow-400/60 rounded-2xl p-6 transition h-full backdrop-blur-xl hover:shadow-2xl hover:shadow-yellow-500/20 flex flex-col">
                  <div className="text-6xl mb-4 transform group-hover:scale-120 transition duration-300 origin-left">👥</div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-300 transition">Community</h3>
                  <p className="text-yellow-100 mb-4 text-sm leading-relaxed flex-1">
                    Join support groups and connect with others on similar journeys.
                  </p>
                  <div className="space-y-2">
                    <div className="text-xs text-yellow-300 flex items-center gap-2">
                      <span>✓</span> <span>Active groups</span>
                    </div>
                    <div className="text-xs text-yellow-300 flex items-center gap-2">
                      <span>✓</span> <span>Safe space</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/community')}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-2.5 rounded-lg transition text-sm mt-4 transform hover:scale-105"
                  >
                    Join Now →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
