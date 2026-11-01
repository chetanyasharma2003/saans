import React, { useState } from 'react';
import { AlertCircle, Calendar, CheckCircle, Clock, Loader, MessageSquare, Phone, Video, X } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface Therapist {
  id: string;
  firstName: string;
  lastName: string;
  hourlyRate: number | string;
  isDemo?: boolean;
}

interface BookingModalProps {
  isOpen: boolean;
  therapist: Therapist | null;
  onClose: () => void;
  onSuccess?: () => void;
}

type SessionType = 'video' | 'audio' | 'chat';

const sessionTypes: Array<{ value: SessionType; label: string; detail: string; icon: typeof Video }> = [
  { value: 'video', label: 'Video call', detail: 'Face-to-face online session', icon: Video },
  { value: 'audio', label: 'Audio call', detail: 'Voice-only online session', icon: Phone },
  { value: 'chat', label: 'Chat session', detail: 'Scheduled text-based session', icon: MessageSquare },
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00',
];

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function BookingModal({ isOpen, therapist, onClose, onSuccess }: BookingModalProps) {
  const [sessionType, setSessionType] = useState<SessionType>('video');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(false);

  if (!isOpen || !therapist) return null;

  const reset = () => {
    setSessionType('video');
    setDate('');
    setTime('');
    setDuration(60);
    setNotes('');
    setError('');
    setBooked(false);
  };

  const close = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const submitBooking = async () => {
    const scheduledAt = new Date(`${date}T${time}`);
    if (!date || !time || Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      setError('Choose a valid future date and time.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiClient.post('/api/appointments', {
        therapistId: therapist.id,
        scheduledAt: scheduledAt.toISOString(),
        type: sessionType,
        duration,
        notes: notes.trim(),
      });
      setBooked(true);
      window.setTimeout(() => {
        reset();
        onClose();
        onSuccess?.();
      }, 1200);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || requestError.message || 'Unable to book this session.');
    } finally {
      setLoading(false);
    }
  };

  const hourlyRate = Number(therapist.hourlyRate);
  const estimatedPrice = Number.isFinite(hourlyRate) ? Math.round(hourlyRate * duration / 60) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-900 to-slate-900">
        <div className="sticky top-0 flex items-center justify-between border-b border-purple-400/20 bg-purple-900/90 p-6 backdrop-blur">
          <div>
            <h2 className="text-2xl font-bold text-white">{booked ? 'Session booked' : 'Book a session'}</h2>
            <p className="text-sm text-gray-300">with {therapist.isDemo ? 'Demo profile: ' : ''}{therapist.firstName} {therapist.lastName}</p>
          </div>
          <button type="button" onClick={close} disabled={loading} aria-label="Close booking dialog" className="rounded-lg p-2 text-gray-300 hover:bg-slate-800 disabled:opacity-50">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {booked ? (
            <div className="py-8 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-green-400" />
              <p className="text-lg text-white">
                {therapist.isDemo
                  ? 'Demo booking saved for this presentation. It is not a real appointment or care service.'
                  : 'Your booking is saved. You can find it in Sessions.'}
              </p>
            </div>
          ) : (
            <>
              {therapist.isDemo && (
                <div role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                  Demo booking only. This fictional profile is not a real clinician; no appointment, payment, or care service will be provided.
                </div>
              )}
              <fieldset>
                <legend className="mb-3 font-semibold text-white">Session type</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {sessionTypes.map(({ value, label, detail, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSessionType(value)}
                      aria-pressed={sessionType === value}
                      className={`rounded-xl border p-4 text-left ${sessionType === value ? 'border-purple-400 bg-purple-600/30' : 'border-slate-700 bg-slate-800/50'}`}
                    >
                      <Icon className="mb-2 h-5 w-5 text-purple-300" />
                      <span className="block font-semibold text-white">{label}</span>
                      <span className="mt-1 block text-xs text-gray-400">{detail}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-300">
                  <span className="mb-2 flex items-center gap-2"><Calendar className="h-4 w-4" /> Date</span>
                  <input
                    type="date"
                    min={localDateString(new Date(Date.now() + 24 * 60 * 60 * 1000))}
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
                  />
                </label>

                <label className="text-sm font-medium text-gray-300">
                  <span className="mb-2 flex items-center gap-2"><Clock className="h-4 w-4" /> Duration</span>
                  <select value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white">
                    {[30, 45, 60, 90].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
                  </select>
                </label>
              </div>

              <fieldset>
                <legend className="mb-3 text-sm font-medium text-gray-300">Choose a time</legend>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      aria-pressed={time === slot}
                      className={`rounded-lg border px-3 py-2 text-sm ${time === slot ? 'border-purple-400 bg-purple-600 text-white' : 'border-slate-700 bg-slate-800/50 text-gray-300'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block text-sm font-medium text-gray-300">
                Notes (optional)
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} rows={3} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white" />
              </label>

              <div className="flex items-center justify-between rounded-lg bg-slate-800/70 p-4">
                <span className="text-gray-300">{therapist.isDemo ? 'Demo price estimate' : 'Estimated session fee'}</span>
                <strong className="text-xl text-white">{estimatedPrice === null ? 'Rate unavailable' : `₹${estimatedPrice}`}</strong>
              </div>

              {error && <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-300"><AlertCircle className="h-5 w-5" />{error}</div>}

              <div className="flex gap-3">
                <button type="button" onClick={close} disabled={loading} className="flex-1 rounded-lg border border-slate-700 px-4 py-3 text-gray-300 disabled:opacity-50">Cancel</button>
                <button type="button" onClick={submitBooking} disabled={loading || !date || !time} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 font-semibold text-white disabled:opacity-50">
                  {loading && <Loader className="h-4 w-4 animate-spin" />}
                  {loading ? 'Booking...' : therapist.isDemo ? 'Create demo booking' : 'Confirm booking'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
