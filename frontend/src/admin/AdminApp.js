import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import ArticleEditor from './pages/ArticleEditor';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Analytics from './pages/Analytics';
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
    return <Navigate to="/admin/login" replace />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
};

function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="admin-app">
            <Routes>
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/articles" element={
                <ProtectedRoute>
                  <Articles />
                </ProtectedRoute>
              } />
              <Route path="/admin/articles/new" element={
                <ProtectedRoute>
                  <ArticleEditor />
                </ProtectedRoute>
              } />
              <Route path="/admin/articles/edit/:id" element={
                <ProtectedRoute>
                  <ArticleEditor />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default AdminApp;