import React from 'react';

interface LocationBadgeProps {
  city?: string;
  userCity?: string;
  className?: string;
}

export const LocationBadge: React.FC<LocationBadgeProps> = ({
  city,
  userCity,
  className = '',
}) => {
  if (!city) return null;

  const isInUserCity = userCity && city.toLowerCase() === userCity.toLowerCase();

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
        isInUserCity
          ? 'bg-green-500/20 text-green-300 border-green-500/30'
          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      } ${className}`}
    >
      <span>{isInUserCity ? '📍' : '🌍'}</span>
      {isInUserCity ? 'In Your City' : 'Nearby'}
    </span>
  );
};

export default LocationBadge;
