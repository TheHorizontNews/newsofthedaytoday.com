import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const RecentArticles = ({ articles }) => {
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No articles found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <Link
              to={`/admin/articles/edit/${article.id}`}
              className="text-sm font-medium text-gray-900 hover:text-red-600 transition-colors"
            >
              {article.title}
            </Link>
            <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
              {article.published_at && (
                <span>
                  📅 {format(new Date(article.published_at), 'MMM d, yyyy')}
                </span>
              )}
              <span>👁️ {article.views.toLocaleString()} views</span>
            </div>
          </div>
          <div className="ml-4">
            <Link
              to={`/admin/articles/edit/${article.id}`}
              className="btn btn-sm btn-secondary"
            >
              Edit
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentArticles;