import { logger } from '../utils/logger.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private fromEmail: string;
  private provider: 'sendgrid' | 'smtp' | 'log';

  constructor() {
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@saans.app';
    // Determine which provider to use
    if (process.env.SENDGRID_API_KEY) {
      this.provider = 'sendgrid';
    } else if (process.env.SMTP_HOST) {
      this.provider = 'smtp';
    } else {
      this.provider = 'log'; // Fallback to logging for development
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetLink: string): Promise<EmailResponse> {
    const subject = 'SAANS - Reset Your Password';
    const html = this.generatePasswordResetHTML(resetLink, email);

    return this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email: string, verificationLink: string): Promise<EmailResponse> {
    const subject = 'SAANS - Verify Your Email Address';
    const html = this.generateVerificationHTML(verificationLink, email);

    return this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send welcome email after registration
   */
  async sendWelcomeEmail(email: string, name: string): Promise<EmailResponse> {
    const subject = 'Welcome to SAANS - Your Mental Health Companion';
    const html = this.generateWelcomeHTML(name);

    return this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send password changed confirmation email
   */
  async sendPasswordChangedEmail(email: string): Promise<EmailResponse> {
    const subject = 'SAANS - Password Changed Successfully';
    const html = this.generatePasswordChangedHTML();

    return this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send appointment reminder email
   */
  async sendAppointmentReminderEmail(
    email: string,
    userName: string,
    therapistName: string,
    appointmentTime: Date,
  ): Promise<EmailResponse> {
    const subject = 'SAANS - Appointment Reminder';
    const html = this.generateAppointmentReminderHTML(userName, therapistName, appointmentTime);

    return this.sendEmail({ to: email, subject, html });
  }

  /**
   * Core email sending method
   */
  private async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      // Validate email
      if (!this.isValidEmail(options.to)) {
        throw new Error('Invalid email address');
      }

      let result: EmailResponse;

      switch (this.provider) {
        case 'sendgrid':
          result = await this.sendViaSendGrid(options);
          break;
        case 'smtp':
          result = await this.sendViaSMTP(options);
          break;
        case 'log':
          result = this.logEmail(options);
          break;
        default:
          throw new Error('No email provider configured');
      }

      logger.info(`Email sent via ${this.provider}`, { to: options.to, subject: options.subject });
      return result;
    } catch (error: any) {
      logger.error(`Email sending failed via ${this.provider}`, error, undefined, undefined);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send email via SendGrid API
   */
  private async sendViaSendGrid(options: EmailOptions): Promise<EmailResponse> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SendGrid API key not configured');
      }

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: options.to }],
            },
          ],
          from: { email: this.fromEmail },
          subject: options.subject,
          content: [
            {
              type: 'text/html',
              value: options.html,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json() as any;
        throw new Error(error.errors?.[0]?.message || 'SendGrid API error');
      }

      return {
        success: true,
        messageId: `sg_${Date.now()}`,
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * SMTP email sending (placeholder for future implementation with nodemailer)
   */
  private async sendViaSMTP(options: EmailOptions): Promise<EmailResponse> {
    // This would require nodemailer installation
    // For now, we log it as a fallback
    logger.warn('SMTP not fully implemented, falling back to logging', {
      to: options.to,
    });
    return this.logEmail(options);
  }

  /**
   * Log email to console (development fallback)
   */
  private logEmail(options: EmailOptions): EmailResponse {
    logger.info('Email (logged to console)', {
      to: options.to,
      subject: options.subject,
      preview: options.html.substring(0, 100),
    });
    return {
      success: true,
      messageId: `log_${Date.now()}`,
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate password reset email HTML
   */
  private generatePasswordResetHTML(resetLink: string, email: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-left: 4px solid #3498db; }
            .button { display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
            .warning { color: #e74c3c; font-weight: bold; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>SAANS - Password Reset Request</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password for your SAANS account associated with <strong>${email}</strong>.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetLink}" class="button">Reset Password</a>
              <p><strong>Or copy and paste this link in your browser:</strong></p>
              <p style="word-break: break-all; background-color: #fff; padding: 10px; border-radius: 3px; font-size: 12px;">${resetLink}</p>
              <div class="warning">
                ⚠️ This link will expire in 24 hours.
              </div>
              <p><strong>Didn't request a password reset?</strong></p>
              <p>If you didn't request this reset, please ignore this email. Your password will remain unchanged. If you believe this is suspicious, please contact our support team immediately.</p>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                For security reasons, never share this link with anyone else.
              </p>
            </div>
            <div class="footer">
              <p>SAANS Mental Health Platform | This is an automated email, please do not reply.</p>
              <p>&copy; 2026 SAANS. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate email verification HTML
   */
  private generateVerificationHTML(verificationLink: string, email: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-left: 4px solid #27ae60; }
            .button { display: inline-block; background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
            .code { background-color: #fff; padding: 10px; border-radius: 3px; font-family: monospace; font-size: 12px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Welcome to SAANS!</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up for SAANS! We're excited to have you join our mental health community.</p>
              <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
              <a href="${verificationLink}" class="button">Verify Email</a>
              <p><strong>Or copy and paste this link in your browser:</strong></p>
              <p style="word-break: break-all; background-color: #fff; padding: 10px; border-radius: 3px; font-size: 12px;">${verificationLink}</p>
              <p style="margin-top: 20px; color: #666; font-size: 14px;">
                This verification link will expire in 24 hours. If the link expires, you can request a new one from your account settings.
              </p>
              <p><strong>What's next?</strong></p>
              <ul>
                <li>Complete your profile to get personalized recommendations</li>
                <li>Connect with licensed therapists</li>
                <li>Access mental health resources and support groups</li>
                <li>Track your mood and wellness journey</li>
              </ul>
            </div>
            <div class="footer">
              <p>SAANS Mental Health Platform | This is an automated email, please do not reply.</p>
              <p>&copy; 2026 SAANS. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate welcome email HTML
   */
  private generateWelcomeHTML(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #9b59b6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-left: 4px solid #9b59b6; }
            .feature { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 3px solid #9b59b6; }
            .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Welcome to SAANS, ${name}!</h2>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Your account has been verified and you're all set to start your mental health journey with SAANS!</p>

              <h3>Getting Started:</h3>
              <div class="feature">
                <strong>📋 Complete Your Profile</strong>
                <p>Add a profile photo and tell us about your mental health goals to get personalized support.</p>
              </div>

              <div class="feature">
                <strong>👥 Connect with Therapists</strong>
                <p>Browse our network of licensed therapists and book your first session.</p>
              </div>

              <div class="feature">
                <strong>🤖 AI Chat Support</strong>
                <p>Get instant support from our AI companion anytime you need someone to talk to.</p>
              </div>

              <div class="feature">
                <strong>📊 Track Your Mood</strong>
                <p>Log your daily mood and gain insights about your emotional patterns.</p>
              </div>

              <div class="feature">
                <strong>👥 Join Our Community</strong>
                <p>Connect with others, share experiences, and find support in our community groups.</p>
              </div>

              <p style="margin-top: 20px;">If you have any questions or need assistance, our support team is here to help!</p>
            </div>
            <div class="footer">
              <p>SAANS Mental Health Platform | Your mental health matters</p>
              <p>&copy; 2026 SAANS. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate password changed email HTML
   */
  private generatePasswordChangedHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-left: 4px solid #27ae60; }
            .success { color: #27ae60; font-weight: bold; font-size: 18px; }
            .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Password Changed Successfully</h2>
            </div>
            <div class="content">
              <p class="success">✓ Your password has been changed successfully!</p>
              <p>If you did not make this change, please contact our support team immediately at support@saans.app</p>
              <p>For your security, we recommend:</p>
              <ul>
                <li>Using a unique, strong password</li>
                <li>Not sharing your password with anyone</li>
                <li>Logging out from other devices if suspicious activity is detected</li>
              </ul>
            </div>
            <div class="footer">
              <p>SAANS Mental Health Platform | This is an automated email, please do not reply.</p>
              <p>&copy; 2026 SAANS. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate appointment reminder email HTML
   */
  private generateAppointmentReminderHTML(
    userName: string,
    therapistName: string,
    appointmentTime: Date,
  ): string {
    const formattedTime = new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(appointmentTime);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #e67e22; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-left: 4px solid #e67e22; }
            .appointment-box { background-color: white; padding: 20px; border-radius: 5px; border: 2px solid #e67e22; margin: 20px 0; }
            .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Appointment Reminder</h2>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>This is a reminder about your upcoming therapy session!</p>

              <div class="appointment-box">
                <p><strong>Therapist:</strong> ${therapistName}</p>
                <p><strong>Date & Time:</strong> ${formattedTime}</p>
                <p><strong>Duration:</strong> 60 minutes</p>
              </div>

              <p><strong>Please remember to:</strong></p>
              <ul>
                <li>Join 5 minutes early</li>
                <li>Find a quiet, private space</li>
                <li>Have tissues and water nearby</li>
                <li>Turn off notifications to avoid distractions</li>
              </ul>

              <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
            </div>
            <div class="footer">
              <p>SAANS Mental Health Platform | Your well-being is our priority</p>
              <p>&copy; 2026 SAANS. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export default new EmailService();
