import { PatientStory, StoryMilestone, Prisma } from '@prisma/client';
import { prisma } from '../utils/prismaClient.js';

export interface CreateStoryInput {
  title: string;
  content: string;
  condition: string;
  startDate: Date;
  recoveryDate?: Date;
  videoUrl?: string;
  photoUrl?: string;
  isPublic?: boolean;
  milestones?: Array<{
    date: Date;
    description: string;
    sentiment: number;
  }>;
}

export interface StoryWithEngagement extends PatientStory {
  author: {
    name: string;
    profileImage?: string;
  };
  milestones: StoryMilestone[];
  commentCount: number;
}

export class PatientStoriesService {
  /**
   * Create a new patient story
   */
  static async createStory(
    userId: string,
    input: CreateStoryInput
  ): Promise<PatientStory> {
    try {
      const story = await prisma.patientStory.create({
        data: {
          userId,
          title: input.title,
          content: input.content,
          condition: input.condition,
          startDate: input.startDate,
          recoveryDate: input.recoveryDate,
          videoUrl: input.videoUrl,
          photoUrl: input.photoUrl,
          isPublic: input.isPublic || false,
        },
      });

      // Add milestones if provided
      if (input.milestones && input.milestones.length > 0) {
        await Promise.all(
          input.milestones.map((milestone) =>
            prisma.storyMilestone.create({
              data: {
                storyId: story.id,
                date: milestone.date,
                description: milestone.description,
                sentiment: milestone.sentiment,
              },
            })
          )
        );
      }

      return story;
    } catch (error) {
      console.error('Error creating story:', error);
      throw new Error('Failed to create story');
    }
  }

