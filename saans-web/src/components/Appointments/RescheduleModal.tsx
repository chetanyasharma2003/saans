import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface RescheduleModalProps {
  isOpen: boolean;
  appointment: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RescheduleModal({ isOpen, appointment, onClose, onSuccess }: RescheduleModalProps) {
  const [step, setStep] = useState<'details' | 'confirmation' | 'success' | 'error'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
    notes: '',
  });

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00'
  ];

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const minDate = getTomorrowDate();
  const therapistName = appointment?.therapist?.firstName + ' ' + appointment?.therapist?.lastName;

  const handleConfirm = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      setError('Please select both date and time');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('accessToken');
      const newScheduledAt = new Date(`${rescheduleData.date}T${rescheduleData.time}`);

      const response = await axios.put(
        `${API_URL}/api/appointments/${appointment.id}`,
        {
          scheduledAt: newScheduledAt.toISOString(),
          notes: rescheduleData.notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStep('success');
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reschedule appointment');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('details');
    setRescheduleData({ date: '', time: '', notes: '' });
    setError('');
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 border border-purple-400/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-purple-900/50 backdrop-blur border-b border-purple-400/20 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Reschedule Appointment</h2>
            <p className="text-sm text-gray-400">with Dr. {therapistName}</p>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Details Step */}
          {step === 'details' && (
            <div className="space-y-6">
              {/* Current Appointment Info */}
              <div className="p-4 bg-slate-800/50 border border-purple-400/20 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Current Appointment</p>
                <p className="text-white font-bold">
                  {new Date(appointment.scheduledAt).toLocaleDateString()} at{' '}
                  {new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Select New Date
                </label>
                <input
                  type="date"
                  min={minDate}
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-lg px-4 py-3 focus:border-purple-400/50 focus:outline-none"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Select New Time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setRescheduleData(prev => ({ ...prev, time }))}
                      className={`p-2 rounded-lg transition-all text-sm font-medium ${
                        rescheduleData.time === time
                          ? 'bg-purple-600 text-white border border-purple-400'
                          : 'bg-slate-800/50 text-gray-300 border border-slate-700/50 hover:border-purple-400/50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Additional Notes (Optional)</label>
                <textarea
                  value={rescheduleData.notes}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any specific requests or concerns..."
                  rows={3}
                  className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-lg px-4 py-3 focus:border-purple-400/50 focus:outline-none placeholder-gray-500"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300">{error}</span>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300">{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  className="flex-1 px-4 py-3 border border-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-800 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!rescheduleData.date || !rescheduleData.time) {
                      setError('Please select both date and time');
                      return;
                    }
                    setError('');
                    setStep('confirmation');
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Step */}
          {step === 'confirmation' && (
            <div className="space-y-6">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-400">Therapist</p>
                    <p className="font-bold text-white">Dr. {therapistName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Session Type</p>
                    <p className="font-bold text-white capitalize">{appointment.type}</p>
                  </div>
                </div>

                <hr className="border-slate-700/50" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">New Date</p>
                    <p className="font-bold text-white">
                      {rescheduleData.date ? new Date(rescheduleData.date + 'T00:00:00').toLocaleDateString() : 'Select date'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">New Time</p>
                    <p className="font-bold text-white">{rescheduleData.time || 'Select time'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="font-bold text-white">{appointment.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Cost</p>
                    <p className="font-bold text-white">₹{appointment.price}</p>
                  </div>
                </div>

                {rescheduleData.notes && (
                  <>
                    <hr className="border-slate-700/50" />
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Notes</p>
                      <p className="text-white text-sm">{rescheduleData.notes}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 px-4 py-3 border border-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-800 transition-all font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Rescheduling...
                    </>
                  ) : (
                    'Confirm Reschedule'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Rescheduled!</h3>
              <p className="text-gray-400">Your appointment has been successfully rescheduled.</p>
              <p className="text-white font-bold">
                {new Date(rescheduleData.date).toLocaleDateString()} at {rescheduleData.time}
              </p>
              <p className="text-sm text-gray-500">Redirecting to appointments...</p>
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-16 h-16 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Reschedule Failed</h3>
              <p className="text-red-400">{error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RescheduleModal;
