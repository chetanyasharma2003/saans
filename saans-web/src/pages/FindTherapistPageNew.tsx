import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Filter, ChevronRight, Heart, MessageSquare, Clock, Award, Loader, AlertCircle, CheckCircle, Video, Phone, Calendar, TrendingUp, Users, Zap, BadgeCheck } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function FindTherapistPageNew() {
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState([]);
  const [filteredTherapists, setFilteredTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    specialty: null,
    language: null,
    maxPrice: null,
    minRating: null,
    radius: 50
  });

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    sessionType: 'video'
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  const specialties = [
    'Anxiety & Stress',
    'Depression',
    'Relationships',
    'PTSD & Trauma',
    'Grief & Loss',
    'Addiction'
  ];

  const languages = ['English', 'Hindi', 'Spanish', 'Mandarin', 'French', 'German'];

  // Get user location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          fetchNearbyTherapists(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log('Location access denied, using default location');
          // Default to Jaipur
          const defaultLoc = { lat: 26.9124, lon: 75.8058 };
          setUserLocation(defaultLoc);
          fetchNearbyTherapists(defaultLoc.lat, defaultLoc.lon);
        }
      );
    }
  };

  const fetchNearbyTherapists = async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/api/therapists/nearby`, {
        params: {
          lat,
          lon,
          radius: selectedFilters.radius,
          specialty: selectedFilters.specialty,
          language: selectedFilters.language,
          maxPrice: selectedFilters.maxPrice,
          minRating: selectedFilters.minRating
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setTherapists(response.data.data || []);
      applyLocalFilters(response.data.data || []);
    } catch (error) {
      console.error('Error fetching therapists:', error);
      setError('Failed to load therapists. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyLocalFilters = (therapistList) => {
    let filtered = therapistList || [];

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          (t?.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t?.specialties || []).some((s) => (s || '').toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredTherapists(filtered);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value
    });
  };

  const handleApplyFilters = () => {
    if (userLocation) {
      fetchNearbyTherapists(userLocation.lat, userLocation.lon);
    }
  };

  const handleOpenBooking = (therapist) => {
    setSelectedTherapist(therapist);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingForm.date || !bookingForm.time) {
      alert('Please select date and time');
      return;
    }

    try {
      setBookingLoading(true);
      const token = localStorage.getItem('accessToken');

      // Combine date and time
      const scheduledAt = new Date(`${bookingForm.date}T${bookingForm.time}`);

      const appointmentData = {
        therapistId: selectedTherapist._id,
        scheduledAt: scheduledAt.toISOString(),
        type: bookingForm.sessionType,
        sessionDuration: 60,
        appointmentType: 'first-session'
      };

      const response = await axios.post(
        `${API_URL}/api/appointments`,
        appointmentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Appointment booked successfully!');
      setShowBookingModal(false);
      setBookingForm({ date: '', time: '', sessionType: 'video' });

      // Redirect to sessions page
      setTimeout(() => navigate('/appointments'), 1000);
    } catch (err) {
      console.error('Booking error:', err);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `₹${price}/session`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideInUp { animation: slideInUp 0.6s ease-out forwards; }
      `}</style>

      <div className="relative z-10">
        {/* Header */}
        <DashboardHeader title="Find Therapist" showBackButton={false} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Header Section */}
          <section className="animate-slideInUp">
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-white mb-3">Find Your Perfect Therapist</h1>
              <p className="text-xl text-purple-200 max-w-2xl">Connect with certified mental health professionals tailored to your needs. 2,500+ verified therapists available.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { icon: '👥', label: 'Verified Therapists', value: '2,500+' },
                { icon: '⭐', label: 'Avg. Rating', value: '4.8/5' },
                { icon: '😊', label: 'Client Satisfaction', value: '98%' },
                { icon: '🎯', label: 'Sessions Completed', value: '50k+' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl p-6">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-white font-bold text-2xl">{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Error Alert */}
          {error && (
            <div className="animate-slideInUp bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Search & Filter Section */}
          <section className="animate-slideInUp">
            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-3xl p-10 backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                <Search className="w-6 h-6 text-purple-400" />
                Advanced Search & Filters
              </h2>

              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-purple-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search by name or specialty..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Specialty Filter */}
                <select
                  value={selectedFilters.specialty || ''}
                  onChange={(e) => handleFilterChange('specialty', e.target.value || null)}
                  className="px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="">All Specialties</option>
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>

                {/* Language Filter */}
                <select
                  value={selectedFilters.language || ''}
                  onChange={(e) => handleFilterChange('language', e.target.value || null)}
                  className="px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="">All Languages</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>

                {/* Max Price Filter */}
                <select
                  value={selectedFilters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : null)}
                  className="px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="">Any Price</option>
                  <option value="500">Up to ₹500</option>
                  <option value="1000">Up to ₹1000</option>
                  <option value="1500">Up to ₹1500</option>
                </select>

                {/* Rating Filter */}
                <select
                  value={selectedFilters.minRating || ''}
                  onChange={(e) => handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : null)}
                  className="px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.7">4.7+ Stars</option>
                  <option value="4.9">4.9+ Stars</option>
                </select>

                {/* Apply Button */}
                <button
                  onClick={handleApplyFilters}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
                >
                  <Filter className="w-5 h-5 inline mr-2" />
                  Apply
                </button>
              </div>
            </div>
          </section>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          )}

          {/* Results Section */}
          {!loading && filteredTherapists.length > 0 && (
            <section className="animate-slideInUp">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">
                  Available Therapists <span className="text-purple-400">({filteredTherapists.length})</span>
                </h2>
                <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-semibold">High Demand</span>
                </div>
              </div>

              {/* Professional Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTherapists.map((therapist) => (
                  <div
                    key={therapist._id}
                    className="group relative bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-3xl hover:border-purple-500/60 transition-all hover:shadow-2xl hover:shadow-purple-500/20 backdrop-blur-xl overflow-hidden"
                  >
                    {/* Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-500/20 border border-green-500/30 px-3 py-1.5 rounded-full">
                      <BadgeCheck className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-semibold text-green-300">Verified</span>
                    </div>

                    <div className="p-8">
                      {/* Profile Header */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                          {(therapist?.firstName?.[0] || 'T').toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">Dr. {therapist?.firstName} {therapist?.lastName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-yellow-400 font-semibold">{therapist?.rating || 4.8}</span>
                            <span className="text-gray-400 text-sm">({Math.floor(Math.random() * 100) + 50} reviews)</span>
                          </div>
                        </div>
                      </div>

                      {/* Specialties */}
                      {(therapist?.specialties?.length || 0) > 0 && (
                        <div className="mb-6">
                          <p className="text-xs text-gray-400 mb-2 font-semibold">SPECIALTIES</p>
                          <div className="flex flex-wrap gap-2">
                            {(therapist?.specialties || []).slice(0, 2).map((spec) => (
                              <span key={spec} className="px-3 py-1 bg-purple-600/30 text-purple-200 text-xs rounded-full font-medium">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bio */}
                      <p className="text-gray-300 text-sm mb-6 leading-relaxed line-clamp-2">{therapist?.bio || 'Professional therapist dedicated to your mental wellness'}</p>

                      {/* Quick Info Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-purple-500/20">
                        <div className="bg-slate-800/30 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-1">Experience</p>
                          <p className="text-white font-bold">{therapist?.experience || 5}+ yrs</p>
                        </div>
                        <div className="bg-slate-800/30 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-1">Rate</p>
                          <p className="text-white font-bold">₹{therapist?.hourlyRate || 500}/hr</p>
                        </div>
                      </div>

                      {/* Location & Availability */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <MapPin className="w-4 h-4 text-purple-400" />
                          <span>{therapist?.location?.city || 'Online'} {therapist?.distanceKm ? `(${therapist.distanceKm} km)` : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <Calendar className="w-4 h-4 text-green-400" />
                          <span>Available Today</span>
                        </div>
                      </div>

                      {/* Session Types */}
                      <div className="flex gap-3 mb-6">
                        <div className="flex-1 flex items-center justify-center gap-2 bg-slate-800/30 py-2 rounded-lg border border-slate-700">
                          <Video className="w-4 h-4 text-purple-400" />
                          <span className="text-xs text-gray-300">Video</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center gap-2 bg-slate-800/30 py-2 rounded-lg border border-slate-700">
                          <Phone className="w-4 h-4 text-blue-400" />
                          <span className="text-xs text-gray-300">Call</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleOpenBooking(therapist)}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 text-sm"
                        >
                          Book Now
                        </button>
                        <button className="p-3 rounded-lg hover:bg-purple-600/20 transition border border-purple-500/30">
                          <Heart className="w-5 h-5 text-purple-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {!loading && filteredTherapists.length === 0 && therapists.length === 0 && (
            <section className="animate-slideInUp">
              <div className="bg-gradient-to-r from-purple-600/40 to-blue-600/40 border border-purple-500/30 rounded-3xl p-10 backdrop-blur-xl text-center">
                <h2 className="text-2xl font-bold text-white mb-2">No Therapists Found</h2>
                <p className="text-purple-200 mb-6">Try adjusting your filters or allow location access for better results.</p>
                <button
                  onClick={getUserLocation}
                  className="px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  Try Again
                </button>
              </div>
            </section>
          )}

          {/* No Results After Filter */}
          {!loading && filteredTherapists.length === 0 && therapists.length > 0 && (
            <section className="animate-slideInUp">
              <div className="bg-gradient-to-r from-purple-600/40 to-blue-600/40 border border-purple-500/30 rounded-3xl p-10 backdrop-blur-xl text-center">
                <h2 className="text-2xl font-bold text-white mb-2">No Match Found</h2>
                <p className="text-purple-200 mb-6">Try adjusting your filters to find more therapists.</p>
                <button
                  onClick={() => {
                    setSelectedFilters({
                      specialty: null,
                      language: null,
                      maxPrice: null,
                      minRating: null,
                      radius: 50
                    });
                    setSearchQuery('');
                    setFilteredTherapists(therapists);
                  }}
                  className="px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  Reset Filters
                </button>
              </div>
            </section>
          )}
        </main>

        {/* BOOKING MODAL */}
        {showBookingModal && selectedTherapist && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900 to-slate-900 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-2">Book Appointment</h3>
              <p className="text-purple-300 mb-6">With Dr. {selectedTherapist?.firstName || 'Unknown'} {selectedTherapist?.lastName || ''}</p>

              {/* Therapist Info */}
              <div className="bg-purple-900/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-300 mb-2">{selectedTherapist?.bio || 'Experienced therapist'}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-yellow-400">⭐ {selectedTherapist?.rating || 4.5}</span>
                  <span className="text-green-400">₹{selectedTherapist?.hourlyRate || 800}/session</span>
                </div>
              </div>

              {/* Booking Form */}
              <div className="space-y-4">
                {/* Date Picker */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Select Date</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                  />
                </div>

                {/* Time Picker */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Select Time</label>
                  <input
                    type="time"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                  />
                </div>

                {/* Session Type */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Session Type</label>
                  <select
                    value={bookingForm.sessionType}
                    onChange={(e) => setBookingForm({ ...bookingForm, sessionType: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                  >
                    <option value="video">📹 Video Call</option>
                    <option value="audio">☎️ Audio Call</option>
                    <option value="chat">💬 Chat</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingForm({ date: '', time: '', sessionType: 'video' });
                  }}
                  disabled={bookingLoading}
                  className="flex-1 px-4 py-3 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center pt-4">
                ✨ You'll see your appointment in the Sessions page after booking
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FindTherapistPageNew;
