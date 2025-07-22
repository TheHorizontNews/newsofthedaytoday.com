import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [seoSubmenuOpen, setSeoSubmenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const menuItems = [
    { path: '/dashboard', label: '📊 Dashboard', icon: '📊' },
    { path: '/articles', label: '📝 Articles', icon: '📝' },
    { path: '/users', label: '👥 Users', icon: '👥' },
    { path: '/categories', label: '📁 Categories', icon: '📁' },
    { path: '/analytics', label: '📈 Analytics', icon: '📈' },
    { path: '/media', label: '🖼️ Media', icon: '🖼️' },
    { path: '/settings', label: '⚙️ Settings', icon: '⚙️' }
  ];

  const seoMenuItems = [
    { path: '/seo/analytics', label: '📊 SEO Analytics', icon: '📊' },
    { path: '/seo/tags', label: '🏷️ Tag Manager', icon: '🏷️' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center">Edge Chronicle</h2>
          <p className="text-center text-gray-300 text-sm mt-2">Admin Panel</p>
        </div>
        
        <nav className="mt-8">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label.replace(/^[^\s]+ /, '')}
                </Link>
              </li>
            ))}
            
            {/* SEO Submenu */}
            <li>
              <button
                onClick={() => setSeoSubmenuOpen(!seoSubmenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <span className="flex items-center">
                  <span className="mr-3">🔍</span>
                  SEO Tools
                </span>
                <span className={`transform transition-transform ${seoSubmenuOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {seoSubmenuOpen && (
                <ul className="mt-2 ml-4 space-y-1">
                  {seoMenuItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 text-sm ${
                          location.pathname === item.path
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.label.replace(/^[^\s]+ /, '')}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 w-64 p-4 bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {location.pathname === '/dashboard' && 'Dashboard'}
                {location.pathname === '/articles' && 'Articles'}
                {location.pathname === '/users' && 'Users'}
                {location.pathname === '/categories' && 'Categories'}
                {location.pathname === '/analytics' && 'Analytics'}
                {location.pathname === '/media' && 'Media Library'}
                {location.pathname === '/settings' && 'Settings'}
                {location.pathname === '/seo/analytics' && 'SEO Analytics'}
                {location.pathname === '/seo/tags' && 'Tag Manager'}
                {location.pathname.includes('/articles/') && 'Article Editor'}
              </h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user?.username}!</span>
                <Link
                  to="/"
                  target="_blank"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Site
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;