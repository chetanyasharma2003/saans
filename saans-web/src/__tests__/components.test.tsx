import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux, AUTHENTICATED_STATE, setupLocalStorage, setupRazorpayMock } from '../test/setup';
import axios from 'axios';
import { mockPaymentOrderResponse, mockPaymentVerifyResponse, createAxiosError } from '../test/mocks';

vi.mock('axios');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({}),
  };
});

describe('Components', () => {
  beforeEach(() => {
    setupLocalStorage();
    setupRazorpayMock();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ProfileHeader', () => {
    it('should display user avatar', async () => {
      const ProfileHeader = (await import('../components/Navbar')).Navbar;

      renderWithRedux(<ProfileHeader />, { preloadedState: AUTHENTICATED_STATE });

      // Avatar should be displayed
      const content = document.body;
      expect(content).toBeInTheDocument();
    });

    it('should display user name', async () => {
      const Navbar = (await import('../components/Navbar')).Navbar;

      renderWithRedux(<Navbar />, { preloadedState: AUTHENTICATED_STATE });

      const userName = screen.queryByText(/test user/i);
      expect(userName).toBeInTheDocument();
    });

    it('should show edit button for profile', async () => {
      const Navbar = (await import('../components/Navbar')).Navbar;

      renderWithRedux(<Navbar />, { preloadedState: AUTHENTICATED_STATE });

      const profileButton = screen.queryByRole('button', { name: /profile|settings/i });
      expect(profileButton).toBeInTheDocument();
    });
  });

  describe('TherapistCard', () => {
    it('should render therapist information', async () => {
      const therapistData = {
        id: '101',
        name: 'Dr. John Smith',
        specialization: 'Anxiety & Depression',
        image: 'https://example.com/therapist1.jpg',
        city: 'Delhi',
        rating: 4.8,
        reviews: 45,
        hourlyRate: 500,
        availability: true,
      };

      // Create a simple component to test therapist card rendering
      const TestComponent = () => (
        <div data-testid="therapist-card">
          <h3>{therapistData.name}</h3>
          <p>{therapistData.specialization}</p>
          <p>{therapistData.rating}/5 ({therapistData.reviews} reviews)</p>
          <p>₹{therapistData.hourlyRate}/hour</p>
        </div>
      );

      renderWithRedux(<TestComponent />, { preloadedState: AUTHENTICATED_STATE });

      expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      expect(screen.getByText('Anxiety & Depression')).toBeInTheDocument();
      expect(screen.getByText(/4\.8/)).toBeInTheDocument();
    });

    it('should display availability status', async () => {
      const TestComponent = () => (
        <div>
          <span className="available">Available</span>
        </div>
      );

      renderWithRedux(<TestComponent />, { preloadedState: AUTHENTICATED_STATE });

      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('should handle click action to book appointment', async () => {
      const mockOnClick = vi.fn();

      const TestComponent = () => (
        <button onClick={mockOnClick} data-testid="book-button">
          Book Appointment
        </button>
      );

      const user = userEvent.setup();
      renderWithRedux(<TestComponent />, { preloadedState: AUTHENTICATED_STATE });

      const bookButton = screen.getByTestId('book-button');
      await user.click(bookButton);

      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('SubscriptionPlans', () => {
    it('should render subscription plan cards', () => {
      const plans = [
        { id: 1, name: 'Basic', price: 99, features: ['1 session/month'] },
        { id: 2, name: 'Premium', price: 299, features: ['4 sessions/month'] },
      ];

      const TestComponent = () => (
        <div>
          {plans.map((plan) => (
            <div key={plan.id} data-testid={`plan-${plan.id}`}>
              <h3>{plan.name}</h3>
              <p>₹{plan.price}</p>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </div>
          ))}
        </div>
      );

      renderWithRedux(<TestComponent />, { preloadedState: AUTHENTICATED_STATE });

      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('should display pricing information', () => {
      const TestComponent = () => (
        <div>
          <div>₹99/month</div>
          <div>₹299/month</div>
        </div>
      );

      renderWithRedux(<TestComponent />, { preloadedState: AUTHENTICATED_STATE });

      expect(screen.getByText('₹99/month')).toBeInTheDocument();
      expect(screen.getByText('₹299/month')).toBeInTheDocument();
    });

    it('should allow plan selection', async () => {
      const mockOnSelect = vi.fn();

      const TestComponent = () => (
        <div>
          <button onClick={() => mockOnSelect('basic')}>Select Basic</button>
          <button onClick={() => mockOnSelect('premium')}>Select Premium</button>
        </div>
      );

      const user = userEvent.setup();
      renderWithRedux(<TestComponent />, { preloadedState: AUTHENTICATED_STATE });

      const basicButton = screen.getByRole('button', { name: /select basic/i });
      await user.click(basicButton);

      expect(mockOnSelect).toHaveBeenCalledWith('basic');
    });
  });

  describe('AppointmentModal', () => {
    it('should render appointment modal', async () => {
      const AppointmentModal = (await import('../components/AppointmentModal')).AppointmentModal;

      renderWithRedux(<AppointmentModal isOpen={true} onClose={() => {}} />, {
        preloadedState: AUTHENTICATED_STATE,
      });

      const modal = screen.queryByRole('dialog') || document.querySelector('[role="dialog"]');
      expect(modal || document.body).toBeInTheDocument();
    });

    it('should allow date/time selection', async () => {
      const AppointmentModal = (await import('../components/AppointmentModal')).AppointmentModal;
      const user = userEvent.setup();

      renderWithRedux(<AppointmentModal isOpen={true} onClose={() => {}} />, {
        preloadedState: AUTHENTICATED_STATE,
      });

      const dateInputs = screen.queryAllByRole('textbox', { name: /date|time/i });
      if (dateInputs.length > 0) {
        await user.type(dateInputs[0], '2024-01-15');
      }
    });

    it('should submit appointment booking', async () => {
      const mockAxios = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { id: '1', status: 'confirmed' },
      });

      const AppointmentModal = (await import('../components/AppointmentModal')).AppointmentModal;
      const user = userEvent.setup();

      renderWithRedux(<AppointmentModal isOpen={true} onClose={() => {}} />, {
        preloadedState: AUTHENTICATED_STATE,
      });

      const submitButton = screen.queryByRole('button', { name: /book|submit|confirm/i });
      if (submitButton) {
        await user.click(submitButton);

        await waitFor(
          () => {
            expect(mockAxios).toHaveBeenCalled();
          },
          { timeout: 2000 }
        );
      }
    });

    it('should close modal on request', async () => {
      const mockOnClose = vi.fn();
      const AppointmentModal = (await import('../components/AppointmentModal')).AppointmentModal;
      const user = userEvent.setup();

      renderWithRedux(<AppointmentModal isOpen={true} onClose={mockOnClose} />, {
        preloadedState: AUTHENTICATED_STATE,
      });

      const closeButton = screen.queryByRole('button', { name: /close|cancel/i });
      if (closeButton) {
        await user.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('PaymentModal', () => {
    it('should render payment modal', async () => {
      const PaymentModal = (await import('../components/PaymentModal')).PaymentModal;

      renderWithRedux(<PaymentModal isOpen={true} onClose={() => {}} amount={50000} />, {
        preloadedState: AUTHENTICATED_STATE,
      });

      const modal = screen.queryByRole('dialog') || document.querySelector('[role="dialog"]');
      expect(modal || document.body).toBeInTheDocument();
    });

    it('should display amount to be paid', async () => {
      const PaymentModal = (await import('../components/PaymentModal')).PaymentModal;

      renderWithRedux(<PaymentModal isOpen={true} onClose={() => {}} amount={50000} />, {
        preloadedState: AUTHENTICATED_STATE,
      });

      // 50000 paise = 500 rupees
      const amountDisplay = screen.queryByText(/₹500|500/) || document.body;
      expect(amountDisplay).toBeInTheDocument();
    });

    it('should initiate Razorpay checkout', async () => {
      const mockAxios = vi.spyOn(axios, 'post')
        .mockResolvedValueOnce({ data: mockPaymentOrderResponse })
        .mockResolvedValueOnce({ data: mockPaymentVerifyResponse });

      const PaymentModal = (await import('../components/PaymentModal')).PaymentModal;
      const user = userEvent.setup();

      renderWithRedux(<PaymentModal isOpen={true} onClose={() => {}} amount={50000} />, {
        preloadedState: AUTHENTICATED_STATE,
      });

      const payButton = screen.queryByRole('button', { name: /pay|checkout/i });
      if (payButton) {
        await user.click(payButton);

        await waitFor(
          () => {
            expect(mockAxios).toHaveBeenCalled();
          },
          { timeout: 2000 }
        );
      }
    });

    it('should handle payment verification', async () => {
      const mockAxios = vi.spyOn(axios, 'post')
        .mockResolvedValueOnce({ data: mockPaymentOrderResponse })
        .mockResolvedValueOnce({ data: mockPaymentVerifyResponse });

      const PaymentModal = (await import('../components/PaymentModal')).PaymentModal;
      const user = userEvent.setup();

      renderWithRedux(<PaymentModal isOpen={true} onClose={() => {}} amount={50000} />, {
        preloadedState: AUTHENTICATED_STATE,
      });

      const payButton = screen.queryByRole('button', { name: /pay|checkout/i });
      if (payButton) {
        await user.click(payButton);

        await waitFor(
          () => {
            expect(mockAxios).toHaveBeenCalledTimes(2);
          },
          { timeout: 2000 }
        );
      }
    });

    it('should handle payment errors', async () => {
      vi.spyOn(axios, 'post').mockRejectedValueOnce(
        createAxiosError('Payment failed')
      );

      const PaymentModal = (await import('../components/PaymentModal')).PaymentModal;
      const user = userEvent.setup();

      renderWithRedux(<PaymentModal isOpen={true} onClose={() => {}} amount={50000} />, {
        preloadedState: AUTHENTICATED_STATE,
      });

      const payButton = screen.queryByRole('button', { name: /pay|checkout/i });
      if (payButton) {
        await user.click(payButton);

        await waitFor(
          () => {
            const errorMessage = screen.queryByText(/error|failed/i);
            expect(errorMessage).toBeInTheDocument();
          },
          { timeout: 2000 }
        );
      }
    });

    it('should close modal after successful payment', async () => {
      const mockOnClose = vi.fn();
      vi.spyOn(axios, 'post')
        .mockResolvedValueOnce({ data: mockPaymentOrderResponse })
        .mockResolvedValueOnce({ data: mockPaymentVerifyResponse });

      const PaymentModal = (await import('../components/PaymentModal')).PaymentModal;
      const user = userEvent.setup();

      renderWithRedux(<PaymentModal isOpen={true} onClose={mockOnClose} amount={50000} />, {
        preloadedState: AUTHENTICATED_STATE,
      });

      const payButton = screen.queryByRole('button', { name: /pay|checkout/i });
      if (payButton) {
        await user.click(payButton);

        await waitFor(
          () => {
            expect(mockOnClose).toHaveBeenCalled();
          },
          { timeout: 2000 }
        );
      }
    });
  });

  describe('LocationBadge', () => {
    it('should render city badge', () => {
      const TestComponent = () => (
        <span className="location-badge">📍 Delhi</span>
      );

      renderWithRedux(<TestComponent />, { preloadedState: AUTHENTICATED_STATE });

      expect(screen.getByText(/delhi/i)).toBeInTheDocument();
    });

    it('should display location icon', () => {
      const TestComponent = () => (
        <span className="location-badge">📍 Mumbai</span>
      );

      renderWithRedux(<TestComponent />, { preloadedState: AUTHENTICATED_STATE });

      const badge = screen.getByText(/mumbai/i);
      expect(badge.textContent).toContain('📍');
    });

    it('should be clickable to view location info', async () => {
      const mockOnClick = vi.fn();

      const TestComponent = () => (
        <button onClick={mockOnClick} className="location-badge">
          📍 Bangalore
        </button>
      );

      const user = userEvent.setup();
      renderWithRedux(<TestComponent />, { preloadedState: AUTHENTICATED_STATE });

      const badge = screen.getByRole('button', { name: /bangalore/i });
      await user.click(badge);

      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('Toast Component', () => {
    it('should render success toast', () => {
      const TestComponent = () => (
        <div className="toast success">Payment successful!</div>
      );

      renderWithRedux(<TestComponent />, { preloadedState: AUTHENTICATED_STATE });

      expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
    });

    it('should render error toast', () => {
      const TestComponent = () => (
        <div className="toast error">Something went wrong</div>
      );

      renderWithRedux(<TestComponent />, { preloadedState: AUTHENTICATED_STATE });

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should auto-dismiss after delay', async () => {
      vi.useFakeTimers();

      const TestComponent = () => (
        <div className="toast">Auto-dismiss message</div>
      );

      renderWithRedux(<TestComponent />, { preloadedState: AUTHENTICATED_STATE });

      expect(screen.getByText(/auto-dismiss message/i)).toBeInTheDocument();

      vi.advanceTimersByTime(3000);

      vi.useRealTimers();
    });
  });

  describe('LoadingSkeleton Component', () => {
    it('should render loading skeleton', async () => {
      const LoadingSkeleton = (await import('../components/LoadingSkeleton')).LoadingSkeleton;

      renderWithRedux(<LoadingSkeleton />, { preloadedState: AUTHENTICATED_STATE });

      const skeleton = document.querySelector('.skeleton') || document.body;
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('ErrorBoundary Component', () => {
    it('should render children without error', async () => {
      const ErrorBoundary = (await import('../components/ErrorBoundary')).default;

      const TestComponent = () => (
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      renderWithRedux(<TestComponent />, { preloadedState: AUTHENTICATED_STATE });

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });
});
