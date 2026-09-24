#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const CommunityPost = require('../models/CommunityPost');
const communityPostsData = require('../seeds/communityPostsData');
const logger = require('../utils/logger');

async function seedCommunityPosts() {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoURI) {
      throw new Error('MongoDB URI not configured');
    }

    console.log('📚 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Check existing posts
    const existingCount = await CommunityPost.countDocuments({ source: 'user' });
    if (existingCount > 0) {
      console.log(`⚠️  Database already contains ${existingCount} community posts`);
      const response = await new Promise((resolve) => {
        process.stdout.write('Do you want to delete and recreate? (yes/no): ');
        process.stdin.once('data', (data) => {
          resolve(data.toString().trim().toLowerCase());
        });
      });

      if (response === 'yes' || response === 'y') {
        console.log('🗑️  Deleting existing posts...');
        await CommunityPost.deleteMany({ source: 'user' });
        console.log('✅ Deleted');
      } else {
        console.log('⏭️  Skipping seed. Exiting.');
        process.exit(0);
      }
    }

    // Insert posts
    console.log(`\n💬 Inserting ${communityPostsData.length} community posts...`);

    const processedPosts = communityPostsData.map((post) => ({
      ...post,
      userId: new mongoose.Types.ObjectId(), // Random user ID (would be real in production)
      status: 'published',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random time in last 30 days
      comments: [],
      tags: post.tags || []
    }));

    const insertedPosts = await CommunityPost.insertMany(processedPosts);

    console.log(`✅ Successfully inserted ${insertedPosts.length} posts\n`);

    // Print summary
    console.log('📊 COMMUNITY POSTS SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const byCategory = {};
    let totalEngagement = 0;

    insertedPosts.forEach((post) => {
      byCategory[post.category] = (byCategory[post.category] || 0) + 1;
      totalEngagement += post.engagement.upvotes + post.engagement.comments;
    });

    console.log('\n📍 By Category:');
    Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} posts`);
      });

    console.log(`\n💬 Total Engagement: ${totalEngagement}`);

    console.log('\n✨ Sample Posts:');
    insertedPosts.slice(0, 3).forEach((post) => {
      console.log(`\n   "${post.title}"`);
      console.log(`   Category: ${post.category}`);
      console.log(`   👍 ${post.engagement.upvotes} | 💬 ${post.engagement.comments} | 💾 ${post.engagement.saves}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Community posts seed completed!\n');

    logger.info('Community posts seed completed', {
      count: insertedPosts.length,
      timestamp: new Date()
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding posts:', error.message);
    logger.error('Community posts seed failed', { error: error.message });
    process.exit(1);
  }
}

seedCommunityPosts();
