import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Brain, MessageCircle, Calendar, Zap, TrendingUp, Users, BookOpen, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';

export function DashboardPageNew() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);

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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
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
        {/* Header - FIXED */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b-2 border-purple-200 shadow-md">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome back! 🌿</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Your wellness journey continues</p>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 hover:shadow-lg hover:scale-110 transition-all duration-300 shadow-md"
                title="Profile"
              />
            </div>
          </div>
        </header>

        {/* Main container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Hero Section - How are you feeling? */}
          <section className="animate-slideInUp">
            <div className="bg-gradient-to-br from-sky-100 to-purple-100 rounded-3xl p-8 border-2 border-white shadow-lg">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">How are you feeling today?</h2>
              <p className="text-gray-700 mb-8 text-lg">Share your emotions in this moment</p>

              {/* Mood selector */}
              <div className="flex gap-3 sm:gap-4 mb-8 flex-wrap">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`py-4 px-4 sm:px-6 rounded-2xl transition-all duration-300 transform border-3 ${
                      selectedMood === mood.value
                        ? `${mood.color} border-white scale-110 shadow-xl`
                        : 'bg-white border-white/30 hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    <div className="text-4xl mb-2">{mood.emoji}</div>
                    <div className={`text-sm font-bold ${selectedMood === mood.value ? 'text-white' : 'text-gray-700'}`}>
                      {mood.label}
                    </div>
                  </button>
                ))}
              </div>

              {/* Action button */}
              {selectedMood && (
                <button
                  onClick={() => navigate('/mood-tracker')}
                  className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                >
                  ✨ Continue Check-In
                </button>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="animate-slideInUp stagger-1">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              Quick Actions
            </h2>
            <p className="text-gray-600 mb-6 text-lg">What would you like to do right now?</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={action.action}
                    className={`group p-8 rounded-3xl bg-gradient-to-br ${action.gradient} hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 text-left animate-slideInUp border-2 border-white/30 hover:border-white shadow-lg`}
                    style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
                  >
                    <Icon className="w-12 h-12 text-white mb-4 group-hover:scale-125 transition-transform" />
                    <h3 className="font-bold text-white text-xl mb-2">{action.title}</h3>
                    <p className="text-white/90 text-sm mb-4">{action.desc}</p>
                    <ChevronRight className="w-6 h-6 text-white/80 group-hover:translate-x-2 transition-transform" />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Explore Sections */}
          <section className="animate-slideInUp stagger-2">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Explore SAANS</h2>
            <p className="text-gray-600 mb-6 text-lg">Discover features for your wellness</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exploreSections.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <button
                    key={idx}
                    onClick={section.action}
                    className={`group p-8 rounded-3xl bg-gradient-to-br ${section.gradient} hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 text-left animate-slideInUp border-2 border-white/40 shadow-lg`}
                    style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${section.icon_gradient} p-3 mb-4 group-hover:scale-125 transition-transform`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{section.title}</h3>
                    <p className="text-white/90 text-sm">{section.desc}</p>
                    <ChevronRight className="w-5 h-5 text-white/80 mt-4 group-hover:translate-x-2 transition-transform" />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Wellness Tip */}
          <section className="animate-slideInUp stagger-3">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl p-8 border-2 border-white shadow-lg">
              <h3 className="text-2xl font-bold text-white mb-3">💡 Daily Wellness Tip</h3>
              <p className="text-white text-lg leading-relaxed mb-4">
                "Your mental health is a priority, not a luxury. Take time to care for yourself today."
              </p>
              <button className="text-white font-bold hover:text-gray-100 flex items-center gap-2">
                Learn more <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="animate-slideInUp stagger-4 pb-8">
            <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-3xl p-10 text-center shadow-xl border-2 border-white/50">
              <h3 className="text-3xl font-bold text-white mb-3">Ready for next step?</h3>
              <p className="text-white/95 text-lg mb-8">Connect with a therapist or explore resources</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/find-therapist')}
                  className="px-8 py-4 bg-white text-purple-600 font-bold rounded-2xl hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  👤 Find Therapist
                </button>
                <button
                  onClick={() => navigate('/resources')}
                  className="px-8 py-4 bg-white/30 border-2 border-white text-white font-bold rounded-2xl hover:bg-white/50 transition-all hover:scale-105 active:scale-95"
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
