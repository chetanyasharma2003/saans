import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../redux/slices/authSlice';
import axios from 'axios';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = email.length === 0 || emailRegex.test(email);
  const isPasswordValid = password.length >= 6;
  const isFormValid = email.length > 0 && emailRegex.test(email) && password.length >= 6;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      // Backend returns { success, message, token, user }
      localStorage.setItem('accessToken', response.data.token);
      dispatch(setUser(response.data.user));
      dispatch(setToken(response.data.token));
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message;
      const message = typeof errorMsg === 'string' ? errorMsg : (errorMsg?.message || 'Login failed');
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
          {/* Left side - Hero section (Hidden on Mobile) */}
          <div className="text-white z-10 hidden lg:flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Welcome Back to Your Wellness
              </h1>
              <p className="text-xl text-teal-100 mb-8 leading-relaxed">
                Continue your journey towards mental health and emotional well-being.
              </p>

              <div className="space-y-4 mb-12">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">💭</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Talk Anytime</h3>
                    <p className="text-teal-100">Access your AI counselor 24/7 for support</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-3xl">👥</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Expert Therapists</h3>
                    <p className="text-teal-100">Connect with licensed professionals anytime</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📈</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Track Progress</h3>
                    <p className="text-teal-100">Monitor your mental health journey daily</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/20">
                <p className="text-sm text-teal-100 italic">
                  "The mind is everything. What you think you become." — Lord Buddha
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="z-10">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="text-6xl mb-4 animate-pulse">🧠</div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome to SAANS</h2>
                <p className="text-teal-100">Mental Health for Everyone</p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded-xl backdrop-blur-sm flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Email Field with Validation */}
                <div>
                  <label className="block text-sm font-semibold text-teal-100 mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched({ ...touched, email: true })}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition backdrop-blur-sm ${
                        touched.email && email.length > 0
                          ? isEmailValid
                            ? 'border-green-400/50 focus:border-green-400 focus:ring-green-400/30'
                            : 'border-red-400/50 focus:border-red-400 focus:ring-red-400/30'
                          : 'border-white/20 focus:border-teal-400 focus:ring-teal-400/30'
                      }`}
                      required
                    />
                    {touched.email && email.length > 0 && (
                      <div className="absolute right-4 top-3">
                        {isEmailValid ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                    )}
                  </div>
                  {touched.email && email.length > 0 && !isEmailValid && (
                    <p className="text-red-400 text-xs mt-2">Please enter a valid email address</p>
                  )}
                </div>

                {/* Password Field with Toggle & Validation */}
                <div>
                  <label className="block text-sm font-semibold text-teal-100 mb-3">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched({ ...touched, password: true })}
                      placeholder="Enter your password"
                      className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition backdrop-blur-sm ${
                        touched.password && password.length > 0
                          ? isPasswordValid
                            ? 'border-green-400/50 focus:border-green-400 focus:ring-green-400/30'
                            : 'border-red-400/50 focus:border-red-400 focus:ring-red-400/30'
                          : 'border-white/20 focus:border-teal-400 focus:ring-teal-400/30'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3 text-white/60 hover:text-white transition"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {touched.password && password.length > 0 && !isPasswordValid && (
                    <p className="text-red-400 text-xs mt-2">Password must be at least 6 characters</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className={`w-full mt-6 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-900 font-bold py-3 rounded-xl transition transform shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                    isLoading || !isFormValid
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-105'
                  }`}
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  )}
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-white/70 mb-4">
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="text-teal-300 font-bold hover:text-teal-200 transition"
                  >
                    Create one now
                  </button>
                </p>
                <button className="text-sm text-teal-300/80 hover:text-teal-300 transition">
                  Forgot password?
                </button>
              </div>

              {/* Security note */}
              <p className="text-xs text-white/50 text-center mt-4">
                🔒 Your login is encrypted and secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
