import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, TrendingUp, Calendar, Tag, MessageSquare, ChevronRight } from 'lucide-react';

export function MoodTrackerPageNew() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [notes, setNotes] = useState('');
  const [activities, setActivities] = useState([]);

  const moods = [
    { emoji: '😊', label: 'Great', value: 5, color: 'from-green-500 to-emerald-500' },
    { emoji: '🙂', label: 'Good', value: 4, color: 'from-blue-500 to-cyan-500' },
    { emoji: '😐', label: 'Okay', value: 3, color: 'from-yellow-500 to-orange-400' },
    { emoji: '😕', label: 'Rough', value: 2, color: 'from-orange-500 to-red-500' },
    { emoji: '😢', label: 'Tough', value: 1, color: 'from-red-500 to-pink-500' },
  ];

  const availableActivities = [
    '🏃 Exercise',
    '🧘 Meditation',
    '📚 Reading',
    '👥 Social time',
    '🎨 Creative work',
    '🎵 Music',
    '🌳 Nature',
    '😴 Rest',
    '💼 Work',
    '🎮 Gaming',
  ];

  const moodHistory = [
    { date: 'Today', mood: 4, emoji: '🙂', notes: 'Had a productive day' },
    { date: 'Yesterday', mood: 3, emoji: '😐', notes: 'Feeling neutral' },
    { date: '2 days ago', mood: 4, emoji: '🙂', notes: 'Great therapy session' },
    { date: '3 days ago', mood: 5, emoji: '😊', notes: 'Amazing day with friends' },
  ];

  const handleActivityToggle = (activity) => {
    if (activities.includes(activity)) {
      setActivities(activities.filter((a) => a !== activity));
    } else {
      setActivities([...activities, activity]);
    }
  };

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

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideInUp { animation: slideInUp 0.6s ease-out forwards; }
      `}</style>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-purple-400 hover:text-purple-300 mb-4 flex items-center gap-2 font-semibold"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-white mb-2">Mood Tracker</h1>
            <p className="text-purple-200">Track your emotions and discover patterns</p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* New Entry Section */}
          <section className="animate-slideInUp">
            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-3xl p-10 backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-white mb-8">How are you feeling right now?</h2>

              {/* Mood Selector */}
              <div className="mb-10">
                <div className="flex flex-wrap gap-4 mb-6">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`flex flex-col items-center p-6 rounded-2xl transition-all transform ${
                        selectedMood === mood.value
                          ? `bg-gradient-to-br ${mood.color} scale-110 shadow-2xl shadow-purple-500/50 border-2 border-white`
                          : 'bg-slate-800/50 border-2 border-purple-500/30 hover:scale-105 hover:border-purple-500/60'
                      }`}
                    >
                      <div className="text-5xl mb-2">{mood.emoji}</div>
                      <div className={`font-bold ${selectedMood === mood.value ? 'text-white' : 'text-purple-300'}`}>
                        {mood.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Activities Section */}
              {selectedMood && (
                <div className="mb-10">
                  <h3 className="text-purple-300 font-semibold mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    What have you been doing?
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {availableActivities.map((activity) => (
                      <button
                        key={activity}
                        onClick={() => handleActivityToggle(activity)}
                        className={`px-4 py-2 rounded-full font-semibold transition-all ${
                          activities.includes(activity)
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                            : 'bg-slate-800/50 text-purple-300 border border-purple-500/30 hover:border-purple-500/60'
                        }`}
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              {selectedMood && (
                <div className="mb-10">
                  <h3 className="text-purple-300 font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Any thoughts to share?
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write anything on your mind..."
                    className="w-full p-4 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition resize-none h-24"
                  />
                </div>
              )}

              {/* Submit Button */}
              {selectedMood && (
                <button className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg">
                  <Plus className="w-5 h-5 inline mr-2" />
                  Save Mood Entry
                </button>
              )}
            </div>
          </section>

          {/* Stats Section */}
          <section className="animate-slideInUp">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Current Mood', value: '😊 Good', icon: Heart, gradient: 'from-red-500/20 to-pink-500/20' },
                { label: 'Streak', value: '5 days', icon: TrendingUp, gradient: 'from-green-500/20 to-emerald-500/20' },
                { label: 'This Week', value: '4.2/5', icon: Calendar, gradient: 'from-blue-500/20 to-cyan-500/20' },
                { label: 'Total Entries', value: '42', icon: Plus, gradient: 'from-purple-500/20 to-pink-500/20' },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className={`bg-gradient-to-br ${stat.gradient} border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl`}
                  >
                    <Icon className="w-6 h-6 text-purple-400 mb-3" />
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-white text-2xl font-bold">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* History Section */}
          <section className="animate-slideInUp">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Recent Entries
            </h2>

            <div className="space-y-4">
              {moodHistory.map((entry, idx) => (
                <button
                  key={idx}
                  className="w-full text-left p-6 bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20 backdrop-blur-xl group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{entry.emoji}</div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{entry.date}</h3>
                        <p className="text-gray-400">{entry.notes}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-purple-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Insights Section */}
          <section className="animate-slideInUp">
            <div className="bg-gradient-to-r from-purple-600/40 to-blue-600/40 border border-purple-500/30 rounded-3xl p-10 backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-white mb-4">📊 Your Mood Insights</h2>
              <p className="text-purple-200 mb-6">
                Your mood has been improving! Keep up with your daily activities and remember to reach out to your therapist when needed.
              </p>
              <button className="px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105 active:scale-95">
                View Full Analytics
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default MoodTrackerPageNew;
