import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store, RootState } from './redux/store';
import { Navbar } from './components/Navbar';
import SuspenseLoading from './components/SuspenseLoading';
import PageTransition from './components/PageTransition';
import ErrorBoundary from './components/ErrorBoundary';
import ToastProvider from './components/Toast';

// Create a client for React Query
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

// Pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPageNew'));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardNew'));
const AICounselorPage = React.lazy(() => import('./pages/AICounselorPage'));
const FindTherapistPage = React.lazy(() => import('./pages/FindTherapistPageNew'));
const MoodTrackerPage = React.lazy(() => import('./pages/MoodTrackerPageNew'));
const CommunityPage = React.lazy(() => import('./pages/CommunityPageNew'));
const AppointmentPage = React.lazy(() => import('./pages/AppointmentsPageNew'));
const WellnessResourcesPage = React.lazy(() => import('./pages/ResourcesPageNew'));
const StoriesPage = React.lazy(() => import('./pages/StoriesPageNew'));
const CrisisSupportPage = React.lazy(() => import('./pages/CrisisSupportPageNew'));
const MyProfilePage = React.lazy(() => import('./pages/ProfilePageNew'));
const StoryDetailPage = React.lazy(() => import('./pages/StoryDetailPage'));
const GroupDetailPage = React.lazy(() => import('./pages/GroupDetailPage'));
const ResourceDetailPage = React.lazy(() => import('./pages/ResourceDetailPage'));

// Protected Route (each page has its own header)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// App Routes
function AppRoutes() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !isAuthenticated) {
      // Token exists but not in Redux (page refresh)
    }
  }, [isAuthenticated, user]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route
          path="/"
          element={
            <React.Suspense fallback={<SuspenseLoading />}>
              <PageTransition>
                <LandingPage />
              </PageTransition>
            </React.Suspense>
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              </React.Suspense>
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <RegisterPage />
                </PageTransition>
              </React.Suspense>
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <DashboardPage />
                </PageTransition>
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-counselor"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <AICounselorPage />
                </PageTransition>
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/therapist"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <FindTherapistPage />
                </PageTransition>
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mood-tracker"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <MoodTrackerPage />
                </PageTransition>
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <CommunityPage />
                </PageTransition>
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <AppointmentPage />
                </PageTransition>
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <WellnessResourcesPage />
                </PageTransition>
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stories"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <StoriesPage />
                </PageTransition>
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crisis"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <CrisisSupportPage />
                </PageTransition>
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <MyProfilePage />
                </PageTransition>
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <AdminDashboardPage />
                </PageTransition>
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/story/:id"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <StoryDetailPage />
                </PageTransition>
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/:id"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <GroupDetailPage />
                </PageTransition>
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resource/:id"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<SuspenseLoading />}>
                <PageTransition>
                  <ResourceDetailPage />
                </PageTransition>
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
