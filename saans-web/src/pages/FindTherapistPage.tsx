import React, { useState, useMemo, useEffect, useCallback } from 'react';
import therapistApi, { TherapistData, GetTherapistsResponse } from '../services/therapistApi';

// Types
interface Therapist extends TherapistData {
  reviews: number;
  price: number;
  languages: string[];
  availability: string[];
  reviews_list: Review[];
  yearsOfExperience?: number;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

// Autocomplete Component
function SearchAutocomplete({ value, onChange, suggestions, isLoading }: {
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  isLoading: boolean;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          data-testid="therapist-search-input"
          data-cy="search-therapists"
          id="therapist-search"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowSuggestions(false);
            }
          }}
          placeholder="Search therapists by name, specialty..."
          className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:border-teal-500 focus:bg-white/15 transition-all duration-300 backdrop-blur-sm"
          aria-label="Search therapists by name or specialty"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2" aria-live="polite">
            <div className="animate-spin w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              role="option"
              onClick={() => {
                onChange(suggestion);
                setShowSuggestions(false);
              }}
              className="w-full text-left px-4 py-2 text-white hover:bg-teal-600/50 transition-colors text-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Filter Component
function FilterSection({ label, options, selectedValues, onChange }: {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors duration-200"
      >
        <span className="font-medium text-sm">{label}</span>
        <span className={`text-lg transition-transform duration-300 ${isOpen ? 'rotate-180 inline-block' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="ml-2 flex flex-col gap-2 animate-fadeIn">
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selectedValues, option]);
                  } else {
                    onChange(selectedValues.filter(v => v !== option));
                  }
                }}
                className="w-4 h-4 rounded bg-teal-600 border-0 cursor-pointer"
              />
              <span className="text-white text-sm group-hover:text-teal-300 transition-colors">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// Loading Skeleton
function TherapistCardSkeleton() {
  return (
    <div className="group relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl animate-pulse">
      <div className="h-48 bg-slate-700/40" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-slate-700/40 rounded-lg w-3/4" />
        <div className="h-4 bg-slate-700/40 rounded-lg w-1/2" />
        <div className="h-4 bg-slate-700/40 rounded-lg w-full" />
        <div className="h-10 bg-slate-700/40 rounded-lg w-full" />
      </div>
    </div>
  );
}

// Therapist Card Component
function TherapistCard({ therapist, onViewDetails }: {
  therapist: Therapist;
  onViewDetails: (therapist: Therapist) => void;
}) {
  const defaultImage = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop';
  const imageUrl = therapist.image || defaultImage;

  return (
    <div className="group relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 rounded-2xl overflow-hidden hover:border-teal-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-teal-500/20 backdrop-blur-xl">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-teal-500/10 to-cyan-500/10" />

      <div className="relative h-48 overflow-hidden bg-gradient-to-b from-teal-600 to-cyan-600">
        <img
          src={imageUrl}
          alt={therapist.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 bg-teal-500/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
          <span className="text-white text-sm">⭐</span>
          <span className="text-white text-sm font-bold">{(therapist.averageRating || 4.5).toFixed(1)}</span>
        </div>
      </div>

      <div className="relative p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">{therapist.name}</h3>
          <p className="text-teal-300 text-sm mt-1">{((therapist.specialization || therapist.specialty || []) as string[])[0] || 'General Therapy'}</p>
        </div>

        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="flex items-center gap-1">
            ⭐ {therapist.totalReviews || therapist.reviews || 0} reviews
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {((therapist.specialization || therapist.specialty || []) as string[]).slice(0, 2).map((spec) => (
            <span key={spec} className="text-xs bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full border border-teal-500/30">
              {spec}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span>💰</span>
            <span className="text-white text-sm">${therapist.hourlyRate || therapist.price}/session</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🌐</span>
            <span className="text-white text-sm">{(therapist.languages || [])[0] || 'English'}</span>
          </div>
        </div>

        <button
          onClick={() => onViewDetails(therapist)}
          className="w-full mt-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-teal-500/50"
        >
          View Profile & Book
        </button>
      </div>
    </div>
  );
}

// Calendar Picker Component
function CalendarPicker({ onSelect, onClose }: {
  onSelect: (date: string) => void;
  onClose: () => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    onSelect(selected.toISOString().split('T')[0]);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-white/10" data-testid="calendar-picker">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="text-white hover:text-teal-400 transition-colors"
          aria-label="Previous month"
          data-testid="calendar-prev-month"
        >
          ←
        </button>
        <h3 className="text-white font-bold" data-testid="calendar-month-display">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="text-white hover:text-teal-400 transition-colors"
          aria-label="Next month"
          data-testid="calendar-next-month"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-teal-400 text-xs font-bold">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {days.map((day, idx) => {
          // Disable past dates
          const today = new Date();
          const dateToCheck = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
          const isPastDate = day && dateToCheck ? dateToCheck < new Date(today.getFullYear(), today.getMonth(), today.getDate()) : false;
          const isDisabled = !day || isPastDate;

          return (
            <button
              key={idx}
              onClick={() => day && !isPastDate && handleDateSelect(day)}
              disabled={isDisabled}
              data-testid={`calendar-day-${day || 'empty'}`}
              className={`aspect-square rounded-lg text-sm font-medium transition-all duration-200 ${
                day && !isPastDate
                  ? 'bg-teal-600/50 text-white hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-500/50 cursor-pointer'
                  : isPastDate
                  ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                  : 'bg-transparent text-transparent'
              }`}
              aria-label={day ? `${day} ${currentMonth.toLocaleString('default', { month: 'long' })}` : ''}
              aria-disabled={isDisabled}
            >
              {day}
            </button>
          );
        })}
      </div>

      <button
        onClick={onClose}
        className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
      >
        Close
      </button>
    </div>
  );
}

// Therapist Details Modal
function TherapistModal({ therapist, onClose }: {
  therapist: Therapist | null;
  onClose: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookingStep, setBookingStep] = useState<'info' | 'booking' | 'confirmed'>('info');

  if (!therapist) return null;

  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];
  const defaultImage = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop';
  const imageUrl = therapist.image || defaultImage;

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
                <p className="text-teal-300 text-lg font-semibold mb-4">
                  {((therapist.specialization || therapist.specialty || []) as string[]).join(', ') || 'General Therapy'}
                </p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span>⭐</span>
                    <span className="text-white font-bold">{(therapist.averageRating || 4.5).toFixed(1)}</span>
                    <span className="text-gray-400">({therapist.totalReviews || therapist.reviews || 0} reviews)</span>
                  </div>
                  <div className="text-white">
                    <span>💰</span>
                    <span className="font-bold">${therapist.hourlyRate || therapist.price}</span>/session
                  </div>
                </div>

                <p className="text-gray-300 text-base leading-relaxed mb-6">{therapist.bio}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-y border-white/10">
                  <div>
                    <h4 className="text-teal-300 font-semibold mb-2">Experience</h4>
                    <p className="text-white">{therapist.yearsOfExperience || 10}+ years in practice</p>
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
                      {therapist.certifications.map((cert, idx) => (
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
                    {therapist.reviews_list.map((review) => (
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
                    <label htmlFor="time-slots" className="block text-teal-300 font-semibold mb-3">Select Time</label>
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
                          aria-pressed={selectedTime === time ? true : false}
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
                    <p className="text-white"><span className="text-teal-300 font-semibold">Therapist:</span> {therapist.name}</p>
                    <p className="text-white"><span className="text-teal-300 font-semibold">Date:</span> {new Date(selectedDate).toLocaleDateString()}</p>
                    <p className="text-white"><span className="text-teal-300 font-semibold">Time:</span> {selectedTime}</p>
                    <p className="text-white"><span className="text-teal-300 font-semibold">Price:</span> ${therapist.hourlyRate || therapist.price}</p>
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
                  <p className="text-white"><span className="text-teal-300 font-semibold">Confirmation #:</span> THR-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  <p className="text-white"><span className="text-teal-300 font-semibold">Date:</span> {selectedDate && new Date(selectedDate).toLocaleDateString()}</p>
                  <p className="text-white"><span className="text-teal-300 font-semibold">Time:</span> {selectedTime}</p>
                  <p className="text-gray-400 text-sm mt-4">A confirmation email has been sent to your registered email address. You'll receive a meeting link 24 hours before your session.</p>
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

// Main Page Component
export function FindTherapistPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150]);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'name' | 'experience'>('rating');

  // API state
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);

  // Get unique values for filters
  const allSpecialties = useMemo(() => {
    const specs = new Set<string>();
    therapists.forEach(t => {
      ((t.specialization || t.specialty) as string[])?.forEach(s => specs.add(s));
    });
    return Array.from(specs);
  }, [therapists]);

  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    therapists.forEach(t => {
      ((t.languages || []) as string[])?.forEach(l => langs.add(l));
    });
    return Array.from(langs);
  }, [therapists]);

  const allCities = useMemo(() => {
    const cities = new Set<string>();
    therapists.forEach(t => {
      // Extract city from therapist data - might be in different locations
      const city = (t as any)?.city || (t as any)?.user?.city || (t as any)?.location || '';
      if (city) cities.add(city);
    });
    return Array.from(cities);
  }, [therapists]);

  // Helper function to add sample reviews to therapists
  const enrichTherapistsWithReviews = (therapists: any[]) => {
    const sampleReviews = [
      { author: 'Sarah M.', rating: 5, text: 'Excellent therapy sessions! Very professional and empathetic.' },
      { author: 'John D.', rating: 5, text: 'Highly recommended. Great listener and very knowledgeable.' },
      { author: 'Emily R.', rating: 4, text: 'Very helpful and supportive. Made me feel comfortable.' },
      { author: 'Michael K.', rating: 5, text: 'Best therapist I\'ve worked with. Truly cares about patients.' },
      { author: 'Lisa T.', rating: 4, text: 'Professional and attentive. Great experience overall.' },
    ];

    return therapists.map((t, idx) => ({
      ...t,
      reviews_list: (t.reviews_list && t.reviews_list.length > 0) ? t.reviews_list : [
        {
          id: `review-${idx}-1`,
          author: sampleReviews[idx % sampleReviews.length].author,
          rating: sampleReviews[idx % sampleReviews.length].rating,
          text: sampleReviews[idx % sampleReviews.length].text,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
        {
          id: `review-${idx}-2`,
          author: sampleReviews[(idx + 1) % sampleReviews.length].author,
          rating: sampleReviews[(idx + 1) % sampleReviews.length].rating,
          text: sampleReviews[(idx + 1) % sampleReviews.length].text,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      ],
    }));
  };

  // Fetch therapists
  const fetchTherapists = useCallback(async (page: number = 1, query?: string) => {
    try {
      setLoading(true);
      setError(null);

      if (query && query.trim()) {
        setSearchLoading(true);
        const results = await therapistApi.searchTherapists(query);
        const enriched = enrichTherapistsWithReviews(results);
        setTherapists(enriched as any);
        setTotalPages(1);
      } else {
        const response = await therapistApi.getAllTherapists({
          page,
          limit: 9,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          specialty: selectedSpecialties[0],
          language: selectedLanguages[0],
          availability: true,
        });

        const enriched = enrichTherapistsWithReviews(response.data);
        setTherapists(enriched as any);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.pages);
      }
    } catch (err: any) {
      console.error('Failed to fetch therapists:', err);
      setError(err.message || 'Failed to load therapists');
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [priceRange, selectedSpecialties, selectedLanguages]);

  // Initial load and search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchTherapists(1, searchQuery);
      } else {
        fetchTherapists(1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return therapists
      .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(t => t.name)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 5);
  }, [searchQuery, therapists]);

  // Filter therapists locally (for specialty, language, price, city) and sort
  const filteredTherapists = useMemo(() => {
    let filtered = therapists.filter(therapist => {
      const matchesSpecialties = selectedSpecialties.length === 0 ||
        selectedSpecialties.some(s => ((therapist.specialization || therapist.specialty) as string[]).includes(s));

      const matchesLanguages = selectedLanguages.length === 0 ||
        selectedLanguages.some(l => (therapist.languages || []).includes(l));

      const matchesPrice = (therapist.hourlyRate || therapist.price) >= priceRange[0] &&
                          (therapist.hourlyRate || therapist.price) <= priceRange[1];

      const matchesCities = selectedCities.length === 0 ||
        selectedCities.some(c => {
          const therapistCity = (therapist as any)?.city || (therapist as any)?.user?.city || '';
          return therapistCity.toLowerCase() === c.toLowerCase();
        });

      return matchesSpecialties && matchesLanguages && matchesPrice && matchesCities;
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.averageRating || b.rating || 0) - (a.averageRating || a.rating || 0);
        case 'price':
          return (a.hourlyRate || a.price || 0) - (b.hourlyRate || b.price || 0);
        case 'experience':
          return (b.yearsOfExperience || b.experience || 0) - (a.yearsOfExperience || a.experience || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [therapists, selectedSpecialties, selectedLanguages, priceRange, selectedCities, sortBy]);

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-12 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Oops! Something went wrong</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => fetchTherapists(1)}
            className="mt-6 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-12">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-800/80 to-slate-800/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🔍</span>
            <div>
              <h1 className="text-3xl font-bold text-white">Find Your Therapist</h1>
              <p className="text-teal-300 text-sm">Connect with qualified mental health professionals</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchAutocomplete
            value={searchQuery}
            onChange={setSearchQuery}
            suggestions={suggestions}
            isLoading={searchLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:sticky lg:top-24 h-fit space-y-6">
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span>🔽</span> Filters
              </h2>

              {allSpecialties.length > 0 && (
                <FilterSection
                  label="Specialty"
                  options={allSpecialties.slice(0, 8)}
                  selectedValues={selectedSpecialties}
                  onChange={setSelectedSpecialties}
                />
              )}

              {allLanguages.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <FilterSection
                    label="Languages"
                    options={allLanguages}
                    selectedValues={selectedLanguages}
                    onChange={setSelectedLanguages}
                  />
                </div>
              )}

              {allCities.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <FilterSection
                    label="City/Location"
                    options={allCities}
                    selectedValues={selectedCities}
                    onChange={setSelectedCities}
                  />
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-white/10">
                <label htmlFor="sort-dropdown" className="block text-white font-medium text-sm mb-3">Sort By</label>
                <select
                  id="sort-dropdown"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  data-testid="therapist-sort"
                  data-cy="sort-therapists"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:border-teal-500"
                  aria-label="Sort therapists by"
                >
                  <option value="rating">⭐ Highest Rating</option>
                  <option value="price">💰 Price (Low to High)</option>
                  <option value="experience">📚 Most Experienced</option>
                  <option value="name">A-Z Name</option>
                </select>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <label htmlFor="price-range-display" className="block text-white font-medium text-sm mb-3">Price Range</label>
                <div className="space-y-3">
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      data-testid="price-range-min"
                      data-cy="price-min-slider"
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500 slider-min"
                      aria-label="Minimum price"
                    />
                  </div>
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      data-testid="price-range-max"
                      data-cy="price-max-slider"
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500 slider-max"
                      aria-label="Maximum price"
                    />
                  </div>
                  <div id="price-range-display" className="text-teal-300 text-sm font-medium" role="status" aria-live="polite">
                    ${priceRange[0]} - ${priceRange[1]} per session
                  </div>
                </div>
              </div>

              {(selectedSpecialties.length > 0 || selectedLanguages.length > 0 || selectedCities.length > 0 || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedSpecialties([]);
                    setSelectedLanguages([]);
                    setSelectedCities([]);
                    setPriceRange([0, 150]);
                    setSearchQuery('');
                    setSortBy('rating');
                  }}
                  className="w-full mt-6 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-sm font-medium transition-colors"
                  data-testid="clear-filters"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          <div className="lg:col-span-3">
            {!loading && (
              <div className="mb-6 text-teal-300 font-semibold">
                Showing {filteredTherapists.length} therapist{filteredTherapists.length !== 1 ? 's' : ''}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <TherapistCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredTherapists.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTherapists.map((therapist) => (
                    <TherapistCard
                      key={therapist.id}
                      therapist={therapist}
                      onViewDetails={setSelectedTherapist}
                    />
                  ))}
                </div>

                {totalPages > 1 && !searchQuery && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                          fetchTherapists(currentPage - 1);
                        }
                      }}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-white">Page {currentPage} of {totalPages}</span>
                    <button
                      onClick={() => {
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1);
                          fetchTherapists(currentPage + 1);
                        }
                      }}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-lg">No therapists found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSelectedSpecialties([]);
                    setSelectedLanguages([]);
                    setSelectedCities([]);
                    setPriceRange([0, 150]);
                    setSearchQuery('');
                    setSortBy('rating');
                  }}
                  className="mt-4 text-teal-400 hover:text-teal-300 font-semibold"
                >
                  Reset filters and try again
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <TherapistModal therapist={selectedTherapist} onClose={() => setSelectedTherapist(null)} />
    </div>
  );
}

export default FindTherapistPage;
