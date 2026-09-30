// PostgreSQL Sequelize Models Index
const User = require('./User');
const Appointment = require('./Appointment-PG');
const MoodEntry = require('./MoodEntry-PG');
const Subscription = require('./Subscription-PG');
const Therapist = require('./Therapist-PG');

// Define associations
User.hasMany(Appointment, { foreignKey: 'userId', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(MoodEntry, { foreignKey: 'userId', as: 'moodEntries' });
MoodEntry.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Therapist, { foreignKey: 'userId', as: 'therapistProfile' });
Therapist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Appointment.belongsTo(Therapist, { foreignKey: 'therapistId', as: 'therapist' });
Therapist.hasMany(Appointment, { foreignKey: 'therapistId', as: 'appointments' });

module.exports = {
  User,
  Appointment,
  MoodEntry,
  Subscription,
  Therapist,
};
