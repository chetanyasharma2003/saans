import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { PaymentModal } from './PaymentModal';

vi.mock('axios');
const mockedAxios = axios as any;

describe('PaymentModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    planType: 'PREMIUM' as const,
    planName: 'Premium',
    price: 299,
    features: [
      'Unlimited AI chat',
      'Priority AI responses',
      'Mood tracking with insights',
      'Therapy sessions (4/month)',
      'Full resource library',
      'Crisis support with priority',
      'Personalized wellness plans',
    ],
    onPaymentSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('accessToken', 'test-token');

    // Mock Razorpay
    window.Razorpay = vi.fn(function() {
      this.open = vi.fn();
    }) as any;
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Rendering and Visibility', () => {
    it('should render modal when isOpen is true', () => {
      render(<PaymentModal {...defaultProps} />);
      expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<PaymentModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Confirm Purchase')).not.toBeInTheDocument();
    });

    it('should display plan name', () => {
      render(<PaymentModal {...defaultProps} />);
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('should display price', () => {
      render(<PaymentModal {...defaultProps} />);
      expect(screen.getByText('₹299')).toBeInTheDocument();
    });

    it('should display subscription type as "Monthly Subscription"', () => {
      render(<PaymentModal {...defaultProps} />);
      expect(screen.getByText('Monthly Subscription')).toBeInTheDocument();
    });
  });

  describe('Plan Features Display', () => {
    it('should display first 4 features', () => {
      render(<PaymentModal {...defaultProps} />);
      expect(screen.getByText('Unlimited AI chat')).toBeInTheDocument();
      expect(screen.getByText('Priority AI responses')).toBeInTheDocument();
      expect(screen.getByText('Mood tracking with insights')).toBeInTheDocument();
      expect(screen.getByText('Therapy sessions (4/month)')).toBeInTheDocument();
    });

    it('should show "more features" text when features count > 4', () => {
      render(<PaymentModal {...defaultProps} />);
      expect(screen.getByText('+ 3 more features')).toBeInTheDocument();
    });

    it('should display all features when count <= 4', () => {
      const limitedFeatures = ['Feature 1', 'Feature 2'];
      render(
        <PaymentModal
          {...defaultProps}
          features={limitedFeatures}
        />
      );
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 2')).toBeInTheDocument();
      expect(screen.queryByText(/\+ \d+ more features/)).not.toBeInTheDocument();
    });
  });

  describe('Billing Information', () => {
    it('should display subtotal', () => {
      render(<PaymentModal {...defaultProps} />);
      const subtotalLabel = screen.getByText('Subtotal');
      expect(subtotalLabel).toBeInTheDocument();
      const subtotalValue = screen.getByText((content) =>
        content === '₹299' && content.includes('299')
      );
      expect(subtotalValue).toBeInTheDocument();
    });

    it('should display tax as 0%', () => {
      render(<PaymentModal {...defaultProps} />);
      expect(screen.getByText('Tax (0%)')).toBeInTheDocument();
      expect(screen.getByText('₹0')).toBeInTheDocument();
    });

    it('should display total amount', () => {
      render(<PaymentModal {...defaultProps} />);
      const totalLabel = screen.getByText('Total');
      expect(totalLabel).toBeInTheDocument();
    });
  });

  describe('Three-Step Flow', () => {
    it('should start at details step', () => {
      render(<PaymentModal {...defaultProps} />);
      expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
      expect(screen.getByText('Proceed to Payment')).toBeInTheDocument();
    });

    it('should transition to processing step when Proceed to Payment is clicked', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            orderId: 'order_123',
            amount: 299,
            currency: 'INR',
          },
        },
      });

      render(<PaymentModal {...defaultProps} />);

      const proceedButton = screen.getByText('Proceed to Payment');
      fireEvent.click(proceedButton);

      await waitFor(() => {
        expect(screen.getByText('Processing Payment')).toBeInTheDocument();
      });
    });

    it('should transition to success step after successful payment verification', async () => {
      mockedAxios.post
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              orderId: 'order_123',
              amount: 299,
              currency: 'INR',
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: { subscriptionId: 'sub_123' },
          },
        });

      render(<PaymentModal {...defaultProps} />);

      const proceedButton = screen.getByText('Proceed to Payment');
      fireEvent.click(proceedButton);

      await waitFor(() => {
        expect(screen.getByText('Processing Payment')).toBeInTheDocument();
      });

      // Simulate Razorpay response
      const razorpayInstance = (window.Razorpay as any).mock.results[0].value;
      razorpayInstance.open.mock.calls;

      // Mock the payment handler being called
      const mockRazorpayOptions = (window.Razorpay as any).mock.calls[0][0];
      mockRazorpayOptions.handler({
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'sig_123',
      });

      await waitFor(() => {
        expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
      });
    });

    it('should show success message with plan name', async () => {
      mockedAxios.post
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: { orderId: 'order_123', amount: 299, currency: 'INR' },
          },
        })
        .mockResolvedValueOnce({
          data: { success: true, data: { subscriptionId: 'sub_123' } },
        });

      render(<PaymentModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        expect(screen.getByText('Processing Payment')).toBeInTheDocument();
      });

      const mockRazorpayOptions = (window.Razorpay as any).mock.calls[0][0];
      mockRazorpayOptions.handler({
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'sig_123',
      });

      await waitFor(() => {
        expect(screen.getByText(/Your Premium subscription is now active/)).toBeInTheDocument();
      });
    });
  });

  describe('Razorpay Integration', () => {
    it('should create order before opening Razorpay', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: { orderId: 'order_123', amount: 299, currency: 'INR' },
        },
      });

      render(<PaymentModal {...defaultProps} />);
      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/payments/create-order'),
          { planType: 'PREMIUM' },
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token',
            }),
          })
        );
      });
    });

    it('should open Razorpay checkout with correct options', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: { orderId: 'order_123', amount: 299, currency: 'INR' },
        },
      });

      render(<PaymentModal {...defaultProps} />);
      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        const razorpayCall = (window.Razorpay as any).mock.calls[0][0];
        expect(razorpayCall).toMatchObject({
          amount: 29900, // Razorpay expects amount in paise (299 * 100)
          currency: 'INR',
          name: 'SAANS',
          description: 'Premium Subscription',
          order_id: 'order_123',
          theme: { color: '#4F46E5' },
        });
      });
    });

    it('should verify payment after Razorpay callback', async () => {
      mockedAxios.post
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: { orderId: 'order_123', amount: 299, currency: 'INR' },
          },
        })
        .mockResolvedValueOnce({
          data: { success: true, data: { subscriptionId: 'sub_123' } },
        });

      render(<PaymentModal {...defaultProps} />);
      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        expect(screen.getByText('Processing Payment')).toBeInTheDocument();
      });

      const mockRazorpayOptions = (window.Razorpay as any).mock.calls[0][0];
      mockRazorpayOptions.handler({
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'sig_123',
      });

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/payments/verify-payment'),
          {
            razorpay_order_id: 'order_123',
            razorpay_payment_id: 'pay_123',
            razorpay_signature: 'sig_123',
            planType: 'PREMIUM',
          },
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token',
            }),
          })
        );
      });
    });

    it('should call onPaymentSuccess after verification', async () => {
      mockedAxios.post
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: { orderId: 'order_123', amount: 299, currency: 'INR' },
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: { subscriptionId: 'sub_123', planType: 'PREMIUM' },
          },
        });

      const onPaymentSuccess = vi.fn();
      render(
        <PaymentModal
          {...defaultProps}
          onPaymentSuccess={onPaymentSuccess}
        />
      );

      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        expect(screen.getByText('Processing Payment')).toBeInTheDocument();
      });

      const mockRazorpayOptions = (window.Razorpay as any).mock.calls[0][0];
      mockRazorpayOptions.handler({
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'sig_123',
      });

      await waitFor(() => {
        expect(onPaymentSuccess).toHaveBeenCalledWith({
          subscriptionId: 'sub_123',
          planType: 'PREMIUM',
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error when order creation fails', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Order creation failed',
          },
        },
      });

      render(<PaymentModal {...defaultProps} />);
      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        expect(screen.getByText('Order creation failed')).toBeInTheDocument();
      });
    });

    it('should display error when order response is missing data', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: false,
        },
      });

      render(<PaymentModal {...defaultProps} />);
      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        expect(screen.getByText('Failed to create payment order')).toBeInTheDocument();
      });
    });

    it('should display error when payment verification fails', async () => {
      mockedAxios.post
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: { orderId: 'order_123', amount: 299, currency: 'INR' },
          },
        })
        .mockRejectedValueOnce({
          response: {
            data: {
              message: 'Payment verification failed',
            },
          },
        });

      render(<PaymentModal {...defaultProps} />);
      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        expect(screen.getByText('Processing Payment')).toBeInTheDocument();
      });

      const mockRazorpayOptions = (window.Razorpay as any).mock.calls[0][0];
      mockRazorpayOptions.handler({
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'sig_123',
      });

      await waitFor(() => {
        expect(screen.getByText('Payment verification failed')).toBeInTheDocument();
      });
    });

    it('should return to details step after error', async () => {
      mockedAxios.post
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: { orderId: 'order_123', amount: 299, currency: 'INR' },
          },
        })
        .mockRejectedValueOnce({
          response: {
            data: { message: 'Verification failed' },
          },
        });

      render(<PaymentModal {...defaultProps} />);
      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        expect(screen.getByText('Processing Payment')).toBeInTheDocument();
      });

      const mockRazorpayOptions = (window.Razorpay as any).mock.calls[0][0];
      mockRazorpayOptions.handler({
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'sig_123',
      });

      await waitFor(() => {
        expect(screen.getByText('Verification failed')).toBeInTheDocument();
        expect(screen.getByText('Proceed to Payment')).toBeInTheDocument();
      });
    });

    it('should handle missing error message gracefully', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        message: 'Network error',
      });

      render(<PaymentModal {...defaultProps} />);
      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should close modal when close button is clicked', () => {
      const onClose = vi.fn();
      render(<PaymentModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: '' }).parentElement?.querySelector('button');
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('should close modal when Cancel button is clicked', () => {
      const onClose = vi.fn();
      render(<PaymentModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should disable buttons during payment processing', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: { orderId: 'order_123', amount: 299, currency: 'INR' },
        },
      });

      render(<PaymentModal {...defaultProps} />);
      const proceedButton = screen.getByText('Proceed to Payment');
      const cancelButton = screen.getByText('Cancel');

      fireEvent.click(proceedButton);

      await waitFor(() => {
        expect(proceedButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
      });
    });

    it('should clear error when retrying after error', async () => {
      mockedAxios.post
        .mockRejectedValueOnce({ response: { data: { message: 'Order failed' } } })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: { orderId: 'order_123', amount: 299, currency: 'INR' },
          },
        });

      render(<PaymentModal {...defaultProps} />);

      // First attempt fails
      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        expect(screen.getByText('Order failed')).toBeInTheDocument();
      });

      // Second attempt succeeds
      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        expect(screen.queryByText('Order failed')).not.toBeInTheDocument();
      });
    });
  });

  describe('Auto-close on Success', () => {
    it('should close modal after 3 seconds on success', async () => {
      vi.useFakeTimers();

      mockedAxios.post
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: { orderId: 'order_123', amount: 299, currency: 'INR' },
          },
        })
        .mockResolvedValueOnce({
          data: { success: true, data: { subscriptionId: 'sub_123' } },
        });

      const onClose = vi.fn();
      render(<PaymentModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        expect(screen.getByText('Processing Payment')).toBeInTheDocument();
      });

      const mockRazorpayOptions = (window.Razorpay as any).mock.calls[0][0];
      mockRazorpayOptions.handler({
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'sig_123',
      });

      await waitFor(() => {
        expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
      });

      vi.advanceTimersByTime(3000);

      expect(onClose).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('Cleanup on Close', () => {
    it('should reset error and success state when modal closes', () => {
      const { rerender } = render(<PaymentModal {...defaultProps} isOpen={true} />);

      rerender(<PaymentModal {...defaultProps} isOpen={false} />);
      rerender(<PaymentModal {...defaultProps} isOpen={true} />);

      // Modal should be in details step with no error/success
      expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
      expect(screen.getByText('Proceed to Payment')).toBeInTheDocument();
      expect(screen.queryByText('Payment Successful!')).not.toBeInTheDocument();
    });
  });

  describe('Different Plan Types', () => {
    it('should work with BASIC plan', () => {
      render(
        <PaymentModal
          {...defaultProps}
          planType="BASIC"
          planName="Basic"
          price={99}
        />
      );

      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('₹99')).toBeInTheDocument();
    });

    it('should work with PLUS plan', () => {
      render(
        <PaymentModal
          {...defaultProps}
          planType="PLUS"
          planName="Plus"
          price={499}
        />
      );

      expect(screen.getByText('Plus')).toBeInTheDocument();
      expect(screen.getByText('₹499')).toBeInTheDocument();
    });

    it('should pass correct planType to Razorpay', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: { orderId: 'order_123', amount: 499, currency: 'INR' },
        },
      });

      render(
        <PaymentModal
          {...defaultProps}
          planType="PLUS"
          planName="Plus"
          price={499}
        />
      );

      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        const razorpayOptions = (window.Razorpay as any).mock.calls[0][0];
        expect(razorpayOptions.notes).toEqual({
          planType: 'PLUS',
          planName: 'Plus',
        });
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have responsive padding', () => {
      render(<PaymentModal {...defaultProps} />);
      const modal = screen.getByText('Confirm Purchase').closest('div');

      // Check that the modal has responsive classes
      expect(modal?.className).toContain('max-w-md');
      expect(modal?.className).toContain('p-4');
    });

    it('should have max-width constraint', () => {
      render(<PaymentModal {...defaultProps} />);
      const container = screen.getByText('Confirm Purchase').closest('div')?.parentElement;

      expect(container?.className).toContain('max-w-md');
    });

    it('should be full-width on mobile', () => {
      render(<PaymentModal {...defaultProps} />);
      const container = screen.getByText('Confirm Purchase').closest('div')?.parentElement;

      expect(container?.className).toContain('w-full');
    });
  });

  describe('Terms and Privacy Links', () => {
    it('should display Terms of Service link', () => {
      render(<PaymentModal {...defaultProps} />);
      const termsLink = screen.getByText('Terms of Service');
      expect(termsLink).toBeInTheDocument();
      expect(termsLink.getAttribute('href')).toBe('#');
    });

    it('should display Privacy Policy link', () => {
      render(<PaymentModal {...defaultProps} />);
      const privacyLink = screen.getByText('Privacy Policy');
      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink.getAttribute('href')).toBe('#');
    });
  });

  describe('Authentication Token', () => {
    it('should use access token from localStorage', async () => {
      const customToken = 'custom-auth-token-12345';
      localStorage.setItem('accessToken', customToken);

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: { orderId: 'order_123', amount: 299, currency: 'INR' },
        },
      });

      render(<PaymentModal {...defaultProps} />);
      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Object),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer ${customToken}`,
            }),
          })
        );
      });
    });

    it('should work without access token (edge case)', async () => {
      localStorage.removeItem('accessToken');

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: { orderId: 'order_123', amount: 299, currency: 'INR' },
        },
      });

      render(<PaymentModal {...defaultProps} />);
      fireEvent.click(screen.getByText('Proceed to Payment'));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during order creation', async () => {
      mockedAxios.post.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => {
          resolve({
            data: {
              success: true,
              data: { orderId: 'order_123', amount: 299, currency: 'INR' },
            },
          });
        }, 1000))
      );

      render(<PaymentModal {...defaultProps} />);
      const proceedButton = screen.getByText('Proceed to Payment');

      fireEvent.click(proceedButton);

      // Button text should change to "Processing..."
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });
});
