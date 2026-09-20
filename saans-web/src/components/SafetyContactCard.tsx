import React from 'react';

interface SafetyContactCardProps {
  name: string;
  phone?: string;
  email?: string;
  relationship?: string;
  contactType: string;
  onRemove?: () => void;
}

const SafetyContactCard: React.FC<SafetyContactCardProps> = ({
  name,
  phone,
  email,
  relationship,
  contactType,
  onRemove,
}) => {
  const getContactTypeIcon = (type: string) => {
    switch (type) {
      case 'SOCIAL':
        return '👥';
      case 'PROFESSIONAL':
        return '👨‍⚕️';
      case 'CRISIS_RESOURCE':
        return '🆘';
      default:
        return '📞';
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow p-4 border-l-4"
      style={{ borderLeftColor: '#2D6A6A' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-3xl mr-3">{getContactTypeIcon(contactType)}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            {relationship && (
              <p className="text-sm text-gray-600">{relationship}</p>
            )}
          </div>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 font-semibold text-sm"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        {phone && (
          <p className="text-gray-700">
            <span className="font-semibold">Phone:</span> {phone}
          </p>
        )}
        {email && (
          <p className="text-gray-700">
            <span className="font-semibold">Email:</span> {email}
          </p>
        )}
      </div>

      {phone && (
        <button
          className="w-full mt-4 px-3 py-2 rounded font-semibold text-white transition"
          style={{ backgroundColor: '#2D6A6A' }}
        >
          📞 Call Now
        </button>
      )}
    </div>
  );
};

export default SafetyContactCard;
