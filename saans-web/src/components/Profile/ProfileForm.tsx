import React from 'react';

interface ProfileFormProps {
  formData: {
    name: string;
    email: string;
    bio: string;
    phone: string;
    city: string;
  };
  loading: boolean;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  loading,
  onFieldChange,
  onSave,
  onCancel,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-indigo-400/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white mb-6">Edit Your Profile</h3>

        <div>
          <label className="text-indigo-200 font-semibold mb-3 block">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onFieldChange}
            className="w-full px-4 py-3 bg-slate-700/50 border border-indigo-400/30 rounded-xl text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300 placeholder-slate-400"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="text-indigo-200 font-semibold mb-3 block">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onFieldChange}
            className="w-full px-4 py-3 bg-slate-700/50 border border-indigo-400/30 rounded-xl text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300 placeholder-slate-400"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="text-indigo-200 font-semibold mb-3 block">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={onFieldChange}
            rows={4}
            className="w-full px-4 py-3 bg-slate-700/50 border border-indigo-400/30 rounded-xl text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300 resize-none placeholder-slate-400"
            placeholder="Tell us about yourself"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-indigo-200 font-semibold mb-3 block">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onFieldChange}
              className="w-full px-4 py-3 bg-slate-700/50 border border-indigo-400/30 rounded-xl text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300 placeholder-slate-400"
              placeholder="Enter your phone"
            />
          </div>

          <div>
            <label className="text-indigo-200 font-semibold mb-3 block">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={onFieldChange}
              className="w-full px-4 py-3 bg-slate-700/50 border border-indigo-400/30 rounded-xl text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition duration-300 placeholder-slate-400"
              placeholder="Enter your city"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            onClick={onSave}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-700/60 hover:bg-slate-700/80 text-indigo-200 font-bold py-3 rounded-xl transition duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
