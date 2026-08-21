import React from 'react';

interface SubscriptionCardProps {
  isActive: boolean;
  subscriptionType?: string;
  daysRemaining?: number;
  price?: number;
  features?: string[];
  onViewActivity?: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  isActive,
  subscriptionType,
  daysRemaining,
  price,
  features = [],
  onViewActivity,
}) => {
  if (!isActive) {
    return (
      <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-400/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎯</div>
          <h4 className="text-2xl font-bold text-white mb-2">No Active Subscription</h4>
          <p className="text-indigo-200">Upgrade to a premium plan to unlock unlimited features and enhance your wellness journey</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 border border-green-400/40 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-8">Current Subscription</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-green-300 text-sm font-semibold mb-2 uppercase">Active Plan</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-4xl font-bold text-white">{subscriptionType}</h4>
            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
              ✓ Active
            </div>
          </div>
          <p className="text-green-200 text-lg mt-2">₹{price}/month</p>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-700/30 border border-green-400/20 rounded-lg p-4">
            <p className="text-green-300 text-sm">Days Remaining</p>
            <p className="text-white font-bold text-lg">{daysRemaining || 30} days</p>
          </div>
          <div className="bg-slate-700/30 border border-green-400/20 rounded-lg p-4">
            <p className="text-green-300 text-sm">Renewal Date</p>
            <p className="text-white font-bold text-lg">
              {new Date(Date.now() + (daysRemaining || 30) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Current Plan Features */}
      {features.length > 0 && (
        <div className="bg-slate-700/20 border border-green-400/20 rounded-xl p-6 mb-6">
          <p className="text-green-300 text-sm font-semibold mb-4 uppercase">Included Features</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-green-400 flex-shrink-0 mt-1">✓</span>
                <span className="text-green-100">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {onViewActivity && (
        <button
          onClick={onViewActivity}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition duration-300 transform hover:scale-105"
        >
          View Usage & Activity
        </button>
      )}
    </div>
  );
};

export default SubscriptionCard;
