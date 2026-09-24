const mongoose = require('mongoose');

// Generate 30 days of analytics events
function generateAnalyticsData() {
  const events = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30);

  const userIds = [
    '507f1f77bcf86cd799439010',
    '507f1f77bcf86cd799439011',
    '507f1f77bcf86cd799439012',
    '507f1f77bcf86cd799439013',
    '507f1f77bcf86cd799439014',
    '507f1f77bcf86cd799439015',
    '507f1f77bcf86cd799439016',
    '507f1f77bcf86cd799439017',
    '507f1f77bcf86cd799439018',
  ].map(id => new mongoose.Types.ObjectId(id));

  const therapistIds = [
    '507f1f77bcf86cd799439001',
    '507f1f77bcf86cd799439002',
    '507f1f77bcf86cd799439003',
    '507f1f77bcf86cd799439004',
    '507f1f77bcf86cd799439005',
    '507f1f77bcf86cd799439006',
  ].map(id => new mongoose.Types.ObjectId(id));

  // Day-by-day events
  for (let day = 0; day < 30; day++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() + day);
    const dateOnly = new Date(currentDate.setHours(0, 0, 0, 0));

    // User Signups (2-4 per day)
    const signupCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < signupCount; i++) {
      events.push({
        eventType: 'user_signup',
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        timestamp: new Date(currentDate.getTime() + Math.random() * 86400000),
        date: dateOnly
      });
    }

    // User Logins (8-15 per day)
    const loginCount = Math.floor(Math.random() * 8) + 8;
    for (let i = 0; i < loginCount; i++) {
      events.push({
        eventType: 'user_login',
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        timestamp: new Date(currentDate.getTime() + Math.random() * 86400000),
        date: dateOnly
      });
    }

    // Appointments Booked (1-3 per day)
    const bookCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < bookCount; i++) {
      events.push({
        eventType: 'appointment_booked',
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        therapistId: therapistIds[Math.floor(Math.random() * therapistIds.length)],
        metadata: {
          amount: [750, 800, 900, 1000, 1100, 1200, 1300][Math.floor(Math.random() * 7)],
          currency: 'INR',
          duration: [45, 60, 90][Math.floor(Math.random() * 3)]
        },
        timestamp: new Date(currentDate.getTime() + Math.random() * 86400000),
        date: dateOnly
      });
    }

    // Appointments Completed (1-2 per day)
    if (day > 7) { // Only after week 1
      const completeCount = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < completeCount; i++) {
        events.push({
          eventType: 'appointment_completed',
          userId: userIds[Math.floor(Math.random() * userIds.length)],
          therapistId: therapistIds[Math.floor(Math.random() * therapistIds.length)],
          metadata: {
            duration: [45, 60, 90][Math.floor(Math.random() * 3)],
            rating: Math.floor(Math.random() * 2) + 4 // 4-5 stars
          },
          timestamp: new Date(currentDate.getTime() + Math.random() * 86400000),
          date: dateOnly
        });
      }
    }

    // Therapist Ratings (0-2 per day)
    if (Math.random() > 0.6) {
      events.push({
        eventType: 'therapist_rated',
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        therapistId: therapistIds[Math.floor(Math.random() * therapistIds.length)],
        metadata: {
          rating: Math.floor(Math.random() * 2) + 4
        },
        timestamp: new Date(currentDate.getTime() + Math.random() * 86400000),
        date: dateOnly
      });
    }

    // Community Posts Created (2-5 per day)
    const postCount = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < postCount; i++) {
      events.push({
        eventType: 'community_post_created',
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        metadata: {
          category: ['depression', 'anxiety', 'stress', 'sleep', 'relationships'][Math.floor(Math.random() * 5)]
        },
        timestamp: new Date(currentDate.getTime() + Math.random() * 86400000),
        date: dateOnly
      });
    }

    // Community Upvotes (10-25 per day)
    const upvoteCount = Math.floor(Math.random() * 16) + 10;
    for (let i = 0; i < upvoteCount; i++) {
      events.push({
        eventType: 'community_post_upvoted',
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        timestamp: new Date(currentDate.getTime() + Math.random() * 86400000),
        date: dateOnly
      });
    }

    // Resources Viewed (15-40 per day)
    const viewCount = Math.floor(Math.random() * 26) + 15;
    for (let i = 0; i < viewCount; i++) {
      events.push({
        eventType: 'resource_viewed',
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        metadata: {
          category: ['depression', 'anxiety', 'sleep', 'stress', 'ptsd'][Math.floor(Math.random() * 5)]
        },
        timestamp: new Date(currentDate.getTime() + Math.random() * 86400000),
        date: dateOnly
      });
    }

    // Mood Entries (4-8 per day)
    const moodCount = Math.floor(Math.random() * 5) + 4;
    for (let i = 0; i < moodCount; i++) {
      events.push({
        eventType: 'mood_entry_created',
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        metadata: {
          moodScore: Math.floor(Math.random() * 5) + 1
        },
        timestamp: new Date(currentDate.getTime() + Math.random() * 86400000),
        date: dateOnly
      });
    }

    // Subscriptions Started (0-2 per day)
    if (Math.random() > 0.5 && day > 5) {
      events.push({
        eventType: 'subscription_started',
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        metadata: {
          plan: ['basic', 'premium', 'elite'][Math.floor(Math.random() * 3)],
          amount: [999, 2999, 5999][Math.floor(Math.random() * 3)],
          currency: 'INR'
        },
        timestamp: new Date(currentDate.getTime() + Math.random() * 86400000),
        date: dateOnly
      });
    }

    // Payments Completed (1-3 per day)
    const paymentCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < paymentCount; i++) {
      const amounts = [999, 1200, 1500, 2999, 5999];
      events.push({
        eventType: 'payment_completed',
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        metadata: {
          amount: amounts[Math.floor(Math.random() * amounts.length)],
          currency: 'INR',
          status: 'success'
        },
        timestamp: new Date(currentDate.getTime() + Math.random() * 86400000),
        date: dateOnly
      });
    }

    // Messages Sent (5-15 per day)
    const messageCount = Math.floor(Math.random() * 11) + 5;
    for (let i = 0; i < messageCount; i++) {
      events.push({
        eventType: 'message_sent',
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        therapistId: therapistIds[Math.floor(Math.random() * therapistIds.length)],
        timestamp: new Date(currentDate.getTime() + Math.random() * 86400000),
        date: dateOnly
      });
    }
  }

  return events;
}

module.exports = generateAnalyticsData();
