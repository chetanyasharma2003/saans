import React from 'react';
import LocationBadge from './LocationBadge';

interface TherapistCardProps {
  id: string;
  name: string;
  bio?: string;
  city?: string;
  image?: string;
  specialization?: string[];
  specialty?: string[];
  averageRating?: number;
  rating?: number;
  totalReviews?: number;
  reviews?: number;
  hourlyRate?: number;
  price?: number;
  languages?: string[];
  userCity?: string;
  onViewDetails: () => void;
}

export const TherapistCard: React.FC<TherapistCardProps> = ({
  id,
  name,
  bio,
  city,
  image,
  specialization,
  specialty,
  averageRating,
  rating,
  totalReviews,
  reviews,
  hourlyRate,
  price,
  languages,
  userCity,
  onViewDetails,
}) => {
  const defaultImage = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop';
  const imageUrl = image || defaultImage;
  const specs = (specialization || specialty || []) as string[];
  const displayRating = averageRating || rating || 4.5;
  const displayReviews = totalReviews || reviews || 0;
  const displayRate = hourlyRate || price || 0;

  return (
    <div className="group relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 rounded-2xl overflow-hidden hover:border-teal-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-teal-500/20 backdrop-blur-xl">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-teal-500/10 to-cyan-500/10" />

      <div className="relative h-48 overflow-hidden bg-gradient-to-b from-teal-600 to-cyan-600">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 bg-teal-500/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
          <span className="text-white text-sm">⭐</span>
          <span className="text-white text-sm font-bold">{displayRating.toFixed(1)}</span>
        </div>
      </div>

      <div className="relative p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">{name}</h3>
          <p className="text-teal-300 text-sm mt-1">{specs[0] || 'General Therapy'}</p>
        </div>

        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="flex items-center gap-1">
            ⭐ {displayReviews} reviews
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {specs.slice(0, 2).map((spec) => (
            <span key={spec} className="text-xs bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full border border-teal-500/30">
              {spec}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span>💰</span>
            <span className="text-white text-sm">${displayRate}/session</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🌐</span>
            <span className="text-white text-sm">{(languages || [])[0] || 'English'}</span>
          </div>
        </div>

        {city && (
          <div className="pt-2">
            <LocationBadge city={city} userCity={userCity} />
          </div>
        )}

        <button
          onClick={onViewDetails}
          className="w-full mt-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-teal-500/50"
        >
          View Profile & Book
        </button>
      </div>
    </div>
  );
};

export default TherapistCard;
