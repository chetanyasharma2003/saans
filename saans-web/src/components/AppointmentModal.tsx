import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

interface Therapist {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface AppointmentModalProps {
  therapist: Therapist | null;
  onClose: () => void;
  onBookingSuccess?: (appointmentId: string) => void;
}

export function AppointmentModal({ therapist, onClose, onBookingSuccess }: AppointmentModalProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookingStep, setBookingStep] = useState<'info' | 'booking' | 'confirmed'>('info');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reasonForAppointment, setReasonForAppointment] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!therapist) return null;

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate && bookingStep === 'booking') {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, bookingStep]);

  const fetchAvailableSlots = async (date: string) => {
    try {
      setLoadingSlots(true);
      setTimeSlots([]);
      setSelectedTime(null);
      setBookingError('');

      const response = await apiClient.get<any>(
        `/appointments/slots/${therapist.id}?date=${date}&duration=60`
      );

      if (response.availableSlots && response.availableSlots.length > 0) {
        setTimeSlots(response.availableSlots);
      } else {
        setBookingError('No available slots for this date. Please select another date.');
      }
    } catch (error: any) {
      setBookingError(error.message || 'Failed to load available slots');
      console.error('Error fetching slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      setIsSubmitting(true);
      setBookingError('');

      // Parse the selected time and date
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      const response = await apiClient.post<any>('/appointments/book', {
        therapistId: therapist.id,
        scheduledAt: appointmentDateTime.toISOString(),
        duration: 60,
        reason: reasonForAppointment || undefined,
        notes: notes || undefined,
      });

      if (response.id) {
        setConfirmationNumber(`THR-${response.id.substring(0, 12).toUpperCase()}`);
        setBookingStep('confirmed');
        setSelectedTime(null);
        setReasonForAppointment('');
        setNotes('');

        // Notify parent component
        if (onBookingSuccess) {
          onBookingSuccess(response.id);
        }
      }
    } catch (error: any) {
      setBookingError(error.message || 'Failed to book appointment');
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar picker logic
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const days = [];
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = selected.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setShowCalendar(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/10 w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="relative h-40 bg-gradient-to-r from-teal-600 to-cyan-600 overflow-hidden flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <img
              src={therapist.image}
              alt={therapist.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">{therapist.name}</h2>
              <p className="text-teal-100">Book Your Appointment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
          >
            <span>✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {bookingStep === 'info' ? (
            <>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Ready to Book?</h3>
                <p className="text-gray-300 mb-6">
                  Secure your appointment with {therapist.name}. Sessions are 60 minutes long.
                </p>

                {/* Pricing Info */}
                <div className="bg-teal-600/20 border border-teal-500/30 rounded-xl p-4 mb-6">
                  <p className="text-white">
                    <span className="text-teal-300 font-semibold">Session Price:</span> ${therapist.price}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setBookingStep('booking')}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Proceed to Book
                </button>
              </div>
            </>
          ) : bookingStep === 'booking' ? (
            <>
              <h3 className="text-2xl font-bold text-white">Book Your Session</h3>

              {/* Error Message */}
              {bookingError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{bookingError}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-teal-300 font-semibold mb-3">Select Date</label>
                  {showCalendar ? (
                    <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                      <div className="flex justify-between items-center mb-6">
                        <button
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                          className="text-white hover:text-teal-400 transition-colors"
                        >
                          ←
                        </button>
                        <h3 className="text-white font-bold">
                          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                          className="text-white hover:text-teal-400 transition-colors"
                        >
                          →
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-center text-teal-400 text-xs font-bold">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-2 mb-6">
                        {days.map((day, idx) => (
                          <button
                            key={idx}
                            onClick={() => day && handleDateSelect(day)}
                            disabled={!day}
                            className={`aspect-square rounded-lg text-sm font-medium transition-all duration-200 ${
                              day
                                ? 'bg-teal-600/50 text-white hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-500/50 cursor-pointer'
                                : 'bg-transparent text-transparent'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setShowCalendar(false)}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCalendar(true)}
                      className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white hover:border-teal-500 hover:bg-white/15 transition-all duration-300 flex items-center gap-2"
                    >
                      <span>📅</span>
                      {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Choose a date'}
                    </button>
                  )}
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <label className="block text-teal-300 font-semibold mb-3">Select Time</label>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="animate-spin">
                          <div className="h-6 w-6 border-3 border-teal-500 border-t-transparent rounded-full"></div>
                        </div>
                        <span className="ml-2 text-white">Loading available slots...</span>
                      </div>
                    ) : timeSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTime(slot.startTime)}
                            className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                              selectedTime === slot.startTime
                                ? 'bg-teal-600 text-white border-teal-400 border-2'
                                : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {slot.startTime} - {slot.endTime}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm py-4">No available slots for this date</p>
                    )}
                  </div>
                )}

                {/* Reason for Appointment */}
                {selectedDate && selectedTime && (
                  <div>
                    <label className="block text-teal-300 font-semibold mb-3">Reason for Appointment</label>
                    <input
                      type="text"
                      value={reasonForAppointment}
                      onChange={(e) => setReasonForAppointment(e.target.value)}
                      placeholder="e.g., Anxiety management, Depression support..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:bg-white/15 transition-all duration-300"
                    />
                  </div>
                )}

                {/* Notes */}
                {selectedDate && selectedTime && (
                  <div>
                    <label className="block text-teal-300 font-semibold mb-3">Additional Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional information you'd like to share with the therapist..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:bg-white/15 transition-all duration-300 resize-none"
                    />
                  </div>
                )}

                {/* Booking Summary */}
                {selectedDate && selectedTime && (
                  <div className="bg-teal-600/20 border border-teal-500/30 rounded-xl p-4 space-y-2">
                    <p className="text-white">
                      <span className="text-teal-300 font-semibold">Therapist:</span> {therapist.name}
                    </p>
                    <p className="text-white">
                      <span className="text-teal-300 font-semibold">Date:</span> {new Date(selectedDate).toLocaleDateString()}
                    </p>
                    <p className="text-white">
                      <span className="text-teal-300 font-semibold">Time:</span> {selectedTime}
                    </p>
                    <p className="text-white">
                      <span className="text-teal-300 font-semibold">Duration:</span> 60 minutes
                    </p>
                    <p className="text-white">
                      <span className="text-teal-300 font-semibold">Price:</span> ${therapist.price}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setBookingStep('info');
                      setSelectedDate(null);
                      setSelectedTime(null);
                      setReasonForAppointment('');
                      setNotes('');
                      setBookingError('');
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleBookAppointment}
                    disabled={!selectedDate || !selectedTime || isSubmitting}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Booking...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Confirmation Screen */}
              <div className="text-center space-y-6 py-8">
                <div className="flex justify-center">
                  <div className="bg-green-500/20 border border-green-500/50 rounded-full p-6">
                    <span className="text-4xl">✅</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-300">Your session with {therapist.name} has been scheduled.</p>
                </div>
                <div className="bg-teal-600/20 border border-teal-500/30 rounded-xl p-4 space-y-2 text-left">
                  <p className="text-white">
                    <span className="text-teal-300 font-semibold">Confirmation #:</span> {confirmationNumber}
                  </p>
                  <p className="text-white">
                    <span className="text-teal-300 font-semibold">Date:</span> {selectedDate && new Date(selectedDate).toLocaleDateString()}
                  </p>
                  <p className="text-white">
                    <span className="text-teal-300 font-semibold">Time:</span> {selectedTime}
                  </p>
                  <p className="text-gray-400 text-sm mt-4">
                    A confirmation email has been sent to your registered email address. You'll receive a meeting link 24 hours before your session.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppointmentModal;
