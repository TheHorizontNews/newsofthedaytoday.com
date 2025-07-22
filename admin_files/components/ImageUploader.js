import React, { useState, useCallback } from 'react';

const ImageUploader = ({ onUploadSuccess, maxSize = 5 * 1024 * 1024 }) => { // 5MB default
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback((files) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    uploadFile(file);
  }, [maxSize]);

  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setError('');

      // Convert file to base64 for display
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target.result;
        onUploadSuccess(base64Url);
      };
      reader.readAsDataURL(file);

    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="spinner mx-auto"></div>
            <p className="text-gray-600">Uploading image...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">📁</div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop your image here, or{' '}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileInput}
                    disabled={uploading}
                  />
                </label>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports: JPG, PNG, GIF up to {formatFileSize(maxSize)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Upload Tips */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Upload Tips:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Use high-quality images for better visual appeal</li>
          <li>• Recommended dimensions: 1200x800px or higher</li>
          <li>• JPG format works best for photos, PNG for graphics with transparency</li>
          <li>• Compress large images to improve loading speed</li>
        </ul>
      </div>

      {/* Quick Upload Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => document.querySelector('input[type="file"]').click()}
          className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={uploading}
        >
          <span className="text-2xl mr-2">🖼️</span>
          <div className="text-left">
            <p className="font-medium">Choose File</p>
            <p className="text-sm text-gray-500">From your computer</p>
          </div>
        </button>

        <button
          className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed"
          disabled
        >
          <span className="text-2xl mr-2">🔗</span>
          <div className="text-left">
            <p className="font-medium">From URL</p>
            <p className="text-sm text-gray-500">Coming soon</p>
          </div>
        </button>

        <button
          className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed"
          disabled
        >
          <span className="text-2xl mr-2">📷</span>
          <div className="text-left">
            <p className="font-medium">Take Photo</p>
            <p className="text-sm text-gray-500">Coming soon</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;