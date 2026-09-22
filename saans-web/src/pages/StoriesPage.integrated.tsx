/**
 * Success Stories Page - API INTEGRATED
 * Inspiring stories from real users
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
import { ListSkeleton } from '../components/SkeletonLoaders';

/**
 * Story Card Component
 */
function StoryCard({ story, onRead }: { story: any; onRead: () => void }) {
  return (
    <Card variant="outlined" padding="lg" hoverable>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex gap-3 flex-1">
            <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center text-lg">
              {story.avatar}
            </div>
            <div className="flex-1">
              <H3 className="font-semibold">{story.author}</H3>
              <Typography variant="bodySm" color="secondary">
                {story.condition}
              </Typography>
            </div>
          </div>
          <Badge variant="success" size="sm">
            ✓ Verified
          </Badge>
        </div>

        {/* Title */}
        <div>
          <Typography variant="h4" className="font-bold mb-2">
            {story.title}
          </Typography>
          <Typography variant="bodyMd" color="secondary" className="line-clamp-3">
            {story.excerpt}
          </Typography>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-neutral-50 rounded">
            <Typography variant="labelSm" color="secondary">
              Duration
            </Typography>
            <Typography variant="bodyMd" className="font-semibold">
              {story.duration}
            </Typography>
          </div>
          <div className="text-center p-2 bg-neutral-50 rounded">
            <Typography variant="labelSm" color="secondary">
              Reads
            </Typography>
            <Typography variant="bodyMd" className="font-semibold">
              {story.reads}
            </Typography>
          </div>
          <div className="text-center p-2 bg-neutral-50 rounded">
            <Typography variant="labelSm" color="secondary">
              Likes
            </Typography>
            <Typography variant="bodyMd" className="font-semibold">
              {story.likes}
            </Typography>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {story.tags.map((tag: string) => (
            <Badge key={tag} variant="info" size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        {/* CTA */}
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={onRead}
        >
          Read Full Story
        </Button>
      </div>
    </Card>
  );
}

/**
 * Featured Story Section
 */
function FeaturedStory() {
  return (
    <Card
      variant="elevated"
      padding="lg"
      className="mb-12 bg-gradient-to-r from-primary-50 to-info-50"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image/Avatar */}
        <div className="flex items-center justify-center">
          <div className="w-24 h-24 bg-primary-200 rounded-full flex items-center justify-center text-5xl">
            🌟
          </div>
        </div>

        {/* Story Content */}
        <div className="md:col-span-2 space-y-4">
          <Badge variant="success" size="md">
            ⭐ Featured Story
          </Badge>
          <H2 className="font-bold">
            From Darkness to Light: Sarah's Journey to Recovery
          </H2>
          <Typography variant="bodyMd" color="secondary">
            After struggling with depression for 3 years, Sarah found her path to recovery through therapy and self-compassion. Her inspiring journey shows that healing is possible with the right support.
          </Typography>
          <div className="flex gap-4">
            <Badge variant="info" size="sm">
              Depression
            </Badge>
            <Badge variant="info" size="sm">
              Recovery
            </Badge>
            <Badge variant="info" size="sm">
              Inspiration
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="md">
              Read Sarah's Story
            </Button>
            <Button variant="secondary" size="md">
              Share
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Filter and Sort Section
 */
function FilterSection({
  sortBy,
  onSortChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: {
  sortBy: string;
  onSortChange: (sort: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories: string[];
}) {
  return (
    <Card variant="flat" padding="lg" className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sort */}
        <div>
          <Typography variant="labelMd" className="mb-2 block">
            Sort By
          </Typography>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full p-2 border border-neutral-300 rounded-lg"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="trending">Trending</option>
            <option value="featured">Featured First</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <Typography variant="labelMd" className="mb-2 block">
            Category
          </Typography>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full p-2 border border-neutral-300 rounded-lg"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}

/**
 * Statistics Section
 */
function StatisticsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
      <Card variant="flat" padding="lg" className="text-center">
        <Typography variant="h3" className="text-3xl font-bold text-primary-600">
          2,450+
        </Typography>
        <Typography variant="labelMd" color="secondary">
          Stories Shared
        </Typography>
      </Card>
      <Card variant="flat" padding="lg" className="text-center">
        <Typography variant="h3" className="text-3xl font-bold text-success-600">
          15K+
        </Typography>
        <Typography variant="labelMd" color="secondary">
          Lives Inspired
        </Typography>
      </Card>
      <Card variant="flat" padding="lg" className="text-center">
        <Typography variant="h3" className="text-3xl font-bold text-info-600">
          98%
        </Typography>
        <Typography variant="labelMd" color="secondary">
          Reader Approval
        </Typography>
      </Card>
      <Card variant="flat" padding="lg" className="text-center">
        <Typography variant="h3" className="text-3xl font-bold text-warning-600">
          24/7
        </Typography>
        <Typography variant="labelMd" color="secondary">
          Support Available
        </Typography>
      </Card>
    </div>
  );
}

/**
 * Main Page
 */
export function StoriesPageIntegrated() {
  const [sortBy, setSortBy] = useState('recent');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'Anxiety',
    'Depression',
    'Relationships',
    'Addiction Recovery',
    'Trauma Healing',
    'Career & Work',
  ];

  // Mock data - would be replaced with real API
  const allStories = [
    {
      id: '1',
      author: 'Priya Sharma',
      avatar: '👩',
      condition: 'Overcame Social Anxiety',
      title: 'From Shy to Confident: How I Conquered Social Anxiety',
      excerpt:
        'A 2-year journey of therapy, self-discovery, and small wins that led to a complete transformation in my social life...',
      duration: '6 months',
      reads: 1250,
      likes: 892,
      tags: ['Anxiety', 'Confidence', 'Personal Growth'],
      category: 'Anxiety',
    },
    {
      id: '2',
      author: 'Rajesh Kumar',
      avatar: '👨',
      condition: 'Depression Recovery',
      title: 'Finding Light in the Darkest Times',
      excerpt:
        'My battle with depression and how therapy helped me rebuild my life and find purpose again...',
      duration: '1.5 years',
      reads: 2340,
      likes: 1560,
      tags: ['Depression', 'Recovery', 'Hope'],
      category: 'Depression',
    },
    {
      id: '3',
      author: 'Anaya Patel',
      avatar: '👩',
      condition: 'Relationship Healing',
      title: 'Rebuilding Trust and Love',
      excerpt:
        'How couples therapy saved my marriage and taught me the power of communication and forgiveness...',
      duration: '8 months',
      reads: 980,
      likes: 720,
      tags: ['Relationships', 'Trust', 'Communication'],
      category: 'Relationships',
    },
    {
      id: '4',
      author: 'Aditya Singh',
      avatar: '👨',
      condition: 'Addiction Recovery',
      title: 'The Road to Sobriety and Self-Love',
      excerpt:
        'My 2-year journey of breaking free from addiction and rebuilding my life with support and determination...',
      duration: '2 years',
      reads: 1890,
      likes: 1420,
      tags: ['Addiction', 'Recovery', 'Strength'],
      category: 'Addiction Recovery',
    },
    {
      id: '5',
      author: 'Neha Verma',
      avatar: '👩',
      condition: 'Trauma Processing',
      title: 'Healing from Trauma: A Story of Resilience',
      excerpt:
        'Processing childhood trauma through EMDR therapy and discovering inner strength I never knew I had...',
      duration: '1 year',
      reads: 1120,
      likes: 890,
      tags: ['Trauma', 'Resilience', 'Healing'],
      category: 'Trauma Healing',
    },
    {
      id: '6',
      author: 'Vikram Desai',
      avatar: '👨',
      condition: 'Career Transition',
      title: 'From Burnout to Balance: My Career Transformation',
      excerpt:
        'How therapy helped me make the difficult decision to leave my toxic job and pursue my passion...',
      duration: '6 months',
      reads: 1560,
      likes: 1100,
      tags: ['Career', 'Burnout', 'Purpose'],
      category: 'Career & Work',
    },
  ];

  const filteredStories = allStories.filter((story) => {
    if (selectedCategory && story.category !== selectedCategory) return false;
    return true;
  });

  const sortedStories = [...filteredStories].sort((a, b) => {
    if (sortBy === 'popular') return b.reads - a.reads;
    if (sortBy === 'trending') return b.likes - a.likes;
    return 0;
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <H1 className="mb-2">Success Stories</H1>
          <Body color="secondary">
            Real stories from real people on their journey to wellness and recovery
          </Body>
        </div>

        {/* Statistics */}
        <StatisticsSection />

        {/* Featured Story */}
        <FeaturedStory />

        {/* Filters */}
        <FilterSection
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />

        {/* Stories Grid */}
        <div>
          <H2 className="mb-6">
            {selectedCategory ? `Stories about ${selectedCategory}` : 'All Stories'}
          </H2>

          {isLoading ? (
            <ListSkeleton count={6} />
          ) : sortedStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onRead={() => alert(`Opening: ${story.title}`)}
                />
              ))}
            </div>
          ) : (
            <Card variant="flat" padding="lg" className="text-center py-12">
              <Body color="secondary">
                No stories found in this category. Try another category!
              </Body>
            </Card>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-info-600 rounded-lg p-8 text-center text-white">
          <H2 className="mb-2 text-white">Share Your Story</H2>
          <Body className="text-white/80 mb-4">
            Inspire others by sharing your journey. Your story could be someone's hope.
          </Body>
          <Button variant="primary" size="lg">
            Submit Your Story
          </Button>
        </div>
      </main>
    </div>
  );
}

interface H3Props {
  className?: string;
  children: React.ReactNode;
}

function H3({ className = '', children }: H3Props) {
  return <Typography as="h3" variant="h3" className={className}>{children}</Typography>;
}

export default StoriesPageIntegrated;
