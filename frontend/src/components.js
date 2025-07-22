import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from './utils/analytics';

// Header Component
export const Header = ({ currentTime }) => {
  const analytics = useAnalytics();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatTime = (date) => {
    return date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Kiev'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('uk-UA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLogoClick = () => {
    analytics.trackEvent('logo_click', 'Navigation', 'header');
  };

  const handleMenuClick = (menuItem) => {
    analytics.trackEvent('menu_click', 'Navigation', menuItem);
  };

  return (
    <header className="bg-red-600 text-white">
      {/* Top Bar */}
      <div className="bg-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex items-center space-x-4">
              <span className="font-medium">{formatDate(currentTime)}</span>
              <span>{formatTime(currentTime)}</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="#" className="hover:text-red-200 transition-colors">
                Про нас
              </a>
              <a href="#" className="hover:text-red-200 transition-colors">
                Контакти
              </a>
              <a href="#" className="hover:text-red-200 transition-colors">
                Підписка
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link 
            to="/" 
            onClick={handleLogoClick}
            className="flex items-center space-x-3"
          >
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-bold text-xl">EC</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edge Chronicle</h1>
              <p className="text-red-200 text-sm">Новини що змінюють світ</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              to="/category/world" 
              onClick={() => handleMenuClick('Світ')}
              className="text-white hover:text-red-200 font-medium transition-colors"
            >
              Світ
            </Link>
            <Link 
              to="/category/war" 
              onClick={() => handleMenuClick('Війна')}
              className="text-white hover:text-red-200 font-medium transition-colors"
            >
              Війна
            </Link>
            <Link 
              to="/category/ukraine" 
              onClick={() => handleMenuClick('Україна')}
              className="text-white hover:text-red-200 font-medium transition-colors"
            >
              Україна
            </Link>
            <Link 
              to="/category/politics" 
              onClick={() => handleMenuClick('Політика')}
              className="text-white hover:text-red-200 font-medium transition-colors"
            >
              Політика
            </Link>
            <Link 
              to="/category/science-tech" 
              onClick={() => handleMenuClick('Наука та IT')}
              className="text-white hover:text-red-200 font-medium transition-colors"
            >
              Наука та IT
            </Link>
            <Link 
              to="/category/lifestyle" 
              onClick={() => handleMenuClick('Леді')}
              className="text-white hover:text-red-200 font-medium transition-colors"
            >
              Леді
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-red-500">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/category/world" 
                onClick={() => {handleMenuClick('Світ'); setIsMenuOpen(false);}}
                className="text-white hover:text-red-200 font-medium transition-colors"
              >
                Світ
              </Link>
              <Link 
                to="/category/war" 
                onClick={() => {handleMenuClick('Війна'); setIsMenuOpen(false);}}
                className="text-white hover:text-red-200 font-medium transition-colors"
              >
                Війна
              </Link>
              <Link 
                to="/category/ukraine" 
                onClick={() => {handleMenuClick('Україна'); setIsMenuOpen(false);}}
                className="text-white hover:text-red-200 font-medium transition-colors"
              >
                Україна
              </Link>
              <Link 
                to="/category/politics" 
                onClick={() => {handleMenuClick('Політика'); setIsMenuOpen(false);}}
                className="text-white hover:text-red-200 font-medium transition-colors"
              >
                Політика
              </Link>
              <Link 
                to="/category/science-tech" 
                onClick={() => {handleMenuClick('Наука та IT'); setIsMenuOpen(false);}}
                className="text-white hover:text-red-200 font-medium transition-colors"
              >
                Наука та IT
              </Link>
              <Link 
                to="/category/lifestyle" 
                onClick={() => {handleMenuClick('Леді'); setIsMenuOpen(false);}}
                className="text-white hover:text-red-200 font-medium transition-colors"
              >
                Леді
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Hero Component
export const Hero = () => {
  const analytics = useAnalytics();

  const handleArticleClick = (articleTitle) => {
    analytics.trackEvent('hero_article_click', 'Content', articleTitle);
  };

  return (
    <section className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/api/placeholder/1200/600')`
        }}
      ></div>
      
      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Story */}
          <div className="lg:col-span-8">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="bg-red-600 text-white px-3 py-1 text-sm font-medium rounded">
                  ГОЛОВНА НОВИНА
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight headline">
                <Link 
                  to="/article/main-story-123"
                  onClick={() => handleArticleClick('Головна новина дня')}
                  className="hover:text-red-200 transition-colors"
                >
                  Важливі події дня: головні новини та аналітика експертів
                </Link>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed">
                Огляд найважливіших подій, що відбулися сьогодні в Україні та світі. 
                Детальний аналіз від провідних експертів та журналістів Edge Chronicle.
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Редакція Edge Chronicle</span>
                <span>•</span>
                <span>15 хвилин тому</span>
                <span>•</span>
                <span>5 хв читання</span>
              </div>
            </div>
          </div>
          
          {/* Related Stories */}
          <div className="lg:col-span-4">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 border-b border-gray-600 pb-2">
                Також читайте
              </h3>
              
              <div className="space-y-4">
                {[
                  {
                    id: "related-1",
                    title: "Аналітика: економічні тенденції тижня",
                    time: "30 хвилин тому"
                  },
                  {
                    id: "related-2", 
                    title: "Міжнародні відносини: нові домовленості",
                    time: "1 година тому"
                  },
                  {
                    id: "related-3",
                    title: "Технології: інновації у сфері ІТ",
                    time: "2 години тому"
                  }
                ].map((story, index) => (
                  <div key={story.id} className="border-b border-gray-700 last:border-b-0 pb-3 last:pb-0">
                    <Link 
                      to={`/article/${story.id}`}
                      onClick={() => handleArticleClick(story.title)}
                      className="block hover:text-red-200 transition-colors"
                    >
                      <h4 className="font-medium mb-1 leading-snug">
                        {story.title}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {story.time}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};
