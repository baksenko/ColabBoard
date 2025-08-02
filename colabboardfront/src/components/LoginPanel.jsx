import React, { useState } from 'react';
import './LoginPanel.css';

const LoginPanel = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('Username', formData.username);
      formDataToSend.append('Password', formData.password);

      const response = await fetch('http://localhost:8080/Auth/login', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

             if (!response.ok) {
         if (data.errors) {
           const serverErrors = {};
           Object.keys(data.errors).forEach(key => {
             serverErrors[key] = data.errors[key];
           });
           setErrors(serverErrors);
         } else if (data.message) {
           setErrors({ general: data.message });
         } else {
           setErrors({ general: 'Login failed. Please try again.' });
         }
         return;
       }

       if (data.token) {
         localStorage.setItem('jwt_token', data.token);
         onLogin({ ...formData, token: data.token });
       } else {
         setErrors({ general: 'Login successful but no token received.' });
         return;
       }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-panel">
      <div className="auth-container">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your ColabBoard account</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              placeholder="Enter your username"
              disabled={isLoading}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="auth-button primary"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button 
              type="button" 
              className="link-button"
              onClick={onSwitchToRegister}
              disabled={isLoading}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPanel; 