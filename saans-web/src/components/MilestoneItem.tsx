import React from 'react';

interface MilestoneItemProps {
  title: string;
  description: string;
  date: string;
  icon?: string;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({
  title,
  description,
  date,
  icon = '🎉',
}) => {
  return (
    <div className="flex items-start mb-8 relative">
      {/* Timeline dot */}
      <div className="flex flex-col items-center mr-6">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: '#2D6A6A' }}
        />
        <div
          className="w-1 flex-1 mt-2"
          style={{
            backgroundColor: '#2D6A6A',
            minHeight: '60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-4 flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <span className="text-2xl">{icon}</span>
        </div>

        <p className="text-gray-600 text-sm mb-2">{description}</p>

        <p className="text-xs text-gray-500">
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
};

export default MilestoneItem;
