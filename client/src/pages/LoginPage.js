import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 4) return 'Password must be at least 4 characters';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setTouched({ username: true, password: true });
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (formData.username === 'admin' && formData.password === '1234') {
        navigate('/home');
      } else {
        setErrors({ submit: 'Invalid username or password. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClasses = (fieldName) => {
    const baseClasses = "w-full pl-4 pr-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-gray-400";
    const hasError = errors[fieldName];
    if (hasError) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50`;
    }
    return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-200 hover:border-gray-400`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Please sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <label className="login-label" htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Enter your username"
            className={getInputClasses('username')}
            aria-describedby={errors.username ? 'username-error' : undefined}
            aria-invalid={errors.username ? 'true' : 'false'}
            autoComplete="username"
            disabled={isLoading}
          />
          {errors.username && (
            <div id="username-error" className="login-error" role="alert">
              {errors.username}
            </div>
          )}

          {/* Password Field */}
          <label className="login-label" htmlFor="password">Password</label>
          <div className="login-password-group">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              className={getInputClasses('password')}
              aria-describedby={errors.password ? 'password-error' : undefined}
              aria-invalid={errors.password ? 'true' : 'false'}
              autoComplete="current-password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="login-label login-password-toggle"
              disabled={isLoading}
            >
            {showPassword ? 'Hide Password' : 'Show Password'}
          </button>
        </div>
        {errors.password && (
          <div id="password-error" className="login-error" role="alert">
            {errors.password}
          </div>
        )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="login-error" role="alert">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;