import React from 'react';

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatarColor: string;
  avatarColors: Record<string, string>;
  onEditClick: () => void;
  onAvatarColorChange: (color: string) => void;
}

const avatarColorsList = ['indigo', 'blue', 'green', 'pink', 'orange', 'purple'];

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  email,
  avatarColor,
  avatarColors,
  onEditClick,
  onAvatarColorChange,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-indigo-400/30 rounded-3xl p-8 backdrop-blur-xl text-center hover:border-indigo-400/60 transition duration-300 shadow-2xl">
      {/* Avatar */}
      <div className={`bg-gradient-to-br ${avatarColors[avatarColor as keyof typeof avatarColors]} w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl shadow-lg transform hover:scale-110 transition duration-300`}>
        👤
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
      <p className="text-indigo-300 text-sm mb-1">{email}</p>
      <p className="text-indigo-400/70 text-xs mb-6">Premium Member since Aug 2026</p>

      <div className="space-y-3">
        <button
          onClick={onEditClick}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg"
        >
          Edit Profile
        </button>
        <button className="w-full bg-slate-700/60 hover:bg-slate-700/80 text-indigo-200 font-bold py-3 rounded-xl transition duration-300">
          Change Avatar
        </button>
      </div>

      {/* Avatar Color Selector */}
      <div className="mt-6 pt-6 border-t border-indigo-400/20">
        <p className="text-indigo-300 text-xs font-semibold mb-3 uppercase">Avatar Color</p>
        <div className="grid grid-cols-3 gap-2">
          {avatarColorsList.map((color) => (
            <button
              key={color}
              onClick={() => onAvatarColorChange(color)}
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[color as keyof typeof avatarColors]} border-2 transition ${
                avatarColor === color ? 'border-white shadow-lg' : 'border-transparent'
              }`}
            ></button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-indigo-400/20 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-indigo-300 text-sm">Sessions</span>
          <span className="text-white font-bold">12</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-indigo-300 text-sm">Streak</span>
          <span className="text-white font-bold">5 days</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-indigo-300 text-sm">Level</span>
          <span className="text-white font-bold">Pro 🏆</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
