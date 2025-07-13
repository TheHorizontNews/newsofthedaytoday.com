// Google Search Console Integration
import { useEffect } from 'react';

// Search Console verification and integration utilities
export class SearchConsoleIntegration {
  constructor() {
    this.verificationMeta = process.env.REACT_APP_SEARCH_CONSOLE_VERIFICATION;
    this.siteUrl = process.env.REACT_APP_SITE_URL || 'https://edgechronicle.com';
  }

  // Add Search Console verification meta tag
  addVerificationTag() {
    if (this.verificationMeta) {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'google-site-verification');
      meta.setAttribute('content', this.verificationMeta);
      document.head.appendChild(meta);
    }
  }

  // Submit URL to Google for indexing (requires Search Console API)
  async submitUrlForIndexing(url) {
    // This would typically require server-side implementation
    // due to CORS restrictions and API key security
    console.log('URL submitted for indexing:', url);
    
    // In a real implementation, this would call your backend API
    // which would then use the Google Search Console API
    try {
      const response = await fetch('/api/search-console/submit-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      
      if (response.ok) {
        console.log('URL successfully submitted to Search Console');
        return true;
      }
    } catch (error) {
      console.error('Failed to submit URL to Search Console:', error);
    }
    
    return false;
  }

  // Get Search Console data (requires backend API)
  async getSearchConsoleData(startDate, endDate) {
    try {
      const response = await fetch(`/api/search-console/analytics?start=${startDate}&end=${endDate}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          clicks: data.clicks || 0,
          impressions: data.impressions || 0,
          ctr: data.ctr || 0,
          position: data.position || 0,
          queries: data.queries || [],
          pages: data.pages || []
        };
      }
    } catch (error) {
      console.error('Failed to fetch Search Console data:', error);
    }
    
    return null;
  }

  // Monitor Core Web Vitals
  monitorCoreWebVitals() {
    // Import web-vitals library if available
    if (typeof window !== 'undefined' && window.webVitals) {
      window.webVitals.getCLS(this.handleCLS);
      window.webVitals.getFID(this.handleFID);
      window.webVitals.getFCP(this.handleFCP);
      window.webVitals.getLCP(this.handleLCP);
      window.webVitals.getTTFB(this.handleTTFB);
    }
  }

  // Core Web Vitals handlers
  handleCLS = (metric) => {
    console.log('CLS:', metric);
    this.sendToAnalytics('CLS', metric.value);
  }

  handleFID = (metric) => {
    console.log('FID:', metric);
    this.sendToAnalytics('FID', metric.value);
  }

  handleFCP = (metric) => {
    console.log('FCP:', metric);
    this.sendToAnalytics('FCP', metric.value);
  }

  handleLCP = (metric) => {
    console.log('LCP:', metric);
    this.sendToAnalytics('LCP', metric.value);
  }

  handleTTFB = (metric) => {
    console.log('TTFB:', metric);
    this.sendToAnalytics('TTFB', metric.value);
  }

  // Send Core Web Vitals to Google Analytics
  sendToAnalytics(name, value) {
    if (window.gtag) {
      window.gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        non_interaction: true
      });
    }
  }
}

// React Hook for Search Console Integration
export const useSearchConsole = () => {
  useEffect(() => {
    const searchConsole = new SearchConsoleIntegration();
    searchConsole.addVerificationTag();
    searchConsole.monitorCoreWebVitals();
  }, []);
};

// Search Console Widget Component for Admin
export const SearchConsoleWidget = () => {
  const searchConsole = new SearchConsoleIntegration();
  
  const handleSubmitUrl = async (url) => {
    const success = await searchConsole.submitUrlForIndexing(url);
    if (success) {
      alert('URL submitted for indexing successfully!');
    } else {
      alert('Failed to submit URL. Please try again.');
    }
  };

  return (
    <div className="search-console-widget bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Search Console Tools</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Submit URL for Indexing
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://edgechronicle.com/article/123"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmitUrl(e.target.value);
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                handleSubmitUrl(input.value);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">--</div>
            <div className="text-sm text-gray-600">Clicks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">--</div>
            <div className="text-sm text-gray-600">Impressions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">--%</div>
            <div className="text-sm text-gray-600">CTR</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">--</div>
            <div className="text-sm text-gray-600">Position</div>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p>Search Console integration requires backend configuration.</p>
          <p>Add your verification code to environment variables.</p>
        </div>
      </div>
    </div>
  );
};

export default SearchConsoleIntegration;