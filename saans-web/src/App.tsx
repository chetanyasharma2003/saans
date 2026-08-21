import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './redux/store';
import { Navbar } from './components/Navbar';
import SuspenseLoading from './components/SuspenseLoading';
import PageTransition from './components/PageTransition';
import ErrorBoundary from './components/ErrorBoundary';
import ToastProvider from './components/Toast';

// Pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const AICounselorPage = React.lazy(() => import('./pages/AICounselorPage'));
const FindTherapistPage = React.lazy(() => import('./pages/FindTherapistPage'));
const MoodTrackerPage = React.lazy(() => import('./pages/MoodTrackerPage'));
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'));
const CrisisSupportPage = React.lazy(() => import('./pages/CrisisSupportPage'));
const MyProfilePage = React.lazy(() => import('./pages/MyProfilePage'));

// Protected Route with Navbar
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
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
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
