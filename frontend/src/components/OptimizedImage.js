import React, { useState, useRef, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  priority = false,
  placeholder = true,
  sizes = '100vw'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef();

  // Generate responsive image URLs
  const generateResponsiveUrl = (originalSrc, targetWidth) => {
    if (!originalSrc || !originalSrc.includes('unsplash.com')) {
      return originalSrc;
    }
    
    // Extract base URL and parameters
    const baseUrl = originalSrc.split('?')[0];
    const params = new URLSearchParams(originalSrc.split('?')[1] || '');
    
    // Set optimized parameters
    params.set('w', targetWidth.toString());
    params.set('h', Math.round(targetWidth * 0.6).toString()); // 16:10 ratio
    params.set('fit', 'crop');
    params.set('crop', 'entropy');
    params.set('fm', 'webp');
    params.set('q', '85');
    
    return `${baseUrl}?${params.toString()}`;
  };

  // Generate srcset for responsive images
  const generateSrcSet = (originalSrc) => {
    const widths = [400, 800, 1200, 1600];
    return widths
      .map(w => `${generateResponsiveUrl(originalSrc, w)} ${w}w`)
      .join(', ');
  };

  // Intersection Observer для lazy loading
  useEffect(() => {
    if (priority) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const placeholderSvg = `data:image/svg+xml;base64,${btoa(
    `<svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="14">
        Завантаження...
      </text>
    </svg>`
  )}`;

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!isLoaded && placeholder && (
        <img
          src={placeholderSvg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}
      
      {/* Actual image */}
      {isInView && (
        <picture>
          {/* WebP with srcset */}
          <source
            srcSet={generateSrcSet(src)}
            sizes={sizes}
            type="image/webp"
          />
          
          {/* Fallback */}
          <img
            src={generateResponsiveUrl(src, width || 800)}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={() => setIsLoaded(true)}
            width={width}
            height={height}
          />
        </picture>
      )}
      
      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse text-gray-400 text-sm">Завантаження...</div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;