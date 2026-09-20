import { prisma } from '../utils/prismaClient';

class WellnessResourcesService {
  // Get resources by category
  async getResourcesByCategory(category: string, limit: number = 20) {
    try {
      return await prisma.wellnessResource.findMany({
        where: {
          category,
          isVerified: true,
        },
        orderBy: { rating: 'desc' },
        take: limit,
      });
    } catch (error) {
      throw new Error(`Failed to get resources: ${error}`);
    }
  }

  // Get resources by type
  async getResourcesByType(resourceType: string, limit: number = 20) {
    try {
      return await prisma.wellnessResource.findMany({
        where: {
          resourceType,
          isVerified: true,
        },
        orderBy: { rating: 'desc' },
        take: limit,
      });
    } catch (error) {
      throw new Error(`Failed to get resources: ${error}`);
    }
  }

  // Get meditations
  async getMeditations(category?: string) {
    try {
      return await prisma.wellnessResource.findMany({
        where: {
          resourceType: 'MEDITATION',
          ...(category && { category }),
          isVerified: true,
        },
        orderBy: { rating: 'desc' },
        take: 30,
      });
    } catch (error) {
      throw new Error(`Failed to get meditations: ${error}`);
    }
  }

  // Get exercises
  async getExercises(category?: string) {
    try {
      return await prisma.wellnessResource.findMany({
        where: {
          resourceType: 'EXERCISE',
          ...(category && { category }),
          isVerified: true,
        },
        orderBy: { rating: 'desc' },
        take: 30,
      });
    } catch (error) {
      throw new Error(`Failed to get exercises: ${error}`);
    }
  }

  // Get articles
  async getArticles(category?: string) {
    try {
      return await prisma.wellnessResource.findMany({
        where: {
          resourceType: 'ARTICLE',
          ...(category && { category }),
          isVerified: true,
        },
        orderBy: { rating: 'desc' },
        take: 30,
      });
    } catch (error) {
      throw new Error(`Failed to get articles: ${error}`);
    }
  }

  // Get podcasts
  async getPodcasts(category?: string) {
    try {
      return await prisma.wellnessResource.findMany({
        where: {
          resourceType: 'PODCAST',
          ...(category && { category }),
          isVerified: true,
        },
        orderBy: { rating: 'desc' },
        take: 20,
      });
    } catch (error) {
      throw new Error(`Failed to get podcasts: ${error}`);
    }
  }

  // Get books
  async getBooks(category?: string) {
    try {
      return await prisma.wellnessResource.findMany({
        where: {
          resourceType: 'BOOK',
          ...(category && { category }),
          isVerified: true,
        },
        orderBy: { rating: 'desc' },
        take: 20,
      });
    } catch (error) {
      throw new Error(`Failed to get books: ${error}`);
    }
  }

  // Search resources
  async searchResources(query: string, limit: number = 20) {
    try {
      return await prisma.wellnessResource.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
          isVerified: true,
        },
        take: limit,
      });
    } catch (error) {
      throw new Error(`Failed to search resources: ${error}`);
    }
  }

  // Create resource (admin)
  async createResource(data: any) {
    try {
      return await prisma.wellnessResource.create({
        data: {
          title: data.title,
          description: data.description,
          resourceType: data.resourceType,
          category: data.category,
          contentUrl: data.contentUrl,
          resourceLink: data.resourceLink,
          authorName: data.authorName,
          authorCredentials: data.authorCredentials,
          difficulty: data.difficulty,
          estimatedTime: data.estimatedTime,
          rating: data.rating,
          isVerified: data.isVerified || false,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create resource: ${error}`);
    }
  }
}

export default new WellnessResourcesService();
