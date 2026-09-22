/**
 * Wellness Resources Page - API INTEGRATED
 * Browse articles, videos, and exercises for mental wellness
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
import { ListSkeleton, GridSkeleton } from '../components/SkeletonLoaders';

/**
 * Resource Card Component
 */
function ResourceCard({
  resource,
  onOpen,
}: {
  resource: any;
  onOpen: () => void;
}) {
  return (
    <Card variant="outlined" padding="lg" hoverable clickable>
      <div className="space-y-3">
        {/* Type Badge and Favorite */}
        <div className="flex items-center justify-between">
          <Badge variant="info" size="sm">
            {resource.type === 'article' && '📄'}
            {resource.type === 'video' && '📹'}
            {resource.type === 'exercise' && '💪'}
            {resource.type === 'meditation' && '🧘'}
            {' ' + resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
          </Badge>
          <button className="text-xl">
            {resource.liked ? '❤️' : '🤍'}
          </button>
        </div>

        {/* Title and Description */}
        <div>
          <H3 className="font-semibold">{resource.title}</H3>
          <Typography variant="bodySm" color="secondary" className="mt-1 line-clamp-2">
            {resource.description}
          </Typography>
        </div>

        {/* Meta Info */}
        <div className="flex gap-4 text-sm text-neutral-600">
          <div>📅 {resource.duration}</div>
          <div>👁️ {resource.views} views</div>
        </div>

        {/* Tags */}
        {resource.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {resource.tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="neutral" size="sm">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 2 && (
              <span className="text-xs text-neutral-600">
                +{resource.tags.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* CTA Button */}
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={onOpen}
        >
          {resource.type === 'video' ? '▶️ Watch' : 'Read'}
        </Button>
      </div>
    </Card>
  );
}

/**
 * Filter and Search Section
 */
function FilterSection({
  activeCategory,
  activeType,
  onCategoryChange,
  onTypeChange,
  categories,
  types,
}: {
  activeCategory: string;
  activeType: string;
  onCategoryChange: (cat: string) => void;
  onTypeChange: (type: string) => void;
  categories: string[];
  types: string[];
}) {
  return (
    <Card variant="flat" padding="lg" className="mb-6">
      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <Typography variant="labelMd" className="mb-3 block">
            Category
          </Typography>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onCategoryChange(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <Typography variant="labelMd" className="mb-3 block">
            Resource Type
          </Typography>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <Button
                key={type}
                variant={activeType === type ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onTypeChange(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Featured Resources Section
 */
function FeaturedSection() {
  return (
    <div className="mb-12">
      <H2 className="mb-6">Featured Resources</H2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Featured 1 */}
        <Card
          variant="elevated"
          padding="lg"
          className="md:row-span-2 bg-gradient-to-br from-primary-50 to-primary-100"
        >
          <div className="space-y-4">
            <Badge variant="primary" size="lg">
              ✨ Featured
            </Badge>
            <H3 className="text-xl font-bold">
              Introduction to Mindfulness
            </H3>
            <Typography variant="bodyMd" color="secondary">
              Learn the basics of mindfulness meditation and transform your daily routine with proven techniques to reduce stress and anxiety.
            </Typography>
            <div className="flex gap-2 text-sm">
              <span>🧘 Meditation</span>
              <span>•</span>
              <span>15 mins</span>
            </div>
            <Button variant="primary" fullWidth>
              Start Now
            </Button>
          </div>
        </Card>

        {/* Featured 2 */}
        <Card
          variant="elevated"
          padding="lg"
          className="bg-gradient-to-br from-success-50 to-success-100"
        >
          <div className="space-y-3">
            <Badge variant="success" size="lg">
              🎯 Popular
            </Badge>
            <H3 className="font-bold">Stress Management Guide</H3>
            <Typography variant="bodySm" color="secondary">
              Expert tips for managing stress in daily life.
            </Typography>
            <Button variant="primary" size="sm" fullWidth>
              Read Article
            </Button>
          </div>
        </Card>

        <Card
          variant="elevated"
          padding="lg"
          className="bg-gradient-to-br from-info-50 to-info-100"
        >
          <div className="space-y-3">
            <Badge variant="info" size="lg">
              💪 Trending
            </Badge>
            <H3 className="font-bold">Morning Fitness Routine</H3>
            <Typography variant="bodySm" color="secondary">
              5-minute exercise to start your day energized.
            </Typography>
            <Button variant="primary" size="sm" fullWidth>
              Watch Video
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Main Page
 */
export function WellnessResourcesPageIntegrated() {
  const [activeCategory, setActiveCategory] = useState('');
  const [activeType, setActiveType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'Anxiety',
    'Depression',
    'Sleep',
    'Relationships',
    'Work',
    'Self-Care',
  ];

  const types = ['Article', 'Video', 'Exercise', 'Meditation'];

  // Mock data - would be replaced with real API
  const allResources = [
    {
      id: '1',
      title: 'Understanding Anxiety Disorders',
      description: 'A comprehensive guide to understanding and managing anxiety.',
      type: 'article',
      category: 'Anxiety',
      duration: '5 min read',
      views: 1250,
      tags: ['mental-health', 'anxiety'],
      liked: false,
    },
    {
      id: '2',
      title: 'Guided Meditation for Anxiety',
      description: 'A 10-minute guided meditation to help with anxiety relief.',
      type: 'meditation',
      category: 'Anxiety',
      duration: '10 mins',
      views: 2340,
      tags: ['meditation', 'anxiety-relief'],
      liked: false,
    },
    {
      id: '3',
      title: 'Sleep Hygiene Tips',
      description: 'Learn how to improve your sleep quality with these proven tips.',
      type: 'article',
      category: 'Sleep',
      duration: '6 min read',
      views: 980,
      tags: ['sleep', 'wellness'],
      liked: false,
    },
    {
      id: '4',
      title: 'Breathing Exercises for Stress',
      description: 'Quick breathing techniques you can use anytime, anywhere.',
      type: 'video',
      category: 'Anxiety',
      duration: '4 mins',
      views: 1560,
      tags: ['breathing', 'stress-relief'],
      liked: false,
    },
    {
      id: '5',
      title: 'Morning Yoga Routine',
      description: 'A gentle yoga routine to energize your morning.',
      type: 'exercise',
      category: 'Self-Care',
      duration: '15 mins',
      views: 1890,
      tags: ['yoga', 'fitness'],
      liked: false,
    },
    {
      id: '6',
      title: 'Healthy Communication in Relationships',
      description: 'Improve your relationships with better communication skills.',
      type: 'article',
      category: 'Relationships',
      duration: '8 min read',
      views: 1120,
      tags: ['relationships', 'communication'],
      liked: false,
    },
  ];

  const filteredResources = allResources.filter((resource) => {
    if (activeCategory && resource.category !== activeCategory) return false;
    if (activeType && resource.type !== activeType.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <H1 className="mb-2">Wellness Resources</H1>
          <Body color="secondary">
            Explore articles, videos, and exercises to support your mental health journey
          </Body>
        </div>

        {/* Featured Section */}
        <FeaturedSection />

        {/* Filters */}
        <FilterSection
          activeCategory={activeCategory}
          activeType={activeType}
          onCategoryChange={setActiveCategory}
          onTypeChange={setActiveType}
          categories={categories}
          types={types}
        />

        {/* Resources Grid */}
        <div>
          <H2 className="mb-6">
            {activeCategory || activeType ? 'Filtered Resources' : 'All Resources'}
          </H2>

          {isLoading ? (
            <GridSkeleton count={6} />
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onOpen={() => alert(`Opening: ${resource.title}`)}
                />
              ))}
            </div>
          ) : (
            <Card variant="flat" padding="lg" className="text-center py-12">
              <Body color="secondary">
                No resources found. Try different filters!
              </Body>
              {(activeCategory || activeType) && (
                <Button
                  variant="tertiary"
                  size="md"
                  onClick={() => {
                    setActiveCategory('');
                    setActiveType('');
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          )}
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

export default WellnessResourcesPageIntegrated;
