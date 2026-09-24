import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Brain, MessageCircle, Calendar, Zap, TrendingUp, Users, BookOpen, AlertCircle, ChevronRight, Sparkles, Menu, X } from 'lucide-react';

export function DashboardPageNew() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const moods = [
    { emoji: '😊', label: 'Great', value: 5, color: 'bg-green-400' },
    { emoji: '🙂', label: 'Good', value: 4, color: 'bg-blue-400' },
    { emoji: '😐', label: 'Okay', value: 3, color: 'bg-yellow-300' },
    { emoji: '😕', label: 'Rough', value: 2, color: 'bg-orange-400' },
    { emoji: '😢', label: 'Tough', value: 1, color: 'bg-red-400' },
  ];

  const quickActions = [
    {
      icon: Heart,
      title: 'Check-In',
      desc: 'How are you feeling?',
      action: () => navigate('/mood-tracker'),
      gradient: 'from-red-500 to-pink-500',
    },
    {
      icon: Brain,
      title: 'Talk to AI',
      desc: 'Chat with counselor',
      action: () => navigate('/ai-counselor'),
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Users,
      title: 'Find Therapist',
      desc: 'Connect with pros',
      action: () => navigate('/find-therapist'),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: AlertCircle,
      title: 'Crisis Support',
      desc: 'Immediate help',
      action: () => navigate('/crisis-support'),
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  const exploreSections = [
    {
      icon: MessageCircle,
      title: 'Community',
      desc: 'Connect with others',
      gradient: 'from-teal-400 to-green-500',
      icon_gradient: 'from-teal-600 to-green-600',
      action: () => navigate('/community'),
    },
    {
      icon: Calendar,
      title: 'Appointments',
      desc: 'Manage sessions',
      gradient: 'from-blue-400 to-purple-500',
      icon_gradient: 'from-blue-600 to-purple-600',
      action: () => navigate('/appointments'),
    },
    {
      icon: TrendingUp,
      title: 'Progress',
      desc: 'Track wellness',
      gradient: 'from-orange-400 to-red-500',
      icon_gradient: 'from-orange-600 to-red-600',
      action: () => navigate('/mood-tracker'),
    },
    {
      icon: BookOpen,
      title: 'Resources',
      desc: 'Learn & grow',
      gradient: 'from-indigo-400 to-purple-500',
      icon_gradient: 'from-indigo-600 to-purple-600',
      action: () => navigate('/resources'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
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

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideInUp { animation: slideInUp 0.6s ease-out forwards; }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
      `}</style>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header - FULLY RESPONSIVE */}
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b-2 border-purple-500/30 shadow-md">
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">Welcome! 🌿</h1>
                <p className="text-xs sm:text-sm text-purple-300 hidden sm:block truncate">Your wellness journey</p>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 hover:shadow-lg hover:scale-110 transition-all duration-300 shadow-md"
                title="Profile"
              />
            </div>
          </div>
        </header>

        {/* Main container - RESPONSIVE PADDING */}
        <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
          {/* REDESIGNED Hero Section - Mood Check-in */}
          <section className="animate-slideInUp">
            <div className="bg-gradient-to-br from-purple-800/60 via-pink-800/40 to-slate-900/60 rounded-3xl sm:rounded-4xl p-8 sm:p-12 md:p-16 border-2 border-purple-500/50 shadow-2xl backdrop-blur-xl overflow-hidden relative">
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">How are you feeling today? 🌈</h2>
                    <p className="text-purple-200 text-sm sm:text-base md:text-lg">Take a moment for yourself - your emotional wellness matters</p>
                  </div>
                  <div className="hidden md:block text-6xl opacity-30">💭</div>
                </div>

                {/* Mood selector - FULLY RESPONSIVE */}
                <div className="mb-8 sm:mb-10">
                  <p className="text-purple-300 text-xs sm:text-sm font-semibold mb-4 uppercase tracking-wide">Select your mood</p>
                  <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    {moods.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setSelectedMood(mood.value)}
                        className={`group relative py-3 sm:py-5 md:py-6 px-1 sm:px-2 rounded-2xl sm:rounded-3xl transition-all duration-300 transform ${
                          selectedMood === mood.value
                            ? `${mood.color} border-3 border-white scale-110 shadow-2xl shadow-purple-500/50`
                            : 'bg-slate-700/60 border-3 border-purple-400/40 hover:border-purple-400/80 hover:scale-110 hover:shadow-xl hover:shadow-purple-500/30'
                        }`}
                      >
                        <div className="text-3xl sm:text-4xl md:text-5xl mb-1 group-hover:scale-110 transition-transform">{mood.emoji}</div>
                        <div className={`text-xs sm:text-sm font-bold hidden sm:block ${selectedMood === mood.value ? 'text-white' : 'text-purple-300'}`}>
                          {mood.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action button - PREMIUM STYLING */}
                {selectedMood && (
                  <button
                    onClick={() => navigate('/mood-tracker')}
                    className="w-full py-4 sm:py-5 md:py-6 px-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold text-sm sm:text-base md:text-lg rounded-2xl sm:rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-green-500/40 border-2 border-green-400/50 hover:border-green-300"
                  >
                    ✨ Continue Check-In →
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Quick Actions - MOBILE RESPONSIVE */}
          <section className="animate-slideInUp stagger-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-400" />
              Quick Actions
            </h2>
            <p className="text-purple-300 mb-6 text-sm sm:text-base">What would you like to do right now?</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={action.action}
                    className={`group p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${action.gradient} hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 text-left animate-slideInUp border-2 border-white/30 hover:border-white shadow-lg`}
                    style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
                  >
                    <Icon className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 text-white mb-3 group-hover:scale-125 transition-transform" />
                    <h3 className="font-bold text-white text-sm sm:text-base md:text-lg mb-1">{action.title}</h3>
                    <p className="text-white/90 text-xs sm:text-sm">{action.desc}</p>
                    <ChevronRight className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white/80 mt-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Explore Sections - RESPONSIVE GRID */}
          <section className="animate-slideInUp stagger-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Explore SAANS</h2>
            <p className="text-purple-300 mb-6 text-sm sm:text-base">Discover features for your wellness</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {exploreSections.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <button
                    key={idx}
                    onClick={section.action}
                    className={`group text-left p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-900/40 to-slate-900/40 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 active:scale-95 animate-slideInUp border-2 border-purple-500/30 shadow-lg backdrop-blur-xl`}
                    style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
                  >
                    <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${section.icon_gradient} p-2 sm:p-3 mb-4 group-hover:scale-125 transition-transform`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow group-hover:text-purple-300 transition-all">{section.title}</h3>
                    <p className="text-purple-300 text-xs sm:text-sm mt-2">{section.desc}</p>
                    <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400 mt-3 group-hover:translate-x-2 transition-transform" />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Wellness Tip */}
          <section className="animate-slideInUp stagger-3">
            <div className="bg-gradient-to-r from-emerald-500/40 to-teal-500/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/50 shadow-lg backdrop-blur-xl">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">💡 Daily Wellness Tip</h3>
              <p className="text-purple-200 text-sm sm:text-base leading-relaxed mb-4">
                "Your mental health is a priority, not a luxury. Take time to care for yourself today."
              </p>
              <button className="text-purple-300 font-bold hover:text-purple-200 flex items-center gap-2 text-sm sm:text-base">
                Learn more <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="animate-slideInUp stagger-4 pb-4">
            <div className="bg-gradient-to-r from-pink-600/40 via-purple-600/40 to-blue-600/40 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center shadow-xl border-2 border-purple-500/40 backdrop-blur-xl">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready for next step?</h3>
              <p className="text-purple-200 text-sm sm:text-base mb-6 sm:mb-8">Connect with a therapist or explore resources</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => navigate('/find-therapist')}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-2xl hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  👤 Find Therapist
                </button>
                <button
                  onClick={() => navigate('/resources')}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-slate-800/50 border-2 border-purple-500/30 text-purple-300 font-bold text-sm sm:text-base rounded-lg sm:rounded-2xl hover:bg-slate-800/70 transition-all hover:scale-105 active:scale-95"
                >
                  📚 Explore
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default DashboardPageNew;
