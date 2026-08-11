import { PrismaClient, BookingStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Appointment Reminder Job
 * Checks for appointments scheduled in the next 24-25 hours and sends reminders
 * This should be run periodically (e.g., every 30 minutes) via a cron job or scheduler
 */
export class AppointmentReminderJob {
  /**
   * Process appointment reminders
   * Sends notifications to both patient and therapist 24 hours before appointment
   */
  static async processReminders() {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      // Find appointments scheduled between 24 and 25 hours from now
      const appointmentsToRemind = await prisma.therapyBooking.findMany({
        where: {
          status: BookingStatus.SCHEDULED,
          scheduledAt: {
            gte: in24Hours,
            lte: in25Hours,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          therapist: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      console.log(`[Reminder Job] Found ${appointmentsToRemind.length} appointments to remind`);

      for (const appointment of appointmentsToRemind) {
        await this.sendReminders(appointment);
      }

      return {
        success: true,
        processed: appointmentsToRemind.length,
      };
    } catch (error: any) {
      console.error('[Reminder Job] Error processing reminders:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send reminder notifications to patient and therapist
   */
  private static async sendReminders(appointment: any) {
    try {
      const appointmentDate = new Date(appointment.scheduledAt);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // Create notification for patient
      await prisma.notification.create({
        data: {
          userId: appointment.userId,
          type: 'APPOINTMENT_REMINDER',
          title: 'Appointment Reminder',
          message: `You have an appointment with ${appointment.therapist.user.name} on ${formattedDate} at ${formattedTime}. Please ensure you're available 5 minutes before the scheduled time.`,
          data: {
            appointmentId: appointment.id,
            therapistName: appointment.therapist.user.name,
            dateTime: appointment.scheduledAt.toISOString(),
          },
        },
      });

      // Create notification for therapist
      await prisma.notification.create({
        data: {
          userId: appointment.therapist.userId,
          type: 'APPOINTMENT_REMINDER',
          title: 'Upcoming Appointment',
          message: `You have an appointment with ${appointment.user.name} on ${formattedDate} at ${formattedTime}. Duration: ${appointment.duration} minutes.`,
          data: {
            appointmentId: appointment.id,
            patientName: appointment.user.name,
            patientId: appointment.userId,
            dateTime: appointment.scheduledAt.toISOString(),
          },
        },
      });

      // TODO: Send email reminders (requires email service setup)
      // await this.sendEmailReminders(appointment, formattedDate, formattedTime);

      console.log(
        `[Reminder] Sent notifications for appointment ${appointment.id} to patient and therapist`,
      );
    } catch (error: any) {
      console.error(
        `[Reminder] Failed to send reminders for appointment ${appointment.id}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Send email reminders (to be implemented with email service)
   */
  private static async _sendEmailReminders(_appointment: any, _formattedDate: string, _formattedTime: string) {
    try {
      // TODO: Implement email sending using nodemailer or similar service
      /*
      const patientEmailContent = {
        to: appointment.user.email,
        subject: `Reminder: Your therapy appointment on ${formattedDate}`,
        template: 'appointment-reminder',
        data: {
          patientName: appointment.user.name,
          therapistName: appointment.therapist.user.name,
          date: formattedDate,
          time: formattedTime,
          duration: appointment.duration,
        },
      };

      const therapistEmailContent = {
        to: appointment.therapist.user.email,
        subject: `Reminder: Appointment with ${appointment.user.name} on ${formattedDate}`,
        template: 'therapist-appointment-reminder',
        data: {
          therapistName: appointment.therapist.user.name,
          patientName: appointment.user.name,
          date: formattedDate,
          time: formattedTime,
          duration: appointment.duration,
        },
      };

      await emailService.send(patientEmailContent);
      await emailService.send(therapistEmailContent);
      */
      console.log(
        '[Email Reminder] Email service not yet implemented - skipping email reminders',
      );
    } catch (error: any) {
      console.error(`[Email Reminder] Failed to send email reminders: ${error.message}`);
    }
  }

  /**
   * Start periodic reminder job with given interval
   * @param intervalMs - Interval in milliseconds (default: 30 minutes)
   * @returns function to stop the job
   */
  static startPeriodicJob(intervalMs: number = 30 * 60 * 1000) {
    console.log(
      `[Reminder Job] Starting periodic reminder job every ${intervalMs / 60000} minutes`,
    );

    const intervalId = setInterval(async () => {
      const result = await this.processReminders();
      if (!result.success) {
        console.error('[Reminder Job] Error in periodic job:', result.error);
      }
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
      console.log('[Reminder Job] Stopped periodic reminder job');
    };
  }

  /**
   * Check no-show appointments (30 minutes after scheduled time)
   * Mark appointments as NO_SHOW if not started
   */
  static async markNoShowAppointments() {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      const noShowAppointments = await prisma.therapyBooking.updateMany({
        where: {
          status: BookingStatus.SCHEDULED,
          scheduledAt: {
            lt: thirtyMinutesAgo,
          },
        },
        data: {
          status: BookingStatus.NO_SHOW,
        },
      });

      if (noShowAppointments.count > 0) {
        console.log(`[No-Show Job] Marked ${noShowAppointments.count} appointments as NO_SHOW`);
      }

      return {
        success: true,
        marked: noShowAppointments.count,
      };
    } catch (error: any) {
      console.error('[No-Show Job] Error marking no-show appointments:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Start periodic no-show detection job
   */
  static startNoShowDetection(intervalMs: number = 60 * 60 * 1000) {
    console.log(
      `[No-Show Job] Starting no-show detection job every ${intervalMs / 60000} minutes`,
    );

    const intervalId = setInterval(async () => {
      const result = await this.markNoShowAppointments();
      if (!result.success) {
        console.error('[No-Show Job] Error in periodic job:', result.error);
      }
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
      console.log('[No-Show Job] Stopped no-show detection job');
    };
  }
}

export default AppointmentReminderJob;
