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
    
    // Enhanced markdown parsing with better image handling
    let html = content
      // Convert headers with modern styling
      .replace(/^### (.+$)/gm, '<h3 class="text-xl font-semibold mb-3 mt-6 modern-heading">$1</h3>')
      .replace(/^## (.+$)/gm, '<h2 class="text-2xl font-semibold mb-4 mt-8 modern-heading">$1</h2>')
      .replace(/^# (.+$)/gm, '<h1 class="text-3xl font-bold mb-4 mt-8 modern-heading">$1</h1>')
      // Convert bold and italic
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic text-gray-700">$1</em>')
      // Convert images BEFORE links to prevent interference
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
        // Check if it's a base64 image or regular URL
        const isBase64 = src.startsWith('data:image/');
        const altText = alt || 'Зображення в статті';
        
        return `<div class="image-container my-6">
          <img 
            src="${src}" 
            alt="${altText}" 
            class="max-w-full h-auto rounded-lg shadow-lg border gpu-accelerated mx-auto block"
            loading="lazy"
            style="max-height: 600px; object-fit: contain;"
            onload="this.classList.remove('loading')"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
          />
          <div style="display: none;" class="bg-gray-100 p-4 rounded-lg text-center text-gray-500">
            <p>Не вдалося завантажити зображення: ${altText}</p>
          </div>
        </div>`;
      })
      // Convert links AFTER images to avoid interference
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
      // Convert lists
      .replace(/^- (.+$)/gm, '<li class="ml-4 mb-2">$1</li>')
      // Convert blockquotes
      .replace(/^> (.+$)/gm, '<blockquote class="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-4 italic text-gray-700">$1</blockquote>')
      // Convert line breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>');

    // Wrap in paragraphs if not already wrapped
    if (!html.startsWith('<') && html.trim()) {
      html = `<p class="mb-4">${html}</p>`;
    }

    return html;
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
          <div className="article-content prose max-w-none mb-8 modern-card p-8">
            {article.content && (
              <div 
                className="text-gray-800 leading-relaxed text-lg"
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(
                    Array.isArray(article.content) 
                      ? article.content.join('\n\n') 
                      : article.content
                  ) 
                }}
              />
            )}
            
            {!article.content && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl mb-2">Контент статті недоступний</p>
                <p>Можливо, стаття ще не була опублікована або видалена.</p>
              </div>
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