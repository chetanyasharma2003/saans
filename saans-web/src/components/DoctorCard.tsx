import React from 'react';
import { Star, MapPin, Clock, Users, MessageCircle } from 'lucide-react';
import { TrustBadgesCluster } from './TrustBadge';

export interface DoctorCardProps {
  id: string;
  name: string;
  photoUrl?: string;
  specializations: string[];
  languages: string[];
  rating: number;
  reviews: number;
  distance?: number;
  responseTimeHours: number;
  acceptedInsurance: string[];
  verificationBadges: string[];
  bio: string;
  practiceName?: string;
  onBook?: (doctorId: string) => void;
  onViewProfile?: (doctorId: string) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  id,
  name,
  photoUrl,
  specializations,
  languages,
  rating,
  reviews,
  distance,
  responseTimeHours,
  acceptedInsurance,
  verificationBadges,
  bio,
  practiceName,
  onBook,
  onViewProfile,
}) => {
  return (
    <div
      className="rounded-2xl p-6 border transition-all hover:shadow-lg"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-gray-200)',
      }}
    >
      {/* Header with photo and name */}
      <div className="flex gap-4 mb-4">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
            style={{
              backgroundColor: 'var(--color-accent-lighter)',
              color: 'var(--color-primary)',
            }}
          >
            {name.charAt(0)}
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {name}
          </h3>
          {practiceName && (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {practiceName}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4"
                  style={{
                    fill:
                      i < Math.floor(rating)
                        ? 'var(--color-accent)'
                        : 'var(--color-gray-300)',
                    color:
                      i < Math.floor(rating)
                        ? 'var(--color-accent)'
                        : 'var(--color-gray-300)',
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {rating.toFixed(1)}
            </span>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              ({reviews} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      {verificationBadges.length > 0 && (
        <div className="mb-4">
          <TrustBadgesCluster badges={verificationBadges} />
        </div>
      )}

      {/* Specializations and Languages */}
      <div className="mb-4 space-y-2">
        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            SPECIALIZATIONS
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {specializations.map((spec) => (
              <span
                key={spec}
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--color-secondary-lighter)',
                  color: 'var(--color-primary)',
                }}
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            LANGUAGES
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {languages.join(', ')}
          </p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
        {bio}
      </p>

      {/* Practical Information */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>
            Responds in {responseTimeHours}h
          </span>
        </div>

        {distance && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {distance.toFixed(1)} km away
            </span>
          </div>
        )}

        {acceptedInsurance.length > 0 && (
          <div className="col-span-2 flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {acceptedInsurance.slice(0, 2).join(', ')}
              {acceptedInsurance.length > 2 && ` +${acceptedInsurance.length - 2}`}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewProfile?.(id)}
          className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-sm border-2"
          style={{
            borderColor: 'var(--color-primary)',
            color: 'var(--color-primary)',
            backgroundColor: 'white',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--color-primary-lightest)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'white';
          }}
        >
          <MessageCircle className="w-4 h-4 inline mr-2" />
          View Profile
        </button>

        <button
          onClick={() => onBook?.(id)}
          className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-sm text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--color-primary-light)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--color-primary)';
          }}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};
