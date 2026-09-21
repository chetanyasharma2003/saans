import React, { useState } from 'react';
import { X, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import paymentApi from '../../services/paymentApi';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookingDetails: {
    therapistId: string;
    therapistName: string;
    amount: number;
    sessionType: 'video' | 'inperson' | 'phone';
    date: string;
    time: string;
  } | null;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bookingDetails,
}) => {
  const [step, setStep] = useState<'method' | 'confirm' | 'processing' | 'success' | 'error'>('method');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'wallet' | 'upi'>('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(5000); // Mock wallet balance

  if (!isOpen || !bookingDetails) return null;

  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Initiate payment on backend
      const paymentResponse = await paymentApi.initiatePayment({
        bookingId: `BOOKING_${Date.now()}`,
        therapistId: bookingDetails.therapistId,
        amount: bookingDetails.amount,
        sessionType: bookingDetails.sessionType,
        date: bookingDetails.date,
        time: bookingDetails.time,
      });

      // Step 2: Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const options = {
          key: paymentResponse.key,
          amount: paymentResponse.amount * 100, // Razorpay expects amount in paise
          currency: paymentResponse.currency,
          order_id: paymentResponse.orderId,
          name: 'SAANS Mental Health',
          description: `Session with ${bookingDetails.therapistName}`,
          image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd8b4b50?w=100&h=100&fit=crop',
          prefill: {
            name: '',
            email: '',
            contact: '',
          },
          theme: {
            color: '#0d9488',
          },
          handler: async (response: any) => {
            setStep('processing');
            try {
              // Step 3: Verify payment
              const verifyResponse = await paymentApi.verifyPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyResponse.success) {
                setStep('success');
                setTimeout(() => {
                  onSuccess();
                  onClose();
                }, 2000);
              } else {
                setError('Payment verification failed');
                setStep('error');
              }
            } catch (err: any) {
              setError(err.message);
              setStep('error');
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              setError('Payment cancelled');
              setStep('error');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err: any) {
      setError(err.message);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletPayment = () => {
    if (walletBalance < bookingDetails.amount) {
      setError(`Insufficient wallet balance. You have ₹${walletBalance}, need ₹${bookingDetails.amount}`);
      return;
    }

    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Confirm Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 'method' && (
            <div className="space-y-6">
              {/* Booking Summary */}
              <div className="bg-slate-700/30 p-4 rounded-xl border border-white/10">
                <p className="text-gray-400 text-sm mb-3">Amount Due</p>
                <p className="text-4xl font-bold text-teal-400 mb-4">₹{bookingDetails.amount}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300"><strong>Therapist:</strong> {bookingDetails.therapistName}</p>
                  <p className="text-gray-300"><strong>Date:</strong> {new Date(bookingDetails.date).toLocaleDateString()}</p>
                  <p className="text-gray-300"><strong>Time:</strong> {bookingDetails.time}</p>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <p className="text-white font-semibold">Choose Payment Method</p>

                <button
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === 'razorpay'
                      ? 'border-teal-500 bg-teal-500/20'
                      : 'border-white/10 bg-slate-700/20 hover:border-teal-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">💳 Card / UPI</p>
                      <p className="text-gray-400 text-sm">Debit, Credit, UPI</p>
                    </div>
                    <div className="text-2xl">🔷</div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === 'wallet'
                      ? 'border-teal-500 bg-teal-500/20'
                      : 'border-white/10 bg-slate-700/20 hover:border-teal-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">💰 Wallet</p>
                      <p className="text-gray-400 text-sm">Balance: ₹{walletBalance}</p>
                    </div>
                    <div className="text-2xl">🪙</div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setStep('confirm')}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-xl transition-all duration-300"
              >
                Continue →
              </button>

              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Lock className="w-4 h-4" />
                <span>Secured by Razorpay | 256-bit SSL encryption</span>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl">
                <p className="text-yellow-200 text-sm">
                  ✓ Payment is secure and encrypted. You'll receive a confirmation email after successful payment.
                </p>
              </div>

              <button
                onClick={
                  paymentMethod === 'wallet' ? handleWalletPayment : handleRazorpayPayment
                }
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-300"
              >
                {loading ? 'Processing...' : `Pay ₹${bookingDetails.amount}`}
              </button>

              <button
                onClick={() => setStep('method')}
                disabled={loading}
                className="w-full text-teal-400 border border-teal-500/50 py-2 rounded-xl hover:bg-teal-500/10 transition-all"
              >
                ← Change Method
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin mb-6">
                <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full" />
              </div>
              <p className="text-white font-semibold">Processing Payment...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-white font-bold text-xl mb-2">Payment Successful! ✓</p>
              <p className="text-gray-400 text-center">Your booking is confirmed. Check your email for details.</p>
            </div>
          )}

          {step === 'error' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <p className="text-white font-bold text-lg mb-2">Payment Failed</p>
                <p className="text-gray-400 text-center text-sm mb-4">{error}</p>
              </div>
              <button
                onClick={() => setStep('method')}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold py-3 rounded-xl"
              >
                ← Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
