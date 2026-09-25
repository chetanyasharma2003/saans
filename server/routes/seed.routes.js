const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Import all seed data
const seedTherapists = require('../seeds/therapistData');
const seedCommunityPosts = require('../seeds/communityPostsData');
const seedResources = require('../seeds/resourcesData');
const seedAppointments = require('../seeds/appointmentsData');
const seedMoodEntries = require('../seeds/moodEntriesData');
const seedSubscriptions = require('../seeds/subscriptionsData');
const seedAnalytics = require('../seeds/analyticsData');

// Import models
const Therapist = require('../models/Therapist');
const CommunityPost = require('../models/CommunityPost');
const MentalHealthResource = require('../models/MentalHealthResource');
const Appointment = require('../models/Appointment');
const MoodEntry = require('../models/MoodEntry');
const Subscription = require('../models/Subscription');
const Analytics = require('../models/Analytics');
const User = require('../models/User');

// Seed all data
router.post('/seed-all', async (req, res) => {
  try {
    logger.info('Starting database seed...');

    // Clear existing data (optional - comment out to preserve)
    await Promise.all([
      Therapist.deleteMany({}),
      CommunityPost.deleteMany({}),
      MentalHealthResource.deleteMany({}),
      Appointment.deleteMany({}),
      MoodEntry.deleteMany({}),
      Subscription.deleteMany({}),
      Analytics.deleteMany({})
    ]);
    logger.info('Cleared existing data');

    // Seed therapists
    const therapists = await Therapist.insertMany(seedTherapists);
    logger.info(`Seeded ${therapists.length} therapists`);

    // Seed resources
    const resources = await MentalHealthResource.insertMany(seedResources);
    logger.info(`Seeded ${resources.length} resources`);

    // Skip appointments for now (Render cache issue)
    const appointments = [];
    logger.info(`Seeded 0 appointments (skipped - will add next)`);

    // Skip mood entries for now (schema mismatch - will fix next)
    const moods = [];
    logger.info(`Seeded 0 mood entries (skipped - will add next)`);

    // Seed subscriptions
    const subs = await Subscription.insertMany(seedSubscriptions);
    logger.info(`Seeded ${subs.length} subscriptions`);

    // Seed community posts
    const posts = await CommunityPost.insertMany(seedCommunityPosts);
    logger.info(`Seeded ${posts.length} community posts`);

    // Seed analytics
    const analytics = await Analytics.insertMany(seedAnalytics);
    logger.info(`Seeded ${analytics.length} analytics events`);

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      summary: {
        therapists: therapists.length,
        resources: resources.length,
        appointments: appointments.length,
        moodEntries: moods.length,
        subscriptions: subs.length,
        posts: posts.length,
        analyticsEvents: analytics.length,
        totalItems: therapists.length + resources.length + appointments.length + moods.length + subs.length + posts.length + analytics.length
      }
    });
  } catch (error) {
    logger.error('Seed error', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
