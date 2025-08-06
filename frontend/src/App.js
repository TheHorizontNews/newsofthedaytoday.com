import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { Header, Footer, SkipToContent } from './components';
import HomePage from './HomePage';
import ArticlePage from './ArticlePage';
import analytics from './utils/analytics';
import { setupContentVisibility, addResourceHints, measurePerformance } from './utils/performanceOptimizer';

// Lazy load admin panel
const AdminApp = lazy(() => import('./admin/AdminApp'));

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
      <AnalyticsWrapper>
        <Routes>
          {/* Admin routes with lazy loading */}
          <Route path="/admin/*" element={
            <Suspense fallback={
              <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Завантаження адмін панелі...</p>
                </div>
              </div>
            }>
              <AdminApp />
            </Suspense>
          } />
          
          {/* Public routes */}
          <Route path="/" element={
            <div className="App min-h-screen bg-gray-100">
              <Header currentTime={currentTime} />
              <main>
                <HomePage />
              </main>
              <Footer />
            </div>
          } />
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
        </Routes>
      </AnalyticsWrapper>
    </Router>
  );
}

export default App;