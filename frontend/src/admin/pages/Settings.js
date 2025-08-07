import React, { useState, useEffect } from 'react';
import { ukTranslations } from '../i18n/uk';
import SEOSettings from '../components/SEOSettings';

const t = ukTranslations;
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState('');

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      site_name: 'Edge Chronicle',
      site_description: 'Breaking news and analysis from around the world',
      site_url: 'https://edgechronicle.com',
      admin_email: 'admin@edgechronicle.com',
      posts_per_page: 20,
      allow_comments: true,
      moderation_required: true,
      seo_enabled: true,
      analytics_enabled: true,
      maintenance_mode: false
    }
  });

  const onSubmit = async (data) => {
    setSaveStatus('saving');
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1000);
  };

  const tabs = [
    { id: 'general', name: t.settings, icon: '⚙️' },
    { id: 'content', name: 'Зміст', icon: '📝' },
    { id: 'seo', name: 'SEO', icon: '🔍' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'integrations', name: 'Integrations', icon: '🔗' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your Edge Chronicle website</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-content p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                      activeTab === tab.id ? 'bg-red-50 text-red-600 border-r-2 border-red-600' : 'text-gray-700'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="card">
              <div className="card-header">
                <div className="flex justify-between items-center">
                  <h3 className="card-title">
                    {tabs.find(tab => tab.id === activeTab)?.name} Settings
                  </h3>
                  <button
                    type="submit"
                    disabled={saveStatus === 'saving'}
                    className="btn btn-primary"
                  >
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="card-content">
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div className="form-group">
                      <label className="form-label">Site Name</label>
                      <input
                        type="text"
                        className="form-input"
                        {...register('site_name')}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Site Description</label>
                      <textarea
                        className="form-input"
                        rows="3"
                        {...register('site_description')}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Site URL</label>
                      <input
                        type="url"
                        className="form-input"
                        {...register('site_url')}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Admin Email</label>
                      <input
                        type="email"
                        className="form-input"
                        {...register('admin_email')}
                      />
                    </div>

                    <div className="form-group">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox mr-2"
                          {...register('maintenance_mode')}
                        />
                        <span className="text-sm">Maintenance Mode</span>
                      </label>
                      <div className="text-xs text-gray-500 mt-1">
                        Enable to show maintenance page to visitors
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'content' && (
                  <div className="space-y-6">
                    <div className="form-group">
                      <label className="form-label">Posts Per Page</label>
                      <select className="form-input" {...register('posts_per_page')}>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                        <option value="25">25</option>
                        <option value="30">30</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox mr-2"
                          {...register('allow_comments')}
                        />
                        <span className="text-sm">Allow Comments</span>
                      </label>
                    </div>

                    <div className="form-group">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox mr-2"
                          {...register('moderation_required')}
                        />
                        <span className="text-sm">Require Comment Moderation</span>
                      </label>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Content Guidelines</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Images should be optimized for web (under 1MB)</li>
                        <li>• Use descriptive alt text for accessibility</li>
                        <li>• Articles should be at least 300 words for SEO</li>
                        <li>• Include relevant tags and categories</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'seo' && (
                  <SEOSettings />
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">Security Status</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-red-800">SSL Certificate</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-red-800">Two-Factor Authentication</span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Recommended</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-red-800">Password Policy</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Strong</span>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Session Timeout (minutes)</label>
                      <select className="form-input">
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="480">8 hours</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Failed Login Attempts</label>
                      <select className="form-input">
                        <option value="3">3 attempts</option>
                        <option value="5">5 attempts</option>
                        <option value="10">10 attempts</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'integrations' && (
                  <div className="space-y-6">
                    <div className="form-group">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox mr-2"
                          {...register('analytics_enabled')}
                        />
                        <span className="text-sm">Enable Analytics</span>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Available Integrations</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Google Analytics</span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Connected</span>
                            </div>
                            <div className="text-sm text-gray-600">Track website visitors and behavior</div>
                          </div>
                          
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Social Media</span>
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Available</span>
                            </div>
                            <div className="text-sm text-gray-600">Auto-post to social platforms</div>
                          </div>
                          
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Email Newsletter</span>
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Available</span>
                            </div>
                            <div className="text-sm text-gray-600">Send newsletters to subscribers</div>
                          </div>
                          
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">CDN</span>
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Recommended</span>
                            </div>
                            <div className="text-sm text-gray-600">Faster content delivery worldwide</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;