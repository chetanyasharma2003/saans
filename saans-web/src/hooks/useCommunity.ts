import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';

export interface CommunityPost {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  category?: string;
  likes?: number;
  comments?: number;
  tags?: string[];
}

export interface SupportGroup {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  members?: number;
}

export const communityKeys = {
  posts: ['posts'] as const,
  groups: ['groups'] as const,
};

export interface ActivityFeed {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export function useCommunityPosts() {
  return useQuery({
    queryKey: communityKeys.posts,
    queryFn: async () => {
      const response = await apiClient.get<CommunityPost[]>('/community/posts');
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCommunityPost(id: string) {
  return useQuery({
    queryKey: [...communityKeys.posts, id],
    queryFn: async () => {
      const response = await apiClient.get<CommunityPost>(`/community/posts/${id}`);
      return response.data || null;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<CommunityPost>('/community/posts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.posts });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiClient.post<CommunityPost>(`/community/posts/${postId}/like`, {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.posts });
    },
  });
}

export function useSupportGroups() {
  return useQuery({
    queryKey: communityKeys.groups,
    queryFn: async () => {
      const response = await apiClient.get<SupportGroup[]>('/community/groups');
      return response.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useSupportGroup(id: string) {
  return useQuery({
    queryKey: [...communityKeys.groups, id],
    queryFn: async () => {
      const response = await apiClient.get<SupportGroup>(`/community/groups/${id}`);
      return response.data || null;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useActivityFeed() {
  return useQuery({
    queryKey: ['activity-feed'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<CommunityPost[]>('/community/posts');
        return response.data || [];
      } catch (error) {
        console.error('Failed to fetch activity feed:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['activity-feed', 'recent'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<CommunityPost[]>('/community/posts');
        // Return most recent posts (assuming they're sorted by date)
        return (response.data || []).slice(0, 5);
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiClient.post(`/community/groups/${groupId}/join`, {});
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.groups });
    },
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiClient.post(`/community/groups/${groupId}/leave`, {});
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.groups });
    },
  });
}
