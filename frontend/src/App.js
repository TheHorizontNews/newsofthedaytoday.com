import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Header, Footer } from './components';
import HomePage from './HomePage';
import ArticlePage from './ArticlePage';
import AdminApp from './admin/AdminApp';

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
      <Routes>
        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminApp />} />
        
        {/* Public routes */}
        <Route path="/*" element={
          <div className="App min-h-screen bg-gray-100">
            <Header currentTime={currentTime} />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/article/:id" element={<ArticlePage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;