import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ukTranslations } from '../i18n/uk';
import api from '../services/api';

const t = ukTranslations;

const SimpleArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    category_id: '',
    tags: [],
    featured_image: '',
    status: 'draft',
    seo_title: '',
    seo_description: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadArticle();
    }
  }, [id, isEditing]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories/admin');
      setCategories(response.data || response || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback categories
      setCategories([
        { id: '1', name: 'Технології' },
        { id: '2', name: 'Медицина' },
        { id: '3', name: 'Космос' },
        { id: '4', name: 'Біологія' }
      ]);
    }
  };

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/articles/${id}`);
      const article = response.data || response;
      
      setFormData({
        title: article.title || '',
        subtitle: article.subtitle || '',
        content: article.content || '',
        category_id: article.category?.id || '',
        tags: article.tags || [],
        featured_image: article.featured_image || '',
        status: article.status || 'draft',
        seo_title: article.seo_title || '',
        seo_description: article.seo_description || ''
      });
    } catch (error) {
      console.error('Error loading article:', error);
      setMessage('Помилка завантаження статті');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (status = formData.status) => {
    try {
      setSaving(true);
      setMessage('');
      
      const articleData = {
        ...formData,
        status: status
      };
      
      let response;
      if (isEditing) {
        response = await api.put(`/articles/${id}`, articleData);
      } else {
        response = await api.post('/articles/', articleData);
      }
      
      setMessage('Статтю збережено успішно!');
      
      if (!isEditing && response.data?.id) {
        navigate(`/admin/articles/edit/${response.data.id}`);
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving article:', error);
      setMessage('Помилка збереження статті');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    handleSave('published');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="loading">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          {isEditing ? t.edit_article : t.create_article}
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/admin/articles')}
            className="btn-secondary"
          >
            ← Назад до статей
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('успішно') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {/* Article Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={(e) => e.preventDefault()}>
          
          {/* Title */}
          <div className="form-group">
            <label className="form-label">{t.article_title} *</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Введіть заголовок статті..."
              required
            />
          </div>

          {/* Subtitle */}
          <div className="form-group">
            <label className="form-label">{t.article_subtitle}</label>
            <input
              type="text"
              className="form-input"
              value={formData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder="Введіть підзаголовок..."
            />
          </div>

          {/* Content */}
          <div className="form-group">
            <label className="form-label">{t.article_content} *</label>
            <textarea
              className="form-input"
              rows="15"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Введіть зміст статті..."
              required
            />
          </div>

          {/* Category and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">{t.category} *</label>
              <select
                className="form-input"
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                required
              >
                <option value="">Оберіть категорію</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t.status}</label>
              <select
                className="form-input"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="draft">Чернетка</option>
                <option value="published">Опубліковано</option>
                <option value="archived">Архівовано</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">{t.tags}</label>
            <input
              type="text"
              className="form-input"
              value={formData.tags.join(', ')}
              onChange={(e) => handleInputChange('tags', e.target.value.split(', ').filter(tag => tag.trim()))}
              placeholder="технології, наука, дослідження (через кому)"
            />
          </div>

          {/* SEO Section */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">SEO Налаштування</h3>
            
            <div className="form-group">
              <label className="form-label">{t.seo_title}</label>
              <input
                type="text"
                className="form-input"
                value={formData.seo_title}
                onChange={(e) => handleInputChange('seo_title', e.target.value)}
                placeholder="SEO заголовок для пошукових систем..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.seo_description}</label>
              <textarea
                className="form-input"
                rows="3"
                value={formData.seo_description}
                onChange={(e) => handleInputChange('seo_description', e.target.value)}
                placeholder="SEO опис для пошукових систем..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <div className="text-sm text-gray-500">
              * Обов'язкові поля
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="btn-secondary"
              >
                {saving ? 'Збереження...' : 'Зберегти як чернетку'}
              </button>
              
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving || !formData.title.trim() || !formData.content.trim()}
                className="btn-primary"
              >
                {saving ? 'Публікація...' : 'Опублікувати'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SimpleArticleEditor;