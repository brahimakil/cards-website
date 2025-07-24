import { useState } from 'preact/hooks';
import { Router } from 'preact-router';
import Sidebar from './Sidebar';
import Header from './Header';
import Pages from './Pages';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard({ path }: { path?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Determine which component to show based on path
  const getCurrentPage = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pages')) {
      return <Pages />;
    }
    // Default dashboard content
    return (
      <div class="dashboard-home">
        <h2>مرحباً بك في لوحة التحكم</h2>
        <p>يمكنك إدارة بطاقات الدعوة من هنا</p>
        <div class="dashboard-stats">
          <div class="stat-card">
            <h3>📊 الإحصائيات</h3>
            <p>إجمالي البطاقات المحفوظة</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div class="dashboard">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div class="dashboard-main">
        <Header onMenuClick={() => setSidebarOpen(true)} user={user} />
        <main class="dashboard-content">
          {getCurrentPage()}
        </main>
      </div>
    </div>
  );
}