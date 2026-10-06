import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import NavigationTracker from '@/lib/NavigationTracker';
import PWAInstallPrompt from '@/components/ui/PWAInstallPrompt';
import { pagesConfig } from './pages.config';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

const { Pages, Layout } = pagesConfig;
const DashboardPage = Pages['Dashboard'];

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Protected Route Component
const ProtectedRoute = ({ children, pageName }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-800 border-t-[#2d91a8] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <LayoutWrapper currentPageName={pageName}>{children}</LayoutWrapper>;
};

// Public Route (Accessible by everyone)
const PublicStoreRoute = ({ children, pageName }) => {
  return <LayoutWrapper currentPageName={pageName}>{children}</LayoutWrapper>;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-800 border-t-[#2d91a8] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root Route: If logged in -> Dashboard, else -> Landing Page */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <LayoutWrapper currentPageName="Dashboard">
              <DashboardPage />
            </LayoutWrapper>
          ) : (
            <LandingPage />
          )
        }
      />

      {/* Landing Page */}
      <Route path="/landing" element={<LandingPage />} />

      {/* Authentication Pages */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Explicit Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute pageName="Dashboard">
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Public Storefront Route */}
      <Route
        path="/Storefront"
        element={
          <PublicStoreRoute pageName="Storefront">
            {React.createElement(Pages['Storefront'])}
          </PublicStoreRoute>
        }
      />

      {/* All Other Registered Pages (Protected) */}
      {Object.entries(Pages).map(([path, Page]) => {
        if (['LandingPage', 'Login', 'Register', 'Dashboard', 'Storefront'].includes(path)) {
          return null;
        }

        return (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <ProtectedRoute pageName={path}>
                <Page />
              </ProtectedRoute>
            }
          />
        );
      })}

      {/* 404 Route */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AppRoutes />
          <PWAInstallPrompt />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}
