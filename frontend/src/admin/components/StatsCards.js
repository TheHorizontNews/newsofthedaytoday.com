import React from 'react';

const StatsCards = ({ stats }) => {
  const statsData = [
    {
      label: 'Total Articles',
      value: stats?.total_articles || 0,
      icon: '📝',
      color: 'bg-blue-500'
    },
    {
      label: 'Published Articles',
      value: stats?.published_articles || 0,
      icon: '🌟',
      color: 'bg-green-500'
    },
    {
      label: 'Draft Articles',
      value: stats?.draft_articles || 0,
      icon: '✏️',
      color: 'bg-yellow-500'
    },
    {
      label: 'Total Views',
      value: stats?.total_views || 0,
      icon: '👁️',
      color: 'bg-purple-500'
    },
    {
      label: 'Views This Week',
      value: stats?.week_views || 0,
      icon: '📊',
      color: 'bg-red-500'
    },
    {
      label: 'Views This Month',
      value: stats?.month_views || 0,
      icon: '📈',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="stats-grid">
      {statsData.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{stat.value.toLocaleString()}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-white text-xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;