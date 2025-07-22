import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TagManager = () => {
  const [tags, setTags] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [tagStats, setTagStats] = useState({
    total_tags: 0,
    most_used_tag: '',
    total_usage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [showTagModal, setShowTagModal] = useState(false);

  useEffect(() => {
    loadTagData();
  }, []);

  const loadTagData = async () => {
    try {
      setLoading(true);
      
      // Load all tag data
      const [tagsRes, popularRes] = await Promise.all([
        api.get('/api/seo/tags'),
        api.get('/api/seo/tags/popular')
      ]);

      const allTags = tagsRes.data || [];
      const popular = popularRes.data || [];

      setTags(allTags);
      setPopularTags(popular);

      // Calculate stats
      const totalTags = allTags.length;
      const totalUsage = allTags.reduce((sum, tag) => sum + (tag.count || 0), 0);
      const mostUsedTag = popular.length > 0 ? popular[0].name : '';

      setTagStats({
        total_tags: totalTags,
        most_used_tag: mostUsedTag,
        total_usage: totalUsage
      });

      setError('');
    } catch (err) {
      console.error('Error loading tag data:', err);
      setError('Failed to load tag data');
      
      // Mock data for demonstration
      const mockTags = [
        { name: 'politics', count: 23, articles: ['Article 1', 'Article 2'] },
        { name: 'technology', count: 19, articles: ['Tech News', 'Innovation'] },
        { name: 'ukraine', count: 17, articles: ['Ukraine Update', 'War News'] },
        { name: 'sports', count: 14, articles: ['Sports Update', 'Championship'] },
        { name: 'business', count: 12, articles: ['Market News', 'Economy'] }
      ];
      
      setTags(mockTags);
      setPopularTags(mockTags.slice(0, 5));
      setTagStats({
        total_tags: mockTags.length,
        most_used_tag: mockTags[0].name,
        total_usage: mockTags.reduce((sum, tag) => sum + tag.count, 0)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupTags = async () => {
    if (!window.confirm('Are you sure you want to clean up unused tags? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.post('/api/seo/tags/cleanup');
      
      if (response.data.success) {
        alert(`Cleanup completed! Removed ${response.data.removed_count || 0} unused tags.`);
        loadTagData(); // Refresh data
      } else {
        alert('Cleanup failed: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error cleaning up tags:', err);
      alert('Failed to cleanup tags. Please try again.');
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setShowTagModal(true);
  };

  const closeModal = () => {
    setShowTagModal(false);
    setSelectedTag(null);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="tag-manager">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tag Manager</h1>
        <p className="text-gray-600">Manage and organize your content tags</p>
      </div>

      {error && (
        <div className="alert alert-error mb-6">{error}</div>
      )}

      {/* Tag Statistics */}
      <div className="tag-stats-grid mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl">
              🏷️
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{tagStats.total_tags}</p>
              <p className="text-gray-600">Total Tags</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl">
              ⭐
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{tagStats.most_used_tag}</p>
              <p className="text-gray-600">Most Used Tag</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl">
              📊
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{tagStats.total_usage}</p>
              <p className="text-gray-600">Total Usage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Tags Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Popular Tags</h2>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag, index) => (
            <button
              key={index}
              onClick={() => handleTagClick(tag)}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
            >
              {tag.name}
              <span className="ml-2 bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                {tag.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="tag-search">
            <input
              type="text"
              placeholder="Search tags..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="cleanup-section">
            <button
              onClick={handleCleanupTags}
              className="cleanup-button"
            >
              🧹 Cleanup Unused Tags
            </button>
          </div>
        </div>
      </div>

      {/* All Tags Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">All Tags ({filteredTags.length})</h2>
          
          {filteredTags.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery ? 'No tags found matching your search.' : 'No tags available.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tag Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sample Articles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTags.map((tag, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {tag.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tag.count || 0} articles
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {tag.articles && tag.articles.length > 0 ? (
                            <div className="space-y-1">
                              {tag.articles.slice(0, 2).map((article, idx) => (
                                <div key={idx} className="truncate max-w-xs">
                                  {article}
                                </div>
                              ))}
                              {tag.articles.length > 2 && (
                                <div className="text-gray-500 text-xs">
                                  +{tag.articles.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No articles</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleTagClick(tag)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Tag Details Modal */}
      {showTagModal && selectedTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 max-h-96 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Tag: "{selectedTag.name}"
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Usage Count</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedTag.count || 0}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Articles using this tag:</p>
                  <div className="max-h-48 overflow-y-auto">
                    {selectedTag.articles && selectedTag.articles.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedTag.articles.map((article, index) => (
                          <li key={index} className="p-2 bg-gray-50 rounded text-sm">
                            {article}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 italic">No articles found</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 mt-6 border-t">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;