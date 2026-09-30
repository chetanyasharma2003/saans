import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Heart, MessageSquare, Clock, Video, Phone, Calendar, BadgeCheck, Loader, AlertCircle, TrendingUp, Filter, Zap, Award } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import { BookingModal } from '../components/Therapist/BookingModal';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function FindTherapistPagePro() {
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState([]);
  const [filteredTherapists, setFilteredTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('rating');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    specialty: null,
    language: null,
    maxPrice: null,
    minRating: null
  });

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null);

  const handleOpenBooking = (therapist: any) => {
    setSelectedTherapist(therapist);
    setShowBookingModal(true);
  };

  const handleCloseBooking = () => {
    setShowBookingModal(false);
    setSelectedTherapist(null);
  };

  const specialties = ['Anxiety', 'Depression', 'PTSD', 'OCD', 'Relationships', 'Trauma', 'CBT', 'Addiction'];
  const languages = ['English', 'Spanish', 'Mandarin', 'Hindi', 'German', 'Portuguese'];
  const priceRanges = [
    { label: 'Any Price', value: null },
    { label: 'Up to ₹1,200', value: 1200 },
    { label: '₹1,200 - ₹1,500', value: 1500 },
    { label: '₹1,500+', value: 2000 }
  ];

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/api/therapists`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const therapistsData = response.data.data || [];
      setTherapists(therapistsData);
      applyFiltersAndSort(therapistsData);
    } catch (error) {
      console.error('Error fetching therapists:', error);
      setError('Failed to load therapists');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = (list) => {
    let filtered = [...list];

    if (searchQuery) {
      filtered = filtered.filter(t =>
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.specializations || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedFilters.specialty) {
      filtered = filtered.filter(t =>
        (t.specializations || []).includes(selectedFilters.specialty)
      );
    }

    if (selectedFilters.language) {
      filtered = filtered.filter(t =>
        (t.languages || []).includes(selectedFilters.language)
      );
    }

    if (selectedFilters.maxPrice) {
      filtered = filtered.filter(t => parseFloat(t.hourlyRate) <= selectedFilters.maxPrice);
    }

    if (selectedFilters.minRating) {
      filtered = filtered.filter(t => parseFloat(t.rating) >= selectedFilters.minRating);
    }

    // Sort
    if (sortBy === 'rating') {
      filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => parseFloat(a.hourlyRate) - parseFloat(b.hourlyRate));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => parseFloat(b.hourlyRate) - parseFloat(a.hourlyRate));
    } else if (sortBy === 'experience') {
      filtered.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
    }

    setFilteredTherapists(filtered);
  };

  const handleSort = (value) => {
    setSortBy(value);
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  useEffect(() => {
    applyFiltersAndSort(therapists);
  }, [searchQuery, selectedFilters, sortBy, therapists]);

  const getInitial = (firstName) => (firstName || 'T')[0].toUpperCase();

  const getSpecialtyColor = (specialty) => {
    const colors = {
      'Anxiety': 'bg-blue-500/20 text-blue-300',
      'Depression': 'bg-purple-500/20 text-purple-300',
      'PTSD': 'bg-red-500/20 text-red-300',
      'OCD': 'bg-orange-500/20 text-orange-300',
      'Relationships': 'bg-pink-500/20 text-pink-300',
      'Trauma': 'bg-red-500/20 text-red-300',
      'CBT': 'bg-green-500/20 text-green-300',
      'Addiction': 'bg-yellow-500/20 text-yellow-300'
    };
    return colors[specialty] || 'bg-slate-500/20 text-slate-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        <DashboardHeader title="Therapist Marketplace" showBackButton={false} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="mb-12 bg-gradient-to-br from-purple-600/30 to-pink-600/20 border border-purple-400/30 rounded-3xl p-8 md:p-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-4">
              Find Your Perfect Therapist
            </h1>
            <p className="text-lg text-purple-200 mb-8">
              Connect with 2,500+ verified mental health professionals tailored to your needs
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-300">2,500+</div>
                <div className="text-xs text-gray-400 mt-1">Verified Therapists</div>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-300">4.8/5</div>
                <div className="text-xs text-gray-400 mt-1">Avg Rating</div>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-300">98%</div>
                <div className="text-xs text-gray-400 mt-1">Satisfaction</div>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-300">50k+</div>
                <div className="text-xs text-gray-400 mt-1">Sessions</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-8 bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Search & Filters */}
          <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/40 border border-purple-400/30 rounded-2xl backdrop-blur-xl p-8 mb-12">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 text-white placeholder-gray-400 rounded-lg pl-12 pr-4 py-3 focus:border-purple-400/50 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Specialty */}
              <select
                value={selectedFilters.specialty || ''}
                onChange={(e) => handleFilterChange('specialty', e.target.value || null)}
                className="bg-slate-800/50 border border-slate-700/50 text-white rounded-lg px-4 py-2 focus:border-purple-400/50 focus:outline-none"
              >
                <option value="">All Specialties</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Language */}
              <select
                value={selectedFilters.language || ''}
                onChange={(e) => handleFilterChange('language', e.target.value || null)}
                className="bg-slate-800/50 border border-slate-700/50 text-white rounded-lg px-4 py-2 focus:border-purple-400/50 focus:outline-none"
              >
                <option value="">All Languages</option>
                {languages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>

              {/* Price */}
              <select
                value={selectedFilters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : null)}
                className="bg-slate-800/50 border border-slate-700/50 text-white rounded-lg px-4 py-2 focus:border-purple-400/50 focus:outline-none"
              >
                {priceRanges.map(r => <option key={r.label} value={r.value || ''}>{r.label}</option>)}
              </select>

              {/* Rating */}
              <select
                value={selectedFilters.minRating || ''}
                onChange={(e) => handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : null)}
                className="bg-slate-800/50 border border-slate-700/50 text-white rounded-lg px-4 py-2 focus:border-purple-400/50 focus:outline-none"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg px-4 py-2 font-medium focus:outline-none"
              >
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="experience">Most Experienced</option>
              </select>
            </div>
          </div>

          {/* Therapists Grid */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">
                Available Therapists <span className="text-purple-400">({filteredTherapists.length})</span>
              </h2>
              {filteredTherapists.length > 0 && (
                <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                  🔥 High Demand
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : filteredTherapists.length === 0 ? (
              <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/40 border border-purple-400/30 rounded-2xl p-12 text-center">
                <AlertCircle className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No therapists found matching your criteria</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTherapists.map((therapist) => (
                  <div
                    key={therapist.id}
                    className="group bg-gradient-to-br from-purple-900/50 to-slate-900/40 border border-purple-400/30 rounded-2xl overflow-hidden hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-2 flex flex-col"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6 border-b border-purple-400/20">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl">
                            {getInitial(therapist.firstName)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold text-white">
                                Dr. {therapist.firstName} {therapist.lastName}
                              </h3>
                              <BadgeCheck className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="font-semibold text-white">{therapist.rating}</span>
                              <span className="text-xs text-gray-400">({therapist.totalRatings} reviews)</span>
                            </div>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-all">
                          <Heart className="w-6 h-6 text-gray-400 hover:text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1">
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{therapist.bio}</p>

                      {/* Specializations */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {(therapist.specializations || []).slice(0, 3).map((spec) => (
                            <span
                              key={spec}
                              className={`text-xs px-3 py-1 rounded-full font-medium ${getSpecialtyColor(spec)}`}
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-800/30 rounded-lg p-3">
                          <div className="text-xs text-gray-400">Experience</div>
                          <div className="font-semibold text-white">{therapist.yearsOfExperience}+ yrs</div>
                        </div>
                        <div className="bg-slate-800/30 rounded-lg p-3">
                          <div className="text-xs text-gray-400">Rate</div>
                          <div className="font-semibold text-white">₹{therapist.hourlyRate}/hr</div>
                        </div>
                        <div className="bg-slate-800/30 rounded-lg p-3">
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Response
                          </div>
                          <div className="font-semibold text-white text-xs">{therapist.responseTime}</div>
                        </div>
                        <div className="bg-slate-800/30 rounded-lg p-3">
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Award className="w-3 h-3" /> Sessions
                          </div>
                          <div className="font-semibold text-white">{therapist.sessionsCompleted}</div>
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="mb-4">
                        <div className="text-xs text-gray-400 mb-2">Languages</div>
                        <div className="flex flex-wrap gap-2">
                          {(therapist.languages || []).slice(0, 3).map((lang) => (
                            <span key={lang} className="text-xs bg-slate-800/50 text-gray-300 px-2 py-1 rounded">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="flex items-center gap-2 text-sm text-green-400 mb-4">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Available Today
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="border-t border-purple-400/20 p-6 bg-slate-900/30">
                      <button
                        onClick={() => handleOpenBooking(therapist)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        therapist={selectedTherapist}
        onClose={handleCloseBooking}
        onSuccess={() => {
          handleCloseBooking();
          // Optional: redirect to appointments or show confirmation
          setTimeout(() => window.location.href = '/appointments', 500);
        }}
      />
    </div>
  );
}

export default FindTherapistPagePro;
