import { useState, useEffect } from 'react';

// Simple SEO hook
const useSEO = () => {
  const [seoData, setSeoData] = useState({
    title: 'Science Digest News',
    description: 'Latest scientific discoveries and research from around the world',
    keywords: 'science, technology, research, news'
  });
  const [loading, setLoading] = useState(false);

  const updateMetaTags = (data) => {
    if (data) {
      document.title = data.title || 'Science Digest News';
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = data.description || 'Latest scientific discoveries and research';
    }
  };

  return { seoData, loading, updateMetaTags };
};

export default useSEO;