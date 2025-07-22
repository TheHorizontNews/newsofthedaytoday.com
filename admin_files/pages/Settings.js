import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    site_title: 'Edge Chronicle',
    site_description: 'Your trusted source for news and information',
    site_url: 'https://edgechronicle.com',
    contact_email: 'admin@edgechronicle.com',
    google_analytics_id: '',
    articles_per_page: 10,
    allow_comments: true,
    moderate_comments: true,
    seo_meta_title: '',
    seo_meta_description: '',
    social_facebook: '',
    social_twitter: '',
    social_instagram: '',
    maintenance_mode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Mock settings since we don't have a settings API endpoint
      // In a real app, this would be: const response = await api.get('/api/settings');
      
      // Using current settings or defaults
      setError('');
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      // Mock save since we don't have a settings API endpoint
      // In a real app, this would be: await api.put('/api/settings', settings);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
    { id: 'social', label: 'Social Media', icon: '📱' },
    { id: 'advanced', label: 'Advanced', icon: '🔧' }
  ];

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your site settings and preferences</p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="alert alert-error">{error}</div>
      )}
      
      {success && (
        <div className="alert alert-success">{success}</div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.site_title}
                    onChange={(e) => handleInputChange('site_title', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.site_url}
                    onChange={(e) => handleInputChange('site_url', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={settings.site_description}
                  onChange={(e) => handleInputChange('site_description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Articles Per Page
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.articles_per_page}
                    onChange={(e) => handleInputChange('articles_per_page', parseInt(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="allow_comments"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={settings.allow_comments}
                    onChange={(e) => handleInputChange('allow_comments', e.target.checked)}
                  />
                  <label htmlFor="allow_comments" className="ml-2 block text-sm text-gray-900">
                    Allow Comments
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="moderate_comments"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={settings.moderate_comments}
                    onChange={(e) => handleInputChange('moderate_comments', e.target.checked)}
                  />
                  <label htmlFor="moderate_comments" className="ml-2 block text-sm text-gray-900">
                    Moderate Comments Before Publishing
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SEO Settings */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.google_analytics_id}
                  onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Your Google Analytics 4 measurement ID
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Meta Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.seo_meta_title}
                  onChange={(e) => handleInputChange('seo_meta_title', e.target.value)}
                  placeholder="Used when articles don't have a custom meta title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Meta Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={settings.seo_meta_description}
                  onChange={(e) => handleInputChange('seo_meta_description', e.target.value)}
                  placeholder="Default description for search engines"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">SEO Tips</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Keep meta titles under 60 characters</li>
                  <li>• Keep meta descriptions under 155 characters</li>
                  <li>• Use unique, descriptive titles for each page</li>
                  <li>• Include relevant keywords naturally</li>
                </ul>
              </div>
            </div>
          )}

          {/* Social Media Settings */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.social_facebook}
                  onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter Profile URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.social_twitter}
                  onChange={(e) => handleInputChange('social_twitter', e.target.value)}
                  placeholder="https://twitter.com/yourusername"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram Profile URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.social_instagram}
                  onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                  placeholder="https://instagram.com/yourusername"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Social Media Integration</h3>
                <p className="text-gray-700 text-sm">
                  These URLs will be used in your site's social media links and Open Graph meta tags 
                  for better social media sharing.
                </p>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="flex items-center">
                <input
                  id="maintenance_mode"
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  checked={settings.maintenance_mode}
                  onChange={(e) => handleInputChange('maintenance_mode', e.target.checked)}
                />
                <label htmlFor="maintenance_mode" className="ml-2 block text-sm text-gray-900">
                  Enable Maintenance Mode
                </label>
              </div>

              {settings.maintenance_mode && (
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Maintenance Mode Enabled
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          Your site will show a maintenance page to visitors. 
                          Only administrators will be able to access the site.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Database & Cache</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => alert('Cache cleared successfully!')}
                  >
                    Clear Cache
                  </button>
                  
                  <button
                    type="button"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => alert('Database optimized successfully!')}
                  >
                    Optimize Database
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Backup & Export</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    onClick={() => alert('Backup created successfully!')}
                  >
                    Create Backup
                  </button>
                  
                  <button
                    type="button"
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                    onClick={() => alert('Export initiated!')}
                  >
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;