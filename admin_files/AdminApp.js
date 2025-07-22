import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import ArticleEditor from './pages/ArticleEditor';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Analytics from './pages/Analytics';
import MediaLibraryPage from './pages/MediaLibraryPage';
import Settings from './pages/Settings';
import SEOAnalytics from './components/SEOAnalytics';
import TagManager from './components/TagManager';
import './Admin.css';

const AdminApp = () => {
  return (
    <AuthProvider>
      <Router basename="/admin">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="articles" element={<Articles />} />
            <Route path="articles/new" element={<ArticleEditor />} />
            <Route path="articles/edit/:id" element={<ArticleEditor />} />
            <Route path="users" element={<Users />} />
            <Route path="categories" element={<Categories />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="media" element={<MediaLibraryPage />} />
            <Route path="settings" element={<Settings />} />
            <Route path="seo/analytics" element={<SEOAnalytics />} />
            <Route path="seo/tags" element={<TagManager />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AdminApp;