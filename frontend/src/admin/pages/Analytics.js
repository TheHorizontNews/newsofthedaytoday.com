import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import AnalyticsChart from '../components/AnalyticsChart';

const Analytics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: analyticsAPI.getDashboardStats,
    refetchInterval: 60000, // Refetch every minute
  });

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
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Detailed insights into your content performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="stat-value">{stats?.total_views?.toLocaleString() || 0}</div>
          <div className="stat-label">Total Views</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.week_views?.toLocaleString() || 0}</div>
          <div className="stat-label">This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.month_views?.toLocaleString() || 0}</div>
          <div className="stat-label">This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.published_articles || 0}</div>
          <div className="stat-label">Published Articles</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Views Over Time (Last 30 Days)</h3>
          </div>
          <div className="card-content">
            <AnalyticsChart data={stats?.daily_views || []} />
          </div>
        </div>

        {/* Top Articles */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Performing Articles</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {stats?.top_articles?.length > 0 ? (
                stats.top_articles.map((article, index) => (
                  <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {article.title}
                        </div>
                        {article.published_at && (
                          <div className="text-xs text-gray-500">
                            {new Date(article.published_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {article.views?.toLocaleString() || 0} views
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No articles data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="mt-8">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Content Performance Summary</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats?.published_articles || 0}
                </div>
                <div className="text-sm text-gray-600">Published Articles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats?.draft_articles || 0}
                </div>
                <div className="text-sm text-gray-600">Draft Articles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.total_articles || 0}
                </div>
                <div className="text-sm text-gray-600">Total Articles</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;