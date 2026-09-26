import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Star, Eye, Download, Share2, Bookmark, MessageCircle, ThumbsUp, Loader, AlertCircle } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Review {
  _id: string;
  rating: number;
  title?: string;
  content?: string;
  userId: { firstName: string; lastName: string };
  helpful: number;
  createdAt: string;
}

export function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResource();
    fetchReviews();
    checkBookmark();
  }, [id]);

  const fetchResource = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/resource-details/${id}`);
      setResource(response.data.data);
    } catch (err) {
      console.error('Error fetching resource:', err);
      setError('Failed to load resource');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/resource-details/${id}/reviews`);
      setReviews(response.data.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const checkBookmark = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_URL}/api/resource-details/${id}/is-bookmarked`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsBookmarked(response.data.isBookmarked);
    } catch (err) {
      console.error('Error checking bookmark:', err);
    }
  };

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (isBookmarked) {
        await axios.delete(
          `${API_URL}/api/resource-details/${id}/bookmark`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/api/resource-details/${id}/bookmark`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to update bookmark');
    }
  };

  const handleAddReview = async () => {
    if (!newReview.rating) {
      alert('Please select a rating');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${API_URL}/api/resource-details/${id}/reviews`,
        newReview,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviews([response.data.data, ...reviews]);
      setNewReview({ rating: 5, title: '', content: '' });
      alert('Review submitted!');
    } catch (err) {
      console.error('Error posting review:', err);
      alert('Failed to submit review');
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/api/resource-details/${id}/reviews/${reviewId}/helpful`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReviews();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <DashboardHeader title="Resource" showBackButton={true} />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error || 'Resource not found'}
          </div>
        </div>
      </div>
    );
  }

  const avgRating = resource?.averageRating || 0;
  const reviewCount = resource?.reviewCount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative z-10">
        <DashboardHeader title="Resource" showBackButton={true} />

        <main className="max-w-3xl mx-auto px-4 py-12">
          {/* Back Button */}
          <button
            onClick={() => navigate('/resources')}
            className="flex items-center gap-2 text-purple-300 hover:text-purple-200 mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </button>

          {/* Resource Header */}
          <article className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8 mb-8">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-white mb-2">{resource?.condition?.name}</h1>
              <p className="text-purple-300 mb-4">{resource?.condition?.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star className="w-5 h-5 fill-yellow-400" />
                  <span className="font-bold">{avgRating}/5</span>
                  <span className="text-gray-400">({reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-purple-300">
                  <Eye className="w-5 h-5" />
                  <span>{resource?.views || 0} views</span>
                </div>
                <div className="flex items-center gap-2 text-purple-300">
                  <Heart className="w-5 h-5" />
                  <span>{resource?.saves || 0} saved</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                  isBookmarked
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-purple-300 border border-purple-500/30 hover:bg-purple-600/20'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                {isBookmarked ? 'Saved' : 'Save'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-gray-300 border border-slate-700 rounded-lg font-bold hover:bg-slate-700 transition">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-gray-300 border border-slate-700 rounded-lg font-bold hover:bg-slate-700 transition">
                <Download className="w-4 h-4" />
                Print
              </button>
            </div>
          </article>

          {/* Content Sections */}
          {resource?.symptoms && resource.symptoms.length > 0 && (
            <section className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Common Symptoms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resource?.symptoms?.map((symptom, idx) => (
                  <div key={idx} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                    <h3 className="font-bold text-white mb-2">{symptom?.name}</h3>
                    <p className="text-gray-300 text-sm">{symptom?.description}</p>
                    <span className="inline-block mt-2 text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded">
                      {symptom?.category}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {resource?.treatments && resource.treatments.length > 0 && (
            <section className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Treatment Options</h2>
              <div className="space-y-4">
                {resource?.treatments?.map((treatment, idx) => (
                  <div key={idx} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                    <h3 className="font-bold text-white mb-2">{treatment?.name}</h3>
                    <p className="text-gray-300 text-sm mb-2">{treatment?.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-green-600/30 text-green-300 px-2 py-1 rounded">
                        {treatment?.type}
                      </span>
                      <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded">
                        Duration: {treatment?.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews Section */}
          <section className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Reviews ({reviews?.length || 0})</h2>

            {/* New Review Form */}
            <div className="mb-8 bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <h3 className="font-bold text-white mb-4">Share Your Feedback</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className={`text-3xl transition ${
                          star <= newReview.rating ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Title (Optional)</label>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    placeholder="e.g., Really helpful guide"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 outline-none"
                    maxLength={150}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Comment</label>
                  <textarea
                    value={newReview.content}
                    onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                    placeholder="Share what you found helpful..."
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 outline-none min-h-20"
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1">{newReview.content.length}/1000</p>
                </div>

                <button
                  onClick={handleAddReview}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition"
                >
                  Submit Review
                </button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews?.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to share!</p>
              ) : (
                reviews?.map((review) => (
                  <div key={review?._id} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review?.rating ? 'text-yellow-400' : 'text-gray-600'}>
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="text-sm font-bold text-white">{review?.rating}/5</span>
                        </div>
                        {review?.title && <p className="font-bold text-white">{review.title}</p>}
                        <p className="text-xs text-gray-500">By {review?.userId?.firstName} {review?.userId?.lastName}</p>
                      </div>
                    </div>

                    {review?.content && (
                      <p className="text-gray-300 text-sm mb-3">{review.content}</p>
                    )}

                    <button
                      onClick={() => handleMarkHelpful(review?._id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-400 transition"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      Helpful ({review?.helpful || 0})
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default ResourceDetailPage;
