/**
 * Appointment Page - API INTEGRATED
 * View, reschedule, and cancel appointments
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
  useAppointments,
  useUpcomingAppointments,
  useRescheduleAppointment,
  useCancelAppointment,
  type Appointment,
} from '../hooks';
import { AppointmentSkeleton, ListSkeleton } from '../components/SkeletonLoaders';

/**
 * Appointment Status Badge
 */
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    confirmed: 'success',
    pending: 'warning',
    completed: 'info',
    cancelled: 'error',
  };

  return (
    <Badge variant={variants[status] || 'info'} size="sm">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

/**
 * Appointment Card Component
 */
function AppointmentCard({
  appointment,
  onReschedule,
  onCancel,
}: {
  appointment: Appointment;
  onReschedule: () => void;
  onCancel: () => void;
}) {
  const appointmentDate = new Date(appointment.date);
  const isUpcoming = appointmentDate > new Date();

  return (
    <Card variant="outlined" padding="lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <H3 className="font-semibold">{appointment.therapistName}</H3>
            <Typography variant="bodySm" color="secondary">
              {appointment.specialty}
            </Typography>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-primary-50 rounded-lg">
          <div>
            <Typography variant="labelSm" color="secondary">
              Date
            </Typography>
            <Typography variant="bodyMd" className="font-semibold">
              {appointmentDate.toLocaleDateString('en-IN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Typography>
          </div>
          <div>
            <Typography variant="labelSm" color="secondary">
              Time
            </Typography>
            <Typography variant="bodyMd" className="font-semibold">
              {appointmentDate.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Type:</span>
            <span className="font-medium">{appointment.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Duration:</span>
            <span className="font-medium">{appointment.duration} mins</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Price:</span>
            <span className="font-medium">₹{appointment.price}</span>
          </div>
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div className="p-3 bg-neutral-50 rounded-lg">
            <Typography variant="labelSm" color="secondary">
              Notes
            </Typography>
            <Typography variant="bodySm" className="mt-1">
              {appointment.notes}
            </Typography>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-neutral-200">
          {isUpcoming && appointment.status !== 'cancelled' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={onReschedule}
              >
                Reschedule
              </Button>
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={onCancel}
              >
                Cancel
              </Button>
            </>
          )}
          {appointment.status === 'completed' && (
            <Button variant="secondary" size="sm" fullWidth>
              View Feedback
            </Button>
          )}
          {isUpcoming && appointment.type === 'video' && (
            <Button variant="primary" size="sm" fullWidth>
              Join Call
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Reschedule Modal
 */
function RescheduleModal({
  appointment,
  onReschedule,
  onClose,
  isLoading,
}: {
  appointment: Appointment;
  onReschedule: (date: string, time: string) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card variant="elevated" padding="lg" className="max-w-md w-full mx-4">
        <H2 className="mb-4">Reschedule Appointment</H2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">New Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">New Time</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              fullWidth
              onClick={() => onReschedule(selectedDate, selectedTime)}
              isLoading={isLoading}
              isDisabled={!selectedDate || !selectedTime}
            >
              Confirm
            </Button>
            <Button variant="secondary" fullWidth onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Main Page
 */
export function AppointmentPageIntegrated() {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');
  const [rescheduleModal, setRescheduleModal] = useState<{
    appointment: Appointment;
    open: boolean;
  } | null>(null);

  // API Queries
  const { data: allAppointments, isLoading, error } = useAppointments();
  const { data: upcomingAppointments } = useUpcomingAppointments();
  const { mutate: reschedule, isPending: reschedulePending } =
    useRescheduleAppointment();
  const { mutate: cancel, isPending: cancelPending } = useCancelAppointment();

  const upcoming = upcomingAppointments || [];
  const past = allAppointments?.filter(
    (apt) => new Date(apt.date) <= new Date()
  ) || [];

  const displayAppointments =
    selectedTab === 'upcoming' ? upcoming : past;

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <H1 className="mb-2">My Appointments</H1>
          <Body color="secondary">
            View, reschedule, and manage your therapy sessions
          </Body>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={selectedTab === 'upcoming' ? 'primary' : 'secondary'}
            size="md"
            onClick={() => setSelectedTab('upcoming')}
          >
            Upcoming {upcoming.length > 0 && `(${upcoming.length})`}
          </Button>
          <Button
            variant={selectedTab === 'past' ? 'primary' : 'secondary'}
            size="md"
            onClick={() => setSelectedTab('past')}
          >
            Past {past.length > 0 && `(${past.length})`}
          </Button>
        </div>

        {/* Content */}
        {error ? (
          <Card variant="outlined" padding="lg" className="border-l-4 border-l-error-500">
            <Typography variant="bodyMd" color="error">
              ❌ Error loading appointments
            </Typography>
          </Card>
        ) : isLoading ? (
          <ListSkeleton count={4} />
        ) : displayAppointments.length > 0 ? (
          <div className="space-y-4">
            {displayAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onReschedule={() =>
                  setRescheduleModal({ appointment, open: true })
                }
                onCancel={() =>
                  cancel(appointment.id, {
                    onSuccess: () => {
                      alert('Appointment cancelled');
                    },
                  })
                }
              />
            ))}
          </div>
        ) : (
          <Card variant="flat" padding="lg" className="text-center py-12">
            <Body color="secondary">
              {selectedTab === 'upcoming'
                ? 'No upcoming appointments. Book one now!'
                : 'No past appointments yet'}
            </Body>
            {selectedTab === 'upcoming' && (
              <Button variant="primary" size="md" className="mt-4">
                Find a Therapist
              </Button>
            )}
          </Card>
        )}
      </main>

      {/* Reschedule Modal */}
      {rescheduleModal?.open && (
        <RescheduleModal
          appointment={rescheduleModal.appointment}
          onReschedule={(date, time) => {
            reschedule(
              { id: rescheduleModal.appointment.id, date, time },
              {
                onSuccess: () => {
                  setRescheduleModal(null);
                  alert('Appointment rescheduled');
                },
              }
            );
          }}
          onClose={() => setRescheduleModal(null)}
          isLoading={reschedulePending}
        />
      )}
    </div>
  );
}

interface H3Props {
  className?: string;
  children: React.ReactNode;
}

function H3({ className = '', children }: H3Props) {
  return <Typography as="h3" variant="h3" className={className}>{children}</Typography>;
}

export default AppointmentPageIntegrated;
