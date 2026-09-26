import React, { useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle } from 'lucide-react';

const ProfileCompletionPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    profileImage: null as File | null,
    dateOfBirth: '',
    gender: '',
    phone: '',
    emergencyContact: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

      await axios.post('/api/uploads/profile-picture', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploaded(true);
      alert('Profile picture uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const submitProfile = async () => {
    try {
      setLoading(true);
      await axios.put('/api/users/profile', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Profile completed!');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Profile error:', error);
      alert('Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Complete Your Profile</h1>
        <p className="text-center text-gray-600 mb-8">Let's get to know you better</p>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 mx-1 h-2 rounded-full ${
                  s <= step ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">Step {step} of 3</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Basic Information</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="border-2 border-gray-300 px-4 py-3 rounded focus:border-blue-500 outline-none"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="border-2 border-gray-300 px-4 py-3 rounded focus:border-blue-500 outline-none"
                />
              </div>

              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="border-2 border-gray-300 px-4 py-3 rounded w-full focus:border-blue-500 outline-none"
              />

              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="border-2 border-gray-300 px-4 py-3 rounded w-full focus:border-blue-500 outline-none"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <textarea
                name="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="border-2 border-gray-300 px-4 py-3 rounded w-full focus:border-blue-500 outline-none"
              />

              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-bold transition"
              >
                Next: Contact Info
              </button>
            </div>
          )}

          {/* Step 2: Contact & Address */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Contact & Address</h2>

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="border-2 border-gray-300 px-4 py-3 rounded w-full focus:border-blue-500 outline-none"
              />

              <input
                type="text"
                name="emergencyContact"
                placeholder="Emergency Contact Name"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                className="border-2 border-gray-300 px-4 py-3 rounded w-full focus:border-blue-500 outline-none"
              />

              <input
                type="text"
                name="address"
                placeholder="Street Address"
                value={formData.address}
                onChange={handleInputChange}
                className="border-2 border-gray-300 px-4 py-3 rounded w-full focus:border-blue-500 outline-none"
              />

              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="border-2 border-gray-300 px-4 py-3 rounded focus:border-blue-500 outline-none"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="border-2 border-gray-300 px-4 py-3 rounded focus:border-blue-500 outline-none"
                />
                <input
                  type="text"
                  name="zipCode"
                  placeholder="ZIP Code"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="border-2 border-gray-300 px-4 py-3 rounded focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded font-bold transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-bold transition"
                >
                  Next: Profile Picture
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Profile Picture */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Profile Picture</h2>

              <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
                {formData.profileImage ? (
                  <div className="space-y-4">
                    <img
                      src={URL.createObjectURL(formData.profileImage)}
                      alt="Preview"
                      className="w-48 h-48 rounded-full mx-auto object-cover"
                    />
                    <p className="text-sm text-gray-600">{formData.profileImage.name}</p>
                  </div>
                ) : (
                  <div>
                    <Upload size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Drop your profile picture here</p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="profileImageInput"
                />
                <label
                  htmlFor="profileImageInput"
                  className="inline-block mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded cursor-pointer transition"
                >
                  Choose File
                </label>
              </div>

              {formData.profileImage && !uploaded && (
                <button
                  onClick={uploadProfileImage}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded font-bold transition disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Upload Picture'}
                </button>
              )}

              {uploaded && (
                <div className="bg-green-100 border-2 border-green-500 p-4 rounded flex items-center">
                  <CheckCircle className="text-green-500 mr-3" size={24} />
                  <p className="text-green-700 font-bold">Picture uploaded successfully!</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded font-bold transition"
                >
                  Back
                </button>
                <button
                  onClick={submitProfile}
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded font-bold transition disabled:opacity-50"
                >
                  {loading ? 'Completing...' : 'Complete Profile'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionPage;
