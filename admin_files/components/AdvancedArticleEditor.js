import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import TagInput from './TagInput';
import MediaLibrary from './MediaLibrary';
import api from '../services/api';

const AdvancedArticleEditor = ({ article, onSave, loading, isEditing }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    status: 'draft',
    featured_image: '',
    tags: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    author: '',
    publish_date: new Date().toISOString().split('T')[0]
  });
  const [categories, setCategories] = useState([]);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        category: article.category || '',
        status: article.status || 'draft',
        featured_image: article.featured_image || '',
        tags: article.tags || [],
        meta_title: article.meta_title || '',
        meta_description: article.meta_description || '',
        meta_keywords: article.meta_keywords || '',
        author: article.author || '',
        publish_date: article.publish_date ? new Date(article.publish_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    }
  }, [article]);

  useEffect(() => {
    loadCategories();
  }, []);

  // Auto-generate meta fields when title changes
  useEffect(() => {
    if (formData.title && !formData.meta_title) {
      setFormData(prev => ({
        ...prev,
        meta_title: prev.title
      }));
    }
  }, [formData.title]);

  useEffect(() => {
    if (formData.excerpt && !formData.meta_description) {
      setFormData(prev => ({
        ...prev,
        meta_description: prev.excerpt.substring(0, 155)
      }));
    }
  }, [formData.excerpt]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    }

    if (formData.excerpt.length > 300) {
      newErrors.excerpt = 'Excerpt must be less than 300 characters';
    }

    if (formData.meta_description.length > 155) {
      newErrors.meta_description = 'Meta description must be less than 155 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    const result = await onSave(formData);
    setSaving(false);

    if (result.success) {
      // Show success message or redirect
      console.log('Article saved successfully');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageSelect = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      featured_image: imageUrl
    }));
    setShowMediaLibrary(false);
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter article title..."
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending Review</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.author}
              onChange={(e) => handleInputChange('author', e.target.value)}
              placeholder="Author name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Publish Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.publish_date}
              onChange={(e) => handleInputChange('publish_date', e.target.value)}
            />
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image
          </label>
          <div className="flex items-center space-x-4">
            {formData.featured_image && (
              <img
                src={formData.featured_image}
                alt="Featured"
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowMediaLibrary(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Select Image
              </button>
              {formData.featured_image && (
                <button
                  type="button"
                  onClick={() => handleInputChange('featured_image', '')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt * ({formData.excerpt.length}/300)
          </label>
          <textarea
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.excerpt ? 'border-red-500' : 'border-gray-300'}`}
            rows={3}
            value={formData.excerpt}
            onChange={(e) => handleInputChange('excerpt', e.target.value)}
            placeholder="Brief description of the article..."
            maxLength={300}
          />
          {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <RichTextEditor
            value={formData.content}
            onChange={(content) => handleInputChange('content', content)}
            error={errors.content}
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <TagInput
            tags={formData.tags}
            onChange={(tags) => handleInputChange('tags', tags)}
          />
        </div>

        {/* SEO Metadata */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Metadata</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title ({formData.meta_title.length}/60)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.meta_title}
                onChange={(e) => handleInputChange('meta_title', e.target.value)}
                placeholder="SEO title for search engines..."
                maxLength={60}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description ({formData.meta_description.length}/155)
              </label>
              <textarea
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.meta_description ? 'border-red-500' : 'border-gray-300'}`}
                rows={2}
                value={formData.meta_description}
                onChange={(e) => handleInputChange('meta_description', e.target.value)}
                placeholder="Description for search engine results..."
                maxLength={155}
              />
              {errors.meta_description && <p className="text-red-500 text-sm mt-1">{errors.meta_description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Keywords
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.meta_keywords}
                onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
                placeholder="Comma-separated keywords..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleInputChange('status', 'draft')}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              disabled={saving}
            >
              Save as Draft
            </button>
            
            <button
              type="button"
              onClick={() => handleInputChange('status', 'published')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={saving}
            >
              {formData.status === 'published' ? 'Update & Publish' : 'Publish'}
            </button>
          </div>

          <button
            type="submit"
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : isEditing ? 'Update Article' : 'Create Article'}
          </button>
        </div>
      </form>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <MediaLibrary
          onSelect={handleImageSelect}
          onClose={() => setShowMediaLibrary(false)}
        />
      )}
    </div>
  );
};

export default AdvancedArticleEditor;