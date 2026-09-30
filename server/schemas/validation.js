const { z } = require('zod');

// Auth Schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password too short'),
});

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

// Profile Schemas
const profileUpdateSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  emergencyContact: z.string().optional(),
  conditions: z.array(z.string()).optional(),
});

// Booking Schema
const bookingSchema = z.object({
  therapistId: z.string().uuid(),
  sessionType: z.enum(['video', 'phone']),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(30).max(120),
  price: z.number().positive(),
  notes: z.string().optional(),
});

// Mood Entry Schema
const moodEntrySchema = z.object({
  mood: z.number().min(1).max(5),
  energy: z.number().min(1).max(5),
  stress: z.number().min(1).max(5),
  anxiety: z.number().min(1).max(5),
  notes: z.string().optional(),
  date: z.string().datetime().optional(),
});

// Password Change Schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

// Validation middleware factory
const validate = (schema) => {
  return async (req, res, next) => {
    try {
      req.validated = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};

module.exports = {
  loginSchema,
  registerSchema,
  profileUpdateSchema,
  bookingSchema,
  moodEntrySchema,
  passwordChangeSchema,
  validate,
};
