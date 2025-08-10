import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

const HomepageEditor = () => {
  const [blocks, setBlocks] = useState([
    { id: 'hero', name: 'Hero Section', articles: [], maxArticles: 1 },
    { id: 'main', name: 'Main News', articles: [], maxArticles: 3 },
    { id: 'sidebar', name: 'Sidebar News', articles: [], maxArticles: 5 },
    { id: 'trending', name: 'Trending', articles: [], maxArticles: 4 },
    { id: 'featured', name: 'Featured Articles', articles: [], maxArticles: 6 }
  ]);
  
  const [availableArticles, setAvailableArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadArticles();
    loadHomepageConfig();
  }, []);

  const loadArticles = async () => {
    try {
      const response = await api.get('/articles/admin?status=published&limit=50');
      setAvailableArticles(response.data || response);
    } catch (error) {
      console.error('Failed to load articles:', error);
    }
  };

  const loadHomepageConfig = async () => {
    try {
      const response = await api.get('/homepage/config');
      const config = response.data || response;
      if (config && config.blocks) {
        setBlocks(config.blocks);
      }
    } catch (error) {
      console.error('Failed to load homepage config:', error);
    }
  };

  const handleDragStart = (e, article) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(article));
  };

  const handleDrop = (e, blockId) => {
    e.preventDefault();
    const articleData = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    setBlocks(prevBlocks => 
      prevBlocks.map(block => {
        if (block.id === blockId && block.articles.length < block.maxArticles) {
          // Проверяем, не добавлена ли уже эта статья
          if (!block.articles.find(a => a.id === articleData.id)) {
            return {
              ...block,
              articles: [...block.articles, articleData]
            };
          }
        }
        return block;
      })
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeArticleFromBlock = (blockId, articleId) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block => {
        if (block.id === blockId) {
          return {
            ...block,
            articles: block.articles.filter(a => a.id !== articleId)
          };
        }
        return block;
      })
    );
  };

  const saveHomepageConfig = async () => {
    setLoading(true);
    try {
      await api.put('/homepage/config', { blocks });
      
      setMessage('✅ Конфігурацію головної сторінки збережено!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setMessage('❌ Помилка при збереженні конфігурації');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Редактор головної сторінки</h1>
          <p className="text-gray-600">Налаштуйте блоки та статті на головній сторінці</p>
        </div>
        <button
          onClick={saveHomepageConfig}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Збереження...' : 'Зберегти зміни'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Articles */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Доступні статті</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableArticles.map(article => (
                <div
                  key={article.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, article)}
                  className="p-3 border border-gray-200 rounded-md cursor-move hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {article.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {article.category?.name} • {article.views} переглядів
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Homepage Blocks */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {blocks.map(block => (
              <div key={block.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">{block.name}</h3>
                  <span className="text-sm text-gray-500">
                    {block.articles.length}/{block.maxArticles} статей
                  </span>
                </div>
                
                <div
                  onDrop={(e) => handleDrop(e, block.id)}
                  onDragOver={handleDragOver}
                  className={`min-h-20 border-2 border-dashed rounded-lg p-4 ${
                    block.articles.length >= block.maxArticles 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-blue-300 bg-blue-50'
                  }`}
                >
                  {block.articles.length === 0 ? (
                    <div className="text-center text-gray-500">
                      Перетягніть статті сюди (макс. {block.maxArticles})
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {block.articles.map((article, index) => (
                        <div
                          key={article.id}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {index + 1}. {article.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {article.category?.name}
                            </div>
                          </div>
                          <button
                            onClick={() => removeArticleFromBlock(block.id, article.id)}
                            className="text-red-600 hover:text-red-800 ml-2"
                            title="Видалити"
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Як користуватися редактором</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Перетягуйте статті з лівої панелі в потрібні блоки</li>
          <li>• Кожен блок має обмеження на кількість статей</li>
          <li>• Hero Section - головна стаття (1 стаття)</li>
          <li>• Main News - основні новини (3 статті)</li>
          <li>• Sidebar News - бічна панель (5 статей)</li>
          <li>• Trending - популярні статті (4 статті)</li>
          <li>• Featured Articles - рекомендовані статті (6 статей)</li>
        </ul>
      </div>
    </div>
  );
};

export default HomepageEditor;