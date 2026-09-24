const Analytics = require('../models/Analytics');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');

/**
 * Analytics Service
 * Tracks and generates analytics reports
 */

class AnalyticsService {
  // Track event
  async trackEvent(userId, event, metadata = {}) {
    try {
      const analytics = new Analytics({
        userId,
        event,
        metadata,
        timestamp: new Date()
      });

      await analytics.save();

      logger.debug('Event tracked', { userId, event });
      return analytics;
    } catch (error) {
      logger.error('Event tracking failed', { error: error.message });
      // Don't throw - analytics should not break main app
    }
  }

  // Get dashboard stats
  async getDashboardStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [
        userStats,
        appointmentStats,
        paymentStats,
        eventStats
      ] = await Promise.all([
        this.getUserStats(startDate),
        this.getAppointmentStats(startDate),
        this.getPaymentStats(startDate),
        this.getEventStats(startDate)
      ]);

      return {
        period: `Last ${days} days`,
        users: userStats,
        appointments: appointmentStats,
        payments: paymentStats,
        events: eventStats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Dashboard stats generation failed', { error: error.message });
      throw error;
    }
  }

  // User analytics
  async getUserStats(startDate) {
    try {
      const totalUsers = await User.countDocuments();
      const newUsers = await User.countDocuments({
        createdAt: { $gte: startDate }
      });

      const activeUsers = await Analytics.countDocuments({
        timestamp: { $gte: startDate }
      }).distinct('userId');

      const usersByRole = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        total: totalUsers,
        new: newUsers,
        active: activeUsers.length,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      };
    } catch (error) {
      logger.error('User stats failed', { error: error.message });
      throw error;
    }
  }

  // Appointment analytics
  async getAppointmentStats(startDate) {
    try {
      const totalAppointments = await Appointment.countDocuments();
      const newAppointments = await Appointment.countDocuments({
        createdAt: { $gte: startDate }
      });

      const completedAppointments = await Appointment.countDocuments({
        status: 'completed',
        completedAt: { $gte: startDate }
      });

      const cancelledAppointments = await Appointment.countDocuments({
        status: 'cancelled',
        createdAt: { $gte: startDate }
      });

      const appointmentsByType = await Appointment.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        total: totalAppointments,
        new: newAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        byType: appointmentsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      };
    } catch (error) {
      logger.error('Appointment stats failed', { error: error.message });
      throw error;
    }
  }

  // Payment analytics
  async getPaymentStats(startDate) {
    try {
      const totalTransactions = await Payment.countDocuments({
        createdAt: { $gte: startDate }
      });

      const completedPayments = await Payment.aggregate([
        {
          $match: {
            status: 'completed',
            completedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      const failedPayments = await Payment.countDocuments({
        status: 'failed',
        createdAt: { $gte: startDate }
      });

      const paymentsByMethod = await Payment.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      return {
        totalTransactions,
        completed: completedPayments[0] || { count: 0, totalAmount: 0 },
        failed: failedPayments,
        byMethod: paymentsByMethod.reduce((acc, item) => {
          acc[item._id] = { count: item.count, amount: item.totalAmount };
          return acc;
        }, {})
      };
    } catch (error) {
      logger.error('Payment stats failed', { error: error.message });
      throw error;
    }
  }

  // Event analytics
  async getEventStats(startDate) {
    try {
      const eventCounts = await Analytics.aggregate([
        {
          $match: { timestamp: { $gte: startDate } }
        },
        {
          $group: {
            _id: '$event',
            count: { $sum: 1 }
          }
        }
      ]);

      return eventCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
    } catch (error) {
      logger.error('Event stats failed', { error: error.message });
      throw error;
    }
  }

  // User engagement report
  async getUserEngagement(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const events = await Analytics.find({
        userId,
        timestamp: { $gte: startDate }
      }).sort({ timestamp: -1 });

      const eventCounts = events.reduce((acc, event) => {
        acc[event.event] = (acc[event.event] || 0) + 1;
        return acc;
      }, {});

      const dailyActivity = events.reduce((acc, event) => {
        const date = event.timestamp.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return {
        userId,
        period: `Last ${days} days`,
        totalEvents: events.length,
        eventTypes: eventCounts,
        dailyActivity,
        lastActive: events[0]?.timestamp
      };
    } catch (error) {
      logger.error('User engagement report failed', { error: error.message });
      throw error;
    }
  }

  // Revenue report
  async getRevenueReport(startDate, endDate) {
    try {
      const payments = await Payment.aggregate([
        {
          $match: {
            status: 'completed',
            completedAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            transactionCount: { $sum: 1 },
            avgTransaction: { $avg: '$amount' }
          }
        }
      ]);

      const revenueByMethod = await Payment.aggregate([
        {
          $match: {
            status: 'completed',
            completedAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$paymentMethod',
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      const dailyRevenue = await Payment.aggregate([
        {
          $match: {
            status: 'completed',
            completedAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
            revenue: { $sum: '$amount' },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return {
        period: { startDate, endDate },
        summary: payments[0] || { totalRevenue: 0, transactionCount: 0, avgTransaction: 0 },
        byMethod: revenueByMethod,
        dailyRevenue
      };
    } catch (error) {
      logger.error('Revenue report failed', { error: error.message });
      throw error;
    }
  }

  // Therapist performance report
  async getTherapistPerformance(therapistId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const appointments = await Appointment.find({
        therapistId,
        createdAt: { $gte: startDate }
      });

      const completed = appointments.filter(a => a.status === 'completed').length;
      const cancelled = appointments.filter(a => a.status === 'cancelled').length;
      const avgRating = appointments
        .filter(a => a.rating)
        .reduce((sum, a) => sum + a.rating, 0) / appointments.filter(a => a.rating).length || 0;

      const weeklyBookings = appointments.reduce((acc, appt) => {
        const week = Math.floor((new Date() - appt.createdAt) / (7 * 24 * 60 * 60 * 1000));
        acc[week] = (acc[week] || 0) + 1;
        return acc;
      }, {});

      return {
        therapistId,
        period: `Last ${days} days`,
        totalAppointments: appointments.length,
        completed,
        cancelled,
        completionRate: ((completed / appointments.length) * 100).toFixed(2) + '%',
        avgRating: avgRating.toFixed(2),
        weeklyBookings
      };
    } catch (error) {
      logger.error('Therapist performance report failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
