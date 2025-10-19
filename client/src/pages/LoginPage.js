import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LoginPage.css';
import logo from '../image/Logo1.svg';
import textlogo from '../image/TextLogo.svg';
import axios from 'axios';
import { getUserId, setUserId } from '../utils/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://172.23.144.1:5050';

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: '300',
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle Google Sign-In response
  const handleGoogleSignIn = async (response) => {
    setIsGoogleLoading(true);
    setAlert({ type: '', message: '' });
    try {
      const userInfo = parseJwt(response.credential);

      const backendResponse = await axios.post(`${process.env.REACT_APP_BASE_URL}/google-auth`, {
        credential: response.credential,
        email: userInfo.email,
        username: userInfo.name,
        avatar: userInfo.picture,
        google_id: userInfo.sub
      }, {
        timeout: 10000,
        withCredentials: true
      });

      if (backendResponse.data.user_id) {
        setUserId(backendResponse.data.user_id);
        // Replace console.log with a more secure message
        console.log('Google authentication successful');
      }

      const isNewUser = backendResponse.data.is_new_user;
      setAlert({
        type: 'success',
        message: isNewUser
          ? 'Account created successfully'
          : 'Login successfully'
      });

      timeoutRef.current = setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (error) {
      let errorMessage = 'Google sign-in failed. Please try again.'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check your connection';
      }
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Parse JWT token
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return {};
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
          const updatedErrors = { ...prevErrors };
          delete updatedErrors[name]; 
          return updatedErrors;
      });
    }

    // Clear alert
    if (alert.message) {
      setAlert({ type: '', message: '' });
    }
  };

  // Validation
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
    const errors = {};
    ['username', 'password'].forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setAlert({
        type: 'error',
        message: 'Please fix the errors above'
      });
      return;
    }

    setIsSubmitting(true);
    setAlert({ type: '', message: '' });
    console.log('Backend URL:', process.env.REACT_APP_BASE_URL);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/login`, {
        username: formData.username,
        password: formData.password
      }, {
        timeout: 10000,
        withCredentials: true
      });

      if (response.data.user_id) {
        setUserId(response.data.user_id);
        // Replace console.log with a more secure message
        console.log('Login successful');
      }

      setAlert({
        type: 'success',
        message: response.data.message || 'Login successful'
      });
      setFieldErrors({});

      timeoutRef.current = setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (err) {
      let errorMessage = 'An error occured. Please try again.';

      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (err.response.status === 429) {
          errorMessage = 'Too many login attempts. Please try again later';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check your connection';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again';
      }

      setAlert({ type: 'error', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestClick = () => {
    navigate('/home');
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleForgotPasswordClick = () => {
    navigate('/reset-password');
  };

  const isAnyLoading = isSubmitting || isGoogleLoading;

  return (
    <div className="page-container">
      <img src={logo} alt="Sous Cook Logo" className="logo-image" />
      <img src={textlogo} alt="Text Logo" className="textlogo-image" />

      <div className="login-container">
        <p className="login-text">Sign In</p>
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className={`input ${fieldErrors.username ? 'input-error' : ''}`}
              value={formData.username}
              onChange={handleChange}
              disabled={isAnyLoading}
              aria-label="Username"
              aria-invalid={!!fieldErrors.username}
              aria-describedby={fieldErrors.username ? "username-error" : undefined}
              autoComplete="username"
            />
            {fieldErrors.username && (
              <p id="username-error" className="field-error" role="alert">
                {fieldErrors.username}
              </p>
            )}
          </div>

          <div className="form-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className={`input ${fieldErrors.password ? 'input-error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              disabled={isAnyLoading}
              aria-label="Password"
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              autoComplete="current-password"
            />

            {formData.password && (
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="show-password-button"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isAnyLoading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            )}

            {fieldErrors.password && (
              <p id="password-error" className="field-error" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="form-options">
            <button
              type="button"
              className="forgot-password-link"
              onClick={handleForgotPasswordClick}
              disabled={isAnyLoading}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isAnyLoading}
          >
            {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        {alert.message && (
          <div
            className={`alert alert-${alert.type}`}
            role="alert"
            aria-live="polite"
          >
            {alert.message}
          </div>
        )}

        {/* Divider */}
        <div className="divider-login">
          <div className="divider-line"></div>
          <span className="divider-text">Or continue with</span>
        </div>

        {/* Google Sign-In Button */}
        <div className="google-signin-container">
          <div id="google-signin-button"></div>
          {isGoogleLoading && (
            <div className="google-loading">Signing in with Google...</div>
          )}
        </div>

        <div className="signup-link">
          <span className="signup-text-small">Don't have an account? </span>
          <button
            type="button"
            className="signup-link-button"
            onClick={handleSignUpClick}
            disabled={isAnyLoading}
          >
            Sign Up
          </button>
        </div>
      </div>

      <p className="guest-text">Or you want to take a look first?</p>
      <button
        className="guest-button"
        onClick={handleGuestClick}
        disabled={isAnyLoading}
      >
        CONTINUE AS GUEST
      </button>
    </div>
  );
};

export default LoginPage;