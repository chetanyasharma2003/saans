import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Filter, ChevronRight, Heart, MessageSquare, Clock, Award } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';

export function FindTherapistPageNew() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    specialty: null,
    language: null,
    rating: null,
  });

  const therapists = [
    {
      id: 1,
      name: 'Dr. Priya Singh',
      specialty: 'Anxiety & Stress',
      rating: 4.9,
      reviews: 128,
      price: '₹500/session',
      image: '👩‍⚕️',
      bio: 'Specializes in anxiety management and stress relief with 8+ years experience',
      languages: ['English', 'Hindi'],
      availability: 'Available Today',
    },
    {
      id: 2,
      name: 'Dr. Rajesh Patel',
      specialty: 'Depression',
      rating: 4.8,
      reviews: 95,
      price: '₹450/session',
      image: '👨‍⚕️',
      bio: 'Expert in depression and mood disorders with compassionate approach',
      languages: ['English', 'Gujarati'],
      availability: 'Available Tomorrow',
    },
    {
      id: 3,
      name: 'Dr. Meera Kapoor',
      specialty: 'Relationships',
      rating: 5.0,
      reviews: 156,
      price: '₹600/session',
      image: '👩‍⚕️',
      bio: 'Relationship counselor helping couples and individuals build healthy connections',
      languages: ['English', 'Hindi', 'Punjabi'],
      availability: 'Available Today',
    },
    {
      id: 4,
      name: 'Dr. Amit Sharma',
      specialty: 'PTSD & Trauma',
      rating: 4.7,
      reviews: 82,
      price: '₹550/session',
      image: '👨‍⚕️',
      bio: 'Trauma-informed therapist specializing in PTSD and recovery',
      languages: ['English', 'Hindi'],
      availability: 'Available in 2 days',
    },
  ];

  const specialties = ['Anxiety & Stress', 'Depression', 'Relationships', 'PTSD & Trauma', 'Grief & Loss', 'Addiction'];
  const languages = ['English', 'Hindi', 'Spanish', 'Mandarin', 'French', 'German'];

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
          {/* Search & Filter Section */}
          <section className="animate-slideInUp">
            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-xl">
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-4 w-6 h-6 text-purple-400" />
                  <input
                    type="text"
                    placeholder="Search by name or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    By Specialty
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((spec) => (
                      <button
                        key={spec}
                        onClick={() => setSelectedFilters({ ...selectedFilters, specialty: spec })}
                        className={`px-4 py-2 rounded-full transition-all ${
                          selectedFilters.specialty === spec
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800/50 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-purple-300 font-semibold mb-3">By Language</h3>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedFilters({ ...selectedFilters, language: lang })}
                        className={`px-4 py-2 rounded-full transition-all ${
                          selectedFilters.language === lang
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800/50 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Therapists Grid */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-8">{therapists.length} Verified Therapists</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {therapists.map((therapist, idx) => (
                <div
                  key={therapist.id}
                  className="animate-slideInUp bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-3xl p-8 hover:border-purple-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 backdrop-blur-xl group"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 text-4xl rounded-full bg-purple-600/20 border-2 border-purple-500/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {therapist.image}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{therapist.name}</h3>
                        <p className="text-purple-300 text-sm">{therapist.specialty}</p>
                      </div>
                    </div>
                    <button className="text-red-400 hover:text-red-300 transition">
                      <Heart className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-gray-300 text-sm ml-2">({therapist.reviews} reviews)</span>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-300 text-sm mb-6">{therapist.bio}</p>

                  {/* Info Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3">
                      <div className="text-purple-300 text-xs font-semibold mb-1">Price</div>
                      <div className="text-white font-bold">{therapist.price}</div>
                    </div>
                    <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3">
                      <div className="text-purple-300 text-xs font-semibold mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Availability
                      </div>
                      <div className="text-white font-bold text-sm">{therapist.availability}</div>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="mb-6">
                    <div className="text-purple-300 text-xs font-semibold mb-2">Languages</div>
                    <div className="flex flex-wrap gap-2">
                      {therapist.languages.map((lang) => (
                        <span key={lang} className="px-2 py-1 bg-slate-800/50 text-purple-200 text-xs rounded-full">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95">
                      Book Session
                    </button>
                    <button className="px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 border border-purple-500/30 rounded-lg transition-all">
                      <MessageSquare className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="animate-slideInUp">
            <div className="bg-gradient-to-r from-purple-600/40 to-pink-600/40 border border-purple-500/30 rounded-3xl p-12 text-center backdrop-blur-xl">
              <h2 className="text-3xl font-bold text-white mb-4">Can't Find the Right Therapist?</h2>
              <p className="text-purple-200 text-lg mb-8">Chat with our AI counselor or browse more therapists</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/ai-counselor')}
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  💬 Talk to AI
                </button>
                <button className="px-8 py-4 bg-slate-800/50 text-purple-300 border-2 border-purple-500/50 font-bold rounded-xl hover:bg-slate-700/50 transition-all">
                  View More
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default FindTherapistPageNew;
