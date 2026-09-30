const { sequelize } = require('./config/database');
const { Story, Group, User } = require('./models/index');
const { v4: uuidv4 } = require('uuid');

const sampleStories = [
  {
    title: "Finding Peace After Years of Anxiety",
    content: "I struggled with anxiety for 15 years, and I thought it would be a lifelong battle. Three months ago, I started therapy and began meditation. Today marks my first week without panic attacks. If you're reading this while feeling hopeless, please know that recovery is possible. It's not easy, but it's worth it. You're stronger than you think.",
    category: "anxiety",
    authorName: "Alex M.",
    isAnonymous: true,
    views: 342,
    upvotes: 89,
    helpful: 56,
  },
  {
    title: "My Journey Out of Depression",
    content: "For two years, I couldn't get out of bed. Depression told me I was worthless, that nothing would change. My therapist helped me understand that depression lies. Today, I've completed my first marathon, started a new job, and feel truly alive again. If you're in the darkness, there IS light on the other side. Please reach out for help—it saved my life.",
    category: "depression",
    authorName: "Jamie R.",
    isAnonymous: true,
    views: 512,
    upvotes: 143,
    helpful: 98,
  },
  {
    title: "PTSD Recovery: Small Steps Lead to Big Changes",
    content: "Trauma kept me isolated and afraid. The nightmares were relentless. EMDR therapy changed everything. It took 6 months of consistent work, but I've reclaimed my life. I can sleep through the night now. I can be around people without feeling like I'm going to explode. If you're struggling with PTSD, know that healing is possible.",
    category: "ptsd",
    authorName: "Morgan K.",
    isAnonymous: true,
    views: 278,
    upvotes: 76,
    helpful: 52,
  },
  {
    title: "Breaking Free from a Toxic Relationship",
    content: "It took me years to realize the emotional abuse I was experiencing wasn't normal. Leaving was the hardest but best decision I ever made. In the aftermath, I've had to rebuild my sense of self. Therapy has been crucial in this journey. I'm learning to set boundaries and recognize red flags early. If you're in an unhealthy relationship, you deserve better.",
    category: "relationships",
    authorName: "Casey T.",
    isAnonymous: true,
    views: 456,
    upvotes: 112,
    helpful: 78,
  },
  {
    title: "Overcoming Grief After Loss",
    content: "Losing my mother was the most painful experience of my life. For the first year, I couldn't function. Grief counseling taught me that grief isn't something you 'get over'—it's something you integrate. Two years later, I can talk about her and smile instead of cry. The pain has transformed into gratitude for having had her in my life.",
    category: "grief",
    authorName: "Sarah L.",
    isAnonymous: true,
    views: 389,
    upvotes: 95,
    helpful: 67,
  },
  {
    title: "Addiction Recovery: One Day at a Time",
    content: "I was addicted to alcohol for 8 years. I hit rock bottom multiple times. But this time, something clicked. I joined a support group, found a sponsor, and committed to change. One year sober today. Every single day is a victory. If you're struggling with addiction, please know that recovery is real and absolutely possible. You're not alone.",
    category: "addiction",
    authorName: "Michael D.",
    isAnonymous: true,
    views: 523,
    upvotes: 158,
    helpful: 109,
  },
  {
    title: "Managing Burnout: Learning to Prioritize Myself",
    content: "I was working 60+ hours a week, constantly stressed, and completely burned out. My health was suffering. I finally quit that job and took time to reconnect with myself. Now I work less, earn more, and actually enjoy my life. Sometimes the biggest risk is playing it safe. Your mental health matters more than any job.",
    category: "work",
    authorName: "Elena V.",
    isAnonymous: true,
    views: 298,
    upvotes: 84,
    helpful: 61,
  },
  {
    title: "Building Self-Esteem from Scratch",
    content: "I spent my entire life believing I wasn't good enough. Constant self-criticism was my default. CBT therapy helped me challenge these thoughts and rebuild my self-image. It's been a year of conscious work on self-compassion. I'm not where I want to be yet, but I'm proud of how far I've come. You are worthy, exactly as you are.",
    category: "self-esteem",
    authorName: "Jordan P.",
    isAnonymous: true,
    views: 421,
    upvotes: 118,
    helpful: 85,
  },
];

const sampleGroups = [
  {
    name: "Anxiety Warriors",
    slug: "anxiety-warriors",
    description: "A supportive community for people managing anxiety. Share coping strategies, discuss triggers, and support each other on the journey to peace.",
    category: "anxiety",
    icon: "🦁",
    memberCount: 2340,
    postCount: 1205,
  },
  {
    name: "Depression Support Circle",
    slug: "depression-support",
    description: "A safe space for those dealing with depression. We share resources, daily wins, and support each other during difficult times.",
    category: "depression",
    icon: "☀️",
    memberCount: 3210,
    postCount: 1887,
  },
  {
    name: "PTSD Survivors Network",
    slug: "ptsd-survivors",
    description: "Connecting trauma survivors on their healing journey. We discuss recovery strategies and celebrate progress together.",
    category: "ptsd",
    icon: "🌱",
    memberCount: 1560,
    postCount: 934,
  },
  {
    name: "Relationship Wellness",
    slug: "relationship-wellness",
    description: "Building healthy relationships and learning from unhealthy ones. Discussions on boundaries, communication, and red flags.",
    category: "relationships",
    icon: "💑",
    memberCount: 2890,
    postCount: 1542,
  },
  {
    name: "Grief & Healing",
    slug: "grief-healing",
    description: "A compassionate community for those processing loss. We honor our loved ones and support each other through grief.",
    category: "grief",
    icon: "🕊️",
    memberCount: 1450,
    postCount: 823,
  },
  {
    name: "Recovery Advocates",
    slug: "recovery-advocates",
    description: "For those recovering from addiction. Celebrate milestones, share resources, and build accountability together.",
    category: "addiction",
    icon: "✨",
    memberCount: 1890,
    postCount: 1101,
  },
  {
    name: "Work-Life Balance Seekers",
    slug: "work-balance",
    description: "Discussions about managing work stress, preventing burnout, and creating a fulfilling career-life balance.",
    category: "work",
    icon: "⚖️",
    memberCount: 2120,
    postCount: 1256,
  },
  {
    name: "Self-Esteem Journey",
    slug: "self-esteem-journey",
    description: "Building confidence and self-love. Share your wins, support others, and celebrate personal growth.",
    category: "self-esteem",
    icon: "💪",
    memberCount: 2650,
    postCount: 1489,
  },
];

async function seedCommunity() {
  try {
    console.log('🌱 Seeding community data...');

    // Get or create a system user for stories
    const [systemUser] = await User.findOrCreate({
      where: { email: 'stories@saans.com' },
      defaults: {
        email: 'stories@saans.com',
        password: 'system-stories',
        firstName: 'SAANS',
        lastName: 'Stories',
        role: 'user',
        isVerified: true,
        isActive: true,
      },
    });

    console.log('✅ System user created/found');

    // Clear existing stories
    await Story.destroy({ where: {} });
    console.log('✅ Cleared existing stories');

    // Create stories with system user ID
    const stories = await Story.bulkCreate(
      sampleStories.map(story => ({
        ...story,
        userId: systemUser.id,
        status: 'approved',
      }))
    );
    console.log(`✅ Created ${stories.length} stories`);

    // Clear existing groups
    await Group.destroy({ where: {} });
    console.log('✅ Cleared existing groups');

    // Create groups
    const groups = await Group.bulkCreate(sampleGroups);
    console.log(`✅ Created ${groups.length} groups`);

    // Get stats
    const storyStats = await Story.findAll({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
        [require('sequelize').fn('SUM', require('sequelize').col('views')), 'totalViews'],
        [require('sequelize').fn('SUM', require('sequelize').col('upvotes')), 'totalUpvotes'],
      ],
      raw: true,
    });

    const groupStats = await Group.findAll({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
        [require('sequelize').fn('SUM', require('sequelize').col('memberCount')), 'totalMembers'],
      ],
      raw: true,
    });

    console.log('\n📊 Community Data Summary:');
    console.log(`Total Stories: ${storyStats[0]?.total || 0}`);
    console.log(`Total Story Views: ${storyStats[0]?.totalViews || 0}`);
    console.log(`Total Story Upvotes: ${storyStats[0]?.totalUpvotes || 0}`);
    console.log(`Total Groups: ${groupStats[0]?.total || 0}`);
    console.log(`Total Group Members: ${groupStats[0]?.totalMembers || 0}`);

    console.log('\n✨ Community seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding community:', error.message);
    process.exit(1);
  }
}

seedCommunity();
