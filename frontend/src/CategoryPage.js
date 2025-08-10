import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HeroSection, MainNews, SidebarNews, TrendingSection, PublicationsSection } from './components';

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [categoryData, setCategoryData] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Маппинг slug категорий к их названиям на украинском
  const categoryNames = {
    'technology': 'Технології',
    'medicine': 'Медицина',
    'space-physics': 'Космос і Фізика',
    'environment': 'Довкілля',
    'ai-computing': 'ШІ та Обчислення',
    'biology': 'Біологія',
    'innovation': 'Інновації'
  };

  const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  const convertArticle = (article) => {
    if (!article || !article.id) return null;
    
    return {
      id: article.id,
      title: article.title || '',
      subtitle: article.subtitle || '',
      category: article.category?.name || categoryNames[categorySlug] || 'Наука',
      time: article.created_at ? new Date(article.created_at).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : new Date().toLocaleDateString('uk-UA'),
      views: article.views || 0,
      author: article.author?.profile?.name || article.author?.username || 'Science Admin',
      image: article.featured_image || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      url: `/article/${article.slug}`
    };
  };

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true);
        
        // Получаем все категории для поиска нужной
        const categoriesResponse = await fetch(`${backendUrl}/api/categories/`);
        const categories = await categoriesResponse.json();
        
        // Находим категорию по slug
        const category = categories.find(cat => cat.slug === categorySlug);
        if (!category) {
          throw new Error('Category not found');
        }
        
        setCategoryInfo(category);
        
        // Получаем статьи этой категории
        const articlesResponse = await fetch(`${backendUrl}/api/articles/?category_id=${category.id}&status=published&limit=50`);
        const articles = await articlesResponse.json();
        
        if (articles && articles.length > 0) {
          // Конвертируем статьи в нужный формат
          const convertedArticles = articles.map(convertArticle).filter(Boolean);
          
          // Используем первую статью как героя, остальные как обычные новости
          const data = {
            hero: convertedArticles[0] || null,
            mainNews: convertedArticles.slice(1, 4), // Следующие 3 статьи
            sidebarNews: convertedArticles.slice(4, 9), // Следующие 5 для сайдбара
            trending: convertedArticles.slice(9, 12), // Следующие 3 для трендинга
            publications: convertedArticles.slice(12, 15) // Последние для публикаций
          };
          
          setCategoryData(data);
        } else {
          // Если нет статей в категории, показываем пустую структуру
          setCategoryData({
            hero: null,
            mainNews: [],
            sidebarNews: [],
            trending: [],
            publications: []
          });
        }
        
      } catch (error) {
        console.error('Error loading category data:', error);
        // При ошибке показываем пустые данные
        setCategoryData({
          hero: null,
          mainNews: [],
          sidebarNews: [],
          trending: [],
          publications: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      loadCategoryData();
    }
  }, [categorySlug, backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Science Digest News</h2>
          <p className="text-gray-500">Завантаження статей категорії "{categoryNames[categorySlug] || categorySlug}"...</p>
        </div>
      </div>
    );
  }

  const data = categoryData;

  // Structured data for category page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${categoryNames[categorySlug] || categorySlug} - Science Digest News`,
    "description": `Останні новини та статті з категорії ${categoryNames[categorySlug] || categorySlug}`,
    "url": `https://sciencedigestnews.com/category/${categorySlug}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": data.mainNews?.map((article, index) => ({
        "@type": "NewsArticle",
        "position": index + 1,
        "headline": article.title,
        "image": article.image,
        "author": {
          "@type": "Person",
          "name": article.author
        },
        "url": `https://sciencedigestnews.com${article.url}`
      })) || []
    }
  };

  return (
    <>
      {/* Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Category Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              {categoryNames[categorySlug] || categorySlug}
            </h1>
            <p className="text-xl text-blue-100">
              {categoryInfo?.description || `Останні новини та дослідження в галузі ${categoryNames[categorySlug] || categorySlug}`}
            </p>
            <div className="mt-4 text-blue-200">
              <span>Знайдено статей: {(data.mainNews?.length || 0) + (data.hero ? 1 : 0)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main id="main-content" role="main">
        {data.hero && <HeroSection heroData={data.hero} />}
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {data.mainNews && data.mainNews.length > 0 ? (
                <MainNews newsData={data.mainNews} />
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className="text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Статті не знайдено</h3>
                    <p className="text-gray-600">В категорії "{categoryNames[categorySlug] || categorySlug}" поки що немає опублікованих статей.</p>
                  </div>
                </div>
              )}
              
              {data.trending && data.trending.length > 0 && (
                <TrendingSection trendingData={data.trending} />
              )}
              
              {data.publications && data.publications.length > 0 && (
                <PublicationsSection publicationsData={data.publications} />
              )}
            </div>
            
            <div className="lg:col-span-1">
              {data.sidebarNews && data.sidebarNews.length > 0 ? (
                <SidebarNews sidebarData={data.sidebarNews} />
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Додаткові матеріали</h3>
                  <p className="text-gray-600 text-sm">
                    Скоро тут з'являться додаткові матеріали по категорії {categoryNames[categorySlug] || categorySlug}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CategoryPage;