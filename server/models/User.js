const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
    lowercase: true,
    index: true
  },
  password: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  bio: { type: String },
  city: { type: String },

  // Account
  role: { type: String, enum: ['patient', 'therapist', 'admin'], default: 'patient' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  isVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },

  // OAuth Integration
  oauthProvider: { type: String, enum: ['google', 'apple', null], default: null },
  oauthId: { type: String, default: null },

  // Security
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,

  // Audit
  lastLoginIp: String,
  lastLoginUserAgent: String,

  // Therapist specific
  therapistProfile: {
    licenseNumber: String,
    specialties: [String],
    experience: Number,
    languages: [String],
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    bio: String,
    availability: [{
      day: String,
      startTime: String,
      endTime: String,
    }],
  },

  // User preferences
  preferences: {
    notifications: { type: Boolean, default: true },
    emailUpdates: { type: Boolean, default: true },
    privateProfile: { type: Boolean, default: false },
  },

  // Timestamps
  lastLogin: Date,
}, { timestamps: true });

// Migrate old role values on save
userSchema.pre('save', async function(next) {
  if (this.role && !['patient', 'therapist', 'admin'].includes(this.role)) {
    this.role = 'patient';
  }

  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to migrate old data
userSchema.statics.migrateOldRoles = async function() {
  try {
    const result = await this.updateMany(
      { role: { $nin: ['patient', 'therapist', 'admin'] } },
      { $set: { role: 'patient' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`✅ Migrated ${result.modifiedCount} users with invalid roles to 'patient'`);
    }
  } catch (error) {
    console.error('User role migration error:', error.message);
  }
};

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
