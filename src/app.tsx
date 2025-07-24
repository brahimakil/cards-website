import { useState, useEffect } from 'preact/hooks';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Pages from './components/dashboard/Pages';
import CardEditor from './components/editor/CardEditor';
import CardViewer from './components/card/CardViewer';
import Sidebar from './components/dashboard/Sidebar';
import Header from './components/dashboard/Header';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/global.css';

// Create a simple dashboard home component
function DashboardHome({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div class="dashboard-home">
      <div class="welcome-section">
        <h2>مرحباً بك في لوحة التحكم</h2>
        <p>يمكنك إدارة بطاقات الدعوة من هنا</p>
      </div>

      <div class="dashboard-stats">
        <div class="stat-card" onClick={() => onNavigate('/dashboard/pages')}>
          <div class="stat-icon">📄</div>
          <h3>إدارة البطاقات</h3>
          <p>عرض وتعديل وحذف بطاقات الدعوة</p>
          <button class="stat-button">انتقل إلى البطاقات</button>
        </div>

        <div class="stat-card" onClick={() => onNavigate('/dashboard/editor')}>
          <div class="stat-icon">➕</div>
          <h3>إنشاء بطاقة جديدة</h3>
          <p>ابدأ في تصميم بطاقة دعوة جديدة</p>
          <button class="stat-button">إنشاء بطاقة</button>
        </div>

   
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  const [currentRoute, setCurrentRoute] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Get initial route
    const path = window.location.pathname;
    setCurrentRoute(path);

    // Handle browser back/forward
    const handlePopState = () => {
      const newPath = window.location.pathname;
      setCurrentRoute(newPath);
      console.log('Route changed to:', newPath); // Debug log
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigate function with debug logging
  const navigate = (path: string) => {
    console.log('Navigate called with path:', path); // Debug log
    
    // Update browser history
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    
    // Update state
    setCurrentRoute(path);
    
    console.log('Current route set to:', path); // Debug log
  };

  if (loading) {
    return (
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Public card viewer
  if (currentRoute.startsWith('/card/')) {
    const cardId = currentRoute.split('/card/')[1];
    return <CardViewer cardId={cardId} />;
  }

  // Authentication routes
  if (!isAuthenticated) {
    if (currentRoute === '/register') {
      return <Register onNavigate={navigate} />;
    }
    return <Login onNavigate={navigate} />;
  }

  // Protected routes
  const renderContent = () => {
    console.log('Rendering content for route:', currentRoute); // Debug log
    
    if (currentRoute === '/dashboard/editor' || currentRoute.includes('/dashboard/edit/')) {
      const editingCardId = currentRoute.includes('/dashboard/edit/') 
        ? currentRoute.split('/dashboard/edit/')[1] 
        : null;
      return (
        <CardEditor 
          editingCardId={editingCardId}
          onNavigate={navigate}
        />
      );
    }
    
    if (currentRoute === '/dashboard/pages') {
      return <Pages onNavigate={navigate} />;
    }

    // Default dashboard home - this should show when route is '/dashboard'
    return <DashboardHome onNavigate={navigate} />;
  };

  return (
    <div class="dashboard">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onNavigate={navigate}
        currentRoute={currentRoute}
      />
      <div class="dashboard-main">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          user={user} 
          onNavigate={navigate}
        />
        <main class="dashboard-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
