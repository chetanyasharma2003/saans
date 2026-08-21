import React, { useState } from 'react';

interface CalendarPickerProps {
  onSelect: (date: string) => void;
  onClose: () => void;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({ onSelect, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const days = [];
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelect(selected.toISOString().split('T')[0]);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-white/10" data-testid="calendar-picker">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="text-white hover:text-teal-400 transition-colors"
          aria-label="Previous month"
          data-testid="calendar-prev-month"
        >
          ←
        </button>
        <h3 className="text-white font-bold" data-testid="calendar-month-display">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="text-white hover:text-teal-400 transition-colors"
          aria-label="Next month"
          data-testid="calendar-next-month"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-teal-400 text-xs font-bold">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {days.map((day, idx) => {
          const today = new Date();
          const dateToCheck = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
          const isPastDate = day && dateToCheck ? dateToCheck < new Date(today.getFullYear(), today.getMonth(), today.getDate()) : false;
          const isDisabled = !day || isPastDate;

          return (
            <button
              key={idx}
              onClick={() => day && !isPastDate && handleDateSelect(day)}
              disabled={isDisabled}
              data-testid={`calendar-day-${day || 'empty'}`}
              className={`aspect-square rounded-lg text-sm font-medium transition-all duration-200 ${
                day && !isPastDate
                  ? 'bg-teal-600/50 text-white hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-500/50 cursor-pointer'
                  : isPastDate
                  ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                  : 'bg-transparent text-transparent'
              }`}
              aria-label={day ? `${day} ${currentMonth.toLocaleString('default', { month: 'long' })}` : ''}
              aria-disabled={isDisabled}
            >
              {day}
            </button>
          );
        })}
      </div>

      <button
        onClick={onClose}
        className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
      >
        Close
      </button>
    </div>
  );
};

export default CalendarPicker;
