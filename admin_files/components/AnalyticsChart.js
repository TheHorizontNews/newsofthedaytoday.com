import React from 'react';

const AnalyticsChart = () => {
  // Mock data for the chart
  const chartData = [
    { day: 'Mon', views: 120 },
    { day: 'Tue', views: 150 },
    { day: 'Wed', views: 180 },
    { day: 'Thu', views: 200 },
    { day: 'Fri', views: 170 },
    { day: 'Sat', views: 190 },
    { day: 'Sun', views: 160 }
  ];

  const maxViews = Math.max(...chartData.map(d => d.views));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Views</h2>
      
      <div className="space-y-3">
        {chartData.map((data, index) => (
          <div key={index} className="flex items-center">
            <div className="w-12 text-sm text-gray-600 font-medium">
              {data.day}
            </div>
            
            <div className="flex-1 mx-3">
              <div className="bg-gray-200 rounded-full h-4 relative">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{
                    width: `${(data.views / maxViews) * 100}%`
                  }}
                ></div>
              </div>
            </div>
            
            <div className="w-16 text-sm text-gray-900 font-medium text-right">
              {data.views}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {chartData.reduce((sum, data) => sum + data.views, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Views</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {Math.round(chartData.reduce((sum, data) => sum + data.views, 0) / 7)}
            </p>
            <p className="text-sm text-gray-600">Avg/Day</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;