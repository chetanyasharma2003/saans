/**
 * Community Hooks
 * React Query hooks for community features (posts, groups, etc)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { MOCK_COMMUNITY_POSTS, MOCK_SUPPORT_GROUPS, MOCK_ACTIVITY } from '../data/mockData';

// Types
export interface CommunityPost {
  id: string;
  authorId: string;
  author: string;
  avatar?: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  liked: boolean;
  timestamp: string;
  tags: string[];
}

export interface SupportGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
  joined: boolean;
  lastActivity: string;
  image?: string;
}

export interface ActivityFeed {
  id: string;
  type: 'mood' | 'appointment' | 'community' | 'achievement' | 'milestone';
  message: string;
  timestamp: string;
  icon: string;
  metadata?: Record<string, any>;
}

// Query Keys
export const communityKeys = {
  all: ['community'] as const,
  posts: () => [...communityKeys.all, 'posts'] as const,
  post: (id: string) => [...communityKeys.posts(), id] as const,
  groups: () => [...communityKeys.all, 'groups'] as const,
  group: (id: string) => [...communityKeys.groups(), id] as const,
  activity: () => [...communityKeys.all, 'activity'] as const,
};

/**
 * Get community posts with pagination
 */
export function useCommunityPosts(filters?: {
  category?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...communityKeys.posts(), filters],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{
          success: boolean;
          data: CommunityPost[];
          total?: number;
        }>('/community/posts', { params: filters });
        if (!response.data.success) {
          throw new Error('Failed to fetch community posts');
        }
        return response.data.data;
      } catch (error) {
        console.warn('Using mock community posts (API unavailable)');
        return MOCK_COMMUNITY_POSTS;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get single community post
 */
export function useCommunityPost(id: string) {
  return useQuery({
    queryKey: communityKeys.post(id),
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: CommunityPost;
      }>(`/community/posts/${id}`);
      if (!response.data.success) {
        throw new Error('Failed to fetch post');
      }
      return response.data.data;
    },
    enabled: !!id,
  });
}

/**
 * Create community post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<CommunityPost, 'id' | 'timestamp' | 'likes' | 'comments' | 'liked' | 'author' | 'authorId'>
    ) => {
      const response = await apiClient.post<{
        success: boolean;
        data: CommunityPost;
      }>('/community/posts', data);
      if (!response.data.success) {
        throw new Error('Failed to create post');
      }
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
      queryClient.invalidateQueries({ queryKey: communityKeys.activity() });
    },
  });
}

/**
 * Like/unlike post
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiClient.post<{ success: boolean }>(
        `/community/posts/${postId}/like`
      );
      if (!response.data.success) {
        throw new Error('Failed to like post');
      }
      return postId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
    },
  });
}

/**
 * Get support groups
 */
export function useSupportGroups(filters?: { category?: string }) {
  return useQuery({
    queryKey: [...communityKeys.groups(), filters],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{
          success: boolean;
          data: SupportGroup[];
        }>('/community/groups', { params: filters });
        if (!response.data.success) {
          throw new Error('Failed to fetch support groups');
        }
        return response.data.data;
      } catch (error) {
        console.warn('Using mock support groups (API unavailable)');
        return MOCK_SUPPORT_GROUPS;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get single support group
 */
export function useSupportGroup(id: string) {
  return useQuery({
    queryKey: communityKeys.group(id),
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: SupportGroup;
      }>(`/community/groups/${id}`);
      if (!response.data.success) {
        throw new Error('Failed to fetch group');
      }
      return response.data.data;
    },
    enabled: !!id,
  });
}

/**
 * Join support group
 */
export function useJoinGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiClient.post<{ success: boolean }>(
        `/community/groups/${groupId}/join`
      );
      if (!response.data.success) {
        throw new Error('Failed to join group');
      }
      return groupId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.groups() });
    },
  });
}

/**
 * Leave support group
 */
export function useLeaveGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiClient.post<{ success: boolean }>(
        `/community/groups/${groupId}/leave`
      );
      if (!response.data.success) {
        throw new Error('Failed to leave group');
      }
      return groupId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.groups() });
    },
  });
}

/**
 * Get activity feed
 */
export function useActivityFeed(limit: number = 20) {
  return useQuery({
    queryKey: communityKeys.activity(),
    queryFn: async () => {
      try {
        const response = await apiClient.get<{
          success: boolean;
          data: ActivityFeed[];
        }>('/activity-feed', { params: { limit } });
        if (!response.data.success) {
          throw new Error('Failed to fetch activity feed');
        }
        return response.data.data;
      } catch (error) {
        console.warn('Using mock activity feed (API unavailable)');
        return MOCK_ACTIVITY;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get recent activity (limited)
 */
export function useRecentActivity(limit: number = 5) {
  return useQuery({
    queryKey: [...communityKeys.activity(), 'recent'],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: ActivityFeed[];
      }>('/activity-feed/recent', { params: { limit } });
      if (!response.data.success) {
        throw new Error('Failed to fetch recent activity');
      }
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
