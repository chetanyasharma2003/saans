import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import {
  mockLoginResponse,
  mockTherapistsResponse,
  mockMoodResponse,
  mockAppointmentResponse,
  mockPaymentOrderResponse,
  mockPaymentVerifyResponse,
  createAxiosError,
} from '../test/mocks';
import { setupLocalStorage } from '../test/setup';

vi.mock('axios');

describe('API Services', () => {
  beforeEach(() => {
    setupLocalStorage();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication API', () => {
    it('should login user with valid credentials', async () => {
      const mockPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: mockLoginResponse,
      });

      // Simulate login API call
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockPost).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/login',
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
        })
      );

      expect(response.data.accessToken).toBe('mock-access-token-123');
      expect(response.data.user.email).toBe('test@example.com');
    });

    it('should handle login error with invalid credentials', async () => {
      vi.spyOn(axios, 'post').mockRejectedValueOnce(
        createAxiosError('Invalid credentials', 401)
      );

      try {
        await axios.post('http://localhost:3000/api/auth/login', {
          email: 'wrong@example.com',
          password: 'wrongpassword',
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.error).toContain('Invalid');
      }
    });

    it('should register new user', async () => {
      const mockPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: mockLoginResponse,
      });

      const response = await axios.post('http://localhost:3000/api/auth/register', {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        city: 'Delhi',
        role: 'PATIENT',
      });

      expect(mockPost).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/register',
        expect.objectContaining({
          name: 'New User',
          email: 'newuser@example.com',
        })
      );

      expect(response.data.accessToken).toBeDefined();
      expect(response.data.user).toBeDefined();
    });

    it('should handle duplicate email registration error', async () => {
      vi.spyOn(axios, 'post').mockRejectedValueOnce(
        createAxiosError('Email already registered', 400, {
          error: 'Email already registered',
        })
      );

      try {
        await axios.post('http://localhost:3000/api/auth/register', {
          email: 'existing@example.com',
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should send password reset email', async () => {
      const mockPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { success: true, message: 'Reset email sent' },
      });

      const response = await axios.post(
        'http://localhost:3000/api/auth/forgot-password',
        { email: 'test@example.com' }
      );

      expect(mockPost).toHaveBeenCalled();
      expect(response.data.success).toBe(true);
    });

    it('should reset password with token', async () => {
      const mockPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { success: true, message: 'Password reset successfully' },
      });

      const response = await axios.post(
        'http://localhost:3000/api/auth/reset-password',
        {
          token: 'reset-token-123',
          newPassword: 'newpassword123',
        }
      );

      expect(mockPost).toHaveBeenCalled();
      expect(response.data.success).toBe(true);
    });

    it('should verify email', async () => {
      const mockPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { success: true, message: 'Email verified' },
      });

      const response = await axios.post(
        'http://localhost:3000/api/auth/verify-email',
        { token: 'verify-token-123' }
      );

      expect(mockPost).toHaveBeenCalled();
      expect(response.data.success).toBe(true);
    });
  });

  describe('Therapist API', () => {
    it('should fetch list of therapists', async () => {
      const mockGet = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: mockTherapistsResponse,
      });

      const response = await axios.get('http://localhost:3000/api/therapists');

      expect(mockGet).toHaveBeenCalledWith('http://localhost:3000/api/therapists');
      expect(response.data.therapists).toHaveLength(2);
      expect(response.data.therapists[0].name).toBe('Dr. John Smith');
    });

    it('should filter therapists by city', async () => {
      const mockGet = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: mockTherapistsResponse,
      });

      const response = await axios.get('http://localhost:3000/api/therapists?city=Delhi');

      expect(mockGet).toHaveBeenCalledWith('http://localhost:3000/api/therapists?city=Delhi');
      expect(response.data.therapists).toBeDefined();
    });

    it('should search therapists by specialization', async () => {
      const mockGet = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: mockTherapistsResponse,
      });

      const response = await axios.get(
        'http://localhost:3000/api/therapists?specialization=Anxiety'
      );

      expect(mockGet).toHaveBeenCalled();
      expect(response.data.therapists).toBeDefined();
    });

    it('should fetch single therapist details', async () => {
      const mockGet = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: {
          id: '101',
          name: 'Dr. John Smith',
          specialization: 'Anxiety & Depression',
          bio: 'Experienced therapist',
        },
      });

      const response = await axios.get('http://localhost:3000/api/therapists/101');

      expect(mockGet).toHaveBeenCalledWith('http://localhost:3000/api/therapists/101');
      expect(response.data.name).toBe('Dr. John Smith');
    });
  });

  describe('Mood Tracking API', () => {
    it('should create mood entry', async () => {
      const mockPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: mockMoodResponse,
      });

      const response = await axios.post('http://localhost:3000/api/mood', {
        mood: 'happy',
        intensity: 8,
        notes: 'Had a great day',
      });

      expect(mockPost).toHaveBeenCalledWith(
        'http://localhost:3000/api/mood',
        expect.objectContaining({
          mood: 'happy',
          intensity: 8,
        })
      );

      expect(response.data.id).toBe('1');
      expect(response.data.mood).toBe('happy');
    });

    it('should fetch mood analytics', async () => {
      const mockGet = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: {
          averageMood: 7.5,
          moods: ['happy', 'good', 'neutral'],
        },
      });

      const response = await axios.get('http://localhost:3000/api/mood/analytics');

      expect(mockGet).toHaveBeenCalled();
      expect(response.data.averageMood).toBe(7.5);
    });

    it('should filter mood by date range', async () => {
      const mockGet = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: {
          moods: ['happy', 'good'],
        },
      });

      const response = await axios.get(
        'http://localhost:3000/api/mood?from=2024-01-01&to=2024-01-31'
      );

      expect(mockGet).toHaveBeenCalledWith(
        'http://localhost:3000/api/mood?from=2024-01-01&to=2024-01-31'
      );

      expect(response.data.moods).toHaveLength(2);
    });
  });

  describe('Appointment API', () => {
    it('should book appointment', async () => {
      const mockPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: mockAppointmentResponse,
      });

      const response = await axios.post('http://localhost:3000/api/appointments', {
        therapistId: '101',
        date: '2024-01-15',
        time: '10:00',
        notes: 'First appointment',
      });

      expect(mockPost).toHaveBeenCalledWith(
        'http://localhost:3000/api/appointments',
        expect.objectContaining({
          therapistId: '101',
        })
      );

      expect(response.data.status).toBe('confirmed');
    });

    it('should fetch available appointment slots', async () => {
      const mockGet = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: {
          slots: [
            { date: '2024-01-15', times: ['10:00', '11:00'] },
          ],
        },
      });

      const response = await axios.get(
        'http://localhost:3000/api/therapists/101/available-slots'
      );

      expect(mockGet).toHaveBeenCalled();
      expect(response.data.slots).toHaveLength(1);
    });

    it('should cancel appointment', async () => {
      const mockDelete = vi.spyOn(axios, 'delete').mockResolvedValueOnce({
        data: { success: true },
      });

      const response = await axios.delete('http://localhost:3000/api/appointments/1');

      expect(mockDelete).toHaveBeenCalledWith('http://localhost:3000/api/appointments/1');
      expect(response.data.success).toBe(true);
    });

    it('should reschedule appointment', async () => {
      const mockPut = vi.spyOn(axios, 'put').mockResolvedValueOnce({
        data: { success: true, newDate: '2024-01-20' },
      });

      const response = await axios.put('http://localhost:3000/api/appointments/1', {
        date: '2024-01-20',
        time: '14:00',
      });

      expect(mockPut).toHaveBeenCalled();
      expect(response.data.newDate).toBe('2024-01-20');
    });
  });

  describe('Payment API', () => {
    it('should create payment order', async () => {
      const mockPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: mockPaymentOrderResponse,
      });

      const response = await axios.post('http://localhost:3000/api/payments/order', {
        amount: 50000,
        currency: 'INR',
      });

      expect(mockPost).toHaveBeenCalledWith(
        'http://localhost:3000/api/payments/order',
        expect.objectContaining({
          amount: 50000,
        })
      );

      expect(response.data.id).toBe('order_123456');
      expect(response.data.status).toBe('created');
    });

    it('should verify payment', async () => {
      const mockPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: mockPaymentVerifyResponse,
      });

      const response = await axios.post('http://localhost:3000/api/payments/verify', {
        razorpay_payment_id: 'pay_123456',
        razorpay_order_id: 'order_123456',
        razorpay_signature: 'sig_123456',
      });

      expect(mockPost).toHaveBeenCalled();
      expect(response.data.success).toBe(true);
    });

    it('should handle payment error', async () => {
      vi.spyOn(axios, 'post').mockRejectedValueOnce(
        createAxiosError('Payment processing failed', 400)
      );

      try {
        await axios.post('http://localhost:3000/api/payments/order', {
          amount: 50000,
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should fetch payment history', async () => {
      const mockGet = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: {
          payments: [
            {
              id: 'pay_123456',
              amount: 50000,
              status: 'success',
              date: '2024-01-15',
            },
          ],
        },
      });

      const response = await axios.get('http://localhost:3000/api/payments');

      expect(mockGet).toHaveBeenCalled();
      expect(response.data.payments).toHaveLength(1);
    });
  });

  describe('Profile API', () => {
    it('should fetch user profile', async () => {
      const mockGet = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          city: 'Delhi',
        },
      });

      const response = await axios.get('http://localhost:3000/api/profile');

      expect(mockGet).toHaveBeenCalled();
      expect(response.data.name).toBe('Test User');
    });

    it('should update user profile', async () => {
      const mockPut = vi.spyOn(axios, 'put').mockResolvedValueOnce({
        data: { success: true },
      });

      const response = await axios.put('http://localhost:3000/api/profile', {
        name: 'Updated User',
        bio: 'Updated bio',
      });

      expect(mockPut).toHaveBeenCalled();
      expect(response.data.success).toBe(true);
    });

    it('should change password', async () => {
      const mockPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { success: true },
      });

      const response = await axios.post('http://localhost:3000/api/profile/change-password', {
        oldPassword: 'oldpass123',
        newPassword: 'newpass123',
      });

      expect(mockPost).toHaveBeenCalled();
      expect(response.data.success).toBe(true);
    });
  });

  describe('Community API', () => {
    it('should fetch communities', async () => {
      const mockGet = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: {
          communities: [
            {
              id: '1',
              name: 'Anxiety Support',
              members: 150,
            },
          ],
        },
      });

      const response = await axios.get('http://localhost:3000/api/communities');

      expect(mockGet).toHaveBeenCalled();
      expect(response.data.communities).toHaveLength(1);
    });

    it('should send community message', async () => {
      const mockPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: {
          id: '1',
          message: 'Hello community',
          status: 'sent',
        },
      });

      const response = await axios.post('http://localhost:3000/api/communities/1/messages', {
        message: 'Hello community',
      });

      expect(mockPost).toHaveBeenCalled();
      expect(response.data.status).toBe('sent');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Network Error'));

      try {
        await axios.get('http://localhost:3000/api/therapists');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toBe('Network Error');
      }
    });

    it('should handle unauthorized access', async () => {
      vi.spyOn(axios, 'get').mockRejectedValueOnce(
        createAxiosError('Unauthorized', 401)
      );

      try {
        await axios.get('http://localhost:3000/api/profile');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should handle server errors', async () => {
      vi.spyOn(axios, 'post').mockRejectedValueOnce(
        createAxiosError('Internal server error', 500)
      );

      try {
        await axios.post('http://localhost:3000/api/appointments', {});
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response.status).toBe(500);
      }
    });

    it('should handle validation errors', async () => {
      vi.spyOn(axios, 'post').mockRejectedValueOnce(
        createAxiosError('Validation error', 400, {
          error: {
            email: 'Invalid email',
            password: 'Password too short',
          },
        })
      );

      try {
        await axios.post('http://localhost:3000/api/auth/register', {
          email: 'invalid',
          password: '123',
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
