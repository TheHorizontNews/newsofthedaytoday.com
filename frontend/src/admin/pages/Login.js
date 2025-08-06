import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, error } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(credentials);
    
    setIsLoading(false);
    
    if (result.success) {
      navigate('/admin/dashboard');
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <h1 className="login-title">Science Digest News</h1>
          <p className="login-subtitle">Admin Panel Login</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="form-input"
              placeholder="Enter your username"
              value={credentials.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="form-input"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="form-error mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <div className="mb-2">Demo Credentials:</div>
          <div><strong>Admin:</strong> admin / admin123</div>
          <div><strong>Editor:</strong> editor / editor123</div>
          <div><strong>Reporter:</strong> reporter / reporter123</div>
        </div>
      </div>
    </div>
  );
};

export default Login;