/**
 * SAANS Dashboard - REFACTORED
 * Clean, focused, professional mental health dashboard
 * Uses design system for consistency
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
  Icon,
  Badge,
  CountBadge,
} from '../design-system';
import { semanticSpacing } from '../design-system/spacing';

/**
 * MOTTO: Focus > Clutter
 * Only show critical information
 * Everything else goes behind "View More" links
 */

export function DashboardPageRefactored() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Mock data (TEMPORARY - will be replaced with real API calls)
  const currentMood = { emoji: '😊', label: 'Happy', date: '2 hours ago' };
  const nextAppointment = {
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Anxiety & Stress Management',
    date: 'Today',
    time: '3:00 PM',
  };

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
        <Card
          variant="elevated"
          padding="lg"
          className="mb-8 border-l-4 border-l-primary-500"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <H2 className="text-xl">How are you feeling today?</H2>
              <CountBadge count={12} max={99} variant="info" />
            </div>

            {/* Current Mood Display */}
            <div className="flex items-center gap-6 py-4 px-4 bg-primary-50 rounded-lg">
              <div className="text-5xl">{currentMood.emoji}</div>
              <div className="flex-1">
                <Typography variant="h3" className="font-bold">
                  {currentMood.label}
                </Typography>
                <Typography variant="bodySm" color="secondary">
                  Last logged {currentMood.date}
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

            {/* Mood Trend (Optional) */}
            <div className="text-center py-2">
              <Badge variant="success" size="sm">
                ✓ 15-day streak! Keep it up!
              </Badge>
            </div>
          </div>
        </Card>

        {/* SECTION 3: Next Appointment (If exists) */}
        {nextAppointment && (
          <Card variant="outlined" padding="lg" className="mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Typography variant="labelMd" color="secondary">
                  Upcoming Appointment
                </Typography>
                <H3 className="text-lg font-semibold mt-2">
                  {nextAppointment.doctorName}
                </H3>
                <Typography variant="bodySm" color="secondary" className="mt-1">
                  {nextAppointment.specialty}
                </Typography>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span>📅 {nextAppointment.date}</span>
                  <span>🕐 {nextAppointment.time}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  Reschedule
                </Button>
                <Button variant="primary" size="sm">
                  Join Call
                </Button>
              </div>
            </div>
          </Card>
        )}

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

        {/* SECTION 5: Hidden Actions (Behind "View More") */}
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
 * QuickActionCard Component
 * Small card for quick navigation
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

export default DashboardPageRefactored;
