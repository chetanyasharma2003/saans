import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Users, Share2, Search, Plus, TrendingUp } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';

export function CommunityPageNew() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const posts = [
    { id: 1, author: 'Priya S.', avatar: '👩‍🦱', title: 'Anxiety management tips', likes: 342, comments: 89, time: '2h ago' },
    { id: 2, author: 'Rajesh K.', avatar: '👨‍💼', title: 'Therapy breakthrough story', likes: 521, comments: 156, time: '4h ago' },
    { id: 3, author: 'Meera P.', avatar: '👩', title: 'Self-care routine guide', likes: 287, comments: 42, time: '1d ago' },
  ];

  const groups = [
    { name: 'Anxiety Warriors', members: 1240, emoji: '💪' },
    { name: 'Mindfulness Circle', members: 856, emoji: '🧘' },
    { name: 'Depression Support', members: 2145, emoji: '💜' },
    { name: 'Wellness Journey', members: 634, emoji: '🌱' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
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

        <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12 max-w-5xl mx-auto">
          {/* Search & Create */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
              <input type="text" placeholder="Search posts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm sm:text-base" />
            </div>
            <button className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all hover:scale-105 flex items-center gap-2 text-sm sm:text-base">
              <Plus className="w-5 h-5" /> New Post
            </button>
          </div>

          {/* Posts */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Recent Posts</h2>
            {posts.map((post) => (
              <div key={post.id} className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl p-6 sm:p-8 hover:border-purple-500/60 transition-all backdrop-blur-xl group cursor-pointer">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="text-3xl">{post.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm sm:text-base">{post.author}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">{post.time}</p>
                  </div>
                </div>
                <h4 className="text-white font-bold text-sm sm:text-lg mb-4">{post.title}</h4>
                <div className="flex gap-4 sm:gap-6 text-gray-400 text-sm">
                  <button className="flex items-center gap-2 hover:text-red-400 transition-colors">
                    <Heart className="w-4 h-4" /> {post.likes}
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                    <MessageSquare className="w-4 h-4" /> {post.comments}
                  </button>
                  <button className="flex items-center gap-2 hover:text-purple-400 transition-colors ml-auto">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Support Groups */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Support Groups</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {groups.map((group) => (
                <button key={group.name} className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl p-6 sm:p-8 hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20 backdrop-blur-xl text-left group">
                  <div className="text-3xl sm:text-4xl mb-3">{group.emoji}</div>
                  <h3 className="text-white font-bold text-sm sm:text-lg mb-2">{group.name}</h3>
                  <p className="text-purple-300 text-xs sm:text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" /> {group.members} members
                  </p>
                  <button className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all text-xs sm:text-sm">
                    Join Group
                  </button>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CommunityPageNew;
