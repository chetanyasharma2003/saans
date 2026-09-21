import React, { useState } from 'react';
import { Calendar, Clock, Video, MapPin, Phone, X } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapist: {
    id: string;
    name: string;
    hourlyRate: number;
    image?: string;
  } | null;
}

type SessionType = 'video' | 'inperson' | 'phone';

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, therapist }) => {
  const [step, setStep] = useState<'type' | 'date' | 'confirm'>('type');
  const [selectedType, setSelectedType] = useState<SessionType>('video');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  if (!isOpen || !therapist) return null;

  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  const sessionCosts = {
    video: therapist.hourlyRate,
    inperson: therapist.hourlyRate + 500, // Travel charges
    phone: therapist.hourlyRate - 200, // Discount
  };

  const getSessionIcon = (type: SessionType) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'inperson': return <MapPin className="w-5 h-5" />;
      case 'phone': return <Phone className="w-5 h-5" />;
    }
  };

  const getTodayDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  };

  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const handleConfirmBooking = () => {
    const bookingData = {
      therapistId: therapist.id,
      sessionType: selectedType,
      date: selectedDate,
      time: selectedTime,
      cost: sessionCosts[selectedType],
    };
    console.log('Booking:', bookingData);
    // TODO: Send to backend API
    alert('Booking confirmed! (Demo - not connected to backend yet)');
    setStep('type');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/10 w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Book Appointment</h2>
            <p className="text-teal-300 text-sm mt-1">
              {step === 'type' && 'Choose session type'}
              {step === 'date' && 'Select date & time'}
              {step === 'confirm' && 'Confirm booking'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 1: Session Type */}
          {step === 'type' && (
            <div className="space-y-4">
              <div className="bg-slate-700/30 p-4 rounded-xl mb-6">
                <p className="text-gray-300 text-sm mb-2">💡 <strong>Note:</strong> First session includes free consultation (30 min). Subsequent sessions are 60 min.</p>
              </div>

              <div className="space-y-3">
                {(['video', 'inperson', 'phone'] as SessionType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedType === type
                        ? 'border-teal-500 bg-teal-500/20'
                        : 'border-white/10 bg-slate-700/20 hover:border-teal-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-teal-400">{getSessionIcon(type)}</div>
                        <div>
                          <p className="text-white font-semibold capitalize">{type === 'inperson' ? 'In-Person' : type === 'phone' ? 'Phone' : 'Video Call'}</p>
                          <p className="text-gray-400 text-sm">
                            {type === 'video' && 'Secure video call from home'}
                            {type === 'inperson' && 'Visit clinic for face-to-face'}
                            {type === 'phone' && 'Call-based therapy session'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">₹{sessionCosts[type]}</p>
                        <p className="text-gray-400 text-xs">
                          {type === 'inperson' && '+₹500 travel'}
                          {type === 'phone' && '-₹200 discount'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep('date')}
                className="w-full mt-6 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-xl transition-all duration-300"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 'date' && (
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3">Select Date</label>
                <input
                  type="date"
                  min={getMinDate()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">Select Time</label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                        selectedTime === time
                          ? 'border-teal-500 bg-teal-500/20 text-white'
                          : 'border-white/10 bg-slate-700/20 text-gray-300 hover:border-teal-500/50'
                      }`}
                    >
                      <Clock className="w-4 h-4 inline mr-1" />
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('type')}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all text-teal-400 border border-teal-500/50 hover:bg-teal-500/10"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review Booking →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-6">
              {/* Booking Summary */}
              <div className="bg-slate-700/30 p-6 rounded-xl space-y-4 border border-white/10">
                <h3 className="text-white font-semibold text-lg">Booking Summary</h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Therapist</span>
                    <span className="text-white font-semibold">{therapist.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Session Type</span>
                    <span className="text-white font-semibold flex items-center gap-2">
                      {getSessionIcon(selectedType)}
                      {selectedType === 'inperson' ? 'In-Person' : selectedType === 'phone' ? 'Phone' : 'Video'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date</span>
                    <span className="text-white font-semibold">{new Date(selectedDate).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time</span>
                    <span className="text-white font-semibold">{selectedTime}</span>
                  </div>

                  <div className="border-t border-white/10 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Session Fee</span>
                      <span className="text-teal-400 font-bold text-lg">₹{sessionCosts[selectedType]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-sm">
                <p className="text-amber-200">
                  ⚠️ <strong>Cancellation Policy:</strong> Free cancellation up to 48 hours before the session. 50% refund for cancellations within 48 hours.
                </p>
              </div>

              {/* CTA */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('date')}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all text-teal-400 border border-teal-500/50 hover:bg-teal-500/10"
                >
                  ← Change
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white"
                >
                  ✓ Confirm & Pay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
