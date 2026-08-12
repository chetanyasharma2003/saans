import React, { useState, useMemo, useEffect } from 'react';

interface MoodEntry {
  id: string;
  userId: string;
  moodScore: number;
  moodCategory: string;
  symptoms?: string[];
  triggers?: string[];
  notes?: string;
  location?: string;
  weather?: string;
  createdAt: string;
}

interface MoodConfig {
  emoji: string;
  label: string;
  color: string;
  accentColor: string;
  lightBg: string;
}

export function MoodTrackerPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  const moodConfigs: Record<string, MoodConfig> = {
    '😊': { emoji: '😊', label: 'Happy', color: 'from-amber-500 to-yellow-500', accentColor: 'text-amber-400', lightBg: 'bg-amber-500/10 border-amber-400/30' },
    '😌': { emoji: '😌', label: 'Calm', color: 'from-emerald-500 to-teal-500', accentColor: 'text-emerald-400', lightBg: 'bg-emerald-500/10 border-emerald-400/30' },
    '😟': { emoji: '😟', label: 'Anxious', color: 'from-rose-500 to-pink-500', accentColor: 'text-rose-400', lightBg: 'bg-rose-500/10 border-rose-400/30' },
    '😢': { emoji: '😢', label: 'Sad', color: 'from-indigo-500 to-blue-500', accentColor: 'text-indigo-400', lightBg: 'bg-indigo-500/10 border-indigo-400/30' },
    '🤩': { emoji: '🤩', label: 'Excited', color: 'from-orange-500 to-amber-500', accentColor: 'text-orange-400', lightBg: 'bg-orange-500/10 border-orange-400/30' },
  };

  // Map mood category to emoji
  const categoryToEmoji: Record<string, string> = {
    'Happy': '😊',
    'Calm': '😌',
    'Anxious': '😟',
    'Sad': '😢',
    'Excited': '🤩',
  };

  // Load mood data on mount
  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get auth token from localStorage
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found. Please log in.');
        setIsLoading(false);
        return;
      }

      // Fetch mood history
      const historyResponse = await fetch('/api/moods/my-moods?limit=30', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!historyResponse.ok) {
        throw new Error('Failed to load mood history');
      }

      const historyData = await historyResponse.json();
      setMoodEntries(historyData.data || []);

      // Fetch analytics
      const analyticsResponse = await fetch('/api/moods/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.data);
      }
    } catch (err: any) {
      console.error('Error loading mood data:', err);
      setError(err.message || 'Failed to load mood data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMood = async () => {
    if (!selectedMood) return;

    try {
      setIsSaving(true);
      setError(null);

      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }

      const moodCategory = moodConfigs[selectedMood].label;

      const response = await fetch('/api/moods/track', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moodScore: moodIntensity,
          moodCategory,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save mood entry');
      }

      const result = await response.json();

      // Add the new entry to the list
      if (result.data) {
        setMoodEntries([result.data, ...moodEntries]);
      }

      // Reset form
      setSelectedMood(null);
      setMoodIntensity(5);
      setNotes('');

      // Reload analytics
      loadAnalytics();
    } catch (err: any) {
      console.error('Error saving mood:', err);
      setError(err.message || 'Failed to save mood entry');
    } finally {
      setIsSaving(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/moods/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  // Analytics calculations
  const computedAnalytics = useMemo(() => {
    const last7Days = moodEntries.slice(0, 7);

    // Most frequent mood from backend analytics or calculate locally
    const mostFrequentMood = analytics?.mostFrequentMood || 'Calm';
    const mostFrequentEmoji = categoryToEmoji[mostFrequentMood] || '😌';

    // Average intensity from backend or calculate locally
    const avgIntensity = analytics?.last7DaysAverage || (
      last7Days.length > 0
        ? parseFloat((last7Days.reduce((sum, e) => sum + e.moodScore, 0) / last7Days.length).toFixed(1))
        : 0
    );

    // Mood streak from backend
    const streak = analytics?.streakDays || 0;

    return { mostFrequent: [mostFrequentEmoji, mostFrequentMood], avgIntensity, streak, last7Days };
  }, [moodEntries, analytics]);

  // Calendar data (last 56 days)
  const calendarData = useMemo(() => {
    const days: { date: string; mood?: string }[] = [];
    for (let i = 55; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = moodEntries.find(e => {
        const entryDate = new Date(e.createdAt).toISOString().split('T')[0];
        return entryDate === dateStr;
      });
      if (entry) {
        days.push({ date: dateStr, mood: categoryToEmoji[entry.moodCategory] });
      } else {
        days.push({ date: dateStr });
      }
    }
    return days;
  }, [moodEntries]);

  // Chart data (last 7 days)
  const chartData = useMemo(() => {
    const last7Days = moodEntries.slice(0, 7).reverse();
    return last7Days.map(entry => ({
      date: new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
      intensity: entry.moodScore,
      mood: categoryToEmoji[entry.moodCategory],
    }));
  }, [moodEntries]);

  const getMoodConfig = (emoji: string) => moodConfigs[emoji] || moodConfigs['😌'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <style>{`
        @keyframes moodPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.3); }
          50% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.5); }
        }

        @keyframes chartBarGrow {
          from { height: 0; }
          to { height: 100%; }
        }

        .mood-selector-btn {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .mood-selector-btn:hover:not(.selected) {
          transform: translateY(-4px);
          background-color: rgba(71, 85, 99, 0.7);
        }

        .mood-selector-btn.selected {
          animation: moodPulse 0.6s ease-out;
        }

        .chart-bar {
          animation: chartBarGrow 0.8s ease-out backwards;
        }

        .entry-card {
          animation: slideInUp 0.5s ease-out;
        }

        .analytics-card {
          animation: slideInUp 0.5s ease-out backwards;
        }

        .calendar-day {
          transition: all 0.2s ease-out;
        }

        .calendar-day:hover {
          transform: scale(1.15);
        }

        .glow-effect {
          animation: glowPulse 3s ease-in-out infinite;
        }

        input[type="range"] {
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 5px;
          background: linear-gradient(to right, rgb(6, 182, 212) 0%, rgb(20, 184, 166) 100%);
          outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: all 0.2s;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          box-shadow: 0 2px 12px rgba(6, 182, 212, 0.5);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: all 0.2s;
        }

        input[type="range"]::-moz-range-thumb:hover {
          box-shadow: 0 2px 12px rgba(6, 182, 212, 0.5);
        }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border-b border-teal-400/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-5xl">📊</span>
            <div>
              <h1 className="text-4xl font-bold text-white">Mood Tracker</h1>
              <p className="text-teal-200 text-sm mt-1">Understand your emotions and track your mental wellness journey</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Mood Selector */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Today's Mood Card */}
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border border-teal-400/20 rounded-2xl p-8 backdrop-blur-xl mb-6 glow-effect">
                <h2 className="text-xl font-bold text-white mb-6">How are you feeling today?</h2>

                {/* Mood Buttons Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {Object.entries(moodConfigs).map(([emoji, config]) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedMood(emoji)}
                      className={`mood-selector-btn flex flex-col items-center gap-2 p-4 rounded-xl transition ${
                        selectedMood === emoji
                          ? `bg-gradient-to-br ${config.color} ring-2 ring-white selected`
                          : 'bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50'
                      }`}
                    >
                      <span className="text-3xl">{emoji}</span>
                      <span className={`text-xs font-semibold ${selectedMood === emoji ? 'text-white' : 'text-slate-300'}`}>
                        {config.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Intensity Slider */}
                {selectedMood && (
                  <div className="space-y-4 mb-8 animate-in slideInUp">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-teal-200 font-semibold text-sm">Intensity Level</label>
                        <span className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-1 rounded-full font-bold text-sm">
                          {moodIntensity}/10
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={moodIntensity}
                        onChange={(e) => setMoodIntensity(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="text-teal-200 font-semibold text-sm mb-2 block">Journal Entry (optional)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="What's on your mind? Any thoughts or triggers..."
                        className="w-full px-4 py-3 bg-slate-700/50 border border-teal-400/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/30 resize-none text-sm leading-relaxed"
                        rows={4}
                      />
                    </div>

                    {/* Error message */}
                    {error && (
                      <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 mb-3">
                        <p className="text-red-300 text-sm">{error}</p>
                      </div>
                    )}

                    {/* Save Button */}
                    <button
                      onClick={handleSaveMood}
                      disabled={isSaving}
                      className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-teal-700 disabled:to-cyan-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-lg text-sm"
                    >
                      {isSaving ? 'Saving...' : 'Save Mood Entry'}
                    </button>
                  </div>
                )}

                {!selectedMood && (
                  <p className="text-slate-400 text-sm text-center py-4">Select a mood to get started</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Analytics Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="analytics-card bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-400/30 rounded-xl p-5 backdrop-blur-sm" style={{ animationDelay: '0.1s' }}>
                <p className="text-amber-200 text-xs font-semibold uppercase tracking-wider mb-2">Most Frequent</p>
                <div className="text-3xl mb-1">{computedAnalytics.mostFrequent?.[0]}</div>
                <p className="text-amber-300 text-sm font-medium">{computedAnalytics.mostFrequent?.[1] || 'Calm'}</p>
              </div>

              <div className="analytics-card bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-400/30 rounded-xl p-5 backdrop-blur-sm" style={{ animationDelay: '0.2s' }}>
                <p className="text-teal-200 text-xs font-semibold uppercase tracking-wider mb-2">Avg. Intensity</p>
                <div className="text-3xl mb-1">{computedAnalytics.avgIntensity}</div>
                <p className="text-teal-300 text-sm font-medium">Last 7 days</p>
              </div>

              <div className="analytics-card bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-400/30 rounded-xl p-5 backdrop-blur-sm" style={{ animationDelay: '0.3s' }}>
                <p className="text-rose-200 text-xs font-semibold uppercase tracking-wider mb-2">Tracking Streak</p>
                <div className="text-3xl mb-1">{computedAnalytics.streak}</div>
                <p className="text-rose-300 text-sm font-medium">{computedAnalytics.streak === 1 ? 'day' : 'days'}</p>
              </div>
            </div>

            {/* Mood Trends Chart */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border border-teal-400/20 rounded-2xl p-8 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-white mb-6">Mood Trends (Last 7 Days)</h3>

              {chartData.length > 0 ? (
                <div className="flex items-end gap-2 h-48 bg-gradient-to-t from-slate-700/30 to-transparent rounded-lg p-4">
                  {chartData.map((item, idx) => {
                    const config = getMoodConfig(item.mood);
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center group relative"
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-slate-900 border border-slate-700 text-white px-3 py-1 rounded text-xs whitespace-nowrap transition pointer-events-none">
                          {item.mood} {item.intensity}/10
                        </div>

                        {/* Bar */}
                        <div
                          className={`chart-bar w-full bg-gradient-to-t ${config.color} rounded-t-lg transition hover:opacity-80 cursor-pointer shadow-lg`}
                          style={{
                            height: `${(item.intensity / 10) * 100}%`,
                            animationDelay: `${idx * 0.1}s`,
                          }}
                        />
                        <p className="text-slate-400 text-xs mt-3 font-medium">{item.date}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400">
                  No mood data for the past 7 days
                </div>
              )}
            </div>

            {/* Calendar View */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border border-teal-400/20 rounded-2xl p-8 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-white mb-6">Mood Calendar (Last 8 Weeks)</h3>

              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center">
                    <p className="text-slate-400 text-xs font-semibold mb-3">{day}</p>
                  </div>
                ))}

                {calendarData.map((day, idx) => {
                  const config = day.mood ? getMoodConfig(day.mood) : null;
                  return (
                    <div
                      key={idx}
                      className={`calendar-day flex items-center justify-center h-12 rounded-lg border transition cursor-pointer ${
                        day.mood
                          ? `bg-gradient-to-br ${config?.color} border-${config?.color.split('-')[2]}-400/50 hover:shadow-lg hover:shadow-${config?.color.split('-')[2]}-500/20`
                          : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50'
                      }`}
                      title={day.mood ? `${day.date}: ${day.mood}` : day.date}
                    >
                      {day.mood && <span className="text-lg">{day.mood}</span>}
                    </div>
                  );
                })}
              </div>

              <p className="text-slate-400 text-xs mt-6 text-center">Showing mood entries for the past 56 days</p>
            </div>

            {/* Recent Entries */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border border-teal-400/20 rounded-2xl p-8 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-white mb-6">Journal Entries</h3>

              {isLoading ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">Loading mood entries...</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                  {moodEntries.length > 0 ? (
                    moodEntries.map((entry, idx) => {
                      const emoji = categoryToEmoji[entry.moodCategory] || '😌';
                      const config = getMoodConfig(emoji);
                      const entryDate = new Date(entry.createdAt);
                      return (
                        <div
                          key={entry.id}
                          className={`entry-card bg-gradient-to-br ${config.lightBg} border rounded-xl p-5 backdrop-blur-sm hover:border-opacity-60 transition`}
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-3xl flex-shrink-0">{emoji}</div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between gap-2 mb-2">
                                <p className="text-white font-semibold text-sm">
                                  {entryDate.toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                                <span className={`${config.accentColor} text-xs font-semibold`}>
                                  {entryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              {entry.notes && (
                                <p className="text-slate-300 text-sm leading-relaxed mb-3">{entry.notes}</p>
                              )}

                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-slate-700/50 px-3 py-1 rounded-full">
                                  <span className="text-xs text-slate-300">Intensity:</span>
                                  <span className={`${config.accentColor} text-sm font-bold`}>{entry.moodScore}/10</span>
                                </div>
                                <span className="text-xs text-slate-400 ml-auto">{entry.moodCategory}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-sm">No mood entries yet. Start tracking today!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Insights Section */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border border-teal-400/20 rounded-2xl p-8 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-white mb-6">Weekly Insights</h3>

              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    <span className="text-teal-300 font-semibold">This week:</span> You've logged {analytics?.totalEntries || moodEntries.length} mood entries. Your most common emotion is <span className="font-semibold">{computedAnalytics.mostFrequent?.[1] || 'Calm'}</span> with an average intensity of {computedAnalytics.avgIntensity}/10.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-slate-400 text-xs uppercase font-semibold mb-2">Emotional Balance</p>
                    <div className="w-full bg-slate-600/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(computedAnalytics.avgIntensity * 10, 100)}%` }}
                      />
                    </div>
                    <p className="text-slate-300 text-xs mt-2">Based on recent intensity levels</p>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-slate-400 text-xs uppercase font-semibold mb-2">Consistency</p>
                    <div className="w-full bg-slate-600/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((computedAnalytics.streak / 30) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-slate-300 text-xs mt-2">Tracking streak: {computedAnalytics.streak} days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoodTrackerPage;
