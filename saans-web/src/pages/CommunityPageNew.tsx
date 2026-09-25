import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Search, Plus, TrendingUp, AlertCircle, Loader, Users, ThumbsUp, Eye } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Story {
  _id: string;
  title: string;
  content: string;
  authorName: string;
  category: string;
  upvotes: number;
  helpful: number;
  views: number;
  createdAt: string;
}

interface Group {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  memberCount: number;
  postCount: number;
}

export function CommunityPageNew() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [activeTab, setActiveTab] = useState<'stories' | 'groups'>('stories');
  const [newStory, setNewStory] = useState({
    title: '',
    content: '',
    category: 'depression',
    isAnonymous: true
  });

  const categories = [
    'all',
    'anxiety',
    'depression',
    'ptsd',
    'trauma',
    'relationships',
    'work',
    'grief',
    'addiction',
    'sleep',
    'eating-disorders',
    'self-esteem',
    'career'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      // Fetch stories
      const storiesRes = await axios.get(`${API_URL}/api/stories/feed?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: { data: [] } }));

      // Fetch groups
      const groupsRes = await axios.get(`${API_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: { data: [] } }));

      setStories(storiesRes.data.data || []);
      setGroups(groupsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching community data:', err);
      setError('Could not load community data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async () => {
    if (!newStory.title.trim() || !newStory.content.trim()) {
      setError('Title and content required');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/api/stories`,
        newStory,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setError(null);
      setNewStory({ title: '', content: '', category: 'depression', isAnonymous: true });
      setShowCreateStory(false);
      alert('Story submitted! It will appear after moderation.');
      fetchData();
    } catch (err) {
      console.error('Error creating story:', err);
      setError('Failed to submit story');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/api/groups/${groupId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Joined group!');
      fetchData();
    } catch (err) {
      console.error('Error joining group:', err);
    }
  };

  const filteredStories = selectedCategory === 'all'
    ? stories
    : stories.filter(s => s.category === selectedCategory);

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
      `}</style>

      <div className="relative z-10">
        <DashboardHeader title="Community" showBackButton={false} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('stories')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'stories'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/50 text-purple-300 hover:bg-slate-800'
              }`}
            >
              📖 Real Stories
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'groups'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/50 text-purple-300 hover:bg-slate-800'
              }`}
            >
              👥 Groups
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <>
              {/* STORIES TAB */}
              {activeTab === 'stories' && (
                <div>
                  {/* Share Your Story Button */}
                  <button
                    onClick={() => setShowCreateStory(!showCreateStory)}
                    className="mb-8 w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Share Your Story
                  </button>

                  {/* Create Story Form */}
                  {showCreateStory && (
                    <div className="mb-8 bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                      <h3 className="text-2xl font-bold text-white mb-4">Share Your Story</h3>
                      <p className="text-purple-300 mb-6">Help others by sharing your mental health journey (anonymously if you prefer)</p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Title *</label>
                          <input
                            type="text"
                            placeholder="e.g., How I Overcame My Anxiety"
                            value={newStory.title}
                            onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 outline-none"
                            maxLength={200}
                          />
                          <p className="text-xs text-gray-500 mt-1">{newStory.title.length}/200</p>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Your Story *</label>
                          <textarea
                            placeholder="Share your experience, what helped you, lessons learned..."
                            value={newStory.content}
                            onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 outline-none min-h-40"
                            maxLength={5000}
                          />
                          <p className="text-xs text-gray-500 mt-1">{newStory.content.length}/5000</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Category *</label>
                            <select
                              value={newStory.category}
                              onChange={(e) => setNewStory({ ...newStory, category: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                            >
                              {categories.slice(1).map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Privacy</label>
                            <button
                              onClick={() => setNewStory({ ...newStory, isAnonymous: !newStory.isAnonymous })}
                              className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                                newStory.isAnonymous
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-slate-800 text-purple-300 border border-slate-700'
                              }`}
                            >
                              {newStory.isAnonymous ? '🔒 Anonymous' : '👤 Named'}
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleCreateStory}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                          >
                            Share Story
                          </button>
                          <button
                            onClick={() => setShowCreateStory(false)}
                            className="flex-1 px-6 py-3 bg-slate-800 text-gray-300 font-bold rounded-lg hover:bg-slate-700 transition-all"
                          >
                            Cancel
                          </button>
                        </div>

                        <p className="text-xs text-gray-500 pt-2">✨ Stories are moderated for safety. You'll see it live after approval!</p>
                      </div>
                    </div>
                  )}

                  {/* Category Filter */}
                  <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
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
                        {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                      </button>
                    ))}
                  </div>

                  {/* Stories Feed */}
                  {filteredStories.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No stories yet in this category. Be the first to share! 💙</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredStories.map((story) => (
                        <div
                          key={story._id}
                          className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8 hover:border-purple-500/60 transition-all cursor-pointer"
                          onClick={() => {/* Could navigate to story detail */}}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-2">{story.title}</h3>
                              <p className="text-sm text-purple-300">
                                By {story.authorName} • {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
                              </p>
                            </div>
                            <span className="text-xs bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full">
                              {new Date(story.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-gray-300 mb-6 line-clamp-3">{story.content}</p>

                          <div className="flex gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-2 hover:text-purple-400">
                              <ThumbsUp className="w-4 h-4" />
                              {story.upvotes} upvotes
                            </div>
                            <div className="flex items-center gap-2 hover:text-purple-400">
                              <Heart className="w-4 h-4" />
                              {story.helpful} found helpful
                            </div>
                            <div className="flex items-center gap-2 hover:text-purple-400">
                              <Eye className="w-4 h-4" />
                              {story.views} views
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* GROUPS TAB */}
              {activeTab === 'groups' && (
                <div>
                  <p className="text-gray-400 mb-8">Join a community group. Support each other. Grow together.</p>

                  {groups.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No groups available yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groups.map((group) => (
                        <div
                          key={group._id}
                          className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-6 hover:border-purple-500/60 transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="text-4xl">{group.icon}</div>
                            <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded-full">
                              {group.category}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-white mb-2">{group.name}</h3>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{group.description}</p>

                          <div className="flex gap-4 text-sm text-gray-400 mb-4">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {group.memberCount} members
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {group.postCount} posts
                            </div>
                          </div>

                          <button
                            onClick={() => handleJoinGroup(group._id)}
                            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                          >
                            Join Group →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default CommunityPageNew;
