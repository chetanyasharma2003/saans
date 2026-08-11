import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function seedTherapists() {
  try {
    console.log('Starting therapist seeding...');

    // First check if therapists already exist
    const existingCount = await prisma.therapist.count();
    if (existingCount > 0) {
      console.log(`Therapists already exist (${existingCount}). Skipping seed.`);
      await prisma.$disconnect();
      return;
    }

    const therapistsData = [
      {
        user: {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@therapist.com',
          password: await bcryptjs.hash('password123', 10),
          role: 'THERAPIST',
          profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
          bio: 'Specializing in cognitive behavioral therapy with 12+ years of experience. Passionate about helping clients overcome anxiety and build resilience.',
          gender: 'Female',
          city: 'New York',
          state: 'NY',
          isActive: true,
        },
        licenseNumber: 'LIC-001-NY',
        specialization: ['Anxiety', 'Depression', 'Stress Management'],
        certifications: ['PhD Psychology', 'CBT Certified', 'Licensed Clinical Psychologist'],
        yearsOfExperience: 12,
        hourlyRate: 80,
        isAvailable: true,
        averageRating: 4.8,
        totalReviews: 42,
      },
      {
        user: {
          name: 'Dr. Michael Chen',
          email: 'michael.chen@therapist.com',
          password: await bcryptjs.hash('password123', 10),
          role: 'THERAPIST',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          bio: 'Trauma-focused therapist with expertise in EMDR and somatic therapies. Dedicated to facilitating deep healing.',
          gender: 'Male',
          city: 'San Francisco',
          state: 'CA',
          isActive: true,
        },
        licenseNumber: 'LIC-002-CA',
        specialization: ['Trauma', 'PTSD', 'Grief Counseling'],
        certifications: ['MA Counseling', 'EMDR Certified', 'Trauma Specialist'],
        yearsOfExperience: 15,
        hourlyRate: 85,
        isAvailable: true,
        averageRating: 4.9,
        totalReviews: 35,
      },
      {
        user: {
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@therapist.com',
          password: await bcryptjs.hash('password123', 10),
          role: 'THERAPIST',
          profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
          bio: 'Specializes in couples and relationship counseling. Believes in building stronger connections through effective communication.',
          gender: 'Female',
          city: 'Austin',
          state: 'TX',
          isActive: true,
        },
        licenseNumber: 'LIC-003-TX',
        specialization: ['Relationship Issues', 'Couples Therapy', 'Communication'],
        certifications: ['MA Clinical Counseling', 'Couples Therapy Specialist', 'NCC'],
        yearsOfExperience: 10,
        hourlyRate: 75,
        isAvailable: true,
        averageRating: 4.7,
        totalReviews: 28,
      },
      {
        user: {
          name: 'Dr. James Wilson',
          email: 'james.wilson@therapist.com',
          password: await bcryptjs.hash('password123', 10),
          role: 'THERAPIST',
          profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
          bio: 'Board-certified psychiatrist offering comprehensive mental health treatment including medication management and psychotherapy.',
          gender: 'Male',
          city: 'Boston',
          state: 'MA',
          isActive: true,
        },
        licenseNumber: 'LIC-004-MA',
        specialization: ['Depression', 'Bipolar Disorder', 'Medication Management'],
        certifications: ['MD Psychiatry', 'Board Certified', 'Addiction Specialist'],
        yearsOfExperience: 18,
        hourlyRate: 90,
        isAvailable: true,
        averageRating: 4.8,
        totalReviews: 40,
      },
      {
        user: {
          name: 'Dr. Priya Patel',
          email: 'priya.patel@therapist.com',
          password: await bcryptjs.hash('password123', 10),
          role: 'THERAPIST',
          profileImage: 'https://images.unsplash.com/photo-1494761681033-6461ffad8d80?w=400&h=400&fit=crop',
          bio: 'Compassionate therapist specializing in eating disorders and body image issues. Integrates mindfulness and acceptance approaches.',
          gender: 'Female',
          city: 'Los Angeles',
          state: 'CA',
          isActive: true,
        },
        licenseNumber: 'LIC-005-CA',
        specialization: ['Eating Disorders', 'Body Image', 'Women\'s Health'],
        certifications: ['MA Counseling', 'Eating Disorder Specialist', 'DBT Certified'],
        yearsOfExperience: 11,
        hourlyRate: 80,
        isAvailable: true,
        averageRating: 4.9,
        totalReviews: 31,
      },
      {
        user: {
          name: 'Dr. Marcus Thompson',
          email: 'marcus.thompson@therapist.com',
          password: await bcryptjs.hash('password123', 10),
          role: 'THERAPIST',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          bio: 'Dedicated addiction counselor with personal recovery experience. Offers evidence-based treatment and unwavering support.',
          gender: 'Male',
          city: 'Miami',
          state: 'FL',
          isActive: true,
        },
        licenseNumber: 'LIC-006-FL',
        specialization: ['Addiction', 'Substance Abuse', 'Recovery'],
        certifications: ['MA Addiction Counseling', 'Certified Addiction Specialist', 'LCSW'],
        yearsOfExperience: 14,
        hourlyRate: 85,
        isAvailable: true,
        averageRating: 4.8,
        totalReviews: 38,
      },
    ];

    console.log(`Creating ${therapistsData.length} therapists...`);

    for (const therapistData of therapistsData) {
      const { user, ...therapistProfile } = therapistData;

      // Create user first
      const createdUser = await prisma.user.create({
        data: user,
      });

      // Create therapist profile linked to user
      await prisma.therapist.create({
        data: {
          userId: createdUser.id,
          ...therapistProfile,
        },
      });

      console.log(`Created therapist: ${user.name}`);
    }

    console.log('✓ Therapist seeding completed successfully');
  } catch (error) {
    console.error('Error seeding therapists:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedTherapists();
