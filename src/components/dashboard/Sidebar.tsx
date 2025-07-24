import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  currentRoute: string;
}

export default function Sidebar({ isOpen, onClose, onNavigate, currentRoute }: SidebarProps) {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
  };

  const navigateToPages = () => {
    console.log('Navigating to pages...'); // Debug log
    onNavigate('/dashboard/pages');
    onClose();
  };

  const navigateToDashboard = () => {
    console.log('Navigating to dashboard...'); // Debug log
    onNavigate('/dashboard');
    onClose();
  };

  return (
    <>
      <div class={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <aside class={`sidebar ${isOpen ? 'open' : ''}`}>
        <div class="sidebar-header">
          <h2>Admin Panel</h2>
          <button class="sidebar-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <nav class="sidebar-nav">
          <button 
            class={`nav-item ${currentRoute === '/dashboard' ? 'active' : ''}`}
            onClick={navigateToDashboard}
            type="button"
          >
            <span class="nav-icon">🏠</span>
            <span class="nav-text">Dashboard</span>
          </button>
          
          <button 
            class={`nav-item ${currentRoute === '/dashboard/pages' ? 'active' : ''}`}
            onClick={navigateToPages}
            type="button"
          >
            <span class="nav-icon">📄</span>
            <span class="nav-text">Pages</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <button class="theme-toggle-sidebar" onClick={toggleTheme} type="button">
            <span class="nav-icon">{isDark ? '☀️' : '🌙'}</span>
            <span class="nav-text">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button class="logout-button" onClick={handleLogout} type="button">
            <span class="nav-icon">🚪</span>
            <span class="nav-text">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
} 