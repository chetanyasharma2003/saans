#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const Analytics = require('../models/Analytics');
const analyticsData = require('../seeds/analyticsData');
const logger = require('../utils/logger');

async function seedAnalytics() {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoURI) {
      throw new Error('MongoDB URI not configured');
    }

    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB\n');

    const existingCount = await Analytics.countDocuments({});
    if (existingCount > 0) {
      console.log(`⚠️  Database contains ${existingCount} analytics events`);

      const response = await new Promise((resolve) => {
        process.stdout.write('Do you want to delete and recreate? (yes/no): ');
        process.stdin.once('data', (data) => {
          resolve(data.toString().trim().toLowerCase());
        });
      });

      if (response === 'yes' || response === 'y') {
        console.log('\n🗑️  Deleting existing analytics...');
        await Analytics.deleteMany({});
      } else {
        process.exit(0);
      }
    }

    console.log(`\n📈 PHASE 5: ADMIN ANALYTICS SEEDING\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`📊 Seeding ${analyticsData.length} analytics events...\n`);
    const insertedAnalytics = await Analytics.insertMany(analyticsData);

    console.log(`✅ Inserted ${insertedAnalytics.length} analytics events\n`);

    // Calculate stats
    const eventTypeStats = {};
    insertedAnalytics.forEach(event => {
      eventTypeStats[event.eventType] = (eventTypeStats[event.eventType] || 0) + 1;
    });

    const totalRevenue = insertedAnalytics
      .filter(e => e.eventType === 'payment_completed')
      .reduce((sum, e) => sum + (e.metadata?.amount || 0), 0);

    const totalBookings = eventTypeStats['appointment_booked'] || 0;
    const completedAppointments = eventTypeStats['appointment_completed'] || 0;
    const userLogins = eventTypeStats['user_login'] || 0;
    const signups = eventTypeStats['user_signup'] || 0;

    console.log('📊 ANALYTICS SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📈 EVENT BREAKDOWN:');
    Object.entries(eventTypeStats).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log('\n💰 FINANCIAL METRICS:');
    console.log(`   Total Revenue: ₹${totalRevenue.toLocaleString()}`);
    console.log(`   Total Bookings: ${totalBookings}`);
    console.log(`   Completed Sessions: ${completedAppointments}`);
    console.log(`   Completion Rate: ${((completedAppointments / (totalBookings || 1)) * 100).toFixed(2)}%`);

    console.log('\n👥 USER METRICS:');
    console.log(`   Signups: ${signups}`);
    console.log(`   Logins: ${userLogins}`);
    console.log(`   Engagement: ${((userLogins / (signups || 1)) * 100).toFixed(2)}% login rate`);

    console.log('\n📊 FEATURE ADOPTION:');
    const features = ['community_post_created', 'mood_entry_created', 'resource_viewed', 'subscription_started'];
    features.forEach(feature => {
      const count = eventTypeStats[feature] || 0;
      console.log(`   ${feature.replace(/_/g, ' ')}: ${count}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PHASE 5 ANALYTICS SEED COMPLETED!\n');

    logger.info('Analytics seed completed', {
      eventsCount: insertedAnalytics.length,
      totalRevenue,
      timestamp: new Date()
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding analytics:', error.message);
    logger.error('Analytics seed failed', { error: error.message });
    process.exit(1);
  }
}

seedAnalytics();
