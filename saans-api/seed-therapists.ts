import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function seedTherapists() {
  console.log('🌱 Seeding therapist data...\n');

  const therapists_data = [
    {
      user: {
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@therapists.com',
        password: await bcryptjs.hash('SecurePass123!@', 10),
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        bio: 'Licensed Clinical Psychologist with 12+ years of experience in cognitive behavioral therapy and anxiety management.',
        city: 'Mumbai',
        state: 'Maharashtra',
        role: 'THERAPIST' as const,
      },
      therapist: {
        licenseNumber: 'MLHR-2024-001',
        licenseState: 'Maharashtra',
        licenseVerifiedAt: new Date('2024-01-15'),
        licenseVerificationStatus: 'VERIFIED',
        specialization: ['Anxiety', 'Depression', 'CBT'],
        certifications: ['Board Certified Psychologist', 'CBT Certified'],
        credentials: ['PhD Psychology', 'Board Certified'],
        yearsOfExperience: 12,
        languages: ['English', 'Hindi', 'Marathi'],
        hourlyRate: 1500,
        acceptedInsurance: ['Apollo', 'Aditya Birla', 'Star Health'],
        acceptsUninsured: true,
        practiceName: 'Mumbai Mental Health Clinic',
        practiceAddress: 'Defence Colony, Mumbai',
        responseTimeHours: 2,
        isAvailable: true,
        averageRating: 4.8,
        totalReviews: 145,
      }
    },
    {
      user: {
        name: 'Rajesh Patel',
        email: 'rajesh.patel@therapists.com',
        password: await bcryptjs.hash('SecurePass123!@', 10),
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        bio: 'Specialist in relationship counseling, trauma-informed therapy, and life coaching with 8 years of experience.',
        city: 'Delhi',
        state: 'Delhi',
        role: 'THERAPIST' as const,
      },
      therapist: {
        licenseNumber: 'DLH-2024-002',
        licenseState: 'Delhi',
        licenseVerifiedAt: new Date('2024-02-20'),
        licenseVerificationStatus: 'VERIFIED',
        specialization: ['Relationships', 'Trauma', 'Life Coaching'],
        certifications: ['Trauma-Informed Therapist', 'Couples Counselor'],
        credentials: ['Masters in Psychology'],
        yearsOfExperience: 8,
        languages: ['English', 'Hindi', 'Punjabi'],
        hourlyRate: 1200,
        acceptedInsurance: ['ICICI Lombard', 'HDFC Ergo'],
        acceptsUninsured: true,
        practiceName: 'Delhi Wellness Center',
        practiceAddress: 'Connaught Place, Delhi',
        responseTimeHours: 4,
        isAvailable: true,
        averageRating: 4.6,
        totalReviews: 98,
      }
    },
    {
      user: {
        name: 'Anjali Desai',
        email: 'anjali.desai@therapists.com',
        password: await bcryptjs.hash('SecurePass123!@', 10),
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        bio: 'Psychologist specializing in adolescent therapy, student stress, and family dynamics. Online and in-person sessions available.',
        city: 'Bangalore',
        state: 'Karnataka',
        role: 'THERAPIST' as const,
      },
      therapist: {
        licenseNumber: 'KAR-2024-003',
        licenseState: 'Karnataka',
        licenseVerifiedAt: new Date('2024-01-10'),
        licenseVerificationStatus: 'VERIFIED',
        specialization: ['Adolescent Therapy', 'Student Stress', 'Family Therapy'],
        certifications: ['Child & Adolescent Psychologist', 'Family Therapist'],
        credentials: ['Masters in Clinical Psychology'],
        yearsOfExperience: 10,
        languages: ['English', 'Kannada', 'Hindi'],
        hourlyRate: 1300,
        acceptedInsurance: ['Bajaj Allianz', 'Care Health'],
        acceptsUninsured: true,
        practiceName: 'Bangalore Therapy Associates',
        practiceAddress: 'Indiranagar, Bangalore',
        responseTimeHours: 3,
        isAvailable: true,
        averageRating: 4.7,
        totalReviews: 112,
      }
    },
    {
      user: {
        name: 'Dr. Vikram Singh',
        email: 'vikram.singh@therapists.com',
        password: await bcryptjs.hash('SecurePass123!@', 10),
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        bio: 'Senior psychiatrist and therapist. Expertise in mood disorders, medication management, and integrative mental health approach.',
        city: 'Pune',
        state: 'Maharashtra',
        role: 'THERAPIST' as const,
      },
      therapist: {
        licenseNumber: 'MHR-2024-004',
        licenseState: 'Maharashtra',
        licenseVerifiedAt: new Date('2023-12-01'),
        licenseVerificationStatus: 'VERIFIED',
        specialization: ['Mood Disorders', 'Depression', 'Bipolar Disorder'],
        certifications: ['Board Certified Psychiatrist', 'Psychopharmacology Certified'],
        credentials: ['MD Psychiatry', 'Board Certified'],
        yearsOfExperience: 15,
        languages: ['English', 'Hindi', 'Marathi'],
        hourlyRate: 2000,
        acceptedInsurance: ['United India', 'New India Assurance'],
        acceptsUninsured: true,
        practiceName: 'Pune Psychiatric Center',
        practiceAddress: 'Kalyani Nagar, Pune',
        responseTimeHours: 1,
        isAvailable: true,
        averageRating: 4.9,
        totalReviews: 267,
      }
    },
    {
      user: {
        name: 'Neha Kapoor',
        email: 'neha.kapoor@therapists.com',
        password: await bcryptjs.hash('SecurePass123!@', 10),
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        bio: 'Certified life coach and wellness counselor. Specializes in career transitions, work-life balance, and personal development.',
        city: 'Hyderabad',
        state: 'Telangana',
        role: 'THERAPIST' as const,
      },
      therapist: {
        licenseNumber: 'TLG-2024-005',
        licenseState: 'Telangana',
        licenseVerifiedAt: new Date('2024-01-05'),
        licenseVerificationStatus: 'VERIFIED',
        specialization: ['Life Coaching', 'Career Counseling', 'Wellness'],
        certifications: ['Certified Life Coach', 'Career Counselor'],
        credentials: ['Bachelor in Psychology'],
        yearsOfExperience: 6,
        languages: ['English', 'Hindi', 'Telugu'],
        hourlyRate: 1000,
        acceptedInsurance: ['Reliance General', 'Digit'],
        acceptsUninsured: true,
        practiceName: 'Hyderabad Wellness Hub',
        practiceAddress: 'Hitech City, Hyderabad',
        responseTimeHours: 6,
        isAvailable: true,
        averageRating: 4.5,
        totalReviews: 67,
      }
    },
  ];

  for (const data of therapists_data) {
    try {
      const result = await prisma.user.create({
        data: {
          ...data.user,
          therapist: {
            create: data.therapist,
          },
        },
        include: { therapist: true },
      });

      console.log(`✅ Created: ${result.name} (${result.email})`);
      console.log(`   License: ${result.therapist?.licenseVerificationStatus}`);
      console.log(`   Experience: ${result.therapist?.yearsOfExperience}+ years`);
      console.log(`   Rating: ${result.therapist?.averageRating} ⭐\n`);
    } catch (error: any) {
      console.error(`❌ Error creating ${data.user.name}:`, error.message);
    }
  }

  await prisma.$disconnect();
  console.log('✅ Seeding complete!');
}

seedTherapists().catch(error => {
  console.error('Seed failed:', error);
  process.exit(1);
});
