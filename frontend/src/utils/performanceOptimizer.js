// Performance optimization utilities

// Intersection Observer для content-visibility
export const setupContentVisibility = () => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.contentVisibility = 'visible';
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px'
    });

    // Observe below-fold content
    document.querySelectorAll('.below-fold').forEach((el) => {
      observer.observe(el);
    });
  }
};

// Resource hints для оптимизации загрузки
export const addResourceHints = () => {
  const head = document.head;
  
  // DNS prefetch для критических доменов
  const domains = [
    'fonts.gstatic.com',
    'images.unsplash.com',
    'us.i.posthog.com'
  ];
  
  domains.forEach(domain => {
    if (!head.querySelector(`link[href*="${domain}"]`)) {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      head.appendChild(link);
    }
  });
};

// Lazy loading для тяжелых компонентов
export const lazyLoadComponent = (importFunc, delay = 0) => {
  return new Promise((resolve) => {
    if (delay > 0) {
      setTimeout(() => {
        resolve(importFunc());
      }, delay);
    } else {
      resolve(importFunc());
    }
  });
};

// Оптимизация изображений для первой загрузки
export const optimizeImageLoading = () => {
  // Приоритетная загрузка для hero изображений
  const heroImages = document.querySelectorAll('.hero img, .hero-section img');
  heroImages.forEach((img) => {
    img.loading = 'eager';
    img.decoding = 'sync';
  });
  
  // Lazy loading для остальных
  const otherImages = document.querySelectorAll('img:not(.hero img):not(.hero-section img)');
  otherImages.forEach((img) => {
    img.loading = 'lazy';
    img.decoding = 'async';
  });
};

// Performance metrics
export const measurePerformance = () => {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('🚀 Performance Metrics:', {
          'DOM Content Loaded': Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
          'Load Complete': Math.round(perfData.loadEventEnd - perfData.loadEventStart),
          'First Paint': Math.round(performance.getEntriesByType('paint')[0]?.startTime || 0),
          'Largest Content Paint': Math.round(performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0)
        });
      }, 0);
    });
  }
};