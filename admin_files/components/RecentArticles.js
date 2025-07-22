import React from 'react';
import { Link } from 'react-router-dom';

const RecentArticles = ({ articles }) => {
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Articles</h2>
        <Link
          to="/admin/articles"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View all →
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No articles found</p>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              {article.featured_image && (
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      <Link
                        to={`/admin/articles/edit/${article.id}`}
                        className="hover:text-blue-600"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {article.category || 'Uncategorized'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(article.created_at)} • {article.author || 'Unknown'}
                    </p>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    {getStatusBadge(article.status)}
                  </div>
                </div>

                {article.excerpt && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex space-x-4 text-xs text-gray-500">
                    <span>👀 {article.views || 0} views</span>
                    {article.tags && article.tags.length > 0 && (
                      <span>🏷️ {article.tags.length} tags</span>
                    )}
                  </div>
                  
                  <Link
                    to={`/admin/articles/edit/${article.id}`}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentArticles;