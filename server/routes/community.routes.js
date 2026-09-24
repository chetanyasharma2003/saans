const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');
const SupportGroup = require('../models/SupportGroup');
const { authenticateToken } = require('../middleware/auth');

// ============ POSTS ============

router.get('/posts', async (req, res) => {
  try {
    let posts = await CommunityPost.find()
      .populate('userId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    // If no posts in DB, return mock data
    if (posts.length === 0) {
      posts = [
        {
          _id: '1',
          userId: { firstName: 'Priya', lastName: 'S.', avatar: '👩‍🦱' },
          title: 'Anxiety management tips',
          content: 'Here are some tips that helped me manage anxiety...',
          likes: 342,
          likedBy: [],
          comments: 89,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          _id: '2',
          userId: { firstName: 'Rajesh', lastName: 'K.', avatar: '👨‍💼' },
          title: 'Therapy breakthrough story',
          content: 'I had a major breakthrough in my therapy session today...',
          likes: 521,
          likedBy: [],
          comments: 156,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          _id: '3',
          userId: { firstName: 'Meera', lastName: 'P.', avatar: '👩' },
          title: 'Self-care routine guide',
          content: 'Building a self-care routine has been life-changing...',
          likes: 287,
          likedBy: [],
          comments: 42,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ];
    }

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/posts/:id', async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('userId', 'firstName lastName avatar');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    const post = new CommunityPost({
      userId: req.userId,
      title,
      content,
      category,
      tags: tags || [],
    });

    await post.save();
    await post.populate('userId', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Post created',
      data: post,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const alreadyLiked = post.likedBy.includes(req.userId);

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(id => id.toString() !== req.userId);
      post.likes--;
    } else {
      post.likedBy.push(req.userId);
      post.likes++;
    }

    await post.save();

    res.json({
      success: true,
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      data: post,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GROUPS ============

router.get('/groups', async (req, res) => {
  try {
    const groups = await SupportGroup.find({ isActive: true })
      .populate('createdBy', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: groups,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/groups/:id', async (req, res) => {
  try {
    const group = await SupportGroup.findById(req.params.id)
      .populate('createdBy', 'firstName lastName avatar')
      .populate('members', 'firstName lastName avatar');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/groups/:id/join', authenticateToken, async (req, res) => {
  try {
    const group = await SupportGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const alreadyMember = group.members.includes(req.userId);

    if (alreadyMember) {
      return res.status(400).json({ error: 'Already a member' });
    }

    group.members.push(req.userId);
    group.memberCount = group.members.length;
    await group.save();

    res.json({
      success: true,
      message: 'Joined group',
      data: group,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/groups/:id/leave', authenticateToken, async (req, res) => {
  try {
    const group = await SupportGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    group.members = group.members.filter(id => id.toString() !== req.userId);
    group.memberCount = group.members.length;
    await group.save();

    res.json({
      success: true,
      message: 'Left group',
      data: group,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
