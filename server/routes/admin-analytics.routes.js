const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Therapist = require('../models/Therapist');
const Appointment = require('../models/Appointment');
const Story = require('../models/Story');
const CommunityGroup = require('../models/CommunityGroup');
const MentalHealthResource = require('../models/MentalHealthResource');
const Analytics = require('../models/Analytics');

// Middleware to check admin role
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Dashboard statistics
router.get('/dashboard/stats', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTherapists = await Therapist.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const totalStories = await Story.countDocuments();
    const totalGroups = await CommunityGroup.countDocuments();
    const totalResources = await MentalHealthResource.countDocuments();

    const pendingStories = await Story.countDocuments({ status: 'pending' });
    const approvedStories = await Story.countDocuments({ status: 'approved' });

    const appointmentRevenue = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const monthlyUsers = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
      }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTherapists,
        monthlyNewUsers: monthlyUsers,
        totalAppointments,
        completedAppointments,
        appointmentCompletionRate: totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0,
        estimatedRevenue: appointmentRevenue[0]?.total || 0,
        community: {
          totalStories,
          pendingStories,
          approvedStories,
          totalGroups
        },
        resources: totalResources
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all users with filters
router.get('/users', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { role = null, status = null, limit = 20, offset = 0 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query)
      .select('-password')
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      total,
      hasMore: offset + users.length < total
    });
  } catch (error) {
    next(error);
  }
});

// Get pending stories for moderation
router.get('/moderation/stories', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const stories = await Story.find({ status: 'pending' })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: stories, count: stories.length });
  } catch (error) {
    next(error);
  }
});

// Approve story
router.post('/moderation/stories/:id/approve', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedBy: req.userId,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }

    res.json({ success: true, data: story });
  } catch (error) {
    next(error);
  }
});

// Reject story
router.post('/moderation/stories/:id/reject', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { reason } = req.body;

    const story = await Story.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        moderationNotes: reason || 'Rejected by moderator'
      },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }

    res.json({ success: true, data: story });
  } catch (error) {
    next(error);
  }
});

// Get therapist applications/list
router.get('/therapists', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const therapists = await Therapist.find()
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ createdAt: -1 });

    const total = await Therapist.countDocuments();

    res.json({
      success: true,
      data: therapists,
      total,
      hasMore: offset + therapists.length < total
    });
  } catch (error) {
    next(error);
  }
});

// Appointment statistics
router.get('/appointments/stats', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const appointmentsByMonth = await Appointment.aggregate([
      {
        $group: {
          _id: { $month: '$scheduledAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$price' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topTherapists = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$therapistId', count: { $sum: 1 }, revenue: { $sum: '$price' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'therapists', localField: '_id', foreignField: '_id', as: 'therapist' } }
    ]);

    res.json({
      success: true,
      data: {
        byStatus: appointmentsByStatus,
        byMonth: appointmentsByMonth,
        topTherapists
      }
    });
  } catch (error) {
    next(error);
  }
});

// Community statistics
router.get('/community/stats', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const storyStats = await Story.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const storiesByCategory = await Story.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 }, views: { $sum: '$views' } } },
      { $sort: { count: -1 } }
    ]);

    const groupStats = {
      total: await CommunityGroup.countDocuments(),
      activeGroups: await CommunityGroup.countDocuments({ memberCount: { $gt: 0 } })
    };

    res.json({
      success: true,
      data: {
        stories: { byStatus: storyStats, byCategory: storiesByCategory },
        groups: groupStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// Resource statistics
router.get('/resources/stats', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const totalViews = await MentalHealthResource.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' }, count: { $sum: 1 } } }
    ]);

    const topResources = await MentalHealthResource.aggregate([
      { $sort: { views: -1 } },
      { $limit: 10 },
      { $project: { 'condition.name': 1, views: 1, saves: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalViews: totalViews[0]?.totalViews || 0,
        resourceCount: totalViews[0]?.count || 0,
        topResources
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
