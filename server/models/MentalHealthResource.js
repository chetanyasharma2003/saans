const mongoose = require('mongoose');

const mentalHealthResourceSchema = new mongoose.Schema({
  // Condition Information
  condition: {
    name: { type: String, required: true }, // 'Depression', 'Anxiety'
    icd10Code: String,
    description: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'moderate'
    },
    prevalence: String, // "1 in 4 people experience depression"
    demographics: String // Who is most affected
  },

  // Symptoms
  symptoms: [
    {
      name: String,
      description: String,
      category: {
        type: String,
        enum: ['physical', 'emotional', 'behavioral', 'cognitive'],
        default: 'emotional'
      },
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe'],
        default: 'moderate'
      },
      _id: false
    }
  ],

  // Causes & Risk Factors
  causes: [
    {
      name: String, // 'Genetics', 'Life events', 'Brain chemistry'
      description: String,
      likelihood: Number, // 0-100%
      _id: false
    }
  ],

  riskFactors: [
    {
      factor: String,
      description: String,
      _id: false
    }
  ],

  // Treatment Options
  treatments: [
    {
      type: {
        type: String,
        enum: ['therapy', 'medication', 'lifestyle', 'alternative', 'combination']
      },
      name: String,
      description: String,
      effectiveness: Number, // 0-100
      timeToEffect: String, // "2-4 weeks"
      sideEffects: [String],
      cost: String,
      access: String, // Available in India?
      pros: [String],
      cons: [String],
      _id: false
    }
  ],

  // Self-Help Strategies
  selfHelpTips: [
    {
      title: String,
      description: String,
      steps: [String], // Step by step instructions
      duration: String, // "10 mins", "daily", etc
      difficulty: {
        type: String,
        enum: ['easy', 'moderate', 'hard'],
        default: 'moderate'
      },
      frequency: String, // "daily", "3x per week"
      effectiveness: Number,
      _id: false
    }
  ],

  // Lifestyle Changes
  lifestyleChanges: [
    {
      category: String, // 'sleep', 'exercise', 'diet', 'social'
      recommendations: [String],
      _id: false
    }
  ],

  // When to Seek Help
  whenToSeekHelp: {
    redFlags: [String], // Warning signs
    emergencySignals: [String], // Immediate help needed
    suggestedProfessional: String // Psychologist, Psychiatrist, etc
  },

  // Crisis Resources
  crisisResources: [
    {
      name: String,
      description: String,
      phone: String,
      website: String,
      email: String,
      country: String,
      availability: String, // "24/7"
      type: {
        type: String,
        enum: ['helpline', 'crisis-center', 'online', 'mobile-app']
      },
      language: [String],
      cost: String, // Free, Paid
      _id: false
    }
  ],

  // Real Stories & Testimonials
  stories: [
    {
      title: String,
      content: String,
      author: String,
      outcome: String, // How they recovered
      lessonsLearned: [String],
      source: String, // 'user-submitted', 'research', 'public'
      _id: false
    }
  ],

  // Scientific References
  references: [
    {
      title: String,
      authors: [String],
      publication: String,
      year: Number,
      url: String,
      doi: String,
      _id: false
    }
  ],

  // Related Conditions
  relatedConditions: [String], // Comorbidities

  // FAQs
  faqs: [
    {
      question: String,
      answer: String,
      _id: false
    }
  ],

  // Content Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verificationDate: Date,
  reviewedBy: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      expertise: String, // Their qualification
      date: Date,
      _id: false
    }
  ],

  // Quality Metrics
  quality: {
    completeness: Number, // 0-100%
    accuracy: Number, // 0-100%
    lastReviewDate: Date,
    userHelpfulCount: { type: Number, default: 0 },
    userNotHelpfulCount: { type: Number, default: 0 }
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },

  // Accessibility
  readingLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  readTime: Number, // minutes
  availableLanguages: [String],

  // Content Structure
  sections: [
    {
      title: String,
      order: Number,
      _id: false
    }
  ],

  // Engagement
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  publishedAt: Date
});

// Indexes
mentalHealthResourceSchema.index({ 'condition.name': 1 });
mentalHealthResourceSchema.index({ status: 1, isVerified: 1 });
mentalHealthResourceSchema.index({ tags: 1 });
mentalHealthResourceSchema.index({ views: -1 });
mentalHealthResourceSchema.index({ createdAt: -1 });

// Text search index
mentalHealthResourceSchema.index({
  'condition.name': 'text',
  'condition.description': 'text',
  'symptoms.name': 'text',
  'faqs.question': 'text'
});

mentalHealthResourceSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (!this.publishedAt && this.status === 'published') {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('MentalHealthResource', mentalHealthResourceSchema);
