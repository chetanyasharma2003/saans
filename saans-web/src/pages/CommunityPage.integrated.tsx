/**
 * Community Page - API INTEGRATED
 * Browse support groups and community posts
 */

import React, { useState } from 'react';
import {
  Button,
  Card,
  H1,
  H2,
  Body,
  Badge,
  Typography,
} from '../design-system';
import {
  useCommunityPosts,
  useSupportGroups,
  useCreatePost,
  useLikePost,
  useJoinGroup,
  type CommunityPost,
  type SupportGroup,
} from '../hooks';
import { CommunityPostSkeleton, GridSkeleton, ListSkeleton } from '../components/SkeletonLoaders';

/**
 * Create Post Form
 */
function CreatePostForm({
  onPost,
  isLoading,
}: {
  onPost: (data: any) => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (title && content) {
      onPost({
        title,
        content,
        category: 'general',
        tags: [],
      });
      setTitle('');
      setContent('');
    }
  };

  return (
    <Card variant="elevated" padding="lg" className="mb-8">
      <H2 className="mb-4">Share Your Story</H2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Your Story</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience, thoughts, or advice..."
            rows={4}
            className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleSubmit}
            isLoading={isLoading}
            isDisabled={!title || !content}
          >
            Post
          </Button>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => {
              setTitle('');
              setContent('');
            }}
          >
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * Community Post Component
 */
function PostComponent({ post, onLike }: { post: CommunityPost; onLike: () => void }) {
  return (
    <Card variant="outlined" padding="lg">
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Typography variant="h4" className="font-semibold">
              {post.title}
            </Typography>
            <Typography variant="labelSm" color="secondary">
              {formatTime(post.timestamp)}
            </Typography>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">👤</span>
            <Typography variant="bodySm" color="secondary">
              {post.author}
            </Typography>
            {post.category && (
              <Badge variant="info" size="sm">
                {post.category}
              </Badge>
            )}
          </div>
        </div>

        <Typography variant="bodyMd">{post.content}</Typography>

        {post.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap pt-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="neutral" size="sm">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-4 pt-3 border-t border-neutral-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
          >
            {post.liked ? '❤️' : '🤍'} {post.likes}
          </Button>
          <Button variant="ghost" size="sm">
            💬 {post.comments}
          </Button>
          <Button variant="ghost" size="sm">
            📤 Share
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * Support Group Card
 */
function GroupCard({ group, onJoin }: { group: SupportGroup; onJoin: () => void }) {
  return (
    <Card variant="outlined" padding="lg" hoverable>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <H3 className="font-semibold">{group.name}</H3>
            <Typography variant="bodySm" color="secondary">
              {group.category}
            </Typography>
          </div>
          {group.joined && (
            <Badge variant="success" size="sm">
              Joined
            </Badge>
          )}
        </div>

        <Typography variant="bodyMd" color="secondary">
          {group.description}
        </Typography>

        <div className="text-sm text-neutral-600">
          <div>👥 {group.members} members</div>
          <div>💬 Active {group.lastActivity}</div>
        </div>

        <Button
          variant={group.joined ? 'secondary' : 'primary'}
          size="md"
          fullWidth
          onClick={onJoin}
        >
          {group.joined ? 'View Group' : 'Join Group'}
        </Button>
      </div>
    </Card>
  );
}

/**
 * Main Page
 */
export function CommunityPageIntegrated() {
  const [activeTab, setActiveTab] = useState<'posts' | 'groups'>('posts');

  // API Queries
  const { data: posts, isLoading: postsLoading, error: postsError } = useCommunityPosts();
  const { data: groups, isLoading: groupsLoading } = useSupportGroups();
  const { mutate: createPost, isPending: postPending } = useCreatePost();
  const { mutate: likePost } = useLikePost();
  const { mutate: joinGroup } = useJoinGroup();

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <H1 className="mb-2">Community</H1>
          <Body color="secondary">
            Connect with others, share experiences, and find support groups
          </Body>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === 'posts' ? 'primary' : 'secondary'}
            size="md"
            onClick={() => setActiveTab('posts')}
          >
            Community Posts
          </Button>
          <Button
            variant={activeTab === 'groups' ? 'primary' : 'secondary'}
            size="md"
            onClick={() => setActiveTab('groups')}
          >
            Support Groups
          </Button>
        </div>

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <CreatePostForm onPost={createPost} isLoading={postPending} />

            {postsError ? (
              <Card
                variant="outlined"
                padding="lg"
                className="border-l-4 border-l-error-500"
              >
                <Typography variant="bodyMd" color="error">
                  ❌ Error loading posts
                </Typography>
              </Card>
            ) : postsLoading ? (
              <ListSkeleton count={5} />
            ) : posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostComponent
                    key={post.id}
                    post={post}
                    onLike={() => likePost(post.id)}
                  />
                ))}
              </div>
            ) : (
              <Card variant="flat" padding="lg" className="text-center py-8">
                <Body color="secondary">No posts yet. Be the first to share!</Body>
              </Card>
            )}
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div>
            {groupsLoading ? (
              <GridSkeleton count={6} />
            ) : groups && groups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onJoin={() => joinGroup(group.id)}
                  />
                ))}
              </div>
            ) : (
              <Card variant="flat" padding="lg" className="text-center py-8">
                <Body color="secondary">No support groups available</Body>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Helper Functions
 */
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

interface H3Props {
  className?: string;
  children: React.ReactNode;
}

function H3({ className = '', children }: H3Props) {
  return <Typography as="h3" variant="h3" className={className}>{children}</Typography>;
}

export default CommunityPageIntegrated;
