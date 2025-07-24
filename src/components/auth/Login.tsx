import { useState } from 'preact/hooks';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface LoginProps {
  onNavigate: (path: string) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(email, password);
    if (success) {
      onNavigate('/dashboard');
    } else {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="theme-toggle-container">
            <button class="theme-toggle" onClick={toggleTheme} type="button">
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
          <h1>Admin Login</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} class="auth-form">
          {error && <div class="error-message">{error}</div>}
          
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" class="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Don't have an account?{' '}
            <button 
              type="button"
              class="link-button" 
              onClick={() => onNavigate('/register')}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
