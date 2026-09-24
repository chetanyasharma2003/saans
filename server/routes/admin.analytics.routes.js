const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Analytics = require('../models/Analytics');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Therapist = require('../models/Therapist');
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

// Middleware: Admin only
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

// ==================== DASHBOARD METRICS ====================

// Get dashboard overview
router.get('/overview', auth, adminOnly, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Total users
    const totalUsers = await User.countDocuments({ role: 'user' });
    const thisMonthSignups = await Analytics.countDocuments({
      eventType: 'user_signup',
      date: { $gte: thisMonth }
    });

    // Active users (logged in this month)
    const activeUsers = await Analytics.distinct('userId', {
      eventType: 'user_login',
      date: { $gte: thisMonth }
    }).then(ids => ids.length);

    // Total appointments
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const thisMonthAppointments = await Appointment.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    // Revenue
    const totalRevenue = await Appointment.aggregate([
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const thisMonthRevenue = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonth },
          paymentStatus: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    // Therapists
    const totalTherapists = await Therapist.countDocuments();
    const activeTherapists = await Therapist.countDocuments({ status: 'verified' });

    // Subscriptions
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const totalMRR = await Subscription.aggregate([
      {
        $match: { status: 'active', 'planDetails.billingCycle': 'monthly' }
      },
      { $group: { _id: null, total: { $sum: '$planDetails.price' } } }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          thisMonthSignups,
          active: activeUsers
        },
        appointments: {
          total: totalAppointments,
          completed: completedAppointments,
          thisMonth: thisMonthAppointments,
          completionRate: ((completedAppointments / totalAppointments) * 100).toFixed(2) + '%'
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          thisMonth: thisMonthRevenue[0]?.total || 0,
          currency: 'INR'
        },
        therapists: {
          total: totalTherapists,
          active: activeTherapists,
          verificationRate: ((activeTherapists / totalTherapists) * 100).toFixed(2) + '%'
        },
        subscriptions: {
          active: activeSubscriptions,
          monthlyRecurringRevenue: totalMRR[0]?.total || 0,
          currency: 'INR'
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get revenue analytics
router.get('/revenue', auth, adminOnly, async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    // Daily revenue
    const dailyRevenue = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$price' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue by subscription plan
    const revenueByPlan = await Subscription.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          totalMonthly: { $sum: '$planDetails.price' }
        }
      }
    ]);

    // MRR Trend
    const mrrTrend = await Subscription.aggregate([
      {
        $match: { startDate: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startDate' }
          },
          mrrAdded: {
            $sum: {
              $cond: [
                { $eq: ['$planDetails.billingCycle', 'monthly'] },
                '$planDetails.price',
                0
              ]
            }
          },
          subscriptionsAdded: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        dailyRevenue,
        revenueByPlan,
        mrrTrend,
        summary: {
          totalDays: parseInt(days),
          totalRevenue: dailyRevenue.reduce((sum, d) => sum + d.revenue, 0),
          avgDailyRevenue: (dailyRevenue.reduce((sum, d) => sum + d.revenue, 0) / dailyRevenue.length).toFixed(2),
          totalTransactions: dailyRevenue.reduce((sum, d) => sum + d.transactions, 0)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user engagement metrics
router.get('/engagement', auth, adminOnly, async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const eventStats = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Daily active users
    const dailyActiveUsers = await Analytics.aggregate([
      {
        $match: {
          eventType: { $in: ['user_login', 'appointment_completed', 'mood_entry_created'] },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            userId: '$userId'
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          users: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Feature adoption
    const featureAdoption = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$eventType',
          uniqueUsers: { $addToSet: '$userId' },
          totalEvents: { $sum: 1 }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' }
        }
      },
      { $project: { uniqueUsers: 0 } },
      { $sort: { totalEvents: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        eventStats,
        dailyActiveUsers,
        featureAdoption,
        summary: {
          totalEvents: eventStats.reduce((sum, e) => sum + e.count, 0),
          uniqueEventTypes: eventStats.length,
          avgDAU: (dailyActiveUsers.reduce((sum, d) => sum + d.users, 0) / dailyActiveUsers.length).toFixed(0)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get therapist performance
router.get('/therapist-performance', auth, adminOnly, async (req, res, next) => {
  try {
    const performanceData = await Appointment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$therapistId',
          sessions: { $sum: 1 },
          totalEarnings: { $sum: '$price' },
          avgRating: { $avg: '$rating' },
          ratings: { $push: '$rating' }
        }
      },
      {
        $lookup: {
          from: 'therapists',
          localField: '_id',
          foreignField: '_id',
          as: 'therapist'
        }
      },
      {
        $unwind: '$therapist'
      },
      {
        $project: {
          therapistName: '$therapist.name',
          sessions,
          totalEarnings,
          avgRating: { $round: ['$avgRating', 2] },
          ratingCount: { $size: '$ratings' }
        }
      },
      { $sort: { sessions: -1 } }
    ]);

    res.json({
      success: true,
      data: performanceData,
      summary: {
        topPerformer: performanceData[0]?.therapistName,
        totalTherapists: performanceData.length,
        avgSessionsPerTherapist: (performanceData.reduce((sum, t) => sum + t.sessions, 0) / performanceData.length).toFixed(1)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get subscription analytics
router.get('/subscriptions', auth, adminOnly, async (req, res, next) => {
  try {
    // Subscriptions by plan
    const byPlan = await Subscription.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          avgPrice: { $avg: '$planDetails.price' },
          active: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Subscriptions by status
    const byStatus = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Churn rate (30-day window)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const cancelledRecently = await Subscription.countDocuments({
      cancelledAt: { $gte: thirtyDaysAgo }
    });

    const startedRecently = await Subscription.countDocuments({
      startDate: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        byPlan,
        byStatus,
        churnMetrics: {
          cancelledLast30Days: cancelledRecently,
          startedLast30Days: startedRecently,
          churnRate: ((cancelledRecently / (startedRecently || 1)) * 100).toFixed(2) + '%'
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user demographics & cohort analysis
router.get('/user-cohorts', auth, adminOnly, async (req, res, next) => {
  try {
    // Users by signup month
    const userCohorts = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Retention by cohort (users still active)
    const retentionData = await Analytics.aggregate([
      {
        $match: { eventType: 'user_login' }
      },
      {
        $group: {
          _id: {
            userId: '$userId',
            date: { $dateToString: { format: '%Y-%m', date: '$timestamp' } }
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          activeUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        userCohorts,
        retentionData,
        summary: {
          totalCohorts: userCohorts.length,
          totalNewUsers: userCohorts.reduce((sum, c) => sum + c.newUsers, 0)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get appointment analytics
router.get('/appointments', auth, adminOnly, async (req, res, next) => {
  try {
    const appointmentStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    // Bookings over time
    const bookingTrend = await Appointment.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$price' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // No-show rate
    const noShowRate = await Appointment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          noShows: {
            $sum: { $cond: [{ $gt: ['$noShowCount', 0] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          noShowPercentage: {
            $multiply: [
              { $divide: ['$noShows', '$total'] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        appointmentStats,
        bookingTrend,
        noShowMetrics: noShowRate[0] || { noShowPercentage: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get real-time metrics snapshot
router.get('/realtime', auth, adminOnly, async (req, res, next) => {
  try {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const today = new Date(now.setHours(0, 0, 0, 0));

    const lastHourEvents = await Analytics.countDocuments({
      timestamp: { $gte: lastHour }
    });

    const todayRevenue = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          paymentStatus: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const todayBookings = await Appointment.countDocuments({
      createdAt: { $gte: today }
    });

    const todaySignups = await Analytics.countDocuments({
      eventType: 'user_signup',
      timestamp: { $gte: today }
    });

    res.json({
      success: true,
      data: {
        lastHourEvents,
        todayMetrics: {
          revenue: todayRevenue[0]?.total || 0,
          bookings: todayBookings,
          signups: todaySignups,
          currency: 'INR'
        },
        timestamp: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
