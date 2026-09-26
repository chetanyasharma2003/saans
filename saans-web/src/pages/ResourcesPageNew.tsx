import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Book, AlertCircle, Loader, Heart, Share2, ChevronRight } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function ResourcesPageNew() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/resources/all-guides`);
      setResources(response.data.data || []);
      if (response.data.data?.length > 0) {
        setSelectedResource(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query) {
      const filtered = (resources || []).filter(r =>
        r?.condition?.name?.toLowerCase().includes(query) || false
      );
      if (filtered.length > 0) {
        setSelectedResource(filtered[0]);
      }
    }
  };

  const filteredResources = (resources || []).filter(r =>
    r?.condition?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

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
        <DashboardHeader title="Resources" showBackButton={false} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search conditions..."
                className="w-full pl-12 pr-4 py-3 bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
              />
            </div>
          </div>

          {error && (
            <div className="mb-8 bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Conditions List */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl overflow-hidden">
                <div className="p-6 border-b border-purple-500/20">
                  <h3 className="text-lg font-bold text-white">Conditions</h3>
                </div>

                {loading ? (
                  <div className="p-8 flex justify-center">
                    <Loader className="w-6 h-6 animate-spin text-purple-400" />
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {filteredResources.map((resource) => (
                      <button
                        key={resource._id}
                        onClick={() => setSelectedResource(resource)}
                        className={`w-full p-4 text-left border-b border-purple-500/10 transition-all ${
                          selectedResource?._id === resource._id
                            ? 'bg-purple-600/30 text-white'
                            : 'text-purple-300 hover:bg-purple-600/10'
                        }`}
                      >
                        <p className="font-semibold">{resource.condition.name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {resource.symptoms.length} symptoms
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Selected Resource Details */}
            <div className="lg:col-span-2">
              {selectedResource ? (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                      {selectedResource.condition.name}
                    </h1>
                    <p className="text-purple-300 mb-4">
                      {selectedResource.condition.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-400 mb-6">
                      <span>👥 {selectedResource.condition.prevalence}</span>
                      <span>👁️ {selectedResource.views?.toLocaleString() || 0} views</span>
                      <span>💾 {selectedResource.saves?.toLocaleString() || 0} saved</span>
                    </div>

                    <button
                      onClick={() => navigate(`/resource/${selectedResource._id}`)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition"
                    >
                      View Full Guide →
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {['overview', 'symptoms', 'treatments', 'tips', 'crisis'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                          activeTab === tab
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800/50 text-purple-300 hover:bg-slate-800'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8 space-y-6">
                    {activeTab === 'overview' && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Overview</h3>
                        <p className="text-gray-300">{selectedResource.condition.description}</p>
                        <div className="bg-slate-800/30 p-4 rounded-lg">
                          <p className="text-sm text-purple-300">
                            <strong>Prevalence:</strong> {selectedResource.condition.prevalence}
                          </p>
                          <p className="text-sm text-purple-300 mt-2">
                            <strong>Severity:</strong> {selectedResource.condition.severity}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'symptoms' && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Common Symptoms</h3>
                        <div className="space-y-3">
                          {selectedResource.symptoms?.map((symptom, idx) => (
                            <div key={idx} className="bg-slate-800/30 p-4 rounded-lg">
                              <p className="font-semibold text-white">{symptom.name}</p>
                              <p className="text-sm text-gray-400 mt-1">{symptom.description}</p>
                              <span className="inline-block mt-2 text-xs px-2 py-1 bg-purple-600/20 text-purple-300 rounded">
                                {symptom.category}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'treatments' && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Treatment Options</h3>
                        <div className="space-y-4">
                          {selectedResource.treatments?.map((treatment, idx) => (
                            <div key={idx} className="bg-slate-800/30 p-4 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-white">{treatment.name}</p>
                                  <p className="text-sm text-gray-400">{treatment.type}</p>
                                </div>
                                <span className="text-green-400 font-bold">{treatment.effectiveness}%</span>
                              </div>
                              <p className="text-sm text-gray-300 mb-3">{treatment.description}</p>
                              <p className="text-xs text-purple-300">⏱️ {treatment.timeToEffect}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'tips' && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Self-Help Tips</h3>
                        <div className="space-y-4">
                          {selectedResource.selfHelpTips?.map((tip, idx) => (
                            <div key={idx} className="bg-slate-800/30 p-4 rounded-lg">
                              <p className="font-semibold text-white mb-2">{tip.title}</p>
                              <p className="text-sm text-gray-300 mb-3">{tip.description}</p>
                              <div className="text-xs text-purple-300">
                                ⏱️ {tip.duration} | 📊 {tip.difficulty}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'crisis' && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Crisis Resources</h3>
                        {selectedResource.crisisResources?.length > 0 ? (
                          <div className="space-y-3">
                            {selectedResource.crisisResources.map((resource, idx) => (
                              <div key={idx} className="bg-red-600/10 border border-red-500/30 p-4 rounded-lg">
                                <p className="font-semibold text-white">{resource.name}</p>
                                <p className="text-sm text-gray-300 mt-1">{resource.phone}</p>
                                <p className="text-xs text-gray-400 mt-2">🌍 {resource.country} • ⏰ {resource.availability}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400">No crisis resources specific to this condition.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center p-12">
                  <p className="text-gray-400">Select a condition to view details</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ResourcesPageNew;
