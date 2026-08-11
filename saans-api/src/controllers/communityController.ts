// @ts-nocheck

import { Request, Response, NextFunction } from 'express';
import communityService from '../services/communityService.js';
import { ApiError, ErrorMessages, ErrorCodes, HttpStatus } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

export class CommunityController {
  /**
   * GET /community/groups - Get all community groups
   */
  async getAllGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          'User not authenticated',
          true,
          ErrorCodes.UNAUTHORIZED
        );
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      logger.debug('Fetching community groups', { page, limit }, undefined, requestId);

      const result = await communityService.getAllGroups(userId, { page, limit });

      logger.info('Community groups retrieved', { count: result.groups.length }, undefined, requestId);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Get groups failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      logger.error('Get groups error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * GET /community/groups/:groupId - Get single group
   */
  async getGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const groupId = req.params.groupId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          'User not authenticated',
          true,
          ErrorCodes.UNAUTHORIZED
        );
      }

      logger.debug('Fetching group', { groupId }, undefined, requestId);

      const group = await communityService.getGroupById(groupId, userId);

      logger.info('Group retrieved', { groupId }, undefined, requestId);
      return res.status(HttpStatus.OK).json(group);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return next(error);
      }

      if (error.message === 'Group not found') {
        return next(
          new ApiError(
            HttpStatus.NOT_FOUND,
            'Group not found',
            true,
            ErrorCodes.NOT_FOUND
          )
        );
      }

      logger.error('Get group error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /community/groups/:groupId/join - Join a group
   */
  async joinGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const groupId = req.params.groupId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          'User not authenticated',
          true,
          ErrorCodes.UNAUTHORIZED
        );
      }

      logger.debug('Joining group', { groupId, userId }, undefined, requestId);

      const result = await communityService.joinGroup(groupId, userId);

      logger.info('Group joined', { groupId }, undefined, requestId);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error.message === 'Group not found') {
        return next(
          new ApiError(
            HttpStatus.NOT_FOUND,
            'Group not found',
            true,
            ErrorCodes.NOT_FOUND
          )
        );
      }

      if (error.message === 'Already a member of this group') {
        return next(
          new ApiError(
            HttpStatus.BAD_REQUEST,
            error.message,
            true,
            ErrorCodes.VALIDATION_FAILED
          )
        );
      }

      logger.error('Join group error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /community/groups/:groupId/leave - Leave a group
   */
  async leaveGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const groupId = req.params.groupId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          'User not authenticated',
          true,
          ErrorCodes.UNAUTHORIZED
        );
      }

      logger.debug('Leaving group', { groupId, userId }, undefined, requestId);

      const result = await communityService.leaveGroup(groupId, userId);

      logger.info('Group left', { groupId }, undefined, requestId);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error.message === 'Not a member of this group') {
        return next(
          new ApiError(
            HttpStatus.BAD_REQUEST,
            error.message,
            true,
            ErrorCodes.VALIDATION_FAILED
          )
        );
      }

      logger.error('Leave group error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * GET /community/groups/:groupId/posts - Get posts for a group
   */
  async getGroupPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const groupId = req.params.groupId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          'User not authenticated',
          true,
          ErrorCodes.UNAUTHORIZED
        );
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      logger.debug('Fetching group posts', { groupId, page, limit }, undefined, requestId);

      const result = await communityService.getGroupPosts(groupId, userId, { page, limit });

      logger.info('Group posts retrieved', { groupId, count: result.posts.length }, undefined, requestId);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      logger.error('Get group posts error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /community/groups/:groupId/posts - Create a post
   */
  async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const groupId = req.params.groupId;
    const { title, content, category } = req.body;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          'User not authenticated',
          true,
          ErrorCodes.UNAUTHORIZED
        );
      }

      // Validate input
      if (!title || !content) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Title and content are required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (title.length < 3) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Title must be at least 3 characters',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (content.length < 10) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Content must be at least 10 characters',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Creating post', { groupId, userId }, undefined, requestId);

      const post = await communityService.createPost(groupId, userId, {
        title,
        content,
        groupId,
        category,
      });

      logger.info('Post created', { postId: post.id }, undefined, requestId);
      return res.status(HttpStatus.CREATED).json(post);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Create post failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      if (error.message === 'You must be a member of this group to post') {
        return next(
          new ApiError(
            HttpStatus.FORBIDDEN,
            error.message,
            true,
            ErrorCodes.FORBIDDEN
          )
        );
      }

      logger.error('Create post error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * GET /community/posts/:postId - Get single post
   */
  async getPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const postId = req.params.postId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          'User not authenticated',
          true,
          ErrorCodes.UNAUTHORIZED
        );
      }

      logger.debug('Fetching post', { postId }, undefined, requestId);

      const post = await communityService.getPost(postId, userId);

      logger.info('Post retrieved', { postId }, undefined, requestId);
      return res.status(HttpStatus.OK).json(post);
    } catch (error: any) {
      if (error.message === 'Post not found') {
        return next(
          new ApiError(
            HttpStatus.NOT_FOUND,
            'Post not found',
            true,
            ErrorCodes.NOT_FOUND
          )
        );
      }

      logger.error('Get post error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /community/posts/:postId/like - Like/unlike a post
   */
  async toggleLike(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const postId = req.params.postId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          'User not authenticated',
          true,
          ErrorCodes.UNAUTHORIZED
        );
      }

      logger.debug('Toggling post like', { postId, userId }, undefined, requestId);

      const result = await communityService.toggleLike(postId, userId);

      logger.info('Post like toggled', { postId, liked: result.liked }, undefined, requestId);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error.message === 'Post not found') {
        return next(
          new ApiError(
            HttpStatus.NOT_FOUND,
            'Post not found',
            true,
            ErrorCodes.NOT_FOUND
          )
        );
      }

      logger.error('Toggle like error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * GET /community/posts/:postId/comments - Get comments for a post
   */
  async getPostComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const postId = req.params.postId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          'User not authenticated',
          true,
          ErrorCodes.UNAUTHORIZED
        );
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      logger.debug('Fetching post comments', { postId, page, limit }, undefined, requestId);

      const result = await communityService.getPostComments(postId, userId, { page, limit });

      logger.info('Post comments retrieved', { postId, count: result.comments.length }, undefined, requestId);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      logger.error('Get post comments error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /community/posts/:postId/comments - Add a comment
   */
  async addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const postId = req.params.postId;
    const { content, parentCommentId } = req.body;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          'User not authenticated',
          true,
          ErrorCodes.UNAUTHORIZED
        );
      }

      // Validate input
      if (!content || content.trim().length === 0) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Comment content is required',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (content.length < 2) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          'Comment must be at least 2 characters',
          true,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      logger.debug('Adding comment', { postId, userId }, undefined, requestId);

      const comment = await communityService.addComment(postId, userId, {
        content,
        postId,
        parentCommentId,
      });

      logger.info('Comment added', { commentId: comment.id }, undefined, requestId);
      return res.status(HttpStatus.CREATED).json(comment);
    } catch (error: any) {
      if (error instanceof ApiError) {
        logger.warn(`Add comment failed: ${error.message}`, undefined, undefined, requestId);
        return next(error);
      }

      if (error.message === 'Post not found') {
        return next(
          new ApiError(
            HttpStatus.NOT_FOUND,
            'Post not found',
            true,
            ErrorCodes.NOT_FOUND
          )
        );
      }

      logger.error('Add comment error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * POST /community/comments/:commentId/like - Like/unlike a comment
   */
  async toggleCommentLike(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const commentId = req.params.commentId;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          'User not authenticated',
          true,
          ErrorCodes.UNAUTHORIZED
        );
      }

      logger.debug('Toggling comment like', { commentId, userId }, undefined, requestId);

      const result = await communityService.toggleCommentLike(commentId, userId);

      logger.info('Comment like toggled', { commentId, liked: result.liked }, undefined, requestId);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error.message === 'Comment not found') {
        return next(
          new ApiError(
            HttpStatus.NOT_FOUND,
            'Comment not found',
            true,
            ErrorCodes.NOT_FOUND
          )
        );
      }

      logger.error('Toggle comment like error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }

  /**
   * GET /community/posts - Get all posts (optionally filtered by category)
   */
  async getAllPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = req.headers['x-request-id'] as string;
    const userId = (req as any).userId;
    const category = req.query.category as string;

    try {
      if (!userId) {
        throw new ApiError(
          HttpStatus.UNAUTHORIZED,
          'User not authenticated',
          true,
          ErrorCodes.UNAUTHORIZED
        );
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      logger.debug('Fetching all posts', { category, page, limit }, undefined, requestId);

      const result = await communityService.getAllPosts(userId, category, { page, limit });

      logger.info('All posts retrieved', { count: result.posts.length }, undefined, requestId);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      logger.error('Get all posts error', error, undefined, undefined, requestId);
      next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorMessages.INTERNAL_SERVER_ERROR,
          false,
          ErrorCodes.INTERNAL_ERROR
        )
      );
    }
  }
}

export default new CommunityController();
