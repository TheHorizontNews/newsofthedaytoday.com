import React, { useState, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  loading = 'lazy',
  priority = false,
  sizes = '100vw',
  quality = 75,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate different sizes for responsive images
  const generateSrcSet = (baseSrc, sizes = [400, 800, 1200, 1600]) => {
    if (!baseSrc.includes('unsplash.com')) {
      return baseSrc; // Return original for non-Unsplash images
    }

    return sizes.map(size => 
      `${baseSrc}&w=${size}&h=${Math.round(size * 0.75)}&fm=webp&q=${quality} ${size}w`
    ).join(', ');
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Generate optimized src
  const optimizedSrc = src.includes('unsplash.com') 
    ? `${src}&w=${width || 800}&h=${height || 600}&fm=webp&q=${quality}`
    : src;

  if (hasError) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-gray-500">Зображення недоступне</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
          <div className="loading-spinner w-6 h-6"></div>
        </div>
      )}
      
      <picture>
        {/* WebP format for modern browsers */}
        <source
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          type="image/webp"
        />
        
        <img
          src={optimizedSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-500 gpu-accelerated ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </picture>
    </div>
  );
};

export default OptimizedImage;