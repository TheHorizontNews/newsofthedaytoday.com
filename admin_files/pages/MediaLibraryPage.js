import React, { useState } from 'react';
import MediaLibrary from '../components/MediaLibrary';

const MediaLibraryPage = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [view, setView] = useState('grid'); // 'grid' or 'list'

  const handleImageSelect = (images) => {
    if (Array.isArray(images)) {
      setSelectedImages(images);
    } else {
      setSelectedImages([images]);
    }
  };

  const clearSelection = () => {
    setSelectedImages([]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600">Manage your images and media files</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {selectedImages.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedImages.length} selected
              </span>
              <button
                onClick={clearSelection}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${
                view === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎯
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${
                view === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋
            </button>
          </div>
        </div>
      </div>

      {/* Media Library Component */}
      <div className="bg-white rounded-lg shadow min-h-96">
        <MediaLibrary
          onSelect={handleImageSelect}
          onClose={() => {}} // No close needed for full page
          multiple={true}
        />
      </div>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Selected Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Selected ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Download Selected
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Delete Selected
            </button>
            <button 
              onClick={clearSelection}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Media Library Tips</h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• Click on images to select them for bulk operations</li>
          <li>• Use the Upload tab to add new images to your library</li>
          <li>• Supported formats: JPG, PNG, GIF up to 5MB per file</li>
          <li>• Images are automatically optimized for web display</li>
          <li>• Use descriptive filenames for better organization</li>
        </ul>
      </div>
    </div>
  );
};

export default MediaLibraryPage;