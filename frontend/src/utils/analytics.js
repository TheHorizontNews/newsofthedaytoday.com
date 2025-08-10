// Simple analytics utility
const analytics = {
  initialize: () => {
    console.log('Analytics initialized');
  },
  
  trackPageView: (path, title) => {
    console.log(`Page view tracked: ${path} - ${title}`);
  },
  
  trackEvent: (event, data) => {
    console.log(`Event tracked: ${event}`, data);
  }
};

export default analytics;