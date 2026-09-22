/**
 * Find Therapist Page - API INTEGRATED
 * Real therapist search with filtering and recommendations
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  H1,
  H2,
  Body,
  Typography,
  Badge,
  Icon,
} from '../design-system';
import {
  useTherapists,
  useRecommendedTherapists,
  useSpecialties,
  useLanguages,
  type TherapistFilters,
  type Therapist,
} from '../hooks';
import { TherapistCardSkeleton, GridSkeleton } from '../components/SkeletonLoaders';

/**
 * Error Component
 */
function ErrorDisplay({ message }: { message: string }) {
  return (
    <Card variant="outlined" padding="lg" className="border-l-4 border-l-error-500">
      <Typography variant="bodyMd" color="error">
        ❌ {message}
      </Typography>
    </Card>
  );
}

/**
 * Therapist Card Component
 */
function TherapistCard({ therapist, onBook }: { therapist: Therapist; onBook: () => void }) {
  return (
    <Card variant="outlined" padding="lg" hoverable clickable>
      <div className="space-y-3">
        {/* Header with avatar and name */}
        <div className="flex gap-3">
          <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center text-lg">
            👨‍⚕️
          </div>
          <div className="flex-1">
            <H3 className="font-semibold">{therapist.name}</H3>
            <Typography variant="labelSm" color="secondary">
              {therapist.specialty.join(', ')}
            </Typography>
          </div>
        </div>

        {/* Rating and verification */}
        <div className="flex items-center gap-2">
          <span>⭐ {therapist.rating}</span>
          <Typography variant="labelSm" color="secondary">
            ({therapist.reviews} reviews)
          </Typography>
          {therapist.verified && <Badge variant="success" size="sm">Verified</Badge>}
        </div>

        {/* Experience and languages */}
        <div className="text-sm text-neutral-600">
          <div>📌 {therapist.experience} years experience</div>
          <div>🗣️ {therapist.languages.join(', ')}</div>
          <div>💰 ₹{therapist.price}/session</div>
        </div>

        {/* Consultation types */}
        <div className="flex gap-2 flex-wrap">
          {therapist.consultationType.map((type) => (
            <Badge key={type} variant="info" size="sm">
              {type === 'video' ? '📹' : type === 'audio' ? '🎤' : '💬'} {type}
            </Badge>
          ))}
        </div>

        {/* Bio */}
        <Typography variant="bodySm" color="secondary" className="line-clamp-2">
          {therapist.bio}
        </Typography>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={onBook}
          >
            Book Appointment
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              /* View profile */
            }}
          >
            View Profile
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * Filter Sidebar
 */
function FilterSidebar({
  filters,
  onFiltersChange,
  specialties,
  languages,
}: {
  filters: TherapistFilters;
  onFiltersChange: (filters: TherapistFilters) => void;
  specialties: Array<{ id: string; name: string; count: number }>;
  languages: string[];
}) {
  return (
    <Card variant="flat" padding="lg" className="h-fit">
      <H3 className="mb-4">Filters</H3>

      {/* Specialty Filter */}
      <div className="mb-6">
        <Typography variant="labelMd" className="mb-2 block">
          Specialty
        </Typography>
        <select
          value={filters.specialty || ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, specialty: e.target.value || undefined })
          }
          className="w-full p-2 border border-neutral-300 rounded-lg"
        >
          <option value="">All Specialties</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.count})
            </option>
          ))}
        </select>
      </div>

      {/* Language Filter */}
      <div className="mb-6">
        <Typography variant="labelMd" className="mb-2 block">
          Language
        </Typography>
        <select
          value={filters.language || ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, language: e.target.value || undefined })
          }
          className="w-full p-2 border border-neutral-300 rounded-lg"
        >
          <option value="">All Languages</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <Typography variant="labelMd" className="mb-2 block">
          Max Price (₹)
        </Typography>
        <input
          type="range"
          min="100"
          max="10000"
          value={filters.maxPrice || 10000}
          onChange={(e) =>
            onFiltersChange({ ...filters, maxPrice: parseInt(e.target.value) })
          }
          className="w-full"
        />
        <Typography variant="bodySm" color="secondary" className="mt-2">
          ₹{filters.maxPrice || 10000}
        </Typography>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <Typography variant="labelMd" className="mb-2 block">
          Min Rating
        </Typography>
        <select
          value={filters.minRating || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              minRating: e.target.value ? parseFloat(e.target.value) : undefined,
            })
          }
          className="w-full p-2 border border-neutral-300 rounded-lg"
        >
          <option value="">Any Rating</option>
          <option value="3">3+</option>
          <option value="3.5">3.5+</option>
          <option value="4">4+</option>
          <option value="4.5">4.5+</option>
          <option value="5">5 Stars</option>
        </select>
      </div>

      {/* Consultation Type */}
      <div>
        <Typography variant="labelMd" className="mb-2 block">
          Consultation Type
        </Typography>
        <select
          value={filters.consultationType || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              consultationType: (e.target.value as any) || undefined,
            })
          }
          className="w-full p-2 border border-neutral-300 rounded-lg"
        >
          <option value="">All Types</option>
          <option value="video">Video Call</option>
          <option value="audio">Audio Call</option>
          <option value="chat">Chat</option>
        </select>
      </div>
    </Card>
  );
}

/**
 * Main Page
 */
export function FindTherapistPageIntegrated() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TherapistFilters>({});
  const [showRecommended, setShowRecommended] = useState(false);

  // API Queries
  const { data: therapists, isLoading, error } = useTherapists(filters);
  const { data: recommended, isLoading: recommendedLoading } =
    useRecommendedTherapists();
  const { data: specialties, isLoading: specialtiesLoading } = useSpecialties();
  const { data: languages, isLoading: languagesLoading } = useLanguages();

  const displayTherapists = showRecommended ? recommended : therapists;
  const isDisplayLoading = showRecommended ? recommendedLoading : isLoading;

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <H1 className="mb-2">Find Your Therapist</H1>
          <Body color="secondary">
            Connect with verified, experienced mental health professionals
          </Body>
        </div>

        {/* Toggle Recommended */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={showRecommended ? 'secondary' : 'primary'}
            size="md"
            onClick={() => setShowRecommended(false)}
          >
            Browse All
          </Button>
          <Button
            variant={showRecommended ? 'primary' : 'secondary'}
            size="md"
            onClick={() => setShowRecommended(true)}
          >
            Recommended For You
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          {!showRecommended && (
            <div>
              {specialtiesLoading || languagesLoading ? (
                <TherapistCardSkeleton />
              ) : (
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  specialties={specialties || []}
                  languages={languages || []}
                />
              )}
            </div>
          )}

          {/* Main Content */}
          <div className={showRecommended ? 'lg:col-span-4' : 'lg:col-span-3'}>
            {error ? (
              <ErrorDisplay message={error.message} />
            ) : isDisplayLoading ? (
              <GridSkeleton count={6} />
            ) : displayTherapists && displayTherapists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayTherapists.map((therapist) => (
                  <TherapistCard
                    key={therapist.id}
                    therapist={therapist}
                    onBook={() =>
                      navigate(`/therapist/${therapist.id}/book`)
                    }
                  />
                ))}
              </div>
            ) : (
              <Card variant="flat" padding="lg" className="text-center py-12">
                <Body color="secondary">No therapists found matching your criteria</Body>
                <Button
                  variant="tertiary"
                  size="md"
                  onClick={() => setFilters({})}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface H3Props {
  className?: string;
  children: React.ReactNode;
}

function H3({ className = '', children }: H3Props) {
  return <Typography as="h3" variant="h3" className={className}>{children}</Typography>;
}

export default FindTherapistPageIntegrated;
