import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header, Footer } from './components';
import ArticlePage from './ArticlePage';

const ArticleWrapper = ({ currentTime }) => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const fetchArticleForHeader = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        const response = await fetch(`${backendUrl}/api/articles/slug/${slug}`);
        
        if (response.ok) {
          const articleData = await response.json();
          setArticle(articleData);
        }
      } catch (err) {
        console.error('Error fetching article for header:', err);
      }
    };

    if (slug) {
      fetchArticleForHeader();
    }
  }, [slug]);

  return (
    <div className="App min-h-screen bg-gray-100">
      <Header 
        currentTime={currentTime} 
        heroImage={article?.featured_image}
        heroTitle={article?.title}
        heroSubtitle={article?.subtitle}
      />
      <main>
        <ArticlePage />
      </main>
      <Footer />
    </div>
  );
};

export default ArticleWrapper;