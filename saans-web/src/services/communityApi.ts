import { apiClient } from './apiClient';

interface CreatePostPayload {
  title: string;
  content: string;
  category?: string;
}

interface CreateCommentPayload {
  content: string;
  parentCommentId?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

export const communityApi = {
  // =============== GROUP OPERATIONS ===============

  /**
   * Get all community groups
   */
  async getGroups(params?: PaginationParams) {
    return apiClient.get('/api/community/groups', {
      params,
    });
  },

  /**
   * Get single group by ID
   */
  async getGroup(groupId: string) {
    return apiClient.get(`/api/community/groups/${groupId}`);
  },

  /**
   * Join a community group
   */
  async joinGroup(groupId: string) {
    return apiClient.post(`/api/community/groups/${groupId}/join`, {});
  },

  /**
   * Leave a community group
   */
  async leaveGroup(groupId: string) {
    return apiClient.post(`/api/community/groups/${groupId}/leave`, {});
  },

  // =============== POST OPERATIONS ===============

  /**
   * Get all posts (optionally filtered by category)
   */
  async getAllPosts(category?: string, params?: PaginationParams) {
    return apiClient.get('/api/community/posts', {
      params: {
        category,
        ...params,
      },
    });
  },

  /**
   * Get single post
   */
  async getPost(postId: string) {
    return apiClient.get(`/api/community/posts/${postId}`);
  },

  /**
   * Get posts for a specific group
   */
  async getGroupPosts(groupId: string, params?: PaginationParams) {
    return apiClient.get(`/api/community/groups/${groupId}/posts`, {
      params,
    });
  },

  /**
   * Create a post in a group
   */
  async createPost(groupId: string, payload: CreatePostPayload) {
    return apiClient.post(`/api/community/groups/${groupId}/posts`, payload);
  },

  /**
   * Like/unlike a post
   */
  async togglePostLike(postId: string) {
    return apiClient.post(`/api/community/posts/${postId}/like`, {});
  },

  // =============== COMMENT OPERATIONS ===============

  /**
   * Get comments for a post
   */
  async getPostComments(postId: string, params?: PaginationParams) {
    return apiClient.get(`/api/community/posts/${postId}/comments`, {
      params,
    });
  },

  /**
   * Add a comment to a post
   */
  async addComment(postId: string, payload: CreateCommentPayload) {
    return apiClient.post(`/api/community/posts/${postId}/comments`, payload);
  },

  /**
   * Like/unlike a comment
   */
  async toggleCommentLike(commentId: string) {
    return apiClient.post(`/api/community/comments/${commentId}/like`, {});
  },
};

export default communityApi;
