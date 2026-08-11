import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { RootState } from '../redux/store';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/ai-counselor', label: 'AI Counselor', icon: '🤖' },
    { path: '/therapist', label: 'Find Therapist', icon: '👨‍⚕️' },
    { path: '/mood-tracker', label: 'Mood Tracker', icon: '📊' },
    { path: '/community', label: 'Community', icon: '👥' },
    { path: '/crisis', label: 'Crisis Support', icon: '🆘' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const notifications = [
    { id: 1, message: 'Your appointment with Dr. Sarah is tomorrow at 3 PM', time: '2 hours ago', read: false, type: 'appointment' },
    { id: 2, message: 'New community post in Mental Wellness group', time: '4 hours ago', read: false, type: 'community' },
    { id: 3, message: 'Your mood trend is improving!', time: '1 day ago', read: true, type: 'mood' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search logic here
      console.log('Searching for:', searchQuery);
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className={`bg-gradient-to-r from-slate-800/80 to-slate-800/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-2xl' : 'shadow-lg'}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-2xl font-bold text-white hover:opacity-80 transition flex-shrink-0"
          >
            <span className="text-3xl">🧠</span>
            <div className="hidden sm:block">
              <p className="text-lg">SAANS</p>
              <p className="text-xs text-teal-300 leading-none">Mental Health</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-2 rounded-lg font-semibold transition flex items-center gap-2 text-sm ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden xl:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-white/10 border border-white/20 rounded-lg px-3 py-2 hover:bg-white/15 transition flex-1 max-w-xs"
          >
            <span className="text-white/50 mr-2">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search therapists, groups..."
              className="bg-transparent text-white placeholder-white/50 outline-none w-full text-sm"
            />
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationOpen(!notificationOpen);
                  setUserMenuOpen(false);
                }}
                className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                🔔
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-slate-900 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden z-50 animation-in fade-in slide-in-from-top-2">
                  <div className="bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border-b border-white/10 px-4 py-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-bold text-lg">Notifications</h3>
                      <span className="text-xs bg-teal-500/30 text-teal-300 px-2 py-1 rounded-full font-semibold">
                        {notifications.filter((n) => !n.read).length} New
                      </span>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`px-4 py-3 border-b border-white/5 hover:bg-white/10 transition cursor-pointer group ${
                            !notif.read ? 'bg-white/5' : ''
                          }`}
                        >
                          <div className="flex gap-3 items-start">
                            <div className="text-lg flex-shrink-0 mt-0.5">
                              {notif.type === 'appointment' && '📅'}
                              {notif.type === 'community' && '👥'}
                              {notif.type === 'mood' && '📊'}
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium group-hover:text-teal-300 transition">{notif.message}</p>
                              <p className="text-white/50 text-xs mt-1">{notif.time}</p>
                            </div>
                            {!notif.read && <div className="w-2 h-2 bg-teal-400 rounded-full flex-shrink-0 mt-1.5"></div>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-white/50">
                        <span className="text-3xl mb-2 block">🔔</span>
                        No notifications
                      </div>
                    )}
                  </div>
                  <div className="border-t border-white/10 px-4 py-2 bg-white/5">
                    <button className="text-xs text-teal-400 hover:text-teal-300 font-semibold w-full text-center py-2 transition hover:bg-white/5 rounded">
                      View All Notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setNotificationOpen(false);
                }}
                className="flex items-center gap-2 hover:bg-white/10 rounded-lg p-2 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                  {getInitials(user?.name)}
                </div>
                <span className="hidden sm:inline text-white text-sm font-semibold max-w-[120px] truncate">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <span className="text-white/50">▼</span>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden z-50 animation-in fade-in slide-in-from-top-2">
                  <div className="bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border-b border-white/10 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(user?.name)}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{user?.name}</p>
                        <p className="text-teal-300 text-xs mt-0.5 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-white text-sm hover:bg-white/10 transition flex items-center gap-3 group"
                    >
                      <span className="text-lg">👤</span>
                      <div>
                        <p className="font-medium group-hover:text-teal-300">View Profile</p>
                        <p className="text-white/50 text-xs">Manage your information</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-white text-sm hover:bg-white/10 transition flex items-center gap-3 group"
                    >
                      <span className="text-lg">⚙️</span>
                      <div>
                        <p className="font-medium group-hover:text-teal-300">Settings</p>
                        <p className="text-white/50 text-xs">Preferences & privacy</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-white text-sm hover:bg-white/10 transition flex items-center gap-3 group"
                    >
                      <span className="text-lg">💳</span>
                      <div>
                        <p className="font-medium group-hover:text-teal-300">Billing</p>
                        <p className="text-white/50 text-xs">Subscriptions & payments</p>
                      </div>
                    </button>
                    <button
                      className="w-full text-left px-4 py-2.5 text-white text-sm hover:bg-white/10 transition flex items-center gap-3 group"
                    >
                      <span className="text-lg">📞</span>
                      <div>
                        <p className="font-medium group-hover:text-teal-300">Support</p>
                        <p className="text-white/50 text-xs">Get help anytime</p>
                      </div>
                    </button>
                  </div>
                  <div className="border-t border-white/10 px-4 py-2">
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-400 hover:text-red-300 px-4 py-2.5 rounded-lg font-semibold transition text-sm border border-red-500/20 hover:border-red-500/40"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setUserMenuOpen(false);
                setNotificationOpen(false);
              }}
              className="lg:hidden text-white text-2xl p-2 hover:bg-white/10 rounded-lg transition"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 space-y-2 pb-4 border-t border-white/10 pt-4 animation-in fade-in slide-in-from-top-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex items-center bg-white/10 border border-white/20 rounded-lg px-3 py-2 mb-3 focus-within:border-teal-400/50 transition">
              <span className="text-white/50 mr-2 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search therapists, groups..."
                className="bg-transparent text-white placeholder-white/50 outline-none w-full text-sm"
              />
            </form>

            {/* Mobile Navigation Items */}
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition flex items-center gap-3 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 mt-4">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-lg font-bold transition"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
