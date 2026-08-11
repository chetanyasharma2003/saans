import { PrismaClient, BookingStatus } from '@prisma/client';
import { redisClient } from '../utils/redis.js';

const prisma = new PrismaClient();

interface BookAppointmentInput {
  userId: string;
  therapistId: string;
  scheduledAt: Date;
  duration: number;
  reason?: string;
  notes?: string;
}

interface UpdateStatusInput {
  appointmentId: string;
  status: BookingStatus;
  cancelReason?: string;
}

interface RescheduleInput {
  appointmentId: string;
  newDateTime: Date;
}

export class AppointmentService {
  /**
   * Book a new appointment
   * Validates user subscription, therapist availability, and conflict checking
   */
  async bookAppointment(input: BookAppointmentInput) {
    try {
      // Validate user exists
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        include: { subscription: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check user subscription status
      if (user.subscription) {
        if (new Date() > user.subscription.endDate) {
          throw new Error('Subscription expired. Please renew to book appointments');
        }

        if (
          user.subscription.therapySessionLimit > 0 &&
          user.subscription.therapySessionsUsed >= user.subscription.therapySessionLimit
        ) {
          throw new Error(
            `Session limit reached. You have ${user.subscription.therapySessionLimit} sessions in your subscription`,
          );
        }
      }

      // Validate therapist exists and is available
      const therapist = await prisma.therapist.findUnique({
        where: { id: input.therapistId },
        include: { user: true },
      });

      if (!therapist) {
        throw new Error('Therapist not found');
      }

      if (!therapist.isAvailable) {
        throw new Error('Therapist is not currently available');
      }

      // Check for conflicting appointments (prevent double booking)
      const conflictingBooking = await prisma.therapyBooking.findFirst({
        where: {
          therapistId: input.therapistId,
          scheduledAt: {
            gte: new Date(input.scheduledAt.getTime() - input.duration * 60000),
            lt: new Date(input.scheduledAt.getTime() + input.duration * 60000),
          },
          status: { not: BookingStatus.CANCELLED },
        },
      });

      if (conflictingBooking) {
        throw new Error('Therapist has a conflicting appointment at this time');
      }

      // Validate appointment is in future
      if (new Date(input.scheduledAt) <= new Date()) {
        throw new Error('Appointment must be scheduled for a future date');
      }

      // Validate minimum advance booking (at least 24 hours)
      const minimumBookingTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (new Date(input.scheduledAt) < minimumBookingTime) {
        throw new Error('Appointments must be scheduled at least 24 hours in advance');
      }

      // Create appointment
      const appointment = await prisma.therapyBooking.create({
        data: {
          userId: input.userId,
          therapistId: input.therapistId,
          scheduledAt: new Date(input.scheduledAt),
          duration: input.duration,
          price: therapist.hourlyRate * (input.duration / 60),
          notes: input.notes,
          status: BookingStatus.SCHEDULED,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phoneNumber: true,
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

      // Queue reminder job (24 hours before appointment)
      await this.scheduleReminder(appointment.id, new Date(input.scheduledAt));

      // Update subscription session count
      if (user.subscription) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: { therapySessionsUsed: user.subscription.therapySessionsUsed + 1 },
        });
      }

      // Create notification for therapist
      await prisma.notification.create({
        data: {
          userId: therapist.userId,
          type: 'APPOINTMENT_BOOKED',
          title: 'New Appointment Booked',
          message: `${user.name} has booked an appointment with you on ${new Date(input.scheduledAt).toLocaleDateString()}`,
          data: {
            appointmentId: appointment.id,
            patientName: user.name,
            patientId: user.id,
          },
        },
      });

      return {
        success: true,
        appointment: {
          id: appointment.id,
          scheduledAt: appointment.scheduledAt,
          duration: appointment.duration,
          price: appointment.price,
          status: appointment.status,
          therapist: {
            id: therapist.id,
            name: therapist.user.name,
            email: therapist.user.email,
          },
          createdAt: appointment.createdAt,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to book appointment: ${error.message}`);
    }
  }

  /**
   * Get all appointments for a user (patient)
   */
  async getAppointmentsByUser(userId: string, status?: BookingStatus) {
    try {
      const appointments = await prisma.therapyBooking.findMany({
        where: {
          userId,
          ...(status && { status }),
        },
        include: {
          therapist: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
          sessionRecord: {
            select: {
              id: true,
              status: true,
              therapistNotes: true,
              createdAt: true,
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
      });

      return {
        success: true,
        count: appointments.length,
        appointments: appointments.map((apt) => ({
          id: apt.id,
          scheduledAt: apt.scheduledAt,
          duration: apt.duration,
          status: apt.status,
          price: apt.price,
          therapist: {
            id: apt.therapist.id,
            name: apt.therapist.user.name,
            email: apt.therapist.user.email,
            profileImage: apt.therapist.user.profileImage,
            specialization: apt.therapist.specialization,
            averageRating: apt.therapist.averageRating,
          },
          sessionRecord: apt.sessionRecord,
          notes: apt.notes,
          createdAt: apt.createdAt,
        })),
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }
  }

  /**
   * Get all appointments for a therapist
   */
  async getAppointmentsByTherapist(therapistId: string, status?: BookingStatus) {
    try {
      const appointments = await prisma.therapyBooking.findMany({
        where: {
          therapistId,
          ...(status && { status }),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              profileImage: true,
              phoneNumber: true,
            },
          },
          sessionRecord: {
            select: {
              id: true,
              status: true,
              topics: true,
              therapistNotes: true,
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
      });

      return {
        success: true,
        count: appointments.length,
        appointments: appointments.map((apt) => ({
          id: apt.id,
          scheduledAt: apt.scheduledAt,
          duration: apt.duration,
          status: apt.status,
          patient: {
            id: apt.user.id,
            name: apt.user.name,
            email: apt.user.email,
            profileImage: apt.user.profileImage,
            phoneNumber: apt.user.phoneNumber,
          },
          sessionRecord: apt.sessionRecord,
          notes: apt.notes,
          createdAt: apt.createdAt,
        })),
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }
  }

  /**
   * Get single appointment details
   */
  async getAppointmentDetails(appointmentId: string) {
    try {
      const appointment = await prisma.therapyBooking.findUnique({
        where: { id: appointmentId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phoneNumber: true,
              profileImage: true,
            },
          },
          therapist: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
          sessionRecord: true,
        },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      return {
        success: true,
        appointment: {
          id: appointment.id,
          scheduledAt: appointment.scheduledAt,
          duration: appointment.duration,
          status: appointment.status,
          price: appointment.price,
          meetingUrl: appointment.meetingUrl,
          notes: appointment.notes,
          patient: {
            id: appointment.user.id,
            name: appointment.user.name,
            email: appointment.user.email,
            phoneNumber: appointment.user.phoneNumber,
            profileImage: appointment.user.profileImage,
          },
          therapist: {
            id: appointment.therapist.id,
            name: appointment.therapist.user.name,
            email: appointment.therapist.user.email,
            profileImage: appointment.therapist.user.profileImage,
          },
          sessionRecord: appointment.sessionRecord,
          createdAt: appointment.createdAt,
          cancelledAt: appointment.cancelledAt,
          cancelReason: appointment.cancelReason,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch appointment: ${error.message}`);
    }
  }

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(input: UpdateStatusInput) {
    try {
      const appointment = await prisma.therapyBooking.findUnique({
        where: { id: input.appointmentId },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
          therapist: {
            include: {
              user: {
                select: { id: true, email: true, name: true },
              },
            },
          },
        },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Validate status transition
      const validTransitions: Record<BookingStatus, BookingStatus[]> = {
        [BookingStatus.SCHEDULED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
        [BookingStatus.COMPLETED]: [],
        [BookingStatus.CANCELLED]: [],
        [BookingStatus.NO_SHOW]: [],
      };

      if (!validTransitions[appointment.status].includes(input.status)) {
        throw new Error(`Cannot transition from ${appointment.status} to ${input.status}`);
      }

      // Update appointment
      const updated = await prisma.therapyBooking.update({
        where: { id: input.appointmentId },
        data: {
          status: input.status,
          ...(input.status === BookingStatus.CANCELLED && {
            cancelledAt: new Date(),
            cancelReason: input.cancelReason || 'Cancelled',
          }),
        },
        include: {
          user: true,
          therapist: { include: { user: true } },
        },
      });

      // Create notifications
      if (input.status === BookingStatus.CANCELLED) {
        await prisma.notification.create({
          data: {
            userId: appointment.user.id,
            type: 'APPOINTMENT_CANCELLED',
            title: 'Appointment Cancelled',
            message: `Your appointment with ${appointment.therapist.user.name} on ${new Date(appointment.scheduledAt).toLocaleDateString()} has been cancelled`,
            data: { appointmentId: appointment.id },
          },
        });
      } else if (input.status === BookingStatus.COMPLETED) {
        await prisma.notification.create({
          data: {
            userId: appointment.user.id,
            type: 'APPOINTMENT_COMPLETED',
            title: 'Appointment Completed',
            message: 'Please leave a review for your therapist',
            data: { appointmentId: appointment.id, therapistId: appointment.therapistId },
          },
        });
      }

      return {
        success: true,
        message: `Appointment status updated to ${input.status}`,
        appointment: {
          id: updated.id,
          status: updated.status,
          scheduledAt: updated.scheduledAt,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to update appointment status: ${error.message}`);
    }
  }

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(input: RescheduleInput) {
    try {
      const appointment = await prisma.therapyBooking.findUnique({
        where: { id: input.appointmentId },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.status === BookingStatus.COMPLETED || appointment.status === BookingStatus.CANCELLED) {
        throw new Error(`Cannot reschedule a ${appointment.status.toLowerCase()} appointment`);
      }

      // Validate new time is in future
      if (new Date(input.newDateTime) <= new Date()) {
        throw new Error('New appointment time must be in the future');
      }

      // Validate minimum advance booking
      const minimumBookingTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (new Date(input.newDateTime) < minimumBookingTime) {
        throw new Error('Appointments must be rescheduled at least 24 hours in advance');
      }

      // Check for conflicts
      const conflictingBooking = await prisma.therapyBooking.findFirst({
        where: {
          therapistId: appointment.therapistId,
          id: { not: input.appointmentId },
          scheduledAt: {
            gte: new Date(input.newDateTime.getTime() - appointment.duration * 60000),
            lt: new Date(input.newDateTime.getTime() + appointment.duration * 60000),
          },
          status: { not: BookingStatus.CANCELLED },
        },
      });

      if (conflictingBooking) {
        throw new Error('Therapist has a conflicting appointment at this new time');
      }

      // Update appointment
      const updated = await prisma.therapyBooking.update({
        where: { id: input.appointmentId },
        data: { scheduledAt: new Date(input.newDateTime) },
        include: {
          user: { select: { id: true, name: true, email: true } },
          therapist: { include: { user: { select: { id: true, name: true, email: true } } } },
        },
      });

      // Reschedule reminder
      await this.scheduleReminder(appointment.id, new Date(input.newDateTime));

      // Create notification
      await prisma.notification.create({
        data: {
          userId: appointment.userId,
          type: 'APPOINTMENT_RESCHEDULED',
          title: 'Appointment Rescheduled',
          message: `Your appointment has been rescheduled to ${new Date(input.newDateTime).toLocaleDateString()}`,
          data: { appointmentId: appointment.id },
        },
      });

      return {
        success: true,
        message: 'Appointment rescheduled successfully',
        appointment: {
          id: updated.id,
          scheduledAt: updated.scheduledAt,
          therapistName: updated.therapist.user.name,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to reschedule appointment: ${error.message}`);
    }
  }

  /**
   * Schedule appointment reminder in Redis queue
   * Reminders are sent 24 hours before appointment
   */
  private async scheduleReminder(appointmentId: string, scheduledAt: Date) {
    try {
      if (!redisClient) {
        console.warn('Redis not available, reminder scheduling skipped');
        return;
      }

      const reminderTime = new Date(scheduledAt.getTime() - 24 * 60 * 60 * 1000);
      const now = new Date();

      if (reminderTime > now) {
        const delayMs = reminderTime.getTime() - now.getTime();

        // Store reminder in Redis
        if (redisClient) {
          await redisClient.setEx(
            `appointment:reminder:${appointmentId}`,
            Math.ceil(delayMs / 1000),
            JSON.stringify({
              appointmentId,
              scheduledAt: scheduledAt.toISOString(),
              createdAt: new Date().toISOString(),
            }),
          );

          console.log(`[Reminder] Scheduled for appointment ${appointmentId} at ${reminderTime}`);
        }
      }
    } catch (error: any) {
      console.error(`Failed to schedule reminder: ${error.message}`);
      // Don't throw - reminders are not critical to booking success
    }
  }

  /**
   * Cancel appointment with reason
   */
  async cancelAppointment(appointmentId: string, cancelReason: string) {
    return this.updateAppointmentStatus({
      appointmentId,
      status: BookingStatus.CANCELLED,
      cancelReason,
    });
  }

  /**
   * Check appointment availability for a therapist
   */
  async checkTherapistAvailability(therapistId: string, dateTime: Date, duration: number) {
    try {
      const conflict = await prisma.therapyBooking.findFirst({
        where: {
          therapistId,
          scheduledAt: {
            gte: new Date(dateTime.getTime() - duration * 60000),
            lt: new Date(dateTime.getTime() + duration * 60000),
          },
          status: { not: BookingStatus.CANCELLED },
        },
      });

      return {
        available: !conflict,
        conflict: conflict ? conflict.id : null,
      };
    } catch (error: any) {
      throw new Error(`Failed to check availability: ${error.message}`);
    }
  }

  /**
   * Get available time slots for a therapist on a specific date
   * Returns hourly slots based on therapist's availability and existing bookings
   */
  async getAvailableSlots(therapistId: string, date: Date, duration: number = 60) {
    try {
      // Validate therapist exists and is available
      const therapist = await prisma.therapist.findUnique({
        where: { id: therapistId },
        include: { availableSlots: true },
      });

      if (!therapist) {
        throw new Error('Therapist not found');
      }

      if (!therapist.isAvailable) {
        throw new Error('Therapist is not currently available');
      }

      // Get the day of week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = date.getDay();

      // Get therapist's availability for this day
      const dayAvailability = therapist.availableSlots.filter(
        (slot) => slot.dayOfWeek === dayOfWeek
      );

      if (dayAvailability.length === 0) {
        return {
          success: true,
          therapistId,
          date: date.toISOString().split('T')[0],
          availableSlots: [],
        };
      }

      // Generate time slots based on availability
      const availableSlots: Array<{
        startTime: string;
        endTime: string;
        available: boolean;
      }> = [];

      // For each availability slot, generate hourly appointments
      for (const slot of dayAvailability) {
        const [startHour, startMin] = slot.startTime.split(':').map(Number);
        const [endHour, endMin] = slot.endTime.split(':').map(Number);

        const startDate = new Date(date);
        startDate.setHours(startHour, startMin, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(endHour, endMin, 0, 0);

        // Generate hourly slots
        let currentSlot = new Date(startDate);
        while (currentSlot.getTime() + duration * 60000 <= endDate.getTime()) {
          const slotEnd = new Date(currentSlot.getTime() + duration * 60000);

          // Check if slot is in the future
          if (currentSlot > new Date()) {
            // Check for conflicts
            const conflict = await prisma.therapyBooking.findFirst({
              where: {
                therapistId,
                scheduledAt: {
                  gte: new Date(currentSlot.getTime() - 5 * 60000), // 5 min buffer
                  lt: new Date(slotEnd.getTime() + 5 * 60000),
                },
                status: { not: BookingStatus.CANCELLED },
              },
            });

            const hours = String(currentSlot.getHours()).padStart(2, '0');
            const mins = String(currentSlot.getMinutes()).padStart(2, '0');
            const endHours = String(slotEnd.getHours()).padStart(2, '0');
            const endMins = String(slotEnd.getMinutes()).padStart(2, '0');

            availableSlots.push({
              startTime: `${hours}:${mins}`,
              endTime: `${endHours}:${endMins}`,
              available: !conflict,
            });
          }

          currentSlot = new Date(currentSlot.getTime() + 60 * 60000); // Move to next hour
        }
      }

      return {
        success: true,
        therapistId,
        date: date.toISOString().split('T')[0],
        duration,
        availableSlots: availableSlots.filter((slot) => slot.available),
        totalSlots: availableSlots.length,
      };
    } catch (error: any) {
      throw new Error(`Failed to get available slots: ${error.message}`);
    }
  }
}

export default new AppointmentService();
