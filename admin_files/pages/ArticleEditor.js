import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdvancedArticleEditor from '../components/AdvancedArticleEditor';
import api from '../services/api';

const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      loadArticle();
    }
  }, [id, isEditing]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/articles/${id}`);
      setArticle(response.data);
      setError('');
    } catch (err) {
      console.error('Error loading article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (articleData) => {
    try {
      setLoading(true);
      
      if (isEditing) {
        const response = await api.put(`/api/articles/${id}`, articleData);
        setArticle(response.data);
      } else {
        const response = await api.post('/api/articles', articleData);
        navigate(`/admin/articles/edit/${response.data.id}`);
      }
      
      setError('');
      return { success: true };
    } catch (err) {
      console.error('Error saving article:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to save article';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing && !article) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error && isEditing && !article) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Article Not Found
          </h1>
          <button
            onClick={() => navigate('/admin/articles')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Articles
          </button>
        </div>
        <div className="alert alert-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Article' : 'Create New Article'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? `Editing: ${article?.title || 'Loading...'}` : 'Create and publish your article'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/articles')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Back to Articles
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Article Editor */}
      <div className="bg-white rounded-lg shadow">
        <AdvancedArticleEditor
          article={article}
          onSave={handleSave}
          loading={loading}
          isEditing={isEditing}
        />
      </div>
    </div>
  );
};

export default ArticleEditor;