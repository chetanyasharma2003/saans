import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.therapyBooking.deleteMany({});
  await prisma.availabilitySlot.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.therapist.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed therapist users and profiles
  const therapistsData = [
    {
      user: {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@therapist.com',
        password: await bcrypt.hash('password123', 10),
        role: 'THERAPIST',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        bio: 'Specializing in cognitive behavioral therapy with 12+ years of experience. Passionate about helping clients overcome anxiety and build resilience.',
        gender: 'Female',
        city: 'New York',
        state: 'NY',
      },
      licenseNumber: 'LIC-001-NY',
      specialization: ['Anxiety', 'Depression', 'Stress Management'],
      certifications: ['PhD Psychology', 'CBT Certified', 'Licensed Clinical Psychologist'],
      yearsOfExperience: 12,
      hourlyRate: 80,
      reviews: [
        { author: 'Alex M.', rating: 5, text: 'Incredibly supportive and professional. Highly recommended!' },
        { author: 'Jordan K.', rating: 5, text: 'Best therapist I\'ve worked with. Life-changing sessions.' },
        { author: 'Casey P.', rating: 4, text: 'Very helpful, great techniques for managing anxiety.' },
      ],
    },
    {
      user: {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@therapist.com',
        password: await bcrypt.hash('password123', 10),
        role: 'THERAPIST',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        bio: 'Trauma-focused therapist with expertise in EMDR and somatic therapies. Dedicated to facilitating deep healing.',
        gender: 'Male',
        city: 'San Francisco',
        state: 'CA',
      },
      licenseNumber: 'LIC-002-CA',
      specialization: ['Trauma', 'PTSD', 'Grief Counseling'],
      certifications: ['MA Counseling', 'EMDR Certified', 'Trauma Specialist'],
      yearsOfExperience: 15,
      hourlyRate: 85,
      reviews: [
        { author: 'Morgan L.', rating: 5, text: 'Helped me process trauma I thought I\'d never heal from.' },
        { author: 'Riley T.', rating: 5, text: 'Compassionate, skilled, and truly cares about clients.' },
        { author: 'Jamie N.', rating: 4, text: 'Professional and supportive environment.' },
      ],
    },
    {
      user: {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@therapist.com',
        password: await bcrypt.hash('password123', 10),
        role: 'THERAPIST',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        bio: 'Specializes in couples and relationship counseling. Believes in building stronger connections through effective communication.',
        gender: 'Female',
        city: 'Austin',
        state: 'TX',
      },
      licenseNumber: 'LIC-003-TX',
      specialization: ['Relationship Issues', 'Couples Therapy', 'Communication'],
      certifications: ['MA Clinical Counseling', 'Couples Therapy Specialist', 'NCC'],
      yearsOfExperience: 10,
      hourlyRate: 75,
      reviews: [
        { author: 'David & Lisa', rating: 5, text: 'Saved our marriage. Emily is amazing!' },
        { author: 'Chris H.', rating: 5, text: 'Helped us communicate better than ever before.' },
        { author: 'Sage A.', rating: 4, text: 'Very knowledgeable in relationship dynamics.' },
      ],
    },
    {
      user: {
        name: 'Dr. James Wilson',
        email: 'james.wilson@therapist.com',
        password: await bcrypt.hash('password123', 10),
        role: 'THERAPIST',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        bio: 'Board-certified psychiatrist offering comprehensive mental health treatment including medication management and psychotherapy.',
        gender: 'Male',
        city: 'Boston',
        state: 'MA',
      },
      licenseNumber: 'LIC-004-MA',
      specialization: ['Depression', 'Bipolar Disorder', 'Medication Management'],
      certifications: ['MD Psychiatry', 'Board Certified', 'Addiction Specialist'],
      yearsOfExperience: 18,
      hourlyRate: 90,
      reviews: [
        { author: 'Patricia M.', rating: 5, text: 'Excellent care and genuinely interested in my wellbeing.' },
        { author: 'Robert D.', rating: 5, text: 'Professional, caring, and very competent.' },
        { author: 'Susan K.', rating: 4, text: 'Great at finding the right treatment approach.' },
      ],
    },
    {
      user: {
        name: 'Dr. Priya Patel',
        email: 'priya.patel@therapist.com',
        password: await bcrypt.hash('password123', 10),
        role: 'THERAPIST',
        profileImage: 'https://images.unsplash.com/photo-1494761681033-6461ffad8d80?w=400&h=400&fit=crop',
        bio: 'Compassionate therapist specializing in eating disorders and body image issues. Integrates mindfulness and acceptance approaches.',
        gender: 'Female',
        city: 'Los Angeles',
        state: 'CA',
      },
      licenseNumber: 'LIC-005-CA',
      specialization: ['Eating Disorders', 'Body Image', 'Women\'s Health'],
      certifications: ['MA Counseling', 'Eating Disorder Specialist', 'DBT Certified'],
      yearsOfExperience: 11,
      hourlyRate: 80,
      reviews: [
        { author: 'Natalie S.', rating: 5, text: 'Finally someone who understands my struggles with body image.' },
        { author: 'Emma W.', rating: 5, text: 'Incredible support and practical strategies.' },
        { author: 'Olivia B.', rating: 4, text: 'Knowledgeable and very supportive therapist.' },
      ],
    },
    {
      user: {
        name: 'Dr. Marcus Thompson',
        email: 'marcus.thompson@therapist.com',
        password: await bcrypt.hash('password123', 10),
        role: 'THERAPIST',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        bio: 'Dedicated addiction counselor with personal recovery experience. Offers evidence-based treatment and unwavering support.',
        gender: 'Male',
        city: 'Miami',
        state: 'FL',
      },
      licenseNumber: 'LIC-006-FL',
      specialization: ['Addiction', 'Substance Abuse', 'Recovery'],
      certifications: ['MA Addiction Counseling', 'Certified Addiction Specialist', 'LCSW'],
      yearsOfExperience: 14,
      hourlyRate: 85,
      reviews: [
        { author: 'Tony R.', rating: 5, text: 'Helped me turn my life around. Changed everything for me.' },
        { author: 'Nicole G.', rating: 5, text: 'Compassionate, knowledgeable, and truly cares.' },
        { author: 'Derek F.', rating: 4, text: 'Great support for recovery journey.' },
      ],
    },
    {
      user: {
        name: 'Dr. Lisa Chen',
        email: 'lisa.chen@therapist.com',
        password: await bcrypt.hash('password123', 10),
        role: 'THERAPIST',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        bio: 'Child and adolescent psychologist with specialized training in ADHD and neurodevelopmental disorders. Makes learning enjoyable.',
        gender: 'Female',
        city: 'Seattle',
        state: 'WA',
      },
      licenseNumber: 'LIC-007-WA',
      specialization: ['ADHD', 'Learning Disorders', 'Child Psychology'],
      certifications: ['PhD Child Psychology', 'ADHD Specialist', 'Board Certified'],
      yearsOfExperience: 13,
      hourlyRate: 75,
      reviews: [
        { author: 'Parent - Jennifer', rating: 5, text: 'Dr. Chen helped my child finally understand their ADHD.' },
        { author: 'Parent - Kevin', rating: 5, text: 'Amazing with kids, very professional and warm.' },
        { author: 'Teacher - Maria', rating: 5, text: 'Great insights and helpful strategies.' },
      ],
    },
    {
      user: {
        name: 'Dr. David Martinez',
        email: 'david.martinez@therapist.com',
        password: await bcrypt.hash('password123', 10),
        role: 'THERAPIST',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        bio: 'Specializes in anxiety, OCD, and panic disorders using evidence-based techniques. Committed to helping clients reclaim their lives.',
        gender: 'Male',
        city: 'Denver',
        state: 'CO',
      },
      licenseNumber: 'LIC-008-CO',
      specialization: ['Anxiety', 'OCD', 'Panic Disorders'],
      certifications: ['PsyD Clinical Psychology', 'OCD Specialist', 'Exposure Therapy Certified'],
      yearsOfExperience: 9,
      hourlyRate: 78,
      reviews: [
        { author: 'Michelle K.', rating: 5, text: 'My anxiety has improved dramatically under Dr. Martinez\'s care.' },
        { author: 'Tom R.', rating: 5, text: 'Knowledgeable, patient, and truly transformative.' },
      ],
    },
  ];

  console.log('Creating therapists...');

  for (const therapistData of therapistsData) {
    try {
      const user = await prisma.user.create({
        data: {
          ...therapistData.user,
          isVerified: true,
          isActive: true,
        },
      });

      const therapist = await prisma.therapist.create({
        data: {
          userId: user.id,
          licenseNumber: therapistData.licenseNumber,
          specialization: therapistData.specialization,
          certifications: therapistData.certifications,
          yearsOfExperience: therapistData.yearsOfExperience,
          hourlyRate: therapistData.hourlyRate,
          isAvailable: true,
          totalReviews: therapistData.reviews.length,
          averageRating: 4.8,
        },
      });

      // Add availability slots (Monday-Friday, 9am-5pm and some evening slots)
      const availability = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' }, // Monday morning
        { dayOfWeek: 1, startTime: '13:00', endTime: '17:00' }, // Monday afternoon
        { dayOfWeek: 1, startTime: '17:00', endTime: '20:00' }, // Monday evening
        { dayOfWeek: 2, startTime: '09:00', endTime: '12:00' }, // Tuesday morning
        { dayOfWeek: 2, startTime: '13:00', endTime: '17:00' }, // Tuesday afternoon
        { dayOfWeek: 3, startTime: '09:00', endTime: '12:00' }, // Wednesday morning
        { dayOfWeek: 3, startTime: '13:00', endTime: '17:00' }, // Wednesday afternoon
        { dayOfWeek: 3, startTime: '17:00', endTime: '20:00' }, // Wednesday evening
        { dayOfWeek: 4, startTime: '09:00', endTime: '12:00' }, // Thursday morning
        { dayOfWeek: 4, startTime: '13:00', endTime: '17:00' }, // Thursday afternoon
        { dayOfWeek: 5, startTime: '09:00', endTime: '12:00' }, // Friday morning
        { dayOfWeek: 5, startTime: '13:00', endTime: '17:00' }, // Friday afternoon
        { dayOfWeek: 6, startTime: '10:00', endTime: '14:00' }, // Saturday
      ];

      await prisma.availabilitySlot.createMany({
        data: availability.map(slot => ({
          ...slot,
          therapistId: therapist.id,
        })),
      });

      console.log(`✓ Created therapist: ${user.name} (${user.email})`);
    } catch (error: any) {
      console.error(`✗ Failed to create therapist: ${error.message}`);
    }
  }

  console.log('Database seed completed successfully!');
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
