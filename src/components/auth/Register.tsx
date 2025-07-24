import { useState } from 'preact/hooks';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface RegisterProps {
  onNavigate: (path: string) => void;
}

export default function Register({ onNavigate }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const success = await register(name, email, password);
    if (success) {
      onNavigate('/dashboard');
    } else {
      setError('Failed to create account. Email might already be in use.');
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
          <h1>Admin Registration</h1>
          <p>Create your admin account</p>
        </div>

        <form onSubmit={handleSubmit} class="auth-form">
          {error && <div class="error-message">{error}</div>}
          
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
              required
              placeholder="Enter your full name"
            />
          </div>

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

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onInput={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
              required
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" class="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Already have an account?{' '}
            <button 
              type="button"
              class="link-button" 
              onClick={() => onNavigate('/login')}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
