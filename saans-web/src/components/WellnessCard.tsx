import React from 'react';

interface WellnessCardProps {
  title: string;
  description: string;
  category: string;
  type: string;
  estimatedTime?: number;
  rating?: number;
  onStart: () => void;
}

const WellnessCard: React.FC<WellnessCardProps> = ({
  title,
  description,
  category,
  type,
  estimatedTime,
  rating,
  onStart,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MEDITATION':
        return '🧘';
      case 'EXERCISE':
        return '💪';
      case 'ARTICLE':
        return '📖';
      case 'PODCAST':
        return '🎙️';
      case 'BOOK':
        return '📚';
      default:
        return '✨';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105">
      <div className="h-2" style={{ backgroundColor: '#2D6A6A' }} />

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-3xl mr-2">{getTypeIcon(type)}</span>
            <span
              className="inline-block px-3 py-1 rounded-full text-white text-xs font-semibold"
              style={{ backgroundColor: '#2D6A6A' }}
            >
              {category}
            </span>
          </div>
          {estimatedTime && (
            <span className="text-sm text-gray-500">⏱️ {estimatedTime} min</span>
          )}
        </div>

        <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between">
          {rating && (
            <div className="flex items-center">
              {'⭐'.repeat(Math.round(rating))}
              <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
            </div>
          )}
          <button
            onClick={onStart}
            className="px-4 py-2 rounded-lg font-semibold text-white transition"
            style={{ backgroundColor: '#2D6A6A' }}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default WellnessCard;
