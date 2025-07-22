import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatsCards from '../components/StatsCards';
import RecentArticles from '../components/RecentArticles';
import AnalyticsChart from '../components/AnalyticsChart';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    totalUsers: 0,
    totalCategories: 0
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [articlesRes, usersRes, categoriesRes] = await Promise.all([
        api.get('/api/articles'),
        api.get('/api/users'),
        api.get('/api/categories')
      ]);

      const articles = articlesRes.data.articles || articlesRes.data || [];
      const users = usersRes.data.users || usersRes.data || [];
      const categories = categoriesRes.data || [];

      setStats({
        totalArticles: articles.length,
        publishedArticles: articles.filter(a => a.status === 'published').length,
        totalUsers: users.length,
        totalCategories: categories.length
      });

      // Get recent articles (last 5)
      const sortedArticles = articles
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      setRecentArticles(sortedArticles);
      setError('');
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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
      <div className="alert alert-error">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <div className="lg:col-span-2">
          <RecentArticles articles={recentArticles} />
        </div>

        {/* Analytics Chart */}
        <div className="lg:col-span-1">
          <AnalyticsChart />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/articles/new"
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-2xl mb-2">📝</span>
            <span className="text-sm font-medium">New Article</span>
          </a>
          
          <a
            href="/admin/users"
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span className="text-2xl mb-2">👥</span>
            <span className="text-sm font-medium">Manage Users</span>
          </a>
          
          <a
            href="/admin/categories"
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <span className="text-2xl mb-2">📁</span>
            <span className="text-sm font-medium">Categories</span>
          </a>
          
          <a
            href="/admin/analytics"
            className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm font-medium">Analytics</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;