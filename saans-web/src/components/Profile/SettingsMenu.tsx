import React, { useState } from 'react';

interface SettingsMenuProps {
  activeSettingsTab: 'security' | 'privacy' | 'notifications';
  onTabChange: (tab: 'security' | 'privacy' | 'notifications') => void;
  profileSettings: {
    profileVisibility: string;
    showActivity: boolean;
    allowMessagesFromStrangers: boolean;
    dataCollection: boolean;
  };
  twoFAEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  onPasswordChange: () => void;
  on2FAChange: () => void;
  onProfileSettingsChange: (key: string, value: string | boolean) => void;
  onEmailNotificationsChange: (value: boolean) => void;
  onPushNotificationsChange: (value: boolean) => void;
  onDeleteAccount: () => void;
}

const settingsTabs = [
  { id: 'security' as const, label: 'Security', icon: '🔒' },
  { id: 'privacy' as const, label: 'Privacy', icon: '👁️' },
  { id: 'notifications' as const, label: 'Notifications', icon: '🔔' },
];

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  activeSettingsTab,
  onTabChange,
  profileSettings,
  twoFAEnabled,
  emailNotifications,
  pushNotifications,
  onPasswordChange,
  on2FAChange,
  onProfileSettingsChange,
  onEmailNotificationsChange,
  onPushNotificationsChange,
  onDeleteAccount,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-indigo-400/30 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Settings Sub-tabs */}
      <div className="flex gap-1 bg-slate-700/50 border-b border-indigo-400/20 p-2 overflow-x-auto">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-5 py-2 rounded-lg font-semibold transition duration-300 whitespace-nowrap flex items-center gap-2 text-sm ${
              activeSettingsTab === tab.id ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-8">
        {/* Security Settings */}
        {activeSettingsTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-8">Security Settings</h3>

            {/* Password Change */}
            <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-start hover:border-indigo-400/40 transition duration-300">
              <div>
                <p className="text-white font-bold text-lg">Change Password</p>
                <p className="text-indigo-300 text-sm mt-2">Update your password regularly for better security</p>
              </div>
              <button
                onClick={onPasswordChange}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition duration-300 transform hover:scale-105 whitespace-nowrap"
              >
                Change
              </button>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-start hover:border-indigo-400/40 transition duration-300">
              <div>
                <p className="text-white font-bold text-lg">Two-Factor Authentication</p>
                <p className="text-indigo-300 text-sm mt-2">Add an extra layer of security to your account</p>
                {twoFAEnabled && <p className="text-green-400 text-sm mt-1 font-semibold">✓ Enabled</p>}
              </div>
              <button
                onClick={on2FAChange}
                className={`px-6 py-2 rounded-lg transition duration-300 transform hover:scale-105 whitespace-nowrap font-semibold ${
                  twoFAEnabled
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {twoFAEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>

            {/* Login Sessions */}
            <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 hover:border-indigo-400/40 transition duration-300">
              <p className="text-white font-bold text-lg mb-4">Active Sessions</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-indigo-400/20">
                  <div>
                    <p className="text-indigo-200 font-semibold">Current Session</p>
                    <p className="text-indigo-400 text-sm">macOS Safari</p>
                  </div>
                  <span className="text-green-400 text-sm font-bold">Active Now</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-indigo-400/20">
                  <div>
                    <p className="text-indigo-200 font-semibold">Mobile Session</p>
                    <p className="text-indigo-400 text-sm">iPhone Safari</p>
                  </div>
                  <button className="text-red-400 hover:text-red-300 text-sm font-semibold">Logout</button>
                </div>
              </div>
            </div>

            {/* Security Score */}
            <div className="bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-400/40 rounded-xl p-6">
              <p className="text-indigo-200 font-semibold mb-3">Security Score</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-slate-700/50 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-full w-5/6"></div>
                </div>
                <span className="text-white font-bold text-lg">83/100</span>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        {activeSettingsTab === 'privacy' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-8">Privacy Settings</h3>

            <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
              <div>
                <p className="text-white font-bold">Profile Visibility</p>
                <p className="text-indigo-300 text-sm mt-1">Who can see your profile</p>
              </div>
              <select
                value={profileSettings.profileVisibility}
                onChange={(e) => onProfileSettingsChange('profileVisibility', e.target.value)}
                className="bg-slate-700/50 border border-indigo-400/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-400"
              >
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
              <div>
                <p className="text-white font-bold">Show Activity Status</p>
                <p className="text-indigo-300 text-sm mt-1">Others can see when you're online</p>
              </div>
              <input
                type="checkbox"
                checked={profileSettings.showActivity}
                onChange={(e) => onProfileSettingsChange('showActivity', e.target.checked)}
                className="w-6 h-6 cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
              <div>
                <p className="text-white font-bold">Allow Messages from Strangers</p>
                <p className="text-indigo-300 text-sm mt-1">Control who can message you</p>
              </div>
              <input
                type="checkbox"
                checked={profileSettings.allowMessagesFromStrangers}
                onChange={(e) => onProfileSettingsChange('allowMessagesFromStrangers', e.target.checked)}
                className="w-6 h-6 cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
              <div>
                <p className="text-white font-bold">Data Collection</p>
                <p className="text-indigo-300 text-sm mt-1">Help us improve by sharing usage data</p>
              </div>
              <input
                type="checkbox"
                checked={profileSettings.dataCollection}
                onChange={(e) => onProfileSettingsChange('dataCollection', e.target.checked)}
                className="w-6 h-6 cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="bg-gradient-to-br from-red-600/20 to-rose-600/20 border border-red-400/40 rounded-xl p-6 mt-8">
              <p className="text-red-200 font-semibold mb-3">Danger Zone</p>
              <p className="text-red-100 text-sm mb-4">Permanently delete your account and all associated data</p>
              <button
                onClick={onDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition duration-300 font-semibold"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeSettingsTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-8">Notification Settings</h3>

            <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
              <div>
                <p className="text-white font-bold">Email Notifications</p>
                <p className="text-indigo-300 text-sm mt-1">Get updates about your sessions and progress</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => onEmailNotificationsChange(e.target.checked)}
                className="w-6 h-6 cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
              <div>
                <p className="text-white font-bold">Push Notifications</p>
                <p className="text-indigo-300 text-sm mt-1">Get real-time alerts on your device</p>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => onPushNotificationsChange(e.target.checked)}
                className="w-6 h-6 cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
              <div>
                <p className="text-white font-bold">Session Reminders</p>
                <p className="text-indigo-300 text-sm mt-1">Reminders for your scheduled therapy sessions</p>
              </div>
              <input type="checkbox" defaultChecked className="w-6 h-6 cursor-pointer accent-indigo-600" />
            </div>

            <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
              <div>
                <p className="text-white font-bold">Mood Check-in</p>
                <p className="text-indigo-300 text-sm mt-1">Daily mood tracking reminders</p>
              </div>
              <input type="checkbox" defaultChecked className="w-6 h-6 cursor-pointer accent-indigo-600" />
            </div>

            <div className="bg-slate-700/30 border border-indigo-400/20 rounded-xl p-6 flex justify-between items-center hover:border-indigo-400/40 transition duration-300">
              <div>
                <p className="text-white font-bold">Community Updates</p>
                <p className="text-indigo-300 text-sm mt-1">News and updates from the community</p>
              </div>
              <input type="checkbox" className="w-6 h-6 cursor-pointer accent-indigo-600" />
            </div>

            <button className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition duration-300 transform hover:scale-105">
              Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsMenu;
