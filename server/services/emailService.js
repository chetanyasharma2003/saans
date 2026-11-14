/**
 * Email Service - SendGrid Integration
 * Handles all email notifications for SAANS platform
 */

const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Initialize SendGrid (if API key exists)
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Fallback to Nodemailer for development
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@saans.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

class EmailService {
  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(user) {
    try {
      const subject = '🎉 Welcome to SAANS - Mental Health Platform';
      const htmlContent = `
        <h1>Welcome to SAANS, ${user.firstName}!</h1>
        <p>We're excited to have you on our platform dedicated to mental wellness.</p>
        <h2>What you can do on SAANS:</h2>
        <ul>
          <li>Book sessions with licensed therapists</li>
          <li>Track your mood and wellness journey</li>
          <li>Connect with a supportive community</li>
          <li>Access mental health resources</li>
        </ul>
        <a href="${FRONTEND_URL}/dashboard">Get Started</a>
        <p>Questions? Contact us at support@saans.com</p>
      `;

      await this.send(user.email, subject, htmlContent);
      console.log(`✅ Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
    }
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(user, verificationToken) {
    try {
      const verificationLink = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
      const subject = '🔐 Verify Your SAANS Email';
      const htmlContent = `
        <h1>Verify Your Email</h1>
        <p>Hi ${user.firstName},</p>
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `;

      await this.send(user.email, subject, htmlContent);
      console.log(`✅ Verification email sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
    }
  }

  /**
   * Send appointment booking confirmation
   */
  async sendBookingConfirmation(appointment, user, therapist) {
    try {
      const appointmentUrl = `${FRONTEND_URL}/appointments/${appointment.id}`;
      const subject = `✅ Appointment Confirmed with ${therapist.firstName} ${therapist.lastName}`;
      const htmlContent = `
        <h1>Your Appointment is Confirmed!</h1>
        <p>Hi ${user.firstName},</p>
        <h2>Appointment Details:</h2>
        <ul>
          <li><strong>Therapist:</strong> ${therapist.firstName} ${therapist.lastName}</li>
          <li><strong>Date & Time:</strong> ${new Date(appointment.scheduledAt).toLocaleString()}</li>
          <li><strong>Duration:</strong> ${appointment.duration} minutes</li>
          <li><strong>Session Type:</strong> ${appointment.sessionType}</li>
          <li><strong>Cost:</strong> $${appointment.price}</li>
        </ul>
        <h2>What to do next:</h2>
        <ol>
          <li>Check your calendar for the appointment time</li>
          <li>Join 5 minutes early via the video call link</li>
          <li>Prepare a quiet, comfortable space</li>
        </ol>
        <a href="${appointmentUrl}">View Appointment Details</a>
        <h3>Payment Status: ${appointment.isPaid ? '✅ Paid' : '⏳ Pending'}</h3>
        <p>If you need to reschedule or cancel, do so at least 24 hours in advance.</p>
      `;

      await this.send(user.email, subject, htmlContent);
      console.log(`✅ Booking confirmation sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Error sending booking confirmation:', error);
    }
  }

  /**
   * Send session reminder (24 hours before)
   */
  async sendSessionReminder(appointment, user, therapist) {
    try {
      const appointmentUrl = `${FRONTEND_URL}/appointments/${appointment.id}/join`;
      const subject = `⏰ Reminder: Your Appointment Tomorrow with ${therapist.firstName}`;
      const htmlContent = `
        <h1>Session Reminder</h1>
        <p>Hi ${user.firstName},</p>
        <p>Your therapy session is coming up tomorrow!</p>
        <h2>Session Details:</h2>
        <ul>
          <li><strong>Time:</strong> ${new Date(appointment.scheduledAt).toLocaleTimeString()}</li>
          <li><strong>Therapist:</strong> ${therapist.firstName} ${therapist.lastName}</li>
          <li><strong>Duration:</strong> ${appointment.duration} minutes</li>
        </ul>
        <a href="${appointmentUrl}">Join Session</a>
        <h3>Tips for the session:</h3>
        <ul>
          <li>Find a quiet, private space</li>
          <li>Test your camera and microphone</li>
          <li>Have water nearby</li>
          <li>Minimize distractions</li>
        </ul>
        <p>See you tomorrow!</p>
      `;

      await this.send(user.email, subject, htmlContent);
      console.log(`✅ Session reminder sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Error sending session reminder:', error);
    }
  }

  /**
   * Send payment receipt
   */
  async sendReceipt(payment, user, therapist) {
    try {
      const subject = `💳 Payment Receipt - Therapy Session`;
      const htmlContent = `
        <h1>Payment Receipt</h1>
        <p>Hi ${user.firstName},</p>
        <h2>Receipt Details:</h2>
        <ul>
          <li><strong>Therapist:</strong> ${therapist.firstName} ${therapist.lastName}</li>
          <li><strong>Amount:</strong> $${payment.amount}</li>
          <li><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString()}</li>
          <li><strong>Status:</strong> ✅ Paid</li>
          <li><strong>Transaction ID:</strong> ${payment.stripeChargeId}</li>
        </ul>
        <p>Your session is confirmed and you're all set to proceed.</p>
        <a href="${FRONTEND_URL}/dashboard">Go to Dashboard</a>
      `;

      await this.send(user.email, subject, htmlContent);
      console.log(`✅ Receipt sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Error sending receipt:', error);
    }
  }

  /**
   * Send feedback request (after session)
   */
  async sendFeedbackRequest(appointment, user, therapist) {
    try {
      const feedbackUrl = `${FRONTEND_URL}/appointments/${appointment.id}/feedback`;
      const subject = `🌟 Share Your Feedback - How Was Your Session?`;
      const htmlContent = `
        <h1>How was your session?</h1>
        <p>Hi ${user.firstName},</p>
        <p>Thank you for your session with ${therapist.firstName}!</p>
        <p>We'd love to hear about your experience. Your feedback helps us improve.</p>
        <a href="${feedbackUrl}">Share Feedback</a>
        <p>It takes just 2 minutes and helps us serve you better.</p>
      `;

      await this.send(user.email, subject, htmlContent);
      console.log(`✅ Feedback request sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Error sending feedback request:', error);
    }
  }

  /**
   * Send password reset link
   */
  async sendPasswordReset(user, resetToken) {
    try {
      const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
      const subject = `🔐 Reset Your SAANS Password`;
      const htmlContent = `
        <h1>Password Reset Request</h1>
        <p>Hi ${user.firstName},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;

      await this.send(user.email, subject, htmlContent);
      console.log(`✅ Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Error sending password reset:', error);
    }
  }

  /**
   * Send therapist approval notification
   */
  async sendTherapistApproved(therapist) {
    try {
      const profileUrl = `${FRONTEND_URL}/therapist/profile`;
      const subject = `🎉 Your SAANS Therapist Profile is Approved!`;
      const htmlContent = `
        <h1>Welcome to SAANS!</h1>
        <p>Hi Dr. ${therapist.lastName},</p>
        <p>Congratulations! Your therapist profile has been approved and is now live on SAANS.</p>
        <p>You can now:</p>
        <ul>
          <li>Receive appointment requests</li>
          <li>Manage your schedule</li>
          <li>Conduct video sessions</li>
          <li>Track your earnings</li>
        </ul>
        <a href="${profileUrl}">View Your Profile</a>
        <p>Welcome aboard!</p>
      `;

      await this.send(therapist.email, subject, htmlContent);
      console.log(`✅ Approval email sent to ${therapist.email}`);
    } catch (error) {
      console.error('❌ Error sending approval email:', error);
    }
  }

  /**
   * Generic send email function
   */
  async send(to, subject, htmlContent) {
    try {
      // Use SendGrid if available
      if (process.env.SENDGRID_API_KEY) {
        const msg = {
          to,
          from: FROM_EMAIL,
          subject,
          html: htmlContent,
          trackingSettings: {
            clickTracking: { enabled: true },
            openTracking: { enabled: true }
          }
        };
        await sgMail.send(msg);
      } else {
        // Fallback to Nodemailer
        await transporter.sendMail({
          from: FROM_EMAIL,
          to,
          subject,
          html: htmlContent
        });
      }
      console.log(`📧 Email sent to ${to}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}

module.exports = new EmailService();
