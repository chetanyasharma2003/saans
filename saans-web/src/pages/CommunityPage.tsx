import React, { useState, useEffect, useRef, useCallback } from 'react';
import communityApi from '../services/communityApi';

interface Comment {
  id: string;
  author: string;
  authorId: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  userLiked?: boolean;
  replies?: Comment[];
}

interface Post {
  id: string;
  author: string;
  authorId: string;
  avatar?: string;
  category: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
  userLiked?: boolean;
  createdAt?: string;
}

interface SupportGroup {
  id: string;
  name: string;
  icon: string;
  description: string;
  members: number;
  joined: boolean;
  posts: number;
}

const AnimationStyles = () => (
  <style>{`
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes pulse-glow {
      0%, 100% {
        box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);
      }
      50% {
        box-shadow: 0 0 30px rgba(249, 115, 22, 0.5);
      }
    }

    .animate-slide-in-up {
      animation: slideInUp 0.6s ease-out;
    }

    .animate-fade-in-scale {
      animation: fadeInScale 0.4s ease-out;
    }

    .animate-pulse-glow {
      animation: pulse-glow 3s ease-in-out infinite;
    }

    .group-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .group-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transform: translateX(-100%);
      transition: transform 0.6s;
      pointer-events: none;
    }

    .group-card:hover::before {
      transform: translateX(100%);
    }

    .group-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
    }

    .post-card {
      animation: slideInUp 0.5s ease-out;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .post-card:hover {
      box-shadow: 0 15px 40px rgba(249, 115, 22, 0.15);
      border-color: rgba(249, 115, 22, 0.4);
    }

    .comment-card {
      transition: all 0.2s ease-out;
      animation: slideInUp 0.4s ease-out;
    }

    .comment-card:hover {
      background: rgba(255, 255, 255, 0.03);
      transform: translateX(4px);
    }

    .btn-interact {
      transition: all 0.2s ease-out;
      position: relative;
    }

    .btn-interact:hover {
      transform: scale(1.1);
    }

    .btn-interact:active {
      transform: scale(0.95);
    }

    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(236, 72, 153, 0.3));
      border-radius: 50%;
      font-size: 24px;
      border: 2px solid rgba(249, 115, 22, 0.3);
      animation: fadeInScale 0.3s ease-out;
    }

    .small-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(236, 72, 153, 0.2));
      border-radius: 50%;
      font-size: 18px;
      border: 1.5px solid rgba(249, 115, 22, 0.2);
    }

    .character-count {
      transition: color 0.2s;
    }

    .character-count.warning {
      color: #fbbf24;
    }

    .character-count.danger {
      color: #ef4444;
    }

    .gradient-text {
      background: linear-gradient(135deg, #f97316, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(249, 115, 22, 0.3);
      border-top-color: #f97316;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `}</style>
);

