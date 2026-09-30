import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { Search, BookOpen, Music, Zap, Brain, AlertCircle, Loader, Heart } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  conditions: string[];
  tags: string[];
  difficulty: string;
  duration: number;
  author: string;
  rating: number;
  helpfulCount: number;
}

export function ResourcesPageNew() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const categories = [
    { id: 'all', label: 'All', icon: '📚' },
    { id: 'guide', label: 'Guides', icon: '📖' },
    { id: 'article', label: 'Articles', icon: '📰' },
    { id: 'meditation', label: 'Meditation', icon: '🧘' },
    { id: 'exercise', label: 'Exercises', icon: '💪' },
    { id: 'technique', label: 'Techniques', icon: '✨' },
  ];

  const conditions = [
    'all', 'anxiety', 'depression', 'ptsd', 'stress', 'insomnia',
    'relationships', 'crisis', 'self-esteem'
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'guide': return <BookOpen className="w-5 h-5" />;
      case 'meditation': return <Music className="w-5 h-5" />;
      case 'exercise': return <Zap className="w-5 h-5" />;
      case 'technique': return <Brain className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, selectedCondition]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedCondition !== 'all') params.append('condition', selectedCondition);

      const response = await axios.get(
        `${API_URL}/api/resources?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResources(response.data.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        <DashboardHeader title="Resources" showBackButton={false} />

        <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 space-y-8 max-w-6xl mx-auto">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-purple-400/30 text-white rounded-lg pl-12 pr-4 py-3 focus:border-purple-400/50 focus:outline-none placeholder-gray-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/50 text-gray-300 hover:bg-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Condition Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {conditions.map(cond => (
              <button
                key={cond}
                onClick={() => setSelectedCondition(cond)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCondition === cond
                    ? 'bg-pink-600 text-white'
                    : 'bg-slate-800/50 text-gray-300 hover:bg-slate-800'
                }`}
              >
                {cond.charAt(0).toUpperCase() + cond.slice(1)}
              </button>
            ))}
          </div>

          {/* Resources Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No resources found. Try different filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map(resource => (
                <div
                  key={resource.id}
                  onClick={() => setSelectedResource(resource)}
                  className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-3 py-1 bg-purple-600/40 text-purple-200 rounded-full text-xs font-medium capitalize">
                      {resource.category}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <span>⭐</span>
                      <span className="text-sm font-bold">{resource.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                    {resource.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {resource.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.conditions.map(cond => (
                      <span key={cond} className="text-xs px-2 py-1 bg-slate-700/50 text-gray-300 rounded capitalize">
                        {cond}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>{resource.duration}min</span>
                      <span>•</span>
                      <span className="capitalize">{resource.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{resource.helpfulCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 border border-purple-400/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 sticky top-0">
              <button
                onClick={() => setSelectedResource(null)}
                className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-lg transition-all"
              >
                ✕
              </button>
              <div className="flex items-center gap-3 mb-2">
                {getCategoryIcon(selectedResource.category)}
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium capitalize">
                  {selectedResource.category}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white">{selectedResource.title}</h2>
              <p className="text-white/80 text-sm mt-2">By {selectedResource.author}</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">⭐ {selectedResource.rating}</div>
                    <p className="text-gray-400 text-sm">{selectedResource.helpfulCount} found helpful</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-300"><strong>Duration:</strong> {selectedResource.duration} minutes</p>
                    <p className="text-gray-300"><strong>Difficulty:</strong> <span className="capitalize">{selectedResource.difficulty}</span></p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                <p className="text-gray-300 leading-7">{selectedResource.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">For Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedResource.conditions.map(cond => (
                    <span key={cond} className="px-4 py-2 bg-purple-600/30 border border-purple-400/50 text-purple-200 rounded-full capitalize">
                      {cond}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('accessToken');
                    await axios.post(
                      `${API_URL}/api/resources/${selectedResource.id}/helpful`,
                      {},
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setSelectedResource(prev => prev ? { ...prev, helpfulCount: prev.helpfulCount + 1 } : null);
                  } catch (err) {
                    console.error('Error marking as helpful:', err);
                  }
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all text-lg flex items-center justify-center gap-2"
              >
                <Heart className="w-6 h-6" />
                Mark as Helpful
              </button>

              <p className="text-center text-gray-400 text-sm">Resource type: {selectedResource.type}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourcesPageNew;
