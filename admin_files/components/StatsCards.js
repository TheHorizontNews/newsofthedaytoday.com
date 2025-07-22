import React from 'react';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Articles',
      value: stats.totalArticles,
      icon: '📝',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Published',
      value: stats.publishedArticles,
      icon: '✅',
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: '📁',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, index) => (
        <div key={index} className={`stat-card ${card.bgColor} p-6 rounded-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {card.value}
              </p>
            </div>
            <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;