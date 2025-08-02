import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LoginPage.css';
import logo from '../image/Logo.svg';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const navigate = useNavigate();

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: '214837593363-148416f6vfcgudims78fce6l9h9rup2n.apps.googleusercontent.com',
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
          }
        );
        setIsGoogleReady(true);
      }
    };

    // Load Google Identity Services script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Handle Google Sign-In response
  const handleGoogleSignIn = async (response) => {
    setIsGoogleLoading(true);
    setErrors({});
    try {
      const userInfo = parseJwt(response.credential);
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/home');
    } catch (error) {
      setErrors({ submit: 'Google sign-in failed. Please try again.' });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Parse JWT token (client-side for demo purposes only)
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return {};
    }
  };

  // Handle Google Sign-In button click
  const handleGoogleButtonClick = () => {
    if (isGoogleReady && window.google && window.google.accounts) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'signin_with',
              shape: 'rectangular',
            }
          );
        }
      });
    } else {
      setErrors({ submit: 'Google Sign-In is not ready. Please try again.' });
    }
  };

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

  const handleGuestLogin = () => {
    navigate('/home');
  };

  const getInputClasses = (fieldName) => {
    const hasError = errors[fieldName];
    if (hasError) {
      return 'form-input error';
    }
    return 'form-input';
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Header */}
        <div className="login-header">
          <img 
            src={logo} 
            alt="Company Logo" 
            className="login-logo"
          />
        </div>

        {/* Main Card */}
        <div className="login-card">
          <p className="login-card-title">Sign in</p>
          {/* Traditional Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <div className="input-wrapper">
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
              </div>
              {errors.username && (
                <div id="username-error" className="error-message" role="alert">
                  "Please enter a valid username."
                  {errors.username}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  className={`${getInputClasses('password')} password-input`}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  disabled={isLoading}
                >
                </button>
              </div>
              {errors.password && (
                <div id="password-error" className="error-message" role="alert">
                  {errors.password}
                </div>
              )}
            </div>

            {/* Reset Password */}
            <div className="Reset-password">
              <button
                type="button"
                className="reset-password-button"
                onClick={() => navigate('/reset-password')}
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="submit-error" role="alert">
                <div className="submit-error-content">
                  {errors.submit}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? (
                <>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
          <div className="divider">
            <div className="divider-line">
              <div className="divider-border"></div>
            </div>
            <div className="divider-content">
              <span className="divider-text">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <div className="google-signin-container">
            <div id="google-signin-button"></div>
          </div>

              {/* link to Sign Up Page */}
              <div className="register-link">
                <p className="register-text">
                  Don’t have an account?
                  <button
                  className="register-button"
                  onClick={() => navigate('/signup')}
                  disabled={isLoading}
                  >
                    Sign Up
                  </button>
                </p>
              </div>
          </form>
        </div>

        <div className="login-footer">
          <p className="login-footer-text">Or you want to take a look first?</p>
          <button className="guest-button" onClick={handleGuestLogin}>
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
