const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  bio: { type: String },
  city: { type: String },

  // Account
  role: { type: String, enum: ['user', 'therapist', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  emailVerified: { type: Boolean, default: false },

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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

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
