import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MessageCircle, ThumbsUp, Eye, Loader, AlertCircle, Users } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Post {
  _id: string;
  title: string;
  content: string;
  userId: { firstName: string; lastName: string; profileImage?: string };
  upvotes: number;
  commentCount: number;
  views: number;
  createdAt: string;
  isPinned?: boolean;
}

export function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchGroup();
    fetchPosts();
  }, [id]);

  const fetchGroup = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/api/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroup(response.data.data);
    } catch (err) {
      console.error('Error fetching group:', err);
      setError('Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/group-posts/group/${id}`);
      setPosts(response.data.data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${API_URL}/api/group-posts`,
        {
          groupId: id,
          title: newPost.title,
          content: newPost.content
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts([response.data.data, ...posts]);
      setNewPost({ title: '', content: '' });
      setShowPostForm(false);
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post');
    }
  };

  const handleUpvotePost = async (postId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/api/group-posts/${postId}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
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

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <DashboardHeader title="Group" showBackButton={true} />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error || 'Group not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative z-10">
        <DashboardHeader title={group?.name || 'Group'} showBackButton={true} />

        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Back Button */}
          <button
            onClick={() => navigate('/community')}
            className="flex items-center gap-2 text-purple-300 hover:text-purple-200 mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </button>

          {/* Group Header */}
          <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{group?.icon || '👥'}</span>
                  <div>
                    <h1 className="text-4xl font-bold text-white">{group?.name}</h1>
                    <p className="text-purple-300">{group?.category}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-6">{group?.description}</p>

                {/* Group Stats */}
                <div className="flex gap-6">
                  <div className="flex items-center gap-2 text-purple-300">
                    <Users className="w-5 h-5" />
                    <span>{group?.memberCount || 0} members</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-300">
                    <MessageCircle className="w-5 h-5" />
                    <span>{group?.postCount || 0} posts</span>
                  </div>
                </div>
              </div>

              {/* Rules */}
              {group?.rules && group.rules.length > 0 && (
                <div className="bg-slate-800/30 rounded-lg p-4 max-w-xs">
                  <h3 className="font-bold text-white mb-3">Rules</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    {group?.rules?.map((rule, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span>•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Create Post Button */}
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="w-full mb-8 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Create New Post
          </button>

          {/* Post Creation Form */}
          {showPostForm && (
            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">Create Post</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="What's on your mind?"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 outline-none"
                    maxLength={300}
                  />
                  <p className="text-xs text-gray-500 mt-1">{newPost.title.length}/300</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share your thoughts with the group..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 outline-none min-h-40"
                    maxLength={5000}
                  />
                  <p className="text-xs text-gray-500 mt-1">{newPost.content.length}/5000</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCreatePost}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                  >
                    Post
                  </button>
                  <button
                    onClick={() => setShowPostForm(false)}
                    className="flex-1 px-6 py-3 bg-slate-800 text-gray-300 font-bold rounded-lg hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No posts yet. Be the first to share!</p>
                <button
                  onClick={() => setShowPostForm(true)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              posts?.map((post) => (
                <div
                  key={post?._id}
                  className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6 hover:border-purple-500/60 transition-all cursor-pointer"
                  onClick={() => navigate(`/story/${post?._id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{post?.title}</h3>
                      <p className="text-sm text-purple-300 mb-3">
                        By {post?.userId?.firstName} {post?.userId?.lastName}
                      </p>
                    </div>
                    {post?.isPinned && <span className="text-xs bg-yellow-600/30 text-yellow-300 px-3 py-1 rounded-full">📌 Pinned</span>}
                  </div>

                  <p className="text-gray-300 mb-4 line-clamp-2">{post?.content}</p>

                  <div className="flex gap-4 text-sm text-gray-400">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpvotePost(post?._id);
                      }}
                      className="flex items-center gap-2 hover:text-purple-400 transition"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {post?.upvotes || 0} upvotes
                    </button>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {post?.commentCount || 0} comments
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {post?.views || 0} views
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default GroupDetailPage;
