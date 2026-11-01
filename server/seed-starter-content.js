require('dotenv').config();
const { sequelize } = require('./config/database');
const { Group, Resource } = require('./models');

const resourceSource = 'SAANS starter library';

const resources = [
  {
    title: 'A gentle five-senses grounding practice',
    description: 'A short grounding exercise to help bring attention back to the present moment.',
    content: 'Pause somewhere you feel reasonably safe. Notice five things you can see, four things you can feel, three things you can hear, two things you can smell, and one thing you can taste. There is no need to get every item right. If focusing on the senses feels uncomfortable, stop and choose a different calming activity. This is a self-care exercise, not a substitute for professional support.',
    category: 'exercise',
    type: 'interactive',
    conditions: ['stress', 'anxiety'],
    tags: ['grounding', 'mindfulness', 'coping'],
    difficulty: 'beginner',
    duration: 5,
    author: 'SAANS',
    source: resourceSource,
    status: 'published',
  },
  {
    title: 'A small pause for a stressful day',
    description: 'A simple, flexible pause to notice tension and choose one manageable next step.',
    content: 'If it feels comfortable, pause and let your breathing stay natural. Notice where your body is supported. Name what is taking your attention, without judging yourself for it. Ask: what is one small thing I can do in the next ten minutes? You can also skip this exercise or reach out to someone you trust.',
    category: 'guide',
    type: 'text',
    conditions: ['stress', 'burnout'],
    tags: ['stress', 'self-care', 'small-steps'],
    difficulty: 'beginner',
    duration: 3,
    author: 'SAANS',
    source: resourceSource,
    status: 'published',
  },
  {
    title: 'A compassionate check-in with yourself',
    description: 'Prompts for responding to a difficult moment with curiosity rather than self-criticism.',
    content: 'Take a moment to ask: What am I feeling right now? What might I need? What would I say to someone I care about in this situation? You do not have to force a positive answer. Choose one kind, realistic action for yourself, such as taking a break, drinking water, or asking for support.',
    category: 'article',
    type: 'text',
    conditions: ['stress', 'self-esteem'],
    tags: ['self-compassion', 'reflection', 'wellbeing'],
    difficulty: 'beginner',
    duration: 5,
    author: 'SAANS',
    source: resourceSource,
    status: 'published',
  },
  {
    title: 'Wind down with a calmer evening routine',
    description: 'Ideas for building a gentle bedtime routine that can be adapted to your circumstances.',
    content: 'If possible, choose one low-effort signal that the day is winding down: dim a light, put a device aside briefly, listen to something soothing, or prepare one thing for tomorrow. A routine does not need to be perfect or identical every day. Sleep difficulties can have many causes; consider speaking with a healthcare professional if they persist or affect daily life.',
    category: 'guide',
    type: 'text',
    conditions: ['sleep', 'stress'],
    tags: ['sleep', 'routine', 'rest'],
    difficulty: 'beginner',
    duration: 10,
    author: 'SAANS',
    source: resourceSource,
    status: 'published',
  },
  {
    title: 'A brief mindful listening meditation',
    description: 'A short, eyes-open or eyes-closed practice focused on sounds around you.',
    content: 'Choose a position that feels comfortable and keep your eyes open if that feels safer. For one or two minutes, notice nearby sounds and then sounds farther away. You do not have to identify or change anything. If this draws attention to something upsetting, stop and orient to a familiar object or person instead.',
    category: 'meditation',
    type: 'interactive',
    conditions: ['stress', 'anxiety'],
    tags: ['mindfulness', 'meditation', 'grounding'],
    difficulty: 'beginner',
    duration: 2,
    author: 'SAANS',
    source: resourceSource,
    status: 'published',
  },
  {
    title: 'Make a personal support map',
    description: 'A private reflection to identify people and services you may choose to contact.',
    content: 'Write down people you feel comfortable contacting for different kinds of support: someone to listen, someone who can help with practical tasks, and a qualified professional or local service. You can leave any section blank. Keep the list somewhere private and update it when your circumstances change. In an immediate emergency, contact local emergency services.',
    category: 'guide',
    type: 'interactive',
    conditions: ['stress', 'grief', 'relationships'],
    tags: ['support', 'connection', 'planning'],
    difficulty: 'beginner',
    duration: 10,
    author: 'SAANS',
    source: resourceSource,
    status: 'published',
  },
  {
    title: 'Take a restorative movement break',
    description: 'Gentle movement ideas for a short break, with options to adapt or skip.',
    content: 'If movement is accessible and comfortable for you, try stretching your hands, rolling your shoulders, or taking a short walk at your own pace. Choose only what feels safe for your body; sitting quietly or resting is also a valid break. Stop if you feel pain, dizziness, or discomfort.',
    category: 'exercise',
    type: 'text',
    conditions: ['stress', 'burnout'],
    tags: ['movement', 'break', 'self-care'],
    difficulty: 'beginner',
    duration: 5,
    author: 'SAANS',
    source: resourceSource,
    status: 'published',
  },
  {
    title: 'A simple feelings journal',
    description: 'A few optional prompts for noticing emotions and what might help.',
    content: 'If writing feels useful, try these prompts: What happened? What feelings did I notice? What did I need in that moment? What is one small thing I want to remember? You can write a sentence, use a voice note, or skip this practice. You do not need to share private reflections with anyone.',
    category: 'article',
    type: 'interactive',
    conditions: ['stress', 'anxiety', 'self-esteem'],
    tags: ['journaling', 'reflection', 'emotions'],
    difficulty: 'beginner',
    duration: 5,
    author: 'SAANS',
    source: resourceSource,
    status: 'published',
  },
];

