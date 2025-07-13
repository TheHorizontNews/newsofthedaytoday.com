import React, { useState } from 'react';
import ImageUploader from './ImageUploader';

const MediaLibrary = ({ isOpen, onClose, onSelectImage }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock media data - in production, this would come from API
  const [mediaItems] = useState([
    {
      id: '1',
      name: 'hero-image.jpg',
      url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c',
      type: 'image',
      size: 245760,
      uploadedAt: '2025-07-13T10:00:00Z'
    },
    {
      id: '2',
      name: 'article-image.jpg',
      url: 'https://images.pexels.com/photos/11477798/pexels-photo-11477798.jpeg',
      type: 'image',
      size: 187392,
      uploadedAt: '2025-07-13T09:30:00Z'
    },
    {
      id: '3',
      name: 'politics-news.jpg',
      url: 'https://images.pexels.com/photos/11397188/pexels-photo-11397188.jpeg',
      type: 'image',
      size: 156789,
      uploadedAt: '2025-07-13T09:00:00Z'
    }
  ]);

  const filteredMedia = mediaItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageUpload = (imageData) => {
    console.log('New image uploaded:', imageData);
  };

  const handleSelectImage = (image) => {
    if (onSelectImage) {
      onSelectImage(image);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Media Library</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'upload'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upload New
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'library'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Media Library
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'upload' ? (
            <ImageUploader onImageUpload={handleImageUpload} />
          ) : (
            <div>
              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search media..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="relative group cursor-pointer"
                    onClick={() => handleSelectImage(item)}
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white text-gray-700 px-3 py-1 rounded text-sm font-medium">
                          Select
                        </div>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="mt-2">
                      <div className="text-sm text-gray-900 truncate" title={item.name}>
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(item.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMedia.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No media found matching your search.' : 'No media uploaded yet.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;