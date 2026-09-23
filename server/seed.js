/**
 * Database Seed Script
 * Populates MongoDB with sample data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Appointment.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create sample therapists
    const therapists = [
      {
        firstName: 'Dr. Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@saans.com',
        password: 'password123',
        phone: '+91-9876543210',
        role: 'therapist',
        isTherapist: true,
        licenseNumber: 'LIC-001-2023',
        specialties: ['Anxiety', 'Depression', 'Relationships'],
        experience: 12,
        languages: ['English', 'Hindi'],
        rating: 4.8,
        availability: {
          monday: ['09:00-17:00'],
          wednesday: ['09:00-17:00'],
          friday: ['09:00-17:00'],
        },
        bio: 'Experienced psychologist specializing in anxiety and depression',
      },
      {
        firstName: 'Dr. Raj',
        lastName: 'Patel',
        email: 'raj.patel@saans.com',
        password: 'password123',
        phone: '+91-9876543211',
        role: 'therapist',
        isTherapist: true,
        licenseNumber: 'LIC-002-2023',
        specialties: ['Career Counseling', 'Stress Management'],
        experience: 8,
        languages: ['English', 'Gujarati'],
        rating: 4.7,
        availability: {
          tuesday: ['10:00-18:00'],
          thursday: ['10:00-18:00'],
          saturday: ['10:00-16:00'],
        },
        bio: 'Career counselor helping professionals navigate career transitions',
      },
      {
        firstName: 'Dr. Anjali',
        lastName: 'Verma',
        email: 'anjali.verma@saans.com',
        password: 'password123',
        phone: '+91-9876543212',
        role: 'therapist',
        isTherapist: true,
        licenseNumber: 'LIC-003-2023',
        specialties: ['Family Therapy', 'Relationships', 'Couples Counseling'],
        experience: 15,
        languages: ['English', 'Hindi', 'Marathi'],
        rating: 4.9,
        availability: {
          monday: ['11:00-19:00'],
          wednesday: ['11:00-19:00'],
          friday: ['11:00-19:00'],
          sunday: ['14:00-18:00'],
        },
        bio: 'Family therapist with expertise in relationship counseling',
      },
      {
        firstName: 'Dr. Vikram',
        lastName: 'Singh',
        email: 'vikram.singh@saans.com',
        password: 'password123',
        phone: '+91-9876543213',
        role: 'therapist',
        isTherapist: true,
        licenseNumber: 'LIC-004-2023',
        specialties: ['PTSD', 'Trauma', 'Grief Counseling'],
        experience: 10,
        languages: ['English', 'Hindi', 'Punjabi'],
        rating: 4.6,
        availability: {
          tuesday: ['09:00-17:00'],
          thursday: ['09:00-17:00'],
          saturday: ['09:00-13:00'],
        },
        bio: 'Trauma specialist helping individuals recover from difficult experiences',
      },
      {
        firstName: 'Dr. Maya',
        lastName: 'Gupta',
        email: 'maya.gupta@saans.com',
        password: 'password123',
        phone: '+91-9876543214',
        role: 'therapist',
        isTherapist: true,
        licenseNumber: 'LIC-005-2023',
        specialties: ['Child Psychology', 'Adolescent Issues', 'School Problems'],
        experience: 9,
        languages: ['English', 'Hindi'],
        rating: 4.8,
        availability: {
          monday: ['14:00-20:00'],
          wednesday: ['14:00-20:00'],
          friday: ['14:00-20:00'],
          sunday: ['10:00-14:00'],
        },
        bio: 'Child psychologist helping young people with emotional and behavioral issues',
      },
    ];

    const createdTherapists = await User.create(therapists);
    console.log(`✅ Created ${createdTherapists.length} therapists`);

    // Create sample users
    const users = [
      {
        firstName: 'Rahul',
        lastName: 'Kumar',
        email: 'rahul.kumar@example.com',
        password: 'password123',
        phone: '+91-9000000001',
        role: 'user',
        city: 'Mumbai',
        preferences: {
          preferredLanguage: 'Hindi',
          therapistPreference: 'Female',
          communicationMode: 'video',
        },
      },
      {
        firstName: 'Sneha',
        lastName: 'Desai',
        email: 'sneha.desai@example.com',
        password: 'password123',
        phone: '+91-9000000002',
        role: 'user',
        city: 'Bangalore',
        preferences: {
          preferredLanguage: 'English',
          therapistPreference: 'Male',
          communicationMode: 'audio',
        },
      },
      {
        firstName: 'Arun',
        lastName: 'Nair',
        email: 'arun.nair@example.com',
        password: 'password123',
        phone: '+91-9000000003',
        role: 'user',
        city: 'Delhi',
        preferences: {
          preferredLanguage: 'English',
          therapistPreference: 'Any',
          communicationMode: 'chat',
        },
      },
    ];

    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create sample appointments
    const appointments = [
      {
        userId: createdUsers[0]._id,
        therapistId: createdTherapists[0]._id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        time: '14:00',
        type: 'video',
        duration: 60,
        status: 'scheduled',
        price: 500,
        notes: 'First session - anxiety consultation',
      },
      {
        userId: createdUsers[1]._id,
        therapistId: createdTherapists[2]._id,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        time: '10:00',
        type: 'audio',
        duration: 45,
        status: 'confirmed',
        price: 400,
        notes: 'Couple counseling session',
      },
      {
        userId: createdUsers[2]._id,
        therapistId: createdTherapists[1]._id,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        time: '15:00',
        type: 'video',
        duration: 60,
        status: 'completed',
        price: 450,
        notes: 'Career transition discussion',
        feedback: {
          rating: 5,
          comment: 'Very helpful session, looking forward to next one',
        },
      },
    ];

    const createdAppointments = await Appointment.create(appointments);
    console.log(`✅ Created ${createdAppointments.length} appointments`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📊 Sample Credentials:');
    console.log('   User: rahul.kumar@example.com / password123');
    console.log('   Therapist: priya.sharma@saans.com / password123');
    console.log('\n🚀 Ready to test!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
