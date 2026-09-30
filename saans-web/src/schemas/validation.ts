import { z } from 'zod';

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RegisterSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Profile Schemas
export const ProfileUpdateSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio too long').optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zipCode: z.string().optional().or(z.literal('')),
  emergencyContact: z.string().optional().or(z.literal('')),
  conditions: z.array(z.string()).optional(),
});

// Booking Schemas
export const BookingSchema = z.object({
  therapistId: z.string().uuid('Invalid therapist ID'),
  sessionType: z.enum(['video', 'phone']),
  scheduledAt: z.string().datetime('Invalid date/time'),
  duration: z.number().min(30).max(120),
  price: z.number().positive('Price must be positive'),
  notes: z.string().optional().or(z.literal('')),
});

// Mood Entry Schema
export const MoodEntrySchema = z.object({
  mood: z.number().min(1).max(5),
  energy: z.number().min(1).max(5),
  stress: z.number().min(1).max(5),
  anxiety: z.number().min(1).max(5),
  notes: z.string().optional().or(z.literal('')),
  date: z.string().optional(),
});

// Password Change Schema
export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'New passwords do not match',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type BookingInput = z.infer<typeof BookingSchema>;
export type MoodEntryInput = z.infer<typeof MoodEntrySchema>;
export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>;
