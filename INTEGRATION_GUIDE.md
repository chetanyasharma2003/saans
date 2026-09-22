# 🔗 INTEGRATION GUIDE

**Complete guide to integrating all 7 production pages into SAANS**

---

## 1️⃣ ROUTER SETUP

### Update your main router file (e.g., `src/App.tsx` or `src/router.tsx`):

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import all integrated pages
import { DashboardPageIntegrated } from './pages/DashboardPage.integrated';
import { FindTherapistPageIntegrated } from './pages/FindTherapistPage.integrated';
import { MoodTrackerPageIntegrated } from './pages/MoodTrackerPage.integrated';
import { CommunityPageIntegrated } from './pages/CommunityPage.integrated';
import { AppointmentPageIntegrated } from './pages/AppointmentPage.integrated';
import { WellnessResourcesPageIntegrated } from './pages/WellnessResourcesPage.integrated';
import { StoriesPageIntegrated } from './pages/StoriesPage.integrated';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPageIntegrated />} />
        <Route path="/" element={<DashboardPageIntegrated />} />

        {/* Therapist Discovery */}
        <Route path="/therapists" element={<FindTherapistPageIntegrated />} />
        <Route path="/find-therapist" element={<FindTherapistPageIntegrated />} />

        {/* Mood Tracking */}
        <Route path="/mood" element={<MoodTrackerPageIntegrated />} />
        <Route path="/mood-tracker" element={<MoodTrackerPageIntegrated />} />

        {/* Community */}
        <Route path="/community" element={<CommunityPageIntegrated />} />

        {/* Appointments */}
        <Route path="/appointments" element={<AppointmentPageIntegrated />} />

        {/* Wellness Resources */}
        <Route path="/resources" element={<WellnessResourcesPageIntegrated />} />
        <Route path="/wellness" element={<WellnessResourcesPageIntegrated />} />

        {/* Success Stories */}
        <Route path="/stories" element={<StoriesPageIntegrated />} />
        <Route path="/success-stories" element={<StoriesPageIntegrated />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 2️⃣ NAVIGATION MENU UPDATE

### Update your navigation/sidebar component:

```typescript
const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    path: '/dashboard',
  },
  {
    id: 'therapists',
    label: 'Find Therapist',
    icon: '🧑‍⚕️',
    path: '/therapists',
  },
  {
    id: 'mood',
    label: 'Mood Tracker',
    icon: '😊',
    path: '/mood',
  },
  {
    id: 'community',
    label: 'Community',
    icon: '👥',
    path: '/community',
  },
  {
    id: 'appointments',
    label: 'Appointments',
    icon: '📅',
    path: '/appointments',
  },
  {
    id: 'resources',
    label: 'Wellness Resources',
    icon: '📚',
    path: '/resources',
  },
  {
    id: 'stories',
    label: 'Success Stories',
    icon: '⭐',
    path: '/stories',
  },
];
```

---

## 3️⃣ API ENDPOINTS NEEDED

### Each page requires specific backend endpoints:

#### Dashboard Page
```
GET /api/appointments/next      - Get next appointment
GET /api/mood/latest            - Get today's mood
GET /api/mood/stats             - Get mood statistics
GET /api/activity/recent        - Get recent activity
```

#### Find Therapist Page
```
GET /api/therapists             - Get all therapists (with filters)
GET /api/therapists/recommended - Get recommended therapists
GET /api/specialties            - Get all specialties
GET /api/languages              - Get available languages
```

#### Mood Tracker Page
```
POST /api/mood                  - Create mood entry
GET /api/mood                   - Get mood entries
GET /api/mood/stats             - Get mood statistics
GET /api/mood/trend             - Get mood trend
```

#### Community Page
```
GET /api/posts                  - Get community posts
POST /api/posts                 - Create post
POST /api/posts/:id/like        - Like/unlike post
GET /api/groups                 - Get support groups
POST /api/groups/:id/join       - Join group
```

#### Appointment Page
```
GET /api/appointments           - Get all appointments
GET /api/appointments/upcoming  - Get upcoming appointments
PATCH /api/appointments/:id     - Reschedule appointment
DELETE /api/appointments/:id    - Cancel appointment
```

#### Wellness Resources Page
```
GET /api/resources              - Get all resources
GET /api/resources/search       - Search resources
POST /api/resources/:id/like    - Like resource (optional)
```

#### Success Stories Page
```
GET /api/stories                - Get all stories
GET /api/stories/:id            - Get single story
POST /api/stories               - Submit new story (optional)
```

---

## 4️⃣ ENVIRONMENT VARIABLES

Create/update `.env` file:

```env
# API Configuration
VITE_API_BASE_URL=https://api.saans.com
VITE_API_VERSION=v1

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=false
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true

# External Services
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ANALYTICS_ID=your-analytics-id
```

---

## 5️⃣ REACT QUERY CONFIGURATION

### Update your main app file with proper React Query setup:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourRoutesHere />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## 6️⃣ ERROR BOUNDARY SETUP (Optional)

### Wrap pages with error boundary for safety:

```typescript
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}

// In your routes:
<ErrorBoundary>
  <DashboardPageIntegrated />
</ErrorBoundary>
```

---

## 7️⃣ TESTING CHECKLIST

Before going live, test:

### Page Loading
- [ ] Dashboard loads with real data
- [ ] Find Therapist page filters work
- [ ] Mood Tracker can log mood
- [ ] Community posts display
- [ ] Appointments show correctly
- [ ] Resources filter properly
- [ ] Stories load with author info

### API Integration
- [ ] All API calls succeed
- [ ] Error messages display
- [ ] Loading states work
- [ ] Empty states show
- [ ] Pagination works (if enabled)
- [ ] Search/filter works
- [ ] Sorting works

### Error Scenarios
- [ ] Network error handling
- [ ] API timeout handling
- [ ] Invalid response handling
- [ ] Missing data handling
- [ ] User feedback shown

### Performance
- [ ] Pages load quickly
- [ ] No console errors
- [ ] Memory usage normal
- [ ] Smooth scrolling
- [ ] Responsive on mobile
- [ ] Works on tablet
- [ ] Desktop layout perfect

### User Experience
- [ ] Touch targets ≥44px
- [ ] Hover states visible
- [ ] Loading animations smooth
- [ ] Buttons respond instantly
- [ ] Forms validate properly
- [ ] Success messages show
- [ ] Error messages clear

---

## 8️⃣ MIGRATION FROM OLD PAGES

If you have existing non-integrated pages:

### Step 1: Keep Old Routes Working
```typescript
// Keep both old and new routes temporarily
<Route path="/dashboard-v1" element={<OldDashboard />} />
<Route path="/dashboard" element={<DashboardPageIntegrated />} />
```

### Step 2: Redirect Users
```typescript
// Add redirect in navigation
const shouldRedirect = userPreference === 'new-ui';
if (shouldRedirect) navigate('/dashboard');
```

### Step 3: Monitor Errors
- Track errors in both versions
- Compare performance
- Gather user feedback

### Step 4: Complete Migration
- Once stable, remove old routes
- Update all links
- Update mobile navigation

---

## 9️⃣ DEPLOYMENT COMMANDS

### Development
```bash
npm run dev
```

### Building
```bash
npm run build
npm run preview
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Full Pre-Deployment
```bash
npm run build && npm run type-check && npm run lint
```

---

## 🔟 MONITORING POST-LAUNCH

### Track These Metrics
- Page load time
- API response time
- Error rate per page
- User engagement (analytics)
- Mobile vs desktop usage
- Feature adoption rate
- User feedback/reviews

### Setup Alerts For
- Error rate > 1%
- Page load > 3 seconds
- API latency > 500ms
- Server errors (5xx)
- High memory usage

### Example Monitoring Code
```typescript
// In your main App.tsx
useEffect(() => {
  // Page view tracking
  console.log('Page loaded:', window.location.pathname);
  
  // Performance metrics
  if (window.performance) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log('Page load time:', pageLoadTime);
  }
}, []);
```

---

## 1️⃣1️⃣ TROUBLESHOOTING

### Common Issues:

#### "Hook X is not found"
- Check `src/hooks/index.ts` exports
- Verify hook is implemented
- Run `npm install` to update deps

#### "Component styling is broken"
- Check Tailwind CSS is configured
- Verify `tailwind.config.js` exists
- Run `npm run build` to rebuild styles

#### "API calls failing"
- Check API base URL in `.env`
- Verify CORS is enabled
- Check network tab in DevTools
- Verify API endpoints match

#### "TypeScript errors"
- Run `npm run type-check`
- Check type definitions
- Run `npm install @types/xyz`

#### "Build failing"
- Check console for errors
- Clear `node_modules` and reinstall
- Check for circular dependencies
- Verify all imports are correct

---

## 1️⃣2️⃣ SUPPORT RESOURCES

### Documentation
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

### Design System
- Check `design-system/index.ts` for available components
- Review colors in `design-system/colors.ts`
- See typography variants in `design-system/typography.ts`

### API Hooks
- All hooks are in `src/hooks/`
- Review each hook's TypeScript types
- Check example usage in integrated pages

---

## 🎯 FINAL CHECKLIST

Before marking as complete:

```
✅ All 7 pages imported correctly
✅ Routes setup in main app
✅ Navigation menu updated
✅ API endpoints configured
✅ Environment variables set
✅ React Query configured
✅ Error boundaries added (optional)
✅ All pages tested locally
✅ No console errors
✅ Responsive design verified
✅ API integration working
✅ Error scenarios handled
✅ Performance acceptable
✅ Monitoring setup
✅ Deployment ready
```

---

## 🚀 YOU'RE READY TO GO!

All 7 pages are production-ready and fully integrated with:
- ✅ Real API integration
- ✅ Complete error handling
- ✅ Professional loading states
- ✅ Responsive design
- ✅ TypeScript safety
- ✅ Best practices

**Deploy with confidence!** 🚀
