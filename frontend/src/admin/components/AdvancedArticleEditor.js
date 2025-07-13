import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { articlesAPI, categoriesAPI } from '../services/api';
import RichTextEditor from './RichTextEditor';
import MediaLibrary from './MediaLibrary';
import TagInput from './TagInput';
import { useAnalytics } from '../../utils/analytics';

const AdvancedArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [activeTab, setActiveTab] = useState('content');
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      subtitle: '',
      content: '',
      category_id: '',
      tags: [],
      featured_image: '',
      status: 'draft',
      seo_title: '',
      seo_description: ''
    }
  });

  const watchedContent = watch('content');
  const watchedTitle = watch('title');

  // Fetch article if editing
  const { data: article, isLoading: articleLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articlesAPI.getArticle(id),
    enabled: isEditing,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getCategories(),
  });

  // Set form values when article loads
  useEffect(() => {
    if (article) {
      setValue('title', article.title);
      setValue('subtitle', article.subtitle || '');
      setValue('content', article.content);
      setValue('category_id', article.category.id);
      setValue('tags', article.tags || []);
      setValue('featured_image', article.featured_image || '');
      setValue('status', article.status);
      setValue('seo_title', article.seo_title || '');
      setValue('seo_description', article.seo_description || '');
    }
  }, [article, setValue]);

  // Auto-save functionality
  useEffect(() => {
    if (isEditing && watchedContent && watchedTitle) {
      const autoSaveTimer = setTimeout(async () => {
        setAutoSaving(true);
        try {
          // Auto-save as draft
          const formData = watch();
          await updateMutation.mutateAsync({ 
            id, 
            data: { ...formData, status: 'draft' } 
          }, { 
            onSuccess: () => {
              setLastSaved(new Date());
              setAutoSaving(false);
            }
          });
        } catch (error) {
          setAutoSaving(false);
        }
      }, 3000); // Auto-save after 3 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [watchedContent, watchedTitle, isEditing]);

  // Create/Update mutations
  const createMutation = useMutation({
    mutationFn: articlesAPI.createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries(['articles']);
      navigate('/admin/articles');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => articlesAPI.updateArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['articles']);
      queryClient.invalidateQueries(['article', id]);
    },
  });

  const onSubmit = async (data) => {
    try {
      // Convert tags string to array
      const processedData = {
        ...data,
        tags: typeof data.tags === 'string' ? data.tags.split(',').map(tag => tag.trim()) : data.tags
      };

      if (isEditing) {
        await updateMutation.mutateAsync({ id, data: processedData });
        navigate('/admin/articles');
      } else {
        await createMutation.mutateAsync(processedData);
      }
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Failed to save article. Please try again.');
    }
  };

  const handleContentChange = (content) => {
    setValue('content', content);
  };

  const handleImageSelect = (image) => {
    setValue('featured_image', image.url);
  };

  const generateSEOFields = () => {
    const title = watch('title');
    const content = watch('content');
    
    if (title && !watch('seo_title')) {
      setValue('seo_title', title);
    }
    
    if (content && !watch('seo_description')) {
      // Extract plain text and create description
      const plainText = content.replace(/<[^>]*>/g, '').substring(0, 155);
      setValue('seo_description', plainText + '...');
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  if (isEditing && articleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'content', name: 'Content', icon: '📝' },
    { id: 'seo', name: 'SEO', icon: '🔍' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'preview', name: 'Preview', icon: '👁️' }
  ];

  return (
    <div className="advanced-article-editor">
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">
              {isEditing ? 'Edit Article' : 'Create New Article'}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>
                {isEditing ? 'Editing' : 'Creating'} article
              </span>
              {autoSaving && <span className="text-yellow-600">⚡ Auto-saving...</span>}
              {lastSaved && !autoSaving && (
                <span className="text-green-600">
                  ✓ Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="btn btn-secondary"
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <button
              onClick={() => navigate('/admin/articles')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Article Title */}
            <div className="card mb-6">
              <div className="card-content">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input text-2xl font-bold border-none outline-none focus:ring-0 p-0"
                    placeholder="Article title..."
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && (
                    <div className="form-error">{errors.title.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    className="form-input text-lg text-gray-600 border-none outline-none focus:ring-0 p-0"
                    placeholder="Article subtitle (optional)"
                    {...register('subtitle')}
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="card">
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-red-500 text-red-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="card-content min-h-96">
                {activeTab === 'content' && (
                  <div>
                    <RichTextEditor
                      value={watch('content')}
                      onChange={handleContentChange}
                      placeholder="Start writing your article..."
                    />
                  </div>
                )}

                {activeTab === 'seo' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">SEO Optimization</h3>
                      <button
                        type="button"
                        onClick={generateSEOFields}
                        className="btn btn-sm btn-secondary"
                      >
                        🤖 Auto-generate
                      </button>
                    </div>

                    <div className="form-group">
                      <label className="form-label">SEO Title</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="SEO optimized title"
                        {...register('seo_title')}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {watch('seo_title')?.length || 0}/60 characters
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">SEO Description</label>
                      <textarea
                        className="form-input"
                        rows="4"
                        placeholder="SEO meta description"
                        {...register('seo_description')}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {watch('seo_description')?.length || 0}/155 characters
                      </div>
                    </div>

                    {/* SEO Preview */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Search Preview</h4>
                      <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                        {watch('seo_title') || watch('title') || 'Article Title'}
                      </div>
                      <div className="text-green-600 text-sm">
                        edgechronicle.com/article/sample-url
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        {watch('seo_description') || 'Article description will appear here...'}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="form-group">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-input"
                        {...register('category_id', { required: 'Category is required' })}
                      >
                        <option value="">Select category</option>
                        {categories && categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.category_id && (
                        <div className="form-error">{errors.category_id.message}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tags</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="tag1, tag2, tag3"
                        {...register('tags')}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Separate tags with commas
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Publication Status</label>
                      <select
                        className="form-input"
                        {...register('status')}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'preview' && (
                  <div className="prose max-w-none">
                    <h1>{watch('title') || 'Article Title'}</h1>
                    {watch('subtitle') && (
                      <p className="text-xl text-gray-600">{watch('subtitle')}</p>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: watch('content') || 'Article content will appear here...' }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Featured Image */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Featured Image</h3>
              </div>
              <div className="card-content">
                {watch('featured_image') ? (
                  <div className="space-y-3">
                    <img
                      src={watch('featured_image')}
                      alt="Featured"
                      className="w-full h-32 object-cover rounded border"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsMediaLibraryOpen(true)}
                        className="btn btn-sm btn-secondary flex-1"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue('featured_image', '')}
                        className="btn btn-sm btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsMediaLibraryOpen(true)}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-red-400 hover:text-red-600 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📸</div>
                      <div className="text-sm">Select Featured Image</div>
                    </div>
                  </button>
                )}

                <input
                  type="url"
                  className="form-input mt-3"
                  placeholder="Or enter image URL"
                  {...register('featured_image')}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Actions</h3>
              </div>
              <div className="card-content space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? 'Saving...' : (isEditing ? 'Update Article' : 'Create Article')}
                </button>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      const formData = watch();
                      onSubmit({ ...formData, status: 'draft' });
                    }}
                    className="btn btn-secondary w-full"
                  >
                    Save as Draft
                  </button>
                )}
              </div>
            </div>

            {/* Article Stats */}
            {isEditing && article && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Article Stats</h3>
                </div>
                <div className="card-content">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium">{article.views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Updated:</span>
                      <span className="font-medium">
                        {new Date(article.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Media Library Modal */}
      <MediaLibrary
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelectImage={handleImageSelect}
      />
    </div>
  );
};

export default AdvancedArticleEditor;