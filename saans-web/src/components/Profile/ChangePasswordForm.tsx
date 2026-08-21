import React from 'react';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordFormProps {
  isOpen: boolean;
  passwordForm: PasswordFormData;
  loading: boolean;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  isOpen,
  passwordForm,
  loading,
  onPasswordChange,
  onSubmit,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800/95 to-slate-700/95 border border-indigo-400/40 rounded-3xl p-8 max-w-md w-full backdrop-blur-xl shadow-2xl animate-in fade-in scale-95 transition duration-300">
        <h3 className="text-2xl font-bold text-white mb-6">Change Password</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-indigo-200 font-semibold mb-2 block text-sm">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={onPasswordChange}
              className="w-full px-4 py-2 bg-slate-700/50 border border-indigo-400/30 rounded-lg text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="text-indigo-200 font-semibold mb-2 block text-sm">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={onPasswordChange}
              className="w-full px-4 py-2 bg-slate-700/50 border border-indigo-400/30 rounded-lg text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="text-indigo-200 font-semibold mb-2 block text-sm">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={onPasswordChange}
              className="w-full px-4 py-2 bg-slate-700/50 border border-indigo-400/30 rounded-lg text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300"
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2 rounded-lg transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700/60 hover:bg-slate-700/80 text-indigo-200 font-bold py-2 rounded-lg transition duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
