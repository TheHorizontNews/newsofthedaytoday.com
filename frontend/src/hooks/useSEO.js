import { useEffect, useState } from 'react';

export const useSEO = () => {
  const [seoData, setSeoData] = useState({
    title: 'Science Digest News',
    description: 'Останні наукові відкриття та дослідження',
    keywords: 'наука, технології',
    ogImage: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=630&fit=crop&crop=entropy&fm=webp&q=85'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSEOData = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://sciencedigestnews.com';
        const response = await fetch(`${backendUrl}/api/seo/page-meta?url=${window.location.pathname}`);
        
        if (response.ok) {
          const data = await response.json();
          setSeoData({
            title: data.title || 'Science Digest News',
            description: data.description || 'Останні наукові відкриття та дослідження',
            keywords: data.keywords || 'наука, технології',
            ogImage: data.og_image || 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=630&fit=crop&crop=entropy&fm=webp&q=85',
            canonicalUrl: data.canonical_url || 'https://sciencedigestnews.com'
          });
        }
      } catch (error) {
        console.error('Failed to fetch SEO data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSEOData();
  }, []);

  const updateMetaTags = (data) => {
    // Динамически обновляем метатеги
    if (data.title) {
      document.title = data.title;
      updateMetaTag('og:title', data.title);
      updateMetaTag('twitter:title', data.title);
    }
    
    if (data.description) {
      updateMetaTag('description', data.description);
      updateMetaTag('og:description', data.description);
      updateMetaTag('twitter:description', data.description);
    }
    
    if (data.ogImage) {
      updateMetaTag('og:image', data.ogImage);
      updateMetaTag('twitter:image', data.ogImage);
    }
    
    if (data.keywords) {
      updateMetaTag('keywords', data.keywords);
    }
  };

  const updateMetaTag = (name, content) => {
    // Обновляем обычные meta теги
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      // Проверяем property теги
      tag = document.querySelector(`meta[property="${name}"]`);
    }
    
    if (tag) {
      tag.setAttribute('content', content);
    } else {
      // Создаем новый тег если не существует
      const newTag = document.createElement('meta');
      if (name.startsWith('og:') || name.startsWith('twitter:')) {
        newTag.setAttribute('property', name);
      } else {
        newTag.setAttribute('name', name);
      }
      newTag.setAttribute('content', content);
      document.head.appendChild(newTag);
    }
  };

  return { seoData, loading, updateMetaTags };
};

export default useSEO;