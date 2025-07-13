import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { articlesAPI } from '../services/api';

const Articles = () => {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    category_id: ''
  });
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  // Fetch articles
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['articles', filters, page],
    queryFn: () => articlesAPI.getArticles({ 
      ...filters, 
      skip: page * 20, 
      limit: 20 
    }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: articlesAPI.deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries(['articles']);
    },
  });

  // Publish/Unpublish mutations
  const publishMutation = useMutation({
    mutationFn: articlesAPI.publishArticle,
    onSuccess: () => {
      queryClient.invalidateQueries(['articles']);
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: articlesAPI.unpublishArticle,
    onSuccess: () => {
      queryClient.invalidateQueries(['articles']);
    },
  });

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert('Failed to delete article');
      }
    }
  };

  const handlePublishToggle = async (article) => {
    try {
      if (article.status === 'published') {
        await unpublishMutation.mutateAsync(article.id);
      } else {
        await publishMutation.mutateAsync(article.id);
      }
    } catch (error) {
      alert('Failed to update article status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      published: 'status-badge status-published',
      draft: 'status-badge status-draft',
      archived: 'status-badge status-archived'
    };
    return badges[status] || badges.draft;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error loading articles</div>
        <button 
          onClick={() => queryClient.invalidateQueries(['articles'])}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Articles</h1>
            <p className="page-subtitle">Manage your news articles</p>
          </div>
          <Link to="/admin/articles/new" className="btn btn-primary">
            ➕ New Article
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Search</label>
              <input
                type="text"
                placeholder="Search articles..."
                className="form-input"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', search: '', category_id: '' })}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Status</th>
                <th>Views</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles && articles.length > 0 ? (
                articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {article.title}
                        </div>
                        {article.subtitle && (
                          <div className="text-sm text-gray-500">
                            {article.subtitle}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">
                      {article.author?.profile?.name || article.author?.username}
                    </td>
                    <td className="text-sm text-gray-600">
                      {article.category?.name}
                    </td>
                    <td>
                      <span className={getStatusBadge(article.status)}>
                        {article.status}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">
                      {article.views.toLocaleString()}
                    </td>
                    <td className="text-sm text-gray-600">
                      {format(new Date(article.created_at), 'MMM d, yyyy')}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/admin/articles/edit/${article.id}`}
                          className="btn btn-sm btn-secondary"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handlePublishToggle(article)}
                          className={`btn btn-sm ${
                            article.status === 'published' 
                              ? 'btn-secondary' 
                              : 'btn-success'
                          }`}
                          disabled={publishMutation.isLoading || unpublishMutation.isLoading}
                        >
                          {article.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          className="btn btn-sm btn-danger"
                          disabled={deleteMutation.isLoading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No articles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Articles;