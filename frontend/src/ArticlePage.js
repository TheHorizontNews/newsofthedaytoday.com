import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArticleContent, RelatedArticles } from './components';
import SEOManager from './seo/SEOManager';
import { useAnalytics } from './utils/analytics';

const ArticlePage = () => {
  const { id } = useParams();
  const analytics = useAnalytics();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        // In a real app, this would fetch from your API
        // For now, we'll use mock data
        
        const mockArticle = {
          id: id,
          title: "Важливі події дня: головні новини та аналітика",
          subtitle: "Огляд найважливіших подій, що відбулися сьогодні в Україні та світі",
          content: `
            <div class="article-content">
              <p>Це приклад статті Edge Chronicle. Тут буде повний текст новини з усіма деталями та аналітикою подій.</p>
              
              <h2>Основні події</h2>
              <p>Сьогодні відбулися важливі події, які впливають на розвиток ситуації в регіоні. Експерти аналізують можливі наслідки.</p>
              
              <h2>Аналітика</h2>
              <p>Детальний розбір ситуації показує, що тенденції залишаються стабільними, проте потрібно стежити за розвитком подій.</p>
              
              <h2>Висновки</h2>
              <p>Підсумовуючи, можна сказати, що ситуація потребує подальшого моніторингу та аналізу з боку експертів.</p>
            </div>
          `,
          author: {
            name: "Редакція Edge Chronicle",
            bio: "Команда професійних журналістів"
          },
          category: {
            name: "Головні новини",
            slug: "main-news"
          },
          tags: ["новини", "аналітика", "україна"],
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          featuredImage: "/api/placeholder/800/400",
          views: 1250
        };

        setArticle(mockArticle);
        
        // Track article view
        analytics.trackArticleView(
          id,
          mockArticle.title,
          mockArticle.category.name,
          mockArticle.author.name
        );
        
      } catch (err) {
        setError('Помилка завантаження статті');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id, analytics]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Помилка</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Статтю не знайдено</h1>
          <p className="text-gray-600">Можливо, стаття була видалена або переміщена.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOManager 
        title={article.title}
        description={article.subtitle}
        keywords={article.tags?.join(', ')}
        image={article.featuredImage}
        article={true}
        author={article.author?.name}
        publishedTime={article.publishedAt}
        modifiedTime={article.updatedAt}
        category={article.category?.name}
        tags={article.tags}
        articleId={article.id}
      />
      
      <div className="article-page">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Article Content */}
          <ArticleContent article={article} />
          
          {/* Related Articles */}
          <div className="mt-12">
            <RelatedArticles 
              currentArticleId={article.id}
              category={article.category?.slug}
              tags={article.tags}
            />
          </div>
          
        </div>
      </div>
    </>
  );
};

export default ArticlePage;
