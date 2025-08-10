import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './App.css';
import { Header, Footer, SkipToContent } from './components';
import HomePage from './HomePage';
import ArticlePage from './ArticlePage';
import CategoryPage from './CategoryPage';
import AdminApp from './admin/AdminApp';  // СИНХРОННЫЙ ИМПОРТ
import analytics from './utils/analytics';
import { setupContentVisibility, addResourceHints, measurePerformance } from './utils/performanceOptimizer';
import useSEO from './hooks/useSEO';

// Analytics wrapper component
function AnalyticsWrapper({ children }) {
  const location = useLocation();

  useEffect(() => {
    // Initialize analytics
    analytics.initialize();
    
    // Performance optimizations
    setupContentVisibility();
    addResourceHints();
    measurePerformance();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    analytics.trackPageView(location.pathname + location.search, document.title);
  }, [location]);

  return children;
}

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { seoData, loading, updateMetaTags } = useSEO();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Update meta tags when SEO data loads
    if (!loading && seoData) {
      updateMetaTags(seoData);
    }
  }, [seoData, loading, updateMetaTags]);

  return (
    <HelmetProvider>
      <Router>
        <SkipToContent />
        <AnalyticsWrapper>
        <Routes>
          {/* Admin routes - ПЕРВЫМИ для приоритета */}
          <Route path="/admin/*" element={<AdminApp />} />
          
          {/* Public routes with Header */}
          <Route path="/" element={
            <div className="App min-h-screen bg-gray-100">
              <Header currentTime={currentTime} />
              <main>
                <HomePage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/article/:slug" element={
            <div className="App min-h-screen bg-gray-100">
              <Header currentTime={currentTime} />
              <main>
                <ArticlePage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/category/:categorySlug" element={
            <div className="App min-h-screen bg-gray-100">
              <Header currentTime={currentTime} />
              <main>
                <CategoryPage />
              </main>
              <Footer />
            </div>
          } />
          {/* Catch-all должен быть САМЫМ ПОСЛЕДНИМ */}
          <Route path="*" element={
            <div className="App min-h-screen bg-gray-100">
              <Header currentTime={currentTime} />
              <main>
                <HomePage />
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </AnalyticsWrapper>
    </Router>
    </HelmetProvider>
  );
}

export default App;