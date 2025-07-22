import React, { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import api from '../services/api';

const MediaLibrary = ({ onSelect, onClose, multiple = false }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [view, setView] = useState('library'); // 'library' or 'upload'
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      // Mock media library data since we don't have a media endpoint
      const mockImages = [
        {
          id: 1,
          url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23f0f0f0"/%3E%3Ctext x="150" y="100" font-family="Arial" font-size="16" fill="%23999" text-anchor="middle" dy=".3em"%3ESample Image 1%3C/text%3E%3C/svg%3E',
          name: 'sample-image-1.jpg',
          size: '245 KB',
          type: 'image/jpeg',
          uploaded_at: new Date().toISOString()
        },
        {
          id: 2,
          url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23e6f3ff"/%3E%3Ctext x="150" y="100" font-family="Arial" font-size="16" fill="%23666" text-anchor="middle" dy=".3em"%3ESample Image 2%3C/text%3E%3C/svg%3E',
          name: 'sample-image-2.jpg',
          size: '312 KB',
          type: 'image/jpeg',
          uploaded_at: new Date().toISOString()
        },
        {
          id: 3,
          url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23f0fff0"/%3E%3Ctext x="150" y="100" font-family="Arial" font-size="16" fill="%23666" text-anchor="middle" dy=".3em"%3ESample Image 3%3C/text%3E%3C/svg%3E',
          name: 'sample-image-3.jpg',
          size: '189 KB',
          type: 'image/jpeg',
          uploaded_at: new Date().toISOString()
        }
      ];
      
      setImages(mockImages);
    } catch (err) {
      console.error('Error loading images:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (image) => {
    if (multiple) {
      const isSelected = selectedImages.find(img => img.id === image.id);
      if (isSelected) {
        setSelectedImages(selectedImages.filter(img => img.id !== image.id));
      } else {
        setSelectedImages([...selectedImages, image]);
      }
    } else {
      onSelect(image.url);
    }
  };

  const handleConfirmSelection = () => {
    if (multiple && selectedImages.length > 0) {
      onSelect(selectedImages.map(img => img.url));
    }
  };

  const handleUploadSuccess = (imageUrl) => {
    // Add uploaded image to the library
    const newImage = {
      id: Date.now(),
      url: imageUrl,
      name: `uploaded-${Date.now()}.jpg`,
      size: 'Unknown',
      type: 'image/jpeg',
      uploaded_at: new Date().toISOString()
    };
    
    setImages([newImage, ...images]);
    setView('library');
    
    if (!multiple) {
      onSelect(imageUrl);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isSelected = (image) => {
    return multiple && selectedImages.find(img => img.id === image.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Media Library</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setView('library')}
                className={`px-3 py-1 rounded text-sm ${
                  view === 'library' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Library
              </button>
              <button
                onClick={() => setView('upload')}
                className={`px-3 py-1 rounded text-sm ${
                  view === 'upload' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Upload
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {multiple && selectedImages.length > 0 && (
              <button
                onClick={handleConfirmSelection}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Select {selectedImages.length} Image{selectedImages.length !== 1 ? 's' : ''}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {view === 'upload' ? (
            <ImageUploader onUploadSuccess={handleUploadSuccess} />
          ) : (
            <>
              {/* Filters */}
              <div className="mb-4 flex items-center space-x-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Images</option>
                  <option value="recent">Recently Added</option>
                  <option value="large">Large Files</option>
                </select>
                
                <p className="text-sm text-gray-600">
                  {images.length} image{images.length !== 1 ? 's' : ''} available
                </p>
              </div>

              {/* Images Grid */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="spinner"></div>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 mb-4">No images in your media library</p>
                  <button
                    onClick={() => setView('upload')}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Upload Your First Image
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        isSelected(image)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleImageSelect(image)}
                    >
                      <div className="aspect-w-4 aspect-h-3">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                      
                      <div className="p-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {image.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {image.size} • {formatDate(image.uploaded_at)}
                        </p>
                      </div>

                      {isSelected(image) && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;