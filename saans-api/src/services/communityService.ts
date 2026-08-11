import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreatePostInput {
  title: string;
  content: string;
  groupId: string;
  category?: string;
}

interface CreateCommentInput {
  content: string;
  postId: string;
  parentCommentId?: string;
}

interface PaginationParams {
  page: number;
  limit: number;
}

export class CommunityService {
  // =============== GROUP OPERATIONS ===============

  /**
   * Get all community groups with member status
   */
  async getAllGroups(userId: string, params: PaginationParams) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const groups = await prisma.communityGroup.findMany({
      where: { isActive: true },
      include: {
        members: {
          where: { userId },
          select: { id: true },
        },
        _count: {
          select: { members: true, posts: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.communityGroup.count({ where: { isActive: true } });

    return {
      groups: groups.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        icon: group.icon,
        category: group.category,
        members: group._count.members,
        posts: group._count.posts,
        joined: group.members.length > 0,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single group by ID
   */
  async getGroupById(groupId: string, userId: string) {
    const group = await prisma.communityGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { userId },
          select: { id: true },
        },
        _count: {
          select: { members: true, posts: true },
        },
      },
    });

    if (!group || !group.isActive) {
      throw new Error('Group not found');
    }

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      icon: group.icon,
      category: group.category,
      members: group._count.members,
      posts: group._count.posts,
      joined: group.members.length > 0,
    };
  }

  /**
   * Join a community group
   */
  async joinGroup(groupId: string, userId: string) {
    const group = await prisma.communityGroup.findUnique({ where: { id: groupId } });
    if (!group) throw new Error('Group not found');

    const existingMember = await prisma.communityGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (existingMember) {
      throw new Error('Already a member of this group');
    }

    await prisma.communityGroupMember.create({
      data: { groupId, userId },
    });

    // Increment member count
    await prisma.communityGroup.update({
      where: { id: groupId },
      data: { memberCount: { increment: 1 } },
    });

    return { message: 'Successfully joined group' };
  }

  /**
   * Leave a community group
   */
  async leaveGroup(groupId: string, userId: string) {
    const membership = await prisma.communityGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!membership) {
      throw new Error('Not a member of this group');
    }

    await prisma.communityGroupMember.delete({
      where: { id: membership.id },
    });

    // Decrement member count
    await prisma.communityGroup.update({
      where: { id: groupId },
      data: { memberCount: { decrement: 1 } },
    });

    return { message: 'Successfully left group' };
  }

  // =============== POST OPERATIONS ===============

  /**
   * Get posts for a group with pagination and filtering
   */
  async getGroupPosts(groupId: string, userId: string, params: PaginationParams) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const posts = await prisma.communityPost.findMany({
      where: {
        groupId,
        isActive: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.communityPost.count({
      where: { groupId, isActive: true },
    });

    return {
      posts: posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category,
        author: post.author.name,
        authorId: post.author.id,
        avatar: post.author.profileImage,
        likes: post._count.likes,
        comments: post._count.comments,
        userLiked: post.likes.length > 0,
        timestamp: this.formatTimestamp(post.createdAt),
        createdAt: post.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a new post
   */
  async createPost(groupId: string, userId: string, input: CreatePostInput) {
    // Verify user is a member of the group
    const membership = await prisma.communityGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!membership) {
      throw new Error('You must be a member of this group to post');
    }

    const post = await prisma.communityPost.create({
      data: {
        groupId,
        userId,
        title: input.title,
        content: input.content,
        category: input.category,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    // Increment post count
    await prisma.communityGroup.update({
      where: { id: groupId },
      data: { postCount: { increment: 1 } },
    });

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      author: post.author.name,
      authorId: post.author.id,
      avatar: post.author.profileImage,
      likes: 0,
      comments: 0,
      userLiked: false,
      timestamp: 'just now',
      createdAt: post.createdAt,
    };
  }

  /**
   * Get single post with all comments
   */
  async getPost(postId: string, userId: string) {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
        comments: {
          where: { isActive: true, parentCommentId: null },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
            likes: {
              where: { userId },
              select: { id: true },
            },
            replies: {
              where: { isActive: true },
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    profileImage: true,
                  },
                },
                likes: {
                  where: { userId },
                  select: { id: true },
                },
              },
            },
            _count: {
              select: { likes: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    if (!post || !post.isActive) {
      throw new Error('Post not found');
    }

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      author: post.author.name,
      authorId: post.author.id,
      avatar: post.author.profileImage,
      likes: post._count.likes,
      comments: this.formatComments(post.comments, userId),
      userLiked: post.likes.length > 0,
      timestamp: this.formatTimestamp(post.createdAt),
      createdAt: post.createdAt,
    };
  }

  /**
   * Like/unlike a post
   */
  async toggleLike(postId: string, userId: string) {
    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    const existingLike = await prisma.communityPostLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existingLike) {
      // Unlike
      await prisma.communityPostLike.delete({ where: { id: existingLike.id } });
      await prisma.communityPost.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
      return { liked: false };
    } else {
      // Like
      await prisma.communityPostLike.create({
        data: { postId, userId },
      });
      await prisma.communityPost.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      });
      return { liked: true };
    }
  }

  // =============== COMMENT OPERATIONS ===============

  /**
   * Add a comment to a post
   */
  async addComment(postId: string, userId: string, input: CreateCommentInput) {
    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    const comment = await prisma.communityComment.create({
      data: {
        postId,
        userId,
        content: input.content,
        parentCommentId: input.parentCommentId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    // Increment comment count only for top-level comments
    if (!input.parentCommentId) {
      await prisma.communityPost.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      });
    }

    return {
      id: comment.id,
      content: comment.content,
      author: comment.author.name,
      authorId: comment.author.id,
      avatar: comment.author.profileImage,
      likes: 0,
      timestamp: 'just now',
      createdAt: comment.createdAt,
    };
  }

  /**
   * Get comments for a post
   */
  async getPostComments(postId: string, userId: string, params: PaginationParams) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const comments = await prisma.communityComment.findMany({
      where: {
        postId,
        isActive: true,
        parentCommentId: null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
        replies: {
          where: { isActive: true },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
            likes: {
              where: { userId },
              select: { id: true },
            },
            _count: {
              select: { likes: true },
            },
          },
        },
        _count: {
          select: { likes: true, replies: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.communityComment.count({
      where: { postId, isActive: true, parentCommentId: null },
    });

    return {
      comments: comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: comment.author.name,
        authorId: comment.author.id,
        avatar: comment.author.profileImage,
        likes: comment._count.likes,
        replies: comment.replies.map(reply => ({
          id: reply.id,
          content: reply.content,
          author: reply.author.name,
          authorId: reply.author.id,
          avatar: reply.author.profileImage,
          likes: reply._count.likes,
          userLiked: reply.likes.length > 0,
          timestamp: this.formatTimestamp(reply.createdAt),
        })),
        userLiked: comment.likes.length > 0,
        timestamp: this.formatTimestamp(comment.createdAt),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Like/unlike a comment
   */
  async toggleCommentLike(commentId: string, userId: string) {
    const comment = await prisma.communityComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new Error('Comment not found');

    const existingLike = await prisma.communityCommentLike.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });

    if (existingLike) {
      // Unlike
      await prisma.communityCommentLike.delete({ where: { id: existingLike.id } });
      await prisma.communityComment.update({
        where: { id: commentId },
        data: { likeCount: { decrement: 1 } },
      });
      return { liked: false };
    } else {
      // Like
      await prisma.communityCommentLike.create({
        data: { commentId, userId },
      });
      await prisma.communityComment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
      });
      return { liked: true };
    }
  }

  /**
   * Get all posts (filtered by category if provided)
   */
  async getAllPosts(userId: string, category?: string, params?: PaginationParams) {
    const { page = 1, limit = 10 } = params || {};
    const skip = (page - 1) * limit;

    const whereClause: any = { isActive: true };
    if (category && category !== 'All') {
      whereClause.category = category;
    }

    const posts = await prisma.communityPost.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        group: {
          select: {
            name: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.communityPost.count({ where: whereClause });

    return {
      posts: posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category || post.group.name,
        author: post.author.name,
        authorId: post.author.id,
        avatar: post.author.profileImage || '👤',
        likes: post._count.likes,
        comments: post._count.comments,
        userLiked: post.likes.length > 0,
        timestamp: this.formatTimestamp(post.createdAt),
        createdAt: post.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // =============== HELPER METHODS ===============

  private formatTimestamp(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  }

  private formatComments(comments: any[], userId: string) {
    return comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      author: comment.author.name,
      authorId: comment.author.id,
      avatar: comment.author.profileImage || '👤',
      likes: comment._count.likes,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        author: reply.author.name,
        authorId: reply.author.id,
        avatar: reply.author.profileImage || '👤',
        likes: reply._count.likes,
        userLiked: reply.likes.length > 0,
        timestamp: this.formatTimestamp(reply.createdAt),
      })),
      userLiked: comment.likes.length > 0,
      timestamp: this.formatTimestamp(comment.createdAt),
    }));
  }
}

export default new CommunityService();
