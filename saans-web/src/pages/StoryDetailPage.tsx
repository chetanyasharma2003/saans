import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, ThumbsUp, Eye, Loader, AlertCircle } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Comment {
  _id: string;
  content: string;
  userId: { firstName: string; lastName: string; profileImage?: string };
  likes: number;
  helpful: number;
  createdAt: string;
}

export function StoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStory();
    fetchComments();
  }, [id]);

  const fetchStory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/story-details/${id}`);
      setStory(response.data.data);
    } catch (err) {
      console.error('Error fetching story:', err);
      setError('Failed to load story');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/story-details/${id}/comments`);
      setComments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${API_URL}/api/story-details/${id}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments([response.data.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Failed to post comment');
    }
  };

  const handleMarkHelpful = async (commentId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/api/story-details/${id}/comments/${commentId}/helpful`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComments();
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

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <DashboardHeader title="Story" showBackButton={true} />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error || 'Story not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative z-10">
        <DashboardHeader title="Story" showBackButton={true} />

        <main className="max-w-2xl mx-auto px-4 py-12">
          {/* Back Button */}
          <button
            onClick={() => navigate('/community')}
            className="flex items-center gap-2 text-purple-300 hover:text-purple-200 mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </button>

          {/* Story */}
          <article className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8 mb-8">
            {/* Header */}
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-purple-600/30 text-purple-300 text-xs rounded-full mb-4">
                {story?.category?.toUpperCase() || 'STORY'}
              </span>
              <h1 className="text-4xl font-bold text-white mb-2">{story?.title}</h1>
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span>By {story?.isAnonymous ? 'Anonymous' : story?.userId?.firstName}</span>
                <span>•</span>
                <span>{new Date(story?.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {story?.views || 0} views
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none mb-8">
              <p className="text-gray-300 leading-8 whitespace-pre-wrap">{story?.content}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-6 border-t border-purple-500/20 pt-6">
              <div className="flex items-center gap-2 text-purple-300">
                <Heart className="w-5 h-5" />
                <span>{story?.helpful || 0} found helpful</span>
              </div>
              <div className="flex items-center gap-2 text-purple-300">
                <ThumbsUp className="w-5 h-5" />
                <span>{story?.upvotes || 0} upvotes</span>
              </div>
              <div className="flex items-center gap-2 text-purple-300">
                <MessageCircle className="w-5 h-5" />
                <span>{comments?.length || 0} comments</span>
              </div>
            </div>
          </article>

          {/* Comments Section */}
          <section className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Comments ({comments?.length || 0})</h2>

            {/* New Comment Form */}
            <div className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 outline-none min-h-24"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-500">{newComment.length}/1000</span>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition"
                >
                  Post Comment
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments?.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No comments yet. Be the first to share!</p>
              ) : (
                comments?.map((comment) => (
                  <div key={comment._id} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm font-bold text-white">
                            {comment?.userId?.firstName} {comment?.userId?.lastName}
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(comment?.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{comment?.content}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-3 text-xs text-gray-400">
                      <button
                        onClick={() => handleMarkHelpful(comment?._id)}
                        className="flex items-center gap-1 hover:text-purple-400 transition"
                      >
                        <Heart className="w-3 h-3" />
                        Helpful ({comment?.helpful || 0})
                      </button>
                      <button className="flex items-center gap-1 hover:text-purple-400 transition">
                        <ThumbsUp className="w-3 h-3" />
                        Like ({comment?.likes || 0})
                      </button>
                    </div>
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

export default StoryDetailPage;
