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
      const response = await apiClient.get('/community/posts');
      return response.data.data || [];
    },
  });
}

export function useCommunityPost(id: string) {
  return useQuery({
    queryKey: [...communityKeys.posts, id],
    queryFn: async () => {
      const response = await apiClient.get(`/community/posts/${id}`);
      return response.data.data || null;
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/community/posts', data);
      return response.data.data;
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
      const response = await apiClient.post(`/community/posts/${postId}/like`, {});
      return response.data.data;
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
      const response = await apiClient.get('/community/groups');
      return response.data.data || [];
    },
  });
}

export function useSupportGroup(id: string) {
  return useQuery({
    queryKey: [...communityKeys.groups, id],
    queryFn: async () => {
      const response = await apiClient.get(`/community/groups/${id}`);
      return response.data.data || null;
    },
  });
}

export function useActivityFeed() {
  return useQuery({
    queryKey: ['activity-feed'],
    queryFn: async () => {
      const response = await apiClient.get('/activity-feed').catch(() => ({ data: { data: [] } }));
      return response.data.data || [];
    },
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['activity-feed', 'recent'],
    queryFn: async () => {
      const response = await apiClient.get('/activity-feed/recent').catch(() => ({ data: { data: [] } }));
      return response.data.data || [];
    },
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
