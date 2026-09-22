/**
 * SAANS Dashboard - API INTEGRATED
 * Uses React Query hooks for real API data
 * Clean, minimal, professional mental health dashboard
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store';
import {
  Button,
  Card,
  H1,
  H2,
  Body,
  Typography,
  Badge,
  CountBadge,
} from '../design-system';
import {
  useNextAppointment,
  useRecentMood,
  useRecentActivity,
  useMoodStats,
} from '../hooks';

/**
 * Loading Skeleton Component
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-neutral-200 rounded-lg" />
      <div className="h-32 bg-neutral-200 rounded-lg" />
      <div className="h-24 bg-neutral-200 rounded-lg" />
    </div>
  );
}

/**
 * Error Component
 */
function ErrorComponent({ message }: { message: string }) {
  return (
    <Card variant="outlined" padding="lg" className="border-l-4 border-l-error-500">
      <Typography variant="bodyMd" color="error">
        ❌ {message}
      </Typography>
    </Card>
  );
}

/**
 * Dashboard Page - Main Component
 */
export function DashboardPageIntegrated() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // API Queries
  const { data: nextAppointment, isLoading: appointmentLoading } =
    useNextAppointment();
  const { data: currentMood, isLoading: moodLoading } = useRecentMood();
  const { data: stats } = useMoodStats();
  const { data: recentActivity } = useRecentActivity(5);

  // Combine loading states
  const isLoading = appointmentLoading || moodLoading;
  const primaryLoading = appointmentLoading || moodLoading;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* SECTION 1: Greeting */}
        <div className="mb-8">
          <H1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName || 'Friend'}! 👋
          </H1>
          <Body color="secondary">
            Your mental health journey continues today
          </Body>
        </div>

        {/* SECTION 2: Mood Widget (Primary Focus) */}
        {primaryLoading ? (
          <LoadingSkeleton />
        ) : currentMood ? (
          <Card
            variant="elevated"
            padding="lg"
            className="mb-8 border-l-4 border-l-primary-500"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <H2 className="text-xl">How are you feeling today?</H2>
                {stats && <CountBadge count={stats.streak} variant="success" />}
              </div>

              {/* Current Mood Display */}
              <div className="flex items-center gap-6 py-4 px-4 bg-primary-50 rounded-lg">
                <div className="text-5xl">
                  {getMoodEmoji(currentMood.mood)}
                </div>
                <div className="flex-1">
                  <Typography variant="h3" className="font-bold">
                    {currentMood.moodLabel}
                  </Typography>
                  <Typography variant="bodySm" color="secondary">
                    Last logged {formatTime(currentMood.timestamp)}
                  </Typography>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/mood-tracker')}
                >
                  Update Mood
                </Button>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-3 gap-2 text-center py-2">
                  <div>
                    <Typography variant="labelSm" color="secondary">
                      Avg Mood
                    </Typography>
                    <Typography variant="h4" className="font-bold mt-1">
                      {stats.average.toFixed(1)}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="labelSm" color="secondary">
                      This Week
                    </Typography>
                    <Typography variant="h4" className="font-bold mt-1">
                      {stats.thisWeekAverage.toFixed(1)}
                    </Typography>
                  </div>
                  <div>
                    <Badge
                      variant={
                        stats.trend === 'improving'
                          ? 'success'
                          : stats.trend === 'stable'
                            ? 'info'
                            : 'warning'
                      }
                      size="sm"
                    >
                      {stats.trend}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card variant="outlined" padding="lg" className="mb-8 text-center">
            <Body color="secondary">No mood entry yet today</Body>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/mood-tracker')}
              className="mt-4"
            >
              Log Your Mood
            </Button>
          </Card>
        )}

        {/* SECTION 3: Next Appointment (If exists) */}
        {appointmentLoading ? (
          <LoadingSkeleton />
        ) : nextAppointment ? (
          <Card variant="outlined" padding="lg" className="mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Typography variant="labelMd" color="secondary">
                  Upcoming Appointment
                </Typography>
                <H3 className="text-lg font-semibold mt-2">
                  {nextAppointment.therapistName}
                </H3>
                <Typography variant="bodySm" color="secondary" className="mt-1">
                  {nextAppointment.specialty}
                </Typography>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span>📅 {formatDate(nextAppointment.date)}</span>
                  <span>🕐 {nextAppointment.time}</span>
                  <Badge
                    variant={
                      nextAppointment.status === 'confirmed' ? 'success' : 'info'
                    }
                    size="sm"
                  >
                    {nextAppointment.status}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/appointments/${nextAppointment.id}`)}
                >
                  Reschedule
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    navigate(`/appointments/${nextAppointment.id}/join`)
                  }
                >
                  Join Call
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {/* SECTION 4: Quick Actions */}
        <div className="mb-8">
          <H2 className="text-lg font-semibold mb-4">Quick Actions</H2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <QuickActionCard
              icon="🤖"
              label="AI Counselor"
              onClick={() => navigate('/counselor')}
            />
            <QuickActionCard
              icon="👨‍⚕️"
              label="Find Therapist"
              badge={3}
              onClick={() => navigate('/therapist')}
            />
            <QuickActionCard
              icon="📊"
              label="Mood Tracker"
              onClick={() => navigate('/mood-tracker')}
            />
            <QuickActionCard
              icon="👥"
              label="Community"
              badge={2}
              onClick={() => navigate('/community')}
            />
          </div>
        </div>

        {/* SECTION 5: Recent Activity */}
        {recentActivity && recentActivity.length > 0 && (
          <div className="mb-8">
            <H2 className="text-lg font-semibold mb-4">Recent Activity</H2>
            <Card variant="flat" padding="lg">
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-3 border-b border-neutral-200 last:pb-0 last:border-0"
                  >
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1">
                      <Typography variant="bodySm">
                        {activity.message}
                      </Typography>
                      <Typography
                        variant="labelSm"
                        color="secondary"
                        className="mt-1"
                      >
                        {formatTime(activity.timestamp)}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* SECTION 6: Hidden Actions */}
        <Card variant="flat" padding="lg" className="text-center py-6">
          <Typography variant="bodySm" color="secondary">
            More features available
          </Typography>
          <div className="mt-4 space-y-2">
            <Button
              variant="tertiary"
              size="md"
              onClick={() => navigate('/crisis')}
              fullWidth
            >
              🆘 Crisis Support
            </Button>
            <Button
              variant="tertiary"
              size="md"
              onClick={() => navigate('/profile')}
              fullWidth
            >
              ⚙️ Settings & Profile
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}

/**
 * Helper Components & Functions
 */

interface QuickActionCardProps {
  icon: string;
  label: string;
  badge?: number;
  onClick: () => void;
}

function QuickActionCard({
  icon,
  label,
  badge,
  onClick,
}: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-3 p-4 rounded-lg bg-white border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
    >
      <div className="relative text-3xl group-hover:scale-110 transition-transform">
        {icon}
        {badge && (
          <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-error-500 text-white text-xs font-bold rounded-full">
            {badge}
          </span>
        )}
      </div>
      <Typography
        variant="labelSm"
        className="text-center text-neutral-700 group-hover:text-primary-600"
      >
        {label}
      </Typography>
    </button>
  );
}

/**
 * Utility Functions
 */

function getMoodEmoji(moodScore: number): string {
  if (moodScore <= 2) return '😢';
  if (moodScore <= 4) return '😔';
  if (moodScore <= 6) return '😐';
  if (moodScore <= 8) return '🙂';
  return '😊';
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default DashboardPageIntegrated;
