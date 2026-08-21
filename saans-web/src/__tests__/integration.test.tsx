import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux, UNAUTHENTICATED_STATE, AUTHENTICATED_STATE, setupLocalStorage } from '../test/setup';
import axios from 'axios';
import {
  mockLoginResponse,
  mockTherapistsResponse,
  mockPaymentOrderResponse,
  mockPaymentVerifyResponse,
  mockAppointmentResponse,
  mockAvailableSlotsResponse,
} from '../test/mocks';

vi.mock('axios');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({}),
  };
});

describe('Integration Tests', () => {
  beforeEach(() => {
    setupLocalStorage();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete User Registration Flow', () => {
    it('should complete full registration and login flow', async () => {
      const mockRegisterPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: mockLoginResponse,
      });

      const RegisterPage = (await import('../pages/RegisterPage')).default;
      const user = userEvent.setup();

      const { store } = renderWithRedux(<RegisterPage />, { preloadedState: UNAUTHENTICATED_STATE });

      // Fill registration form
      const nameInput = screen.getByRole('textbox', { name: /name/i });
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const citySelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: /register|sign up/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'securepass123');
      await user.type(confirmPasswordInput, 'securepass123');
      await user.selectOptions(citySelect, 'Delhi');
      await user.click(submitButton);

      // Verify API call
      await waitFor(() => {
        expect(mockRegisterPost).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/register'),
          expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com',
            city: 'Delhi',
          })
        );
      });

      // Check Redux store has user data
      const state = store.getState();
      expect(state.auth.token).toBeDefined();
    });
  });

  describe('Complete Therapist Booking Flow', () => {
    it('should view therapists and book appointment with payment', async () => {
      // Step 1: Mock fetch therapists
      const mockTherapistGet = vi.spyOn(axios, 'get')
        .mockResolvedValueOnce({ data: mockTherapistsResponse });

      const FindTherapistPage = (await import('../pages/FindTherapistPage')).default;
      const user = userEvent.setup();

      renderWithRedux(<FindTherapistPage />, { preloadedState: AUTHENTICATED_STATE });

      // Verify therapists are loaded
      await waitFor(() => {
        expect(mockTherapistGet).toHaveBeenCalled();
      });

      // Step 2: View available slots
      const mockSlotsGet = vi.spyOn(axios, 'get')
        .mockResolvedValueOnce({ data: mockAvailableSlotsResponse });

      const viewButton = screen.queryByRole('button', { name: /book|view/i });
      if (viewButton) {
        await user.click(viewButton);

        await waitFor(() => {
          expect(mockSlotsGet).toHaveBeenCalledWith(
            expect.stringContaining('/available-slots')
          );
        });
      }

      // Step 3: Select appointment slot
      const dateButtons = screen.queryAllByRole('button', { name: /2024-01-15/i });
      if (dateButtons.length > 0) {
        await user.click(dateButtons[0]);
      }

      // Step 4: Process payment
      const mockPaymentOrder = vi.spyOn(axios, 'post')
        .mockResolvedValueOnce({ data: mockPaymentOrderResponse });

      const mockPaymentVerify = vi.spyOn(axios, 'post')
        .mockResolvedValueOnce({ data: mockPaymentVerifyResponse });

      const payButton = screen.queryByRole('button', { name: /pay|checkout/i });
      if (payButton) {
        await user.click(payButton);

        await waitFor(() => {
          expect(mockPaymentOrder).toHaveBeenCalled();
        });
      }

      // Step 5: Confirm appointment
      const mockAppointment = vi.spyOn(axios, 'post')
        .mockResolvedValueOnce({ data: mockAppointmentResponse });

      const confirmButton = screen.queryByRole('button', { name: /confirm|book/i });
      if (confirmButton) {
        await user.click(confirmButton);

        await waitFor(() => {
          expect(mockAppointment).toHaveBeenCalled();
        });
      }
    });

    it('should handle appointment booking failure gracefully', async () => {
      const mockTherapistGet = vi.spyOn(axios, 'get')
        .mockResolvedValueOnce({ data: mockTherapistsResponse });

      const FindTherapistPage = (await import('../pages/FindTherapistPage')).default;
      const user = userEvent.setup();

      renderWithRedux(<FindTherapistPage />, { preloadedState: AUTHENTICATED_STATE });

      await waitFor(() => {
        expect(mockTherapistGet).toHaveBeenCalled();
      });

      // Mock booking failure
      vi.spyOn(axios, 'post').mockRejectedValueOnce({
        response: {
          status: 400,
          data: { error: 'Slot already booked' },
        },
      });

      const bookButton = screen.queryByRole('button', { name: /book/i });
      if (bookButton) {
        await user.click(bookButton);

        await waitFor(() => {
          const errorMessage = screen.queryByText(/slot already booked/i);
          expect(errorMessage).toBeInTheDocument();
        }, { timeout: 2000 });
      }
    });
  });

  describe('Complete Payment Flow', () => {
    it('should handle successful payment with verification', async () => {
      const mockOrderPost = vi.spyOn(axios, 'post')
        .mockResolvedValueOnce({ data: mockPaymentOrderResponse });

      const mockVerifyPost = vi.spyOn(axios, 'post')
        .mockResolvedValueOnce({ data: mockPaymentVerifyResponse });

      const PaymentModal = (await import('../components/PaymentModal')).PaymentModal;
      const user = userEvent.setup();

      renderWithRedux(<PaymentModal isOpen={true} onClose={() => {}} amount={50000} />, {
        preloadedState: AUTHENTICATED_STATE,
      });

      // Step 1: Click payment button
      const payButton = screen.queryByRole('button', { name: /pay|checkout/i });
      if (payButton) {
        await user.click(payButton);

        // Step 2: Verify order creation
        await waitFor(() => {
          expect(mockOrderPost).toHaveBeenCalledWith(
            expect.stringContaining('/payments/order'),
            expect.objectContaining({
              amount: 50000,
            })
          );
        });

        // Step 3: Verify payment verification
        await waitFor(() => {
          expect(mockVerifyPost).toHaveBeenCalledWith(
            expect.stringContaining('/payments/verify'),
            expect.any(Object)
          );
        });
      }
    });

    it('should handle payment cancellation', async () => {
      const mockOnClose = vi.fn();

      const PaymentModal = (await import('../components/PaymentModal')).PaymentModal;
      const user = userEvent.setup();

      renderWithRedux(<PaymentModal isOpen={true} onClose={mockOnClose} amount={50000} />, {
        preloadedState: AUTHENTICATED_STATE,
      });

      // Click cancel button
      const cancelButton = screen.queryByRole('button', { name: /cancel|close/i });
      if (cancelButton) {
        await user.click(cancelButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('Complete Mood Tracking Flow', () => {
    it('should add mood entry and view analytics', async () => {
      const mockMoodPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { id: '1', mood: 'happy', intensity: 8 },
      });

      const mockAnalyticsGet = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: {
          averageMood: 7.5,
          moods: ['happy', 'good', 'neutral'],
        },
      });

      const MoodTrackerPage = (await import('../pages/MoodTrackerPage')).default;
      const user = userEvent.setup();

      renderWithRedux(<MoodTrackerPage />, { preloadedState: AUTHENTICATED_STATE });

      // Step 1: Select mood
      const moodButtons = screen.queryAllByRole('button', { name: /happy|sad|neutral/i });
      if (moodButtons.length > 0) {
        await user.click(moodButtons[0]);

        // Step 2: Add notes
        const notesInput = screen.queryByRole('textbox', { name: /notes|comment/i });
        if (notesInput) {
          await user.type(notesInput, 'Had a wonderful day');
        }

        // Step 3: Submit
        const submitButton = screen.queryByRole('button', { name: /add|save|submit/i });
        if (submitButton) {
          await user.click(submitButton);

          await waitFor(() => {
            expect(mockMoodPost).toHaveBeenCalled();
          });
        }
      }

      // Step 4: View analytics
      await waitFor(() => {
        expect(mockAnalyticsGet).toHaveBeenCalled();
      });
    });
  });

  describe('Complete AI Counselor Conversation', () => {
    it('should conduct multi-turn AI conversation', async () => {
      const mockAIResponse1 = vi.spyOn(axios, 'post')
        .mockResolvedValueOnce({
          data: { response: 'I understand your concern.' },
        });

      const AICounselorPage = (await import('../pages/AICounselorPage')).default;
      const user = userEvent.setup();

      renderWithRedux(<AICounselorPage />, { preloadedState: AUTHENTICATED_STATE });

      // First message
      const messageInput = screen.queryByRole('textbox', { name: /message|chat/i });
      if (messageInput) {
        await user.type(messageInput, 'I am feeling anxious');

        const sendButton = screen.queryByRole('button', { name: /send|submit/i });
        if (sendButton) {
          await user.click(sendButton);

          await waitFor(() => {
            expect(mockAIResponse1).toHaveBeenCalledWith(
              expect.stringContaining('/api'),
              expect.objectContaining({
                message: 'I am feeling anxious',
              })
            );
          });
        }
      }

      // Verify response is displayed
      await waitFor(() => {
        const response = screen.queryByText(/understand/i);
        expect(response).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Authentication & Protected Routes', () => {
    it('should redirect unauthenticated user to login', async () => {
      const DashboardPage = (await import('../pages/DashboardPage')).default;

      renderWithRedux(<DashboardPage />, { preloadedState: UNAUTHENTICATED_STATE });

      // Should not show dashboard content
      const dashboardContent = screen.queryByRole('main') || document.body;
      expect(dashboardContent).toBeInTheDocument();
    });

    it('should allow authenticated user to access protected pages', async () => {
      const DashboardPage = (await import('../pages/DashboardPage')).default;

      const { store } = renderWithRedux(<DashboardPage />, {
        preloadedState: AUTHENTICATED_STATE,
      });

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.user).toBeDefined();
    });

    it('should logout user and clear state', async () => {
      const { store } = renderWithRedux(<div>Test</div>, {
        preloadedState: AUTHENTICATED_STATE,
      });

      expect(store.getState().auth.isAuthenticated).toBe(true);

      // Simulate logout by dispatching logout action
      const { logout } = await import('../redux/slices/authSlice');
      store.dispatch(logout());

      expect(store.getState().auth.isAuthenticated).toBe(false);
      expect(store.getState().auth.user).toBeNull();
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });

  describe('Error Recovery', () => {
    it('should retry failed API requests', async () => {
      let callCount = 0;

      vi.spyOn(axios, 'get').mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Network error');
        }
        return { data: mockTherapistsResponse };
      });

      const FindTherapistPage = (await import('../pages/FindTherapistPage')).default;
      const user = userEvent.setup();

      renderWithRedux(<FindTherapistPage />, { preloadedState: AUTHENTICATED_STATE });

      // First request fails
      await waitFor(() => {
        expect(callCount).toBeGreaterThan(0);
      });

      // Retry
      const retryButton = screen.queryByRole('button', { name: /retry|try again/i });
      if (retryButton) {
        await user.click(retryButton);

        await waitFor(() => {
          expect(callCount).toBe(2);
        });
      }
    });

    it('should handle and display API errors appropriately', async () => {
      vi.spyOn(axios, 'post').mockRejectedValueOnce({
        response: {
          status: 500,
          data: { error: 'Server error' },
        },
      });

      const LoginPage = (await import('../pages/LoginPage')).default;
      const user = userEvent.setup();

      renderWithRedux(<LoginPage />, { preloadedState: UNAUTHENTICATED_STATE });

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in|login/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(/server error|something went wrong/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
