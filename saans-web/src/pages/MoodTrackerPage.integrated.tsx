/**
 * Mood Tracker Page - API INTEGRATED
 * Track daily moods, view trends, and mood analytics
 */

import React, { useState } from 'react';
import {
  Button,
  Card,
  H1,
  H2,
  Body,
  Badge,
  Typography,
} from '../design-system';
import {
  useMoodEntries,
  useLogMood,
  useMoodStats,
  useMoodTrend,
  type MoodEntry,
} from '../hooks';
import { MoodEntrySkeleton, ListSkeleton } from '../components/SkeletonLoaders';

/**
 * Mood Scale Selector
 */
function MoodSelector({
  onSelect,
}: {
  onSelect: (mood: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10) => void;
}) {
  const moods: Array<{ score: number; emoji: string; label: string }> = [
    { score: 1, emoji: '😢', label: 'Terrible' },
    { score: 2, emoji: '😔', label: 'Bad' },
    { score: 3, emoji: '😞', label: 'Sad' },
    { score: 4, emoji: '😕', label: 'Down' },
    { score: 5, emoji: '😐', label: 'Neutral' },
    { score: 6, emoji: '🙂', label: 'OK' },
    { score: 7, emoji: '😊', label: 'Good' },
    { score: 8, emoji: '😄', label: 'Great' },
    { score: 9, emoji: '😄', label: 'Excellent' },
    { score: 10, emoji: '🤩', label: 'Amazing' },
  ];

  return (
    <Card variant="elevated" padding="lg">
      <H2 className="mb-6">How are you feeling today?</H2>
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
        {moods.map(({ score, emoji, label }) => (
          <button
            key={score}
            onClick={() => onSelect(score as any)}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-primary-50 transition-colors"
            title={label}
          >
            <span className="text-3xl">{emoji}</span>
            <span className="text-xs font-medium text-neutral-600">{score}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

/**
 * Mood Entry Card
 */
function MoodEntryCard({ entry }: { entry: MoodEntry }) {
  return (
    <Card variant="outlined" padding="lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{getMoodEmoji(entry.mood)}</div>
          <div>
            <H3 className="font-semibold">{entry.moodLabel}</H3>
            <Typography variant="bodySm" color="secondary">
              {formatTime(entry.timestamp)}
            </Typography>
            {entry.notes && (
              <Typography variant="bodySm" className="mt-2">
                {entry.notes}
              </Typography>
            )}
          </div>
        </div>
        <Badge variant="info" size="sm">
          Level {entry.mood}/10
        </Badge>
      </div>
    </Card>
  );
}

/**
 * Stats Dashboard
 */
function StatsDashboard({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card variant="flat" padding="lg" className="text-center">
        <Typography variant="labelSm" color="secondary">
          Today
        </Typography>
        <H3 className="text-3xl font-bold mt-2">
          {stats.today || '-'}/10
        </H3>
      </Card>
      <Card variant="flat" padding="lg" className="text-center">
        <Typography variant="labelSm" color="secondary">
          This Week
        </Typography>
        <H3 className="text-3xl font-bold mt-2">
          {stats.thisWeekAverage?.toFixed(1) || '-'}
        </H3>
      </Card>
      <Card variant="flat" padding="lg" className="text-center">
        <Typography variant="labelSm" color="secondary">
          Average
        </Typography>
        <H3 className="text-3xl font-bold mt-2">
          {stats.average?.toFixed(1) || '-'}
        </H3>
      </Card>
      <Card variant="flat" padding="lg" className="text-center">
        <Typography variant="labelSm" color="secondary">
          Streak
        </Typography>
        <H3 className="text-3xl font-bold mt-2">
          {stats.streak || 0} days 🔥
        </H3>
      </Card>
    </div>
  );
}

/**
 * Main Page
 */
export function MoodTrackerPageIntegrated() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  // API Queries
  const { data: entries, isLoading, error } = useMoodEntries({ days: 30 });
  const { data: stats } = useMoodStats();
  const { mutate: logMood, isPending } = useLogMood();

  const handleLogMood = () => {
    if (selectedMood) {
      logMood(
        {
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString(),
          mood: selectedMood as any,
          moodLabel: getMoodLabel(selectedMood),
          intensity: selectedMood <= 4 ? 'low' : selectedMood <= 7 ? 'medium' : 'high',
          activities: [],
          timestamp: new Date().toISOString(),
        },
        {
          onSuccess: () => {
            setSelectedMood(null);
            setShowForm(false);
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <H1 className="mb-2">Mood Tracker</H1>
          <Body color="secondary">
            Track your emotional journey and discover patterns in your well-being
          </Body>
        </div>

        {/* Log Mood Section */}
        {showForm && (
          <div className="mb-8">
            <MoodSelector onSelect={setSelectedMood} />
            {selectedMood && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleLogMood}
                  isLoading={isPending}
                >
                  Log Mood as {selectedMood}/10
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    setSelectedMood(null);
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {!showForm && (
          <div className="mb-8">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setShowForm(true)}
            >
              Log Your Mood Today
            </Button>
          </div>
        )}

        {/* Stats */}
        {stats && <StatsDashboard stats={stats} />}

        {/* History */}
        <div className="mt-12">
          <H2 className="mb-4">Mood History</H2>

          {error ? (
            <Card variant="outlined" padding="lg" className="border-l-4 border-l-error-500">
              <Typography variant="bodyMd" color="error">
                ❌ Error loading mood history
              </Typography>
            </Card>
          ) : isLoading ? (
            <ListSkeleton count={5} />
          ) : entries && entries.length > 0 ? (
            <div className="space-y-3">
              {entries.map((entry) => (
                <MoodEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <Card variant="flat" padding="lg" className="text-center py-8">
              <Body color="secondary">No mood entries yet. Start tracking today!</Body>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * Helper Functions
 */
function getMoodEmoji(mood: number): string {
  if (mood <= 2) return '😢';
  if (mood <= 4) return '😔';
  if (mood <= 6) return '😐';
  if (mood <= 8) return '🙂';
  return '😊';
}

function getMoodLabel(mood: number): string {
  const labels = ['', 'Terrible', 'Bad', 'Sad', 'Down', 'Neutral', 'OK', 'Good', 'Great', 'Excellent', 'Amazing'];
  return labels[mood] || 'Neutral';
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface H3Props {
  className?: string;
  children: React.ReactNode;
}

function H3({ className = '', children }: H3Props) {
  return <Typography as="h3" variant="h3" className={className}>{children}</Typography>;
}

export default MoodTrackerPageIntegrated;
