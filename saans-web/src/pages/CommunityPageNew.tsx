import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Search, Plus, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function CommunityPageNew() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newPostOpen, setNewPostOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('general');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: []
  });

  const categories = [
    'general',
    'depression',
    'anxiety',
    'stress',
    'relationships',
    'work',
    'sleep',
    'trauma',
    'ptsd',
    'grief',
    'addiction',
    'self-esteem',
    'eating-disorders',
    'parenting',
    'teen-issues',
    'career'
  ];

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/api/community/posts/feed`, {
        params: {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          limit: 50
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) {
      setError('Title and content are required');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/api/community/posts`,
        newPost,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewPost({ title: '', content: '', category: 'general', tags: [] });
      setNewPostOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post');
    }
  };

  const handleUpvote = async (postId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/api/community/posts/${postId}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const formatEngagement = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideInUp { animation: slideInUp 0.6s ease-out forwards; }
      `}</style>

      <div className="relative z-10">
        <DashboardHeader title="Community" showBackButton={false} />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          {/* Error Alert */}
          {error && (
            <div className="animate-slideInUp bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Create Post Section */}
          {!newPostOpen ? (
            <button
              onClick={() => setNewPostOpen(true)}
              className="w-full p-6 bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20 backdrop-blur-xl text-left group"
            >
              <div className="flex items-center gap-4">
                <Plus className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                <span className="text-purple-300 group-hover:text-purple-200">
                  Share your story or ask for advice...
                </span>
              </div>
            </button>
          ) : (
            <div className="animate-slideInUp p-6 bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl">
              <h3 className="text-xl font-bold text-white mb-4">Create a New Post</h3>

              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="Post title..."
                className="w-full p-3 mb-4 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
              />

              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="Write your post here..."
                rows={5}
                className="w-full p-3 mb-4 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 resize-none"
              />

              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full p-3 mb-4 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>

              <div className="flex gap-3">
                <button
                  onClick={handleCreatePost}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95"
                >
                  Post
                </button>
                <button
                  onClick={() => setNewPostOpen(false)}
                  className="px-6 py-3 bg-slate-800/50 border border-purple-500/30 text-purple-300 font-bold rounded-lg hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800/50 text-purple-300 hover:bg-slate-800'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          )}

          {/* Posts Feed */}
          {!loading && posts.length > 0 && (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="group p-6 bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20 backdrop-blur-xl cursor-pointer"
                  onClick={() => navigate(`/community/post/${post._id}`)}
                >
                  {/* Post Header */}
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-white group-hover:text-purple-200 transition">
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-sm text-purple-300">
                      <span className="px-2 py-1 bg-purple-600/30 rounded">
                        {post.category}
                      </span>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {post.content}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-6 pt-4 border-t border-purple-500/20 text-gray-400">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpvote(post._id);
                      }}
                      className="flex items-center gap-2 hover:text-purple-400 transition"
                    >
                      <Heart className="w-5 h-5" />
                      <span>{formatEngagement(post.engagement.upvotes)}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      <span>{formatEngagement(post.engagement.comments)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      <span>{formatEngagement(post.engagement.shares)}</span>
                    </div>

                    <div className="ml-auto text-sm">
                      💾 {formatEngagement(post.engagement.saves)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && posts.length === 0 && (
            <div className="animate-slideInUp p-12 bg-gradient-to-r from-purple-600/40 to-blue-600/40 border border-purple-500/30 rounded-3xl backdrop-blur-xl text-center">
              <h2 className="text-2xl font-bold text-white mb-2">No Posts Yet</h2>
              <p className="text-purple-200 mb-6">Be the first to share in this category!</p>
              <button
                onClick={() => setNewPostOpen(true)}
                className="px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                Create First Post
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CommunityPageNew;
