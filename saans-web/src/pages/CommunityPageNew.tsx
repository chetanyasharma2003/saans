import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Search, Plus, AlertCircle, Loader, Users } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';
import { StoryDetailModal } from '../components/Community/StoryDetailModal';
import { GroupDetailModal } from '../components/Community/GroupDetailModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Story {
  id: string;
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
  id: string;
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
  const [activeTab, setActiveTab] = useState<'stories' | 'groups'>('stories');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

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
  ];

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      // Fetch stories
      const storiesRes = await axios.get(
        `${API_URL}/api/stories/feed?category=${selectedCategory}&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch groups (only once)
      let groupsRes = { data: { data: [] } };
      if (selectedCategory === 'all') {
        groupsRes = await axios.get(`${API_URL}/api/groups`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setStories(storiesRes.data.data || []);
      if (selectedCategory === 'all') {
        setGroups(groupsRes.data.data || []);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching community data:', err);
      setError('Could not load community data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        <DashboardHeader title="Community" showBackButton={false} />

        <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12 max-w-6xl mx-auto">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Tab Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('stories')}
              className={`px-6 sm:px-8 py-3 sm:py-4 font-bold rounded-xl sm:rounded-2xl transition-all ${
                activeTab === 'stories'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800'
              }`}
            >
              📖 Real Stories
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-6 sm:px-8 py-3 sm:py-4 font-bold rounded-xl sm:rounded-2xl transition-all ${
                activeTab === 'groups'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800'
              }`}
            >
              👥 Groups
            </button>
          </div>

          {/* Share Your Story Button */}
          <button className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-lg">
            <Plus className="w-6 h-6" /> Share Your Story
          </button>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/50 text-gray-300 hover:bg-slate-800'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <>
              {/* Stories Tab */}
              {activeTab === 'stories' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                    Real Stories ({stories.length})
                  </h2>
                  {stories.length === 0 ? (
                    <p className="text-gray-400 text-center py-12">
                      No stories yet in this category. Be the first to share! 💜
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {stories.map(story => (
                        <div
                          key={story.id}
                          onClick={() => setSelectedStory(story)}
                          className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/60 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <span className="px-3 py-1 bg-purple-600/40 text-purple-200 rounded-full text-xs font-medium capitalize">
                              {story.category}
                            </span>
                            <span className="text-2xl">📖</span>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-300 transition-colors line-clamp-2">
                            {story.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                            {story.content}
                          </p>
                          <div className="flex items-center justify-between text-gray-400 text-sm">
                            <span>{story.authorName}</span>
                            <div className="flex gap-4">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {story.views}
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {story.upvotes}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Groups Tab */}
              {activeTab === 'groups' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                    Support Groups ({groups.length})
                  </h2>
                  {groups.length === 0 ? (
                    <p className="text-gray-400 text-center py-12">
                      No groups available yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {groups.map(group => (
                        <div
                          key={group.id}
                          onClick={() => setSelectedGroup(group)}
                          className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/60 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <span className="px-3 py-1 bg-purple-600/40 text-purple-200 rounded-full text-xs font-medium capitalize">
                              {group.category}
                            </span>
                            <span className="text-3xl">{group.icon}</span>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                            {group.name}
                          </h3>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {group.description}
                          </p>
                          <div className="flex items-center justify-between text-gray-400 text-sm">
                            <div className="flex gap-4">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {group.memberCount.toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                {group.postCount}
                              </div>
                            </div>
                          </div>
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

      {/* Modals */}
      <StoryDetailModal
        isOpen={!!selectedStory}
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
        onExploreGroups={() => {
          setSelectedStory(null);
          setActiveTab('groups');
        }}
      />
      <GroupDetailModal
        isOpen={!!selectedGroup}
        group={selectedGroup}
        onClose={() => setSelectedGroup(null)}
      />
    </div>
  );
}

export default CommunityPageNew;
