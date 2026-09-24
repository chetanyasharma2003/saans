#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const MentalHealthResource = require('../models/MentalHealthResource');
const resourcesData = require('../seeds/resourcesData');
const logger = require('../utils/logger');

async function seedResources() {
  try {
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

    const existingCount = await MentalHealthResource.countDocuments({});
    if (existingCount > 0) {
      console.log(`⚠️  Database already contains ${existingCount} resources`);
      const response = await new Promise((resolve) => {
        process.stdout.write('Do you want to delete and recreate? (yes/no): ');
        process.stdin.once('data', (data) => {
          resolve(data.toString().trim().toLowerCase());
        });
      });

      if (response === 'yes' || response === 'y') {
        console.log('🗑️  Deleting existing resources...');
        await MentalHealthResource.deleteMany({});
      } else {
        process.exit(0);
      }
    }

    console.log(`\n📖 Inserting ${resourcesData.length} mental health guides...\n`);

    const insertedResources = await MentalHealthResource.insertMany(resourcesData);

    console.log(`✅ Successfully inserted ${insertedResources.length} guides\n`);

    console.log('📊 MENTAL HEALTH RESOURCES SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    insertedResources.forEach((resource) => {
      console.log(`\n📌 ${resource.condition.name.toUpperCase()}`);
      console.log(`   ICD-10: ${resource.condition.icd10Code}`);
      console.log(`   📝 Symptoms: ${resource.symptoms.length}`);
      console.log(`   💊 Treatments: ${resource.treatments.length}`);
      console.log(`   💡 Tips: ${resource.selfHelpTips.length}`);
      console.log(`   🆘 Crisis Resources: ${resource.crisisResources.length}`);
      console.log(`   ❓ FAQs: ${resource.faqs.length}`);
      console.log(`   Related: ${resource.relatedConditions.join(', ')}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Resource guides seed completed!\n');

    logger.info('Resource guides seed completed', {
      count: insertedResources.length,
      timestamp: new Date()
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding resources:', error.message);
    logger.error('Resource seed failed', { error: error.message });
    process.exit(1);
  }
}

seedResources();
