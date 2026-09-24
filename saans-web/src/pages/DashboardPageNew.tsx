import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Brain, MessageCircle, Calendar, Zap, TrendingUp, Users, BookOpen, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';

export function DashboardPageNew() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);

  const moods = [
    { emoji: '😊', label: 'Great', value: 5, color: 'from-green-400 to-emerald-400' },
    { emoji: '🙂', label: 'Good', value: 4, color: 'from-blue-400 to-cyan-400' },
    { emoji: '😐', label: 'Okay', value: 3, color: 'from-yellow-300 to-orange-300' },
    { emoji: '😕', label: 'Rough', value: 2, color: 'from-orange-400 to-red-400' },
    { emoji: '😢', label: 'Tough', value: 1, color: 'from-red-400 to-pink-400' },
  ];

  const quickActions = [
    {
      icon: Heart,
      title: 'Check-In',
      desc: 'How are you feeling today?',
      action: () => navigate('/mood-tracker'),
      color: 'from-red-400/20 to-pink-400/20',
      borderColor: 'border-red-200/30',
    },
    {
      icon: Brain,
      title: 'Talk Now',
      desc: 'Chat with AI counselor',
      action: () => navigate('/ai-counselor'),
      color: 'from-purple-400/20 to-indigo-400/20',
      borderColor: 'border-purple-200/30',
    },
    {
      icon: Users,
      title: 'Find Therapist',
      desc: 'Connect with professionals',
      action: () => navigate('/find-therapist'),
      color: 'from-blue-400/20 to-cyan-400/20',
      borderColor: 'border-blue-200/30',
    },
    {
      icon: AlertCircle,
      title: 'In Crisis?',
      desc: 'Immediate support',
      action: () => navigate('/crisis-support'),
      color: 'from-red-500/20 to-orange-400/20',
      borderColor: 'border-red-200/30',
    },
  ];

  const exploreSections = [
    {
      icon: MessageCircle,
      title: 'Community',
      desc: 'Connect with others, share experiences',
      stats: '2.3K members',
      gradient: 'from-teal-400 to-green-400',
      action: () => navigate('/community'),
    },
    {
      icon: Calendar,
      title: 'Appointments',
      desc: 'Schedule & manage your sessions',
      stats: '0 upcoming',
      gradient: 'from-blue-400 to-purple-400',
      action: () => navigate('/appointments'),
    },
    {
      icon: TrendingUp,
      title: 'Progress',
      desc: 'Track your wellness journey',
      stats: 'Streak: 5 days',
      gradient: 'from-orange-400 to-red-400',
      action: () => navigate('/mood-tracker'),
    },
    {
      icon: BookOpen,
      title: 'Resources',
      desc: 'Guided exercises & articles',
      stats: '50+ articles',
      gradient: 'from-indigo-400 to-purple-400',
      action: () => navigate('/resources'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
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

        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
      `}</style>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-white/50 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Welcome back! 🌿
              </h1>
              <p className="text-sm text-gray-500">Tuesday, Sep 24 • Your wellness journey continues</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 hover:shadow-lg transition-all duration-300"
            />
          </div>
        </header>

        {/* Main container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {/* Hero Section - How are you feeling? */}
          <section className="animate-slideInUp">
            <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">How are you feeling today?</h2>
                <p className="text-gray-600">Your emotions matter. Share how you're doing in this moment.</p>
              </div>

              {/* Mood selector */}
              <div className="flex justify-between gap-4 mb-6">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`flex-1 py-4 px-3 rounded-2xl transition-all duration-300 transform ${
                      selectedMood === mood.value
                        ? `bg-gradient-to-br ${mood.color} scale-110 shadow-lg`
                        : 'bg-white/50 hover:bg-white/80 hover:scale-105'
                    } border-2 ${selectedMood === mood.value ? 'border-white/50' : 'border-white/20'}`}
                  >
                    <div className="text-3xl mb-2">{mood.emoji}</div>
                    <div className="text-xs font-semibold text-gray-700">{mood.label}</div>
                  </button>
                ))}
              </div>

              {/* Action button */}
              {selectedMood && (
                <button
                  onClick={() => navigate('/mood-tracker')}
                  className="w-full py-3 px-6 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Continue with Check-In
                </button>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="animate-slideInUp stagger-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                Quick Actions
              </h2>
              <p className="text-gray-600 text-sm">What would you like to do right now?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={action.action}
                    className={`group p-6 rounded-2xl bg-gradient-to-br ${action.color} border-2 ${action.borderColor} hover:border-white/50 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 text-left animate-slideInUp`}
                    style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
                  >
                    <Icon className="w-8 h-8 text-gray-700 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-gray-800">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.desc}</p>
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Explore Sections */}
          <section className="animate-slideInUp stagger-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Explore SAANS</h2>
              <p className="text-gray-600 text-sm">Discover features that support your mental wellness</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exploreSections.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <button
                    key={idx}
                    onClick={section.action}
                    className="group text-left p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/30 hover:border-white/60 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 animate-slideInUp"
                    style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.gradient} p-2.5 mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 my-2">{section.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {section.stats}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Wellness tip */}
          <section className="animate-slideInUp stagger-3">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400 rounded-xl p-6">
              <h3 className="font-bold text-gray-800 mb-2">💡 Daily Wellness Tip</h3>
              <p className="text-gray-700">
                "Taking care of your mind is just as important as taking care of your body. Even small moments of mindfulness can make a big difference in your day."
              </p>
              <button className="mt-4 text-green-600 font-semibold hover:text-green-700 flex items-center gap-2">
                Learn more <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="animate-slideInUp stagger-4 pb-8">
            <div className="bg-gradient-to-br from-purple-400/20 to-pink-400/20 border border-purple-200/30 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Ready to take the next step?
              </h3>
              <p className="text-gray-600 mb-6">
                Connect with a therapist today or explore our resources
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/find-therapist')}
                  className="px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Find a Therapist
                </button>
                <button
                  onClick={() => navigate('/resources')}
                  className="px-8 py-3 bg-white/60 text-gray-800 font-semibold rounded-xl border-2 border-white/30 hover:bg-white/80 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Explore Resources
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
