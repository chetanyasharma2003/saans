import React from 'react';

interface ProgressCardProps {
  title: string;
  percentage: number;
  icon: string;
  color: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ title, percentage, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <span className="text-3xl">{icon}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <p className="text-right mt-2 font-semibold" style={{ color }}>
        {percentage}%
      </p>
    </div>
  );
};

export default ProgressCard;
