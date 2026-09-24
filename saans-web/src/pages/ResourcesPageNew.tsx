import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, Download, Search, Star } from 'lucide-react';

export function ResourcesPageNew() {
  const navigate = useNavigate();
  const resources = [
    { title: 'Anxiety Management Guide', type: 'Article', duration: '10 min read', rating: 4.9 },
    { title: 'Meditation for Beginners', type: 'Video', duration: '8:30', rating: 4.8 },
    { title: 'Sleep Better Tonight', type: 'Guide', duration: 'PDF', rating: 5.0 },
    { title: 'Stress Relief Exercises', type: 'Video', duration: '15:20', rating: 4.7 },
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
            <h1 className="text-2xl sm:text-4xl font-bold text-white">Wellness Resources</h1>
          </div>
        </header>

        <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 space-y-8 max-w-5xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
            <input type="text" placeholder="Search resources..." className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 text-sm sm:text-base" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {resources.map((res, idx) => (
              <button key={idx} className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl p-6 sm:p-8 hover:border-purple-500/60 transition-all text-left group">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl sm:text-4xl">{res.type === 'Video' ? '▶️' : res.type === 'Guide' ? '📄' : '📖'}</div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-bold">{res.rating}</span>
                  </div>
                </div>
                <h3 className="text-white font-bold text-sm sm:text-base mb-2">{res.title}</h3>
                <div className="flex gap-2 text-gray-400 text-xs sm:text-sm">
                  <span className="bg-purple-600/50 px-2 py-1 rounded">{res.type}</span>
                  <span className="bg-slate-700/50 px-2 py-1 rounded">{res.duration}</span>
                </div>
                <button className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all text-sm">
                  {res.type === 'Video' ? '▶️ Watch' : '📥 Download'}
                </button>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ResourcesPageNew;