  /**
   * Get stories by condition with engagement metrics
   */
  static async getStoriesByCondition(
    condition: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<StoryWithEngagement[]> {
    try {
      const stories = await prisma.patientStory.findMany({
        where: {
          condition,
          isPublic: true,
          verifiedStory: true,
        },
        include: {
          user: {
            select: {
              name: true,
              profileImage: true,
            },
          },
          milestones: {
            orderBy: {
              date: 'asc',
            },
          },
          comments: true,
        },
        orderBy: {
          likes: 'desc',
        },
        take: limit,
        skip: offset,
      });

      return stories.map((story) => ({
        ...story,
        author: story.user,
        commentCount: story.comments.length,
      }));
    } catch (error) {
      console.error('Error fetching stories by condition:', error);
      throw new Error('Failed to fetch stories');
    }
  }

  /**
   * Get similar stories to user's condition
   */
  static async getSimilarStories(
    userId: string,
    limit: number = 5
  ): Promise<StoryWithEngagement[]> {
    try {
      const userStory = await prisma.patientStory.findFirst({
        where: { userId },
      });

      if (!userStory) {
        return [];
      }

      const similarStories = await prisma.patientStory.findMany({
        where: {
          condition: userStory.condition,
          isPublic: true,
          verifiedStory: true,
          NOT: {
            id: userStory.id,
          },
        },
        include: {
          user: {
            select: {
              name: true,
              profileImage: true,
            },
          },
          milestones: true,
          comments: true,
        },
        orderBy: {
          likes: 'desc',
        },
        take: limit,
      });

      return similarStories.map((story) => ({
        ...story,
        author: story.user,
        commentCount: story.comments.length,
      }));
    } catch (error) {
      console.error('Error fetching similar stories:', error);
      throw new Error('Failed to fetch similar stories');
    }
  }

  /**
   * Get story by ID with all details
   */
  static async getStoryById(storyId: string): Promise<StoryWithEngagement | null> {
    try {
      const story = await prisma.patientStory.findUnique({
        where: { id: storyId },
        include: {
          user: {
            select: {
              name: true,
              profileImage: true,
            },
          },
          milestones: {
            orderBy: {
              date: 'asc',
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  name: true,
                  profileImage: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!story) {
        return null;
      }

      return {
        ...story,
        author: story.user,
        commentCount: story.comments.length,
      };
    } catch (error) {
      console.error('Error fetching story:', error);
      throw new Error('Failed to fetch story');
    }
  }

  /**
   * Verify story authenticity (admin/moderator action)
   */
  static async verifyStory(storyId: string): Promise<PatientStory> {
    try {
      return await prisma.patientStory.update({
        where: { id: storyId },
        data: {
          verifiedStory: true,
        },
      });
    } catch (error) {
      console.error('Error verifying story:', error);
      throw new Error('Failed to verify story');
    }
  }

  /**
   * Update story visibility
   */
  static async updateStoryVisibility(
    storyId: string,
    isPublic: boolean
  ): Promise<PatientStory> {
    try {
      return await prisma.patientStory.update({
        where: { id: storyId },
        data: { isPublic },
      });
    } catch (error) {
      console.error('Error updating story visibility:', error);
      throw new Error('Failed to update story visibility');
    }
  }

  /**
   * Like a story
   */
  static async likeStory(storyId: string): Promise<PatientStory> {
    try {
      return await prisma.patientStory.update({
        where: { id: storyId },
        data: {
          likes: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      console.error('Error liking story:', error);
      throw new Error('Failed to like story');
    }
  }

  /**
   * Add comment to story
   */
  static async addComment(
    storyId: string,
    userId: string,
    content: string
  ): Promise<any> {
    try {
      const comment = await prisma.storyComment.create({
        data: {
          storyId,
          userId,
          content,
        },
        include: {
          user: {
            select: {
              name: true,
              profileImage: true,
            },
          },
        },
      });

      // Update comment count on story
      await prisma.patientStory.update({
        where: { id: storyId },
        data: {
          comments: {
            connect: { id: comment.id },
          },
        },
      });

      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }

  /**
   * Get story timeline/milestones
   */
  static async getStoryTimeline(storyId: string): Promise<StoryMilestone[]> {
    try {
      return await prisma.storyMilestone.findMany({
        where: { storyId },
        orderBy: {
          date: 'asc',
        },
      });
    } catch (error) {
      console.error('Error fetching story timeline:', error);
      throw new Error('Failed to fetch story timeline');
    }
  }

  /**
   * Get user's stories
   */
  static async getUserStories(userId: string): Promise<PatientStory[]> {
    try {
      return await prisma.patientStory.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          milestones: true,
          comments: true,
        },
      });
    } catch (error) {
      console.error('Error fetching user stories:', error);
      throw new Error('Failed to fetch user stories');
    }
  }

  /**
   * Search stories
   */
  static async searchStories(query: {
    text?: string;
    condition?: string;
    verifiedOnly?: boolean;
    publicOnly?: boolean;
  }): Promise<StoryWithEngagement[]> {
    try {
      const whereClause: Prisma.PatientStoryWhereInput = {};

      if (query.verifiedOnly) {
        whereClause.verifiedStory = true;
      }

      if (query.publicOnly) {
        whereClause.isPublic = true;
      }

      if (query.condition) {
        whereClause.condition = query.condition;
      }

      if (query.text) {
        whereClause.OR = [
          { title: { contains: query.text, mode: 'insensitive' } },
          { content: { contains: query.text, mode: 'insensitive' } },
        ];
      }

      const stories = await prisma.patientStory.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              name: true,
              profileImage: true,
            },
          },
          milestones: true,
          comments: true,
        },
        orderBy: {
          likes: 'desc',
        },
      });

      return stories.map((story) => ({
        ...story,
        author: story.user,
        commentCount: story.comments.length,
      }));
    } catch (error) {
      console.error('Error searching stories:', error);
      throw new Error('Failed to search stories');
    }
  }

  /**
   * Get trending stories
   */
  static async getTrendingStories(limit: number = 5): Promise<StoryWithEngagement[]> {
    try {
      const stories = await prisma.patientStory.findMany({
        where: {
          isPublic: true,
          verifiedStory: true,
        },
        include: {
          user: {
            select: {
              name: true,
              profileImage: true,
            },
          },
          milestones: true,
          comments: true,
        },
        orderBy: [
          { likes: 'desc' },
          { comments: { _count: 'desc' } },
        ],
        take: limit,
      });

      return stories.map((story) => ({
        ...story,
        author: story.user,
        commentCount: story.comments.length,
      }));
    } catch (error) {
      console.error('Error fetching trending stories:', error);
      throw new Error('Failed to fetch trending stories');
    }
  }
}
