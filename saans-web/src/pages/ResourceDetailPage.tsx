import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Star, Eye, Download, Share2, Bookmark, MessageCircle, ThumbsUp, Loader, AlertCircle, CheckCircle, Lightbulb, AlertTriangle, Users, Clock, TrendingUp } from 'lucide-react';
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        <DashboardHeader title="Resource Guide" showBackButton={true} />

        <main className="max-w-5xl mx-auto px-4 py-12">
          {/* Back Button */}
          <button
            onClick={() => navigate('/resources')}
            className="flex items-center gap-2 text-purple-300 hover:text-purple-200 mb-8 transition font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </button>

          {/* Resource Header */}
          <article className="bg-gradient-to-br from-purple-900/60 to-slate-900/60 border border-purple-500/30 rounded-3xl backdrop-blur-xl p-10 mb-8">
            <div className="mb-8">
              <div className="inline-block mb-4 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full">
                <span className="text-purple-300 text-sm font-semibold">Comprehensive Guide</span>
              </div>
              <h1 className="text-5xl font-bold text-white mb-3">{resource?.condition?.name || 'Mental Health Guide'}</h1>
              <p className="text-lg text-purple-200 mb-6 max-w-2xl leading-relaxed">{resource?.condition?.description || 'A comprehensive guide to understanding and managing this condition with evidence-based strategies.'}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/30 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm text-gray-400">Rating</span>
                  </div>
                  <p className="text-white font-bold text-lg">{avgRating}/5</p>
                  <p className="text-xs text-gray-500">{reviewCount} reviews</p>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-gray-400">Views</span>
                  </div>
                  <p className="text-white font-bold text-lg">{(resource?.views || 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <span className="text-sm text-gray-400">Saved</span>
                  </div>
                  <p className="text-white font-bold text-lg">{(resource?.saves || 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-400">Helped</span>
                  </div>
                  <p className="text-white font-bold text-lg">2.4k+</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap pt-6 border-t border-purple-500/20">
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition ${
                  isBookmarked
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/50 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                {isBookmarked ? 'Saved' : 'Save Guide'}
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-slate-800/50 text-gray-300 border border-slate-700 rounded-lg font-semibold hover:bg-slate-700/50 transition">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-slate-800/50 text-gray-300 border border-slate-700 rounded-lg font-semibold hover:bg-slate-700/50 transition">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </article>

          {/* Common Symptoms Section */}
          {resource?.symptoms && resource.symptoms.length > 0 && (
            <section className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-3xl backdrop-blur-xl p-10 mb-8">
              <div className="flex items-center gap-3 mb-8">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
                <h2 className="text-3xl font-bold text-white">Common Symptoms</h2>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">Recognizing these symptoms early can help you seek appropriate support and treatment:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resource?.symptoms?.map((symptom, idx) => (
                  <div key={idx} className="bg-slate-800/30 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">📌</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-2 text-lg">{symptom?.name}</h3>
                        <p className="text-gray-300 text-sm mb-3 leading-relaxed">{symptom?.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="inline-block text-xs bg-orange-600/20 text-orange-300 px-3 py-1 rounded-full font-semibold">
                            {symptom?.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Treatment Options Section */}
          {resource?.treatments && resource.treatments.length > 0 && (
            <section className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-3xl backdrop-blur-xl p-10 mb-8">
              <div className="flex items-center gap-3 mb-8">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h2 className="text-3xl font-bold text-white">Evidence-Based Treatment</h2>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">These research-backed approaches have shown significant effectiveness in managing this condition:</p>
              <div className="space-y-6">
                {resource?.treatments?.map((treatment, idx) => (
                  <div key={idx} className="bg-slate-800/30 rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">💊</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-2 text-lg">{treatment?.name}</h3>
                        <p className="text-gray-300 text-sm mb-4 leading-relaxed">{treatment?.description}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-700/30 rounded-lg p-3">
                            <span className="text-xs text-gray-400">Type</span>
                            <p className="text-green-300 font-semibold text-sm">{treatment?.type}</p>
                          </div>
                          <div className="bg-slate-700/30 rounded-lg p-3">
                            <span className="text-xs text-gray-400">Duration</span>
                            <p className="text-blue-300 font-semibold text-sm">{treatment?.duration}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Quick Tips Section */}
          <section className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-3xl backdrop-blur-xl p-10 mb-8">
            <div className="flex items-center gap-3 mb-8">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white">Daily Tips & Strategies</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: '🧘', title: 'Mindfulness', desc: 'Practice 10-15 minutes daily meditation to reduce stress and anxiety' },
                { icon: '🏃', title: 'Exercise', desc: 'Regular physical activity improves mood and overall mental health' },
                { icon: '😴', title: 'Sleep', desc: 'Maintain consistent sleep schedule for better emotional regulation' },
                { icon: '🥗', title: 'Nutrition', desc: 'Balanced diet supports brain health and mood stability' },
                { icon: '👥', title: 'Social Support', desc: 'Connect with friends and family for emotional support' },
                { icon: '📔', title: 'Journaling', desc: 'Write down thoughts and feelings to process emotions' }
              ].map((tip, idx) => (
                <div key={idx} className="bg-slate-800/30 rounded-xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition">
                  <div className="text-3xl mb-3">{tip.icon}</div>
                  <h3 className="font-bold text-white mb-2">{tip.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* When to Seek Help Section */}
          <section className="bg-gradient-to-br from-red-900/20 to-slate-900/40 border border-red-500/20 rounded-3xl backdrop-blur-xl p-10 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold text-white">When to Seek Professional Help</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Symptoms persist for more than 2 weeks',
                'Difficulty functioning in daily life',
                'Thoughts of self-harm or suicide',
                'Substance use as coping mechanism',
                'Relationship or work conflicts',
                'Significant change in sleep or appetite'
              ].map((warning, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-800/20 p-4 rounded-lg border border-red-500/20">
                  <CheckCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{warning}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border-l-4 border-red-500">
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Crisis Support:</strong> If you're in immediate crisis, please contact a mental health professional or crisis hotline in your area.
              </p>
            </div>
          </section>

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
