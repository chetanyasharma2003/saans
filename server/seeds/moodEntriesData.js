const mongoose = require('mongoose');

// Generate mood entries showing progression over 30 days
function generateMoodEntries() {
  const entries = [];
  const userId1 = new mongoose.Types.ObjectId('507f1f77bcf86cd799439010');
  const userId2 = new mongoose.Types.ObjectId('507f1f77bcf86cd799439012');
  const userId3 = new mongoose.Types.ObjectId('507f1f77bcf86cd799439014');

  const moods = ['very-sad', 'sad', 'neutral', 'happy', 'very-happy'];
  const activities = ['exercise', 'meditation', 'journaling', 'socializing', 'sleep', 'therapy', 'work', 'hobby'];
  const triggers = ['work-stress', 'family', 'health', 'finances', 'relationships', 'sleep-deprivation'];

  // User 1: Showing improvement over time (starting low, going up)
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(20, 0, 0, 0);

    const moodScore = Math.min(5, Math.floor(2 + (30 - i) * 0.08)); // Progressive improvement
    entries.push({
      userId: userId1,
      date,
      moodScore,
      mood: moods[moodScore - 1],
      energyLevel: Math.max(1, moodScore - 1),
      sleepQuality: Math.floor(Math.random() * 5) + 1,
      sleepHours: Math.floor(Math.random() * 3) + 5,
      activitiesTracked: [activities[Math.floor(Math.random() * activities.length)]],
      positiveEvents: i % 5 === 0 ? ['Completed therapy session', 'Good day at work'] : [],
      triggers: i % 7 === 0 ? [triggers[Math.floor(Math.random() * triggers.length)]] : [],
      notes: i % 3 === 0 ? `Day ${30 - i}: Feeling ${moods[moodScore - 1].replace('-', ' ')}` : '',
      gratitudeList: i % 2 === 0 ? ['Family support', 'Good health', 'Therapy helping'] : [],
      anxietyLevel: Math.max(1, 6 - moodScore),
      stressLevel: Math.max(1, 6 - moodScore),
      createdAt: date
    });
  }

  // User 2: Fluctuating mood
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(21, 30, 0, 0);

    const moodScore = (i % 5) === 0 ? 2 : (i % 3) === 0 ? 4 : 3;
    entries.push({
      userId: userId2,
      date,
      moodScore,
      mood: moods[moodScore - 1],
      energyLevel: Math.max(1, moodScore - 1),
      sleepQuality: Math.floor(Math.random() * 5) + 1,
      sleepHours: Math.floor(Math.random() * 4) + 5,
      activitiesTracked: [activities[Math.floor(Math.random() * activities.length)]],
      triggers: i % 5 === 0 ? [triggers[Math.floor(Math.random() * triggers.length)]] : [],
      anxietyLevel: 6 - moodScore,
      stressLevel: 6 - moodScore,
      createdAt: date
    });
  }

  // User 3: Mostly stable/positive
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(19, 0, 0, 0);

    const moodScore = Math.max(3, Math.floor(4 + Math.random() * 2));
    entries.push({
      userId: userId3,
      date,
      moodScore,
      mood: moods[moodScore - 1],
      energyLevel: Math.max(2, moodScore - 1),
      sleepQuality: Math.floor(Math.random() * 5) + 2,
      sleepHours: Math.floor(Math.random() * 2) + 7,
      activitiesTracked: [activities[Math.floor(Math.random() * activities.length)]],
      positiveEvents: i % 4 === 0 ? ['Work success', 'Good social interaction'] : [],
      gratitudeList: ['Therapy progress', 'Family', 'Health improvements'],
      anxietyLevel: Math.max(1, 4 - moodScore),
      stressLevel: Math.max(1, 4 - moodScore),
      createdAt: date
    });
  }

  return entries;
}

module.exports = generateMoodEntries();
