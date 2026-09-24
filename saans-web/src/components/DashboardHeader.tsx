import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';

interface DashboardHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

export function DashboardHeader({ title, showBackButton = false }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Mood', path: '/mood-tracker' },
    { label: 'Therapist', path: '/find-therapist' },
    { label: 'Community', path: '/community' },
    { label: 'Sessions', path: '/appointments' },
    { label: 'Resources', path: '/resources' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="relative z-40 w-full bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-b border-purple-500/20 shadow-2xl">
      <div className="w-full">
        {/* Top Section - Logo + Profile */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between min-h-fit">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0 hover:scale-110 transition-transform"
            >
              S
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-white leading-tight cursor-pointer hover:text-purple-300 transition-colors" onClick={() => navigate('/dashboard')}>SAANS</h1>
              <p className="text-xs text-purple-300 leading-tight">Mental Health</p>
            </div>
          </div>

          {/* Title (for sub-pages) */}
          {showBackButton && title && (
            <div className="flex-1 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 sm:p-2.5 rounded-lg hover:bg-purple-500/20 transition-all text-purple-300 hover:text-purple-200"
              title="Settings"
            >
              <Settings className="w-5 sm:w-6 h-5 sm:h-6" />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 hover:shadow-lg hover:scale-110 transition-all duration-300 shadow-md flex-shrink-0"
              title="Profile"
            />
          </div>
        </div>

        {/* Navigation Section - Horizontal */}
        <div className="px-4 sm:px-6 lg:px-8 pb-3 sm:pb-4 flex items-center gap-2 overflow-x-auto min-h-fit scrollbar-hide">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  active
                    ? 'bg-purple-600/40 text-white hover:bg-purple-600/60'
                    : 'text-purple-300 hover:bg-purple-500/20'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
