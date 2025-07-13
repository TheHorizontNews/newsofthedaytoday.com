import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';

const ImageUploader = ({ onImageUpload, accept = 'image/*', maxSize = 5242880 }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        // Convert to base64 for demo - in production, upload to server
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const imageData = {
              id: uuidv4(),
              name: file.name,
              size: file.size,
              type: file.type,
              url: reader.result,
              uploadedAt: new Date().toISOString()
            };
            resolve(imageData);
          };
          reader.readAsDataURL(file);
        });
      });

      const images = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...images]);
      
      if (onImageUpload) {
        images.forEach(image => onImageUpload(image));
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    maxSize,
    multiple: true
  });

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const copyImageUrl = (url) => {
    navigator.clipboard.writeText(url);
    alert('Image URL copied to clipboard!');
  };

  return (
    <div className="image-uploader">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-4xl">📸</div>
          {uploading ? (
            <div>
              <div className="text-lg font-medium text-gray-700">Uploading...</div>
              <div className="text-sm text-gray-500">Please wait</div>
            </div>
          ) : isDragActive ? (
            <div>
              <div className="text-lg font-medium text-red-600">Drop the images here!</div>
              <div className="text-sm text-gray-500">Release to upload</div>
            </div>
          ) : (
            <div>
              <div className="text-lg font-medium text-gray-700">
                Drag & drop images here, or click to select
              </div>
              <div className="text-sm text-gray-500">
                Supports: JPG, PNG, GIF up to {Math.round(maxSize / 1024 / 1024)}MB
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Image Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                  <button
                    onClick={() => copyImageUrl(image.url)}
                    className="bg-white text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-100"
                    title="Copy URL"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => removeImage(image.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                    title="Remove"
                  >
                    🗑️ Remove
                  </button>
                </div>
                
                {/* Image Info */}
                <div className="mt-1">
                  <div className="text-xs text-gray-600 truncate" title={image.name}>
                    {image.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {(image.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;