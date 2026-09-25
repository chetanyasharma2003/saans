const mongoose = require('mongoose');

function generateMoodEntries() {
  const entries = [];
  const userIds = [
    new mongoose.Types.ObjectId('507f1f77bcf86cd799439010'),
    new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    new mongoose.Types.ObjectId('507f1f77bcf86cd799439014')
  ];

  const moodLabels = {
    1: 'very-sad',
    2: 'sad',
    3: 'neutral',
    4: 'happy',
    5: 'very-happy',
    6: 'happy',
    7: 'very-happy',
    8: 'very-happy',
    9: 'very-happy',
    10: 'very-happy'
  };

  const activities = ['exercise', 'meditation', 'journaling', 'socializing', 'therapy', 'work', 'hobby', 'reading'];
  const triggers = ['work-stress', 'family', 'sleep-deprivation', 'relationships'];

  // Generate 90 mood entries (30 per user, over 30 days)
  userIds.forEach((userId, userIdx) => {
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(20 + userIdx, 0, 0, 0);

      let mood;
      if (userIdx === 0) {
        mood = Math.min(10, Math.floor(4 + (30 - i) * 0.15)); // Progressive improvement
      } else if (userIdx === 1) {
        mood = (i % 5) === 0 ? 4 : (i % 3) === 0 ? 6 : 5; // Fluctuating
      } else {
        mood = Math.max(6, Math.floor(7 + Math.random() * 3)); // Stable/positive
      }

      entries.push({
        userId,
        mood: Math.min(10, mood),
        moodLabel: moodLabels[Math.min(10, mood)],
        activities: [activities[Math.floor(Math.random() * activities.length)]],
        triggers: i % 7 === 0 ? [triggers[Math.floor(Math.random() * triggers.length)]] : [],
        notes: i % 5 === 0 ? `Feeling ${moodLabels[Math.min(10, mood)].replace('-', ' ')} today` : '',
        date,
        createdAt: date
      });
    }
  });

  return entries;
}

module.exports = generateMoodEntries();
