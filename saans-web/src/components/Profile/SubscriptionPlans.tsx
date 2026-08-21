import React from 'react';

interface Plan {
  id: 'BASIC' | 'PREMIUM' | 'PLUS';
  name: string;
  price: number;
  features: string[];
  highlighted: boolean;
}

interface SubscriptionPlansProps {
  plans: Plan[];
  currentPlanId?: string;
  onPlanSelect: (planId: string) => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  plans,
  currentPlanId,
  onPlanSelect,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-indigo-400/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-2">Upgrade Your Plan</h3>
      <p className="text-indigo-200 mb-8">Choose the perfect plan for your mental health journey</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl backdrop-blur-xl transition duration-300 transform hover:scale-105 ${
              plan.highlighted
                ? 'bg-gradient-to-br from-indigo-600/40 to-purple-600/40 border-2 border-indigo-400 shadow-2xl'
                : 'bg-gradient-to-br from-slate-700/60 to-slate-700/40 border border-indigo-400/30 hover:border-indigo-400/60'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  Most Popular
                </div>
              </div>
            )}

            <div className="p-8">
              {/* Plan Header */}
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-white mb-2">{plan.name}</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-indigo-300">₹{plan.price}</span>
                  <span className="text-indigo-200 text-sm">/month</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8 pb-8 border-b border-indigo-400/20">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-green-400 flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-indigo-100 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Current Plan Indicator */}
              {currentPlanId === plan.id && (
                <div className="mb-4 p-3 bg-green-600/20 border border-green-400/40 rounded-lg">
                  <p className="text-green-300 font-semibold text-sm text-center">✓ Your Current Plan</p>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => onPlanSelect(plan.id)}
                disabled={currentPlanId === plan.id}
                className={`w-full font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 ${
                  currentPlanId === plan.id
                    ? 'bg-slate-600/50 text-slate-300 cursor-not-allowed'
                    : plan.highlighted
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {currentPlanId === plan.id ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Comparison */}
      <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6">
        <h4 className="text-white font-bold mb-4">Plan Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-indigo-400/20">
                <th className="text-left py-2 px-4 text-indigo-200 font-semibold">Features</th>
                <th className="text-center py-2 px-4 text-indigo-200 font-semibold">Basic</th>
                <th className="text-center py-2 px-4 text-indigo-200 font-semibold">Premium</th>
                <th className="text-center py-2 px-4 text-indigo-200 font-semibold">Plus</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-indigo-400/10">
                <td className="py-2 px-4 text-indigo-100">AI Chat</td>
                <td className="text-center py-2 px-4 text-green-400">Unlimited</td>
                <td className="text-center py-2 px-4 text-green-400">Unlimited</td>
                <td className="text-center py-2 px-4 text-green-400">Unlimited</td>
              </tr>
              <tr className="border-b border-indigo-400/10">
                <td className="py-2 px-4 text-indigo-100">Therapy Sessions</td>
                <td className="text-center py-2 px-4 text-indigo-300">2/month</td>
                <td className="text-center py-2 px-4 text-indigo-300">4/month</td>
                <td className="text-center py-2 px-4 text-green-400">Unlimited</td>
              </tr>
              <tr className="border-b border-indigo-400/10">
                <td className="py-2 px-4 text-indigo-100">Priority Support</td>
                <td className="text-center py-2 px-4 text-red-400">✗</td>
                <td className="text-center py-2 px-4 text-green-400">✓</td>
                <td className="text-center py-2 px-4 text-green-400">24/7</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-indigo-100">Analytics</td>
                <td className="text-center py-2 px-4 text-indigo-300">Basic</td>
                <td className="text-center py-2 px-4 text-indigo-300">Advanced</td>
                <td className="text-center py-2 px-4 text-green-400">Full</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
