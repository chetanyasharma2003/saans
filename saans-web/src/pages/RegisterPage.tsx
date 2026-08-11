import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../redux/slices/authSlice';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
  });

  const indianCities = [
    '🏙️ Delhi', '🌆 Mumbai', '🏘️ Bangalore', '🌃 Hyderabad', '✨ Chennai',
    '🎨 Kolkata', '🏛️ Pune', '🌉 Ahmedabad', '🏞️ Jaipur', '🌊 Surat',
    '⛪ Lucknow', '🌺 Chandigarh', '🏰 Indore', '🌳 Kochi', '🎪 Patna',
    '🎭 Visakhapatnam', '🎯 Vadodara', '🌸 Ghaziabad', '💚 Noida', '🎨 Thane',
  ];
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.city) {
      setError('Please select your city to find local therapists');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        city: formData.city,
        role: 'PATIENT',
      });

      localStorage.setItem('accessToken', response.data.accessToken);
      dispatch(setUser(response.data.user));
      dispatch(setToken(response.data.accessToken));
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error;
      const message = typeof errorMsg === 'string' ? errorMsg : (errorMsg?.message || 'Registration failed');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

      {/* Main container */}
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Hero section */}
          <div className="text-white z-10 hidden lg:block">
            <div className="mb-8">
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Start Your Mental Health Journey
              </h1>
              <p className="text-xl text-teal-100 mb-8 leading-relaxed">
                Join thousands finding peace, clarity, and wellness. Affordable therapy for everyone.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span className="text-lg">24/7 AI Counselor Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span className="text-lg">Connect with Licensed Therapists</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span className="text-lg">Affordable ₹99-499/month Plans</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-300">100M+</div>
                  <div className="text-sm text-teal-100">People We Aim to Help</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-300">₹99</div>
                  <div className="text-sm text-teal-100">Monthly Starting Price</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Registration form */}
          <div className="z-10">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="text-6xl mb-4 animate-pulse">🧠</div>
                <h2 className="text-4xl font-bold text-white mb-2">SAANS</h2>
                <p className="text-teal-100 text-lg">Mental Health for Everyone</p>
              </div>

              {/* Form */}
              <form onSubmit={handleRegister} className="space-y-5">
                {error && (
                  <div className="bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded-xl backdrop-blur-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-teal-100 mb-3">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-teal-100 mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-teal-100 mb-3">
                    📍 Your City (for local therapist recommendations)
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-sm"
                    required
                  >
                    <option value="" className="bg-slate-900">Select your city...</option>
                    {indianCities.map((city) => (
                      <option key={city} value={city.split(' ')[1]} className="bg-slate-900">
                        {city}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-teal-200 mt-1">We'll match you with therapists in your area</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-teal-100 mb-3">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-teal-100 mb-3">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-900 font-bold py-3 rounded-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isLoading ? 'Creating Your Account...' : 'Start Your Journey'}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-white/70">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-teal-300 font-bold hover:text-teal-200 transition"
                  >
                    Sign In
                  </button>
                </p>
              </div>

              {/* Privacy note */}
              <p className="text-xs text-white/50 text-center mt-4">
                Your information is encrypted and secure. We never share your data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
