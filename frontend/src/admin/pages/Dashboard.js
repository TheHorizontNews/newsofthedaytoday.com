import { ukTranslations } from '../i18n/uk';
const t = ukTranslations;
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import StatsCards from '../components/StatsCards';
import RecentArticles from '../components/RecentArticles';
import AnalyticsChart from '../components/AnalyticsChart';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: analyticsAPI.getDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome to Edge Chronicle Admin Panel</p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analytics Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Views Analytics (Last 30 Days)</h3>
          </div>
          <div className="card-content">
            <AnalyticsChart data={stats?.daily_views || []} />
          </div>
        </div>

        {/* Recent Articles */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Articles</h3>
          </div>
          <div className="card-content">
            <RecentArticles articles={stats?.top_articles || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;