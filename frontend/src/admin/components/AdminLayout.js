import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ukTranslations } from '../i18n/uk';
const t = ukTranslations;

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [seoMenuOpen, setSeoMenuOpen] = useState(false);

  const navigation = [
    { name: t.dashboard, href: '/admin/dashboard', icon: '📊' },
    { name: t.articles, href: '/admin/articles', icon: '📝' },
    { name: t.media, href: '/admin/media', icon: '🖼️' },
    { name: t.users, href: '/admin/users', icon: '👥' },
    { name: t.categories, href: '/admin/categories', icon: '📁' },
    { name: t.analytics, href: '/admin/analytics', icon: '📈' },
    { 
      name: 'SEO', 
      icon: '🔍',
      submenu: [
        { name: 'SEO Analytics', href: '/admin/seo/analytics', icon: '📊' },
        { name: 'Tag Manager', href: '/admin/seo/tags', icon: '🏷️' },
      ]
    },
    { name: t.settings, href: '/admin/settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActiveSubmenu = (submenu) => {
    return submenu.some(item => location.pathname === item.href);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="admin-sidebar w-64 flex-shrink-0">
        <div className="sidebar-logo">
          <h1 className="text-xl font-bold text-white">Edge Chronicle</h1>
          <p className="text-sm text-gray-300">Admin Panel</p>
        </div>
        
        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => setSeoMenuOpen(!seoMenuOpen)}
                    className={`nav-item w-full text-left ${isActiveSubmenu(item.submenu) ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.name}
                    <span className="ml-auto">
                      {seoMenuOpen ? '▼' : '▶'}
                    </span>
                  </button>
                  {seoMenuOpen && (
                    <div className="ml-4">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className={`nav-item text-sm ${location.pathname === subItem.href ? 'active' : ''}`}
                        >
                          <span className="nav-icon">{subItem.icon}</span>
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.href}
                  className={`nav-item ${location.pathname === item.href ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="admin-header">
          <h1 className="header-title">
            {navigation.find(item => item.href === location.pathname)?.name || 'Admin Panel'}
          </h1>
          
          <div className="header-user">
            <span className="text-sm text-gray-600">Welcome, {user?.profile?.name || user?.username}</span>
            <div className="user-menu relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="user-avatar"
              >
                {user?.profile?.name?.[0] || user?.username?.[0] || 'A'}
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">{user?.profile?.name || user?.username}</div>
                    <div className="text-gray-500">{user?.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;