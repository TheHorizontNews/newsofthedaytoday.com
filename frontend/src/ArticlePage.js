import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        const response = await fetch(`${backendUrl}/api/articles?search=${slug}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          setArticle(data[0]);
        } else {
          setError('Статтю не знайдено');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Помилка завантаження статті');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Помилка</h1>
          <p className="text-gray-600">{error || 'Статтю не знайдено'}</p>
        </div>
      </div>
    );
  }

  const formatContent = (content) => {
    if (!content) return '';
    
    // Simple markdown parsing
    return content
      .replace(/^### (.+$)/gm, '<h3 class="text-xl font-semibold mb-3 mt-6">$1</h3>')
      .replace(/^## (.+$)/gm, '<h2 class="text-2xl font-semibold mb-4 mt-8">$1</h2>')
      .replace(/^# (.+$)/gm, '<h1 class="text-3xl font-bold mb-4 mt-8">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded-lg" />')
      .replace(/^- (.+$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^> (.+$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700">$1</blockquote>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="bg-red-600 text-white py-2">
        <div className="container mx-auto px-4">
          <nav className="text-sm">
            <Link to="/" className="hover:text-red-200 transition-colors">Головна</Link>
            <span className="mx-2">•</span>
            <span className="text-red-200">{article.category}</span>
            <span className="mx-2">•</span>
            <span className="text-red-200">Стаття</span>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <div className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={article.image}
            alt="Article background"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                {article.category}
              </span>
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                Edge Chronicle
              </span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                {article.subtitle}
              </p>
            )}

            <ArticleMeta article={article} />
            <SocialShare article={article} />
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ArticleContent article={article} />
          </div>
          <div className="lg:col-span-1">
            <RelatedArticles articles={article.relatedArticles} />
            
            {/* Ad Space */}
            <div className="bg-gray-100 rounded-lg p-6 mb-8 text-center">
              <p className="text-gray-500 text-sm mb-2">НОВИНИ ПАРТНЕРІВ</p>
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Рекламний блок</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticlePage;