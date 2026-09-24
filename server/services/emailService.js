const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    // Gmail SMTP configuration
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'noreply@saans.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
      }
    });

    this.from = process.env.EMAIL_FROM || 'SAANS Support <noreply@saans.com>';
  }

  async sendEmail(to, subject, htmlContent, textContent = '') {
    try {
      const mailOptions = {
        from: this.from,
        to,
        subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, '')
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', {
        to,
        messageId: info.messageId,
        subject
      });

      return {
        success: true,
        messageId: info.messageId,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Email send failed', {
        to,
        error: error.message
      });

      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  }

  // Email Templates
  getWelcomeEmail(user) {
    return {
      subject: `Welcome to SAANS, ${user.firstName}! 🌿`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to SAANS! 🌿</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Mental Health Companion</p>
          </div>

          <div style="background: #f8f9fa; padding: 40px; color: #333;">
            <p>Hi <strong>${user.firstName}</strong>,</p>

            <p>Welcome to SAANS! We're excited to have you join our mental wellness community.</p>

            <h3 style="color: #667eea; margin-top: 30px;">Get Started:</h3>
            <ul style="line-height: 1.8;">
              <li><strong>Track Your Mood</strong> - Understand your emotional patterns</li>
              <li><strong>Connect with Therapists</strong> - Find professional support</li>
              <li><strong>Join Community</strong> - Connect with others on their journey</li>
              <li><strong>Access Resources</strong> - Learn wellness techniques</li>
            </ul>

            <p style="margin-top: 30px;">
              <a href="https://saans-mental-health.vercel.app/dashboard"
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Go to Dashboard
              </a>
            </p>

            <p style="margin-top: 40px; font-size: 14px; color: #666;">
              <strong>Need help?</strong> Reply to this email or contact us at support@saans.com
            </p>
          </div>

          <div style="background: #667eea; padding: 20px; color: white; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
            <p>© 2026 SAANS Mental Health Platform. All rights reserved.</p>
          </div>
        </div>
      `
    };
  }

  getPasswordResetEmail(user, resetLink) {
    return {
      subject: 'Password Reset Request - SAANS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Password Reset</h1>
          </div>

          <div style="background: #f8f9fa; padding: 40px; color: #333;">
            <p>Hi <strong>${user.firstName}</strong>,</p>

            <p>We received a request to reset your password. Click the button below to proceed:</p>

            <p style="margin-top: 30px; text-align: center;">
              <a href="${resetLink}"
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </p>

            <p style="font-size: 12px; color: #666; margin-top: 20px;">
              This link will expire in <strong>1 hour</strong>. If you didn't request this, ignore this email.
            </p>

            <p style="margin-top: 30px; font-size: 12px; color: #999;">
              Can't click the button? Copy and paste this link:<br>
              <code style="background: #e0e0e0; padding: 10px; display: block; margin-top: 10px; word-break: break-all;">
                ${resetLink}
              </code>
            </p>
          </div>

          <div style="background: #667eea; padding: 20px; color: white; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
            <p>© 2026 SAANS Mental Health Platform</p>
          </div>
        </div>
      `
    };
  }

  getAppointmentConfirmationEmail(user, appointment) {
    return {
      subject: `Appointment Confirmed with ${appointment.therapistName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">✅ Appointment Confirmed</h1>
          </div>

          <div style="background: #f8f9fa; padding: 40px; color: #333;">
            <p>Hi <strong>${user.firstName}</strong>,</p>

            <p>Your appointment has been confirmed! Here are the details:</p>

            <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #667eea;">Appointment Details</h3>
              <p style="margin: 10px 0;">
                <strong>Therapist:</strong> ${appointment.therapistName}
              </p>
              <p style="margin: 10px 0;">
                <strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p style="margin: 10px 0;">
                <strong>Time:</strong> ${appointment.time}
              </p>
              <p style="margin: 10px 0;">
                <strong>Type:</strong> ${appointment.type === 'Video' ? '📹 Video Call' : appointment.type === 'Phone' ? '📞 Phone Call' : '🏢 In-Person'}
              </p>
            </div>

            <p style="margin-top: 30px;">
              <a href="https://saans-mental-health.vercel.app/appointments"
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Appointment
              </a>
            </p>

            <p style="margin-top: 30px; font-size: 12px; background: #fff3cd; padding: 15px; border-radius: 5px; color: #333;">
              💡 <strong>Tip:</strong> Join 5 minutes early. Make sure your internet/phone is working properly.
            </p>
          </div>

          <div style="background: #667eea; padding: 20px; color: white; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
            <p>© 2026 SAANS Mental Health Platform</p>
          </div>
        </div>
      `
    };
  }

  getAppointmentReminderEmail(user, appointment) {
    return {
      subject: `📍 Reminder: Appointment tomorrow with ${appointment.therapistName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">📍 Appointment Reminder</h1>
          </div>

          <div style="background: #f8f9fa; padding: 40px; color: #333;">
            <p>Hi <strong>${user.firstName}</strong>,</p>

            <p>Don't forget about your appointment <strong>tomorrow</strong>!</p>

            <div style="background: white; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 5px 0;"><strong>With:</strong> ${appointment.therapistName}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
              <p style="margin: 5px 0;"><strong>Type:</strong> ${appointment.type}</p>
            </div>

            <p style="color: #666;">Please make sure you're ready at least 5 minutes before the scheduled time.</p>

            <p style="margin-top: 30px;">
              <a href="https://saans-mental-health.vercel.app/appointments"
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Details
              </a>
            </p>
          </div>

          <div style="background: #667eea; padding: 20px; color: white; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
            <p>© 2026 SAANS Mental Health Platform</p>
          </div>
        </div>
      `
    };
  }

  getWeeklyMoodReportEmail(user, stats) {
    return {
      subject: '📊 Your Weekly Mood Report - SAANS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">📊 Your Weekly Mood Report</h1>
          </div>

          <div style="background: #f8f9fa; padding: 40px; color: #333;">
            <p>Hi <strong>${user.firstName}</strong>,</p>

            <p>Here's a summary of your mental wellness this week:</p>

            <div style="background: white; border-radius: 5px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0;"><strong>Average Mood</strong></td>
                  <td style="text-align: right; font-size: 20px; color: #667eea;"><strong>${stats.averageMood || 3}/5</strong></td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0;"><strong>Mood Entries</strong></td>
                  <td style="text-align: right;">${stats.entryCount || 0}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0;"><strong>Trend</strong></td>
                  <td style="text-align: right;">${stats.trend === 'improving' ? '📈 Improving' : stats.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;"><strong>Best Day</strong></td>
                  <td style="text-align: right;">${stats.bestDay || '-'}/5</td>
                </tr>
              </table>
            </div>

            <p style="background: #e8f4f8; padding: 15px; border-radius: 5px; color: #333;">
              <strong>💡 Insight:</strong> Keep tracking your mood daily. The more data you collect, the better we can support your wellness journey.
            </p>

            <p style="margin-top: 30px;">
              <a href="https://saans-mental-health.vercel.app/mood-tracker"
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Full Report
              </a>
            </p>
          </div>

          <div style="background: #667eea; padding: 20px; color: white; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
            <p>© 2026 SAANS Mental Health Platform</p>
          </div>
        </div>
      `
    };
  }

  getTherapistRecommendationEmail(user, therapist) {
    return {
      subject: `Therapist Recommendation: ${therapist.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">👤 Therapist Recommendation</h1>
          </div>

          <div style="background: #f8f9fa; padding: 40px; color: #333;">
            <p>Hi <strong>${user.firstName}</strong>,</p>

            <p>Based on your needs, we recommend:</p>

            <div style="background: white; border-radius: 5px; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0;">
              <h3 style="margin-top: 0; color: #667eea;">${therapist.name}</h3>
              <p style="margin: 10px 0;"><strong>Specialty:</strong> ${therapist.specialty}</p>
              <p style="margin: 10px 0;"><strong>Rating:</strong> ${therapist.rating}/5 ⭐ (${therapist.reviews} reviews)</p>
              <p style="margin: 10px 0;"><strong>Price:</strong> ₹${therapist.price}/session</p>
              <p style="margin: 10px 0;"><strong>Languages:</strong> ${therapist.languages.join(', ')}</p>
              <p style="margin: 10px 0;"><strong>About:</strong> ${therapist.bio}</p>
            </div>

            <p style="margin-top: 30px;">
              <a href="https://saans-mental-health.vercel.app/find-therapist"
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Book Session
              </a>
            </p>

            <p style="font-size: 12px; color: #666; margin-top: 20px;">
              Not the right fit? Browse more therapists or chat with our AI counselor.
            </p>
          </div>

          <div style="background: #667eea; padding: 20px; color: white; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
            <p>© 2026 SAANS Mental Health Platform</p>
          </div>
        </div>
      `
    };
  }

  // Send methods
  async sendWelcomeEmail(user) {
    const email = this.getWelcomeEmail(user);
    return this.sendEmail(user.email, email.subject, email.html);
  }

  async sendPasswordResetEmail(user, resetLink) {
    const email = this.getPasswordResetEmail(user, resetLink);
    return this.sendEmail(user.email, email.subject, email.html);
  }

  async sendAppointmentConfirmation(user, appointment) {
    const email = this.getAppointmentConfirmationEmail(user, appointment);
    return this.sendEmail(user.email, email.subject, email.html);
  }

  async sendAppointmentReminder(user, appointment) {
    const email = this.getAppointmentReminderEmail(user, appointment);
    return this.sendEmail(user.email, email.subject, email.html);
  }

  async sendWeeklyReport(user, stats) {
    const email = this.getWeeklyMoodReportEmail(user, stats);
    return this.sendEmail(user.email, email.subject, email.html);
  }

  async sendTherapistRecommendation(user, therapist) {
    const email = this.getTherapistRecommendationEmail(user, therapist);
    return this.sendEmail(user.email, email.subject, email.html);
  }
}

module.exports = new EmailService();
