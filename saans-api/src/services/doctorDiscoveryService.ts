import { Therapist, Prisma } from '@prisma/client';
import { prisma } from '../utils/prismaClient.js';

export interface DoctorFilterOptions {
  specialization?: string;
  minRating?: number;
  acceptInsurance?: string;
  language?: string;
  availableWithin?: number; // days
  radiusKm?: number;
  acceptsUninsured?: boolean;
}

export interface NearbyDoctorResult extends Therapist {
  distance?: number; // in kilometers
}

export interface DoctorProfileResponse extends Therapist {
  verificationBadges: string[];
  totalVerifiedReviews: number;
}

export class DoctorDiscoveryService {
  /**
   * Find doctors near user location with optional filters
   */
  static async findNearbyDoctors(
    userLat: number,
    userLng: number,
    radiusKm: number = 50,
    filters?: DoctorFilterOptions
  ): Promise<NearbyDoctorResult[]> {
    try {
      // Build where clause based on filters
      const whereClause: Prisma.TherapistWhereInput = {
        isAvailable: true,
        licenseVerificationStatus: 'VERIFIED',
      };

      if (filters?.specialization) {
        whereClause.specialization = {
          has: filters.specialization,
        };
      }

      if (filters?.minRating) {
        whereClause.averageRating = {
          gte: filters.minRating,
        };
      }

      if (filters?.acceptInsurance) {
        whereClause.acceptedInsurance = {
          has: filters.acceptInsurance,
        };
      }

      if (filters?.language) {
        whereClause.languages = {
          has: filters.language,
        };
      }

      if (filters?.acceptsUninsured !== undefined) {
        whereClause.acceptsUninsured = filters.acceptsUninsured;
      }

      // Fetch therapists with coordinates
      const therapists = await prisma.therapist.findMany({
        where: whereClause,
        include: {
          user: true,
          verifiedReviews: true,
          specialtyTags: true,
        },
      });

      // Calculate distance and filter by radius
      const nearbyTherapists = therapists
        .map((therapist) => {
          if (!therapist.latitude || !therapist.longitude) {
            return null;
          }

          const distance = this.calculateDistance(
            userLat,
            userLng,
            therapist.latitude,
            therapist.longitude
          );

          if (distance <= radiusKm) {
            return {
              ...therapist,
              distance,
            } as NearbyDoctorResult;
          }
          return null;
        })
        .filter((t) => t !== null)
        .sort((a, b) => (a!.distance || 0) - (b!.distance || 0));

      return nearbyTherapists as NearbyDoctorResult[];
    } catch (error) {
      console.error('Error finding nearby doctors:', error);
      throw new Error('Failed to find nearby doctors');
    }
  }

  /**
   * Get complete doctor profile with verification status and reviews
   */
  static async getDoctorProfile(
    doctorId: string
  ): Promise<DoctorProfileResponse | null> {
    try {
      const doctor = await prisma.therapist.findUnique({
        where: { id: doctorId },
        include: {
          user: true,
          verifiedReviews: {
            where: { verifiedPatient: true },
            include: { user: true },
          },
          specialtyTags: true,
          availableSlots: true,
        },
      });

      if (!doctor) {
        return null;
      }

      // Build verification badges
      const badges: string[] = [];
      if (doctor.licenseVerificationStatus === 'VERIFIED') {
        badges.push('Licensed');
      }
      if (doctor.credentials?.includes('Board Certified')) {
        badges.push('Board Certified');
      }
      if (doctor.backgroundCheckVerified) {
        badges.push('Background Checked');
      }
      if (doctor.malpracticeInsured) {
        badges.push('Malpractice Insured');
      }

      return {
        ...doctor,
        verificationBadges: badges,
        totalVerifiedReviews: doctor.verifiedReviews.length,
      };
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      throw new Error('Failed to fetch doctor profile');
    }
  }

