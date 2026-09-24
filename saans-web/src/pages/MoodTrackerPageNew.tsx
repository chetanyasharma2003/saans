import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, TrendingUp, Calendar, Tag, MessageSquare, ChevronRight, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function MoodTrackerPageNew() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [notes, setNotes] = useState('');
  const [activities, setActivities] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

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

  // Fetch mood entries on page load
  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/api/mood`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMoodHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching mood history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityToggle = (activity) => {
    if (activities.includes(activity)) {
      setActivities(activities.filter((a) => a !== activity));
    } else {
      setActivities([...activities, activity]);
    }
  };

  const handleSaveMood = async () => {
    if (!selectedMood) {
      setMessage({ type: 'error', text: 'Please select a mood' });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');

      const payload = {
        mood: selectedMood,
        activities,
        notes: notes || undefined,
      };

      await axios.post(`${API_URL}/api/mood`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Mood entry saved successfully!' });
      setSelectedMood(null);
      setNotes('');
      setActivities([]);

      // Refresh history
      await fetchMoodHistory();

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving mood:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save mood entry' });
    } finally {
      setSaving(false);
    }
  };

  const getMoodEmoji = (mood) => {
    return moods.find(m => m.value === mood)?.emoji || '😐';
  };

  const getMoodLabel = (mood) => {
    return moods.find(m => m.value === mood)?.label || 'Unknown';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate mood statistics
  const moodStats = {};
  moodHistory.forEach(entry => {
    moodStats[entry.mood] = (moodStats[entry.mood] || 0) + 1;
  });

  const totalMoods = moodHistory.length;
  const moodPercentages = Object.entries(moodStats).map(([mood, count]) => ({
    mood: parseInt(mood),
    label: getMoodLabel(parseInt(mood)),
    emoji: getMoodEmoji(parseInt(mood)),
    count,
    percentage: totalMoods > 0 ? Math.round((count / totalMoods) * 100) : 0,
  })).sort((a, b) => b.mood - a.mood);

  const averageMood = totalMoods > 0
    ? (Object.entries(moodStats).reduce((sum, [mood, count]) => sum + (parseInt(mood) * count), 0) / totalMoods).toFixed(1)
    : 0;

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
        <DashboardHeader title="Mood Tracker" showBackButton={false} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Message Alert */}
          {message && (
            <div className={`animate-slideInUp p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                : 'bg-red-500/20 border border-red-500/50 text-red-300'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </div>
          )}

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
                <button
                  onClick={handleSaveMood}
                  disabled={saving}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Save Mood Entry
                    </>
                  )}
                </button>
              )}
            </div>
          </section>

          {/* Stats Section */}
          <section className="animate-slideInUp">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Average Mood', value: `${averageMood}/5`, icon: Heart, gradient: 'from-red-500/20 to-pink-500/20' },
                { label: 'Total Entries', value: totalMoods.toString(), icon: Plus, gradient: 'from-purple-500/20 to-pink-500/20' },
                { label: 'Current Streak', value: totalMoods > 0 ? '✨' : '—', icon: TrendingUp, gradient: 'from-green-500/20 to-emerald-500/20' },
                { label: 'This Week', value: totalMoods > 0 ? `${moodPercentages[0]?.emoji}` : '—', icon: Calendar, gradient: 'from-blue-500/20 to-cyan-500/20' },
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
          {!loading && moodHistory.length > 0 && (
            <section className="animate-slideInUp">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Recent Entries
              </h2>

              <div className="space-y-4">
                {moodHistory.map((entry, idx) => (
                  <div
                    key={idx}
                    className="w-full text-left p-6 bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20 backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{getMoodEmoji(entry.mood)}</div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{formatDate(entry.createdAt)}</h3>
                          <p className="text-gray-400 text-sm">{formatTime(entry.createdAt)}</p>
                          {entry.activities && entry.activities.length > 0 && (
                            <p className="text-purple-300 text-sm mt-1">{entry.activities.join(', ')}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-purple-300 font-semibold">{getMoodLabel(entry.mood)}</span>
                    </div>
                    {entry.notes && (
                      <p className="text-gray-300 ml-24 italic">"{entry.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Analytics Section */}
          {totalMoods > 0 && (
            <section className="animate-slideInUp">
              <div className="bg-gradient-to-r from-purple-600/40 to-blue-600/40 border border-purple-500/30 rounded-3xl p-10 backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-white mb-8">📊 Your Mood Analytics</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Mood Distribution */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold mb-4">Mood Distribution</h3>
                    {moodPercentages.map((stat) => (
                      <div key={stat.mood}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold flex items-center gap-2">
                            <span className="text-2xl">{stat.emoji}</span>
                            {stat.label}
                          </span>
                          <span className="text-purple-300 text-sm font-bold">{stat.percentage}% ({stat.count})</span>
                        </div>
                        <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Insights */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold mb-4">Insights</h3>
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-purple-500/20">
                      <p className="text-purple-200 text-sm leading-relaxed">
                        <span className="font-bold text-white">Most Common Mood:</span> {moodPercentages[0]?.label || 'N/A'} ({moodPercentages[0]?.percentage || 0}%)
                      </p>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-purple-500/20">
                      <p className="text-purple-200 text-sm leading-relaxed">
                        <span className="font-bold text-white">Average Score:</span> {averageMood}/5.0
                      </p>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-purple-500/20">
                      <p className="text-purple-200 text-sm leading-relaxed">
                        <span className="font-bold text-white">Total Tracked Days:</span> {totalMoods} entries
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Empty State */}
          {!loading && moodHistory.length === 0 && (
            <section className="animate-slideInUp">
              <div className="bg-gradient-to-r from-purple-600/40 to-blue-600/40 border border-purple-500/30 rounded-3xl p-10 backdrop-blur-xl text-center">
                <h2 className="text-2xl font-bold text-white mb-2">No Mood Entries Yet</h2>
                <p className="text-purple-200 mb-6">Start tracking your mood today! Create your first entry above to see your mood analytics.</p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default MoodTrackerPageNew;
