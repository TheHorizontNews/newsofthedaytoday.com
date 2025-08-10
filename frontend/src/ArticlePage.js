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
        const response = await fetch(`${backendUrl}/api/articles/slug/${slug}`);
        
        if (response.status === 404) {
          setError('Статтю не знайдено');
          return;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const article = await response.json();
        setArticle(article);
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
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-8">
            {article.featured_image && (
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            
            <div className="flex items-center space-x-2 mb-4">
              {article.category && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  {article.category.name}
                </span>
              )}
              {article.published_at && (
                <span className="text-gray-500 text-sm">
                  {new Date(article.published_at).toLocaleDateString('uk-UA')}
                </span>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {article.subtitle}
              </p>
            )}

            {article.author && (
              <div className="flex items-center mb-6">
                <div className="text-sm text-gray-600">
                  Автор: <span className="font-medium">{article.author.profile?.name || article.author.username}</span>
                </div>
                {article.views && (
                  <div className="ml-4 text-sm text-gray-500">
                    Переглядів: {article.views}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="prose max-w-none mb-8">
            {article.content && (
              <div 
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(
                    Array.isArray(article.content) 
                      ? article.content.join('\n\n') 
                      : article.content
                  ) 
                }}
              />
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Теги:</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArticlePage;