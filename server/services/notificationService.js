const nodemailer = require('nodemailer');
const twilio = require('twilio');
const logger = require('../utils/logger');

// Email transporter
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

class NotificationService {
  // ==================== EMAIL NOTIFICATIONS ====================

  async sendAppointmentConfirmation(userEmail, userName, appointmentDetails) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Appointment Confirmed - SAANS Mental Health',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px;">
              <h2 style="color: #8b5cf6; margin-bottom: 20px;">Appointment Confirmed! 🎉</h2>

              <p>Dear ${userName},</p>

              <p>Your therapy session has been confirmed. Here are the details:</p>

              <div style="background-color: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Therapist:</strong> ${appointmentDetails.therapistName}</p>
                <p><strong>Date:</strong> ${new Date(appointmentDetails.date).toLocaleDateString('en-IN')}</p>
                <p><strong>Time:</strong> ${appointmentDetails.time}</p>
                <p><strong>Duration:</strong> ${appointmentDetails.duration} minutes</p>
                <p><strong>Mode:</strong> ${appointmentDetails.mode}</p>
                <p><strong>Cost:</strong> ₹${appointmentDetails.price}</p>
              </div>

              <p style="color: #666; font-size: 14px;">
                📌 Important: Please join 5 minutes early. Check your video call link in the app.
              </p>

              <a href="${process.env.CLIENT_URL}/appointments" style="display: inline-block; background-color: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
                View Appointment Details
              </a>

              <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                Questions? Contact support@saans.com
              </p>
            </div>
          </div>
        `
      };

      await emailTransporter.sendMail(mailOptions);
      logger.info('Appointment confirmation email sent', { email: userEmail });
      return { success: true };
    } catch (error) {
      logger.error('Email send error', { error: error.message });
      throw error;
    }
  }

  async sendTherapyCompletionEmail(userEmail, userName, feedbackLink) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Session Completed - Share Your Feedback',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px;">
              <h2 style="color: #8b5cf6; margin-bottom: 20px;">Thank You for Your Session 💖</h2>

              <p>Dear ${userName},</p>

              <p>Your therapy session has been completed. We hope it was helpful!</p>

              <p>Your feedback helps us improve our services and support our therapists. Would you mind sharing your experience?</p>

              <a href="${feedbackLink}" style="display: inline-block; background-color: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
                Share Feedback
              </a>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Keep tracking your progress in the app. Remember, consistency is key to mental wellness! 🌟
              </p>
            </div>
          </div>
        `
      };

      await emailTransporter.sendMail(mailOptions);
      logger.info('Session completion email sent', { email: userEmail });
      return { success: true };
    } catch (error) {
      logger.error('Email send error', { error: error.message });
      throw error;
    }
  }

  async sendSubscriptionConfirmation(userEmail, userName, subscriptionDetails) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Welcome to ${subscriptionDetails.plan} Plan - SAANS`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px;">
              <h2 style="color: #8b5cf6; margin-bottom: 20px;">Welcome to SAANS Premium! 🎊</h2>

              <p>Dear ${userName},</p>

              <p>Your subscription has been activated successfully!</p>

              <div style="background-color: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Plan:</strong> ${subscriptionDetails.plan.charAt(0).toUpperCase() + subscriptionDetails.plan.slice(1)}</p>
                <p><strong>Amount:</strong> ₹${subscriptionDetails.amount}/month</p>
                <p><strong>Start Date:</strong> ${new Date(subscriptionDetails.startDate).toLocaleDateString('en-IN')}</p>
                <p><strong>Renewal Date:</strong> ${new Date(subscriptionDetails.renewalDate).toLocaleDateString('en-IN')}</p>
              </div>

              <h3 style="color: #333; margin-top: 30px;">Your Benefits Include:</h3>
              <ul style="line-height: 2;">
                ${subscriptionDetails.features.map(f => `<li>✅ ${f}</li>`).join('')}
              </ul>

              <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background-color: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
                Start Using Your Plan
              </a>
            </div>
          </div>
        `
      };

      await emailTransporter.sendMail(mailOptions);
      logger.info('Subscription confirmation email sent', { email: userEmail });
      return { success: true };
    } catch (error) {
      logger.error('Email send error', { error: error.message });
      throw error;
    }
  }

  // ==================== SMS NOTIFICATIONS ====================

  async sendAppointmentReminder(phoneNumber, therapistName, appointmentTime) {
    try {
      const message = await twilioClient.messages.create({
        body: `Hi! Reminder: You have a therapy session with ${therapistName} at ${appointmentTime}. Get ready in 15 mins! - SAANS`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      logger.info('Appointment reminder SMS sent', { id: message.sid });
      return { success: true, messageSid: message.sid };
    } catch (error) {
      logger.error('SMS send error', { error: error.message });
      throw error;
    }
  }

  async sendVerificationCode(phoneNumber, code) {
    try {
      const message = await twilioClient.messages.create({
        body: `Your SAANS verification code is: ${code}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      logger.info('Verification SMS sent', { id: message.sid });
      return { success: true, messageSid: message.sid };
    } catch (error) {
      logger.error('SMS send error', { error: error.message });
      throw error;
    }
  }

  async sendCrisisAlert(phoneNumber, supportInfo) {
    try {
      const message = await twilioClient.messages.create({
        body: `SAANS Support Alert: ${supportInfo.resourceName} - ${supportInfo.phone}. We're here for you. 💜`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      logger.info('Crisis alert SMS sent', { id: message.sid });
      return { success: true, messageSid: message.sid };
    } catch (error) {
      logger.error('SMS send error', { error: error.message });
      throw error;
    }
  }

  // ==================== BATCH NOTIFICATIONS ====================

  async sendBulkEmail(recipients, subject, htmlContent) {
    try {
      const results = [];
      for (const recipient of recipients) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipient.email,
          subject,
          html: htmlContent(recipient)
        };

        try {
          await emailTransporter.sendMail(mailOptions);
          results.push({ email: recipient.email, success: true });
        } catch (error) {
          results.push({ email: recipient.email, success: false, error: error.message });
        }
      }

      logger.info('Bulk email sent', { total: recipients.length, successful: results.filter(r => r.success).length });
      return { success: true, results };
    } catch (error) {
      logger.error('Bulk email error', { error: error.message });
      throw error;
    }
  }

  async sendWeeklyDigest(userEmail, userName, weeklyStats) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Your Weekly Wellness Digest - SAANS',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px;">
              <h2 style="color: #8b5cf6; margin-bottom: 20px;">Your Weekly Wellness Update 📊</h2>

              <p>Dear ${userName},</p>

              <div style="background-color: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Sessions Completed:</strong> ${weeklyStats.sessions}</p>
                <p><strong>Mood Progress:</strong> ${weeklyStats.moodTrend}</p>
                <p><strong>Consistency Score:</strong> ${weeklyStats.consistency}%</p>
                <p><strong>Days Tracked:</strong> ${weeklyStats.daysTracked}/7</p>
              </div>

              <p style="color: #666; font-size: 14px;">
                Keep up the great work! 🌟 Your mental wellness journey is progressing beautifully.
              </p>

              <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background-color: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
                View Full Dashboard
              </a>
            </div>
          </div>
        `
      };

      await emailTransporter.sendMail(mailOptions);
      logger.info('Weekly digest sent', { email: userEmail });
      return { success: true };
    } catch (error) {
      logger.error('Email send error', { error: error.message });
      throw error;
    }
  }
}

module.exports = new NotificationService();