  /**
   * Match user with suitable doctors based on assessment results
   */
  static async matchUserWithDoctor(
    userId: string,
    specialization?: string,
    preferredLanguage?: string,
    acceptInsurance?: string
  ): Promise<Therapist[]> {
    try {
      const whereClause: Prisma.TherapistWhereInput = {
        isAvailable: true,
        licenseVerificationStatus: 'VERIFIED',
      };

      if (specialization) {
        whereClause.specialization = {
          has: specialization,
        };
      }

      if (preferredLanguage) {
        whereClause.languages = {
          has: preferredLanguage,
        };
      }

      if (acceptInsurance) {
        whereClause.OR = [
          { acceptedInsurance: { has: acceptInsurance } },
          { acceptsUninsured: true },
        ];
      }

      const matches = await prisma.therapist.findMany({
        where: whereClause,
        orderBy: [
          { averageRating: 'desc' },
          { totalReviews: 'desc' },
        ],
        take: 5,
        include: {
          verifiedReviews: true,
          specialtyTags: true,
        },
      });

      return matches;
    } catch (error) {
      console.error('Error matching doctor:', error);
      throw new Error('Failed to match doctor');
    }
  }

  /**
   * Get available slots for doctor booking
   */
  static async getDoctorAvailability(
    doctorId: string,
    daysAhead: number = 30
  ): Promise<Date[]> {
    try {
      const doctor = await prisma.therapist.findUnique({
        where: { id: doctorId },
        include: {
          availableSlots: true,
          therapyBookings: {
            where: {
              scheduledAt: {
                gte: new Date(),
                lte: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      });

      if (!doctor) {
        return [];
      }

      // Generate available dates based on slots and bookings
      const bookedDates = new Set(
        doctor.therapyBookings.map((b) =>
          b.scheduledAt.toISOString().split('T')[0]
        )
      );

      const availableDates: Date[] = [];
      const today = new Date();

      for (let i = 0; i < daysAhead; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        if (!bookedDates.has(dateStr)) {
          availableDates.push(date);
        }
      }

      return availableDates;
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      throw new Error('Failed to fetch doctor availability');
    }
  }

  /**
   * Verify doctor license with external database (implementation depends on provider)
   */
  static async verifyDoctorLicense(
    licenseNumber: string,
    state: string
  ): Promise<boolean> {
    try {
      // TODO: Integrate with state medical board APIs
      // This is a placeholder implementation
      console.log(`Verifying license ${licenseNumber} in ${state}`);

      // For now, just return true if license exists and hasn't expired
      const therapist = await prisma.therapist.findUnique({
        where: { licenseNumber },
      });

      if (!therapist) {
        return false;
      }

      // Check if license is verified
      return therapist.licenseVerificationStatus === 'VERIFIED';
    } catch (error) {
      console.error('Error verifying license:', error);
      return false;
    }
  }

  /**
   * Update doctor verification status
   */
  static async updateVerificationStatus(
    doctorId: string,
    status: 'PENDING' | 'VERIFIED' | 'EXPIRED',
    verificationDate?: Date
  ): Promise<Therapist> {
    try {
      return await prisma.therapist.update({
        where: { id: doctorId },
        data: {
          licenseVerificationStatus: status,
          licenseVerifiedAt: verificationDate || new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw new Error('Failed to update verification status');
    }
  }

  /**
   * Search doctors by multiple criteria
   */
  static async searchDoctors(query: {
    text?: string;
    specializations?: string[];
    minRating?: number;
    languages?: string[];
    verifiedOnly?: boolean;
  }): Promise<Therapist[]> {
    try {
      const whereClause: Prisma.TherapistWhereInput = {};

      if (query.verifiedOnly) {
        whereClause.licenseVerificationStatus = 'VERIFIED';
      }

      if (query.specializations && query.specializations.length > 0) {
        whereClause.specialization = {
          hasSome: query.specializations,
        };
      }

      if (query.minRating) {
        whereClause.averageRating = {
          gte: query.minRating,
        };
      }

      if (query.languages && query.languages.length > 0) {
        whereClause.languages = {
          hasSome: query.languages,
        };
      }

      // TODO: Implement full-text search if needed
      if (query.text) {
        // For now, search by name or bio
        whereClause.OR = [
          { user: { name: { contains: query.text, mode: 'insensitive' } } },
          { bio: { contains: query.text, mode: 'insensitive' } },
        ];
      }

      const doctors = await prisma.therapist.findMany({
        where: whereClause,
        include: {
          user: true,
          verifiedReviews: true,
        },
        orderBy: [
          { averageRating: 'desc' },
          { totalReviews: 'desc' },
        ],
      });

      return doctors;
    } catch (error) {
      console.error('Error searching doctors:', error);
      throw new Error('Failed to search doctors');
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
