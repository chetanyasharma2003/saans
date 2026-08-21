import React, { useState, useMemo, useEffect, useCallback } from 'react';
import therapistApi, { TherapistData, GetTherapistsResponse } from '../services/therapistApi';
import TherapistFilterBar from '../components/Therapist/TherapistFilterBar';
import TherapistGrid from '../components/Therapist/TherapistGrid';
import TherapistDetail from '../components/Therapist/TherapistDetail';

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


// Main Page Component
export function FindTherapistPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150]);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'name' | 'experience'>('rating');
  const user = { city: 'Mumbai' }; // Default user location

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <TherapistFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            suggestions={suggestions}
            isSearchLoading={searchLoading}
            selectedSpecialties={selectedSpecialties}
            onSpecialtiesChange={setSelectedSpecialties}
            selectedLanguages={selectedLanguages}
            onLanguagesChange={setSelectedLanguages}
            selectedCities={selectedCities}
            onCitiesChange={setSelectedCities}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            sortBy={sortBy}
            onSortChange={setSortBy}
            allSpecialties={allSpecialties}
            allLanguages={allLanguages}
            allCities={allCities}
            onClearFilters={() => {
              setSelectedSpecialties([]);
              setSelectedLanguages([]);
              setSelectedCities([]);
              setPriceRange([0, 150]);
              setSearchQuery('');
              setSortBy('rating');
            }}
            hasActiveFilters={selectedSpecialties.length > 0 || selectedLanguages.length > 0 || selectedCities.length > 0 || searchQuery.length > 0}
          />

          <div className="lg:col-span-3">
            {!loading && (
              <div className="mb-6 text-teal-300 font-semibold">
                Showing {filteredTherapists.length} therapist{filteredTherapists.length !== 1 ? 's' : ''}
              </div>
            )}

            <TherapistGrid
              therapists={filteredTherapists}
              loading={loading}
              userCity={user?.city}
              onTherapistSelect={setSelectedTherapist}
              emptyMessage="No therapists found matching your criteria."
            />

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
          </div>
        </div>
      </main>

      <TherapistDetail therapist={selectedTherapist} onClose={() => setSelectedTherapist(null)} />
    </div>
  );
}

export default FindTherapistPage;
