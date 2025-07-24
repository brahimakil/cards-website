import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
  user: any;
}

export default function Header({ onMenuClick, user }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header class="dashboard-header">
      <div class="header-left">
        <button class="menu-button" onClick={onMenuClick}>
          <span class="hamburger"></span>
          <span class="hamburger"></span>
          <span class="hamburger"></span>
        </button>
        <h1>Dashboard</h1>
      </div>

      <div class="header-right">
        <button class="theme-toggle-header" onClick={toggleTheme}>
          {isDark ? '☀️' : '🌙'}
        </button>
        <div class="user-info">
          <span class="user-avatar">👤</span>
          <span class="user-name">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
