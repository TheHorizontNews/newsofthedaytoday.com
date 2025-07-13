import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

// Google Analytics configuration
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
const GA_DEBUG = process.env.NODE_ENV === 'development';

// Initialize Google Analytics
export const initGA = () => {
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      testMode: GA_DEBUG,
      gtagOptions: {
        debug_mode: GA_DEBUG,
        send_page_view: false // We'll handle page views manually
      }
    });
    
    if (GA_DEBUG) {
      console.log('Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
    }
  } else {
    console.warn('Google Analytics not initialized - missing or invalid measurement ID');
  }
};

// Page view tracking
export const trackPageView = (path, title) => {
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.send({
      hitType: 'pageview',
      page: path,
      title: title
    });
    
    if (GA_DEBUG) {
      console.log('GA Page View:', { path, title });
    }
  }
};

// Event tracking
export const trackEvent = (action, category, label, value) => {
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.event(action, {
      category: category,
      label: label,
      value: value
    });
    
    if (GA_DEBUG) {
      console.log('GA Event:', { action, category, label, value });
    }
  }
};

// Article view tracking
export const trackArticleView = (articleId, title, category, author) => {
  trackEvent('view_item', 'article', title, {
    item_id: articleId,
    item_name: title,
    item_category: category,
    item_category2: author
  });
};

// Search tracking
export const trackSearch = (searchTerm, results = 0) => {
  trackEvent('search', 'site_search', searchTerm, results);
};

// User engagement tracking
export const trackEngagement = (action, element, page) => {
  trackEvent(action, 'engagement', element, {
    page_location: page
  });
};

// Google Analytics Hook for automatic page tracking
export const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    const path = location.pathname + location.search;
    const title = document.title;
    
    trackPageView(path, title);
  }, [location]);
};

// Enhanced Google Analytics Component
const GoogleAnalytics = ({ children }) => {
  useGoogleAnalytics();
  
  return children;
};

export default GoogleAnalytics;