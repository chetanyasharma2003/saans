import React from 'react';
import { X, Heart, ThumbsUp, Eye, Share2, MessageCircle } from 'lucide-react';

interface StoryDetailModalProps {
  isOpen: boolean;
  story: any;
  onClose: () => void;
}

export function StoryDetailModal({ isOpen, story, onClose }: StoryDetailModalProps) {
  if (!isOpen || !story) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 border border-purple-400/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-purple-900/50 backdrop-blur border-b border-purple-400/20 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{story.title}</h2>
            <p className="text-purple-300 text-sm mt-1">
              {story.authorName} • {new Date(story.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Category Badge */}
          <div className="inline-block">
            <span className="px-4 py-2 bg-purple-600/40 border border-purple-400/50 text-purple-200 rounded-full text-sm font-medium capitalize">
              {story.category}
            </span>
          </div>

          {/* Story Content */}
          <div className="mt-8 space-y-6">
            <p className="text-gray-200 leading-8 text-lg whitespace-pre-wrap">
              {story.content}
            </p>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-4 gap-4 py-6 border-t border-b border-purple-400/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{story.views}</div>
              <p className="text-gray-400 text-sm flex items-center justify-center gap-2 mt-1">
                <Eye className="w-4 h-4" /> Views
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">{story.upvotes}</div>
              <p className="text-gray-400 text-sm flex items-center justify-center gap-2 mt-1">
                <Heart className="w-4 h-4" /> Likes
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{story.helpful}</div>
              <p className="text-gray-400 text-sm flex items-center justify-center gap-2 mt-1">
                <ThumbsUp className="w-4 h-4" /> Helpful
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">0</div>
              <p className="text-gray-400 text-sm flex items-center justify-center gap-2 mt-1">
                <MessageCircle className="w-4 h-4" /> Comments
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button className="flex-1 px-4 py-3 bg-pink-600/20 border border-pink-500/50 hover:bg-pink-600/30 text-pink-300 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
              <Heart className="w-5 h-5" /> Like This Story
            </button>
            <button className="flex-1 px-4 py-3 bg-green-600/20 border border-green-500/50 hover:bg-green-600/30 text-green-300 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
              <ThumbsUp className="w-5 h-5" /> Found Helpful
            </button>
            <button className="flex-1 px-4 py-3 bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/30 text-blue-300 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" /> Share
            </button>
          </div>

          {/* Related Resources */}
          <div className="mt-8 p-6 bg-purple-600/20 border border-purple-400/20 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-3">Want to find support?</h3>
            <p className="text-gray-300 mb-4">Join our {story.category} support group to connect with others on similar journeys.</p>
            <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all">
              Explore Support Groups
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryDetailModal;
