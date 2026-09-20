import React from 'react';
import { AlertCircle, Phone, MessageSquare } from 'lucide-react';

export const SafetyHeader: React.FC = () => {
  const handleCrisisCall = () => {
    window.location.href = 'tel:988';
  };

  const handleCrisisText = () => {
    window.open('https://www.crisistextline.org/', '_blank');
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary-lighter to-accent-lighter border-b border-primary-lightest shadow-md"
      style={{
        backgroundColor: 'var(--color-primary-lightest)',
        borderBottom: '2px solid var(--color-primary)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle
            className="w-5 h-5"
            style={{ color: 'var(--color-primary)' }}
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--color-primary)' }}
            >
              Crisis Support Always Available
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Call or text for immediate help
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCrisisCall}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'var(--color-primary-light)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'var(--color-primary)';
            }}
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Call 988</span>
            <span className="sm:hidden">988</span>
          </button>

          <button
            onClick={handleCrisisText}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all border-2"
            style={{
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)',
              backgroundColor: 'white',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'var(--color-primary-lightest)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'white';
            }}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Text 741741</span>
            <span className="sm:hidden">Text</span>
          </button>
        </div>
      </div>
    </div>
  );
};
