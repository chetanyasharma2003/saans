import React, { useState } from 'react';
import { CreditCard, DollarSign, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function PaymentPage() {
  const [amount, setAmount] = useState(800);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [appointmentId, setAppointmentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const orderRes = await axios.post(
        `${API_URL}/api/payments/razorpay/create-order`,
        { amount, appointmentId, description: 'Appointment payment' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId } = orderRes.data;

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_1DP5mmOlF5G5ag',
          order_id: orderId,
          amount: amount * 100,
          currency: 'INR',
          handler: async (response) => {
            await axios.post(
              `${API_URL}/api/payments/razorpay/verify`,
              {
                orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                appointmentId
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus('success');
          },
          prefill: {
            email: localStorage.getItem('userEmail') || '',
            contact: '9999999999'
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error('Payment error:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DashboardHeader title="Payment" showBackButton={true} />

      <main className="max-w-2xl mx-auto px-4 py-12">
        {status === 'success' && (
          <div className="mb-8 bg-green-500/20 border border-green-500/50 text-green-300 p-4 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Payment successful! Your appointment has been confirmed.
          </div>
        )}

        {status === 'error' && (
          <div className="mb-8 bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Payment failed. Please try again.
          </div>
        )}

        <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-8">Complete Your Payment</h2>

          {/* Payment Details */}
          <div className="bg-slate-800/30 rounded-lg p-6 mb-8 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-300">Appointment Fee</span>
              <span className="text-3xl font-bold text-white">₹{amount}</span>
            </div>
            <div className="h-px bg-slate-700"></div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-400 text-sm">Total Amount</span>
              <span className="text-2xl font-bold text-purple-400">₹{amount}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-8">
            <label className="block text-sm text-gray-300 mb-4 font-bold">Select Payment Method</label>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('razorpay')}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === 'razorpay'
                    ? 'border-purple-500 bg-purple-600/20'
                    : 'border-slate-700 bg-slate-800/30 hover:border-purple-500/50'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-bold text-white">Razorpay</p>
                  <p className="text-xs text-gray-400">Cards, UPI, Wallets</p>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('stripe')}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === 'stripe'
                    ? 'border-purple-500 bg-purple-600/20'
                    : 'border-slate-700 bg-slate-800/30 hover:border-purple-500/50'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-bold text-white">Stripe</p>
                  <p className="text-xs text-gray-400">International Cards</p>
                </div>
              </button>
            </div>
          </div>

          {/* Appointment ID */}
          <div className="mb-8">
            <label className="block text-sm text-gray-300 mb-2">Appointment ID</label>
            <input
              type="text"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              placeholder="Enter appointment ID"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 outline-none"
            />
          </div>

          {/* Pay Button */}
          <button
            onClick={handleRazorpayPayment}
            disabled={!appointmentId || loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay ₹{amount}
              </>
            )}
          </button>

          {/* Security Info */}
          <p className="text-xs text-gray-500 text-center mt-6">
            🔒 Your payment is secure and encrypted. Trusted by thousands.
          </p>
        </div>
      </main>
    </div>
  );
}

export default PaymentPage;
