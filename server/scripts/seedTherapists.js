#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const Therapist = require('../models/Therapist');
const therapistData = require('../seeds/therapistData');
const logger = require('../utils/logger');

async function seedTherapists() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoURI) {
      throw new Error('MongoDB URI not configured');
    }

    console.log('📚 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Check if therapists already exist
    const existingCount = await Therapist.countDocuments({});
    if (existingCount > 0) {
      console.log(`⚠️  Database already contains ${existingCount} therapists`);
      const response = await new Promise((resolve) => {
        process.stdout.write('Do you want to delete and recreate? (yes/no): ');
        process.stdin.once('data', (data) => {
          resolve(data.toString().trim().toLowerCase());
        });
      });

      if (response === 'yes' || response === 'y') {
        console.log('🗑️  Deleting existing therapists...');
        await Therapist.deleteMany({});
        console.log('✅ Deleted');
      } else {
        console.log('⏭️  Skipping seed. Exiting.');
        process.exit(0);
      }
    }

    // Insert therapist data
    console.log(`\n🏥 Inserting ${therapistData.length} therapists...`);

    const insertedTherapists = await Therapist.insertMany(therapistData);

    console.log(`✅ Successfully inserted ${insertedTherapists.length} therapists`);

    // Print summary
    console.log('\n📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const summary = {
      total: insertedTherapists.length,
      byCity: {},
      bySpecialty: {},
      byRating: {
        '5.0': 0,
        '4.8-4.9': 0,
        '4.6-4.7': 0,
        'below-4.6': 0
      }
    };

    insertedTherapists.forEach((therapist) => {
      // By city
      const city = therapist.location.city;
      summary.byCity[city] = (summary.byCity[city] || 0) + 1;

      // By specialty
      therapist.specialties.forEach((spec) => {
        summary.bySpecialty[spec] = (summary.bySpecialty[spec] || 0) + 1;
      });

      // By rating
      if (therapist.ratings.average === 5.0) {
        summary.byRating['5.0']++;
      } else if (therapist.ratings.average >= 4.8) {
        summary.byRating['4.8-4.9']++;
      } else if (therapist.ratings.average >= 4.6) {
        summary.byRating['4.6-4.7']++;
      } else {
        summary.byRating['below-4.6']++;
      }
    });

    console.log('\n📍 By City:');
    Object.entries(summary.byCity).forEach(([city, count]) => {
      console.log(`   ${city}: ${count}`);
    });

    console.log('\n🏷️  By Specialty:');
    Object.entries(summary.bySpecialty)
      .sort((a, b) => b[1] - a[1])
      .forEach(([specialty, count]) => {
        console.log(`   ${specialty}: ${count}`);
      });

    console.log('\n⭐ By Rating:');
    Object.entries(summary.byRating).forEach(([rating, count]) => {
      if (count > 0) {
        console.log(`   ${rating}: ${count}`);
      }
    });

    console.log('\n✨ Sample Therapists:');
    insertedTherapists.slice(0, 3).forEach((therapist) => {
      console.log(`\n   ${therapist.firstName} ${therapist.lastName}`);
      console.log(`   📍 ${therapist.location.city}, ${therapist.location.state}`);
      console.log(`   💰 ₹${therapist.pricing.perSession}/session`);
      console.log(`   ⭐ ${therapist.ratings.average} (${therapist.ratings.count} reviews)`);
      console.log(`   📚 Specialties: ${therapist.specialties.join(', ')}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Seed completed successfully!\n');

    logger.info('Therapist seed completed', {
      count: insertedTherapists.length,
      timestamp: new Date()
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding therapists:', error.message);
    logger.error('Therapist seed failed', { error: error.message });
    process.exit(1);
  }
}

// Run seed
seedTherapists();
