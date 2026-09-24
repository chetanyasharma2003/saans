const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  // Basic Info
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  profileImage: String,
  bio: String,

  // License & Credentials
  license: {
    number: { type: String, required: true, unique: true },
    issueDate: Date,
    expiryDate: Date,
    organization: String, // Medical council name
    verified: { type: Boolean, default: false },
    verificationDate: Date,
    licenseDocument: String // URL to uploaded document
  },

  // Specialties & Languages
  specialties: {
    type: [String],
    enum: [
      'anxiety',
      'depression',
      'trauma',
      'ptsd',
      'relationships',
      'grief',
      'stress',
      'addiction',
      'eating-disorders',
      'sleep-issues',
      'self-esteem',
      'career-counseling',
      'parenting',
      'teen-issues',
      'family-therapy',
      'cognitive-behavioral',
      'psychodynamic',
      'mindfulness',
      'couples-therapy',
      'group-therapy'
    ]
  },
  languages: [String], // ['English', 'Hindi', 'Spanish']
  experience: Number, // Years of experience

  // Education
  education: [
    {
      degree: String, // Bachelor's, Master's, PhD
      field: String, // Psychology, Counseling
      institution: String,
      year: Number
    }
  ],

  // Location & Availability
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    zipCode: String,
    address: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (val) {
            return val.length === 2 && val[0] >= -180 && val[0] <= 180 && val[1] >= -90 && val[1] <= 90;
          }
        }
      }
    }
  },

  availability: [
    {
      day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      startTime: String, // "09:00"
      endTime: String, // "17:00"
      timezone: String, // "IST"
      _id: false
    }
  ],

  // Pricing
  pricing: {
    perSession: Number, // Amount in rupees
    currency: { type: String, default: 'INR' },
    minDuration: { type: Number, default: 30 }, // minutes
    maxDuration: { type: Number, default: 60 },
    acceptingNewClients: { type: Boolean, default: true }
  },

  // Ratings & Reviews
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    total: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        text: String,
        date: { type: Date, default: Date.now },
        verified: Boolean, // Only from clients who booked
        _id: false
      }
    ]
  },

  // Verification Status
  verification: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending'
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedDate: Date,
    rejectionReason: String,
    documents: [String] // URLs to license docs
  },

  // Session Info
  sessionFormat: [String], // ['in-person', 'video-call', 'phone-call']
  consultationFee: Number,

  // Account Status
  isActive: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave', 'retired'],
    default: 'active'
  },

  // Platform Stats
  stats: {
    totalSessions: { type: Number, default: 0 },
    completedSessions: { type: Number, default: 0 },
    cancelledSessions: { type: Number, default: 0 },
    averageSessionDuration: Number,
    clientSatisfactionRate: Number // %
  },

  // Admin Notes
  adminNotes: String,
  lastActivityDate: Date,

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

// Geospatial index for location-based queries
therapistSchema.index({ 'location.coordinates': '2dsphere' });
therapistSchema.index({ specialties: 1 });
therapistSchema.index({ email: 1 });
therapistSchema.index({ verification: { status: 1 } });
therapistSchema.index({ isActive: 1 });
therapistSchema.index({ 'ratings.average': -1 });

// Update ratings when new review is added
therapistSchema.pre('save', async function (next) {
  if (this.isModified('ratings.reviews')) {
    const reviews = this.ratings.reviews || [];
    if (reviews.length > 0) {
      this.ratings.count = reviews.length;
      this.ratings.average = (
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      ).toFixed(1);
    }
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Therapist', therapistSchema);
