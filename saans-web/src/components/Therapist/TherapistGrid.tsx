import React from 'react';
import TherapistCard from './TherapistCard';

interface TherapistData {
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
}

interface TherapistGridProps {
  therapists: TherapistData[];
  loading: boolean;
  userCity?: string;
  onTherapistSelect: (therapist: TherapistData) => void;
  emptyMessage?: string;
}

const TherapistCardSkeleton: React.FC = () => (
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

export const TherapistGrid: React.FC<TherapistGridProps> = ({
  therapists,
  loading,
  userCity,
  onTherapistSelect,
  emptyMessage = 'No therapists found matching your criteria.',
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <TherapistCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (therapists.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {therapists.map((therapist) => (
        <TherapistCard
          key={therapist.id}
          {...therapist}
          userCity={userCity}
          onViewDetails={() => onTherapistSelect(therapist)}
        />
      ))}
    </div>
  );
};

export default TherapistGrid;
