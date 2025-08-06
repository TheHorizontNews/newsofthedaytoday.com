import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ukTranslations } from '../i18n/uk';
import api from '../services/api';

const t = ukTranslations;

const WorkingArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    category_id: '',
    tags: '',
    featured_image: '',
    status: 'draft',
    seo_title: '',
    seo_description: ''
  });
  
  const [categories, setCategories] = useState([
    { id: '8f8284e0-dc51-4788-93c0-a56f3fcd3f1c', name: 'ШІ та Обчислення' },
    { id: 'tech-id-1', name: 'Технології' },
    { id: 'med-id-1', name: 'Медицина' },
    { id: 'space-id-1', name: 'Космос і Фізика' },
    { id: 'bio-id-1', name: 'Біологія' },
    { id: 'env-id-1', name: 'Довкілля' }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadArticle();
    }
  }, [id, isEditing]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories/admin');
      const categoriesData = response.data || response || [];
      if (categoriesData.length > 0) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.log('Using fallback categories');
    }
  };

  const loadArticle = async () => {
    if (!isEditing) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/articles/${id}`);
      const article = response.data || response;
      
      setFormData({
        title: article.title || '',
        subtitle: article.subtitle || '',
        content: article.content || '',
        category_id: article.category?.id || article.category_id || '',
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
        featured_image: article.featured_image || '',
        status: article.status || 'draft',
        seo_title: article.seo_title || '',
        seo_description: article.seo_description || ''
      });
    } catch (error) {
      console.error('Error loading article:', error);
      setMessage('Помилка завантаження статті, але ви можете створити нову');
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
    if (!formData.title.trim() || !formData.content.trim()) {
      setMessage('Заголовок і зміст є обов\'язковими полями');
      return;
    }

    if (!formData.category_id) {
      setMessage('Оберіть категорію для статті');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      
      const articleData = {
        title: formData.title,
        subtitle: formData.subtitle || '',
        content: formData.content,
        category_id: formData.category_id,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        featured_image: formData.featured_image || '',
        status: status,
        seo_title: formData.seo_title || '',
        seo_description: formData.seo_description || ''
      };
      
      let response;
      if (isEditing) {
        response = await api.put(`/articles/${id}`, articleData);
        setMessage('Статтю успішно оновлено!');
      } else {
        response = await api.post('/articles/', articleData);
        setMessage('Статтю успішно створено!');
        
        // Redirect to edit page after creation
        if (response.data?.id) {
          setTimeout(() => {
            navigate(`/admin/articles/edit/${response.data.id}`);
          }, 1500);
        }
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving article:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Помилка збереження статті';
      setMessage(`Помилка: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const insertText = (before, after = '') => {
    const textarea = document.getElementById('content-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const newText = formData.content.substring(0, start) + before + selectedText + after + formData.content.substring(end);
    
    handleInputChange('content', newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const formatButtons = [
    { label: 'H1', action: () => insertText('# '), title: 'Заголовок 1' },
    { label: 'H2', action: () => insertText('## '), title: 'Заголовок 2' },
    { label: 'H3', action: () => insertText('### '), title: 'Заголовок 3' },
    { label: 'B', action: () => insertText('**', '**'), title: 'Жирний' },
    { label: 'I', action: () => insertText('*', '*'), title: 'Курсив' },
    { label: 'Link', action: () => insertText('[текст](https://example.com)'), title: 'Посилання' },
    { label: 'List', action: () => insertText('\n- '), title: 'Список' },
    { label: 'Quote', action: () => insertText('\n> '), title: 'Цитата' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Редагувати статтю' : 'Створити нову статтю'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditing ? 'Внесіть зміни та збережіть' : 'Створіть нову статтю для Science Digest News'}
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/admin/articles')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              ← Назад до статей
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {showPreview ? 'Редагувати' : 'Попередній перегляд'}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('успішно') || message.includes('створено') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {!showPreview ? (
        /* Edit Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Основний контент</h3>
              
              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Заголовок статті *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Введіть заголовок статті..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  required
                />
              </div>

              {/* Subtitle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Підзаголовок
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="Введіть підзаголовок (опціонально)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Content Editor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Зміст статті *
                </label>
                
                {/* Simple formatting toolbar */}
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex flex-wrap gap-2">
                    {formatButtons.map((btn, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={btn.action}
                        title={btn.title}
                        className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Використовуйте Markdown: **жирний**, *курсив*, # заголовок, [посилання](URL)
                  </p>
                </div>

                <textarea
                  id="content-textarea"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Введіть зміст статті... Ви можете використовувати Markdown форматування."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  rows="20"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Публікація</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Чернетка</option>
                    <option value="published">Опубліковано</option>
                    <option value="archived">Архівовано</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категорія *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Оберіть категорію</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Теги
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="технології, наука, дослідження"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">Розділіть теги комами</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 mt-6 border-t space-y-3">
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Збереження...' : 'Зберегти як чернетку'}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={saving || !formData.title.trim() || !formData.content.trim() || !formData.category_id}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Публікація...' : 'Опублікувати статтю'}
                </button>
              </div>
            </div>

            {/* SEO Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">SEO налаштування</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO заголовок
                  </label>
                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={(e) => handleInputChange('seo_title', e.target.value)}
                    placeholder="SEO заголовок для пошукових систем"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    maxLength="60"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {formData.seo_title.length}/60 символів
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO опис
                  </label>
                  <textarea
                    value={formData.seo_description}
                    onChange={(e) => handleInputChange('seo_description', e.target.value)}
                    placeholder="SEO опис для пошукових систем"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    maxLength="160"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {formData.seo_description.length}/160 символів
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <div className="bg-white rounded-lg shadow p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  {categories.find(cat => cat.id === formData.category_id)?.name || 'Без категорії'}
                </span>
                <span className="text-gray-500 text-sm">•</span>
                <span className="text-gray-500 text-sm">
                  {new Date().toLocaleDateString('uk-UA')}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {formData.title || 'Без заголовка'}
              </h1>
              
              {formData.subtitle && (
                <p className="text-xl text-gray-600 mb-6">
                  {formData.subtitle}
                </p>
              )}
              
              {formData.tags && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {formData.tags.split(',').map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap font-serif leading-relaxed">
                {formData.content || 'Немає контенту для відображення.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkingArticleEditor;