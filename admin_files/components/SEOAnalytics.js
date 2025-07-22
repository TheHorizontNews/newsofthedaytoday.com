import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SEOAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      average_position: 0
    },
    top_queries: [],
    articles: {
      total: 0,
      published: 0,
      draft: 0
    },
    sitemaps: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitUrl, setSubmitUrl] = useState('');
  const [submittingUrl, setSubmittingUrl] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/seo/analytics/dashboard');
      
      if (response.data) {
        setAnalytics(response.data);
      } else {
        // Mock data for demonstration
        setAnalytics({
          overview: {
            impressions: 45234,
            clicks: 2876,
            ctr: 6.4,
            average_position: 8.2
          },
          top_queries: [
            { query: 'ukraine news', clicks: 234, impressions: 3450, ctr: 6.8, position: 4.2 },
            { query: 'breaking news', clicks: 189, impressions: 2890, ctr: 6.5, position: 5.1 },
            { query: 'politics news', clicks: 156, impressions: 2340, ctr: 6.7, position: 6.3 },
            { query: 'tech news', clicks: 134, impressions: 1980, ctr: 6.8, position: 7.1 },
            { query: 'sports update', clicks: 98, impressions: 1560, ctr: 6.3, position: 8.9 }
          ],
          articles: {
            total: 45,
            published: 32,
            draft: 13
          },
          sitemaps: [
            { url: '/sitemap.xml', status: 'Success', last_submitted: '2024-01-15' },
            { url: '/llms-sitemap.xml', status: 'Success', last_submitted: '2024-01-15' }
          ]
        });
      }
      setError('');
    } catch (err) {
      console.error('Error loading SEO analytics:', err);
      setError('Failed to load SEO analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSitemap = async () => {
    try {
      setSubmittingUrl(true);
      const response = await api.post('/api/seo/search-console/submit-sitemap');
      
      if (response.data.success) {
        alert('Sitemap submitted successfully!');
        loadAnalytics(); // Refresh data
      } else {
        alert('Failed to submit sitemap: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error submitting sitemap:', err);
      alert('Failed to submit sitemap. Please try again.');
    } finally {
      setSubmittingUrl(false);
    }
  };

  const handleSubmitUrl = async () => {
    if (!submitUrl.trim()) {
      alert('Please enter a URL to submit');
      return;
    }

    try {
      setSubmittingUrl(true);
      const response = await api.post('/api/seo/search-console/submit-url', {
        url: submitUrl
      });
      
      if (response.data.success) {
        alert('URL submitted successfully!');
        setSubmitUrl('');
      } else {
        alert('Failed to submit URL: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error submitting URL:', err);
      alert('Failed to submit URL. Please try again.');
    } finally {
      setSubmittingUrl(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="seo-dashboard">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">SEO Analytics</h1>
        <p className="text-gray-600">Monitor your search engine performance</p>
      </div>

      {error && (
        <div className="alert alert-error mb-6">{error}</div>
      )}

      {/* Overview Cards */}
      <div className="overview-cards mb-8">
        <div className="overview-card">
          <h3>Impressions</h3>
          <p className="value">{formatNumber(analytics.overview.impressions)}</p>
        </div>
        
        <div className="overview-card">
          <h3>Clicks</h3>
          <p className="value">{formatNumber(analytics.overview.clicks)}</p>
        </div>
        
        <div className="overview-card">
          <h3>CTR</h3>
          <p className="value">{analytics.overview.ctr}%</p>
        </div>
        
        <div className="overview-card">
          <h3>Avg Position</h3>
          <p className="value">{analytics.overview.average_position}</p>
        </div>
      </div>

      {/* Actions Section */}
      <div className="actions-section">
        <button 
          onClick={handleSubmitSitemap}
          className="action-button"
          disabled={submittingUrl}
        >
          {submittingUrl ? 'Submitting...' : 'Submit Sitemap'}
        </button>
        
        <div className="flex items-center space-x-2">
          <input
            type="url"
            placeholder="Enter URL to submit to Google"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            value={submitUrl}
            onChange={(e) => setSubmitUrl(e.target.value)}
          />
          <button 
            onClick={handleSubmitUrl}
            className="action-button"
            disabled={submittingUrl || !submitUrl.trim()}
          >
            {submittingUrl ? 'Submitting...' : 'Submit URL'}
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="analytics-grid">
        {/* Top Search Queries */}
        <div className="chart-container">
          <h3>Top Search Queries</h3>
          <div className="overflow-x-auto">
            <table className="queries-table">
              <thead>
                <tr>
                  <th>Query</th>
                  <th>Clicks</th>
                  <th>Impressions</th>
                  <th>CTR</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {analytics.top_queries.map((query, index) => (
                  <tr key={index}>
                    <td className="font-medium">{query.query}</td>
                    <td>{formatNumber(query.clicks)}</td>
                    <td>{formatNumber(query.impressions)}</td>
                    <td>{query.ctr}%</td>
                    <td>{query.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Articles Overview */}
        <div className="chart-container">
          <h3>Articles Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded">
              <span className="font-medium">Total Articles</span>
              <span className="text-2xl font-bold text-blue-600">
                {analytics.articles.total}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-green-50 rounded">
              <span className="font-medium">Published</span>
              <span className="text-2xl font-bold text-green-600">
                {analytics.articles.published}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded">
              <span className="font-medium">Draft</span>
              <span className="text-2xl font-bold text-yellow-600">
                {analytics.articles.draft}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sitemaps Status */}
      <div className="chart-container mb-6">
        <h3>Sitemaps Status</h3>
        <div className="overflow-x-auto">
          <table className="queries-table">
            <thead>
              <tr>
                <th>Sitemap URL</th>
                <th>Status</th>
                <th>Last Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {analytics.sitemaps.map((sitemap, index) => (
                <tr key={index}>
                  <td>
                    <a 
                      href={sitemap.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {sitemap.url}
                    </a>
                  </td>
                  <td>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      sitemap.status === 'Success' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {sitemap.status}
                    </span>
                  </td>
                  <td>{sitemap.last_submitted}</td>
                  <td>
                    <button 
                      onClick={() => window.open(sitemap.url, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEO Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">SEO Optimization Tips</h3>
        <ul className="text-blue-800 space-y-2">
          <li>• Monitor your top-performing search queries and create more content around those topics</li>
          <li>• Aim for a CTR above 5% - optimize your meta titles and descriptions for better click-through rates</li>
          <li>• Work on improving your average position for high-volume keywords</li>
          <li>• Submit new content URLs to Google Search Console for faster indexing</li>
          <li>• Keep your sitemaps updated and resubmit them when you publish new content</li>
        </ul>
      </div>
    </div>
  );
};

export default SEOAnalytics;