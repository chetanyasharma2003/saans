import React, { useState } from 'react';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  text: string;
  date: string;
  helpful: number;
  verified: boolean;
  aspects?: {
    empathy?: number;
    knowledge?: number;
    responsiveness?: number;
    professionalism?: number;
  };
}

interface ReviewsSectionProps {
  therapistName: string;
  averageRating: number;
  totalReviews: number;
  reviews?: Review[];
  onAddReview?: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  therapistName,
  averageRating,
  totalReviews,
  reviews = [],
  onAddReview,
}) => {
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const mockReviews: Review[] = [
    {
      id: '1',
      author: 'Sarah M.',
      rating: 5,
      title: 'Life-changing therapy',
      text: 'Dr. Priya has been instrumental in helping me manage my anxiety. She is empathetic, knowledgeable, and provides practical tools I can use daily. Highly recommended!',
      date: '2 weeks ago',
      helpful: 24,
      verified: true,
      aspects: { empathy: 5, knowledge: 5, responsiveness: 5, professionalism: 5 },
    },
    {
      id: '2',
      author: 'Rajesh K.',
      rating: 5,
      title: 'Great support during difficult times',
      text: 'Going through a rough patch and Dr. Sharma helped me see things from a different perspective. Very professional and caring.',
      date: '1 month ago',
      helpful: 18,
      verified: true,
      aspects: { empathy: 5, knowledge: 4, responsiveness: 5, professionalism: 5 },
    },
    {
      id: '3',
      author: 'Priya D.',
      rating: 4,
      title: 'Very helpful but a bit formal',
      text: 'Good therapist, very knowledgeable about CBT techniques. Could be a bit more relaxed in approach but overall positive experience.',
      date: '6 weeks ago',
      helpful: 12,
      verified: true,
      aspects: { empathy: 4, knowledge: 5, responsiveness: 4, professionalism: 5 },
    },
    {
      id: '4',
      author: 'Ananya S.',
      rating: 5,
      title: 'Exactly what I needed',
      text: 'I was hesitant about therapy but Dr. Sharma made me feel comfortable from day one. She listens deeply and provides actionable advice.',
      date: '2 months ago',
      helpful: 31,
      verified: true,
      aspects: { empathy: 5, knowledge: 5, responsiveness: 5, professionalism: 5 },
    },
  ];

  const filteredReviews = filterRating
    ? mockReviews.filter((r) => r.rating === filterRating)
    : mockReviews;

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'helpful') return b.helpful - a.helpful;
    return 0;
  });

  const ratingDistribution = [
    { stars: 5, count: 15, percentage: 75 },
    { stars: 4, count: 4, percentage: 20 },
    { stars: 3, count: 1, percentage: 5 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-6">Patient Reviews</h2>

        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Main Rating */}
          <div className="bg-gradient-to-br from-teal-600/20 to-cyan-600/20 border border-teal-500/30 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-5xl font-bold text-white">{averageRating.toFixed(1)}</div>
              <div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5"
                      fill={i < Math.floor(averageRating) ? '#14b8a6' : '#334155'}
                      color={i < Math.floor(averageRating) ? '#14b8a6' : '#334155'}
                    />
                  ))}
                </div>
                <p className="text-gray-400 text-sm mt-1">{totalReviews} reviews</p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-slate-700/30 border border-white/10 p-6 rounded-xl col-span-2">
            <p className="text-gray-300 font-semibold mb-4">Rating Breakdown</p>
            <div className="space-y-2">
              {ratingDistribution.map((dist) => (
                <div key={dist.stars} className="flex items-center gap-2">
                  <div className="w-12 text-right">
                    <span className="text-sm text-gray-400">{dist.stars}★</span>
                  </div>
                  <div className="flex-1 h-2 bg-slate-600/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-8">{dist.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action & Sort */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <button
            onClick={onAddReview}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all"
          >
            ✍️ Write a Review
          </button>

          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-slate-700/50 border border-white/20 rounded-lg text-white text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>

            <select
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-2 bg-slate-700/50 border border-white/20 rounded-lg text-white text-sm"
            >
              <option value="">All Ratings</option>
              <option value="5">⭐ 5 Stars</option>
              <option value="4">⭐ 4 Stars</option>
              <option value="3">⭐ 3 Stars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <div key={review.id} className="bg-slate-700/20 border border-white/10 p-6 rounded-xl hover:border-teal-500/30 transition-all">
            {/* Author & Rating */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold">{review.author}</p>
                  {review.verified && (
                    <span className="text-xs bg-teal-500/30 text-teal-300 px-2 py-1 rounded border border-teal-500/50">
                      ✓ Verified Purchase
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{review.date}</p>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4"
                    fill={i < review.rating ? '#14b8a6' : '#334155'}
                    color={i < review.rating ? '#14b8a6' : '#334155'}
                  />
                ))}
              </div>
            </div>

            {/* Title & Text */}
            <h4 className="text-white font-semibold mb-2">{review.title}</h4>
            <p className="text-gray-300 mb-4">{review.text}</p>

            {/* Aspects */}
            {review.aspects && (
              <div className="bg-slate-600/30 p-4 rounded-lg mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(review.aspects).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-gray-400 text-xs capitalize mb-1">{key}</p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-2 rounded-full ${i < value ? 'bg-teal-500' : 'bg-slate-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Helpful */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors text-sm">
                <ThumbsUp className="w-4 h-4" />
                Helpful ({review.helpful})
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors text-sm">
                <MessageCircle className="w-4 h-4" />
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
