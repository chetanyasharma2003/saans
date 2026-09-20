import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/colors-genuine.css';

interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface ProgressData {
  percentage: number;
  milestones: number;
  metrics: number;
}

const ProgressTrackingPage: React.FC = () => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [moodTrend, setMoodTrend] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const [progressRes, milestonesRes, trendRes] = await Promise.all([
        axios.get('/api/progress/recovery-percentage', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        axios.get('/api/progress/milestones', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        axios.get('/api/progress/mood-trend', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      setProgress(progressRes.data.data);
      setMilestones(milestonesRes.data.data || []);
      setMoodTrend(trendRes.data.data);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/progress/milestones/add', newMilestone, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNewMilestone({ title: '', description: '' });
      setShowAddMilestone(false);
      fetchProgressData();
    } catch (error) {
      console.error('Failed to add milestone:', error);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Your Recovery Progress
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Track your healing journey and celebrate your victories
          </p>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading your progress...</p>
        ) : (
          <>
            {/* Recovery Percentage */}
            {progress && (
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary-color)' }}>
                  Recovery Progress
                </h2>

                <div className="flex items-center mb-6">
                  <div className="relative w-32 h-32 mr-8">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="var(--primary-color)"
                        strokeWidth="8"
                        strokeDasharray={`${progress.percentage * 2.83} 283`}
                        style={{ transition: 'stroke-dasharray 0.3s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold" style={{ color: 'var(--primary-color)' }}>
                          {progress.percentage}%
                        </div>
                        <div className="text-xs text-gray-600">Recovered</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="mb-4">
                      <p className="text-gray-700 mb-2">
                        You've achieved <strong>{progress.milestones}</strong> milestones
                      </p>
                      <p className="text-gray-700">
                        Tracking <strong>{progress.metrics}</strong> recovery metrics
                      </p>
                    </div>

                    <p className="text-gray-600 text-sm">
                      Your consistent effort and commitment to your mental health are bringing real,
                      measurable progress. Every step forward counts.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mood Trend Chart */}
            {moodTrend && (
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary-color)' }}>
                  Mood Trend (Last 30 Days)
                </h2>

                <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-around p-4">
                  {moodTrend.trend && moodTrend.trend.length > 0 ? (
                    moodTrend.trend.map((entry: any, index: number) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-6 rounded-t"
                          style={{
                            height: `${(entry.score / 10) * 100}%`,
                            backgroundColor: 'var(--primary-color)',
                          }}
                        />
                        <div className="text-xs text-gray-600 mt-2 text-center">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-600">No mood data yet. Start tracking!</p>
                  )}
                </div>

                {moodTrend.average && (
                  <p className="text-center mt-4 text-gray-600">
                    Average mood score: <strong>{moodTrend.average.toFixed(1)}/10</strong>
                  </p>
                )}
              </div>
            )}

            {/* Milestones */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>
                  My Milestones
                </h2>
                <button
                  onClick={() => setShowAddMilestone(!showAddMilestone)}
                  className="px-4 py-2 rounded-lg font-semibold text-white transition"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  + Add Milestone
                </button>
              </div>

              {showAddMilestone && (
                <form onSubmit={handleAddMilestone} className="bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Milestone title (e.g., First week without panic attacks)"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                      className="w-full p-3 border rounded"
                      required
                    />
                    <textarea
                      placeholder="Tell us about this milestone..."
                      value={newMilestone.description}
                      onChange={(e) =>
                        setNewMilestone({ ...newMilestone, description: e.target.value })
                      }
                      className="w-full p-3 border rounded h-24"
                      required
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg font-semibold text-white transition"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                      Save Milestone
                    </button>
                  </div>
                </form>
              )}

              {milestones.length > 0 ? (
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="border-l-4 p-4 rounded flex items-start"
                      style={{ borderLeftColor: 'var(--primary-color)' }}
                    >
                      <div className="mr-4">
                        <span className="text-3xl">🎉</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{milestone.title}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(milestone.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  No milestones yet. Start by adding one when you achieve something meaningful!
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressTrackingPage;
