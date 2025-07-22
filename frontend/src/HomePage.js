import React, { useEffect } from 'react';
import { Hero, MainNews, NewsStream, Trending, Publications } from './components';
import SEOManager from './seo/SEOManager';

const HomePage = () => {
  return (
    <>
      <SEOManager 
        title="Головні новини - Edge Chronicle"
        description="Останні новини з України та світу. Читайте актуальні події, аналітику та репортажі від професійних журналістів Edge Chronicle."
        keywords="новини, україна, світ, політика, економіка, спорт"
        tags={['новини', 'головна', 'україна', 'світ']}
      />
      
      <div className="homepage">
        {/* Hero Section */}
        <Hero />
        
        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column - Main News */}
            <div className="lg:col-span-8">
              <MainNews />
              <div className="mt-8">
                <NewsStream />
              </div>
            </div>
            
            {/* Right Column - Sidebar */}
            <div className="lg:col-span-4">
              <div className="space-y-8">
                <Trending />
                <Publications />
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
