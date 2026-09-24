import { DashboardHeader } from '../components/DashboardHeader';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Settings, LogOut, Edit2, Shield } from 'lucide-react';

export function ProfilePageNew() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="relative z-10">
        <DashboardHeader title="My Profile" showBackButton={false} />

        <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl p-6 sm:p-8 text-center">
            <div className="text-7xl sm:text-8xl mb-4">👤</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Test User</h2>
            <p className="text-purple-300 text-sm sm:text-base mb-4">Member since Sep 2024</p>
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-sm sm:text-base transition-all flex items-center justify-center gap-2 mx-auto">
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          </div>

          {/* Account Info */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"><User className="w-5 h-5" /> Account Information</h3>
            {[
              { icon: Mail, label: 'Email', value: 'test@example.com' },
              { icon: MapPin, label: 'Location', value: 'India' },
              { icon: Shield, label: 'Account Status', value: 'Active' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4 sm:p-6 flex items-center gap-4">
                  <Icon className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm">{item.label}</p>
                    <p className="text-white font-bold text-sm sm:text-base">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Settings & Actions */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5" /> Settings</h3>
            <button className="w-full bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/60 rounded-lg p-4 sm:p-6 transition-all text-left flex items-center justify-between">
              <span className="text-white font-bold text-sm sm:text-base">Notification Preferences</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/60 rounded-lg p-4 sm:p-6 transition-all text-left flex items-center justify-between">
              <span className="text-white font-bold text-sm sm:text-base">Privacy Settings</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Logout */}
          <button className="w-full px-6 py-4 bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-400 font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </main>
      </div>
    </div>
  );
}

import { ChevronRight } from 'lucide-react';

export default ProfilePageNew;
