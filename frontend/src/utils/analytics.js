import ReactGA from 'react-ga4';

// Configuration for Google Analytics
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-PLACEHOLDER123';

class GoogleAnalytics {
  constructor() {
    this.isInitialized = false;
    this.debugMode = process.env.NODE_ENV === 'development';
  }

  // Initialize Google Analytics
  initialize() {
    if (typeof window !== 'undefined' && !this.isInitialized) {
      ReactGA.initialize(GA_MEASUREMENT_ID, {
        debug: this.debugMode,
        titleCase: false,
        gaOptions: {
          send_page_view: false // We'll send page views manually
        }
      });
      this.isInitialized = true;
      
      if (this.debugMode) {
        console.log('Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
      }
    }
  }

  // Track page views
  trackPageView(path, title) {
    if (!this.isInitialized) {
      this.initialize();
    }

    ReactGA.send({
      hitType: 'pageview',
      page: path,
      title: title || document.title
    });

    if (this.debugMode) {
      console.log('GA Page View:', { path, title });
    }
  }

  // Track events
  trackEvent(action, category = 'User Interaction', label = '', value = 0) {
    if (!this.isInitialized) {
      this.initialize();
    }

    ReactGA.event({
      action,
      category,
      label,
      value
    });

    if (this.debugMode) {
      console.log('GA Event:', { action, category, label, value });
    }
  }

  // Track article views
  trackArticleView(articleId, title, category, author) {
    this.trackEvent('article_view', 'Content', title);
    
    // Send custom parameters
    ReactGA.gtag('event', 'article_view', {
      article_id: articleId,
      article_title: title,
      article_category: category,
      article_author: author,
      page_title: title,
      page_location: window.location.href
    });
  }

  // Track search
  trackSearch(searchTerm, resultsCount = 0) {
    this.trackEvent('search', 'Search', searchTerm, resultsCount);
    
    ReactGA.gtag('event', 'search', {
      search_term: searchTerm,
      results_count: resultsCount
    });
  }

  // Track user engagement
  trackEngagement(engagementType, details = {}) {
    this.trackEvent(engagementType, 'Engagement', JSON.stringify(details));
  }

  // Track admin actions
  trackAdminAction(action, details = {}) {
    this.trackEvent(action, 'Admin', JSON.stringify(details));
  }

  // Track time on page
  trackTimeOnPage(seconds, pagePath) {
    ReactGA.gtag('event', 'timing_complete', {
      name: 'page_read_time',
      value: seconds,
      page_path: pagePath
    });
  }

  // Set user properties
  setUserProperties(properties) {
    if (!this.isInitialized) {
      this.initialize();
    }

    ReactGA.gtag('config', GA_MEASUREMENT_ID, {
      custom_map: properties
    });
  }

  // Track conversion/goal
  trackConversion(conversionName, value = 1) {
    ReactGA.gtag('event', 'conversion', {
      send_to: `${GA_MEASUREMENT_ID}/${conversionName}`,
      value: value
    });
  }
}

// Create singleton instance
const analytics = new GoogleAnalytics();

export default analytics;

// React hook for using analytics
export const useAnalytics = () => {
  return {
    trackPageView: analytics.trackPageView.bind(analytics),
    trackEvent: analytics.trackEvent.bind(analytics),
    trackArticleView: analytics.trackArticleView.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackEngagement: analytics.trackEngagement.bind(analytics),
    trackAdminAction: analytics.trackAdminAction.bind(analytics),
    trackTimeOnPage: analytics.trackTimeOnPage.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics)
  };
};