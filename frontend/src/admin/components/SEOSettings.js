import React, { useState, useEffect } from 'react';
import { ukTranslations } from '../i18n/uk';
import api from '../services/api';

const t = ukTranslations;

const SEOSettings = () => {
  const [settings, setSettings] = useState({
    site_title: '',
    site_description: '',
    site_keywords: '',
    og_image: '',
    twitter_handle: '',
    language: 'uk',
    robots: 'index, follow',
    canonical_url: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/seo/settings');
      setSettings(response);
    } catch (error) {
      console.error('Error loading SEO settings:', error);
      setMessage('Помилка завантаження налаштувань');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      
      await api.put('/api/seo/settings', settings);
      setMessage('Налаштування збережено успішно!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      setMessage('Помилка збереження налаштувань');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <div className="loading">Завантаження налаштувань...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">SEO Налаштування</h1>
        <p className="page-subtitle">Керуйте SEO параметрами вашого сайту</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('успішно') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Site Title */}
          <div>
            <label className="form-label">{t.site_title}</label>
            <input
              type="text"
              className="form-input"
              value={settings.site_title}
              onChange={(e) => handleChange('site_title', e.target.value)}
              placeholder="Science Digest News"
            />
          </div>

          {/* Language */}
          <div>
            <label className="form-label">{t.language}</label>
            <select
              className="form-input"
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
            >
              <option value="uk">Українська</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Site Description */}
          <div className="md:col-span-2">
            <label className="form-label">{t.site_description}</label>
            <textarea
              className="form-input"
              rows="3"
              value={settings.site_description}
              onChange={(e) => handleChange('site_description', e.target.value)}
              placeholder="Останні наукові відкриття та дослідження..."
            />
          </div>

          {/* Keywords */}
          <div className="md:col-span-2">
            <label className="form-label">{t.meta_keywords}</label>
            <input
              type="text"
              className="form-input"
              value={settings.site_keywords}
              onChange={(e) => handleChange('site_keywords', e.target.value)}
              placeholder="наука, технології, медицина, дослідження"
            />
          </div>

          {/* Canonical URL */}
          <div>
            <label className="form-label">{t.canonical_url}</label>
            <input
              type="url"
              className="form-input"
              value={settings.canonical_url}
              onChange={(e) => handleChange('canonical_url', e.target.value)}
              placeholder="https://sciencedigestnews.com"
            />
          </div>

          {/* Twitter Handle */}
          <div>
            <label className="form-label">{t.twitter_handle}</label>
            <input
              type="text"
              className="form-input"
              value={settings.twitter_handle}
              onChange={(e) => handleChange('twitter_handle', e.target.value)}
              placeholder="@ScienceDigest"
            />
          </div>

          {/* OG Image */}
          <div className="md:col-span-2">
            <label className="form-label">{t.og_image}</label>
            <input
              type="url"
              className="form-input"
              value={settings.og_image}
              onChange={(e) => handleChange('og_image', e.target.value)}
              placeholder="https://sciencedigestnews.com/og-image.jpg"
            />
          </div>

          {/* Robots */}
          <div>
            <label className="form-label">Robots.txt</label>
            <select
              className="form-input"
              value={settings.robots}
              onChange={(e) => handleChange('robots', e.target.value)}
            >
              <option value="index, follow">Index, Follow</option>
              <option value="noindex, nofollow">NoIndex, NoFollow</option>
              <option value="index, nofollow">Index, NoFollow</option>
              <option value="noindex, follow">NoIndex, Follow</option>
            </select>
          </div>

        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6 pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Збереження...' : 'Зберегти налаштування'}
          </button>
        </div>
      </div>

      {/* SEO Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Попередній перегляд в Google</h3>
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="text-blue-600 text-lg font-medium cursor-pointer hover:underline">
            {settings.site_title || 'Science Digest News'}
          </div>
          <div className="text-green-700 text-sm">
            {settings.canonical_url || 'https://sciencedigestnews.com'}
          </div>
          <div className="text-gray-600 text-sm mt-1">
            {settings.site_description || 'Останні наукові відкриття та дослідження з усього світу...'}
          </div>
        </div>
      </div>

    </div>
  );
};

export default SEOSettings;