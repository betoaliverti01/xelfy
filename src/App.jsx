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
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

import SplashScreen from '@/components/ui/SplashScreen';

const { Pages, Layout } = pagesConfig;
const DashboardPage = Pages['Dashboard'];

const LayoutWrapper = ({ children, currentPageName }) => (
  <ErrorBoundary>
    {Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>}
  </ErrorBoundary>
);

// Protected Route Component
const ProtectedRoute = ({ children, pageName }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <SplashScreen message="Verificando acesso..." />;
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
    return <SplashScreen message="Iniciando xelfy..." />;
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

      {/* Public Storefront Routes */}
      <Route
        path="/Storefront"
        element={
          <PublicStoreRoute pageName="Storefront">
            {React.createElement(Pages['Storefront'])}
          </PublicStoreRoute>
        }
      />
      <Route
        path="/storefront"
        element={
          <PublicStoreRoute pageName="Storefront">
            {React.createElement(Pages['Storefront'])}
          </PublicStoreRoute>
        }
      />

      {/* Common Portuguese Route Aliases */}
      <Route path="/pedidos" element={<ProtectedRoute pageName="Orders"><Pages.Orders /></ProtectedRoute>} />
      <Route path="/catalogo" element={<ProtectedRoute pageName="Catalog"><Pages.Catalog /></ProtectedRoute>} />
      <Route path="/financeiro" element={<ProtectedRoute pageName="Financial"><Pages.Financial /></ProtectedRoute>} />
      <Route path="/agenda" element={<ProtectedRoute pageName="Schedule"><Pages.Schedule /></ProtectedRoute>} />
      <Route path="/clientes" element={<ProtectedRoute pageName="ClientsList"><Pages.ClientsList /></ProtectedRoute>} />
      <Route path="/estoque" element={<ProtectedRoute pageName="InventoryList"><Pages.InventoryList /></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute pageName="AppCustomization"><Pages.AppCustomization /></ProtectedRoute>} />
      <Route path="/contas" element={<ProtectedRoute pageName="AccountList"><Pages.AccountList /></ProtectedRoute>} />

      {/* All Other Registered Pages (Protected with both original and lowercase paths) */}
      {Object.entries(Pages).map(([path, Page]) => {
        if (['LandingPage', 'Login', 'Register', 'Dashboard', 'Storefront'].includes(path)) {
          return null;
        }

        const lowerPath = path.toLowerCase();
        return (
          <React.Fragment key={path}>
            <Route
              path={`/${path}`}
              element={
                <ProtectedRoute pageName={path}>
                  <Page />
                </ProtectedRoute>
              }
            />
            {lowerPath !== path && (
              <Route
                path={`/${lowerPath}`}
                element={
                  <ProtectedRoute pageName={path}>
                    <Page />
                  </ProtectedRoute>
                }
              />
            )}
          </React.Fragment>
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
