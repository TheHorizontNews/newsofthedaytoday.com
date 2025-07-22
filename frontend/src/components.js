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
// MainNews Component
export const MainNews = () => {
  const analytics = useAnalytics();

  const handleNewsClick = (newsTitle) => {
    analytics.trackEvent('main_news_click', 'Content', newsTitle);
  };

  const mainNewsArticles = [
    {
      id: "news-1",
      title: "Важливі зміни в економічній політиці: що потрібно знати",
      excerpt: "Детальний аналіз нових економічних ініціатив та їх вплив на повсякденне життя громадян.",
      image: "/api/placeholder/400/250",
      category: "Економіка",
      time: "45 хвилин тому",
      author: "Олександр Петренко"
    },
    {
      id: "news-2", 
      title: "Технологічний прорив: нові досягнення у сфері штучного інтелекту",
      excerpt: "Українські розробники презентували інноваційне рішення, яке може змінити галузь.",
      image: "/api/placeholder/400/250",
      category: "Технології",
      time: "1 година тому",
      author: "Марія Коваленко"
    },
    {
      id: "news-3",
      title: "Міжнародна співпраця: нові угоди та перспективи розвитку",
      excerpt: "Огляд ключових домовленостей, що вплинуть на майбутнє країни.",
      image: "/api/placeholder/400/250", 
      category: "Міжнародні відносини",
      time: "2 години тому",
      author: "Андрій Мельник"
    },
    {
      id: "news-4",
      title: "Культурні події тижня: що варто відвідати",
      excerpt: "Підбірка найцікавіших культурних заходів та мистецьких подій.",
      image: "/api/placeholder/400/250",
      category: "Культура", 
      time: "3 години тому",
      author: "Ірина Шевченко"
    }
  ];

  return (
    <section className="bg-white">
      <div className="border-b-4 border-red-600 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 py-4">Головні новини</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mainNewsArticles.map((article, index) => (
          <article 
            key={article.id}
            className="news-article bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link 
              to={`/article/${article.id}`}
              onClick={() => handleNewsClick(article.title)}
            >
              <div className="relative">
                <img 
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white px-3 py-1 text-sm font-medium rounded">
                    {article.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 headline leading-tight hover:text-red-600 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed body-text">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="font-medium">{article.author}</span>
                  <span>{article.time}</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

// NewsStream Component  
export const NewsStream = () => {
  const analytics = useAnalytics();

  const handleStreamClick = (newsTitle) => {
    analytics.trackEvent('news_stream_click', 'Content', newsTitle);
  };

  const newsStreamArticles = [
    {
      id: "stream-1",
      title: "Науковці відкрили новий метод лікування захворювань",
      time: "4 години тому",
      category: "Наука"
    },
    {
      id: "stream-2", 
      title: "Спортивні досягнення: українські атлети на міжнародній арені",
      time: "5 годин тому",
      category: "Спорт"
    },
    {
      id: "stream-3",
      title: "Екологічні ініціативи: нові проекти збереження природи",
      time: "6 годин тому", 
      category: "Екологія"
    },
    {
      id: "stream-4",
      title: "Освітні реформи: зміни в системі навчання",
      time: "7 годин тому",
      category: "Освіта"
    },
    {
      id: "stream-5",
      title: "Бізнес-новини: тенденції та перспективи розвитку",
      time: "8 годин тому",
      category: "Бізнес"
    }
  ];

  return (
    <section className="bg-gray-50 rounded-lg p-6">
      <div className="border-b-2 border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 py-2">Стрічка новин</h2>
      </div>

      <div className="space-y-4">
        {newsStreamArticles.map((article) => (
          <article 
            key={article.id}
            className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0"
          >
            <Link 
              to={`/article/${article.id}`}
              onClick={() => handleStreamClick(article.title)}
              className="block hover:bg-white rounded-lg p-3 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-red-600 transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                      {article.category}
                    </span>
                    <span>{article.time}</span>
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link 
          to="/news"
          className="btn-primary text-white px-6 py-3 rounded-lg font-medium inline-block"
        >
          Більше новин
        </Link>
      </div>
    </section>
  );
};

// Trending Component
export const Trending = () => {
  const analytics = useAnalytics();

  const handleTrendingClick = (trendTitle) => {
    analytics.trackEvent('trending_click', 'Content', trendTitle);
  };

  const trendingArticles = [
    {
      id: "trend-1",
      title: "Топ-5 технологічних трендів 2024 року",
      views: "12.5K",
      image: "/api/placeholder/100/80"
    },
    {
      id: "trend-2",
      title: "Інтерв'ю з експертом: майбутнє енергетики",
      views: "8.2K", 
      image: "/api/placeholder/100/80"
    },
    {
      id: "trend-3",
      title: "Аналіз ринку: що чекає на інвесторів",
      views: "6.7K",
      image: "/api/placeholder/100/80"
    }
  ];

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="border-b-2 border-red-600 mb-6">
        <h2 className="text-xl font-bold text-gray-900 py-2">🔥 Популярне</h2>
      </div>

      <div className="space-y-4">
        {trendingArticles.map((article, index) => (
          <Link 
            key={article.id}
            to={`/article/${article.id}`}
            onClick={() => handleTrendingClick(article.title)}
            className="flex items-start space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <img 
              src={article.image}
              alt={article.title}
              className="w-16 h-12 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1 hover:text-red-600 transition-colors">
                {article.title}
              </h3>
              <div className="flex items-center text-xs text-gray-500">
                <span>👁️ {article.views}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// Publications Component
export const Publications = () => {
  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="border-b-2 border-red-600 mb-6">
        <h2 className="text-xl font-bold text-gray-900 py-2">📰 Рубрики</h2>
      </div>

      <div className="space-y-3">
        {[
          { name: "Політика", count: "156 статей", slug: "politics" },
          { name: "Економіка", count: "89 статей", slug: "economics" },
          { name: "Спорт", count: "67 статей", slug: "sports" }, 
          { name: "Культура", count: "45 статей", slug: "culture" },
          { name: "Технології", count: "78 статей", slug: "tech" }
        ].map((pub) => (
          <Link 
            key={pub.slug}
            to={`/category/${pub.slug}`}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-900">{pub.name}</span>
            <span className="text-xs text-gray-500">{pub.count}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

// ArticleContent Component
export const ArticleContent = ({ article }) => {
  const analytics = useAnalytics();

  useEffect(() => {
    // Track reading time
    const startTime = Date.now();
    
    return () => {
      const readingTime = Math.round((Date.now() - startTime) / 1000);
      if (readingTime > 10) { // Only track if read for more than 10 seconds
        analytics.trackTimeOnPage(readingTime, window.location.pathname);
      }
    };
  }, [analytics]);

  const handleShareClick = (platform) => {
    analytics.trackEvent('article_share', 'Social', platform);
  };

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Article Header */}
      <div className="relative">
        {article.featuredImage && (
          <img 
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover"
          />
        )}
        <div className="absolute top-4 left-4">
          <span className="bg-red-600 text-white px-3 py-2 text-sm font-medium rounded">
            {article.category?.name}
          </span>
        </div>
      </div>

      {/* Article Content */}
      <div className="p-6 md:p-8">
        {/* Title and Subtitle */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 headline leading-tight">
            {article.title}
          </h1>
          
          {article.subtitle && (
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              {article.subtitle}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Автор:</span>
              <span>{article.author?.name}</span>
            </div>
            <span>•</span>
            <span>{new Date(article.publishedAt).toLocaleDateString('uk-UA')}</span>
            <span>•</span>
            <span>👁️ {article.views} переглядів</span>
            {article.tags && article.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex flex-wrap gap-1">
                  {article.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        {/* Article Body */}
        <div 
          className="prose prose-lg max-w-none body-text"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Social Sharing */}
        <footer className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Поділитися:</span>
              <button 
                onClick={() => handleShareClick('facebook')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                aria-label="Share on Facebook"
              >
                📘 Facebook
              </button>
              <button 
                onClick={() => handleShareClick('twitter')}
                className="text-blue-400 hover:text-blue-600 transition-colors"
                aria-label="Share on Twitter"
              >
                🐦 Twitter
              </button>
              <button 
                onClick={() => handleShareClick('telegram')}
                className="text-blue-500 hover:text-blue-700 transition-colors"
                aria-label="Share on Telegram"
              >
                ✈️ Telegram
              </button>
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
};

// RelatedArticles Component
export const RelatedArticles = ({ currentArticleId, category, tags }) => {
  const analytics = useAnalytics();

  const handleRelatedClick = (articleTitle) => {
    analytics.trackEvent('related_article_click', 'Content', articleTitle);
  };

  // Mock related articles - in real app, this would come from API
  const relatedArticles = [
    {
      id: "related-1",
      title: "Схожі події в економічному секторі: детальний аналіз",
      excerpt: "Огляд подібних ситуацій та їх вплив на ринок.",
      image: "/api/placeholder/300/200",
      time: "2 дні тому"
    },
    {
      id: "related-2",
      title: "Експертна думка: що очікувати далі",
      excerpt: "Прогнози спеціалістів щодо розвитку подій.",
      image: "/api/placeholder/300/200", 
      time: "3 дні тому"
    },
    {
      id: "related-3",
      title: "Історичний контекст: як це було раніше",
      excerpt: "Порівняння з минулими подіями та їх наслідками.",
      image: "/api/placeholder/300/200",
      time: "1 тиждень тому"
    }
  ];

  return (
    <section className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-red-600 pb-2">
        Читайте також
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedArticles.map((article) => (
          <Link 
            key={article.id}
            to={`/article/${article.id}`}
            onClick={() => handleRelatedClick(article.title)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img 
              src={article.image}
              alt={article.title}
              className="w-full h-32 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight hover:text-red-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                {article.excerpt}
              </p>
              <span className="text-xs text-gray-500">{article.time}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// Footer Component
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">EC</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Edge Chronicle</h3>
                <p className="text-gray-400 text-sm">Новини що змінюють світ</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Edge Chronicle - це сучасна новинна платформа, що надає актуальну інформацію 
              про події в Україні та світі. Ми прагнемо до об'єктивності та професіоналізму 
              в кожному матеріалі.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                📘 Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                🐦 Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                ✈️ Telegram
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                📷 Instagram
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Розділи</h4>
            <ul className="space-y-2">
              <li><Link to="/category/world" className="text-gray-400 hover:text-white transition-colors">Світ</Link></li>
              <li><Link to="/category/ukraine" className="text-gray-400 hover:text-white transition-colors">Україна</Link></li>
              <li><Link to="/category/politics" className="text-gray-400 hover:text-white transition-colors">Політика</Link></li>
              <li><Link to="/category/economics" className="text-gray-400 hover:text-white transition-colors">Економіка</Link></li>
              <li><Link to="/category/sports" className="text-gray-400 hover:text-white transition-colors">Спорт</Link></li>
              <li><Link to="/category/culture" className="text-gray-400 hover:text-white transition-colors">Культура</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Про нас</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Редакція</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Контакти</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Реклама</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Вакансії</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Правила</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Конфіденційність</a></li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Edge Chronicle. Всі права захищені.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Розроблено з ❤️ для України</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
