import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/colors-genuine.css';

interface Story {
  id: string;
  title: string;
  condition: string;
  content: string;
  startDate: string;
  recoveryDate?: string;
  likes: number;
  photoUrl?: string;
  user?: { name: string };
}

const StoriesPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const conditions = ['All', 'Anxiety', 'Depression', 'OCD', 'ADHD', 'Bipolar', 'PTSD', 'Eating Disorder'];

  useEffect(() => {
    fetchStories();
  }, [selectedCondition]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      let url = '/api/community/stories';
      if (selectedCondition !== 'All') {
        url += `?condition=${selectedCondition}`;
      }
      // Note: This would need a proper stories endpoint
      // For now, we'll use sample data structure
      setStories([
        {
          id: '1',
          title: 'How I Overcame My Panic Attacks',
          condition: 'Anxiety',
          content: 'My journey started when I was 23, fresh out of college. I thought I was dying...',
          startDate: '2020-01-15',
          recoveryDate: '2023-06-20',
          likes: 245,
          user: { name: 'Priya M.' },
        },
        {
          id: '2',
          title: 'Living with Depression: My Recovery Story',
          condition: 'Depression',
          content: 'It took me years to understand that depression is not a personal failure...',
          startDate: '2019-03-10',
          recoveryDate: '2023-12-01',
          likes: 189,
          user: { name: 'Raj K.' },
        },
        {
          id: '3',
          title: 'Breaking Free from Social Anxiety',
          condition: 'Anxiety',
          content: 'I used to cancel plans last minute because my anxiety was controlling me...',
          startDate: '2021-05-22',
          recoveryDate: '2024-02-14',
          likes: 312,
          user: { name: 'Aisha P.' },
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
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
            Recovery Stories
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Real people sharing their journeys of healing and hope
          </p>
        </div>

        {/* Share Your Story Button */}
        <div className="mb-8">
          <button
            className="px-6 py-3 rounded-lg text-white font-bold transition transform hover:scale-105"
            style={{
              backgroundColor: 'var(--primary-color)',
            }}
          >
            ✍️ Share Your Story
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Condition Filter */}
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--primary-color)' }}>
                Filter by Condition
              </h3>
              <div className="flex flex-wrap gap-2">
                {conditions.map((condition) => (
                  <button
                    key={condition}
                    onClick={() => setSelectedCondition(condition)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      selectedCondition === condition ? 'text-white' : 'bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: selectedCondition === condition ? 'var(--primary-color)' : undefined,
                    }}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--primary-color)' }}>
                Search Stories
              </h3>
              <input
                type="text"
                placeholder="Search by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="text-center">
            <p className="text-gray-600">Loading stories...</p>
          </div>
        ) : stories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories
              .filter((story) => story.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((story) => (
                <div
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                >
                  <div
                    className="h-2"
                    style={{ backgroundColor: 'var(--primary-color)' }}
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="px-3 py-1 rounded-full text-white text-xs font-semibold"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                      >
                        {story.condition}
                      </span>
                      <span className="text-red-500 font-semibold">❤️ {story.likes}</span>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{story.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{story.content}</p>

                    <div className="text-xs text-gray-500 mb-4">
                      <p>
                        Started: {new Date(story.startDate).toLocaleDateString()}
                        {story.recoveryDate && (
                          <> | Recovered: {new Date(story.recoveryDate).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>

                    <button className="w-full px-4 py-2 rounded-lg font-semibold text-white transition"
                      style={{
                        backgroundColor: 'var(--primary-color)',
                      }}
                    >
                      Read Full Story
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600">
              No stories found. Be the first to share yours!
            </p>
          </div>
        )}

        {/* Story Detail Modal */}
        {selectedStory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-8">
              <button
                onClick={() => setSelectedStory(null)}
                className="float-right text-2xl font-bold text-gray-500 hover:text-gray-700"
              >
                ×
              </button>

              <h2 className="text-3xl font-bold mb-4">{selectedStory.title}</h2>

              <div className="flex justify-between mb-6">
                <span
                  className="px-3 py-1 rounded text-white text-sm font-semibold"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  {selectedStory.condition}
                </span>
                <span className="text-red-500 font-semibold">❤️ {selectedStory.likes}</span>
              </div>

              <p className="text-gray-700 whitespace-pre-wrap mb-6">{selectedStory.content}</p>

              <div className="border-t pt-4">
                <button
                  className="w-full px-6 py-3 rounded-lg font-semibold text-white transition"
                  style={{
                    backgroundColor: 'var(--primary-color)',
                  }}
                >
                  Like This Story ❤️
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoriesPage;
