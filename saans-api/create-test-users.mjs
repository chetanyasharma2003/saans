import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test users...');

  try {
    // Create patient user
    const patientPassword = await bcrypt.hash('Patient@1234', 10);
    const patient = await prisma.user.create({
      data: {
        email: 'patient@test.com',
        password: patientPassword,
        name: 'Test Patient',
        role: 'PATIENT',
        phoneNumber: '9876543210',
        isVerified: true,
        isActive: true,
      }
    });
    console.log('✓ Patient created:', patient.email, 'ID:', patient.id);

    // Create therapist user
    const therapistPassword = await bcrypt.hash('Therapist@1234', 10);
    const therapist = await prisma.user.create({
      data: {
        email: 'therapist@test.com',
        password: therapistPassword,
        name: 'Test Therapist',
        role: 'THERAPIST',
        phoneNumber: '9876543211',
        isVerified: true,
        isActive: true,
      }
    });
    console.log('✓ Therapist created:', therapist.email, 'ID:', therapist.id);

    // Create therapist profile
    const therapistProfile = await prisma.therapist.create({
      data: {
        userId: therapist.id,
        licenseNumber: 'TEST-LIC-001',
        specialization: ['Anxiety', 'Depression', 'Stress'],
        certifications: ['PhD Psychology', 'Licensed Clinical Psychologist'],
        yearsOfExperience: 10,
        hourlyRate: 500,
        isAvailable: true,
      }
    });
    console.log('✓ Therapist profile created');

    // Create availability slots
    const slots = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
    ];

    await prisma.availabilitySlot.createMany({
      data: slots.map(slot => ({
        ...slot,
        therapistId: therapistProfile.id,
        isBooked: false,
      }))
    });
    console.log('✓ Availability slots created:', slots.length);

    console.log('\n✅ Test users created successfully!');
    console.log('\nTest credentials:');
    console.log('Patient: patient@test.com / Patient@1234');
    console.log('Therapist: therapist@test.com / Therapist@1234');

  } catch (error) {
    console.error('Error creating test users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
