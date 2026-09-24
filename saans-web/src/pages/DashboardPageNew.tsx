import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Brain, MessageCircle, Calendar, Zap, TrendingUp, Users, BookOpen, AlertCircle, ChevronRight, Sparkles, Menu, X, Home, Settings, LogOut } from 'lucide-react';

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
      desc: 'Track mood',
      action: () => navigate('/mood-tracker'),
      gradient: 'from-red-500 to-pink-500',
    },
    {
      icon: Brain,
      title: 'AI Chat',
      desc: 'Counselor',
      action: () => navigate('/ai-counselor'),
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Users,
      title: 'Therapist',
      desc: 'Find one',
      action: () => navigate('/find-therapist'),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: AlertCircle,
      title: 'Crisis',
      desc: 'Help now',
      action: () => navigate('/crisis-support'),
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  const exploreSections = [
    {
      icon: MessageCircle,
      title: 'Community',
      desc: 'Connect',
      gradient: 'from-teal-400 to-green-500',
      icon_gradient: 'from-teal-600 to-green-600',
      action: () => navigate('/community'),
    },
    {
      icon: Calendar,
      title: 'Sessions',
      desc: 'Manage',
      gradient: 'from-blue-400 to-purple-500',
      icon_gradient: 'from-blue-600 to-purple-600',
      action: () => navigate('/appointments'),
    },
    {
      icon: TrendingUp,
      title: 'Progress',
      desc: 'Track',
      gradient: 'from-orange-400 to-red-500',
      icon_gradient: 'from-orange-600 to-red-600',
      action: () => navigate('/mood-tracker'),
    },
    {
      icon: BookOpen,
      title: 'Resources',
      desc: 'Learn',
      gradient: 'from-indigo-400 to-purple-500',
      icon_gradient: 'from-indigo-600 to-purple-600',
      action: () => navigate('/resources'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
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

      {/* REDESIGNED HEADER - MODERN & CLEAN */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-b border-purple-500/20 shadow-2xl">
        <div className="w-full">
          {/* Top Section - Logo + Profile */}
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">S</div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-white">SAANS</h1>
                <p className="text-xs text-purple-300">Mental Health</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 sm:p-2.5 rounded-lg hover:bg-purple-500/20 transition-all text-purple-300 hover:text-purple-200"
                title="Profile"
              >
                <Settings className="w-5 sm:w-6 h-5 sm:h-6" />
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 hover:shadow-lg hover:scale-110 transition-all duration-300 shadow-md flex-shrink-0"
                title="Profile"
              />
            </div>
          </div>

          {/* Navigation Section - Horizontal */}
          <div className="px-4 sm:px-6 lg:px-8 pb-3 sm:pb-4 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-purple-600/40 text-white text-xs sm:text-sm font-semibold hover:bg-purple-600/60 transition-all whitespace-nowrap">
                Dashboard
              </button>
              <button onClick={() => navigate('/mood-tracker')} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-purple-300 hover:bg-purple-500/20 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap">
                Mood
              </button>
              <button onClick={() => navigate('/find-therapist')} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-purple-300 hover:bg-purple-500/20 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap">
                Therapist
              </button>
              <button onClick={() => navigate('/community')} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-purple-300 hover:bg-purple-500/20 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap">
                Community
              </button>
              <button onClick={() => navigate('/appointments')} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-purple-300 hover:bg-purple-500/20 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap">
                Sessions
              </button>
              <button onClick={() => navigate('/resources')} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-purple-300 hover:bg-purple-500/20 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap">
                Resources
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* WELCOME BANNER */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-purple-500/30 backdrop-blur-xl mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Welcome back! 👋</h2>
          <p className="text-purple-300 text-sm sm:text-base">Let's take care of your mental wellness today</p>
        </div>
      </div>

      {/* Main content - STRUCTURED LAYOUT */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 pb-12 space-y-6 sm:space-y-8">

        {/* SECTION 1: MOOD CHECK-IN */}
        <section className="animate-slideInUp">
          <div className="bg-gradient-to-br from-purple-800/60 via-pink-800/40 to-slate-900/60 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-purple-500/50 shadow-2xl backdrop-blur-xl overflow-hidden relative">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>

            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">How are you feeling? 🌈</h3>
              <p className="text-purple-200 text-sm sm:text-base mb-6">Select your mood right now</p>

              {/* Mood Grid */}
              <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-6">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`group relative py-3 sm:py-4 px-1 rounded-2xl transition-all duration-300 transform flex flex-col items-center justify-center ${
                      selectedMood === mood.value
                        ? `${mood.color} border-3 border-white scale-110 shadow-2xl shadow-purple-500/50`
                        : 'bg-slate-700/60 border-3 border-purple-400/40 hover:border-purple-400/80 hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl">{mood.emoji}</div>
                    <div className={`text-xs font-bold mt-1 hidden sm:block ${selectedMood === mood.value ? 'text-white' : 'text-purple-300'}`}>
                      {mood.label}
                    </div>
                  </button>
                ))}
              </div>

              {selectedMood && (
                <button
                  onClick={() => navigate('/mood-tracker')}
                  className="w-full py-3 sm:py-4 px-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-green-500/40 border border-green-400/50"
                >
                  ✨ Continue Check-In
                </button>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2: QUICK ACTIONS */}
        <section className="animate-slideInUp stagger-1">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={action.action}
                  className={`group p-4 sm:p-6 rounded-2xl bg-gradient-to-br ${action.gradient} hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 text-left animate-slideInUp border-2 border-white/30 hover:border-white shadow-lg`}
                  style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
                >
                  <Icon className="w-6 sm:w-8 h-6 sm:h-8 text-white mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-white text-sm sm:text-base">{action.title}</h4>
                  <p className="text-white/80 text-xs sm:text-sm">{action.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: EXPLORE SECTIONS */}
        <section className="animate-slideInUp stagger-2">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Explore</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {exploreSections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <button
                  key={idx}
                  onClick={section.action}
                  className={`group text-left p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-900/40 to-slate-900/40 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 active:scale-95 animate-slideInUp border-2 border-purple-500/30 shadow-lg backdrop-blur-xl`}
                  style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
                >
                  <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-gradient-to-br ${section.icon_gradient} p-2 sm:p-3 mb-4 group-hover:scale-125 transition-transform`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-300 transition-all">{section.title}</h4>
                  <p className="text-purple-300 text-xs sm:text-sm mt-2">{section.desc}</p>
                  <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400 mt-3 group-hover:translate-x-2 transition-transform" />
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: WELLNESS TIP */}
        <section className="animate-slideInUp stagger-3">
          <div className="bg-gradient-to-r from-emerald-500/40 to-teal-500/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/50 shadow-lg backdrop-blur-xl">
            <h4 className="text-lg sm:text-xl font-bold text-white mb-3">💡 Daily Tip</h4>
            <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
              "Small steps lead to big changes. Be patient and kind with yourself on this journey."
            </p>
          </div>
        </section>

        {/* SECTION 5: CTA */}
        <section className="animate-slideInUp stagger-4">
          <div className="bg-gradient-to-r from-pink-600/40 via-purple-600/40 to-blue-600/40 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center shadow-xl border-2 border-purple-500/40 backdrop-blur-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Start Your Wellness Journey</h3>
            <p className="text-purple-200 text-sm sm:text-base mb-6">Connect with professionals who care</p>
            <button
              onClick={() => navigate('/find-therapist')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl hover:shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Find Therapist →
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}

export default DashboardPageNew;
