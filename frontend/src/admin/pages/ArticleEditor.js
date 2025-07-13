import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { articlesAPI, categoriesAPI } from '../services/api';

const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

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
      navigate('/admin/articles');
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
      } else {
        await createMutation.mutateAsync(processedData);
      }
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Failed to save article. Please try again.');
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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          {isEditing ? 'Edit Article' : 'Create New Article'}
        </h1>
        <p className="page-subtitle">
          {isEditing ? 'Update your article content' : 'Write and publish a new article'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="card">
              <div className="card-content">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Article title"
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && (
                    <div className="form-error">{errors.title.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Subtitle</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Article subtitle"
                    {...register('subtitle')}
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Content</h3>
              </div>
              <div className="card-content">
                <div className="form-group">
                  <textarea
                    className="form-input"
                    rows="20"
                    placeholder="Write your article content here..."
                    {...register('content', { required: 'Content is required' })}
                  />
                  {errors.content && (
                    <div className="form-error">{errors.content.message}</div>
                  )}
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">SEO Settings</h3>
              </div>
              <div className="card-content">
                <div className="form-group">
                  <label className="form-label">SEO Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="SEO optimized title"
                    {...register('seo_title')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SEO Description</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="SEO meta description"
                    {...register('seo_description')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Publish Settings */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Publish</h3>
              </div>
              <div className="card-content">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    {...register('status')}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

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
              </div>
            </div>

            {/* Featured Image */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Featured Image</h3>
              </div>
              <div className="card-content">
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                    {...register('featured_image')}
                  />
                </div>
                
                {watch('featured_image') && (
                  <div className="mt-4">
                    <img
                      src={watch('featured_image')}
                      alt="Featured"
                      className="w-full h-32 object-cover rounded border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? 'Saving...' : (isEditing ? 'Update Article' : 'Create Article')}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/admin/articles')}
                className="btn btn-secondary w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArticleEditor;