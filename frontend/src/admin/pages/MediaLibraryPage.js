import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';

const MediaLibraryPage = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);

  // Mock media data - in production, this would come from API
  const [mediaItems, setMediaItems] = useState([
    {
      id: '1',
      name: 'hero-image.jpg',
      url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c',
      type: 'image',
      size: 245760,
      uploadedAt: '2025-07-13T10:00:00Z',
      dimensions: '1920x1080'
    },
    {
      id: '2',
      name: 'article-image.jpg',
      url: 'https://images.pexels.com/photos/11477798/pexels-photo-11477798.jpeg',
      type: 'image',
      size: 187392,
      uploadedAt: '2025-07-13T09:30:00Z',
      dimensions: '1600x900'
    },
    {
      id: '3',
      name: 'politics-news.jpg',
      url: 'https://images.pexels.com/photos/11397188/pexels-photo-11397188.jpeg',
      type: 'image',
      size: 156789,
      uploadedAt: '2025-07-13T09:00:00Z',
      dimensions: '1280x720'
    },
    {
      id: '4',
      name: 'technology-article.jpg',
      url: 'https://images.unsplash.com/photo-1601132531233-0b5e07c99b57',
      type: 'image',
      size: 298765,
      uploadedAt: '2025-07-13T08:30:00Z',
      dimensions: '1920x1280'
    },
    {
      id: '5',
      name: 'lifestyle-health.jpg',
      url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
      type: 'image',
      size: 234567,
      uploadedAt: '2025-07-13T08:00:00Z',
      dimensions: '1600x1067'
    }
  ]);

  const filteredMedia = mediaItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageUpload = (imageData) => {
    setMediaItems(prev => [imageData, ...prev]);
  };

  const handleImageSelect = (imageId) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedImages.length} selected image(s)?`)) {
      setMediaItems(prev => prev.filter(item => !selectedImages.includes(item.id)));
      setSelectedImages([]);
    }
  };

  const copyImageUrl = (url) => {
    navigator.clipboard.writeText(url);
    alert('Image URL copied to clipboard!');
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Media Library</h1>
            <p className="page-subtitle">Manage your images and media files</p>
          </div>
          <div className="flex items-center space-x-3">
            {selectedImages.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="btn btn-danger"
              >
                🗑️ Delete Selected ({selectedImages.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{mediaItems.length}</div>
          <div className="text-sm text-gray-600">Total Images</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-gray-900">
            {(mediaItems.reduce((acc, item) => acc + item.size, 0) / 1024 / 1024).toFixed(1)} MB
          </div>
          <div className="text-sm text-gray-600">Total Size</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-gray-900">
            {mediaItems.filter(item => new Date(item.uploadedAt) > new Date(Date.now() - 7*24*60*60*1000)).length}
          </div>
          <div className="text-sm text-gray-600">This Week</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{selectedImages.length}</div>
          <div className="text-sm text-gray-600">Selected</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'library'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📁 Media Library
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'upload'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ⬆️ Upload New
          </button>
        </div>

        <div className="card-content">
          {activeTab === 'upload' ? (
            <ImageUploader onImageUpload={handleImageUpload} />
          ) : (
            <div>
              {/* Search and Filters */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Search media..."
                    className="form-input w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <select className="form-input w-40">
                    <option value="">All Types</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="document">Documents</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {filteredMedia.length} items
                  </span>
                  <button className="btn btn-sm btn-secondary">
                    📄 List View
                  </button>
                  <button className="btn btn-sm btn-primary">
                    🏷️ Grid View
                  </button>
                </div>
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                      selectedImages.includes(item.id)
                        ? 'border-red-500 ring-2 ring-red-200'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedImages.includes(item.id)}
                        onChange={() => handleImageSelect(item.id)}
                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                      />
                    </div>

                    {/* Image */}
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    
                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <button
                          onClick={() => copyImageUrl(item.url)}
                          className="bg-white text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-100"
                          title="Copy URL"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => window.open(item.url, '_blank')}
                          className="bg-white text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-100"
                          title="View Full Size"
                        >
                          🔍
                        </button>
                        <button
                          onClick={() => handleImageSelect(item.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                          title="Select"
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="p-3 bg-white">
                      <div className="text-sm font-medium text-gray-900 truncate" title={item.name}>
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(item.size / 1024).toFixed(1)} KB • {item.dimensions}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(item.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMedia.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {searchQuery ? (
                    <div>
                      <div className="text-4xl mb-4">🔍</div>
                      <div className="text-lg font-medium mb-2">No media found</div>
                      <div>Try adjusting your search terms</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-4">📁</div>
                      <div className="text-lg font-medium mb-2">No media uploaded yet</div>
                      <div>Upload your first image to get started</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaLibraryPage;