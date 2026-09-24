import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Share2 } from 'lucide-react';

export function StoriesPageNew() {
  const navigate = useNavigate();
  const stories = [
    { author: 'Priya S.', avatar: '👩‍🦱', title: 'From Anxiety to Confidence', excerpt: 'My journey with SAANS changed my life...', likes: 542, comments: 87 },
    { author: 'Rajesh K.', avatar: '👨‍💼', title: 'Depression Recovery Success', excerpt: 'I never thought I\'d feel this happy again...', likes: 631, comments: 112 },
    { author: 'Meera P.', avatar: '👩', title: 'Healing Through Community', excerpt: 'Finding my tribe made all the difference...', likes: 423, comments: 64 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-purple-500/20">
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6">
            <button onClick={() => navigate('/dashboard')} className="text-purple-400 text-sm sm:text-base mb-4">← Back</button>
            <h1 className="text-2xl sm:text-4xl font-bold text-white">Inspiring Stories</h1>
          </div>
        </header>

        <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 max-w-3xl mx-auto">
          {stories.map((story, idx) => (
            <button key={idx} className="w-full text-left bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl p-6 sm:p-8 hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20 backdrop-blur-xl group">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{story.avatar}</div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm sm:text-base">{story.author}</h3>
                  <h2 className="text-white font-bold text-lg sm:text-2xl mt-2">{story.title}</h2>
                </div>
              </div>
              <p className="text-gray-300 text-sm sm:text-base mb-4 line-clamp-2">{story.excerpt}</p>
              <div className="flex gap-4 text-gray-400 text-sm">
                <button className="flex items-center gap-2 hover:text-red-400 transition-colors">
                  <Heart className="w-4 h-4" /> {story.likes}
                </button>
                <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                  <MessageSquare className="w-4 h-4" /> {story.comments}
                </button>
                <button className="flex items-center gap-2 hover:text-purple-400 transition-colors ml-auto">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </button>
          ))}
        </main>
      </div>
    </div>
  );
}

export default StoriesPageNew;
