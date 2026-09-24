#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const MoodEntry = require('../models/MoodEntry');
const Subscription = require('../models/Subscription');
const appointmentsData = require('../seeds/appointmentsData');
const moodEntriesData = require('../seeds/moodEntriesData');
const subscriptionsData = require('../seeds/subscriptionsData');
const logger = require('../utils/logger');

async function seedPhase4() {
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

    // Check existing data
    const appointmentCount = await Appointment.countDocuments({});
    const moodCount = await MoodEntry.countDocuments({});
    const subscriptionCount = await Subscription.countDocuments({});

    if (appointmentCount > 0 || moodCount > 0 || subscriptionCount > 0) {
      console.log(`⚠️  Database contains existing data:`);
      console.log(`   📅 Appointments: ${appointmentCount}`);
      console.log(`   😊 Mood Entries: ${moodCount}`);
      console.log(`   💳 Subscriptions: ${subscriptionCount}\n`);

      const response = await new Promise((resolve) => {
        process.stdout.write('Do you want to delete and recreate? (yes/no): ');
        process.stdin.once('data', (data) => {
          resolve(data.toString().trim().toLowerCase());
        });
      });

      if (response === 'yes' || response === 'y') {
        console.log('\n🗑️  Deleting existing data...');
        await Appointment.deleteMany({});
        await MoodEntry.deleteMany({});
        await Subscription.deleteMany({});
      } else {
        process.exit(0);
      }
    }

    console.log('\n⚡ PHASE 4: RAMPAGE MODE DATA SEEDING\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. Seed Appointments
    console.log(`📅 Seeding ${appointmentsData.length} appointments...`);
    const appointments = await Appointment.insertMany(appointmentsData);
    console.log(`✅ Inserted ${appointments.length} appointments\n`);

    const appointmentStats = {
      completed: appointments.filter(a => a.status === 'completed').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      avgRating: (appointments.filter(a => a.rating).reduce((sum, a) => sum + a.rating, 0) / appointments.filter(a => a.rating).length).toFixed(2),
      totalRevenue: appointments.reduce((sum, a) => sum + a.price, 0),
      modes: [...new Set(appointments.map(a => a.mode))]
    };

    console.log('📊 APPOINTMENTS SUMMARY:');
    console.log(`   ✅ Completed: ${appointmentStats.completed}`);
    console.log(`   📋 Confirmed: ${appointmentStats.confirmed}`);
    console.log(`   ⭐ Avg Rating: ${appointmentStats.avgRating}`);
    console.log(`   💰 Total Revenue: ₹${appointmentStats.totalRevenue.toLocaleString()}`);
    console.log(`   📞 Modes: ${appointmentStats.modes.join(', ')}\n`);

    // 2. Seed Mood Entries
    console.log(`😊 Seeding ${moodEntriesData.length} mood entries...`);
    const moodEntries = await MoodEntry.insertMany(moodEntriesData);
    console.log(`✅ Inserted ${moodEntries.length} mood entries\n`);

    const moodStats = {
      avgScore: (moodEntries.reduce((sum, m) => sum + m.moodScore, 0) / moodEntries.length).toFixed(2),
      avgSleepHours: (moodEntries.reduce((sum, m) => sum + m.sleepHours, 0) / moodEntries.length).toFixed(1),
      entriesPerUser: moodEntries.length / new Set(moodEntries.map(m => m.userId.toString())).size,
      daysCovered: Math.max(...moodEntries.map(m => m.date)) - Math.min(...moodEntries.map(m => m.date))
    };

    console.log('📊 MOOD TRACKING SUMMARY:');
    console.log(`   😊 Avg Mood Score: ${moodStats.avgScore}/5`);
    console.log(`   😴 Avg Sleep: ${moodStats.avgSleepHours} hours`);
    console.log(`   📈 Entries per User: ${Math.round(moodStats.entriesPerUser)}`);
    console.log(`   📅 Data Span: 30 days of history\n`);

    // 3. Seed Subscriptions
    console.log(`💳 Seeding ${subscriptionsData.length} subscriptions...`);
    const subscriptions = await Subscription.insertMany(subscriptionsData);
    console.log(`✅ Inserted ${subscriptions.length} subscriptions\n`);

    const subStats = {
      active: subscriptions.filter(s => s.status === 'active').length,
      paused: subscriptions.filter(s => s.status === 'paused').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      byPlan: {
        basic: subscriptions.filter(s => s.plan === 'basic').length,
        premium: subscriptions.filter(s => s.plan === 'premium').length,
        elite: subscriptions.filter(s => s.plan === 'elite').length
      },
      totalMRR: subscriptions
        .filter(s => s.status === 'active' && s.planDetails.billingCycle === 'monthly')
        .reduce((sum, s) => sum + s.planDetails.price, 0),
      avgSessionsUsed: (subscriptions.reduce((sum, s) => sum + s.sessionsUsed, 0) / subscriptions.length).toFixed(1)
    };

    console.log('💳 SUBSCRIPTIONS SUMMARY:');
    console.log(`   ✅ Active: ${subStats.active}`);
    console.log(`   ⏸️  Paused: ${subStats.paused}`);
    console.log(`   ❌ Cancelled: ${subStats.cancelled}`);
    console.log(`   📊 By Plan: Basic=${subStats.byPlan.basic}, Premium=${subStats.byPlan.premium}, Elite=${subStats.byPlan.elite}`);
    console.log(`   💰 Monthly Recurring Revenue: ₹${subStats.totalMRR.toLocaleString()}`);
    console.log(`   📊 Avg Sessions Used: ${subStats.avgSessionsUsed}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PHASE 4 DATA SEED COMPLETED!\n');

    logger.info('Phase 4 seed completed', {
      appointments: appointments.length,
      moodEntries: moodEntries.length,
      subscriptions: subscriptions.length,
      timestamp: new Date()
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Phase 4 data:', error.message);
    logger.error('Phase 4 seed failed', { error: error.message });
    process.exit(1);
  }
}

seedPhase4();
