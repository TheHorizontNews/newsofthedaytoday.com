import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      total_views: 0,
      unique_visitors: 0,
      page_views: 0,
      bounce_rate: 0
    },
    popular_articles: [],
    traffic_sources: [],
    daily_stats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/analytics/dashboard?range=${dateRange}`);
      
      // If API returns data, use it; otherwise use mock data
      if (response.data) {
        setAnalytics(response.data);
      } else {
        // Mock analytics data
        setAnalytics({
          overview: {
            total_views: 12547,
            unique_visitors: 8932,
            page_views: 15430,
            bounce_rate: 42.5
          },
          popular_articles: [
            { title: 'Ukraine Update: Latest News', views: 1245, url: '/article/ukraine-update' },
            { title: 'Technology Trends 2024', views: 987, url: '/article/tech-trends' },
            { title: 'Politics Weekly Review', views: 743, url: '/article/politics-review' },
            { title: 'Sports Championship Results', views: 654, url: '/article/sports-results' },
            { title: 'Economic Analysis Report', views: 543, url: '/article/economic-analysis' }
          ],
          traffic_sources: [
            { source: 'Direct', visits: 4521, percentage: 45.2 },
            { source: 'Google', visits: 3124, percentage: 31.2 },
            { source: 'Social Media', visits: 1543, percentage: 15.4 },
            { source: 'Other', visits: 812, percentage: 8.1 }
          ],
          daily_stats: [
            { date: '2024-01-01', views: 1234, visitors: 892 },
            { date: '2024-01-02', views: 1456, visitors: 1023 },
            { date: '2024-01-03', views: 1123, visitors: 845 },
            { date: '2024-01-04', views: 1789, visitors: 1234 },
            { date: '2024-01-05', views: 1567, visitors: 1102 },
            { date: '2024-01-06', views: 1432, visitors: 967 },
            { date: '2024-01-07', views: 1678, visitors: 1189 }
          ]
        });
      }
      setError('');
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num) => {
    return `${num.toFixed(1)}%`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        </div>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your website performance</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1d">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl">
              👁️
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analytics.overview.total_views)}
              </p>
              <p className="text-gray-600">Total Views</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl">
              👥
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analytics.overview.unique_visitors)}
              </p>
              <p className="text-gray-600">Unique Visitors</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl">
              📄
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analytics.overview.page_views)}
              </p>
              <p className="text-gray-600">Page Views</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl">
              📊
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(analytics.overview.bounce_rate)}
              </p>
              <p className="text-gray-600">Bounce Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Stats Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Daily Traffic</h2>
          <div className="space-y-3">
            {analytics.daily_stats.map((stat, index) => (
              <div key={index} className="flex items-center">
                <div className="w-16 text-sm text-gray-600 font-medium">
                  {formatDate(stat.date)}
                </div>
                
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-4 relative">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{
                        width: `${(stat.views / Math.max(...analytics.daily_stats.map(s => s.views))) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="w-16 text-sm text-gray-900 font-medium text-right">
                  {formatNumber(stat.views)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Traffic Sources</h2>
          <div className="space-y-4">
            {analytics.traffic_sources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">
                    {source.source}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {formatNumber(source.visits)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({formatPercentage(source.percentage)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Articles */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Popular Articles</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
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
                {analytics.popular_articles.map((article, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {article.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatNumber(article.views)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Article
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;