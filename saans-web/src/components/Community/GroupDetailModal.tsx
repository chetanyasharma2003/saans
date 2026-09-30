import React, { useState } from 'react';
import { X, Users, MessageSquare, Heart } from 'lucide-react';

interface GroupDetailModalProps {
  isOpen: boolean;
  group: any;
  onClose: () => void;
}

export function GroupDetailModal({ isOpen, group, onClose }: GroupDetailModalProps) {
  const [isJoined, setIsJoined] = useState(false);

  if (!isOpen || !group) return null;

  const handleJoin = () => {
    setIsJoined(!isJoined);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 border border-purple-400/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header with Icon */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="text-6xl mb-4">{group.icon}</div>
          <h2 className="text-3xl font-bold text-white">{group.name}</h2>
          <p className="text-white/80 text-sm mt-2">Category: {group.category}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">About This Group</h3>
            <p className="text-gray-300 leading-7 text-base">
              {group.description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-600/20 border border-purple-400/30 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-400" />
                <div>
                  <p className="text-gray-400 text-sm">Members</p>
                  <p className="text-2xl font-bold text-white">{group.memberCount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-pink-600/20 border border-pink-400/30 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-pink-400" />
                <div>
                  <p className="text-gray-400 text-sm">Posts</p>
                  <p className="text-2xl font-bold text-white">{group.postCount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">What You Can Do Here</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Share Your Story</p>
                  <p className="text-gray-400 text-sm">Share your experiences with the community</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Connect with Others</p>
                  <p className="text-gray-400 text-sm">Meet people on similar journeys</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Get Support</p>
                  <p className="text-gray-400 text-sm">Receive encouragement and advice</p>
                </div>
              </div>
            </div>
          </div>

          {/* Join Button */}
          <button
            onClick={handleJoin}
            className={`w-full px-6 py-4 font-bold rounded-xl transition-all text-lg ${
              isJoined
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
            }`}
          >
            {isJoined ? '✓ Joined This Group' : 'Join This Group'}
          </button>

          {/* Disclaimer */}
          <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm leading-6">
              💙 <strong>Safe Space:</strong> We're committed to keeping this a welcoming, respectful community. All members agree to follow our community guidelines and be supportive of one another.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupDetailModal;
