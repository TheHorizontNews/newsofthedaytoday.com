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
  
  const [categories, setCategories] = useState([]);
  
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
        console.log('Loaded categories:', categoriesData);
      } else {
        console.warn('No categories received from API');
        setMessage('Не вдалося завантажити категорії. Зверніться до адміністратора.');
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setMessage('Помилка завантаження категорій. Перевірте підключення.');
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Розмір файлу не повинен перевищувати 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Будь ласка, оберіть файл зображення');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        handleInputChange('featured_image', event.target.result);
        setMessage('');
      };
      reader.onerror = () => {
        setMessage('Помилка завантаження файлу');
      };
      reader.readAsDataURL(file);
    }
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

  const insertImage = () => {
    // Create a file input for image upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setMessage('Розмір файлу не повинен перевищувати 5MB');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const altText = prompt('Введіть alt-текст для зображення:', file.name.replace(/\.[^/.]+$/, ''));
          const imageMarkdown = `![${altText || 'Зображення'}](${event.target.result})`;
          insertText(`\n\n${imageMarkdown}\n\n`);
          setMessage('');
        };
        reader.onerror = () => {
          setMessage('Помилка завантаження файлу');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const renderMarkdownPreview = (content) => {
    if (!content) return 'Немає контенту для відображення.';
    
    let html = content
      // Convert headers
      .replace(/^### (.+$)/gm, '<h3 class="text-xl font-semibold mb-3 mt-6">$1</h3>')
      .replace(/^## (.+$)/gm, '<h2 class="text-2xl font-semibold mb-4 mt-8">$1</h2>')
      .replace(/^# (.+$)/gm, '<h1 class="text-3xl font-bold mb-4 mt-8">$1</h1>')
      // Convert bold and italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Convert links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')
      // Convert images
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded-lg border" />')
      // Convert lists
      .replace(/^- (.+$)/gm, '<li class="ml-4">$1</li>')
      // Convert quotes
      .replace(/^> (.+$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700">$1</blockquote>')
      // Convert line breaks
      .replace(/\n/g, '<br>');
    
    return html;
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
    { label: '📷', action: insertImage, title: 'Вставити зображення' },
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
                    Використовуйте Markdown: **жирний**, *курсив*, # заголовок, [посилання](URL). Кнопка 📷 для додавання зображень.
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Заглавне фото
                  </label>
                  <div className="space-y-3">
                    {formData.featured_image && (
                      <div className="relative">
                        <img 
                          src={formData.featured_image} 
                          alt="Заглавне фото статті" 
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleInputChange('featured_image', '')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                          title="Видалити фото"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="featured-image-upload"
                      />
                      <label
                        htmlFor="featured-image-upload"
                        className="flex-1 px-3 py-2 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
                      >
                        {formData.featured_image ? 'Замінити фото' : 'Завантажити фото'}
                      </label>
                    </div>
                  </div>
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
              
              {formData.featured_image && (
                <div className="mb-6">
                  <img 
                    src={formData.featured_image} 
                    alt="Заглавне фото статті" 
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                </div>
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
              <div 
                className="font-serif leading-relaxed"
                dangerouslySetInnerHTML={{__html: renderMarkdownPreview(formData.content)}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkingArticleEditor;