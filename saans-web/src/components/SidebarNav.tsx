import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarSection {
  title: string;
  icon: string;
  items: {
    path: string;
    label: string;
    icon: string;
    badge?: number;
  }[];
}

export function SidebarNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Main', 'Support', 'Wellness']);
  const [collapsed, setCollapsed] = useState(false);

  const sections: SidebarSection[] = [
    {
      title: 'Main',
      icon: '🏠',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      ],
    },
    {
      title: 'Support',
      icon: '💪',
      items: [
        { path: '/ai-counselor', label: 'AI Counselor', icon: '🤖' },
        { path: '/therapist', label: 'Find Therapist', icon: '👨‍⚕️', badge: 3 },
        { path: '/crisis', label: 'Crisis Support', icon: '🆘' },
      ],
    },
    {
      title: 'Wellness',
      icon: '🧘',
      items: [
        { path: '/mood-tracker', label: 'Mood Tracker', icon: '📈' },
        { path: '/community', label: 'Community', icon: '👥', badge: 2 },
      ],
    },
    {
      title: 'Account',
      icon: '👤',
      items: [
        { path: '/profile', label: 'My Profile', icon: '⚙️' },
      ],
    },
  ];

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title)
        ? prev.filter((s) => s !== title)
        : [...prev, title]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-r border-white/10 min-h-screen sticky top-0 transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}
    >
      {/* Header */}
      <div className="border-b border-white/10 p-4 flex items-center justify-between group">
        {!collapsed && (
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition" onClick={() => navigate('/dashboard')}>
            <span className="text-2xl transform group-hover:scale-110 transition duration-300">🧠</span>
            <div>
              <span className="font-bold text-white text-sm block">SAANS</span>
              <span className="text-xs text-teal-400 leading-none">Mental Health</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-2 transition transform hover:scale-110"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
        {sections.map((section) => (
          <div key={section.title}>
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.title)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition group ${
                collapsed ? 'justify-center' : ''
              }`}
              title={collapsed ? section.title : undefined}
            >
              <span className="text-lg flex-shrink-0 transform group-hover:scale-110 transition">{section.icon}</span>
              {!collapsed && (
                <>
                  <span className="text-sm font-semibold flex-1 text-left">{section.title}</span>
                  <span
                    className={`text-xs transition-transform duration-300 ${
                      expandedSections.includes(section.title) ? 'rotate-90' : ''
                    }`}
                  >
                    ▶
                  </span>
                </>
              )}
            </button>

            {/* Section Items */}
            {expandedSections.includes(section.title) && !collapsed && (
              <div className="ml-2 space-y-1 animation-in fade-in slide-in-from-left-2">
                {section.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm group ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0 transform group-hover:scale-110 transition">{item.icon}</span>
                    <span className="text-left flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-xs bg-red-500/80 text-white px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="border-t border-white/10 p-4 space-y-2 bg-gradient-to-t from-slate-900/30 to-transparent">
        <button
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition text-sm group ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Settings' : undefined}
        >
          <span className="text-lg transform group-hover:rotate-90 transition duration-300">⚙️</span>
          {!collapsed && <span className="group-hover:text-teal-300 transition">Settings</span>}
        </button>
        <button
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition text-sm group ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Help' : undefined}
        >
          <span className="text-lg transform group-hover:scale-110 transition">❓</span>
          {!collapsed && <span className="group-hover:text-teal-300 transition">Help & Support</span>}
        </button>
      </div>
    </aside>
  );
}

export default SidebarNav;
