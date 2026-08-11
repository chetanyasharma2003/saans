import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TherapistFilters {
  specialty?: string;
  minPrice?: number;
  maxPrice?: number;
  language?: string;
  minRating?: number;
  availability?: boolean;
  page?: number;
  limit?: number;
  userCity?: string;
}

export interface CreateTherapistProfileInput {
  userId: string;
  licenseNumber: string;
  specialization: string[];
  certifications: string[];
  yearsOfExperience: number;
  hourlyRate?: number;
  availableSlots?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}

export interface UpdateTherapistProfileInput {
  specialization?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  hourlyRate?: number;
  isAvailable?: boolean;
}

export class TherapistService {
  /**
   * Get all therapists with filtering, location-based prioritization, and pagination
   */
  async getAllTherapists(filters: TherapistFilters = {}) {
    try {
      const {
        specialty,
        minPrice = 0,
        maxPrice = 10000,
        minRating = 0,
        availability = true,
        userCity,
        page = 1,
        limit = 10,
      } = filters;

      const skip = (page - 1) * limit;

      // Build where clause dynamically
      const whereClause: any = {
        isAvailable: availability,
        hourlyRate: {
          gte: minPrice,
          lte: maxPrice,
        },
        averageRating: {
          gte: minRating,
        },
      };

      if (specialty) {
        whereClause.specialization = {
          has: specialty,
        };
      }

      // Fetch all therapists (without pagination limit for sorting)
      const allTherapists = await prisma.therapist.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              bio: true,
              city: true,
              state: true,
            },
          },
        },
        orderBy: {
          averageRating: 'desc',
        },
      });

      // Apply location-based sorting
      let sortedTherapists = allTherapists;
      if (userCity) {
        sortedTherapists = this.prioritizeByLocation(allTherapists, userCity);
      }

      // Get total count before pagination
      const total = sortedTherapists.length;

      // Apply pagination
      const paginatedTherapists = sortedTherapists.slice(skip, skip + limit);

      // Add location match info to each therapist
      const therapistsWithLocationData = paginatedTherapists.map((therapist) => ({
        ...therapist,
        cityMatch: userCity
          ? therapist.user.city?.toLowerCase() === userCity.toLowerCase()
            ? 'same-city'
            : 'nearby'
          : null,
      }));

      return {
        data: therapistsWithLocationData,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch therapists: ${error.message}`);
    }
  }

  /**
   * Prioritize therapists by location
   * Same city therapists first, then nearby cities
   */
  private prioritizeByLocation(therapists: any[], userCity: string): any[] {
    if (!userCity || !userCity.trim()) {
      return therapists;
    }

    const userCityLower = userCity.toLowerCase().trim();

    // Define nearby cities by region (can be expanded)
    const nearbyCityMap: { [key: string]: string[] } = {
      // India - Major cities and nearby
      'new delhi': ['delhi', 'gurgaon', 'noida', 'ghaziabad', 'faridabad'],
      delhi: ['new delhi', 'gurgaon', 'noida', 'ghaziabad', 'faridabad'],
      gurgaon: ['delhi', 'new delhi', 'noida', 'faridabad'],
      noida: ['delhi', 'new delhi', 'gurgaon', 'ghaziabad'],
      mumbai: ['thane', 'navi mumbai', 'pune', 'dombivli'],
      bangalore: ['mysore', 'hosur', 'kolar'],
      pune: ['mumbai', 'nashik', 'satara'],
      hyderabad: ['secunderabad', 'telangana'],
      chennai: ['kanchipuram', 'vellore'],
      kolkata: ['howrah', 'west bengal'],
      // Add more cities as needed
    };

    const sameCityTherapists: any[] = [];
    const nearbyCityTherapists: any[] = [];
    const otherTherapists: any[] = [];

    therapists.forEach((therapist) => {
      const therapistCityLower = therapist.user.city?.toLowerCase().trim() || '';

      if (therapistCityLower === userCityLower) {
        sameCityTherapists.push(therapist);
      } else if (nearbyCityMap[userCityLower]?.includes(therapistCityLower)) {
        nearbyCityTherapists.push(therapist);
      } else {
        otherTherapists.push(therapist);
      }
    });

    // Combine: same city > nearby > others
    return [...sameCityTherapists, ...nearbyCityTherapists, ...otherTherapists];
  }

  /**
   * Get single therapist by ID
   */
  async getTherapistById(therapistId: string) {
    try {
      const therapist = await prisma.therapist.findUnique({
        where: { id: therapistId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              profileImage: true,
              bio: true,
              phoneNumber: true,
              city: true,
              state: true,
              gender: true,
              dateOfBirth: true,
            },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              content: true,
              createdAt: true,
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
            take: 5,
          },
          availableSlots: {
            select: {
              id: true,
              dayOfWeek: true,
              startTime: true,
              endTime: true,
              isBooked: true,
            },
          },
        },
      });

      if (!therapist) {
        throw new Error('Therapist not found');
      }

      return therapist;
    } catch (error: any) {
      throw new Error(`Failed to fetch therapist: ${error.message}`);
    }
  }

  /**
   * Get available slots for a therapist on a specific date
   */
  async getAvailableSlots(therapistId: string, date: string) {
    try {
      // Verify therapist exists
      const therapist = await prisma.therapist.findUnique({
        where: { id: therapistId },
      });

      if (!therapist) {
        throw new Error('Therapist not found');
      }

      // Parse date and get day of week
      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getDay();

      // Get availability slots for this day
      const slots = await prisma.availabilitySlot.findMany({
        where: {
          therapistId,
          dayOfWeek,
        },
      });

      if (slots.length === 0) {
        return {
          date,
          dayOfWeek,
          slots: [],
          message: 'No available slots for this day',
        };
      }

      // Check which slots are not booked
      const availableSlots = slots.filter((slot) => !slot.isBooked);

      return {
        date,
        dayOfWeek,
        therapistId,
        slots: availableSlots,
        totalSlots: slots.length,
        availableCount: availableSlots.length,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch available slots: ${error.message}`);
    }
  }

  /**
   * Get reviews for a therapist
   */
  async getTherapistReviews(therapistId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      // Verify therapist exists
      const therapist = await prisma.therapist.findUnique({
        where: { id: therapistId },
      });

      if (!therapist) {
        throw new Error('Therapist not found');
      }

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: { therapistId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.review.count({ where: { therapistId } }),
      ]);

      // Calculate rating distribution
      const ratingDistribution = await prisma.review.groupBy({
        by: ['rating'],
        where: { therapistId },
        _count: true,
      });

      const distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      ratingDistribution.forEach((item: any) => {
        distribution[item.rating as keyof typeof distribution] = item._count;
      });

      return {
        therapistId,
        reviews,
        averageRating: therapist.averageRating,
        totalReviews: therapist.totalReviews,
        ratingDistribution: distribution,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }
  }

  /**
   * Get therapist statistics
   */
  async getTherapistStats(therapistId: string) {
    try {
      const therapist = await prisma.therapist.findUnique({
        where: { id: therapistId },
      });

      if (!therapist) {
        throw new Error('Therapist not found');
      }

      // Get booking statistics
      const bookings = await prisma.therapyBooking.findMany({
        where: { therapistId },
      });

      const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
      const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED');
      const upcomingBookings = bookings.filter((b) => b.status === 'SCHEDULED');

      // Get sessions data
      const sessions = await prisma.sessionRecord.findMany({
        where: { therapistId },
      });

      // Calculate completion rate
      const completionRate =
        bookings.length > 0 ? (completedBookings.length / bookings.length) * 100 : 0;

      return {
        therapistId,
        ratings: {
          average: therapist.averageRating,
          total: therapist.totalReviews,
        },
        bookings: {
          total: bookings.length,
          completed: completedBookings.length,
          cancelled: cancelledBookings.length,
          upcoming: upcomingBookings.length,
          completionRate: Math.round(completionRate),
        },
        sessions: {
          total: sessions.length,
          avgDuration:
            sessions.length > 0
              ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length)
              : 0,
        },
        availability: {
          isAvailable: therapist.isAvailable,
          hourlyRate: therapist.hourlyRate,
        },
        specializations: therapist.specialization,
        yearsOfExperience: therapist.yearsOfExperience,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch therapist stats: ${error.message}`);
    }
  }

  /**
   * Create therapist profile
   */
  async createTherapistProfile(input: CreateTherapistProfileInput) {
    try {
      // Validate required fields
      if (!input.userId || !input.licenseNumber) {
        throw new Error('User ID and license number are required');
      }

      if (input.specialization.length === 0) {
        throw new Error('At least one specialization is required');
      }

      // Check if user exists and is a THERAPIST
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== 'THERAPIST') {
        throw new Error('User must have THERAPIST role');
      }

      // Check if therapist profile already exists
      const existingProfile = await prisma.therapist.findUnique({
        where: { userId: input.userId },
      });

      if (existingProfile) {
        throw new Error('Therapist profile already exists for this user');
      }

      // Check if license number is unique
      const existingLicense = await prisma.therapist.findUnique({
        where: { licenseNumber: input.licenseNumber },
      });

      if (existingLicense) {
        throw new Error('License number already exists');
      }

      // Create therapist profile with availability slots
      const therapist = await prisma.therapist.create({
        data: {
          userId: input.userId,
          licenseNumber: input.licenseNumber,
          specialization: input.specialization,
          certifications: input.certifications || [],
          yearsOfExperience: input.yearsOfExperience,
          hourlyRate: input.hourlyRate || 500,
          availableSlots: input.availableSlots
            ? {
                create: input.availableSlots,
              }
            : undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          availableSlots: true,
        },
      });

      return {
        message: 'Therapist profile created successfully',
        therapist,
      };
    } catch (error: any) {
      throw new Error(`Failed to create therapist profile: ${error.message}`);
    }
  }

  /**
   * Update therapist profile
   */
  async updateTherapistProfile(therapistId: string, input: UpdateTherapistProfileInput) {
    try {
      // Check if therapist exists
      const therapist = await prisma.therapist.findUnique({
        where: { id: therapistId },
      });

      if (!therapist) {
        throw new Error('Therapist not found');
      }

      // Update therapist profile
      const updatedTherapist = await prisma.therapist.update({
        where: { id: therapistId },
        data: {
          specialization: input.specialization,
          certifications: input.certifications,
          yearsOfExperience: input.yearsOfExperience,
          hourlyRate: input.hourlyRate,
          isAvailable: input.isAvailable,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      });

      return {
        message: 'Therapist profile updated successfully',
        therapist: updatedTherapist,
      };
    } catch (error: any) {
      throw new Error(`Failed to update therapist profile: ${error.message}`);
    }
  }

  /**
   * Add or update availability slots
   */
  async updateAvailabilitySlots(
    therapistId: string,
    slots: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>,
  ) {
    try {
      // Verify therapist exists
      const therapist = await prisma.therapist.findUnique({
        where: { id: therapistId },
      });

      if (!therapist) {
        throw new Error('Therapist not found');
      }

      // Delete existing slots
      await prisma.availabilitySlot.deleteMany({
        where: { therapistId },
      });

      // Create new slots
      const newSlots = await prisma.availabilitySlot.createMany({
        data: slots.map((slot) => ({
          therapistId,
          ...slot,
        })),
      });

      return {
        message: 'Availability slots updated successfully',
        count: newSlots.count,
        slots: await prisma.availabilitySlot.findMany({
          where: { therapistId },
        }),
      };
    } catch (error: any) {
      throw new Error(`Failed to update availability slots: ${error.message}`);
    }
  }

  /**
   * Search therapists by name or specialization
   */
  async searchTherapists(query: string, limit: number = 10) {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Search query is required');
      }

      const therapists = await prisma.therapist.findMany({
        where: {
          OR: [
            {
              specialization: {
                hasSome: [query],
              },
            },
            {
              user: {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
          ],
        },
        include: {
          user: {
            select: {
              name: true,
              profileImage: true,
              city: true,
              state: true,
            },
          },
        },
        take: limit,
      });

      return therapists;
    } catch (error: any) {
      throw new Error(`Failed to search therapists: ${error.message}`);
    }
  }
}

export default new TherapistService();
