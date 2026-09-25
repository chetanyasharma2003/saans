import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Filter, ChevronRight, Heart, MessageSquare, Clock, Award, Loader, AlertCircle } from 'lucide-react';
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
    let filtered = therapistList;

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const handleViewProfile = (therapistId) => {
    navigate(`/therapist/${therapistId}`);
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
              <h2 className="text-2xl font-bold text-white mb-8">Find Your Perfect Therapist</h2>

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

          {/* Therapists List */}
          {!loading && filteredTherapists.length > 0 && (
            <section className="animate-slideInUp">
              <h2 className="text-2xl font-bold text-white mb-6">
                Available Therapists ({filteredTherapists.length})
              </h2>

              <div className="space-y-4">
                {filteredTherapists.map((therapist) => (
                  <div
                    key={therapist._id}
                    className="group p-6 bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20 backdrop-blur-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Name & Location */}
                        <div className="mb-3">
                          <h3 className="text-xl font-bold text-white">
                            Dr. {therapist.firstName} {therapist.lastName}
                          </h3>
                          <div className="flex items-center gap-2 text-purple-300 text-sm mt-1">
                            <MapPin className="w-4 h-4" />
                            {therapist.location.city}, {therapist.location.state}
                            {therapist.distanceKm && (
                              <span className="ml-2">({therapist.distanceKm} km away)</span>
                            )}
                          </div>
                        </div>

                        {/* Bio */}
                        <p className="text-gray-300 text-sm mb-3">{therapist.bio}</p>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {therapist.specialties.slice(0, 3).map((spec) => (
                            <span
                              key={spec}
                              className="px-3 py-1 bg-purple-600/30 text-purple-200 text-xs rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                          {therapist.specialties.length > 3 && (
                            <span className="px-3 py-1 bg-purple-600/30 text-purple-200 text-xs rounded-full">
                              +{therapist.specialties.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Info Row */}
                        <div className="flex flex-wrap gap-6 text-sm">
                          {/* Rating */}
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-white font-semibold">{therapist.ratings.average}</span>
                            <span className="text-gray-400">({therapist.ratings.count} reviews)</span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-green-400" />
                            <span className="text-white font-semibold">{formatPrice(therapist.pricing.perSession)}</span>
                          </div>

                          {/* Experience */}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="text-white font-semibold">{therapist.experience}+ yrs</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 ml-4 justify-between">
                        <button className="p-2 rounded-lg hover:bg-purple-600/20 transition text-purple-300 hover:text-purple-200">
                          <Heart className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate('/appointments')}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105 active:scale-95 text-sm whitespace-nowrap"
                        >
                          Book Now →
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
      </div>
    </div>
  );
}

export default FindTherapistPageNew;
