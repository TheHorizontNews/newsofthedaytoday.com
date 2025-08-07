import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { Header, Footer, SkipToContent } from './components';
import HomePage from './HomePage';
import ArticlePage from './ArticlePage';
import AdminApp from './admin/AdminApp';  // СИНХРОННЫЙ ИМПОРТ
import analytics from './utils/analytics';
import { setupContentVisibility, addResourceHints, measurePerformance } from './utils/performanceOptimizer';

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <Router>
      <SkipToContent />
      <AnalyticsWrapper>
        <Routes>
          {/* Admin routes - NO Suspense, direct load */}
          <Route path="/admin/*" element={<AdminApp />} />
          
          {/* Public routes with Header */}
          <Route path="/article/:id" element={
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
                <HomePage />
              </main>
              <Footer />
            </div>
          } />
          {/* Catch-all route - должен быть ПОСЛЕДНИМ */}
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
  );
}

export default App;