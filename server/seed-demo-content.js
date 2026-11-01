require('dotenv').config();
const crypto = require('crypto');
const { sequelize } = require('./config/database');
const { Group, Resource, Story, Therapist, User } = require('./models');

const demoBioPrefix = '[DEMO PROFILE ONLY]';
const demoAuthorName = 'SAANS demo member (fictional)';
const demoEmail = 'saans-demo-content@demo.invalid';
const demoResourceSource = 'SAANS DEMO — fictional sample content';

const therapists = [
  {
    firstName: 'Avery',
    lastName: 'Sample',
    specializations: ['Anxiety', 'Stress'],
    languages: ['English', 'Hindi'],
    yearsOfExperience: 0,
    hourlyRate: 900,
    timezone: 'Asia/Kolkata',
    bio: `${demoBioPrefix} Avery Sample is a fictional profile for product demonstrations, not a real clinician and not qualified to provide care.`,
  },
  {
    firstName: 'Jordan',
    lastName: 'Example',
    specializations: ['Relationships', 'Self-esteem'],
    languages: ['English'],
    yearsOfExperience: 0,
    hourlyRate: 1100,
    timezone: 'Asia/Kolkata',
    bio: `${demoBioPrefix} Jordan Example is a fictional profile for product demonstrations, not a real clinician and not qualified to provide care.`,
  },
  {
    firstName: 'Riley',
    lastName: 'Demo',
    specializations: ['Stress', 'Sleep'],
    languages: ['English', 'Hindi'],
    yearsOfExperience: 0,
    hourlyRate: 1000,
    timezone: 'Asia/Kolkata',
    bio: `${demoBioPrefix} Riley Demo is a fictional profile for product demonstrations, not a real clinician and not qualified to provide care.`,
  },
];

const stories = [
  {
    title: 'DEMO STORY — A small step on a stressful day',
    content: 'This is fictional sample content for a SAANS product demonstration, not a real person’s experience. In this example, a character takes a short pause, writes down one manageable next step, and chooses whether to ask a trusted person for support.',
    category: 'stress',
  },
  {
    title: 'DEMO STORY — Finding a routine that feels manageable',
    content: 'This is fictional sample content for a SAANS product demonstration, not a real person’s experience. The sample character experiments with a gentle evening routine and adjusts it to fit their needs. People’s experiences differ, and this example is not clinical advice.',
    category: 'sleep',
  },
  {
    title: 'DEMO STORY — Practising a kind check-in',
    content: 'This is fictional sample content for a SAANS product demonstration, not a real person’s experience. The sample character pauses to name a feeling, considers what might help, and chooses a small, realistic act of self-care.',
    category: 'self-esteem',
  },
];

const groups = [
  {
    name: 'DEMO GROUP — Everyday Anxiety Support',
    slug: 'demo-everyday-anxiety-support',
    description: 'Fictional sample group for a product presentation. This is not a staffed clinical service; members and discussions are not real.',
    category: 'anxiety',
    icon: '🌿',
    memberCount: 0,
    postCount: 0,
  },
  {
    name: 'DEMO GROUP — Stress and Small Steps',
    slug: 'demo-stress-small-steps',
    description: 'Fictional sample group for a product presentation. This is not a staffed clinical service; members and discussions are not real.',
    category: 'stress',
    icon: '🌱',
    memberCount: 0,
    postCount: 0,
  },
  {
    name: 'DEMO GROUP — Mindful Rest',
    slug: 'demo-mindful-rest',
    description: 'Fictional sample group for a product presentation. This is not a staffed clinical service; members and discussions are not real.',
    category: 'sleep',
    icon: '🌙',
    memberCount: 0,
    postCount: 0,
  },
];

const resources = [
  {
    title: 'DEMO RESOURCE — A gentle grounding pause',
    description: 'Fictional sample resource for a product presentation.',
    content: 'This demo example suggests noticing a few things in your surroundings and choosing a comfortable next step. It is sample content, not clinical advice or treatment.',
    category: 'exercise',
    type: 'interactive',
    conditions: ['stress', 'anxiety'],
    tags: ['demo', 'grounding'],
    difficulty: 'beginner',
    duration: 3,
    author: 'SAANS Demo',
    source: demoResourceSource,
    status: 'published',
  },
  {
    title: 'DEMO RESOURCE — A compassionate check-in',
    description: 'Fictional sample reflection prompts for a product presentation.',
    content: 'Sample prompts: What am I noticing? What might I need? What is one small, realistic action I could choose? This demo content is not clinical advice.',
    category: 'article',
    type: 'text',
    conditions: ['stress', 'self-esteem'],
    tags: ['demo', 'reflection'],
    difficulty: 'beginner',
    duration: 5,
    author: 'SAANS Demo',
    source: demoResourceSource,
    status: 'published',
  },
  {
    title: 'DEMO RESOURCE — A flexible evening routine',
    description: 'Fictional sample ideas for winding down, for demonstration only.',
    content: 'Sample ideas include dimming a light, putting one item away, or choosing a calming activity. This is fictional demonstration content and is not treatment advice.',
    category: 'guide',
    type: 'text',
    conditions: ['sleep', 'stress'],
    tags: ['demo', 'rest'],
    difficulty: 'beginner',
    duration: 5,
    author: 'SAANS Demo',
    source: demoResourceSource,
    status: 'published',
  },
];

async function seedDemoContent() {
  if (process.env.ENABLE_DEMO_DATA !== 'true') {
    throw new Error('Demo seeding is disabled. Set ENABLE_DEMO_DATA=true only for a presentation environment.');
  }

  await sequelize.authenticate();
  await sequelize.transaction(async (transaction) => {
    const [demoUser] = await User.findOrCreate({
      where: { email: demoEmail },
      defaults: {
        firstName: 'SAANS Demo',
        lastName: 'Fictional Sample',
        email: demoEmail,
        password: crypto.randomBytes(32).toString('hex'),
        role: 'user',
        isActive: true,
        isVerified: false,
      },
      transaction,
    });

    for (const profile of therapists) {
      await Therapist.findOrCreate({
        where: { email: `demo-${profile.firstName.toLowerCase()}@demo.invalid` },
        defaults: {
          ...profile,
          email: `demo-${profile.firstName.toLowerCase()}@demo.invalid`,
          isVerified: false,
          isActive: true,
          acceptNewClients: true,
          rating: 0,
          totalRatings: 0,
          sessionsCompleted: 0,
          qualifications: [],
          availabilitySlots: [],
          consultationType: ['online'],
        },
        transaction,
      });
    }

    for (const story of stories) {
      await Story.findOrCreate({
        where: { title: story.title },
        defaults: {
          ...story,
          userId: demoUser.id,
          authorName: demoAuthorName,
          isAnonymous: true,
          status: 'approved',
        },
        transaction,
      });
    }

    for (const group of groups) {
      await Group.findOrCreate({
        where: { slug: group.slug },
        defaults: group,
        transaction,
      });
    }

    for (const resource of resources) {
      await Resource.findOrCreate({
        where: { title: resource.title, source: demoResourceSource },
        defaults: resource,
        transaction,
      });
    }
  });

  console.log(`Demo presentation content ready: ${therapists.length} fictional therapist profiles, ${stories.length} sample posts, ${groups.length} demo groups, and ${resources.length} demo resources.`);
}

if (require.main === module) {
  seedDemoContent()
    .catch((error) => {
      console.error('Demo content seeding failed:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await sequelize.close();
    });
}

module.exports = { seedDemoContent, demoBioPrefix };
