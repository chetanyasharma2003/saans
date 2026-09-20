import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/colors-genuine.css';

interface Resource {
  id: string;
  title: string;
  description: string;
  resourceType: string;
  category: string;
  estimatedTime?: number;
  rating?: number;
  authorName?: string;
}

const WellnessResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Anxiety');
  const [selectedType, setSelectedType] = useState('MEDITATION');
  const [loading, setLoading] = useState(true);

  const categories = ['Anxiety', 'Depression', 'Sleep', 'Mindfulness', 'Stress', 'Relationships', 'Work', 'Self-Care'];
  const resourceTypes = [
    { key: 'MEDITATION', label: 'Meditations' },
    { key: 'EXERCISE', label: 'Exercises' },
    { key: 'ARTICLE', label: 'Articles' },
    { key: 'PODCAST', label: 'Podcasts' },
    { key: 'BOOK', label: 'Books' },
  ];

  useEffect(() => {
    fetchResources();
  }, [selectedType, selectedCategory]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      let url = `/api/wellness/${selectedType.toLowerCase()}?category=${selectedCategory}`;
      if (selectedType === 'MEDITATION') {
        url = `/api/wellness/meditations?condition=${selectedCategory}`;
      }
      const response = await axios.get(url);
      setResources(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Wellness Resources
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Guided meditations, exercises, articles, and more to support your healing
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resource Type Filter */}
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--primary-color)' }}>
                Resource Type
              </h3>
              <div className="flex flex-wrap gap-2">
                {resourceTypes.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setSelectedType(type.key)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      selectedType === type.key ? 'text-white' : 'bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: selectedType === type.key ? 'var(--primary-color)' : undefined,
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--primary-color)' }}>
                Category
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      selectedCategory === cat ? 'text-white' : 'bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: selectedCategory === cat ? 'var(--primary-color)' : undefined,
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="text-center">
            <p className="text-gray-600">Loading resources...</p>
          </div>
        ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <div
                  className="h-2"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{resource.description}</p>

                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span
                      className="px-2 py-1 rounded text-white text-xs font-semibold"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                      {resource.category}
                    </span>
                    {resource.estimatedTime && (
                      <span className="text-gray-500">⏱️ {resource.estimatedTime} min</span>
                    )}
                  </div>

                  {resource.rating && (
                    <div className="mb-4">
                      <div className="flex items-center">
                        {'⭐'.repeat(Math.round(resource.rating))}
                        <span className="ml-2 text-sm text-gray-600">
                          {resource.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    className="w-full px-4 py-2 rounded-lg font-semibold text-white transition"
                    style={{
                      backgroundColor: 'var(--primary-color)',
                    }}
                  >
                    Start Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600">
              No resources found. Try different filters!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WellnessResourcesPage;
