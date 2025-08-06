import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import WorkingArticleEditor from './pages/WorkingArticleEditor';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Analytics from './pages/Analytics';
import MediaLibrary from './pages/MediaLibraryPage';
import Settings from './pages/Settings';
import SEOAnalytics from './components/SEOAnalytics';
import TagManager from './components/TagManager';
import './Admin.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="login" replace />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
};

function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="admin-app">
          <Routes>
            <Route path="login" element={<Login />} />
            <Route path="" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="articles" element={
              <ProtectedRoute>
                <Articles />
              </ProtectedRoute>
            } />
            <Route path="articles/new" element={
              <ProtectedRoute>
                <WorkingArticleEditor />
              </ProtectedRoute>
            } />
            <Route path="articles/edit/:id" element={
              <ProtectedRoute>
                <WorkingArticleEditor />
              </ProtectedRoute>
            } />
            <Route path="users" element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } />
            <Route path="categories" element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            } />
            <Route path="analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="media" element={
              <ProtectedRoute>
                <MediaLibrary />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="seo" element={
              <ProtectedRoute>
                <SEOAnalytics />
              </ProtectedRoute>
            } />
            <Route path="seo/analytics" element={
              <ProtectedRoute>
                <SEOAnalytics />
              </ProtectedRoute>
            } />
            <Route path="seo/tags" element={
              <ProtectedRoute>
                <TagManager />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default AdminApp;