export function CommunityPage() {
  // State management
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Anxiety Support', 'Depression Warriors', 'Stress Management', 'Relationship Support', 'Self-Care Circle', 'Success Stories'];

  // Sample groups data for demo
  const sampleGroups: SupportGroup[] = [
    { id: '1', name: 'Anxiety Support', icon: '😰', description: 'Support for anxiety and panic attacks', members: 1234, joined: false, posts: 342 },
    { id: '2', name: 'Depression Warriors', icon: '💪', description: 'For those fighting depression together', members: 856, joined: false, posts: 218 },
    { id: '3', name: 'Stress Management', icon: '🧘', description: 'Learn stress relief techniques', members: 945, joined: false, posts: 267 },
    { id: '4', name: 'Relationship Support', icon: '💕', description: 'Navigate relationship challenges', members: 673, joined: false, posts: 189 },
    { id: '5', name: 'Self-Care Circle', icon: '🌺', description: 'Daily self-care tips and motivation', members: 1542, joined: false, posts: 456 },
    { id: '6', name: 'Success Stories', icon: '🌟', description: 'Share your recovery journey', members: 2103, joined: false, posts: 578 },
  ];

  // Load support groups
  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await communityApi.getGroups({ page: 1, limit: 100 });
      setSupportGroups(response.groups || sampleGroups);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load groups:', err);
      // Use sample data as fallback
      setSupportGroups(sampleGroups);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sample posts data
  const samplePosts: Post[] = [
    { id: '1', author: 'Priya S.', authorId: '1', avatar: '👩', category: 'Anxiety Support', title: 'Finally overcame my panic attacks!', content: 'After 3 months of therapy and breathing exercises, I had my first day without panic. It feels amazing! If anyone struggling, the key is consistency and self-compassion. 💜', likes: 342, comments: 28, timestamp: '2 hours ago', userLiked: false },
    { id: '2', author: 'Amit K.', authorId: '2', avatar: '👨', category: 'Depression Warriors', title: 'Starting my recovery journey', content: 'Day 1 of my mental health journey. Finally reached out to a therapist. This community gives me hope that recovery is possible. Thank you all for sharing your stories! 💪', likes: 215, comments: 45, timestamp: '4 hours ago', userLiked: false },
    { id: '3', author: 'Sneha M.', authorId: '3', avatar: '👩', category: 'Success Stories', title: '6 months depression-free!', content: 'Never thought I\'d see this day. 6 months without depressive episodes! Yoga, medication, and your support made all the difference. Gratitude to everyone here! 🌟', likes: 567, comments: 89, timestamp: '1 day ago', userLiked: false },
    { id: '4', author: 'Rahul P.', authorId: '4', avatar: '👨', category: 'Stress Management', title: 'Meditation changed my life', content: 'Started meditating 10 minutes daily. In 2 weeks, my stress levels dropped significantly. My sleep improved too! Sharing this simple technique that worked for me.', likes: 289, comments: 34, timestamp: '5 hours ago', userLiked: false },
    { id: '5', author: 'Divya R.', authorId: '5', avatar: '👩', category: 'Self-Care Circle', title: 'My daily self-care routine', content: 'Morning: Meditation (5min) → Journaling (10min) → Exercise (30min) → Healthy breakfast. This routine keeps me centered. What\'s your self-care ritual? 🧘‍♀️', likes: 423, comments: 52, timestamp: '6 hours ago', userLiked: false },
    { id: '6', author: 'Karan D.', authorId: '6', avatar: '👨', category: 'Relationship Support', title: 'Communication is key', content: 'Been struggling with partner communication. Started therapy together. It\'s not easy but we\'re getting better. If you\'re going through this, couple therapy really helps! 💕', likes: 198, comments: 23, timestamp: '8 hours ago', userLiked: false },
  ];

  // Load posts
  const loadPosts = useCallback(async (category: string, page: number = 1) => {
    setPostsLoading(true);
    try {
      const response: any = await communityApi.getAllPosts(
        category === 'All' ? undefined : category,
        { page, limit: 10 }
      );

      let postsToShow = response.posts || [];
      if (postsToShow.length === 0) {
        postsToShow = category === 'All' ? samplePosts : samplePosts.filter(p => p.category === category);
      }

      if (page === 1) {
        setPosts(postsToShow);
      } else {
        setPosts(prev => [...prev, ...postsToShow]);
      }

      setHasMore((response.page || 1) < (response.totalPages || 1));
      setCurrentPage(page);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      // Use sample posts as fallback
      const postsToShow = category === 'All' ? samplePosts : samplePosts.filter(p => p.category === category);
      if (page === 1) {
        setPosts(postsToShow);
      }
      setError(null);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadGroups();
    loadPosts(selectedCategory);
  }, []);

  // Reload posts when category changes
  useEffect(() => {
    loadPosts(selectedCategory, 1);
  }, [selectedCategory]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !postsLoading) {
          loadPosts(selectedCategory, currentPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, postsLoading, selectedCategory, currentPage, loadPosts]);

  // Handle post creation
  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;

    try {
      setLoading(true);
      // For now, create post in first available group the user joined
      const joinedGroup = supportGroups.find(g => g.joined);
      if (!joinedGroup) {
        setError('You must join a group to post');
        return;
      }

      const post: any = await communityApi.createPost(joinedGroup.id, {
        title: newPost.split('\n')[0].slice(0, 60),
        content: newPost,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });

      setPosts([post, ...posts]);
      setNewPost('');
      setError(null);
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (postId: string) => {
    if (!newComment[postId]?.trim()) return;

    try {
      setLoading(true);
      const comment: any = await communityApi.addComment(postId, {
        content: newComment[postId],
      });

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment],
      }));

      setNewComment({ ...newComment, [postId]: '' });

      // Update post comment count
      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, comments: p.comments + 1 } : p
        )
      );

      setError(null);
    } catch (err: any) {
      console.error('Failed to add comment:', err);
      setError(err.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  // Handle like toggle
  const toggleLike = async (postId: string) => {
    try {
      const result: any = await communityApi.togglePostLike(postId);

      setPosts(prev =>
        prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: result.liked ? post.likes + 1 : post.likes - 1,
              userLiked: result.liked,
            };
          }
          return post;
        })
      );

      setError(null);
    } catch (err: any) {
      console.error('Failed to toggle like:', err);
      setError(err.message || 'Failed to update like');
    }
  };

  // Handle group join/leave
  const toggleJoinGroup = async (groupId: string) => {
    try {
      const group = supportGroups.find(g => g.id === groupId);
      if (!group) return;

      if (group.joined) {
        await communityApi.leaveGroup(groupId);
      } else {
        await communityApi.joinGroup(groupId);
      }

      setSupportGroups(prev =>
        prev.map(g =>
          g.id === groupId ? { ...g, joined: !g.joined } : g
        )
      );

      setError(null);
    } catch (err: any) {
      console.error('Failed to update group membership:', err);
      setError(err.message || 'Failed to update group membership');
    }
  };

  // Load comments for a post
  const loadCommentsForPost = async (postId: string) => {
    if (comments[postId]) return; // Already loaded

    try {
      const response: any = await communityApi.getPostComments(postId, { page: 1, limit: 50 });
      setComments(prev => ({
        ...prev,
        [postId]: response.comments || [],
      }));
    } catch (err: any) {
      console.error('Failed to load comments:', err);
      setError('Failed to load comments');
    }
  };

  const handleToggleComments = (postId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId],
    }));

    if (!expandedComments[postId]) {
      loadCommentsForPost(postId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AnimationStyles />

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-600/90 text-white px-6 py-4 rounded-lg shadow-lg max-w-md animate-slide-in-up">
          <p className="font-semibold">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-100 hover:text-white text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-600/10 to-pink-600/10 border-b border-orange-400/20 backdrop-blur-xl sticky top-0 z-20 animate-slide-in-up">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">👥</span>
            <h1 className="text-4xl font-bold gradient-text">Community Support Groups</h1>
          </div>
          <p className="text-orange-200 text-lg">Connect with others, share your journey, and find strength together</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Support Groups Section */}
        <section className="mb-12 animate-slide-in-up">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🎯</span>
            Support Groups
            {loading && <div className="loading-spinner ml-4" />}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportGroups.map((group, index) => (
              <div
                key={group.id}
                className="group-card bg-gradient-to-br from-slate-800/60 to-slate-700/60 border border-orange-400/20 rounded-2xl p-6 backdrop-blur-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-5xl mb-3">{group.icon}</div>
                    <h3 className="text-xl font-bold text-white">{group.name}</h3>
                  </div>
                  <button
                    onClick={() => toggleJoinGroup(group.id)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-50 ${
                      group.joined
                        ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-200 border border-green-400/30'
                        : 'bg-gradient-to-r from-orange-600 to-pink-600 text-white hover:from-orange-700 hover:to-pink-700'
                    }`}
                  >
                    {group.joined ? '✓ Joined' : 'Join'}
                  </button>
                </div>

                <p className="text-orange-200 text-sm mb-4">{group.description}</p>

                <div className="flex gap-4 mb-4 pb-4 border-b border-orange-400/10">
                  <div className="flex-1">
                    <p className="text-orange-400 text-xs font-semibold">MEMBERS</p>
                    <p className="text-white text-lg font-bold">{group.members.toLocaleString()}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-orange-400 text-xs font-semibold">DISCUSSIONS</p>
                    <p className="text-white text-lg font-bold">{group.posts}</p>
                  </div>
                </div>

                {group.joined && (
                  <div className="text-xs text-green-400 font-semibold flex items-center gap-1">
                    <span>●</span> You are a member
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Create Post Section */}
        {supportGroups.some(g => g.joined) && (
          <section className="mb-10 animate-fade-in-scale">
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border border-orange-400/30 rounded-2xl p-8 backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="small-avatar">👤</div>
                <div>
                  <h3 className="text-xl font-bold text-white">Share Your Story</h3>
                  <p className="text-orange-300 text-sm">Help others by sharing your experiences and insights</p>
                </div>
              </div>

              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind? Share your thoughts, victories, challenges, or advice..."
                disabled={loading}
                className="w-full px-6 py-4 bg-slate-700/50 border border-orange-400/20 rounded-xl text-white placeholder-orange-300/50 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 resize-none mb-4 transition disabled:opacity-50"
                rows={5}
              />

              <div className="flex justify-between items-center">
                <span
                  className={`text-sm font-semibold character-count ${
                    newPost.length > 450 ? 'danger' : newPost.length > 400 ? 'warning' : 'text-orange-300'
                  }`}
                >
                  {newPost.length}/500 characters
                </span>
                <div className="flex gap-3">
                  {selectedCategory !== 'All' && (
                    <div className="px-4 py-2 bg-orange-600/20 text-orange-200 rounded-lg text-sm font-semibold border border-orange-400/30">
                      📁 {selectedCategory}
                    </div>
                  )}
                  <button
                    onClick={handlePostSubmit}
                    disabled={!newPost.trim() || loading}
                    className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white font-bold px-8 py-3 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/40 flex items-center gap-2"
                  >
                    {loading ? <div className="loading-spinner" /> : '✨'}
                    {loading ? 'Posting...' : 'Share Post'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="mb-10">
          <h3 className="text-lg font-bold text-white mb-4">Filter by Group</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                disabled={loading}
                className={`px-6 py-3 rounded-full font-semibold transition whitespace-nowrap transform hover:scale-105 disabled:opacity-50 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-orange-600 to-pink-600 text-white shadow-lg shadow-orange-500/40'
                    : 'bg-slate-700/50 text-orange-200 hover:bg-slate-700/70 border border-orange-400/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Posts Feed */}
        <section className="space-y-6 pb-16">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-white font-bold text-lg">💬 Discussion Feed</span>
            <span className="bg-orange-600/30 text-orange-200 px-3 py-1 rounded-full text-sm font-semibold">
              {posts.length} posts
            </span>
          </div>

          {postsLoading && posts.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-orange-400/10 rounded-2xl p-12 text-center backdrop-blur-xl">
              <div className="loading-spinner mx-auto mb-4" />
              <p className="text-white text-lg font-semibold">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-orange-400/10 rounded-2xl p-12 text-center backdrop-blur-xl">
              <p className="text-4xl mb-4">🌱</p>
              <p className="text-white text-lg font-semibold mb-2">No posts yet in this group</p>
              <p className="text-orange-300">Be the first to share your story!</p>
            </div>
          ) : (
            posts.map((post, index) => (
              <div
                key={post.id}
                className="post-card bg-gradient-to-br from-slate-800/60 to-slate-700/60 border border-orange-400/20 rounded-2xl backdrop-blur-xl overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="avatar text-2xl">{post.avatar || '👤'}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-bold text-lg">{post.author}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-orange-300 text-sm font-semibold">⏰ {post.timestamp}</span>
                          <span className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-200 px-3 py-1 rounded-full text-xs font-semibold border border-blue-400/30">
                            📌 {post.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-orange-300 hover:text-orange-200 transition p-2 hover:bg-orange-600/10 rounded-lg">
                      ⋮
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 leading-snug">{post.title}</h3>
                  <p className="text-orange-100 leading-relaxed mb-6 text-base">{post.content}</p>

                  <div className="flex gap-6 pt-6 border-t border-orange-400/10">
                    <button
                      onClick={() => toggleLike(post.id)}
                      disabled={loading}
                      className="btn-interact flex items-center gap-2 text-orange-300 hover:text-orange-200 group disabled:opacity-50"
                    >
                      <span className={`text-2xl transition ${post.userLiked ? 'scale-125' : ''}`}>
                        {post.userLiked ? '❤️' : '🤍'}
                      </span>
                      <span className="font-semibold group-hover:text-orange-200">{post.likes}</span>
                    </button>
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      disabled={loading}
                      className="btn-interact flex items-center gap-2 text-orange-300 hover:text-orange-200 group disabled:opacity-50"
                    >
                      <span className="text-2xl group-hover:scale-125 transition">💬</span>
                      <span className="font-semibold">{post.comments}</span>
                    </button>
                    <button className="btn-interact flex items-center gap-2 text-orange-300 hover:text-orange-200 group ml-auto disabled:opacity-50">
                      <span className="text-2xl group-hover:scale-125 transition">🔗</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedComments[post.id] && (
                  <div className="bg-slate-900/20 border-t border-orange-400/10">
                    {/* Existing Comments */}
                    {comments[post.id] && comments[post.id].length > 0 && (
                      <div className="p-6 space-y-4 border-b border-orange-400/10">
                        {comments[post.id].map((comment) => (
                          <div key={comment.id} className="comment-card">
                            <div className="flex items-start gap-3">
                              <div className="small-avatar">{comment.avatar || '👤'}</div>
                              <div className="flex-1 bg-slate-700/30 rounded-lg p-4 border border-orange-400/10">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-white font-semibold">{comment.author}</p>
                                  <span className="text-orange-300 text-xs">{comment.timestamp}</span>
                                </div>
                                <p className="text-orange-100 text-sm mb-3">{comment.content}</p>
                                <div className="flex items-center gap-3 text-xs">
                                  <button className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition">
                                    <span>{comment.userLiked ? '❤️' : '🤍'}</span>
                                    <span>{comment.likes}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="small-avatar">👤</div>
                        <div className="flex-1">
                          <textarea
                            value={newComment[post.id] || ''}
                            onChange={(e) =>
                              setNewComment({ ...newComment, [post.id]: e.target.value })
                            }
                            placeholder="Share your thoughts or encouragement..."
                            disabled={loading}
                            className="w-full px-4 py-3 bg-slate-700/50 border border-orange-400/20 rounded-lg text-white placeholder-orange-300/50 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 resize-none text-sm transition disabled:opacity-50"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2 mt-3">
                            <button
                              onClick={() =>
                                handleToggleComments(post.id)
                              }
                              disabled={loading}
                              className="px-4 py-2 text-orange-300 hover:text-orange-200 font-semibold transition disabled:opacity-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleCommentSubmit(post.id)}
                              disabled={!newComment[post.id]?.trim() || loading}
                              className="px-6 py-2 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {loading ? <div className="loading-spinner" /> : ''}
                              {loading ? 'Posting...' : 'Post Comment'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Infinite Scroll Trigger */}
          <div ref={observerTarget} className="flex justify-center py-8">
            {hasMore && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-orange-300">
                  <span className="inline-block w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                  <span className="font-semibold">Loading more stories...</span>
                  <span className="inline-block w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CommunityPage;
