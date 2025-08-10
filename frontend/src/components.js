import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Skip to content component for accessibility
export const SkipToContent = () => {
  return (
    <a 
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-white"
    >
      Перейти до основного контенту
    </a>
  );
};

// Header Component
export const Header = ({ currentTime }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved theme preference or default to light mode
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    // Apply theme to document
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply theme on component mount
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  const navigationItems = [
    { name: 'Останні новини', href: '/' },
    { name: 'Технології', href: '/category/technology' },
    { name: 'Медицина', href: '/category/medicine' },
    { name: 'Космос і Фізика', href: '/category/space-physics' },
    { name: 'Довкілля', href: '/category/environment' },
    { name: 'ШІ та Обчислення', href: '/category/ai-computing' },
    { name: 'Біологія', href: '/category/biology' }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('uk-UA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit', 
      year: '2-digit'
    });
  };

  return (
    <header className="text-white" style={{backgroundColor: '#0c61cf'}} role="banner">
      {/* Top Bar */}
      <div className="py-2" style={{backgroundColor: '#0a52b8'}}>
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <time dateTime={currentTime.toISOString()}>{formatTime(currentTime)}</time>
            <time dateTime={currentTime.toISOString()}>{formatDate(currentTime)}</time>
            <span aria-label="Температура">°C</span>
            <span aria-label="Курс валют">USD/UAH</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <span aria-label="Пряма трансляція">НАЖИВО</span>
            <span aria-label="Пошук">ПОШУК</span>
            <button 
              className="px-3 py-1 rounded" 
              style={{backgroundColor: '#0a52b8'}}
              aria-label="Змінити мову на українську"
            >
              UA
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center bg-white px-3 py-2 rounded"
              aria-label="Science Digest News - головна сторінка"
            >
              {/* Logo Icon */}
              <div className="flex items-center space-x-2">
                <div className="relative" role="img" aria-label="Логотип Science Digest News">
                  <div className="w-8 h-8 rounded-full" style={{backgroundColor: '#0c61cf'}}>
                    <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#0c61cf'}}>
                        <div className="absolute inset-1 bg-white rounded-full">
                          <div className="w-1 h-1 rounded-full mx-auto mt-1" style={{backgroundColor: '#0c61cf'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2" style={{borderColor: '#0c61cf'}}>
                    <div className="w-1 h-1 rounded-full mx-auto" style={{backgroundColor: '#0c61cf', marginTop: '1px'}}></div>
                  </div>
                </div>
                <div style={{color: '#0c61cf'}} className="font-bold text-lg">
                  <span className="text-xl">Science</span>
                  <span className="text-sm font-medium ml-1">Digest News</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-6" role="navigation" aria-label="Основна навігація">
            {navigationItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.href} 
                className="hover:opacity-80 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 px-2 py-1 rounded"
                aria-label={`Перейти до ${item.name}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            aria-label={`Переключити на ${isDarkMode ? 'світлу' : 'темну'} тему`}
            title={`Переключити на ${isDarkMode ? 'світлу' : 'темну'} тему`}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Відкрити мобільне меню"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav 
            id="mobile-menu"
            className="lg:hidden mt-4 pb-4" 
            role="navigation" 
            aria-label="Мобільна навігація"
          >
            {navigationItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.href} 
                className="block py-2 px-4 hover:opacity-80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded"
                onClick={() => setIsMenuOpen(false)}
                aria-label={`Перейти до ${item.name}`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center py-2 px-4 hover:opacity-80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded"
              aria-label={`Переключити на ${isDarkMode ? 'світлу' : 'темну'} тему`}
            >
              {isDarkMode ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  Світла тема
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  Темна тема
                </>
              )}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

// Hero Section Component - Optimized for LCP
export const HeroSection = ({ heroData }) => {
  const heroImage = heroData?.image || heroData?.featured_image || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=480&fit=crop';
  
  return (
    <section className="hero-section relative bg-black text-white overflow-hidden">
      <div className="absolute inset-0">
        <picture>
          {/* WebP with responsive sizes */}
          <source 
            media="(min-width: 1024px)"
            srcSet={`${heroImage}&w=1200&h=600&fm=webp&q=75 1200w, ${heroImage}&w=1600&h=800&fm=webp&q=75 1600w`}
            sizes="100vw"
            type="image/webp"
          />
          <source 
            media="(min-width: 768px)"
            srcSet={`${heroImage}&w=800&h=400&fm=webp&q=75`}
            type="image/webp"
          />
          <img 
            src={`${heroImage}&w=400&h=300&fm=webp&q=75`}
            alt={heroData?.title || "Science News"} 
            className="w-full h-full object-cover opacity-70 gpu-accelerated"
            width="1200"
            height="600"
            loading="eager"
            decoding="sync"
            fetchPriority="high"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl">
          <div className="flex items-center space-x-2 mb-4">
            <span className="modern-btn text-xs">
              Science Digest News
            </span>
            <span className="modern-btn text-xs">
              BREAKING DISCOVERY
            </span>
          </div>
          
          <Link to={heroData?.url || '#'} className="will-change-transform">
            <h1 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight hover:opacity-90 transition-all duration-300 cursor-pointer modern-heading">
              {heroData?.title || 'Завантаження...'}
            </h1>
          </Link>
          
          {heroData?.subtitle && (
            <p className="text-xl text-gray-200 mb-6 leading-relaxed">
              {heroData.subtitle}
            </p>
          )}
          
          <div className="flex flex-wrap items-center text-sm text-gray-300 space-x-6">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {heroData.time}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {heroData.views.toLocaleString()}
            </span>
            <span>{heroData.author}</span>
          </div>

          {/* Related News Thumbnails */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/50 p-4 rounded-lg backdrop-blur-sm">
              <img src="https://images.pexels.com/photos/11397188/pexels-photo-11397188.jpeg" alt="Related news" className="w-full h-20 object-cover rounded mb-3" />
              <p className="text-sm leading-relaxed">Модернізовані безпілотники РФ: у чому їхня загроза</p>
            </div>
            <div className="bg-black/50 p-4 rounded-lg backdrop-blur-sm">
              <img src="https://images.unsplash.com/photo-1684513143343-e7e5def7ea1b" alt="Related news" className="w-full h-20 object-cover rounded mb-3" />
              <p className="text-sm leading-relaxed">Росія готувала ліквідацію Зеленського та Буданова</p>
            </div>
            <div className="bg-black/50 p-4 rounded-lg backdrop-blur-sm">
              <img src="https://images.unsplash.com/photo-1645940516176-895efb443c1f" alt="Related news" className="w-full h-20 object-cover rounded mb-3" />
              <p className="text-sm leading-relaxed">Україна очікує рішення на саміті НАТО</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main News Component
export const MainNews = ({ newsData }) => {
  if (!newsData || newsData.length === 0) {
    return (
      <section className="modern-card p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 modern-heading">Останні наукові відкриття</h2>
        <div className="text-center py-8 text-gray-500">
          <p>Новини завантажуються...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="modern-card p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 modern-heading">Останні наукові відкриття</h2>
      
      <div className="space-y-8">
        {newsData.map((article, index) => (
          <Link key={article.id || index} to={article.url || '#'} className="will-change-transform">
            <article className={`group cursor-pointer pb-6 transition-all duration-300 hover:transform hover:scale-[1.02] ${index !== newsData.length - 1 ? 'border-b border-gray-200' : ''}`}>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="image-container relative overflow-hidden rounded-lg aspect-[4/3]">
                    <img 
                      src={article.image || article.featured_image || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 gpu-accelerated"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="modern-btn text-xs">
                        {article.category || 'Наука'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {article.title}
                    </h3>
                    {article.subtitle && (
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {article.subtitle}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {article.time || 'Щойно'}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {article.views.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-gray-600">{article.author}</span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <button className="text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-colors duration-200" style={{backgroundColor: '#0c61cf'}}>
          ВСІ НАУКОВІ НОВИНИ
        </button>
      </div>
    </section>
  );
};

// Sidebar News Component
export const SidebarNews = ({ sidebarData }) => {
  return (
    <aside className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-bold mb-6 text-gray-900">News Feed</h3>
      
      <div className="space-y-4">
        {sidebarData.map((item) => (
          <Link key={item.id} to={item.url}>
            <article className="group cursor-pointer">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 group-hover:opacity-80 transition-colors duration-200 leading-snug" style={{'&:hover': {color: '#0c61cf'}}}>
                {item.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {item.time}
                </span>
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  {item.views.toLocaleString()}
                </span>
              </div>
              <hr className="mt-4 border-gray-200" />
            </article>
          </Link>
        ))}
      </div>
    </aside>
  );
};

// Trending Section Component
export const TrendingSection = ({ trendingData }) => {
  return (
    <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Trending Research</h2>
        <span className="ml-2 text-2xl">🔥</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingData.map((item) => (
          <article key={item.id} className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-lg aspect-[4/3] mb-3">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <span className="text-white text-xs px-2 py-1 rounded flex items-center" style={{backgroundColor: '#0c61cf'}}>
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {item.views.toLocaleString()}
                </span>
              </div>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:opacity-80 transition-colors duration-200 text-sm leading-snug" style={{'&:hover': {color: '#0c61cf'}}}>
              {item.title}
            </h3>
            
            <div className="text-xs text-gray-500">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {item.time}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

// Publications Section Component
export const PublicationsSection = ({ publicationsData }) => {
  return (
    <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Featured Articles</h2>
      
      <div className="space-y-6">
        {publicationsData.map((article) => (
          <article key={article.id} className="group cursor-pointer">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-1/3">
                <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="text-white text-xs px-2 py-1 rounded" style={{backgroundColor: '#0c61cf'}}>
                      {article.category}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:opacity-80 transition-colors duration-200" style={{'&:hover': {color: '#0c61cf'}}}>
                    {article.title}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {article.time}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {article.views.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-gray-600">{article.author}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      {/* Bottom Video Section */}
      <div className="mt-8 bg-gray-900 rounded-lg overflow-hidden">
        <div className="relative aspect-video">
          <img 
            src="https://images.pexels.com/photos/11477798/pexels-photo-11477798.jpeg" 
            alt="Video thumbnail" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">У Києві ліквідують наслідки атаки РФ:</h3>
              <p className="text-sm opacity-80">що відомо про жертв і руйнування в Шевченківському районі</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer Component
export const Footer = () => {
  const footerLinks = [
    { title: 'About Us', url: '#' },
    { title: 'Contact', url: '#' },
    { title: 'Research Guidelines', url: '#' },
    { title: 'Privacy Policy', url: '#' },
    { title: 'Terms of Use', url: '#' },
    { title: 'Editorial Standards', url: '#' }
  ];

  const socialLinks = [
    { name: 'Facebook', url: '#', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { name: 'Twitter', url: '#', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
    { name: 'Instagram', url: '#', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="px-3 py-2 font-bold text-xl rounded inline-block mb-4" style={{backgroundColor: '#0c61cf', color: 'white'}}>
              Science Digest News
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Breaking scientific discoveries and analysis from around the world. Stay informed with the latest developments in technology, medicine, space exploration, and research.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              {footerLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.url} 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  {link.title}
                </a>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div className="md:col-span-1">
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.url} 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <hr className="border-gray-800 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; 2025 Science Digest News. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Built with ❤️ for scientific discovery
          </p>
        </div>
      </div>
    </footer>
  );
};

// Article Page Components

// Article Meta Component
export const ArticleMeta = ({ article }) => {
  return (
    <div className="flex items-center space-x-6 text-sm text-gray-300 mb-6">
      <div className="flex items-center space-x-2">
        <img 
          src={article.authorImage} 
          alt={article.author}
          className="w-8 h-8 rounded-full"
        />
        <span>{article.author}</span>
      </div>
      <span className="flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        {article.time}
      </span>
      <span className="flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
        {article.views?.toLocaleString() || '0'}
      </span>
    </div>
  );
};

// Social Share Component
export const SocialShare = ({ article }) => {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-300">Поділитися:</span>
      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      <a 
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      </a>
      <a 
        href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      </a>
    </div>
  );
};

// Article Content Component
export const ArticleContent = ({ article }) => {
  const renderContent = (content) => {
    if (typeof content === 'string') {
      // Обрабатываем HTML с markdown-style заголовками
      return content.split('\n').map((line, index) => {
        line = line.trim();
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-bold mt-8 mb-4 text-gray-900">{line.substring(4)}</h3>;
        } else if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold mt-10 mb-6 text-gray-900">{line.substring(3)}</h2>;
        } else if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold mt-12 mb-8 text-gray-900">{line.substring(2)}</h1>;
        } else if (line.length > 0) {
          return <p key={index} className="mb-6 text-gray-800 leading-relaxed text-lg">{line}</p>;
        }
        return null;
      });
    }
    
    // Fallback для массива параграфов
    return content.map((paragraph, index) => (
      <p key={index} className="mb-6 text-gray-800 leading-relaxed text-lg">
        {paragraph}
      </p>
    ));
  };

  return (
    <article className="bg-white rounded-lg shadow-sm p-8">
      <div className="prose prose-lg max-w-none">
        {article.content && renderContent(article.content)}
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">Теги:</h4>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Article Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={article.authorImage} 
              alt={article.author}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-semibold text-gray-900">{article.author}</p>
              <p className="text-sm text-gray-500">Science Digest News Reporter</p>
            </div>
          </div>
          <SocialShare article={article} />
        </div>
      </div>
    </article>
  );
};

// Related Articles Component
export const RelatedArticles = ({ articles }) => {
  return (
    <aside className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h3 className="text-xl font-bold mb-6 text-gray-900">Читайте також</h3>
      
      <div className="space-y-8">
        {articles && articles.map((article, index) => (
          <div key={article.id}>
            <Link to={`/article/${article.id}`}>
              <article className="group cursor-pointer flex gap-4">
                <div className="w-24 h-16 flex-shrink-0">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover rounded group-hover:opacity-80 transition-opacity"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors leading-tight">
                    {article.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {article.time}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {article.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
            {index < articles.length - 1 && (
              <hr className="mt-6 border-gray-200" />
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};