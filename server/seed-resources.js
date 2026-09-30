const { sequelize } = require('./config/database');
const { Resource } = require('./models/index');

const sampleResources = [
  // Anxiety Resources
  {
    title: "The 5-4-3-2-1 Grounding Technique",
    description: "Learn a quick sensory grounding technique to manage anxiety attacks in any situation.",
    content: "This technique helps ground you in the present moment by engaging all your senses. Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.",
    category: "technique",
    type: "text",
    conditions: ["anxiety"],
    tags: ["coping-strategy", "grounding", "quick-relief"],
    difficulty: "beginner",
    duration: 5,
    author: "Mental Health Professionals",
    rating: 4.8,
    helpfulCount: 324,
  },
  {
    title: "Understanding Anxiety: A Beginner's Guide",
    description: "Comprehensive guide to understanding what anxiety is, its causes, and evidence-based treatments.",
    content: "Anxiety is a natural response to stress. This guide covers the biology of anxiety, common triggers, and proven therapeutic approaches.",
    category: "guide",
    type: "text",
    conditions: ["anxiety"],
    tags: ["education", "understanding", "foundations"],
    difficulty: "beginner",
    duration: 15,
    author: "Dr. Sarah Johnson",
    rating: 4.7,
    helpfulCount: 456,
  },
  {
    title: "Box Breathing for Instant Calm",
    description: "A simple breathing exercise that reduces anxiety in minutes.",
    category: "meditation",
    type: "audio",
    conditions: ["anxiety"],
    tags: ["breathing", "meditation", "quick-relief"],
    difficulty: "beginner",
    duration: 10,
    author: "Wellness Coach",
    rating: 4.9,
    helpfulCount: 567,
  },

  // Depression Resources
  {
    title: "Behavioral Activation for Depression",
    description: "Step-by-step guide to using behavioral activation to combat depression.",
    content: "When depressed, we often isolate and withdraw. Behavioral activation helps by scheduling meaningful activities.",
    category: "guide",
    type: "text",
    conditions: ["depression"],
    tags: ["therapy-technique", "coping-strategy", "action-oriented"],
    difficulty: "intermediate",
    duration: 20,
    author: "Dr. Michael Chen",
    rating: 4.6,
    helpfulCount: 389,
  },
  {
    title: "Daily Mood Tracking Journal",
    description: "Learn how to track your mood and identify patterns that affect your mental health.",
    category: "article",
    type: "text",
    conditions: ["depression"],
    tags: ["self-help", "journaling", "awareness"],
    difficulty: "beginner",
    duration: 10,
    author: "Therapist Network",
    rating: 4.5,
    helpfulCount: 298,
  },
  {
    title: "Meditation for Depression Relief",
    description: "15-minute guided meditation specifically designed to help with depression.",
    category: "meditation",
    type: "audio",
    conditions: ["depression"],
    tags: ["meditation", "guided", "relaxation"],
    difficulty: "beginner",
    duration: 15,
    author: "Meditation Guide",
    rating: 4.7,
    helpfulCount: 412,
  },

  // PTSD Resources
  {
    title: "Understanding PTSD: Causes and Symptoms",
    description: "Education about post-traumatic stress disorder and how it develops.",
    category: "guide",
    type: "text",
    conditions: ["ptsd"],
    tags: ["education", "trauma", "awareness"],
    difficulty: "beginner",
    duration: 20,
    author: "Trauma Specialist",
    rating: 4.6,
    helpfulCount: 234,
  },
  {
    title: "Grounding Techniques for Flashbacks",
    description: "Immediate techniques to use when experiencing flashbacks or intrusive memories.",
    category: "technique",
    type: "text",
    conditions: ["ptsd"],
    tags: ["coping-strategy", "emergency", "grounding"],
    difficulty: "beginner",
    duration: 8,
    author: "PTSD Recovery Center",
    rating: 4.8,
    helpfulCount: 367,
  },

  // Stress Management
  {
    title: "Progressive Muscle Relaxation",
    description: "Learn to systematically relax your muscles to reduce stress and tension.",
    category: "exercise",
    type: "audio",
    conditions: ["stress", "anxiety"],
    tags: ["relaxation", "physical", "stress-relief"],
    difficulty: "beginner",
    duration: 20,
    author: "Wellness Expert",
    rating: 4.7,
    helpfulCount: 289,
  },
  {
    title: "Work-Life Balance Strategies",
    description: "Practical strategies for managing work stress and maintaining balance.",
    category: "article",
    type: "text",
    conditions: ["stress"],
    tags: ["productivity", "work", "lifestyle"],
    difficulty: "intermediate",
    duration: 12,
    author: "Career Coach",
    rating: 4.4,
    helpfulCount: 201,
  },

  // Sleep & Rest
  {
    title: "Sleep Hygiene: The Complete Guide",
    description: "Science-backed tips for improving sleep quality and overcoming insomnia.",
    category: "guide",
    type: "text",
    conditions: ["insomnia", "anxiety"],
    tags: ["sleep", "wellness", "lifestyle"],
    difficulty: "beginner",
    duration: 15,
    author: "Sleep Specialist",
    rating: 4.7,
    helpfulCount: 445,
  },
  {
    title: "Bedtime Meditation for Deep Sleep",
    description: "Guided 30-minute meditation to help you fall asleep easily.",
    category: "meditation",
    type: "audio",
    conditions: ["insomnia"],
    tags: ["meditation", "sleep", "relaxation"],
    difficulty: "beginner",
    duration: 30,
    author: "Sleep Coach",
    rating: 4.8,
    helpfulCount: 523,
  },

  // Self-Compassion & Mindfulness
  {
    title: "Practicing Self-Compassion",
    description: "Learn to treat yourself with the same kindness you'd offer a friend.",
    category: "guide",
    type: "text",
    conditions: ["depression", "anxiety", "self-esteem"],
    tags: ["self-help", "mindfulness", "emotional-health"],
    difficulty: "intermediate",
    duration: 18,
    author: "Dr. Kristin Neff",
    rating: 4.9,
    helpfulCount: 567,
  },
  {
    title: "Body Scan Meditation",
    description: "10-minute mindfulness meditation to increase awareness and reduce tension.",
    category: "meditation",
    type: "audio",
    conditions: ["stress", "anxiety"],
    tags: ["meditation", "mindfulness", "body-awareness"],
    difficulty: "beginner",
    duration: 10,
    author: "Mindfulness Teacher",
    rating: 4.6,
    helpfulCount: 334,
  },

  // Relationship & Social
  {
    title: "Communication Skills for Relationships",
    description: "Learn effective communication techniques to improve your relationships.",
    category: "article",
    type: "text",
    conditions: ["relationships"],
    tags: ["communication", "relationships", "social"],
    difficulty: "intermediate",
    duration: 16,
    author: "Relationship Coach",
    rating: 4.5,
    helpfulCount: 278,
  },

  // Crisis & Emergency
  {
    title: "Crisis Management: What to Do Right Now",
    description: "Immediate steps to take during a mental health crisis.",
    category: "guide",
    type: "text",
    conditions: ["crisis", "emergency"],
    tags: ["emergency", "crisis", "immediate-help"],
    difficulty: "beginner",
    duration: 5,
    author: "Crisis Support Network",
    rating: 4.9,
    helpfulCount: 612,
  },
];

async function seedResources() {
  try {
    console.log('🌱 Seeding mental health resources...');

    // Clear existing resources
    await Resource.destroy({ where: {} });
    console.log('✅ Cleared existing resources');

    // Create resources
    const resources = await Resource.bulkCreate(sampleResources);
    console.log(`✅ Created ${resources.length} resources`);

    // Get stats
    const stats = await Resource.findAll({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'avgRating'],
        [require('sequelize').fn('SUM', require('sequelize').col('helpfulCount')), 'totalHelpful'],
      ],
      raw: true,
    });

    const categoryStats = await Resource.findAll({
      attributes: [
        'category',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['category'],
      raw: true,
    });

    console.log('\n📊 Resource Statistics:');
    console.log(`Total Resources: ${stats[0]?.total || 0}`);
    console.log(`Average Rating: ${parseFloat(stats[0]?.avgRating).toFixed(2)}/5`);
    console.log(`Total Helpful Votes: ${stats[0]?.totalHelpful || 0}`);

    console.log('\n📂 By Category:');
    categoryStats.forEach(cat => {
      console.log(`  ${cat.category}: ${cat.count} resources`);
    });

    console.log('\n✨ Resource seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding resources:', error.message);
    process.exit(1);
  }
}

seedResources();
