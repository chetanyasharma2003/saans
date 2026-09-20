import React from 'react';

interface MedicationCardProps {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  sideEffects?: string[];
  onDelete?: () => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({
  name,
  dosage,
  frequency,
  startDate,
  sideEffects,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: '#2D6A6A' }}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{name}</h3>
          <p className="text-gray-600">{dosage} - {frequency}</p>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 font-semibold text-sm"
          >
            Remove
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-3">
        Started: {new Date(startDate).toLocaleDateString()}
      </p>

      {sideEffects && sideEffects.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-semibold text-gray-700 mb-2">Side Effects:</p>
          <div className="flex flex-wrap gap-2">
            {sideEffects.map((effect, index) => (
              <span
                key={index}
                className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full"
              >
                {effect}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationCard;
