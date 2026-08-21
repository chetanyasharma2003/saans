import React, { useState } from 'react';

// Search Autocomplete Component
interface SearchAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  isLoading: boolean;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ value, onChange, suggestions, isLoading }) => {
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
};

// Filter Section Component
interface FilterSectionProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ label, options, selectedValues, onChange }) => {
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
                    onChange(selectedValues.filter((v) => v !== option));
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
};

interface TherapistFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  suggestions: string[];
  isSearchLoading: boolean;
  selectedSpecialties: string[];
  onSpecialtiesChange: (specialties: string[]) => void;
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
  selectedCities: string[];
  onCitiesChange: (cities: string[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  sortBy: 'rating' | 'price' | 'name' | 'experience';
  onSortChange: (sort: 'rating' | 'price' | 'name' | 'experience') => void;
  allSpecialties: string[];
  allLanguages: string[];
  allCities: string[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const TherapistFilterBar: React.FC<TherapistFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  suggestions,
  isSearchLoading,
  selectedSpecialties,
  onSpecialtiesChange,
  selectedLanguages,
  onLanguagesChange,
  selectedCities,
  onCitiesChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange,
  allSpecialties,
  allLanguages,
  allCities,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <SearchAutocomplete
          value={searchQuery}
          onChange={onSearchChange}
          suggestions={suggestions}
          isLoading={isSearchLoading}
        />
      </div>

      {/* Filter Sidebar */}
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
              onChange={onSpecialtiesChange}
            />
          )}

          {allLanguages.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <FilterSection
                label="Languages"
                options={allLanguages}
                selectedValues={selectedLanguages}
                onChange={onLanguagesChange}
              />
            </div>
          )}

          {allCities.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <FilterSection
                label="City/Location"
                options={allCities}
                selectedValues={selectedCities}
                onChange={onCitiesChange}
              />
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-white/10">
            <label htmlFor="sort-dropdown" className="block text-white font-medium text-sm mb-3">
              Sort By
            </label>
            <select
              id="sort-dropdown"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
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
            <label htmlFor="price-range-display" className="block text-white font-medium text-sm mb-3">
              Price Range
            </label>
            <div className="space-y-3">
              <div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={priceRange[0]}
                  onChange={(e) => onPriceRangeChange([parseInt(e.target.value), priceRange[1]])}
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
                  onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
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

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="w-full mt-6 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-sm font-medium transition-colors"
              data-testid="clear-filters"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default TherapistFilterBar;
