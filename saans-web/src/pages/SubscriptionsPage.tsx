import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Zap, Heart, Brain } from 'lucide-react';

const SubscriptionsPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
    fetchActiveSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get('/api/subscriptions/plans');
      setPlans(res.data.data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchActiveSubscription = async () => {
    try {
      const res = await axios.get('/api/subscriptions/user/active', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setActiveSubscription(res.data.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPlan = async (planId: string) => {
    try {
      await axios.post('/api/subscriptions/subscribe',
        { planId, paymentMethod: 'stripe' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Subscription activated!');
      fetchActiveSubscription();
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to subscribe');
    }
  };

  const upgradePlan = async (newPlanId: string) => {
    try {
      await axios.post('/api/subscriptions/upgrade',
        { newPlanId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Plan upgraded!');
      fetchActiveSubscription();
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  };

  const cancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel?')) return;
    try {
      await axios.post('/api/subscriptions/cancel', {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Subscription cancelled');
      setActiveSubscription(null);
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Mental Health Plans</h1>
        <p className="text-center text-gray-600 mb-12">Choose the plan that fits your wellness journey</p>

        {activeSubscription && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-8 rounded">
            <p className="text-green-700">
              ✅ Active Plan: <strong>{activeSubscription.name}</strong>
              {activeSubscription.daysRemaining &&
                ` - ${activeSubscription.daysRemaining} days remaining`
              }
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-2 border-gray-200">
            <Heart className="text-gray-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Free</h3>
            <p className="text-3xl font-bold mb-6">₹0<span className="text-sm">/month</span></p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> Basic mood tracking</li>
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> Community access</li>
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> 1 free session/month</li>
            </ul>
            <button disabled className="w-full bg-gray-300 text-gray-500 py-2 rounded cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Standard Plan */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-2 border-blue-500">
            <Brain className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Standard</h3>
            <p className="text-3xl font-bold mb-6">₹299<span className="text-sm">/month</span></p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> Unlimited mood tracking</li>
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> 4 therapy sessions/month</li>
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> Resource library</li>
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> Priority support</li>
            </ul>
            <button
              onClick={() => activeSubscription ? upgradePlan('standard') : subscribeToPlan('standard')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
            >
              {activeSubscription?.name === 'Standard' ? 'Current' : 'Subscribe'}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-2 border-purple-500 transform scale-105">
            <Zap className="text-purple-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Premium</h3>
            <p className="text-3xl font-bold mb-6">₹799<span className="text-sm">/month</span></p>
            <div className="bg-purple-100 text-purple-700 text-sm py-1 px-2 rounded mb-4 inline-block">
              Most Popular
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> Unlimited sessions</li>
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> Video consultations</li>
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> Personalized care plan</li>
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> 24/7 crisis support</li>
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> Family access</li>
            </ul>
            <button
              onClick={() => activeSubscription ? upgradePlan('premium') : subscribeToPlan('premium')}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition"
            >
              {activeSubscription?.name === 'Premium' ? 'Current' : 'Subscribe'}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-2 border-gold-500">
            <Heart className="text-red-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">VIP</h3>
            <p className="text-3xl font-bold mb-6">₹1,499<span className="text-sm">/month</span></p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> Everything in Premium</li>
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> Dedicated therapist</li>
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> Group therapy access</li>
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> Wellness coaching</li>
              <li className="flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> Concierge support</li>
            </ul>
            <button
              onClick={() => activeSubscription ? upgradePlan('vip') : subscribeToPlan('vip')}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
            >
              {activeSubscription?.name === 'VIP' ? 'Current' : 'Subscribe'}
            </button>
          </div>
        </div>

        {activeSubscription && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={cancelSubscription}
              className="text-red-500 hover:text-red-700 underline"
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
