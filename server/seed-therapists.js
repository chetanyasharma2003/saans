const { sequelize, Therapist } = require('./config/database');
const { v4: uuidv4 } = require('uuid');

const therapistsData = [
  {
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@therapist.com',
    phone: '+1-800-THERAPY1',
    bio: 'Specializing in anxiety and depression with 12+ years of experience. Compassionate and evidence-based approach.',
    specializations: ['Anxiety', 'Depression', 'CBT'],
    languages: ['English', 'Spanish'],
    qualifications: ['PhD in Clinical Psychology', 'Licensed Professional Counselor'],
    licenseNumber: 'LPC-12345-CA',
    yearsOfExperience: 12,
    hourlyRate: 1500,
    isVerified: true,
    isActive: true,
    rating: 4.9,
    totalRatings: 247,
    sessionsCompleted: 1200,
    responseTime: 'Within 30 minutes',
    location: 'San Francisco, CA',
    city: 'San Francisco',
    country: 'USA',
    timezone: 'PST',
    acceptNewClients: true,
    consultationType: ['online', 'phone'],
    profileCompleteness: 95
  },
  {
    firstName: 'Dr. Michael',
    lastName: 'Chen',
    email: 'michael.chen@therapist.com',
    phone: '+1-800-THERAPY2',
    bio: 'Trauma-informed therapist with expertise in PTSD and complex trauma. 15 years clinical experience.',
    specializations: ['PTSD', 'Trauma', 'EMDR'],
    languages: ['English', 'Mandarin', 'Cantonese'],
    qualifications: ['LCSW', 'Certified EMDR Therapist'],
    licenseNumber: 'LCSW-67890-NY',
    yearsOfExperience: 15,
    hourlyRate: 1800,
    isVerified: true,
    isActive: true,
    rating: 4.8,
    totalRatings: 189,
    sessionsCompleted: 950,
    responseTime: 'Within 1 hour',
    location: 'New York, NY',
    city: 'New York',
    country: 'USA',
    timezone: 'EST',
    acceptNewClients: true,
    consultationType: ['online'],
    profileCompleteness: 92
  },
  {
    firstName: 'Dr. Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@therapist.com',
    phone: '+1-800-THERAPY3',
    bio: 'Relationship counselor and family therapist. Helping couples and families heal and grow.',
    specializations: ['Relationship Counseling', 'Family Therapy', 'Couples Therapy'],
    languages: ['English', 'Spanish', 'Portuguese'],
    qualifications: ['MA in Counseling', 'Marriage and Family Therapist'],
    licenseNumber: 'LMFT-11111-TX',
    yearsOfExperience: 10,
    hourlyRate: 1400,
    isVerified: true,
    isActive: true,
    rating: 4.7,
    totalRatings: 156,
    sessionsCompleted: 780,
    responseTime: 'Within 2 hours',
    location: 'Austin, TX',
    city: 'Austin',
    country: 'USA',
    timezone: 'CST',
    acceptNewClients: true,
    consultationType: ['online', 'phone'],
    profileCompleteness: 90
  },
  {
    firstName: 'Dr. James',
    lastName: 'Wilson',
    email: 'james.wilson@therapist.com',
    phone: '+1-800-THERAPY4',
    bio: 'Cognitive behavioral therapist specializing in OCD and anxiety disorders. Proven track record.',
    specializations: ['OCD', 'Anxiety', 'CBT'],
    languages: ['English'],
    qualifications: ['PhD in Psychology', 'Board Certified Psychologist'],
    licenseNumber: 'PSY-22222-FL',
    yearsOfExperience: 14,
    hourlyRate: 1700,
    isVerified: true,
    isActive: true,
    rating: 4.9,
    totalRatings: 203,
    sessionsCompleted: 1100,
    responseTime: 'Within 45 minutes',
    location: 'Miami, FL',
    city: 'Miami',
    country: 'USA',
    timezone: 'EST',
    acceptNewClients: false,
    consultationType: ['online'],
    profileCompleteness: 93
  },
  {
    firstName: 'Dr. Lisa',
    lastName: 'Patel',
    email: 'lisa.patel@therapist.com',
    phone: '+1-800-THERAPY5',
    bio: 'Behavioral health specialist focusing on addiction and substance abuse recovery.',
    specializations: ['Addiction', 'Substance Abuse', 'Recovery'],
    languages: ['English', 'Hindi', 'Gujarati'],
    qualifications: ['LCSW', 'Addiction Counselor Certification'],
    licenseNumber: 'LCSW-33333-IL',
    yearsOfExperience: 11,
    hourlyRate: 1300,
    isVerified: true,
    isActive: true,
    rating: 4.6,
    totalRatings: 134,
    sessionsCompleted: 650,
    responseTime: 'Within 1 hour',
    location: 'Chicago, IL',
    city: 'Chicago',
    country: 'USA',
    timezone: 'CST',
    acceptNewClients: true,
    consultationType: ['online', 'phone'],
    profileCompleteness: 88
  },
  {
    firstName: 'Dr. Robert',
    lastName: 'Thompson',
    email: 'robert.thompson@therapist.com',
    phone: '+1-800-THERAPY6',
    bio: 'Child and adolescent psychologist with expertise in behavioral issues and developmental concerns.',
    specializations: ['Child Psychology', 'Adolescent', 'Behavioral Issues'],
    languages: ['English'],
    qualifications: ['PhD in Child Psychology', 'Licensed Psychologist'],
    licenseNumber: 'PSY-44444-CA',
    yearsOfExperience: 16,
    hourlyRate: 1600,
    isVerified: true,
    isActive: true,
    rating: 4.8,
    totalRatings: 178,
    sessionsCompleted: 920,
    responseTime: 'Within 1 hour',
    location: 'Los Angeles, CA',
    city: 'Los Angeles',
    country: 'USA',
    timezone: 'PST',
    acceptNewClients: true,
    consultationType: ['online', 'phone'],
    profileCompleteness: 94
  },
  {
    firstName: 'Dr. Amanda',
    lastName: 'Martinez',
    email: 'amanda.martinez@therapist.com',
    phone: '+1-800-THERAPY7',
    bio: 'Mindfulness-based therapist specializing in stress management and work-life balance.',
    specializations: ['Mindfulness', 'Stress Management', 'Meditation'],
    languages: ['English', 'Spanish'],
    qualifications: ['MA in Psychology', 'Mindfulness Certified'],
    licenseNumber: 'LPC-55555-CO',
    yearsOfExperience: 9,
    hourlyRate: 1200,
    isVerified: true,
    isActive: true,
    rating: 4.7,
    totalRatings: 142,
    sessionsCompleted: 680,
    responseTime: 'Within 2 hours',
    location: 'Denver, CO',
    city: 'Denver',
    country: 'USA',
    timezone: 'MST',
    acceptNewClients: true,
    consultationType: ['online'],
    profileCompleteness: 87
  },
  {
    firstName: 'Dr. David',
    lastName: 'Anderson',
    email: 'david.anderson@therapist.com',
    phone: '+1-800-THERAPY8',
    bio: 'Existential and humanistic therapist helping clients find meaning and purpose in life.',
    specializations: ['Existential Therapy', 'Life Transitions', 'Meaning'],
    languages: ['English', 'German'],
    qualifications: ['PhD in Psychology', 'Existential Therapy Certified'],
    licenseNumber: 'PSY-66666-WA',
    yearsOfExperience: 13,
    hourlyRate: 1500,
    isVerified: true,
    isActive: true,
    rating: 4.6,
    totalRatings: 98,
    sessionsCompleted: 520,
    responseTime: 'Within 3 hours',
    location: 'Seattle, WA',
    city: 'Seattle',
    country: 'USA',
    timezone: 'PST',
    acceptNewClients: true,
    consultationType: ['online', 'phone'],
    profileCompleteness: 89
  }
];

async function seedTherapists() {
  try {
    console.log('🌱 Seeding therapists...');

    // Clear existing therapists
    await Therapist.destroy({ where: {} });
    console.log('✅ Cleared existing therapists');

    // Create new therapists
    const created = await Therapist.bulkCreate(therapistsData);
    console.log(`✅ Created ${created.length} therapists`);

    console.log('\n📊 Therapist Summary:');
    const stats = await Therapist.findAll({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'avgRating'],
        [require('sequelize').fn('SUM', require('sequelize').col('sessionsCompleted')), 'totalSessions']
      ],
      raw: true
    });

    if (stats[0]) {
      console.log(`Total Therapists: ${stats[0].total}`);
      console.log(`Average Rating: ${parseFloat(stats[0].avgRating).toFixed(2)}/5`);
      console.log(`Total Sessions: ${stats[0].totalSessions}`);
    }

    console.log('\n✨ Therapist seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding therapists:', error);
  } finally {
    await sequelize.close();
  }
}

seedTherapists();
