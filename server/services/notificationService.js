const admin = require('firebase-admin');
const User = require('../models/User');

class NotificationService {
  // Send push notification
  static async sendPushNotification(userId, title, body, data = {}) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.fcmToken) {
        console.log('No FCM token for user:', userId);
        return;
      }

      const message = {
        notification: { title, body },
        data: {
          ...data,
          click_action: data.click_action || 'FLUTTER_NOTIFICATION_CLICK'
        },
        token: user.fcmToken
      };

      const response = await admin.messaging().send(message);
      console.log('Push notification sent:', response);
      return response;
    } catch (error) {
      console.error('Push notification error:', error);
      throw error;
    }
  }

  // Send to multiple users
  static async sendBroadcast(userIds, title, body, data = {}) {
    try {
      const promises = userIds.map(userId =>
        this.sendPushNotification(userId, title, body, data)
      );
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Broadcast error:', error);
      throw error;
    }
  }

  // Appointment reminder
  static async sendAppointmentReminder(appointment) {
    try {
      const user = await User.findById(appointment.userId);
      if (!user) return;

      const therapist = await User.findById(appointment.therapistId);
      const therapistName = `${therapist.firstName} ${therapist.lastName}`;

      await this.sendPushNotification(
        appointment.userId,
        'Appointment Reminder',
        `You have an appointment with ${therapistName} in 30 minutes`,
        {
          appointmentId: appointment._id.toString(),
          click_action: '/sessions'
        }
      );
    } catch (error) {
      console.error('Appointment reminder error:', error);
    }
  }

  // Message notification
  static async sendMessageNotification(userId, senderName, messagePreview) {
    try {
      await this.sendPushNotification(
        userId,
        'New Message',
        `${senderName}: ${messagePreview}`,
        { click_action: '/messages' }
      );
    } catch (error) {
      console.error('Message notification error:', error);
    }
  }

  // Story approval notification
  static async sendStoryApprovalNotification(userId) {
    try {
      await this.sendPushNotification(
        userId,
        'Story Approved! 🎉',
        'Your story has been approved and is now live in the community',
        { click_action: '/community' }
      );
    } catch (error) {
      console.error('Story approval notification error:', error);
    }
  }
}

module.exports = NotificationService;
