import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface PatientStoryProps {
  id: string;
  title: string;
  content: string;
  condition: string;
  authorName: string;
  authorImage?: string;
  startDate: Date;
  recoveryDate?: Date;
  likes: number;
  comments: number;
  videoUrl?: string;
  photoUrl?: string;
  milestones: Array<{
    date: Date;
    description: string;
    sentiment: number;
  }>;
  onLike?: (storyId: string) => void;
  onComment?: (storyId: string) => void;
  onClick?: (storyId: string) => void;
}

export const PatientStory: React.FC<PatientStoryProps> = ({
  id,
  title,
  content,
  condition,
  authorName,
  authorImage,
  startDate,
  recoveryDate,
  likes,
  comments,
  videoUrl,
  photoUrl,
  milestones,
  onLike,
  onComment,
  onClick,
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(id);
  };

  const journeyDays = recoveryDate
    ? Math.floor(
        (recoveryDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div
      onClick={() => onClick?.(id)}
      className="rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderLeft: '4px solid var(--color-accent)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {authorImage ? (
            <img
              src={authorImage}
              alt={authorName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
              style={{
                backgroundColor: 'var(--color-accent-lighter)',
                color: 'var(--color-primary)',
              }}
            >
              {authorName.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {authorName}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Shared {formatDistanceToNow(startDate, { addSuffix: true })}
            </p>
          </div>
        </div>

        <span
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: 'var(--color-secondary-lighter)',
            color: 'var(--color-primary)',
          }}
        >
          {condition}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h3>

      {/* Journey Stats */}
      {journeyDays !== null && (
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-lighter)' }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
              {journeyDays} days of recovery journey
            </span>
          </div>
        </div>
      )}

      {/* Content Preview */}
      <p
        className="text-sm mb-4 line-clamp-3"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {content}
      </p>

      {/* Video/Photo Thumbnail */}
      {(videoUrl || photoUrl) && (
        <div className="mb-4 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Story"
              className="w-full h-40 object-cover"
            />
          )}
          {videoUrl && !photoUrl && (
            <div className="w-full h-40 flex items-center justify-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <span className="text-white text-xl">▶</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Milestones Timeline */}
      {milestones && milestones.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            KEY MILESTONES
          </p>
          <div className="space-y-1">
            {milestones.slice(0, 3).map((milestone, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs py-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <Calendar className="w-3 h-3" />
                <span>{milestone.description}</span>
                {milestone.sentiment > 0 && (
                  <span style={{ color: 'var(--color-success)' }}>📈</span>
                )}
              </div>
            ))}
            {milestones.length > 3 && (
              <p className="text-xs italic" style={{ color: 'var(--color-text-tertiary)' }}>
                +{milestones.length - 3} more milestones
              </p>
            )}
          </div>
        </div>
      )}

      {/* Engagement Stats */}
      <div
        className="flex items-center justify-between pt-4 border-t"
        style={{ borderColor: 'var(--color-gray-200)' }}
      >
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-sm font-semibold transition-all"
          style={{ color: isLiked ? 'var(--color-error)' : 'var(--color-text-secondary)' }}
        >
          <Heart
            className="w-4 h-4"
            style={{
              fill: isLiked ? 'var(--color-error)' : 'none',
            }}
          />
          {likes} Likes
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onComment?.(id);
          }}
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <MessageCircle className="w-4 h-4" />
          {comments} Comments
        </button>

        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
};