const groups = [
  {
    name: 'Everyday Anxiety Support',
    slug: 'everyday-anxiety-support',
    description: 'A peer-support space to share everyday experiences and coping ideas. Members are not clinicians; this group does not provide diagnosis or medical advice.',
    category: 'anxiety',
    icon: '🌿',
  },
  {
    name: 'Low Mood Check-In',
    slug: 'low-mood-check-in',
    description: 'A gentle community for check-ins, small wins, and feeling less alone. Peer support is not a replacement for professional care.',
    category: 'depression',
    icon: '☀️',
  },
  {
    name: 'Stress and Work-Life Balance',
    slug: 'stress-work-life-balance',
    description: 'Talk about everyday stress, boundaries, and rest in a respectful peer-support setting. Avoid sharing identifying or highly sensitive details.',
    category: 'work',
    icon: '🌱',
  },
  {
    name: 'Relationships and Connection',
    slug: 'relationships-and-connection',
    description: 'A supportive space to reflect on communication, boundaries, and connection without judgment or pressure.',
    category: 'relationships',
    icon: '🤝',
  },
  {
    name: 'Grief and Change',
    slug: 'grief-and-change',
    description: 'A gentle peer space for people navigating loss or major life changes. Everyone’s experience and timeline is different.',
    category: 'grief',
    icon: '🕊️',
  },
  {
    name: 'Mindful Rest and Sleep',
    slug: 'mindful-rest-and-sleep',
    description: 'Share practical routines and encouragement around rest. This group cannot assess or treat sleep disorders.',
    category: 'sleep',
    icon: '🌙',
  },
];

async function seedStarterContent() {
  await sequelize.authenticate();

  await sequelize.transaction(async (transaction) => {
    for (const resource of resources) {
      await Resource.findOrCreate({
        where: {
          title: resource.title,
          source: resourceSource,
        },
        defaults: resource,
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
  });

  const resourceCount = await Resource.count({ where: { source: resourceSource } });
  const groupCount = await Group.count({
    where: { slug: groups.map((group) => group.slug) },
  });

  console.log(`Starter content ready: ${resourceCount} SAANS resources, ${groupCount} support groups.`);
  console.log('No user accounts, therapist credentials, stories, mood entries, or appointments were created.');
}

if (require.main === module) {
  seedStarterContent()
    .catch((error) => {
      console.error('Starter content seeding failed:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await sequelize.close();
    });
}

module.exports = seedStarterContent;
