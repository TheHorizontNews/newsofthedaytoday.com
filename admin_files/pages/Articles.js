import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadArticles();
  }, [filters]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.category !== 'all') params.append('category', filters.category);
      params.append('sort_by', filters.sortBy);
      params.append('sort_order', filters.sortOrder);

      const response = await api.get(`/api/articles?${params.toString()}`);
      setArticles(response.data.articles || response.data || []);
      setError('');
    } catch (err) {
      console.error('Error loading articles:', err);
      setError('Failed to load articles');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      await api.delete(`/api/articles/${id}`);
      setArticles(articles.filter(article => article.id !== id));
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('Failed to delete article');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/api/articles/${id}`, { status: newStatus });
      setArticles(articles.map(article => 
        article.id === id ? { ...article, status: newStatus } : article
      ));
    } catch (err) {
      console.error('Error updating article status:', err);
      alert('Failed to update article status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600">Manage your articles and content</p>
        </div>
        <Link
          to="/admin/articles/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="all">All Categories</option>
              <option value="news">News</option>
              <option value="politics">Politics</option>
              <option value="technology">Technology</option>
              <option value="sports">Sports</option>
            </select>
          </div>

          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="created_at">Date Created</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
              <option value="views">Views</option>
            </select>
          </div>

          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.sortOrder}
              onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No articles found</p>
          <Link
            to="/admin/articles/new"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create your first article
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {article.featured_image && (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-4"
                            src={article.featured_image}
                            alt={article.title}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {article.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            By {article.author || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {article.category || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={article.status}
                        onChange={(e) => handleStatusChange(article.id, e.target.value)}
                        className="text-xs border-none bg-transparent focus:outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                        <option value="published">Published</option>
                      </select>
                      {getStatusBadge(article.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(article.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.views || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/articles/edit/${article.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Articles;