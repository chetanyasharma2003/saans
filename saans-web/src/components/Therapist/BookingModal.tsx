import React, { useState } from 'react';
import { X, Calendar, Clock, Video, Phone, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface BookingModalProps {
  isOpen: boolean;
  therapist: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BookingModal({ isOpen, therapist, onClose, onSuccess }: BookingModalProps) {
  const [step, setStep] = useState<'type' | 'details' | 'confirmation' | 'success' | 'error'>('type');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [bookingData, setBookingData] = useState({
    sessionType: 'video',
    date: '',
    time: '',
    duration: 60,
    notes: ''
  });

  if (!isOpen || !therapist) return null;

  const handleSessionTypeSelect = (type: 'video' | 'call') => {
    setBookingData(prev => ({ ...prev, sessionType: type }));
    setStep('details');
  };

  const handleDateTimeSubmit = () => {
    if (!bookingData.date || !bookingData.time) {
      setError('Please select both date and time');
      return;
    }
    setStep('confirmation');
  };

  const handleBookingConfirm = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('accessToken');
      const scheduledAt = new Date(`${bookingData.date}T${bookingData.time}`);

      const response = await axios.post(
        `${API_URL}/api/appointments`,
        {
          therapistId: therapist.id,
          scheduledAt: scheduledAt.toISOString(),
          type: bookingData.sessionType,
          duration: bookingData.duration,
          notes: bookingData.notes,
          status: 'confirmed'
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
      setError(err.response?.data?.error || 'Failed to book appointment');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('type');
    setBookingData({ sessionType: 'video', date: '', time: '', duration: 60, notes: '' });
    setError('');
  };

  // Get available time slots
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900 to-slate-900 border border-purple-400/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-400/20 sticky top-0 bg-purple-900/50 backdrop-blur">
          <div>
            <h2 className="text-2xl font-bold text-white">Book Appointment</h2>
            <p className="text-sm text-gray-400">with Dr. {therapist.firstName} {therapist.lastName}</p>
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
          {/* Step 1: Session Type */}
          {step === 'type' && (
            <div className="space-y-6">
              <p className="text-gray-300 mb-6">Choose your preferred session type:</p>

              <button
                onClick={() => handleSessionTypeSelect('video')}
                className="w-full p-6 border-2 border-blue-400/50 rounded-xl hover:bg-blue-500/20 hover:border-blue-400 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Video className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Video Call</h3>
                    <p className="text-sm text-gray-400">Face-to-face video consultation</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSessionTypeSelect('call')}
                className="w-full p-6 border-2 border-green-400/50 rounded-xl hover:bg-green-500/20 hover:border-green-400 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Phone className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Phone Call</h3>
                    <p className="text-sm text-gray-400">Audio consultation call</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 'details' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Select Date
                </label>
                <input
                  type="date"
                  min={minDate}
                  value={bookingData.date}
                  onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-lg px-4 py-3 focus:border-purple-400/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Select Time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setBookingData(prev => ({ ...prev, time }))}
                      className={`p-2 rounded-lg transition-all text-sm font-medium ${
                        bookingData.time === time
                          ? 'bg-purple-600 text-white border border-purple-400'
                          : 'bg-slate-800/50 text-gray-300 border border-slate-700/50 hover:border-purple-400/50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Duration</label>
                <select
                  value={bookingData.duration}
                  onChange={(e) => setBookingData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-lg px-4 py-3 focus:border-purple-400/50 focus:outline-none"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Notes (Optional)</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any specific concerns or topics you'd like to discuss..."
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

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('type')}
                  className="flex-1 px-4 py-3 border border-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-800 transition-all font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleDateTimeSubmit}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirmation' && (
            <div className="space-y-6">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-400">Therapist</p>
                    <p className="font-bold text-white">Dr. {therapist.firstName} {therapist.lastName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Rate</p>
                    <p className="font-bold text-white">₹{therapist.hourlyRate}/hr</p>
                  </div>
                </div>

                <hr className="border-slate-700/50" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="font-bold text-white">{new Date(bookingData.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Time</p>
                    <p className="font-bold text-white">{bookingData.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="font-bold text-white">{bookingData.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Session Type</p>
                    <p className="font-bold text-white capitalize">{bookingData.sessionType}</p>
                  </div>
                </div>

                <hr className="border-slate-700/50" />

                <div className="flex justify-between items-center">
                  <p className="text-gray-400">Estimated Cost</p>
                  <p className="text-2xl font-bold text-white">₹{(parseFloat(therapist.hourlyRate) * bookingData.duration / 60).toFixed(0)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 px-4 py-3 border border-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-800 transition-all font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleBookingConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Booking Confirmed!</h3>
              <p className="text-gray-400">Your appointment has been successfully booked.</p>
              <p className="text-sm text-gray-500">Redirecting to your appointments...</p>
            </div>
          )}

          {/* Step 5: Error */}
          {step === 'error' && (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-16 h-16 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Booking Failed</h3>
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

export default BookingModal;
