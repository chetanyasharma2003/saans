import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'BASIC' | 'PREMIUM' | 'PLUS';
  planName: string;
  price: number;
  features: string[];
  onPaymentSuccess?: (subscription: any) => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  planType,
  planName,
  price,
  features,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');

  // Clean up on close
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSuccess(false);
      setPaymentStep('details');
    }
  }, [isOpen]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleCreateOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');

      // Step 1: Create order from backend
      const orderResponse = await axios.post(
        `${API_URL}/api/payments/create-order`,
        { planType },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!orderResponse.data.success || !orderResponse.data.data) {
        throw new Error('Failed to create payment order');
      }

      const { orderId, amount, currency } = orderResponse.data.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        name: 'SAANS',
        description: `${planName} Subscription`,
        order_id: orderId,
        handler: (response: RazorpayResponse) => {
          handlePaymentVerification(response, orderId);
        },
        prefill: {
          contact: '',
          email: '',
        },
        notes: {
          planType,
          planName,
        },
        theme: {
          color: '#4F46E5', // Indigo color matching the design
        },
      };

      // @ts-ignore - Razorpay script types
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      setPaymentStep('processing');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create payment order');
      setLoading(false);
    }
  };

  const handlePaymentVerification = async (
    response: RazorpayResponse,
    orderId: string
  ) => {
    try {
      const token = localStorage.getItem('accessToken');

      // Step 3: Verify payment on backend
      const verifyResponse = await axios.post(
        `${API_URL}/api/payments/verify-payment`,
        {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          planType,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!verifyResponse.data.success) {
        throw new Error('Payment verification failed');
      }

      setSuccess(true);
      setPaymentStep('success');
      setError('');

      // Call success callback
      if (onPaymentSuccess) {
        onPaymentSuccess(verifyResponse.data.data);
      }

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Payment verification failed');
      setPaymentStep('details');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800/95 to-slate-700/95 border border-indigo-400/40 rounded-3xl p-8 max-w-md w-full backdrop-blur-xl shadow-2xl animate-in fade-in scale-95 transition duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-indigo-300 hover:text-indigo-100 disabled:opacity-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {paymentStep === 'details' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Confirm Purchase</h3>
              <p className="text-indigo-200 text-sm">Review your subscription details before proceeding</p>
            </div>

            {/* Plan Details Card */}
            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-400/30 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-white font-bold text-xl">{planName}</h4>
                  <p className="text-indigo-300 text-sm mt-1">Monthly Subscription</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-300">₹{price}</div>
                  <p className="text-indigo-400 text-xs mt-1">per month</p>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-6 pb-6 border-b border-indigo-400/20">
                {features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span className="text-indigo-100 text-sm">{feature}</span>
                  </div>
                ))}
                {features.length > 4 && (
                  <p className="text-indigo-300 text-xs italic">+ {features.length - 4} more features</p>
                )}
              </div>

              {/* Billing Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-indigo-300">Subtotal</span>
                  <span className="text-white font-semibold">₹{price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-300">Tax (0%)</span>
                  <span className="text-white font-semibold">₹0</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-indigo-400/20">
                  <span className="text-indigo-200 font-semibold">Total</span>
                  <span className="text-indigo-300 font-bold">₹{price}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-slate-700/30 border border-indigo-400/20 rounded-lg p-4">
              <p className="text-indigo-200 text-xs">
                By clicking "Proceed to Payment", you agree to our{' '}
                <a href="#" className="text-indigo-400 hover:text-indigo-300">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-indigo-400 hover:text-indigo-300">
                  Privacy Policy
                </a>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-600/20 border border-red-400/40 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition duration-300 disabled:opacity-50 transform hover:scale-105"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-slate-700/60 hover:bg-slate-700/80 text-indigo-200 font-bold py-3 rounded-lg transition duration-300 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="text-center space-y-6 py-8">
            <div className="animate-spin">
              <svg className="w-12 h-12 text-indigo-400 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold">Processing Payment</p>
              <p className="text-indigo-300 text-sm mt-1">Please wait while we process your payment...</p>
            </div>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 bg-green-600/20 border border-green-400/40 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-lg">Payment Successful!</p>
              <p className="text-green-300 text-sm mt-1">Your {planName} subscription is now active</p>
              <p className="text-indigo-300 text-xs mt-2">Redirecting to your profile...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;
