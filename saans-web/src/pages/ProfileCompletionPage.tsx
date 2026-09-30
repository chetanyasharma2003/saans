import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertCircle, Eye, EyeOff, X, User, Mail, Phone, MapPin, Shield, Heart, Lock, LogOut, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface FormDataType {
  firstName: string;
  lastName: string;
  bio: string;
  profileImage: File | null;
  dateOfBirth: string;
  gender: string;
  phone: string;
  emergencyContact: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  email?: string;
  conditions?: string[];
  twoFactorEnabled?: boolean;
}

const ProfileCompletionPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<FormDataType>({
    firstName: '',
    lastName: '',
    bio: '',
    profileImage: null,
    dateOfBirth: '',
    gender: '',
    phone: '',
    emergencyContact: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    email: '',
    conditions: [],
    twoFactorEnabled: false
  });

  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const conditions = ['Anxiety', 'Depression', 'PTSD', 'Stress', 'Insomnia', 'OCD', 'Bipolar', 'Relationship Issues'];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = res.data.data;
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
        zipCode: userData.zipCode || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        bio: userData.bio || '',
        emergencyContact: userData.emergencyContact || '',
        conditions: userData.conditions || [],
        twoFactorEnabled: userData.twoFactorEnabled || false
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions?.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...(prev.conditions || []), condition]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
    }
  };

  const uploadProfileImage = async () => {
    if (!formData.profileImage) return;

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('file', formData.profileImage);

      const token = localStorage.getItem('accessToken');
      await axios.post(`${API_URL}/api/uploads/profile-picture`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploaded(true);
      setMessage({ type: 'success', text: 'Profile picture uploaded!' });
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setLoading(false);
    }
  };

  const submitProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      await axios.put(`${API_URL}/api/users/me`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio,
          phone: formData.phone,
          emergencyContact: formData.emergencyContact,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          conditions: formData.conditions
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (error: any) {
      console.error('Profile error:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-block px-4 py-2 bg-purple-600/30 border border-purple-500/50 rounded-full mb-4">
              <p className="text-purple-300 text-sm font-semibold">STEP {step} OF 4</p>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent mb-3">
              {step === 1 ? 'Personal Info' : step === 2 ? 'Contact & Address' : step === 3 ? 'Health Profile' : 'Profile Photo'}
            </h1>
            <p className="text-gray-400 text-lg">Complete your profile to unlock all features</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1 h-2 rounded-full bg-slate-700/30 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    s <= step
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : 'bg-slate-700/30'
                  }`}
                  style={{ width: s <= step ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>

          {/* Main Form Card */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-10">
            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>
                {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                {message.text}
              </div>
            )}

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-400" /> First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40 focus:border-purple-500 text-white placeholder-gray-500 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-400" /> Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40 focus:border-purple-500 text-white placeholder-gray-500 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 font-semibold">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40 focus:border-purple-500 text-white placeholder-gray-500 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 font-semibold">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40 focus:border-purple-500 text-white rounded-lg focus:outline-none transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer Not to Say</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-3 font-semibold">About You</label>
                  <textarea
                    name="bio"
                    placeholder="Tell us about yourself, your interests, and what brings you here..."
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40 focus:border-purple-500 text-white placeholder-gray-500 rounded-lg focus:outline-none transition-all resize-none"
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg">
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step 2: Contact & Address */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-3 font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-slate-800/30 border border-slate-700/50 text-gray-400 rounded-lg cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-3 font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4 text-cyan-400" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40 focus:border-purple-500 text-white placeholder-gray-500 rounded-lg focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-3 font-semibold flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" /> Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    placeholder="Jane Doe"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40 focus:border-purple-500 text-white placeholder-gray-500 rounded-lg focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-3 font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" /> Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="123 Main Street, Apt 4B"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40 focus:border-purple-500 text-white placeholder-gray-500 rounded-lg focus:outline-none transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 font-semibold">City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Mumbai"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40 focus:border-purple-500 text-white placeholder-gray-500 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 font-semibold">State</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="Maharashtra"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40 focus:border-purple-500 text-white placeholder-gray-500 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-3 font-semibold">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="400001"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40 focus:border-purple-500 text-white placeholder-gray-500 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 font-bold rounded-lg transition-all border border-slate-600">
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Health Profile */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-4 font-semibold flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" /> Health Conditions
                  </label>
                  <p className="text-gray-400 text-sm mb-4">Select conditions you're currently dealing with (optional)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {conditions.map((cond) => (
                      <button
                        key={cond}
                        onClick={() => toggleCondition(cond)}
                        className={`p-3 rounded-lg font-semibold transition-all text-sm ${
                          formData.conditions?.includes(cond)
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-purple-500'
                            : 'bg-slate-800/50 border border-slate-700/50 text-gray-300 hover:border-purple-500/50'
                        }`}>
                        {formData.conditions?.includes(cond) ? '✓ ' : ''}{cond}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/30 border border-cyan-500/30 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-white font-semibold mb-2">Two-Factor Authentication</p>
                      <p className="text-gray-400 text-sm mb-4">Add extra security to your account</p>
                      <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg text-sm font-semibold transition-all">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 font-bold rounded-lg transition-all border border-slate-600">
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Profile Picture */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-4 font-semibold flex items-center gap-2">
                    <Upload className="w-4 h-4 text-yellow-400" /> Profile Photo
                  </label>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 border-2 border-dashed border-purple-500/40 hover:border-purple-500/60 rounded-xl p-10 text-center transition-all">
                    {formData.profileImage ? (
                      <div className="space-y-4">
                        <img
                          src={URL.createObjectURL(formData.profileImage)}
                          alt="Preview"
                          className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg"
                        />
                        <p className="text-sm text-gray-400">{formData.profileImage.name}</p>
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, profileImage: null }))}
                          className="text-red-400 text-sm hover:text-red-300 transition">
                          Remove Photo
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload size={48} className="mx-auto text-purple-400 mb-3" />
                        <p className="text-gray-400 font-semibold mb-2">Drop your profile picture here</p>
                        <p className="text-gray-500 text-sm mb-6">or</p>
                        <label
                          htmlFor="profileImageInput"
                          className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-all font-semibold">
                          Choose File
                        </label>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="profileImageInput"
                    />
                  </div>
                </div>

                {formData.profileImage && !uploaded && (
                  <button
                    onClick={uploadProfileImage}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 shadow-lg">
                    {loading ? 'Uploading...' : 'Upload Photo'}
                  </button>
                )}

                {uploaded && (
                  <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-lg flex items-center gap-3">
                    <CheckCircle className="text-green-400 flex-shrink-0" />
                    <p className="text-green-300 font-semibold">Photo uploaded successfully!</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 font-bold rounded-lg transition-all border border-slate-600">
                    Back
                  </button>
                  <button
                    onClick={submitProfile}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 shadow-lg">
                    {loading ? 'Saving...' : 'Complete Profile'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 hover:border-red-500/60 text-red-400 hover:text-red-300 font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
              <LogOut className="w-5 h-5" /> Logout
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-3 bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50 text-gray-300 font-semibold rounded-lg transition-all">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionPage;
