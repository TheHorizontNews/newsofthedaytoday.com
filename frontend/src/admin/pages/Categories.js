import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { categoriesAPI } from '../services/api';

const Categories = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getCategories(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: categoriesAPI.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setShowCreateForm(false);
      reset();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoriesAPI.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setEditingCategory(null);
      reset();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: categoriesAPI.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });

  const handleCreate = async (data) => {
    try {
      await createMutation.mutateAsync(data);
    } catch (error) {
      alert('Failed to create category');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateMutation.mutateAsync({ id: editingCategory.id, data });
    } catch (error) {
      alert('Failed to update category');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert('Failed to delete category');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Categories</h1>
            <p className="page-subtitle">Organize your content with categories</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            ➕ Add Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories && categories.map((category) => (
          <div key={category.id} className="card">
            <div className="card-content">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {category.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="btn btn-sm btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="btn btn-sm btn-danger"
                    disabled={deleteMutation.isLoading}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {category.description && (
                <p className="text-gray-600 text-sm mb-3">
                  {category.description}
                </p>
              )}
              
              <div className="text-xs text-gray-500">
                Slug: {category.slug}
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                Created: {new Date(category.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories && categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No categories found. Create your first category to get started.
        </div>
      )}

      {/* Create Category Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Create New Category</h3>
            
            <form onSubmit={handleSubmit(handleCreate)}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Category name"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && (
                  <div className="form-error">{errors.name.message}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Category description"
                  {...register('description')}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    reset();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="btn btn-primary"
                >
                  {createMutation.isLoading ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;