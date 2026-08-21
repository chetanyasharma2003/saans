import React, { useState } from 'react';
import CalendarPicker from './CalendarPicker';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface TherapistData {
  id: string;
  name: string;
  bio?: string;
  specialization?: string[];
  specialty?: string[];
  averageRating?: number;
  rating?: number;
  totalReviews?: number;
  reviews?: number;
  hourlyRate?: number;
  price?: number;
  languages?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  experience?: number;
  image?: string;
  reviews_list?: Review[];
}

interface TherapistDetailProps {
  therapist: TherapistData | null;
  onClose: () => void;
}

export const TherapistDetail: React.FC<TherapistDetailProps> = ({ therapist, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookingStep, setBookingStep] = useState<'info' | 'booking' | 'confirmed'>('info');

  if (!therapist) return null;

  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];
  const defaultImage = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop';
  const imageUrl = therapist.image || defaultImage;
  const specs = (therapist.specialization || therapist.specialty || []) as string[];
  const displayRating = therapist.averageRating || therapist.rating || 4.5;
  const displayReviews = therapist.totalReviews || therapist.reviews || 0;
  const displayRate = therapist.hourlyRate || therapist.price || 0;
  const displayExperience = therapist.yearsOfExperience || therapist.experience || 10;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/10 w-full max-w-2xl shadow-2xl">
        <div className="relative h-64 bg-gradient-to-r from-teal-600 to-cyan-600 overflow-hidden">
          <img src={imageUrl} alt={therapist.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
          >
            <span>✕</span>
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[calc(100vh-20rem)] overflow-y-auto">
          {bookingStep === 'info' ? (
            <>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{therapist.name}</h2>
                <p className="text-teal-300 text-lg font-semibold mb-4">{specs.join(', ') || 'General Therapy'}</p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span>⭐</span>
                    <span className="text-white font-bold">{displayRating.toFixed(1)}</span>
                    <span className="text-gray-400">({displayReviews} reviews)</span>
                  </div>
                  <div className="text-white">
                    <span>💰</span>
                    <span className="font-bold">${displayRate}</span>/session
                  </div>
                </div>

                <p className="text-gray-300 text-base leading-relaxed mb-6">{therapist.bio}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-y border-white/10">
                  <div>
                    <h4 className="text-teal-300 font-semibold mb-2">Experience</h4>
                    <p className="text-white">{displayExperience}+ years in practice</p>
                  </div>
                  <div>
                    <h4 className="text-teal-300 font-semibold mb-2">Languages</h4>
                    <p className="text-white">{(therapist.languages || []).join(', ') || 'English'}</p>
                  </div>
                </div>

                {(therapist.certifications || []).length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-teal-300 font-semibold mb-3">Certifications</h4>
                    <div className="space-y-2">
                      {therapist.certifications!.map((cert, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-white">
                          <span>✅</span>
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {(therapist.reviews_list || []).length > 0 && (
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-xl font-bold text-white mb-4">Client Reviews</h3>
                  <div className="space-y-4">
                    {therapist.reviews_list!.map((review) => (
                      <div key={review.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-white font-semibold">{review.author}</span>
                          <div className="flex gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <span key={i}>⭐</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">{review.text}</p>
                        <p className="text-gray-500 text-xs mt-2">{review.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setBookingStep('booking')}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Book a Session
              </button>
            </>
          ) : bookingStep === 'booking' ? (
            <>
              <h3 className="text-2xl font-bold text-white">Book Your Session</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-teal-300 font-semibold mb-3">Select Date</label>
                  {showCalendar ? (
                    <CalendarPicker
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setShowCalendar(false);
                      }}
                      onClose={() => setShowCalendar(false)}
                    />
                  ) : (
                    <button
                      onClick={() => setShowCalendar(true)}
                      className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white hover:border-teal-500 hover:bg-white/15 transition-all duration-300 flex items-center gap-2"
                    >
                      <span>📅</span>
                      {selectedDate || 'Choose a date'}
                    </button>
                  )}
                </div>

                {selectedDate && (
                  <div>
                    <label htmlFor="time-slots" className="block text-teal-300 font-semibold mb-3">
                      Select Time
                    </label>
                    <div id="time-slots" className="grid grid-cols-2 gap-3" role="group" aria-label="Available time slots">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          data-testid={`time-slot-${time.replace(/[:\s]/g, '-')}`}
                          data-cy={`book-time-${time}`}
                          className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                            selectedTime === time
                              ? 'bg-teal-600 text-white border-teal-400 border-2'
                              : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                          }`}
                          aria-pressed={selectedTime === time}
                          aria-label={`Select ${time}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                      <span className="text-teal-300 font-semibold">Price:</span> ${displayRate}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setBookingStep('info')}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (selectedDate && selectedTime) {
                        setBookingStep('confirmed');
                      }
                    }}
                    disabled={!selectedDate || !selectedTime}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-300"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
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
                    <span className="text-teal-300 font-semibold">Confirmation #:</span> THR-
                    {Math.random().toString(36).substr(2, 9).toUpperCase()}
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
};

export default TherapistDetail;
