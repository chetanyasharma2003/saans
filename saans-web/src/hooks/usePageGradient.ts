import { useLocation } from 'react-router-dom';

interface GradientConfig {
  [key: string]: string;
}

/**
 * Hook to get gradient background based on current page
 * Returns appropriate gradient class for the current route
 */
export const usePageGradient = () => {
  const location = useLocation();

  const gradientMap: GradientConfig = {
    '/dashboard': 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    '/ai-counselor': 'bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900',
    '/therapist': 'bg-gradient-to-br from-blue-900 via-slate-900 to-cyan-900',
    '/mood-tracker': 'bg-gradient-to-br from-green-900 via-slate-900 to-emerald-900',
    '/community': 'bg-gradient-to-br from-orange-900 via-slate-900 to-yellow-900',
    '/crisis': 'bg-gradient-to-br from-red-900 via-slate-900 to-rose-900',
    '/profile': 'bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900',
    '/login': 'bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900',
    '/register': 'bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900',
  };

  return gradientMap[location.pathname] || 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900';
};

export default usePageGradient;
